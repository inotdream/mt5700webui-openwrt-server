include $(TOPDIR)/rules.mk

PKG_NAME:=at-webserver
PKG_VERSION:=3.0.2
PKG_RELEASE:=1

PKG_LICENSE:=MIT
PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_PARALLEL:=1
# Go 生成的代码不能用 MIPS16 指令集。
# 24.10 起用 PKG_BUILD_FLAGS 控制，老变量 PKG_USE_MIPS16 留着兼容旧 SDK。
PKG_BUILD_FLAGS:=no-mips16
PKG_USE_MIPS16:=0

GO_PKG:=github.com/inotdream/mt5700webui-openwrt-server/at-webserver
GO_PKG_LDFLAGS:=-s -w
GO_PKG_LDFLAGS_X:=main.version=$(PKG_VERSION)-$(PKG_RELEASE)

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/at-webserver
  SECTION:=net
  CATEGORY:=Network
  TITLE:=AT Command WebSocket Server
  URL:=https://github.com/inotdream/mt5700webui-openwrt-server
  DEPENDS:=$(GO_ARCH_DEPENDS)
endef

define Package/at-webserver/description
  WebSocket server bridging AT commands to the MT5700 web interface.
  Single static binary, no Python runtime required.
endef

# 源码在本仓库内，不走下载；依赖已 vendor 到 src/vendor，编译过程无需联网。
define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/. $(PKG_BUILD_DIR)/
endef

define Package/at-webserver/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(GO_PKG_BUILD_BIN_DIR)/at-webserver $(1)/usr/bin/at-webserver

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/etc/init.d/at-webserver $(1)/etc/init.d/

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/etc/config/at-webserver $(1)/etc/config/

	$(INSTALL_DIR) $(1)/www/5700
	$(CP) -r ./files/www/5700/* $(1)/www/5700/

	$(INSTALL_DIR) $(1)/www/cgi-bin
	$(INSTALL_BIN) ./files/www/cgi-bin/at-ws-info $(1)/www/cgi-bin/
	$(INSTALL_BIN) ./files/www/cgi-bin/at-log-clear $(1)/www/cgi-bin/
endef

define Package/at-webserver/conffiles
/etc/config/at-webserver
endef

# 从 1.x 的 Python 版升级时清掉旧脚本，避免 /usr/bin 里留个死文件。
define Package/at-webserver/preinst
#!/bin/sh
rm -f /usr/bin/at-server.py
exit 0
endef

$(eval $(call BuildPackage,at-webserver))
