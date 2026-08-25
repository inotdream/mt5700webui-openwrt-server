#!/bin/sh
# 在 OpenWrt buildroot 之外快速交叉编译，方便直接 scp 到路由器上验证。
# 正式出包请用上层目录的 Makefile 走 OpenWrt 的 golang-package.mk。
#
#   ./build.sh              # 默认 arm64
#   ./build.sh mipsle       # 指定架构
#
set -eu

ARCH=${1:-arm64}
VERSION=$(git -C "$(dirname "$0")" describe --tags --always --dirty 2>/dev/null || echo dev)
OUT="at-webserver-linux-$ARCH"

cd "$(dirname "$0")"

CGO_ENABLED=0 GOOS=linux GOARCH="$ARCH" \
	go build -trimpath -ldflags "-s -w -X main.version=$VERSION" -o "$OUT" .

echo "已生成 $OUT ($(du -h "$OUT" | cut -f1))"
echo
echo "部署到路由器："
echo "  scp $OUT root@192.168.1.1:/usr/bin/at-webserver"
echo "  ssh root@192.168.1.1 '/etc/init.d/at-webserver restart'"
