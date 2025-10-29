'use strict';
'require view';
'require fs';
'require ui';
'require uci';

return view.extend({
	load: function() {
		return uci.load('at-webserver').then(function() {
			var logFile = uci.get('at-webserver', 'config', 'log_file') || '';
			if (!logFile)
				return { path: '', content: '', status: 'unconfigured' };
			
			return fs.stat(logFile).then(function(st) {
				return fs.read(logFile).then(function(content) {
					var lines = (content || '').trim().split('\n');
					if (lines.length > 300)
						lines = lines.slice(lines.length - 300);
					return { path: logFile, content: lines.join('\n'), status: 'ok' };
				});
			}).catch(function(err) {
				return { path: logFile, content: '', status: 'error', error: err && err.message ? err.message : 'failed' };
			});
		});
	},

	handleRefreshLog: function(ev) {
		window.location.reload();
	},

	handleClearLog: function(ev) {
		return uci.load('at-webserver').then(L.bind(function() {
			var logFile = uci.get('at-webserver', 'config', 'log_file') || '';
			if (!logFile) {
				ui.addNotification(null, E('p', _('未配置日志文件，无法清空')), 'warning');
				return;
			}
			// 使用多种方法确保文件被清空
			return fs.exec('/bin/sh', ['-c', '> ' + logFile + ' 2>/dev/null || echo "" > ' + logFile + ' 2>/dev/null || true']).then(function(res) {
				// 无论命令是否成功，都尝试用 fs.write 方法
				return fs.write(logFile, '').then(function() {
					ui.addNotification(null, E('p', _('✓ 通知日志已清空')), 'success');
					setTimeout(function() { window.location.reload(); }, 600);
				}).catch(function(err) {
					// 如果 fs.write 也失败，检查之前的命令结果
					if (res.code === 0) {
						ui.addNotification(null, E('p', _('✓ 通知日志已清空')), 'success');
						setTimeout(function() { window.location.reload(); }, 600);
					} else {
						ui.addNotification(null, E('p', _('清空失败: %s').format(err.message || '权限不足')), 'error');
					}
				});
			});
		}, this));
	},

	render: function(data) {
		var notif = data || { path: '', content: '', status: 'unconfigured' };

		// 通知日志固定深色风格
		var notifStyle = 'background:#1e1e1e; color:#e6e6e6; border:1px solid #333; padding:15px; border-radius:4px; max-height:600px; overflow-y:auto; font-family:monospace; font-size:13px; line-height:1.6; white-space: pre-wrap; word-wrap: break-word;';
		
		var view = E('div', { 'class': 'cbi-map' }, [
			E('h2', {}, _('通知日志')),
			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'cbi-section-descr' }, 
					_('查看短信、来电、信号变化等通知记录')
				)
			])
		]);

		// 通知日志内容
		if (notif.status === 'unconfigured') {
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'alert-message warning' }, [
						E('h4', {}, _('未配置日志文件')),
						E('p', {}, _('请先在配置页面中设置日志文件路径，例如：/var/log/at-notifications.log')),
						E('p', {}, [
							E('a', { 
								'href': L.url('admin/services/at-webserver/config'),
								'class': 'btn cbi-button-apply'
							}, _('前往配置'))
						])
					])
				])
			);
		} else if (notif.status === 'error') {
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'alert-message error' }, [
						E('h4', {}, _('读取日志失败')),
						E('p', {}, _('错误信息: %s').format(notif.error || '未知错误')),
						E('p', {}, _('日志路径: %s').format(notif.path)),
						E('p', {}, _('请检查文件权限或路径是否正确'))
					])
				])
			);
		} else if (!notif.content || !notif.content.trim()) {
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'cbi-section-node' }, [
						E('div', { 'class': 'cbi-value' }, [
							E('label', { 'class': 'cbi-value-title' }, _('日志路径')),
							E('div', { 'class': 'cbi-value-field' }, [ 
								E('code', {}, notif.path),
								'   ',
								E('button', {
									'class': 'btn cbi-button-apply',
									'click': ui.createHandlerFn(this, 'handleRefreshLog')
								}, _('刷新'))
							])
						])
					]),
					E('div', { 'class': 'alert-message info', 'style': 'margin-top: 10px;' }, [
						E('h4', {}, _('日志文件为空')),
						E('p', {}, _('暂无通知记录。当有新短信、来电或信号变化时，将自动记录到此处。'))
					])
				])
			);
		} else {
			var nlines = notif.content.trim().split('\n').reverse();
			var lineCount = nlines.length;
			
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'cbi-section-node' }, [
						E('div', { 'class': 'cbi-value' }, [
							E('label', { 'class': 'cbi-value-title' }, _('日志路径')),
							E('div', { 'class': 'cbi-value-field' }, [ 
								E('code', {}, notif.path),
								'   ',
								E('button', {
									'class': 'btn cbi-button-apply',
									'click': ui.createHandlerFn(this, 'handleRefreshLog')
								}, _('刷新')),
								' ',
								E('button', {
									'class': 'btn cbi-button-reset',
									'click': ui.createHandlerFn(this, 'handleClearLog')
								}, _('清空日志'))
							])
						]),
						E('div', { 'class': 'cbi-value' }, [
							E('label', { 'class': 'cbi-value-title' }, _('日志统计')),
							E('div', { 'class': 'cbi-value-field' }, [
								E('span', {}, _('共 %d 条通知记录 (最新 300 条)').format(lineCount))
							])
						])
					])
				])
			);
			
			// 日志内容显示区
			view.appendChild(
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'cbi-section-node' }, [
						E('pre', {
							'style': notifStyle
						}, nlines.join('\n'))
					])
				])
			);
		}

		return view;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
