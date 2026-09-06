#!/bin/sh
# 把构建产物同步到 at-webserver 包里的 /www/5700，装包后就是设备上的前端。
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
dist="$root/dist"
target=${1:-"$root/../at-webserver/files/www/5700"}

[ -d "$dist" ] || {
	echo "没有找到 $dist，先跑 npm run build" >&2
	exit 1
}

# 下面要整目录清空重建，先确认路径确实是包里的 www/5700，别删错东西。
case "$target" in
*/www/5700) ;;
*)
	echo "目标目录必须是 .../www/5700，实际为 $target" >&2
	exit 1
	;;
esac

rm -rf "$target"
mkdir -p "$target"
cp -R "$dist/." "$target/"

# 旧版前端是路径式路由（/5700/network/info/），书签和外链都指着这些目录；
# 新版走 hash 路由，留一层跳转页免得直接 404。
legacy_redirect() {
	mkdir -p "$target/$1"
	cat >"$target/$1/index.html" <<EOF
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=/5700/#$2" />
    <title>MT5700M-CN</title>
  </head>
  <body></body>
</html>
EOF
}

legacy_redirect network /network/info
legacy_redirect network/info /network/info
legacy_redirect network/setting /network/setting
legacy_redirect network/dial /network/dial
legacy_redirect system /system/info
legacy_redirect system/info /system/info
legacy_redirect system/upgrade /system/upgrade
legacy_redirect sms /sms/center
legacy_redirect sms/center /sms/center
legacy_redirect sms/settings /sms/settings
legacy_redirect at /at

echo "已同步到 $target"
