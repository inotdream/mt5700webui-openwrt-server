import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Nav, Button, Tooltip } from '@douyinfe/semi-ui';
import {
  IconWifi,
  IconSetting,
  IconComment,
  IconCode,
  IconMoon,
  IconSun,
  IconMenu,
} from '@douyinfe/semi-icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ATService, type ATConnectionSnapshot } from '@/services/at';
import { isMockModeEnabled } from '@/services/mockAT';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import AuthHandler from '@/components/AuthHandler';
import NotificationHandler from '@/components/NotificationHandler';
import SimPinHandler from '@/components/SimPinHandler';

const { Header, Sider, Content, Footer } = Layout;

const NAV_ITEMS = [
  {
    itemKey: 'network',
    text: '网络设置',
    icon: <IconWifi />,
    items: [
      { itemKey: '/network/info', text: '网络状态' },
      { itemKey: '/network/setting', text: '网络设置' },
      { itemKey: '/network/dial', text: '拨号设置' },
    ],
  },
  {
    itemKey: 'system',
    text: '系统',
    icon: <IconSetting />,
    items: [
      { itemKey: '/system/info', text: '模组设置' },
      { itemKey: '/system/upgrade', text: '模组升级' },
    ],
  },
  {
    itemKey: 'sms',
    text: '短信中心',
    icon: <IconComment />,
    items: [
      { itemKey: '/sms/center', text: '信息' },
      { itemKey: '/sms/settings', text: '设置' },
    ],
  },
  {
    itemKey: '/at',
    text: '调试工具',
    icon: <IconCode />,
  },
];

const PAGE_META: Record<string, { group: string; title: string }> = {
  '/network/info': { group: '网络设置', title: '网络状态' },
  '/network/setting': { group: '网络设置', title: '网络设置' },
  '/network/dial': { group: '网络设置', title: '拨号设置' },
  '/system/info': { group: '系统', title: '模组设置' },
  '/system/upgrade': { group: '系统', title: '模组升级' },
  '/sms/center': { group: '短信中心', title: '信息' },
  '/sms/settings': { group: '短信中心', title: '设置' },
  '/at': { group: '调试工具', title: 'AT 调试终端' },
};

