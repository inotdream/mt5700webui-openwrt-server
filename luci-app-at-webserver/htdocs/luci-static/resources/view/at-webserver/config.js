'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require fs';
'require ui';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

var callInitAction = rpc.declare({
	object: 'luci',
	method: 'setInitAction',
	params: ['name', 'action'],
	expect: { result: false }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('at-webserver'), {}).then(function(res) {
		var isRunning = false;
		try {
			isRunning = res['at-webserver']['instances']['instance1']['running'];
		} catch(e) { }
		return isRunning;
	});
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('at-webserver'),
			getServiceStatus()
		]);
	},

	render: function(data) {
		var isRunning = data[1];
		var m, s, o;

		m = new form.Map('at-webserver', _('AT WebServer'),
			_('WebSocket服务器，用于通过Web界面管理AT命令。'));

		s = m.section(form.NamedSection, 'config', 'at-webserver');
		s.addremove = false;
		s.anonymous = false;

		// 服务状态显示
		o = s.option(form.DummyValue, '_status', _('服务状态'));
		o.cfgvalue = function() {
			return isRunning ? 
				'<span style="color:green">● ' + _('运行中') + '</span>' : 
				'<span style="color:red">● ' + _('已停止') + '</span>';
		};
		o.rawhtml = true;

		// 启用开关
		o = s.option(form.Flag, 'enabled', _('启用服务'),
			_('启用后服务将在系统启动时自动运行'));
		o.rmempty = false;

		// 连接类型
		o = s.option(form.ListValue, 'connection_type', _('连接类型'),
			_('选择AT命令的连接方式'));
		o.value('NETWORK', _('网络连接'));
		o.value('SERIAL', _('串口连接'));
		o.default = 'NETWORK';
		o.rmempty = false;

		// 网络连接配置
		o = s.option(form.Value, 'network_host', _('网络主机'),
			_('AT命令服务的IP地址'));
		o.datatype = 'host';
		o.default = '192.168.8.1';
		o.depends('connection_type', 'NETWORK');

		o = s.option(form.Value, 'network_port', _('网络端口'),
			_('AT命令服务的端口号'));
		o.datatype = 'port';
		o.default = '20249';
		o.depends('connection_type', 'NETWORK');

	o = s.option(form.Value, 'network_timeout', _('网络超时'),
		_('网络连接超时时间（秒）'));
	o.datatype = 'uinteger';
	o.default = '10';
	o.depends('connection_type', 'NETWORK');

	// 模块访问安全配置（始终显示，但仅在网络连接模式下生效）
	o = s.option(form.DummyValue, '_module_security_title', _('模块访问安全'));
	o.rawhtml = true;
	o.cfgvalue = function() {
		return '<strong style="color:#0099CC;">━━━━━━━ 模块 (192.168.8.1:20249) 访问控制 ━━━━━━━</strong>';
	};

	o = s.option(form.Flag, 'network_allow_wan', _('☐ 允许外网访问模块'),
		_('是否允许从外网直接访问模块的 AT 端口。<br><strong style="color:red;">⚠️ 安全警告：</strong>开启此选项将允许任何人从外网访问模块，存在严重安全风险！<br><strong>建议：</strong>保持关闭，仅通过 WebSocket 管理。<br><em>注意：此选项仅在"网络连接"模式下生效。</em>'));
	o.default = '0';
	o.rmempty = false;

	o = s.option(form.Flag, 'network_restrict_access', _('☐ 限制模块局域网访问'),
		_('启用后，只有路由器本身可以访问模块（192.168.8.1:20249），局域网其他设备将无法访问。<br><strong>适用场景：</strong>防止局域网设备直接访问模块，统一通过 WebSocket 管理。<br><em>注意：此选项仅在"网络连接"模式下生效。</em>'));
	o.default = '0';
	o.rmempty = false;

	// 串口连接配置
	// MT5700M-CN 的端口映射固定为：
	//   ttyUSB0=Application Interface, ttyUSB1=PCUI, ttyUSB2=SerialB,
	//   ttyUSB3=SerialC, ttyUSB4=GPS
	// AT 命令要走 PCUI，也就是 ttyUSB1。
	var PORT_ROLES = {
		'/dev/ttyUSB0': _('Application Interface'),
		'/dev/ttyUSB1': _('PCUI · AT 命令口'),
		'/dev/ttyUSB2': _('SerialB'),
		'/dev/ttyUSB3': _('SerialC'),
		'/dev/ttyUSB4': _('GPS')
	};

	o = s.option(form.ListValue, 'serial_port', _('串口设备'),
		_('AT 命令需要走模组的 PCUI 口，在 MT5700M-CN 上通常是 <code>/dev/ttyUSB1</code>。' +
		  '不确定就选“自动探测”，服务会逐个发 AT 找出能应答的端口。'));
	o.depends('connection_type', 'SERIAL');
	
	// 动态添加系统中可用的串口设备
	o.load = function(section_id) {
		return Promise.all([
			fs.list('/dev').catch(function() { return []; }),
			form.ListValue.prototype.load.apply(this, [section_id])
		]).then(L.bind(function(results) {
			var devices = results[0] || [];
			var currentValue = results[1];
			
			// 清空现有选项
			this.keylist = [];
			this.vallist = [];

			// 自动探测放在最前面，作为不确定时的稳妥选择
			this.value('auto', _('自动探测（逐个发 AT 试）'));
			
			// 添加常见串口设备
			var serialDevices = [];
			devices.forEach(function(item) {
				var name = item.name;
				// USB串口: ttyUSB*, CDC ACM设备: ttyACM*, 板载串口: ttyS*
				if (name.match(/^tty(USB|ACM|S)\d+$/)) {
					serialDevices.push('/dev/' + name);
				}
			});
			
			// 按编号数字序排列，避免 ttyUSB10 排到 ttyUSB2 前面
			serialDevices.sort(function(a, b) {
				var na = a.match(/(\d+)$/), nb = b.match(/(\d+)$/);
				if (na && nb && a.replace(/\d+$/, '') === b.replace(/\d+$/, ''))
					return parseInt(na[1]) - parseInt(nb[1]);
				return a < b ? -1 : (a > b ? 1 : 0);
			});
			
			// 添加到下拉列表，已知用途的端口标注出来
			if (serialDevices.length > 0) {
				serialDevices.forEach(L.bind(function(dev) {
					var role = PORT_ROLES[dev];
					this.value(dev, role ? dev + ' — ' + role : dev);
				}, this));
			} else {
				// 如果没有找到设备，至少给出 PCUI 口作为默认
				this.value('/dev/ttyUSB1', '/dev/ttyUSB1 — ' + PORT_ROLES['/dev/ttyUSB1']);
			}
			
			// 添加自定义选项
			this.value('custom', _('自定义路径...'));
			
			// 如果当前值不在列表中，添加它
			if (currentValue && !serialDevices.includes(currentValue) &&
			    currentValue !== 'custom' && currentValue !== 'auto') {
				this.value(currentValue, currentValue + ' (当前)');
			}
			
			return currentValue;
		}, this));
	};
	o.default = '/dev/ttyUSB1';
	
	// 自定义串口路径输入框
	o = s.option(form.Value, 'serial_port_custom', _('自定义串口路径'),
		_('输入完整的串口设备路径'));
	o.depends('serial_port', 'custom');
	o.placeholder = '/dev/ttyUSB1';
	o.rmempty = false;

		o = s.option(form.ListValue, 'serial_baudrate', _('波特率'),
			_('串口通信波特率'));
		o.value('9600', '9600');
		o.value('19200', '19200');
		o.value('38400', '38400');
		o.value('57600', '57600');
		o.value('115200', '115200');
		o.value('230400', '230400');
		o.value('460800', '460800');
		o.value('921600', '921600');
		o.default = '115200';
		o.depends('connection_type', 'SERIAL');

		o = s.option(form.Value, 'serial_timeout', _('串口超时'),
			_('串口通信超时时间（秒）'));
		o.datatype = 'uinteger';
		o.default = '10';
		o.depends('connection_type', 'SERIAL');

	// WebSocket配置
	o = s.option(form.DummyValue, '_websocket_title', _('WebSocket 配置'));
	o.rawhtml = true;
	o.cfgvalue = function() {
		return '<strong style="color:#0099CC;">━━━━━━━ WebSocket (端口 8765) 配置 ━━━━━━━</strong>';
	};

	o = s.option(form.Value, 'websocket_port', _('WebSocket 端口'),
		_('WebSocket服务器监听端口'));
	o.datatype = 'port';
	o.default = '8765';

	o = s.option(form.Flag, 'websocket_allow_wan', _('☐ 允许外网访问 WebSocket'),
		_('是否允许从外网访问 WebSocket。启用后将自动配置防火墙规则。<br><strong>安全提示：</strong>如果允许外网访问，强烈建议设置连接密钥！'));
	o.rmempty = false;
	o.default = '0';

	o = s.option(form.Value, 'websocket_auth_key', _('连接密钥'),
		_('WebSocket 连接密钥，用于验证客户端身份。<br>留空则不进行验证（不安全！）<br>建议使用复杂的随机字符串。'));
	o.password = true;
	o.placeholder = '留空表示不验证';
	o.rmempty = true;

		// Web界面链接
		o = s.option(form.DummyValue, '_webui', _('Web 管理界面'));
		o.cfgvalue = function() {
			var port = uci.get('at-webserver', 'config', 'websocket_port') || '8765';
			var url = window.location.protocol + '//' + window.location.hostname + '/5700/';
			return '<a href="' + url + '" target="_blank" style="color:#0099CC">' + 
			       url + '</a>';
		};
		o.rawhtml = true;

		// 通知配置标题（使用 DummyValue 作为分隔）
		o = s.option(form.DummyValue, '_notify_title', _('通知配置'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			return '<h3>' + _('配置短信、来电等事件的通知方式') + '</h3>';
		};

		// 企业微信 Webhook
		o = s.option(form.Value, 'wechat_webhook', _('企业微信 Webhook'),
			_('企业微信机器人的 Webhook 地址，留空则不启用微信通知'));
		o.placeholder = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...';

		// 日志文件
		o = s.option(form.Value, 'log_file', _('日志文件'),
			_('保存通知记录的日志文件路径，留空则不启用日志记录'));
		o.placeholder = '/var/log/at-notifications.log';

		// 通知类型标题（使用 DummyValue 作为分隔）
		o = s.option(form.DummyValue, '_notify_types_title', _('通知类型'));
		o.rawhtml = true;
		o.cfgvalue = function() {
			return '<h3>' + _('选择需要接收的通知类型') + '</h3>';
		};

		o = s.option(form.Flag, 'notify_sms', _('短信通知'),
			_('接收到新短信时发送通知'));
		o.rmempty = false;
		o.default = '1';

		o = s.option(form.Flag, 'notify_call', _('来电通知'),
			_('来电时发送通知'));
		o.rmempty = false;
		o.default = '1';

		o = s.option(form.Flag, 'notify_memory_full', _('存储满通知'),
			_('短信存储空间满时发送警告'));
		o.rmempty = false;
		o.default = '1';

	o = s.option(form.Flag, 'notify_signal', _('信号变化通知'),
		_('网络信号强度变化或制式切换时发送通知'));
	o.rmempty = false;
	o.default = '1';

	// ===== 定时锁频 =====
	o = s.option(form.DummyValue, '_schedule_title', _('定时锁频设置'));
	o.rawhtml = true;
	o.cfgvalue = function() {
		return '<h3>' + _('根据时间自动切换锁定的基站频段') + '</h3>';
	};

	o = s.option(form.Flag, 'schedule_enabled', _('启用定时锁频'),
		_('根据时间自动切换锁定的基站频段（适用于夜间基站负载低、想锁到特定频段的场景）'));
	o.rmempty = false;
	o.default = '0';

	o = s.option(form.Value, 'schedule_check_interval', _('检测间隔（秒）'),
		_('检查网络状态与时段的时间间隔，最小 10 秒'));
	o.datatype = 'min(10)';
	o.default = '60';
	o.depends('schedule_enabled', '1');

	o = s.option(form.Value, 'schedule_timeout', _('无服务超时（秒）'),
		_('锁频后如果持续无网络服务超过此时间，自动解锁恢复，最小 30 秒'));
	o.datatype = 'min(30)';
	o.default = '180';
	o.depends('schedule_enabled', '1');

	o = s.option(form.Flag, 'schedule_unlock_lte', _('解锁 LTE 锁频锁小区'),
		_('锁定类型选“解锁”时，下发 LTE 解锁命令'));
	o.rmempty = false;
	o.default = '1';
	o.depends('schedule_enabled', '1');

	o = s.option(form.Flag, 'schedule_unlock_nr', _('解锁 NR（5G）锁频锁小区'),
		_('锁定类型选“解锁”时，下发 NR 解锁命令'));
	o.rmempty = false;
	o.default = '1';
	o.depends('schedule_enabled', '1');

	o = s.option(form.Flag, 'schedule_toggle_airplane', _('切换飞行模式'),
		_('下发锁频前后切换飞行模式使配置立即生效（推荐开启）'));
	o.rmempty = false;
	o.default = '1';
	o.depends('schedule_enabled', '1');

	// 夜间时段
	o = s.option(form.Flag, 'schedule_night_enabled', _('启用夜间模式'),
		_('在夜间时段自动切换到下面配置的频段'));
	o.rmempty = false;
	o.default = '1';
	o.depends('schedule_enabled', '1');

	o = s.option(form.Value, 'schedule_night_start', _('夜间开始时间'),
		_('格式 HH:MM，允许跨零点，例如 22:00 到 06:00'));
	o.placeholder = '22:00';
	o.default = '22:00';
	o.depends('schedule_night_enabled', '1');

	o = s.option(form.Value, 'schedule_night_end', _('夜间结束时间'),
		_('格式 HH:MM'));
	o.placeholder = '06:00';
	o.default = '06:00';
	o.depends('schedule_night_enabled', '1');

	// 夜间与日间的 LTE/NR 选项结构完全一致，用一个函数生成，避免几百行重复。
	function addLockOptions(prefix, gateOption, label) {
		var lteType = s.option(form.ListValue, prefix + '_lte_type', label + _(' LTE 锁定类型'),
			_('解锁 = 不限制；频段锁定只锁 Band；频点锁定需要填频点；小区锁定还需要 PCI'));
		lteType.value('0', _('解锁'));
		lteType.value('1', _('频点锁定'));
		lteType.value('2', _('小区锁定'));
		lteType.value('3', _('频段锁定'));
		lteType.default = '3';
		lteType.depends(gateOption, '1');

		var lteBands = s.option(form.Value, prefix + '_lte_bands', label + _(' LTE 频段'),
			_('用逗号分隔，如 3,8,41'));
		lteBands.placeholder = '3,8';
		lteBands.depends(prefix + '_lte_type', '1');
		lteBands.depends(prefix + '_lte_type', '2');
		lteBands.depends(prefix + '_lte_type', '3');

		var lteArfcns = s.option(form.Value, prefix + '_lte_arfcns', label + _(' LTE 频点'),
			_('用逗号分隔，数量必须与频段一致，如频段 3,8 对应 1850,3450'));
		lteArfcns.placeholder = '1850,3450';
		lteArfcns.depends(prefix + '_lte_type', '1');
		lteArfcns.depends(prefix + '_lte_type', '2');

		var ltePcis = s.option(form.Value, prefix + '_lte_pcis', label + _(' LTE PCI'),
			_('用逗号分隔，数量必须与频段一致，仅小区锁定需要'));
		ltePcis.placeholder = '256,128';
		ltePcis.depends(prefix + '_lte_type', '2');

		var nrType = s.option(form.ListValue, prefix + '_nr_type', label + _(' NR 锁定类型'),
			_('NR（5G）的锁定方式'));
		nrType.value('0', _('解锁'));
		nrType.value('1', _('频点锁定'));
		nrType.value('2', _('小区锁定'));
		nrType.value('3', _('频段锁定'));
		nrType.default = '3';
		nrType.depends(gateOption, '1');

		var nrBands = s.option(form.Value, prefix + '_nr_bands', label + _(' NR 频段'),
			_('用逗号分隔，如 78,41'));
		nrBands.placeholder = '78';
		nrBands.depends(prefix + '_nr_type', '1');
		nrBands.depends(prefix + '_nr_type', '2');
		nrBands.depends(prefix + '_nr_type', '3');

		var nrArfcns = s.option(form.Value, prefix + '_nr_arfcns', label + _(' NR 频点'),
			_('用逗号分隔，数量必须与频段一致'));
		nrArfcns.placeholder = '630000';
		nrArfcns.depends(prefix + '_nr_type', '1');
		nrArfcns.depends(prefix + '_nr_type', '2');

		var nrScs = s.option(form.Value, prefix + '_nr_scs_types', label + _(' NR 子载波间隔'),
			_('0 = 15kHz，1 = 30kHz，用逗号分隔。留空则按频段自动推断'));
		nrScs.placeholder = '1';
		nrScs.depends(prefix + '_nr_type', '1');
		nrScs.depends(prefix + '_nr_type', '2');

		var nrPcis = s.option(form.Value, prefix + '_nr_pcis', label + _(' NR PCI'),
			_('用逗号分隔，数量必须与频段一致，仅小区锁定需要'));
		nrPcis.placeholder = '100';
		nrPcis.depends(prefix + '_nr_type', '2');
	}

	addLockOptions('schedule_night', 'schedule_night_enabled', _('夜间'));

	// 日间时段
	o = s.option(form.Flag, 'schedule_day_enabled', _('启用日间模式'),
		_('非夜间时段自动切换到下面配置的频段'));
	o.rmempty = false;
	o.default = '1';
	o.depends('schedule_enabled', '1');

	addLockOptions('schedule_day', 'schedule_day_enabled', _('日间'));

	return m.render();
	},

	handleSaveApply: function(ev, mode) {
		return this.handleSave(ev).then(L.bind(function() {
			// 等待一下确保 UCI 已提交
			return new Promise(function(resolve) {
				setTimeout(resolve, 500);
			}).then(L.bind(function() {
				return this.handleRestart(ev);
			}, this));
		}, this));
	},

	handleSave: function(ev) {
		var map = document.querySelector('.cbi-map');
		
		return this.super('handleSave', [ev]).then(L.bind(function() {
			// 显式提交 UCI 配置
			return uci.save().then(function() {
				return uci.apply();
			}).then(function() {
				// 强制提交 at-webserver 配置
				return uci.save('at-webserver');
			}).then(function() {
				// 确保 enabled 字段被正确保存
				var enabledValue = map.querySelector('input[name="cbid.at-webserver.config.enabled"]');
				if (enabledValue) {
					var isEnabled = enabledValue.checked ? '1' : '0';
					uci.set('at-webserver', 'config', 'enabled', isEnabled);
					uci.save('at-webserver');
					uci.commit('at-webserver');
				}
				ui.addNotification(null, E('p', _('✓ 配置已保存并提交')), 'success');
			});
		}, this)).catch(L.bind(function(e) {
			ui.addNotification(null, E('p', _('保存配置失败: ') + (e.message || e)), 'error');
			throw e;
		}, this));
	},

	handleRestart: function(ev) {
		ui.showModal(_('重启服务'), [
			E('p', { 'class': 'spinning' }, _('正在重启 AT WebServer 服务...'))
		]);

		// 先停止服务，再启动服务，确保配置重新加载
		return callInitAction('at-webserver', 'stop').then(function() {
			return new Promise(function(resolve) { 
				setTimeout(resolve, 2000); 
			});
		}).then(function() {
			return callInitAction('at-webserver', 'start');
		}).then(function() {
			return new Promise(function(resolve) { 
				setTimeout(resolve, 3000); 
			});
		}).then(function() {
			ui.hideModal();
			ui.addNotification(null, E('p', _('✓ 服务已重启，配置已生效')), 'success');
			setTimeout(function() { 
				window.location.reload(true); 
			}, 1000);
		}).catch(function(e) {
			ui.hideModal();
			ui.addNotification(null, E('p', _('重启服务失败: ') + (e.message || e)), 'error');
		});
	},

	handleReset: null
});

