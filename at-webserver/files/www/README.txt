www 目录结构说明
===================

目录结构：
---------
www/
├── 5700/           <- 前端构建产物（由 semi-tcpweb 生成，不要手改）
│   ├── index.html
│   ├── config.json  <- WebSocket 兜底配置
│   ├── assets/
│   └── network/ system/ sms/ at/  <- 旧路径跳转页
├── cgi-bin/        <- CGI API 脚本（不要修改）
│   └── at-ws-info
└── README.txt      <- 本文件

安装后的路径：
-------------
- files/www/5700/*  → /www/5700/*      (前端界面)
- files/www/cgi-bin/* → /www/cgi-bin/* (API 接口)

访问地址：
---------
- 前端: http://路由器IP/5700/
- API:  http://路由器IP/cgi-bin/at-ws-info

更新前端：
---------
前端源码在仓库的 semi-tcpweb/，构建产物同步进 5700/：

    cd semi-tcpweb
    npm install
    npm run deploy      # 等价于 npm run build && npm run sync:www

然后重新打包安装：

    make package/nradio/at-webserver/compile

关于 5700/ 里的文件：
--------------------
- 新前端走 hash 路由（/5700/#/network/info），所有页面都由 index.html 承载。
  network/ system/ sms/ at/ 这些子目录只是给旧版路径式 URL 留的跳转页，
  由 semi-tcpweb/scripts/sync-www.sh 生成，删了会让老书签 404。
- config.json 是 /cgi-bin/at-ws-info 取不到时的兜底地址，默认
  192.168.1.1:8765。设备上正常走 CGI，这个文件一般不用动。
