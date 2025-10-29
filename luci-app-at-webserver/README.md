# LuCI App for AT WebServer

这是 AT WebServer 的 LuCI Web 管理界面。

## 功能特性

### 配置页面
- ✅ 启用/禁用服务
- ✅ 查看服务运行状态
- ✅ 配置连接类型（网络/串口）
- ✅ 配置网络连接参数
- ✅ 配置串口连接参数
- ✅ 配置 WebSocket 端口
- ✅ 配置通知推送（企业微信/日志）
- ✅ 选择通知类型（短信/来电/信号）
- ✅ 直接跳转到 Web 管理界面

### 日志查看页面
- ✅ 实时查看通知日志
- ✅ 刷新日志显示
- ✅ 一键清空日志
- ✅ 显示日志统计信息

### AT 调试页面
- ✅ WebSocket 实时连接
- ✅ 发送 AT 命令
- ✅ 查看命令响应
- ✅ 常用命令快捷按钮
- ✅ 彩色输出显示
- ✅ 自动重连机制

## 访问路径

安装后，在 LuCI 界面中访问：

```
服务 → AT WebServer
  ├── 配置       - 服务配置和通知设置
  ├── 日志查看    - 查看和管理通知日志
  └── AT调试     - 实时发送 AT 命令
```

或者直接访问：
```
配置页面：http://路由器IP/cgi-bin/luci/admin/services/at-webserver/config
日志查看：http://路由器IP/cgi-bin/luci/admin/services/at-webserver/logs
AT调试：  http://路由器IP/cgi-bin/luci/admin/services/at-webserver/debug
```

## 配置界面

配置界面提供以下选项：

### 基本设置
- **服务状态**: 显示服务是否运行
- **启用服务**: 开关服务自动启动

### 连接配置
- **连接类型**: 
  - 网络连接 (NETWORK)
  - 串口连接 (SERIAL)

#### 网络连接模式
- **网络主机**: AT 服务器 IP 地址
- **网络端口**: AT 服务器端口
- **网络超时**: 连接超时时间

#### 串口连接模式
- **串口设备**: 设备路径 (如 /dev/ttyUSB0)
- **波特率**: 串口通信速率 (9600-921600)
- **串口超时**: 通信超时时间

### WebSocket 配置
- **WebSocket端口**: Web 前端连接端口 (默认 8765)

### 通知配置

#### 通知渠道
- **企业微信 Webhook**: 
  - 企业微信机器人的 Webhook 地址
  - 留空则不启用微信通知
  - 格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY`
  - 获取方式：在企业微信中创建群机器人，复制 Webhook 地址
  
- **日志文件**: 
  - 保存通知记录的日志文件路径
  - 留空则不启用日志记录
  - 建议路径：`/var/log/at-notifications.log`

#### 通知类型
- **短信通知**: 接收到新短信时发送通知
- **来电通知**: 来电振铃/挂断时发送通知
- **存储满通知**: 短信存储空间满时发送警告
- **信号变化通知**: 网络信号强度变化或制式切换时发送通知

### Web 管理界面
- 直接跳转链接到 `/5700/` 管理界面

## 文件结构

```
luci-app-at-webserver/
├── Makefile                                          # 编译配置
├── htdocs/luci-static/resources/view/
│   └── at-webserver/
│       ├── config.js                                 # 配置界面
│       ├── logs.js                                   # 日志查看界面
│       └── debug.js                                  # AT调试界面
├── root/usr/share/
│   ├── luci/menu.d/
│   │   └── luci-app-at-webserver.json               # 菜单配置
│   └── rpcd/acl.d/
│       └── luci-app-at-webserver.json               # 权限配置
└── po/zh_Hans/
    └── at-webserver.po                               # 中文翻译
```

## 依赖关系

- `at-webserver` - AT WebServer 主程序
- LuCI (自动安装)

## 开发说明

### 修改配置界面

编辑文件：
```
htdocs/luci-static/resources/view/at-webserver/config.js
```

### 添加新的翻译

编辑文件：
```
po/zh_Hans/at-webserver.po
```

### 菜单位置调整

编辑文件：
```
root/usr/share/luci/menu.d/luci-app-at-webserver.json
```

修改 `order` 值可以调整菜单顺序。

## 使用示例

### 1. 配置企业微信通知

1. 在企业微信中创建群聊
2. 添加群机器人，复制 Webhook 地址
3. 在 LuCI 界面中粘贴 Webhook 地址
4. 选择需要接收的通知类型
5. 保存配置

### 2. 查看日志

1. 进入"日志查看"页面
2. 查看最新的通知记录（最新记录在顶部）
3. 点击"刷新"按钮更新日志显示
4. 如需清空历史记录，点击"清空日志"按钮

**日志文件位置：** `/var/log/at-notifications.log`（可在配置页面自定义）

### 3. AT 命令调试

1. 进入"AT调试"页面
2. 等待 WebSocket 自动连接（状态显示为"已连接"）
3. 在输入框中输入 AT 命令，或点击常用命令快捷按钮
4. 查看实时响应输出
5. 点击"清空输出"清除历史记录

**常用命令示例：**
- `AT` - 测试连接
- `AT+CPIN?` - 查询 SIM 卡状态
- `AT+CSQ` - 查询信号强度
- `AT+COPS?` - 查询运营商信息
- `AT^MONSC` - 查询小区信息
- `AT+CMGL=0` - 读取所有短信

### 通知消息示例

**短信通知：**
```
📱 新短信通知
发送者: 10086
内容: 您的流量已使用90%
```

**来电通知：**
```
📞 来电提醒
时间：2025-10-24 15:30:00
号码：13800138000
状态：来电振铃
```

**信号变化通知：**
```
📶 信号变动通知
时间: 2025-10-24 15:30:00
制式: NR
信号: 优秀
RSRP: -75 dBm
RSRQ: -10 dB
SINR: 20 dB
```

## 注意事项

配置保存后，服务会自动重启以应用新配置。

