include $(TOPDIR)/rules.mk

PKG_NAME:=at-webserver
PKG_VERSION:=1.0
PKG_RELEASE:=15

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/at-webserver
  SECTION:=net
  CATEGORY:=Network
  TITLE:=AT Command WebSocket Server
  DEPENDS:=+python3 +python3-asyncio +python3-websockets +python3-pyserial +python3-aiohttp
  PKGARCH:=all
endef

define Package/at-webserver/description
  WebSocket server for AT command communication with web interface
endef

define Build/Compile
endef

define Package/at-webserver/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/usr/bin/at-server.py $(1)/usr/bin/
	
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

$(eval $(call BuildPackage,at-webserver))

