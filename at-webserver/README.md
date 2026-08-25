# AT WebServer 软件包

为 MT5700 提供 WebSocket AT 命令服务和 Web 界面。后端是单个静态 Go 二进制，
不依赖 Python 运行时。

## 📁 文件结构

```
/usr/bin/at-webserver          # WebSocket 服务（静态二进制）
/etc/init.d/at-webserver       # 系统服务脚本
/etc/config/at-webserver       # UCI 配置文件
/www/5700/index.html           # Web 前端界面
/www/cgi-bin/at-ws-info        # 前端获取 WebSocket 地址的接口
```

源码在 `src/`，依赖已 vendor，编译过程无需联网。

## 🔧 配置

```bash
# 启用/禁用服务
uci set at-webserver.config.enabled='1'

# 连接类型 (NETWORK 或 SERIAL)
uci set at-webserver.config.connection_type='NETWORK'

# 网络模式
uci set at-webserver.config.network_host='192.168.8.1'
uci set at-webserver.config.network_port='20249'

# 串口模式：AT 命令要走 PCUI 口，MT5700M-CN 上是 ttyUSB1
# 端口映射 ttyUSB0=Application Interface / ttyUSB1=PCUI / ttyUSB2=SerialB
#          ttyUSB3=SerialC / ttyUSB4=GPS
uci set at-webserver.config.serial_port='/dev/ttyUSB1'
# 不确定的话填 auto，服务会逐个发 AT 探测出能应答的端口
# uci set at-webserver.config.serial_port='auto'
uci set at-webserver.config.serial_baudrate='115200'

# WebSocket 端口与连接密钥（密钥留空表示不校验）
uci set at-webserver.config.websocket_port='8765'
uci set at-webserver.config.websocket_auth_key=''

# 通知
uci set at-webserver.config.wechat_webhook='https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY'
uci set at-webserver.config.log_file='/var/log/at-notifications.log'
uci set at-webserver.config.notify_sms='1'
uci set at-webserver.config.notify_call='1'
uci set at-webserver.config.notify_memory_full='1'
uci set at-webserver.config.notify_signal='1'

uci commit at-webserver
/etc/init.d/at-webserver restart
```

## 🚀 使用

```bash
/etc/init.d/at-webserver start
/etc/init.d/at-webserver enable   # 开机自启
```

Web 界面：`http://路由器IP/5700/`

检查状态：

```bash
/etc/init.d/at-webserver status
ps | grep at-webserver
netstat -lntp | grep 8765
logread | grep at-webserver
```

WebSocket 只需一个监听套接字即可同时服务 IPv4 与 IPv6。

## 🔔 通知功能

支持企业微信机器人和本地日志文件两个渠道。企业微信侧会把 60 秒内的事件
合并成一条发出，并带失败重试。

通知类型：新短信、来电（振铃/结束）、短信存储空间满、信号强度或制式变化。

## ⏰ 定时锁频

按时段自动切换锁定的频段，可分别配置夜间和日间的 LTE / NR 锁定方式
（解锁 / 频段锁定 / 频点锁定 / 小区锁定）。锁频后如果持续无网络服务超过
设定时间，会自动解锁恢复，避免锁到没有覆盖的小区之后一直断网。

下发前会用 3GPP 的频段-频点范围表做一次校验，频段和频点明显对不上时
退回解锁而不是把模组锁死。频点/小区锁定要求频段、频点、PCI 的数量一一对应；
NR 的子载波间隔留空时按频段自动推断。

在 LuCI 的「AT WebServer」配置页里设置，或直接改 `schedule_*` 系列 UCI 选项。

## 🔌 串口不出来怎么办

本服务只负责在驱动就绪之后收发 AT 命令。如果 `/dev/ttyUSB*` 根本没生成，
问题在内核配置——需要的模块、option.c 的补丁写法、以及验证命令都在
[`docs/mt5700-内核驱动集成.md`](../docs/mt5700-内核驱动集成.md)。

`init.d` 里有一段往 `new_id` 写 VID/PID 的兜底逻辑，只在串口模式下执行：
网络模式压根不需要 ttyUSB，而按 VID/PID 强绑有抢走 ECM/NCM 网卡接口的风险。

## 🛠 开发

```bash
cd src
go test ./...          # 含一个假模组的端到端测试
./build.sh arm64       # 交叉编译后 scp 到路由器验证
```

`src/integration_test.go` 会拉起假模组 + AT 客户端 + WebSocket 服务，
覆盖命令往返、认证握手、心跳以及四类主动推送。改动协议相关代码前先跑它。
