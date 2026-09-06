import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LocaleProvider } from '@douyinfe/semi-ui';
import zh_CN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN';
import AppLayout from '@/layout/AppLayout';
import NetworkInfo from '@/pages/network/Info';
import NetworkSettings from '@/pages/network/Settings';
import NetworkDial from '@/pages/network/Dial';
import SystemInfo from '@/pages/system/Info';
import SystemUpgrade from '@/pages/system/Upgrade';
import SMSCenter from '@/pages/sms/Center';
import SMSSettings from '@/pages/sms/Settings';
import ATTerminal from '@/pages/at/Terminal';

const App: React.FC = () => {
  return (
    <LocaleProvider locale={zh_CN}>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/network/info" replace />} />
            <Route path="/network/info" element={<NetworkInfo />} />
            <Route path="/network/setting" element={<NetworkSettings />} />
            <Route path="/network/dial" element={<NetworkDial />} />
            <Route path="/system/info" element={<SystemInfo />} />
            <Route path="/system/upgrade" element={<SystemUpgrade />} />
            <Route path="/sms/center" element={<SMSCenter />} />
            <Route path="/sms/settings" element={<SMSSettings />} />
            <Route path="/at" element={<ATTerminal />} />
            <Route path="*" element={<Navigate to="/network/info" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </LocaleProvider>
  );
};

export default App;
