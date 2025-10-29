'use strict';
'require view';
'require uci';
'require ui';
'require rpc';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('at-webserver'),
			callServiceList('at-webserver')
		]);
	},

	render: function(data) {
		var isRunning = false;
		try {
			isRunning = data[1]['at-webserver']['instances']['instance1']['running'];
		} catch(e) { }

		var wsPort = uci.get('at-webserver', 'config', 'websocket_port') || '8765';
		var wsUrl = 'ws://' + window.location.hostname + ':' + wsPort;

		var view = E('div', { 'class': 'cbi-map' }, [
			E('h2', {}, _('AT 命令调试')),
			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'cbi-section-descr' }, 
					_('直接发送 AT 命令到模块，查看实时响应')
				)
			])
		]);

		// 服务状态
		view.appendChild(
			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'cbi-section-node' }, [
					E('div', { 'class': 'cbi-value' }, [
						E('label', { 'class': 'cbi-value-title' }, _('服务状态')),
						E('div', { 'class': 'cbi-value-field' }, [
							isRunning ? 
								E('span', { 'style': 'color: green' }, '● ' + _('运行中')) :
								E('span', { 'style': 'color: red' }, '● ' + _('已停止'))
						])
					]),
					E('div', { 'class': 'cbi-value' }, [
						E('label', { 'class': 'cbi-value-title' }, _('WebSocket 地址')),
						E('div', { 'class': 'cbi-value-field' }, [
							E('code', { 'id': 'ws-url' }, wsUrl)
						])
					]),
					E('div', { 'class': 'cbi-value' }, [
						E('label', { 'class': 'cbi-value-title' }, _('连接状态')),
						E('div', { 'class': 'cbi-value-field' }, [
							E('span', { 
								'id': 'connection-status',
								'style': 'color: gray'
							}, '● ' + _('未连接'))
						])
					])
				])
			])
		);

		if (!isRunning) {
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'alert-message warning' }, [
						E('p', {}, _('服务未运行，请先启动 AT WebServer 服务')),
						E('p', {}, [
							E('a', { 
								'href': L.url('admin/services/at-webserver/config'),
								'class': 'btn cbi-button-apply'
							}, _('前往配置'))
						])
					])
				])
			);
		} else {
			// AT 命令输入
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'cbi-section-node' }, [
						E('div', { 'class': 'cbi-value' }, [
							E('label', { 'class': 'cbi-value-title' }, _('AT 命令')),
							E('div', { 'class': 'cbi-value-field' }, [
								E('input', {
									'id': 'at-command-input',
									'type': 'text',
									'class': 'cbi-input-text',
									'placeholder': _('输入 AT 命令，例如: AT+CPIN?'),
									'style': 'width: 400px; font-family: monospace;'
								}),
								' ',
								E('button', {
									'id': 'send-button',
									'class': 'btn cbi-button-apply',
									'disabled': 'disabled'
								}, _('发送')),
								' ',
								E('button', {
									'id': 'clear-button',
									'class': 'btn cbi-button-reset'
								}, _('清空输出'))
							])
						])
					])
				])
			);

			// 常用命令快捷按钮
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('legend', {}, _('常用命令')),
					E('div', { 'class': 'cbi-section-node' }, [
						E('div', { 'class': 'cbi-value' }, [
							E('div', { 'class': 'cbi-value-field' }, [
								E('button', { 'class': 'btn cbi-button', 'data-cmd': 'AT' }, 'AT'),
								' ',
								E('button', { 'class': 'btn cbi-button', 'data-cmd': 'AT+CPIN?' }, _('查询 SIM 卡')),
								' ',
								E('button', { 'class': 'btn cbi-button', 'data-cmd': 'AT+CSQ' }, _('信号强度')),
								' ',
								E('button', { 'class': 'btn cbi-button', 'data-cmd': 'AT+COPS?' }, _('运营商信息')),
								' ',
								E('button', { 'class': 'btn cbi-button', 'data-cmd': 'AT+CGMR' }, _('固件版本')),
								' ',
								E('button', { 'class': 'btn cbi-button', 'data-cmd': 'AT^MONSC' }, _('小区信息')),
								' ',
								E('button', { 'class': 'btn cbi-button', 'data-cmd': 'AT+CMGL=0' }, _('读取短信'))
							])
						])
					])
				])
			);

			// 输出区域
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('legend', {}, _('输出')),
					E('div', { 'class': 'cbi-section-node' }, [
						E('pre', {
							'id': 'at-output',
							'style': 'background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; min-height: 400px; max-height: 600px; overflow-y: auto; font-family: "Consolas", "Monaco", monospace; font-size: 13px; white-space: pre-wrap; word-wrap: break-word;'
						}, _('等待连接...'))
					])
				])
			);

			// WebSocket 逻辑
			view.appendChild(
				E('script', {}, `
(function() {
	var ws = null;
	var reconnectTimer = null;
	var isManualClose = false;
	
	var statusEl = document.getElementById('connection-status');
	var outputEl = document.getElementById('at-output');
	var inputEl = document.getElementById('at-command-input');
	var sendBtn = document.getElementById('send-button');
	var clearBtn = document.getElementById('clear-button');
	
	function appendOutput(text, type) {
		var timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
		var color = type === 'send' ? '#4ec9b0' : 
		            type === 'recv' ? '#ce9178' :
		            type === 'error' ? '#f48771' : '#d4d4d4';
		var prefix = type === 'send' ? '>>> ' : 
		            type === 'recv' ? '<<< ' :
		            type === 'error' ? '[!] ' : '[i] ';
		
		outputEl.innerHTML += '<span style="color: #858585;">[' + timestamp + ']</span> ' +
		                      '<span style="color: ' + color + ';">' + prefix + text + '</span>\\n';
		outputEl.scrollTop = outputEl.scrollHeight;
	}
	
	function updateStatus(status, color) {
		statusEl.innerHTML = '● ' + status;
		statusEl.style.color = color;
	}
	
	function connect() {
		if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
			return;
		}
		
		updateStatus('连接中...', 'orange');
		appendOutput('正在连接到 ${wsUrl}', 'info');
		
		ws = new WebSocket('${wsUrl}');
		
		ws.onopen = function() {
			updateStatus('已连接', 'green');
			appendOutput('WebSocket 连接成功', 'info');
			sendBtn.disabled = false;
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}
		};
		
		ws.onmessage = function(event) {
			try {
				var data = JSON.parse(event.data);
				if (data.type === 'raw_data') {
					appendOutput(data.data, 'recv');
				} else if (data.success !== undefined) {
					if (data.success) {
						appendOutput(data.data || 'OK', 'recv');
					} else {
						appendOutput(data.error || 'ERROR', 'error');
					}
				}
			} catch(e) {
				appendOutput(event.data, 'recv');
			}
		};
		
		ws.onerror = function(error) {
			appendOutput('WebSocket 错误', 'error');
			updateStatus('连接错误', 'red');
		};
		
		ws.onclose = function() {
			updateStatus('未连接', 'gray');
			sendBtn.disabled = true;
			
			if (!isManualClose) {
				appendOutput('连接断开，5秒后尝试重连...', 'info');
				reconnectTimer = setTimeout(connect, 5000);
			}
		};
	}
	
	function sendCommand(cmd) {
		if (!ws || ws.readyState !== WebSocket.OPEN) {
			appendOutput('未连接到服务器', 'error');
			return;
		}
		
		if (!cmd || cmd.trim() === '') {
			appendOutput('命令不能为空', 'error');
			return;
		}
		
		appendOutput(cmd, 'send');
		ws.send(cmd);
	}
	
	// 发送按钮
	sendBtn.onclick = function() {
		var cmd = inputEl.value.trim();
		if (cmd) {
			sendCommand(cmd);
			inputEl.value = '';
		}
	};
	
	// 回车发送
	inputEl.onkeypress = function(e) {
		if (e.keyCode === 13) {
			sendBtn.click();
		}
	};
	
	// 清空按钮
	clearBtn.onclick = function() {
		outputEl.innerHTML = '';
	};
	
	// 快捷命令按钮
	document.querySelectorAll('[data-cmd]').forEach(function(btn) {
		btn.onclick = function() {
			inputEl.value = this.getAttribute('data-cmd');
			sendBtn.click();
		};
	});
	
	// 页面卸载时关闭连接
	window.addEventListener('beforeunload', function() {
		isManualClose = true;
		if (ws) {
			ws.close();
		}
	});
	
	// 自动连接
	connect();
})();
				`)
			);
		}

		return view;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});

