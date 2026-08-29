import React, { useState } from 'react';
import { Banner, Button, Input, Modal, Progress, Steps, Toast, Typography } from '@douyinfe/semi-ui';
import { ATService } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { extractATData } from '@/modem/parse';
import { PageCard, Panel, RefreshBtn } from '@/ui/widgets';

const at = () => ATService.getInstance();

const SystemUpgrade: React.FC = () => {
  const isNarrow = useMediaQuery('(max-width: 520px)');
  const [agreed, setAgreed] = useState(false);
  const [showAgree, setShowAgree] = useState(true);
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState('');
  const [fotaState, setFotaState] = useState(10);

  const fetchVersion = async () => {
    setLoading(true);
    try {
      const res = await at().sendCommand('AT+CGMR');
      if (res.success && typeof res.data === 'string') {
        const lines = res.data
          .replace(/\r/g, '')
          .split('\n')
          .map((s) => s.trim())
          .filter((l) => l && l.toUpperCase() !== 'OK' && !/^AT\+CGMR/i.test(l));
        setVersion(lines[0] || res.data.trim());
      }
    } catch {
      Toast.error('获取版本失败');
    } finally {
      setLoading(false);
    }
  };

  useATReady(fetchVersion);

  const queryState = async () => {
    const res = await at().sendCommand('AT^FOTASTATE?');
    if (res.success && typeof res.data === 'string') {
      const raw = extractATData(res.data, '^FOTASTATE') || res.data.split(':')[1];
      const state = parseInt(String(raw).trim(), 10);
      if (!Number.isNaN(state)) {
        setFotaState(state);
        return state;
      }
    }
    return null;
  };

  const start = async () => {
    if (!url) {
      Toast.error('请设置 FOTA 服务器地址');
      return;
    }
    if (!url.startsWith('http://')) {
      Toast.error('仅支持 http 协议');
      return;
    }
    const formatted = url.endsWith('/') ? url : `${url}/`;
    setUpgrading(true);
    setProgress(0);
    setStep(1);
    try {
      await at().sendCommand('ATE0');
      await at().sendCommand('AT^FOTAMODE=0,1,0,1');
      setStep(2);
      const setUrl = await at().sendCommand(`AT^FOTAOEMDL="${formatted}"`);
      if (!setUrl.success) {
        Toast.error('设置 FOTA 地址失败');
        setUpgrading(false);
        setStep(0);
        return;
      }
      const timer = window.setInterval(async () => {
        const state = await queryState();
        switch (state) {
          case 11:
            Toast.info('正在查询新版本...');
            break;
          case 12:
            Toast.info('发现新版本');
            break;
          case 13:
            window.clearInterval(timer);
            Toast.error('查询新版本失败');
            setUpgrading(false);
            setStep(0);
            break;
          case 14:
            window.clearInterval(timer);
            Toast.error('服务器无新版本');
            setUpgrading(false);
            setStep(0);
            break;
          case 20:
            window.clearInterval(timer);
            Toast.error('固件下载失败');
            setUpgrading(false);
            setStep(0);
            break;
          case 30: {
            const dl = await at().sendCommand('AT^FOTADLQ');
            if (dl.success && typeof dl.data === 'string') {
              const nums = dl.data
                .replace(/\r|\n/g, '')
                .split(',')
                .map((s) => s.replace(/[^0-9]/g, ''))
                .filter(Boolean)
                .map((s) => parseInt(s, 10));
              if (nums.length >= 2) {
                const total = nums[nums.length - 2];
                const downloaded = nums[nums.length - 1];
                if (total > 0) setProgress(Math.max(0, Math.min(100, Math.floor((downloaded / total) * 100))));
              }
            }
            break;
          }
          case 31:
            Toast.info('下载挂起，尝试续传');
            await at().sendCommand('AT^FOTADL=1');
            break;
          case 40:
            window.clearInterval(timer);
            Toast.success('固件下载完成');
            setStep(3);
            await at().sendCommand('AT^FWUP');
            Toast.success('固件升级已开始，设备即将重启');
            setStep(4);
            setUpgrading(false);
            break;
          case 50:
            Toast.info('正在准备升级...');
            break;
          default:
            break;
        }
      }, 1000);
    } catch {
      Toast.error('固件升级失败');
      setUpgrading(false);
      setStep(0);
    }
  };

  return (
    <>
      <Modal
        title="免责声明"
        visible={!agreed && showAgree}
        okText="同意并继续"
        cancelText="不同意"
        onOk={() => {
          setAgreed(true);
          setShowAgree(false);
        }}
        onCancel={() => setShowAgree(false)}
      >
        <Typography.Title heading={6}>固件升级免责声明</Typography.Title>
        <ol className="agree-list">
          <li>升级过程中请确保供电稳定，切勿断电。</li>
          <li>升级过程中请勿进行其他操作。</li>
          <li>完成后设备将自动重启，请耐心等待。</li>
          <li>操作不当可能导致设备无法正常使用。</li>
          <li>升级前请备份重要数据。</li>
        </ol>
      </Modal>

      {agreed ? (
        <PageCard title="系统升级">
          <div className="form-stack">
            <Panel title="当前版本" extra={<RefreshBtn onClick={fetchVersion} loading={loading} />}>
              <Typography.Text className="mono">{version || '未知'}</Typography.Text>
            </Panel>

            <Panel title="升级步骤">
              <Steps
                className="upgrade-steps"
                current={step}
                type="basic"
                size="small"
                direction={isNarrow ? 'vertical' : 'horizontal'}
              >
                <Steps.Step title="准备" description="设置升级参数" />
                <Steps.Step title="初始化" description="初始化 FOTA" />
                <Steps.Step title="下载" description="下载固件" />
                <Steps.Step title="升级" description="执行升级" />
                <Steps.Step title="完成" description="升级完成" />
              </Steps>
            </Panel>

            {step === 0 ? (
              <Panel title="升级参数">
                <div className="form-stack">
                  <Input
                    prefix="FOTA"
                    value={url}
                    onChange={setUrl}
                    placeholder="http://fota.example.com/path/"
                  />
                  <Typography.Text type="tertiary">仅支持 http 协议</Typography.Text>
                  <div className="action-row">
                    <Button theme="solid" type="primary" loading={upgrading} onClick={start}>
                      开始升级
                    </Button>
                  </div>
                </div>
              </Panel>
            ) : null}

            {(step === 2 || step === 3) && (
              <Panel title="下载进度">
                <Progress percent={progress} showInfo format={(p) => `${p}%${fotaState === 50 ? ' (正在升级...)' : ''}`} />
              </Panel>
            )}

            {upgrading ? (
              <Banner type="warning" closeIcon={null} description="升级过程中请勿断电或执行其他操作，完成后设备将自动重启。" />
            ) : null}
          </div>
        </PageCard>
      ) : (
        <PageCard title="系统升级">
          <div className="form-stack">
            <Banner type="info" closeIcon={null} description="请先阅读并同意免责声明后再进行固件升级。" />
            <div className="action-row">
              <Button onClick={() => setShowAgree(true)}>
                查看免责声明
              </Button>
            </div>
          </div>
        </PageCard>
      )}
    </>
  );
};

export default SystemUpgrade;
