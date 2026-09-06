import React, { useCallback, useRef, useState } from 'react';
import {
  Banner,
  Button,
  Input,
  Modal,
  Progress,
  Radio,
  RadioGroup,
  Space,
  Switch,
  Toast,
  Typography,
} from '@douyinfe/semi-ui';
import { IconDownload, IconUpload, IconDelete } from '@douyinfe/semi-icons';
import { ATService } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import { getCachedSentMessages, setCachedSentMessages, clearSentMessageCache } from '@/modem/sms';
import { sleep } from '@/modem/atx';
import { Field, PageCard, RefreshBtn } from '@/ui/widgets';
import { UssdPanel } from './UssdPanel';

const at = () => ATService.getInstance();

interface StorageConfig {
  read: string;
  write: string;
  receive: string;
  readUsed: number;
  readTotal: number;
  writeUsed: number;
  writeTotal: number;
  receiveUsed: number;
  receiveTotal: number;
}

const storageBar = (label: string, used: number, total: number) => {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const danger = total > 0 && used / total > 0.9;
  return (
    <div className="storage-usage-row">
      <div className="storage-usage-head">
        <Typography.Text size="small">{label}</Typography.Text>
        <Typography.Text type="tertiary" size="small">
          已使用 {used}/{total}
        </Typography.Text>
      </div>
      <Progress
        percent={pct}
        showInfo={false}
        size="small"
        stroke={danger ? 'var(--semi-color-danger)' : undefined}
      />
    </div>
  );
};

