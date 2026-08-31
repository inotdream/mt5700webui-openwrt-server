# semi-tcpweb

MT5700M-CN 5G 模组 Web 管理界面的 Semi Design 重构版，当前版本 V3.0.2，功能参考 `tcpweb-manager`。

## 技术栈

- Vite 6 + React 18 + TypeScript
- [Semi Design](https://semi.design)（布局 / 导航 / 表单 / 反馈）
- Hash 路由，`base` 为 `/5700/`，与原设备部署路径一致
- AT 通道仍走 WebSocket（`/cgi-bin/at-ws-info` 或 `public/config.json`）

## 开发

```bash
npm install
npm run dev
```

浏览器打开提示的本地地址（默认 `http://localhost:5173/5700/`）。

设备侧 CGI 可通过 Vite 代理到 `192.168.1.1`，按实际网关改 `vite.config.ts`。

## 构建与部署

```bash
npm run build     # 产物在 dist/，静态资源前缀 /5700/
npm run deploy    # build + 同步进 ../at-webserver/files/www/5700
```

`npm run sync:www` 会清空并重建 `at-webserver/files/www/5700`，除了构建产物还会生成
`network/info`、`sms/center` 等旧路径的跳转页——旧版前端是路径式路由，这层跳转让老书签不至于 404。

同步完在仓库根重新打包即可：`make package/nradio/at-webserver/compile`。

## AT 通道

连接地址按下面的顺序确定，前一步拿不到才走下一步：

1. `/cgi-bin/at-ws-info`（设备上的 CGI，返回 `host`/`port`/`require_auth`）
2. `config.json`（跟随 `base` 部署到 `/5700/config.json`，默认 `192.168.1.1:8765`）
3. `localStorage` 里手工填过的地址，最后兜底当前页面的 hostname

服务端配了密钥时，连接后第一条消息必须是 `{"auth_key":"..."}`。`require_auth` 来自 UCI 配置，
可能和服务端实际状态不一致，所以前端也会识别 `Authentication failed` 之类的应答并弹出密钥输入。

模组主动上报（URC）由后端以 `{"type":"raw_data","data":"..."}` 推送，解析集中在
`src/modem/urc.ts`；命令应答按发送顺序匹配，命令超时设为 6 秒以覆盖后端最坏情况，
调小会导致应答错位。

## 页面

| 路由 | 功能 |
| --- | --- |
| `/network/info` | 网络状态、信号、流量、PDCP 实时速率 |
| `/network/setting` | 锁频 / 邻区 / 5G 接入模式 |
| `/network/dial` | 拨号、PDP、DMZ、网口模式 |
| `/system/info` | 模组信息、IMEI、PIN、温保、NR 能力 |
| `/system/upgrade` | FOTA 升级 |
| `/sms/center` | 短信收发 |
| `/sms/settings` | 短信中心 / 存储 / 缓存 |
| `/at` | AT 调试终端 |
