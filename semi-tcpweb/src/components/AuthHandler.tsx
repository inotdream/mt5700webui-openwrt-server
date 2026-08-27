import React, { useEffect, useState } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import { ATService, AUTH_REQUIRED_ERROR } from '@/services/at';
import AuthKeyModal from './AuthKeyModal';

const AuthHandler: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const atService = ATService.getInstance();

  useEffect(() => {
    const timer = setTimeout(() => {
      atService.connect().catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        if (message === 'REQUIRE_AUTH_KEY') {
          setShowModal(true);
        } else if (message.includes('认证失败') || message.includes('密钥')) {
          atService.clearAuthKey();
          Toast.warning('密钥已过期或无效，请重新输入');
          setShowModal(true);
        } else {
          console.error('连接失败:', error);
        }
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [atService]);

  // 服务端在连接后才拒绝（配置接口没报告需要密钥）时也要能补录密钥。
  useEffect(
    () =>
      atService.onConnectionStateChange((snapshot) => {
        if (snapshot.state === 'error' && snapshot.error === AUTH_REQUIRED_ERROR) {
          setShowModal(true);
        }
      }),
    [atService],
  );

  const handleAuthKeySubmit = async (authKey: string, rememberDays: number) => {
    setLoading(true);
    try {
      atService.setAuthKey(authKey, rememberDays);
      await atService.connect(authKey);
      Toast.success('密钥验证成功！');
      setShowModal(false);
    } catch (error) {
      const errorMessage = (error as Error).message || '密钥验证失败';
      if (errorMessage.includes('认证失败') || errorMessage.includes('密钥')) {
        Toast.error('密钥错误，请检查后重试');
      } else if (errorMessage.includes('超时')) {
        Toast.error('连接超时，请检查网络连接');
      } else {
        Toast.error('验证失败：' + errorMessage);
      }
      atService.clearAuthKey();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthKeyModal
      visible={showModal}
      loading={loading}
      onSubmit={handleAuthKeySubmit}
      onCancel={() => {
        void atService.disconnect();
        Toast.warning('已取消连接，部分功能可能无法使用');
        setShowModal(false);
      }}
    />
  );
};

export default AuthHandler;
