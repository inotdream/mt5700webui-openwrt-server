use std::error::Error;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, broadcast};
use tokio::time::sleep;

use crate::at::connection::{ATConnection, NetworkATConn, SerialATConn, TomModemATConn};
use crate::config::Config;

const COMMAND_TIMEOUT: Duration = Duration::from_millis(1000);
const DRAIN_INTERVAL: Duration = Duration::from_millis(10);

fn normalize_command(command: &str) -> String {
    let trimmed = command.trim();
    if trimmed.is_empty() {
        return String::new();
    }

    if trimmed.ends_with("\r\n") {
        trimmed.to_string()
    } else {
        format!("{}\r\n", trimmed.trim_end())
    }
}

fn sanitize_response(response: &str, original_cmd: &str) -> String {
    let mut cleaned = response.replace("ping", "").trim().to_string();
    if cleaned.trim_start().starts_with(original_cmd) {
        if let Some(pos) = cleaned.find('\n') {
            cleaned = cleaned[(pos + 1)..].to_string();
        }
    }
    cleaned.trim().to_string()
}

fn has_terminal_marker(response: &str) -> bool {
    response.contains("OK") || response.contains("ERROR")
}

async fn drain_stale_data(conn: &mut Box<dyn ATConnection>) {
    let deadline = Instant::now() + Duration::from_millis(50);
    while Instant::now() < deadline {
        match conn.receive().await {
            Ok(data) if data.is_empty() => break,
            Ok(_) => continue,
            Err(_) => break,
        }
    }
}

pub struct ATClient {
    pub conn: Arc<Mutex<Box<dyn ATConnection>>>,
    pub urc_tx: broadcast::Sender<String>,
}

impl ATClient {
    pub fn new(config: &Arc<Config>) -> Result<Self, Box<dyn Error>> {
        let at_config = &config.at_config;

        let conn: Box<dyn ATConnection> = if at_config.conn_type == "NETWORK" {
            Box::new(NetworkATConn::new(at_config.network.clone()))
        } else if at_config.serial.method == "TOM_MODEM" {
            Box::new(TomModemATConn::new(
                at_config.serial.port.clone(),
                at_config.serial.timeout,
                at_config.serial.feature.clone(),
            ))
        } else {
            Box::new(SerialATConn::new(at_config.serial.clone()))
        };

        let (tx, _) = broadcast::channel(1024);
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
            urc_tx: tx,
        })
    }

    /// 发送 AT 命令并等待响应
    pub async fn send_command(
        &self,
        command: String,
    ) -> Result<String, Box<dyn Error + Send + Sync>> {
        let mut conn = self.conn.lock().await;
        let original_cmd = command.trim().to_string();
        let command = normalize_command(&command);

        drain_stale_data(&mut conn).await;

        println!("[DEBUG] ==> TX: {:?}", command);
        conn.send(command.as_bytes()).await?;

        let mut raw_response = String::new();
        let start = Instant::now();

        while start.elapsed() < COMMAND_TIMEOUT {
            match conn.receive().await {
                Ok(data) if !data.is_empty() => {
                    raw_response.push_str(&String::from_utf8_lossy(&data));
                    if has_terminal_marker(&raw_response) {
                        break;
                    }
                }
                Ok(_) => {}
                Err(_) => {}
            }
            sleep(DRAIN_INTERVAL).await;
        }

        let result = sanitize_response(&raw_response, &original_cmd);
        println!("[DEBUG] <== RX: {:?}", result);

        if result.contains("ERROR") {
            return Err("ERROR".into());
        }

        if result.is_empty() && start.elapsed() >= COMMAND_TIMEOUT {
            return Err("TIMEOUT".into());
        }

        Ok(result)
    }

    /// 初始化模块（ATE0, CNMI, CMGF, CLIP）
    pub async fn init_module(&self) {
        let _ = self.send_command("ATE0".into()).await;
        let _ = self.send_command("AT+CNMI=2,1,0,2,0".into()).await;
        let _ = self.send_command("AT+CMGF=0".into()).await;
        let _ = self.send_command("AT+CLIP=1".into()).await;
    }
}