const getConnectionPresentation = (snapshot: ATConnectionSnapshot) => {
  switch (snapshot.state) {
    case 'connecting':
      return {
        label: 'AT 连接中',
        compactLabel: '连接中',
        title: 'AT WebSocket 正在连接',
        tone: 'warn',
        busy: true,
      };
    case 'authenticating':
      return {
        label: 'AT 认证中',
        compactLabel: '认证中',
        title: 'AT WebSocket 正在等待或验证认证密钥',
        tone: 'warn',
        busy: true,
      };
    case 'connected':
      return {
        label: 'AT 已连接',
        compactLabel: '已连接',
        title: 'AT WebSocket 已连接',
        tone: 'ok',
        busy: false,
      };
    case 'reconnecting': {
      const attempt = `${snapshot.reconnectAttempt}/${snapshot.maxReconnectAttempts}`;
      return {
        label: `AT 重连中 ${attempt}`,
        compactLabel: `重连 ${attempt}`,
        title: `AT WebSocket 正在自动重连（${attempt}）`,
        tone: 'warn',
        busy: true,
      };
    }
    case 'error':
      return {
        label: 'AT 连接失败',
        compactLabel: '连接失败',
        title: snapshot.error ? `AT WebSocket 连接失败：${snapshot.error}` : 'AT WebSocket 连接失败',
        tone: 'err',
        busy: false,
      };
    case 'idle':
    case 'disconnected':
    default:
      return {
        label: 'AT 未连接',
        compactLabel: '未连接',
        title: 'AT WebSocket 未连接',
        tone: 'err',
        busy: false,
      };
  }
};

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    const isDark = saved === 'dark' || document.body.getAttribute('theme-mode') === 'dark';
    if (isDark) document.body.setAttribute('theme-mode', 'dark');
    else document.body.removeAttribute('theme-mode');
    return isDark;
  });
  const atService = ATService.getInstance();
  const [connection, setConnection] = useState<ATConnectionSnapshot>(() =>
    atService.getConnectionSnapshot(),
  );

  const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);
  const page = PAGE_META[location.pathname] || { group: '5G CPE', title: '设备管理' };
  const siderWidth = isMobile ? 240 : 236;
  const connectionView =
    isMockModeEnabled() && connection.state === 'connected'
      ? {
          label: 'Mock 已连接',
          compactLabel: 'Mock',
          title: '当前为本地演示数据模式，不会连接真实模组',
          tone: 'ok',
          busy: false,
        }
      : getConnectionPresentation(connection);

  useEffect(
    () => atService.onConnectionStateChange(setConnection),
    [atService],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.body.setAttribute('theme-mode', 'dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.body.removeAttribute('theme-mode');
      localStorage.setItem('theme-mode', 'light');
    }
  };

  const toggleNavigation = () => {
    setMobileOpen((value) => !value);
  };

  return (
    <Layout className="app-shell">
      <Sider
        className={[
          'app-sider',
          isMobile ? 'app-sider--mobile' : '',
          isMobile && mobileOpen ? 'app-sider--open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ width: siderWidth }}
      >
        <div className="app-brand">
          <div className="app-brand-mark">
            <img src="/5700/logo.svg" alt="MT5700" />
          </div>
          <div className="app-brand-copy">
            <div className="app-brand-title">MT5700M-CN</div>
            <div className="app-brand-sub">5G CPE · V3.0.0</div>
          </div>
        </div>
        <Nav
          style={{ maxWidth: siderWidth, height: 'calc(100vh - 76px)' }}
          items={NAV_ITEMS}
          selectedKeys={selectedKeys}
          openKeys={['network', 'system', 'sms']}
          isCollapsed={false}
          onSelect={(data) => {
            const key = String(data.itemKey);
            if (key.startsWith('/')) {
              navigate(key);
              setMobileOpen(false);
            }
          }}
        />
      </Sider>

      {isMobile && mobileOpen ? (
        <div className="app-scrim" aria-hidden="true" onClick={() => setMobileOpen(false)} />
      ) : null}

      <Layout>
        <Header className="app-header">
          <div className="app-header-left">
            {isMobile ? (
              <Button
                className="app-icon-button"
                theme="borderless"
                icon={<IconMenu />}
                onClick={toggleNavigation}
                aria-label={mobileOpen ? '关闭导航' : '打开导航'}
              />
            ) : null}
            <div className="app-header-title">
              <div className="app-header-eyebrow">{page.group}</div>
              <div className="app-header-name">{page.title}</div>
            </div>
          </div>
          <div className="app-header-right">
            <span
              className={`at-status at-status--${connection.state}`}
              title={connectionView.title}
              role="status"
              aria-live="polite"
              aria-label={connectionView.title}
            >
              <span
                className={`status-dot ${connectionView.tone}${connectionView.busy ? ' busy' : ''}`}
                aria-hidden="true"
              />
              <span className="at-status-label at-status-label--full" aria-hidden="true">
                {connectionView.label}
              </span>
              <span className="at-status-label at-status-label--compact" aria-hidden="true">
                {connectionView.compactLabel}
              </span>
            </span>
            <Tooltip content={dark ? '切换浅色' : '切换深色'}>
              <Button
                className="app-icon-button"
                theme="borderless"
                icon={dark ? <IconSun /> : <IconMoon />}
                onClick={toggleTheme}
                aria-label="切换主题"
              />
            </Tooltip>
          </div>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
        <Footer className="app-footer">MT5700M-CN · 5G CPE Management · V3.0.0</Footer>
      </Layout>
      <AuthHandler />
      <NotificationHandler />
      <SimPinHandler />
    </Layout>
  );
};

export default AppLayout;
