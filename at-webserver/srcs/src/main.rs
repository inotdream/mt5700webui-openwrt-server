use std::sync::Arc;
use std::time::Duration;
use tokio::net::TcpListener;
use tokio::time::interval;

mod config;
mod error;
mod at;
mod airplane;
mod websocket;
mod net_utils;

use config::{load_config_from_uci, Config, DEFAULT_CONFIG_JSON};
use at::ATClient;
use airplane::AutoAirPlaneMode;
use net_utils::create_dual_stack_listener;

fn is_urc_line(line: &str) -> bool {
    let trimmed = line.trim();
    !trimmed.is_empty()
        && !trimmed.to_lowercase().contains("ping")
        && (trimmed.contains('^') || trimmed.contains('+'))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 从UCI加载配置
    let config = match load_config_from_uci() {
        Ok(config) => config,
        Err(e) => {
            eprintln!("从UCI加载配置失败: {}, 使用默认配置", e);
            serde_json::from_str(DEFAULT_CONFIG_JSON)?
        }
    };

    let config = Arc::new(config);

    // 打印配置信息
    print_config_summary(&config);

    // 创建AT客户端
    // let at_client = Arc::new(ATClient::new(config.clone())?);
    let at_client = Arc::new(ATClient::new(&config)?);


    // 创建自动重启飞行模式监控
    let auto_flight_mode = AutoAirPlaneMode::new(at_client.clone(), config.clone());
    if auto_flight_mode.is_enbale() {
        auto_flight_mode.monitor_loop().await;
    }

    // 心跳任务
    let c_heartbeat = at_client.clone();
    tokio::spawn(async move {
        let mut heartbeat_timer = interval(Duration::from_secs(30));
        loop {
            heartbeat_timer.tick().await;
            let mut conn = c_heartbeat.conn.lock().await;
            if !conn.is_connected() {
                continue;
            }

            match conn.send(b"ping\r\n").await {
                Ok(_) => {}
                Err(err) => {
                    eprintln!("[AT] 心跳探测失败: {}", err);
                }
            }
        }
    });

    // URC 捕获任务
    let c_monitor = at_client.clone();
    tokio::spawn(async move {
        let mut last_reconnect_attempt = std::time::Instant::now();
        let mut was_connected = false;
        loop {
            let mut has_data = false;
            {
                let mut conn = c_monitor.conn.lock().await;
                if !conn.is_connected() {
                    if was_connected {
                        println!("[AT] 连接已断开，正在重连...");
                        was_connected = false;
                    }
                    if last_reconnect_attempt.elapsed() >= Duration::from_secs(2) {
                        last_reconnect_attempt = std::time::Instant::now();
                        if let Ok(_) = conn.connect().await {
                            println!("[AT] 连接已恢复");
                            was_connected = true;
                            drop(conn);
                            let c_init = c_monitor.clone();
                            tokio::spawn(async move { c_init.init_module().await });
                        }
                    }
                } else {
                    match conn.receive().await {
                        Ok(data) => {
                            if !data.is_empty() {
                                has_data = true;
                                let text = String::from_utf8_lossy(&data).to_string();
                                for line in text.lines() {
                                    if is_urc_line(line) {
                                        println!("[URC DETECTED] <== {:?}", line);
                                        let _ = c_monitor.urc_tx.send(line.to_string());
                                    }
                                }
                            }
                        }
                        Err(_) => {
                            if was_connected {
                                println!("[AT] 连接已断开，正在重连...");
                                was_connected = false;
                            }
                        }
                    }
                }
            }
            if !has_data {
                tokio::task::yield_now().await;
            }
        }
    });

    // 获取WebSocket配置
    let ws_v6_host = config.websocket_config.ipv6.host.clone();
    let ws_v6_port = config.websocket_config.ipv6.port;
    let auth_key = config.websocket_config.auth_key.clone();

    // 尝试绑定IPv6双栈监听器
    println!("尝试绑定IPv6双栈监听器...");
    let ws_listener = match create_dual_stack_listener(&ws_v6_host, ws_v6_port).await {
        Ok(listener) => {
            println!(
                "✓ 成功绑定IPv6双栈监听器: [{}]:{}",
                if ws_v6_host == "::" { "::" } else { &ws_v6_host },
                ws_v6_port
            );
            listener
        }
        Err(e) => {
            println!("⚠ 无法绑定IPv6双栈监听器: {}, 尝试绑定IPv4...", e);
            // 回退到只绑定IPv4
            let ws_v4_addr = format!(
                "{}:{}",
                config.websocket_config.ipv4.host, config.websocket_config.ipv4.port
            );
            match TcpListener::bind(&ws_v4_addr).await {
                Ok(listener) => {
                    println!("✓ 成功绑定IPv4监听器: {}", ws_v4_addr);
                    listener
                }
                Err(e) => {
                    eprintln!("❌ 无法绑定IPv4监听器 {}: {}", ws_v4_addr, e);
                    return Err(e.into());
                }
            }
        }
    };

    println!("--------------------------------------");
    println!("AT WebSocket 服务器启动成功！");
    println!("监听端口: {}", ws_v6_port);
    println!("支持协议: IPv4 和 IPv6 (双栈)");
    if !auth_key.is_empty() {
        println!("认证模式: 已启用 (密钥长度: {})", auth_key.len());
    } else {
        println!("认证模式: 未启用 (允许无密钥访问)");
    }
    println!("--------------------------------------");

    let client = at_client.clone();

    // 启动WebSocket服务器
    println!("WebSocket 服务器运行中...");
    loop {
        match ws_listener.accept().await {
            Ok((stream, addr)) => {
                let client = client.clone();
                let auth_key = auth_key.clone();
                tokio::spawn(async move {
                    let _ = websocket::handle_connection(stream, addr, client, auth_key).await;
                });
            }
            Err(e) => {
                eprintln!("接受连接失败: {}", e);
                break;
            }
        }
    }

    Ok(())
}

