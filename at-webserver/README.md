# AT WebServer 软件包

这个软件包为 NRadio C8 提供了一个 WebSocket AT 命令服务器和 Web 界面。

## 📁 文件结构

```
/usr/bin/at-server.py           # Python WebSocket 服务器
/etc/init.d/at-webserver        # 系统服务脚本
/etc/config/at-webserver        # UCI 配置文件
/www/5700/index.html            # Web 前端界面
```

## 🔧 配置

使用 UCI 命令配置：

```bash
# 启用/禁用服务
uci set at-webserver.config.enabled='1'

# 设置连接类型 (NETWORK 或 SERIAL)
uci set at-webserver.config.connection_type='NETWORK'

# 网络模式配置
uci set at-webserver.config.network_host='192.168.8.1'
uci set at-webserver.config.network_port='20249'

# 串口模式配置
uci set at-webserver.config.serial_port='/dev/ttyUSB0'
uci set at-webserver.config.serial_baudrate='115200'

# WebSocket 端口
uci set at-webserver.config.websocket_port='8765'

# 通知配置
uci set at-webserver.config.wechat_webhook='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY'
uci set at-webserver.config.log_file='/var/log/at-notifications.log'

# 通知类型开关 (1=启用, 0=禁用)
uci set at-webserver.config.notify_sms='1'
uci set at-webserver.config.notify_call='1'
uci set at-webserver.config.notify_memory_full='1'
uci set at-webserver.config.notify_signal='1'

# 保存配置
uci commit at-webserver

# 重启服务
/etc/init.d/at-webserver restart
```

## 🚀 使用

### 启动服务

```bash
/etc/init.d/at-webserver start
/etc/init.d/at-webserver enable  # 开机自启
```

### 访问 Web 界面

在浏览器中访问：
```
http://路由器IP/5700/
```
例如：`http://192.168.1.1/5700/`

### 检查服务状态

```bash
/etc/init.d/at-webserver status
ps | grep at-server.py
netstat -lntp | grep 8765
```

## 📝 日志查看

```bash
logread | grep at-server
```

## 🔄 前端文件位置

如果你有自定义的前端文件，放在：
```
package/nradio/at-webserver/files/www/
```

编译后会自动安装到路由器的 `/www/5700/` 目录，访问地址为 `http://路由器IP/5700/`

## 📦 依赖包

- python3
- python3-asyncio
- python3-websockets
- python3-pyserial
- python3-aiohttp (用于企业微信通知)

这些依赖会在安装时自动安装。

## 🔔 通知功能

### 支持的通知渠道

1. **企业微信通知**
   - 通过企业微信机器人发送通知到群聊
   - 支持批量消息合并（60秒内合并）
   - 自动重试机制

2. **日志文件记录**
   - 将所有通知保存到日志文件
   - 便于查看历史记录

### 支持的通知类型

- **短信通知**: 新短信到达时推送
- **来电通知**: 来电振铃和挂断时推送
- **存储满通知**: SIM卡短信存储满时警告
- **信号变化通知**: 网络信号强度变化或制式切换时推送

### 通知消息示例

```
📱 新短信通知
发送者: 10086
内容: 您的流量已使用90%

📞 来电提醒
时间：2025-10-24 15:30:00
号码：13800138000
状态：来电振铃

📶 信号变动通知
时间: 2025-10-24 15:30:00
制式: NR
信号: 优秀
RSRP: -75 dBm
RSRQ: -10 dB
SINR: 20 dB
```

