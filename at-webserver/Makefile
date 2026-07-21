include $(TOPDIR)/rules.mk

PKG_NAME:=at-webserver
PKG_VERSION:=1.0.3
PKG_RELEASE:=1


PKG_BUILD_DEPENDS:=rust/host

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/rust/rust-package.mk

define Package/at-webserver
  SECTION:=net
  CATEGORY:=Network
  TITLE:=AT Command WebSocket Server Rust Implementation
  DEPENDS:=$(RUST_ARCH_DEPENDS)
endef

define Package/at-webserver/description
  	WebSocket server for AT command communication with web interface
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./srcs/* $(PKG_BUILD_DIR)/
endef

define Package/at-webserver/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/bin/atserver $(1)/usr/bin/
	
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

$(eval $(call RustBinPackage,at-webserver))
$(eval $(call BuildPackage,at-webserver))

