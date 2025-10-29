www 目录结构说明
===================

目录结构：
---------
www/
├── 5700/           <- 前端文件都放这里
│   ├── index.html
│   └── ...
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

使用方法：
---------
1. 将你的前端文件放入 5700/ 目录
2. 运行 make package/nradio/at-webserver/compile
3. 安装生成的 IPK 包