/// 打印配置摘要
fn print_config_summary(config: &Config) {
    println!("{}", "=".repeat(60));
    println!("当前运行配置:");
    println!("{}", "=".repeat(60));
    println!("连接类型: {}", config.at_config.conn_type);

    if config.at_config.conn_type == "NETWORK" {
        println!(
            "  网络地址: {}:{}",
            config.at_config.network.host, config.at_config.network.port
        );
        println!("  网络超时: {}秒", config.at_config.network.timeout);
    } else {
        println!("  串口设备: {}", config.at_config.serial.port);
        println!("  波特率: {}", config.at_config.serial.baudrate);
        println!("  串口超时: {}秒", config.at_config.serial.timeout);
        println!("  串口方法: {}", config.at_config.serial.method);
        println!("  串口功能: {}", config.at_config.serial.feature);
    }

    println!("\nWebSocket 配置:");
    println!("  监听端口: {}", config.websocket_config.ipv4.port);
    println!("  IPv4 绑定: {}", config.websocket_config.ipv4.host);
    println!("  IPv6 绑定: {}", config.websocket_config.ipv6.host);
    println!(
        "  认证密钥: {}",
        if config.websocket_config.auth_key.is_empty() {
            "无"
        } else {
            "已设置"
        }
    );

    println!("\n通知配置:");
    println!(
        "  企业微信: {}",
        if config.notification_config.wechat_webhook.is_empty() {
            "未启用"
        } else {
            "已启用"
        }
    );
    println!(
        "  日志文件: {}",
        if config.notification_config.log_file.is_empty() {
            "未启用"
        } else {
            &config.notification_config.log_file
        }
    );

    println!("  通知类型:");
    println!(
        "    - 短信通知: {}",
        if config.notification_config.notification_types.sms {
            "✓ 启用"
        } else {
            "✗ 禁用"
        }
    );
    println!(
        "    - 来电通知: {}",
        if config.notification_config.notification_types.call {
            "✓ 启用"
        } else {
            "✗ 禁用"
        }
    );
    println!(
        "    - 存储满通知: {}",
        if config.notification_config.notification_types.memory_full {
            "✓ 启用"
        } else {
            "✗ 禁用"
        }
    );
    println!(
        "    - 信号通知: {}",
        if config.notification_config.notification_types.signal {
            "✓ 启用"
        } else {
            "✗ 禁用"
        }
    );

    println!("\n自动重启飞行模式配置:");
    println!(
        "  启用: {}",
        if config.auto_airplane.enabled { "是" } else { "否" }
    );
    println!(
        "重启执行时间：{} ",
        if config.auto_airplane.action_time.is_empty() {
            "未设置".to_string()
        } else {
            config.auto_airplane.action_time.clone()
        }
    );

    println!("{}", "=".repeat(60));
}