import React, { useEffect, useRef, useState } from 'react';
import { Modal, Input, Checkbox, Banner, Button, Space, Typography } from '@douyinfe/semi-ui';
import { IconLock, IconShield } from '@douyinfe/semi-icons';

interface AuthKeyModalProps {
  visible: boolean;
  loading?: boolean;
  onSubmit: (authKey: string, rememberDays: number) => void;
  onCancel?: () => void;
}

const AuthKeyModal: React.FC<AuthKeyModalProps> = ({ visible, loading, onSubmit, onCancel }) => {
  const [authKey, setAuthKey] = useState('');
  const [remember, setRemember] = useState(true);
  const [rememberDays, setRememberDays] = useState(1);
  const lastLoadingRef = useRef(false);

  useEffect(() => {
    if (lastLoadingRef.current && !loading && visible) {
      setAuthKey('');
    }
    lastLoadingRef.current = !!loading;
  }, [loading, visible]);

  useEffect(() => {
    if (!visible) {
      setAuthKey('');
      setRemember(true);
      setRememberDays(1);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!authKey.trim()) return;
    onSubmit(authKey, remember ? rememberDays : 0);
  };

  return (
    <Modal
      visible={visible}
      title={null}
      footer={null}
      closable={false}
      maskClosable={false}
      width={440}
      centered
      maskStyle={{ backdropFilter: 'blur(10px)', background: 'var(--semi-color-overlay-bg)' }}
    >
      <div style={{ textAlign: 'center', paddingTop: 8, marginBottom: 16 }}>
        <IconShield size="extra-large" style={{ color: 'var(--semi-color-primary)', fontSize: 40 }} />
        <Typography.Title heading={5} style={{ marginTop: 12 }}>
          密钥验证
        </Typography.Title>
        <Typography.Text type="tertiary">服务器需要密钥验证，请输入访问密钥</Typography.Text>
      </div>
      <Space vertical style={{ width: '100%' }} spacing={14}>
        <Input
          size="large"
          mode="password"
          prefix={<IconLock />}
          placeholder="请输入访问密钥"
          value={authKey}
          onChange={setAuthKey}
          onEnterPress={handleSubmit}
          disabled={loading}
          maxLength={256}
          autoFocus
        />
        <div>
          <Checkbox checked={remember} onChange={(e) => setRemember(!!e.target.checked)} disabled={loading}>
            记住密钥
          </Checkbox>
          {remember && (
            <div style={{ marginTop: 8, marginLeft: 24, display: 'flex', gap: 8 }}>
              {[1, 7, 30].map((days) => (
                <Button
                  key={days}
                  size="small"
                  theme={rememberDays === days ? 'solid' : 'light'}
                  type={rememberDays === days ? 'primary' : 'tertiary'}
                  onClick={() => setRememberDays(days)}
                >
                  {days}天
                </Button>
              ))}
            </div>
          )}
        </div>
        <Banner
          type="info"
          closeIcon={null}
          description="密钥将加密存储在本地浏览器，过期后需要重新输入"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
          <Button onClick={onCancel} disabled={loading}>
            取消
          </Button>
          <Button
            theme="solid"
            type="primary"
            loading={loading}
            disabled={!authKey.trim() || loading}
            onClick={handleSubmit}
          >
            {loading ? '验证中...' : '确认'}
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default AuthKeyModal;