const SMSSettings: React.FC = () => {
  const [imsOn, setImsOn] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [centerNumber, setCenterNumber] = useState('');
  const [centerLoading, setCenterLoading] = useState(false);
  const [storage, setStorage] = useState<StorageConfig>({
    read: 'SM',
    write: 'SM',
    receive: 'SM',
    readUsed: 0,
    readTotal: 0,
    writeUsed: 0,
    writeTotal: 0,
    receiveUsed: 0,
    receiveTotal: 0,
  });
  const [storageLoading, setStorageLoading] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);
  const [clearingAll, setClearingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshCacheCount = useCallback(() => {
    setCacheCount(getCachedSentMessages().length);
  }, []);

  const loadIMS = useCallback(async () => {
    setSmsLoading(true);
    try {
      const res = await at().sendCommand('AT^IMSSWITCH?');
      if (res.success && typeof res.data === 'string') {
        const m = res.data.match(/\^IMSSWITCH:\s*(\d+),\d+,\d+/);
        if (m) {
          const on = m[1] === '1';
          setImsOn(on);
          if (on) {
            const csca = await at().sendCommand('AT+CSCA?');
            if (csca.success && typeof csca.data === 'string') {
              const cm = csca.data.match(/\+CSCA: "([^"]+)"/);
              if (cm) setCenterNumber(cm[1]);
            }
          }
        }
      }
    } catch {
      Toast.error('获取短信功能状态失败');
    } finally {
      setSmsLoading(false);
    }
  }, []);

  const loadStorage = useCallback(async () => {
    setStorageLoading(true);
    try {
      await at().sendCommand('AT+CMGF=0');
      const res = await at().sendCommand('AT+CPMS?');
      if (res.success && typeof res.data === 'string') {
        const m = res.data.match(
          /\+CPMS: "(\w+)",(\d+),(\d+),"(\w+)",(\d+),(\d+),"(\w+)",(\d+),(\d+)/,
        );
        if (m) {
          setStorage({
            read: m[1],
            readUsed: parseInt(m[2], 10),
            readTotal: parseInt(m[3], 10),
            write: m[4],
            writeUsed: parseInt(m[5], 10),
            writeTotal: parseInt(m[6], 10),
            receive: m[7],
            receiveUsed: parseInt(m[8], 10),
            receiveTotal: parseInt(m[9], 10),
          });
        }
      }
    } catch {
      Toast.error('获取存储配置失败');
    } finally {
      setStorageLoading(false);
    }
  }, []);

  const onReady = useCallback(() => {
    refreshCacheCount();
    loadIMS();
    loadStorage();
  }, [refreshCacheCount, loadIMS, loadStorage]);

  useATReady(onReady);

  const toggleSMS = async (enable: boolean) => {
    setSmsLoading(true);
    const steps: Array<[string, number, string]> = enable
      ? [
          ['AT+CFUN=0', 2000, '正在开启飞行模式...'],
          [
            'AT+CGDCONT=5,"IPV4V6","ims","",0,0,0,0,1,1,1,,,,,,0,,0,0,0,0',
            0,
            '正在配置IMS参数...',
          ],
          ['AT+CEUS=0', 1000, '正在设置EPS服务...'],
          ['AT^IMSSWITCH=1,0,0', 1000, '正在开启IMS功能...'],
          ['AT+CFUN=1', 2000, '正在关闭飞行模式...'],
        ]
      : [
          ['AT+CFUN=0', 2000, '正在开启飞行模式...'],
          [
            'AT+CGDCONT=5,"IPV4V6","","",0,0,0,0,1,1,1,,,,,,0,,0,0,0,0',
            0,
            '正在清除IMS参数...',
          ],
          ['AT+CEUS=1', 1000, '正在关闭EPS服务...'],
          ['AT^IMSSWITCH=0,0,0', 1000, '正在关闭IMS功能...'],
          ['AT+CFUN=1', 2000, '正在关闭飞行模式...'],
        ];
    try {
      for (const [cmd, delay, step] of steps) {
        Toast.info(step);
        const res = await at().sendCommand(cmd);
        if (!res.success) throw new Error(`${enable ? '开启' : '关闭'}短信功能失败`);
        if (delay > 0) await sleep(delay);
      }
      setImsOn(enable);
      if (enable) {
        const csca = await at().sendCommand('AT+CSCA?');
        if (csca.success && typeof csca.data === 'string') {
          const m = csca.data.match(/\+CSCA: "([^"]+)"/);
          if (m) setCenterNumber(m[1]);
        }
      }
      Toast.success(`短信功能已${enable ? '开启' : '关闭'}`);
    } catch (e) {
      setImsOn(!enable);
      Toast.error(e instanceof Error ? e.message : '操作失败');
    } finally {
      setSmsLoading(false);
    }
  };

  const handleCenterSave = async () => {
    const num = centerNumber.trim();
    if (!num) {
      Toast.warning('请输入短信中心号码');
      return;
    }
    setCenterLoading(true);
    try {
      const res = await at().sendCommand(`AT+CSCA="${num}"`);
      if (!res.success) throw new Error('设置短信中心号码失败');
      Toast.success('短信中心号码设置成功');
    } catch {
      Toast.error('设置保存失败');
    } finally {
      setCenterLoading(false);
    }
  };

  const handleStorageLocationChange = (value: string) => {
    setStorage((prev) => ({ ...prev, read: value, write: value, receive: value }));
  };

  const handleStorageSave = async () => {
    setStorageLoading(true);
    try {
      const res = await at().sendCommand(
        `AT+CPMS="${storage.read}","${storage.write}","${storage.receive}"`,
      );
      if (!res.success) throw new Error('设置存储配置失败');
      Toast.success('存储配置已更新');
      await loadStorage();
    } catch {
      Toast.error('存储配置更新失败');
    } finally {
      setStorageLoading(false);
    }
  };

  const exportCache = () => {
    const messages = getCachedSentMessages();
    if (messages.length === 0) {
      Toast.warning('没有缓存的发送消息可以导出');
      return;
    }
    const exportData = {
      exportTime: new Date().toISOString(),
      version: '1.0',
      messageCount: messages.length,
      messages,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sms_cache_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    Toast.success(`成功导出 ${messages.length} 条发送消息`);
  };

  const importCache = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (!data.messages || !Array.isArray(data.messages)) {
          Toast.error('导入文件格式不正确');
          return;
        }
        const valid = data.messages.filter(
          (m: any) =>
            m &&
            typeof m.content === 'string' &&
            typeof m.number === 'string' &&
            typeof m.time === 'string' &&
            m.type === 'sent',
        );
        if (valid.length === 0) {
          Toast.error('导入文件中没有有效的发送消息');
          return;
        }
        Modal.confirm({
          title: '确认导入',
          content: `确定要导入 ${valid.length} 条发送消息吗？这将覆盖现有的本地缓存。`,
          okText: '导入',
          cancelText: '取消',
          okButtonProps: { theme: 'solid', type: 'primary' },
          onOk: () => {
            setCachedSentMessages(valid);
            refreshCacheCount();
            Toast.success(`成功导入 ${valid.length} 条发送消息`);
          },
        });
      } catch {
        Toast.error('导入文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  const clearCache = () => {
    const count = getCachedSentMessages().length;
    if (count === 0) {
      Toast.warning('没有缓存的发送消息可以清空');
      return;
    }
    Modal.confirm({
      title: '确认清空缓存',
      content: `确定要清空本地发送消息缓存吗？这将删除 ${count} 条发送消息记录，此操作无法撤销。`,
      okText: '清空',
      cancelText: '取消',
      okButtonProps: { theme: 'solid', type: 'danger' },
      onOk: () => {
        clearSentMessageCache();
        refreshCacheCount();
        Toast.success('本地缓存已清空');
      },
    });
  };

  const clearAllSMS = () => {
    Modal.confirm({
      title: '确认清空所有短信',
      content: (
        <div>
          <p>确定要清空设备上的所有短信吗？</p>
          <p style={{ color: 'var(--semi-color-danger)', fontWeight: 600 }}>
            此操作将删除设备上存储的所有短信（包括已读和未读），此操作无法撤销！
          </p>
        </div>
      ),
      okText: '确认清空',
      cancelText: '取消',
      okButtonProps: { theme: 'solid', type: 'danger' },
      onOk: async () => {
        setClearingAll(true);
        try {
          Toast.info('正在清空所有短信，请稍候...');
          const cpms = await at().sendCommand('AT+CPMS?');
          if (!cpms.success || typeof cpms.data !== 'string') throw new Error('获取存储配置失败');
          const m = cpms.data.match(
            /\+CPMS: "(\w+)",(\d+),(\d+),"(\w+)",(\d+),(\d+),"(\w+)",(\d+),(\d+)/,
          );
          if (!m) throw new Error('解析存储配置失败');
          const storages = [m[1], m[4], m[7]].filter((v, i, arr) => arr.indexOf(v) === i);
          for (const storageName of storages) {
            await at().sendCommand('AT+CMGF=0');
            await sleep(500);
            await at().sendCommand(`AT+CPMS="${storageName}","${storageName}","${storageName}"`);
            await sleep(500);
            const del = await at().sendCommand('AT+CMGD=1,4');
            if (!del.success) throw new Error(del.error || '删除短信失败');
            await sleep(1000);
          }
          clearSentMessageCache();
          refreshCacheCount();
          await loadStorage();
          Toast.success('所有短信已清空');
        } catch (e) {
          Toast.error('清空所有短信失败：' + (e instanceof Error ? e.message : '未知错误'));
        } finally {
          setClearingAll(false);
        }
      },
    });
  };

  return (
    <div className="page-stack">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importCache(file);
          e.target.value = '';
        }}
      />

      <PageCard
        title="短信功能"
        extra={<RefreshBtn onClick={loadIMS} loading={smsLoading} />}
      >
        <Field
          label="短信开关"
          hint="开启/关闭 IMS 短信功能。切换过程会自动进入飞行模式并执行多步配置，请勿断电或执行其他操作。"
        >
          <Space>
            <Switch checked={imsOn} onChange={(v) => toggleSMS(v)} loading={smsLoading} />
            <Typography.Text>{imsOn ? '已开启' : '已关闭'}</Typography.Text>
          </Space>
        </Field>
      </PageCard>

      <PageCard
        title="短信中心号码"
        extra={<RefreshBtn onClick={loadIMS} loading={smsLoading} />}
      >
        <Field label="短信中心号码" hint={!imsOn ? '（请先开启短信功能）' : undefined}>
          <Space style={{ width: '100%', maxWidth: 480 }}>
            <Input
              value={centerNumber}
              onChange={setCenterNumber}
              placeholder="请输入短信中心号码"
              disabled={!imsOn}
              style={{ flex: 1 }}
            />
            <Button
              theme="solid"
              type="primary"
              onClick={handleCenterSave}
              loading={centerLoading}
              disabled={!imsOn}
            >
              保存
            </Button>
          </Space>
        </Field>
      </PageCard>

      <PageCard
        title="存储配置"
        extra={<RefreshBtn onClick={loadStorage} loading={storageLoading} />}
      >
        <Field label="存储位置">
          <RadioGroup
            value={storage.read}
            onChange={(e) => handleStorageLocationChange(e.target.value)}
          >
            <Radio value="SM">SIM卡</Radio>
            <Radio value="ME">模组</Radio>
          </RadioGroup>
        </Field>
        <div className="storage-usage" style={{ marginTop: 8 }}>
          {storageBar('读取存储', storage.readUsed, storage.readTotal)}
          {storageBar('写入存储', storage.writeUsed, storage.writeTotal)}
          {storageBar('接收存储', storage.receiveUsed, storage.receiveTotal)}
        </div>
        <div className="card-actions" style={{ marginTop: 8 }}>
          <Button theme="solid" type="primary" onClick={handleStorageSave} loading={storageLoading}>
            保存存储设置
          </Button>
        </div>
      </PageCard>

      <PageCard
        title="本地发送缓存"
        extra={<RefreshBtn onClick={refreshCacheCount} label="查看状态" />}
      >
        <div className="form-stack">
          <Space>
            <Typography.Text>发送消息缓存：</Typography.Text>
            <Typography.Text strong>{cacheCount} 条消息</Typography.Text>
          </Space>
          <Typography.Text type="tertiary" size="small">
            本地缓存用于保存发送的短信记录，即使刷新页面也能继续显示发送历史。
          </Typography.Text>
          <div className="action-row">
            <Button icon={<IconDownload />} onClick={exportCache} disabled={cacheCount === 0}>
              导出缓存
            </Button>
            <Button icon={<IconUpload />} onClick={() => fileInputRef.current?.click()}>
              导入缓存
            </Button>
            <Button
              type="danger"
              theme="light"
              icon={<IconDelete />}
              onClick={clearCache}
              disabled={cacheCount === 0}
            >
              清空缓存
            </Button>
          </div>
        </div>
      </PageCard>

      <UssdPanel />

      <PageCard title="清空设备短信">
        <Banner
          type="danger"
          closeIcon={null}
          description="此操作将删除设备上存储的所有短信（包括已读和未读），请谨慎使用。"
        />
        <Space style={{ marginTop: 12 }}>
          <Button
            type="danger"
            theme="solid"
            icon={<IconDelete />}
            onClick={clearAllSMS}
            loading={clearingAll}
            disabled={!imsOn}
          >
            清空所有短信
          </Button>
          {!imsOn && (
            <Typography.Text type="tertiary" size="small">
              （请先开启短信功能）
            </Typography.Text>
          )}
        </Space>
      </PageCard>
    </div>
  );
};

export default SMSSettings;
