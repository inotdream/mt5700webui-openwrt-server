import React, { useMemo, useRef, useState } from 'react';
import {
  Banner,
  Button,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Toast,
  Typography,
} from '@douyinfe/semi-ui';
import { ATService } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { sleep } from '@/modem/atx';
import { ConfigSelect, Field, PageCard, RefreshBtn, SectionHeader, TwoCol } from '@/ui/widgets';

const at = () => ATService.getInstance();

type DialSettings = {
  enable: number;
  dialMode?: number;
  protocol: string;
  apn: string;
  username: string;
  password: string;
  authType: number;
  usbMode?: number;
  infcfgMode?: number;
  postRoute?: number;
};

type PDPContext = {
  cid: number;
  type: string;
  apn: string;
  pdp_addr?: string;
  active?: boolean;
};

const DIAL_MODE_OPTIONS = [
  { label: 'USB网络接口', value: 1 },
  { label: '转网口模式', value: 2 },
];

const USB_MODE_OPTIONS = [
  { label: 'Linux-ECM正常模式', value: 0 },
  { label: 'Windows-NCM正常模式', value: 1 },
  { label: 'Linux-ECM调试模式', value: 2 },
  { label: 'Windows-NCM调试模式', value: 3 },
  { label: 'Linux-NCM正常模式', value: 4 },
  { label: 'Linux-NCM调试模式', value: 5 },
  { label: 'Windows-RNDIS单端口模式', value: 6 },
  { label: 'Windows/Linux-PPP端口模式', value: 8 },
];

const INCFG_MODE_OPTIONS = [
  { label: 'USB Stick + 网口 E5 数传模式', value: 1 },
  { label: 'USB E5 + 网口 E5 数传模式', value: 2 },
  { label: '网口直通模式(需执行拨号命令)', value: 3 },
];

const POST_ROUTE_OPTIONS = [
  { label: '关闭后路由', value: 0 },
  { label: '开启后路由', value: 1 },
];

const AUTH_OPTIONS = [
  { label: '无认证', value: 0 },
  { label: 'PAP 认证', value: 1 },
  { label: 'CHAP 认证', value: 2 },
];

const PDP_TYPE_OPTIONS = [
  { label: 'IPv4', value: 'IP' },
  { label: 'IPv6', value: 'IPV6' },
  { label: 'IPv4/IPv6', value: 'IPV4V6' },
];

const getDialModeText = (mode?: number) => {
  const map: Record<number, string> = { 1: 'USB网络接口', 2: '转网口模式' };
  return mode == null ? '未识别' : map[mode] || '未知';
};

const parseAutoDialResponse = (raw: string): Partial<DialSettings> | null => {
  const line = raw
    .replace(/\r/g, '')
    .split('\n')
    .map((item) => item.trim())
    .find((item) => item.startsWith('^SETAUTODIAL:'));
  if (!line) return null;

  const payload = line.slice(line.indexOf(':') + 1).trim();
  const fields = payload.match(/(?:[^,"]+|"[^"]*")+/g)?.map((field) =>
    field.trim().replace(/^"|"$/g, ''),
  );
  if (!fields?.length || !/^\d+$/.test(fields[0])) return null;

  const parsed: Partial<DialSettings> = { enable: Number(fields[0]) };
  if (fields.length >= 2 && /^\d+$/.test(fields[1])) parsed.dialMode = Number(fields[1]);
  if (fields.length >= 3) parsed.protocol = fields[2] || '';
  if (fields.length >= 4) parsed.apn = fields[3] || '';
  if (fields.length >= 5) parsed.username = fields[4] || '';
  if (fields.length >= 6) parsed.password = fields[5] || '';
  if (fields.length >= 7 && /^\d+$/.test(fields[6])) parsed.authType = Number(fields[6]);
  return parsed;
};

const ndisIsActive = (raw: string) =>
  /\^NDISSTATQRY:\s*1\s*,/i.test(raw.replace(/\r/g, ''));

const getUSBModeText = (mode: number) => {
  const map: Record<number, string> = {
    0: 'Linux-ECM正常模式',
    1: 'Windows-NCM正常模式',
    2: 'Linux-ECM调试模式',
    3: 'Windows-NCM调试模式',
    4: 'Linux-NCM正常模式',
    5: 'Linux-NCM调试模式',
    6: 'Windows-RNDIS单端口模式',
    7: 'Windows-MBIM单端口模式(暂不支持)',
    8: 'Windows/Linux-PPP端口模式',
  };
  return map[mode] || '未知模式';
};

const getInfcfgModeText = (mode?: number) => {
  if (mode === 1) return 'USB Stick + 网口 E5 数传模式';
  if (mode === 2) return 'USB E5 + 网口 E5 数传模式';
  if (mode === 3) return '网口直通模式';
  return '未配置';
};

const getAuthTypeText = (type: number) => {
  switch (type) {
    case 0:
      return '无鉴权';
    case 1:
      return 'PAP鉴权';
    case 2:
      return 'CHAP鉴权';
    default:
      return '未知';
  }
};

const getPdpTypeText = (type: string) => {
  switch (type) {
    case 'IP':
      return 'IPv4';
    case 'IPV6':
      return 'IPv6';
    case 'IPV4V6':
      return 'IPv4/IPv6';
    default:
      return type;
  }
};

const NetworkDial: React.FC = () => {
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const [loading, setLoading] = useState({
    dial: true,
    apn: false,
    usb: true,
    infcfg: true,
    dmz: false,
    pdp: true,
  });

  const [settings, setSettings] = useState<DialSettings>({
    enable: 0,
    protocol: '',
    apn: '',
    username: '',
    password: '',
    authType: 0,
  });
  const [apnForm, setApnForm] = useState({ apn: '', username: '', password: '', authType: 0 });

  // PDP 上下文
  const [pdpList, setPdpList] = useState<PDPContext[]>([]);
  const pdpActionsRef = useRef<{
    edit: (record: PDPContext) => void;
    remove: (cid: number) => void;
    toggle: (cid: number, active: boolean) => void;
  } | null>(null);
  const pdpTableData = useMemo(
    () => pdpList.map((context) => ({ ...context, key: context.cid })),
    [pdpList],
  );
  const pdpColumns = useMemo(
    () => [
      { title: 'CID', dataIndex: 'cid', width: 80 },
      {
        title: '协议类型',
        dataIndex: 'type',
        width: 120,
        render: (type: string) => getPdpTypeText(type),
      },
      {
        title: 'APN',
        dataIndex: 'apn',
        width: 180,
        render: (apn: string) => apn || '-',
      },
      {
        title: '状态',
        dataIndex: 'active',
        width: 100,
        render: (active: boolean) => (
          <Tag color={active ? 'green' : 'grey'}>{active ? '已激活' : '未激活'}</Tag>
        ),
      },
      {
        title: '操作',
        width: 280,
        render: (_value: unknown, record: PDPContext) => (
          <Space wrap>
            <Button size="small" onClick={() => pdpActionsRef.current?.edit(record)}>
              编辑
            </Button>
            <Button
              size="small"
              type="danger"
              theme="borderless"
              onClick={() => pdpActionsRef.current?.remove(record.cid)}
            >
              删除
            </Button>
            <Button
              size="small"
              onClick={() => pdpActionsRef.current?.toggle(record.cid, !record.active)}
            >
              {record.active ? '去激活' : '激活'}
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState<PDPContext | null>(null);
  const [editingCid, setEditingCid] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [pendingDeleteCid, setPendingDeleteCid] = useState<number | null>(null);

  // DMZ
  const [dmzConfig, setDmzConfig] = useState({ enabled: false, host: '' });
  const [dmzHost, setDmzHost] = useState('');
  const [dmzModal, setDmzModal] = useState(false);
  const [dmzPending, setDmzPending] = useState<{ action: 'enable' | 'disable'; ip?: string } | null>(null);

  // 拨号方式 / USB 端口模式 确认
  const [dialModeModal, setDialModeModal] = useState(false);
  const [pendingDialMode, setPendingDialMode] = useState<number | null>(null);
  const [usbModal, setUsbModal] = useState(false);
  const [pendingUSBMode, setPendingUSBMode] = useState<number | null>(null);

  const sendCmd = async (command: string) => {
    await sleep(100);
    return at().sendCommand(command);
  };

  // ---------- 1. 自动拨号 ----------
  const fetchDialSettings = async () => {
    setLoading((l) => ({ ...l, dial: true }));
    try {
      const res = await sendCmd('AT^SETAUTODIAL?');
      if (res.success && res.data) {
        const parsed = parseAutoDialResponse(String(res.data));
        if (!parsed) throw new Error('无法解析自动拨号状态');

        // MT5700 在关闭模组内置自动拨号时只返回 ^SETAUTODIAL:0，
        // 不包含数据接口字段。此时用正在工作的 NDIS 会话判断 USB 数据口，
        // 避免把 OpenWrt/QModem 的 USB 拨号错误显示成“转网口模式”。
        if (parsed.dialMode == null) {
          const ndis = await sendCmd('AT^NDISSTATQRY?');
          if (ndis.success && ndis.data && ndisIsActive(String(ndis.data))) parsed.dialMode = 1;
        }

        setSettings((prev) => ({ ...prev, ...parsed }));
        setApnForm((prev) => ({
          apn: parsed.apn ?? prev.apn,
          username: parsed.username ?? prev.username,
          password: parsed.password ?? prev.password,
          authType: parsed.authType ?? prev.authType,
        }));
      }
    } catch {
      Toast.error('获取拨号配置失败');
    } finally {
      setLoading((l) => ({ ...l, dial: false }));
    }
  };

  const handleAutoDialChange = async (checked: boolean) => {
    setLoading((l) => ({ ...l, dial: true }));
    try {
      const cmd = checked ? `AT^SETAUTODIAL=1,${settings.dialMode || 1}` : 'AT^SETAUTODIAL=0';
      const res = await sendCmd(cmd);
      if (res.success) {
        Toast.success(checked ? '已开启自动拨号' : '已关闭自动拨号');
        setSettings((prev) => ({ ...prev, enable: checked ? 1 : 0 }));
      } else {
        Toast.error('设置失败');
      }
      await fetchDialSettings();
    } catch {
      Toast.error('操作失败，请重试');
      await fetchDialSettings();
    } finally {
      setLoading((l) => ({ ...l, dial: false }));
    }
  };

  const handleApnSettingChange = async () => {
    setLoading((l) => ({ ...l, apn: true }));
    try {
      const cmd = `AT^SETAUTODIAL=${settings.enable},${settings.dialMode},"${settings.protocol}","${apnForm.apn}","${apnForm.username}","${apnForm.password}",${apnForm.authType}`;
      const res = await sendCmd(cmd);
      if (res.success) {
        Toast.success('APN 设置已更新');
        setSettings((prev) => ({
          ...prev,
          apn: apnForm.apn,
          username: apnForm.username,
          password: apnForm.password,
          authType: apnForm.authType,
        }));
        await fetchDialSettings();
      } else {
        Toast.error('设置失败');
      }
    } catch {
      Toast.error('设置失败，请重试');
    } finally {
      setLoading((l) => ({ ...l, apn: false }));
    }
  };

  // ---------- 2. 拨号方式 ----------
  const handleDialModeChange = (mode: number) => {
    if (settings.enable === 1) {
      Toast.warning('请先关闭自动拨号后再修改拨号方式');
      return;
    }
    setPendingDialMode(mode);
    setDialModeModal(true);
  };

  const handleConfirmModeChange = async () => {
    if (pendingDialMode === null) return;
    setLoading((l) => ({ ...l, dial: true }));
    try {
      const res = await sendCmd(`AT^SETAUTODIAL=1,${pendingDialMode}`);
      if (res.success) {
        Toast.success('拨号方式修改成功并已开启自动拨号');
        setSettings((prev) => ({ ...prev, dialMode: pendingDialMode, enable: 1 }));
      } else {
        Toast.error('设置失败');
      }
      await fetchDialSettings();
    } catch {
      Toast.error('设置失败，请重试');
      await fetchDialSettings();
    } finally {
      setDialModeModal(false);
      setPendingDialMode(null);
      setLoading((l) => ({ ...l, dial: false }));
    }
  };

  // ---------- 3. USB 端口模式 ----------
  const fetchUSBMode = async () => {
    setLoading((l) => ({ ...l, usb: true }));
    try {
      const res = await sendCmd('AT^SETMODE?');
      if (res.success && res.data) {
        const mode = parseInt(String(res.data).trim(), 10);
        if (!Number.isNaN(mode)) setSettings((prev) => ({ ...prev, usbMode: mode }));
      }
    } catch {
      Toast.error('获取USB模式失败');
    } finally {
      setLoading((l) => ({ ...l, usb: false }));
    }
  };

  const handleUSBModeChange = (mode: number) => {
    setPendingUSBMode(mode);
    setUsbModal(true);
  };

  const handleConfirmUSBModeChange = async () => {
    if (pendingUSBMode === null) return;
    setLoading((l) => ({ ...l, usb: true }));
    try {
      const res = await sendCmd(`AT^SETMODE=${pendingUSBMode}`);
      if (res.success) {
        Toast.success('USB端口模式设置成功，设备即将重启');
        setSettings((prev) => ({ ...prev, usbMode: pendingUSBMode }));
        await fetchUSBMode();
      } else {
        Toast.error('设置失败');
      }
    } catch {
      Toast.error('设置失败，请重试');
    } finally {
      setUsbModal(false);
      setPendingUSBMode(null);
      setLoading((l) => ({ ...l, usb: false }));
    }
  };

  // ---------- 4. 网口模式配置 + DMZ ----------
  const parseTDCFG = (raw: string) => {
    const modeMatch = raw.match(/Mode\s*:\s*(\d+)/);
    const postRouteMatch = raw.match(/PostRoute\s*:\s*(\d+)/);
    const dmzLine = raw.split('\n').find((line) => line.trim().startsWith('Dmz:'));
    const dmzValue = dmzLine ? dmzLine.split(':')[1].trim() : 'not cfg';
    return {
      mode: modeMatch ? parseInt(modeMatch[1], 10) : undefined,
      postRoute: postRouteMatch ? parseInt(postRouteMatch[1], 10) : undefined,
      dmz: { enabled: dmzValue !== 'not cfg', host: dmzValue !== 'not cfg' ? dmzValue : '' },
    };
  };

  const fetchInfcfg = async () => {
    setLoading((l) => ({ ...l, infcfg: true }));
    try {
      const res = await sendCmd('AT^TDCFG?');
      if (res.success && res.data) {
        const parsed = parseTDCFG(String(res.data));
        if (parsed.mode !== undefined) setSettings((prev) => ({ ...prev, infcfgMode: parsed.mode }));
        if (parsed.postRoute !== undefined) setSettings((prev) => ({ ...prev, postRoute: parsed.postRoute }));
        setDmzConfig(parsed.dmz);
      }
    } catch {
      Toast.error('获取网口模式配置失败');
    } finally {
      setLoading((l) => ({ ...l, infcfg: false }));
    }
  };

  const fetchDMZ = async () => {
    setLoading((l) => ({ ...l, dmz: true }));
    try {
      const res = await sendCmd('AT^TDCFG?');
      if (res.success && res.data) setDmzConfig(parseTDCFG(String(res.data)).dmz);
    } catch {
      Toast.error('获取DMZ配置失败');
    } finally {
      setLoading((l) => ({ ...l, dmz: false }));
    }
  };

  const handleInfcfgModeChange = async (mode: number) => {
    setLoading((l) => ({ ...l, infcfg: true }));
    try {
      const res = await sendCmd(`AT^TDCFG="infcfg","mode",${mode}`);
      if (res.success) {
        Toast.success('网口模式设置成功，设备需要重启生效');
        setSettings((prev) => ({ ...prev, infcfgMode: mode }));
      } else {
        Toast.error('设置失败');
      }
    } catch {
      Toast.error('设置失败，请重试');
    } finally {
      setLoading((l) => ({ ...l, infcfg: false }));
    }
  };

  const handlePostRouteChange = async (value: number) => {
    setLoading((l) => ({ ...l, infcfg: true }));
    try {
      if (value === 1) {
        const ipFilter = await sendCmd('AT^IPFILTERSWITCH=0');
        if (!ipFilter.success) throw new Error('关闭IP过滤失败');
      }
      const res = await sendCmd(`AT^TDCFG="infcfg","PostRoute",${value}`);
      if (res.success) {
        Toast.success(value === 1 ? '已开启后路由' : '已关闭后路由');
        setSettings((prev) => ({ ...prev, postRoute: value }));
      } else {
        Toast.error('设置失败');
      }
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '设置后路由失败');
    } finally {
      setLoading((l) => ({ ...l, infcfg: false }));
    }
  };

  const handleSetDMZ = () => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(dmzHost)) {
      Toast.error('请输入有效的 IP 地址');
      return;
    }
    setDmzPending({ action: 'enable', ip: dmzHost });
    setDmzModal(true);
  };

  const handleDisableDMZ = () => {
    setDmzPending({ action: 'disable' });
    setDmzModal(true);
  };

  const handleConfirmDMZ = async () => {
    if (!dmzPending) return;
    setLoading((l) => ({ ...l, dmz: true }));
    try {
      const cmd =
        dmzPending.action === 'enable'
          ? `AT^TDCFG="infcfg","dmz","${dmzPending.ip}"`
          : 'AT^TDCFG="infcfg","dmz","0"';
      const res = await sendCmd(cmd);
      if (res.success) {
        Toast.success(dmzPending.action === 'enable' ? 'DMZ配置成功，建议重新拨号以确保生效' : 'DMZ已关闭');
        await fetchDMZ();
      } else {
        Toast.error(dmzPending.action === 'enable' ? 'DMZ配置失败' : '关闭DMZ失败');
      }
    } catch {
      Toast.error(dmzPending.action === 'enable' ? 'DMZ配置失败' : '关闭DMZ失败');
    } finally {
      setDmzModal(false);
      setDmzPending(null);
      setLoading((l) => ({ ...l, dmz: false }));
    }
  };

  // ---------- 6. PDP 上下文 ----------
  const fetchPDPContexts = async () => {
    setLoading((l) => ({ ...l, pdp: true }));
    try {
      const resp1 = await sendCmd('AT+CGDCONT?');
      const resp2 = await sendCmd('AT+CGACT?');
      const list: PDPContext[] = [];
      if (resp1.data) {
        String(resp1.data)
          .split('\n')
          .forEach((line) => {
            if (!line.startsWith('+CGDCONT:')) return;
            const match = line.match(/\+CGDCONT: (\d+),"([^"]*)","([^"]*)",([^,]*),?(\d*),?(\d*)/);
            if (match) {
              list.push({ cid: Number(match[1]), type: match[2], apn: match[3], pdp_addr: match[4] || '' });
            }
          });
      }
      const actives = new Map<number, boolean>();
      if (resp2.data) {
        String(resp2.data)
          .split('\n')
          .forEach((line) => {
            const match = line.match(/\+CGACT: (\d+),(\d+)/);
            if (match) actives.set(Number(match[1]), match[2] === '1');
          });
      }
      list.forEach((ctx) => {
        ctx.active = actives.get(ctx.cid) || false;
      });
      setPdpList(list.filter((ctx) => ctx.cid !== 0 && ctx.cid < 21));
    } catch {
      Toast.error('获取PDP上下文失败');
    } finally {
      setLoading((l) => ({ ...l, pdp: false }));
    }
  };

  const openEdit = (data: PDPContext | null) => {
    if (data) {
      setEditData({ ...data });
      setEditingCid(data.cid);
    } else {
      setEditData({ cid: 1, type: 'IPV4V6', apn: '', pdp_addr: '' });
      setEditingCid(null);
    }
    setEditModal(true);
  };

  const handleSavePdp = async () => {
    if (!editData) return;
    if (!editData.cid || !editData.type) {
      Toast.error('请填写 CID 和协议类型');
      return;
    }
    if (editingCid == null && pdpList.some((ctx) => ctx.cid === editData.cid)) {
      Toast.error('CID 已存在，请选择其他 CID');
      return;
    }
    setLoading((l) => ({ ...l, pdp: true }));
    try {
      const cmd = `AT+CGDCONT=${editData.cid},"${editData.type}","${editData.apn || ''}",${editData.pdp_addr || ''},0,0`;
      const res = await sendCmd(cmd);
      if (res.success) {
        Toast.success('保存成功');
        setEditModal(false);
        await fetchPDPContexts();
      } else {
        Toast.error('保存失败');
      }
    } catch {
      Toast.error('保存失败，请重试');
    } finally {
      setLoading((l) => ({ ...l, pdp: false }));
    }
  };

  const handleDeletePdp = (cid: number) => {
    setPendingDeleteCid(cid);
    setDeleteModal(true);
  };

  const handleConfirmDeletePdp = async () => {
    if (pendingDeleteCid === null) return;
    setLoading((l) => ({ ...l, pdp: true }));
    try {
      const res = await sendCmd(`AT+CGDCONT=${pendingDeleteCid}`);
      if (res.success) {
        Toast.success('删除成功');
        await fetchPDPContexts();
      } else {
        Toast.error('删除失败');
      }
    } catch {
      Toast.error('删除失败，请重试');
    } finally {
      setDeleteModal(false);
      setPendingDeleteCid(null);
      setLoading((l) => ({ ...l, pdp: false }));
    }
  };

  const handleActivePdp = async (cid: number, active: boolean) => {
    setLoading((l) => ({ ...l, pdp: true }));
    try {
      const res = await sendCmd(`AT+CGACT=${active ? 1 : 0},${cid}`);
      if (res.success) {
        Toast.success(active ? '激活成功' : '去激活成功');
        await sleep(2000);
        await fetchPDPContexts();
      } else {
        Toast.error('操作失败');
      }
    } catch {
      Toast.error('操作失败，请重试');
    } finally {
      setLoading((l) => ({ ...l, pdp: false }));
    }
  };

  pdpActionsRef.current = {
    edit: openEdit,
    remove: handleDeletePdp,
    toggle: handleActivePdp,
  };

  const loadAll = async () => {
    await fetchDialSettings();
    await fetchUSBMode();
    await fetchInfcfg();
    await fetchPDPContexts();
  };

  useATReady(() => {
    loadAll();
  });

  return (
    <div className="page-stack">
      {/* ---------- 自动拨号 ---------- */}
      <SectionHeader title="拨号连接" desc="自动拨号与 APN 设置" />
      <PageCard
        title="自动拨号"
        hint="开启后设备将自动保持网络连接，建议保持开启状态"
        extra={
          <Switch checked={settings.enable === 1} onChange={handleAutoDialChange} loading={loading.dial} />
        }
      >
        <Space wrap>
          <Tag color={settings.enable === 1 ? 'green' : 'orange'}>
            {settings.enable === 1 ? '已开启' : '已关闭'}
          </Tag>
          <Tag color="blue">拨号方式：{getDialModeText(settings.dialMode)}</Tag>
          <Tag color="red">协议：{settings.protocol || '-'}</Tag>
        </Space>

        <Field label="APN">
          <Input
            value={apnForm.apn}
            onChange={(v) => setApnForm((p) => ({ ...p, apn: v }))}
            placeholder="请输入 APN"
            maxLength={99}
          />
        </Field>
        <TwoCol>
          <Field label="用户名">
            <Input
              value={apnForm.username}
              onChange={(v) => setApnForm((p) => ({ ...p, username: v }))}
              placeholder="请输入用户名（可选）"
              maxLength={31}
            />
          </Field>
          <Field label="密码">
            <Input
              value={apnForm.password}
              onChange={(v) => setApnForm((p) => ({ ...p, password: v }))}
              placeholder="请输入密码（可选）"
              maxLength={31}
            />
          </Field>
        </TwoCol>
        <Field label="认证方式">
          <Select
            value={apnForm.authType}
            onChange={(v) => setApnForm((p) => ({ ...p, authType: Number(v) }))}
            optionList={AUTH_OPTIONS}
            style={{ width: 220 }}
          />
        </Field>
        <div className="action-row" style={{ marginTop: 16 }}>
          <Button theme="solid" type="primary" loading={loading.apn} onClick={handleApnSettingChange}>
            保存 APN 设置
          </Button>
          <Typography.Text type="tertiary" size="small">
            当前认证：{getAuthTypeText(settings.authType)}
          </Typography.Text>
        </div>
        <Banner
          type="info"
          closeIcon={null}
          style={{ marginTop: 12 }}
          description="APN 设置将影响设备的网络连接方式；如无特殊要求，认证方式请保持「无认证」。修改 APN 设置后可能需要重新进行网络连接。"
        />
      </PageCard>

      {/* ---------- 拨号方式设置 + USB 端口模式 ---------- */}
      <SectionHeader title="模式配置" desc="拨号方式与 USB 端口模式" />
      <TwoCol>
        <PageCard title="拨号方式设置" hint="修改拨号方式需要先关闭自动拨号">
          <ConfigSelect
            label="拨号方式"
            current={getDialModeText(settings.dialMode)}
            value={settings.dialMode}
            onChange={(v) => handleDialModeChange(Number(v))}
            options={DIAL_MODE_OPTIONS}
            disabled={loading.dial}
            placeholder="请选择拨号方式"
          />
          <Banner
            type="info"
            closeIcon={null}
            style={{ marginTop: 12 }}
            description="修改拨号方式后需重新开启自动拨号才能生效，过程中网络可能临时中断。"
          />
        </PageCard>

        <PageCard title="USB端口模式" hint="修改后设备将自动重启以应用配置">
          <ConfigSelect
            label="USB 端口模式"
            current={getUSBModeText(settings.usbMode ?? 0)}
            value={settings.usbMode}
            onChange={(v) => handleUSBModeChange(Number(v))}
            options={USB_MODE_OPTIONS}
            disabled={loading.usb}
            placeholder="请选择 USB 端口模式"
          />
          <Banner
            type="warning"
            closeIcon={null}
            style={{ marginTop: 12 }}
            description="修改 USB 端口模式后，设备将会自动重启以应用新的配置。请确保已保存其他重要设置且当前无重要业务正在进行。"
          />
        </PageCard>
      </TwoCol>

      {/* ---------- 网口模式配置 + DMZ 主机设置 ---------- */}
      <SectionHeader title="网口与 DMZ" desc="网口模式、后路由与 DMZ 主机设置" />
      <TwoCol>
        <PageCard title="网口模式配置" hint="修改后需要重启设备生效">
          <ConfigSelect
            label="网口模式"
            current={getInfcfgModeText(settings.infcfgMode)}
            value={settings.infcfgMode}
            onChange={(v) => handleInfcfgModeChange(Number(v))}
            options={INCFG_MODE_OPTIONS}
            disabled={loading.infcfg}
            placeholder="请选择网口模式"
          />
          <ConfigSelect
            label="后路由"
            current={settings.postRoute === 1 ? '已开启' : '已关闭'}
            currentColor={settings.postRoute === 1 ? 'green' : 'grey'}
            value={settings.postRoute}
            onChange={(v) => handlePostRouteChange(Number(v))}
            options={POST_ROUTE_OPTIONS}
            disabled={loading.infcfg}
            placeholder="请选择后路由状态"
          />
          <Banner
            type="info"
            closeIcon={null}
            style={{ marginTop: 12 }}
            description="修改网口模式后需要重启设备生效；开启后路由前会自动关闭 IP 过滤；后路由和 DMZ 功能互斥，不能同时使用。"
          />
        </PageCard>

        <PageCard
          title="DMZ 主机设置"
          hint="DMZ 主机将完全暴露在公网中"
          extra={<RefreshBtn onClick={fetchDMZ} loading={loading.dmz} label="刷新" />}
        >
          <Space style={{ marginBottom: 8 }}>
            <Typography.Text strong>当前状态：</Typography.Text>
            <Tag color={dmzConfig.enabled ? 'red' : 'grey'}>
              {dmzConfig.enabled ? `已开启 (${dmzConfig.host})` : '未配置'}
            </Tag>
          </Space>
          <div className="action-row" style={{ marginBottom: 8 }}>
            <Input
              value={dmzHost}
              onChange={setDmzHost}
              placeholder="请输入 DMZ 主机 IP（如 192.168.8.X）"
              maxLength={15}
              style={{ width: 240 }}
            />
            <Button
              theme="solid"
              type="primary"
              loading={loading.dmz}
              disabled={!dmzHost}
              onClick={handleSetDMZ}
            >
              应用
            </Button>
          </div>
          {dmzConfig.enabled && (
            <Button type="danger" theme="borderless" loading={loading.dmz} onClick={handleDisableDMZ}>
              关闭 DMZ
            </Button>
          )}
          <Banner
            type="warning"
            closeIcon={null}
            style={{ marginTop: 12 }}
            description="DMZ 主机将完全暴露在公网中，请确保目标设备有足够的安全措施；DMZ 和后路由功能互斥；建议在拨号前配置。"
          />
        </PageCard>
      </TwoCol>

      {/* ---------- PDP 上下文管理 ---------- */}
      <SectionHeader title="PDP 上下文" desc="管理 PDP 上下文配置，包括协议类型和 APN 设置" />
      <PageCard
        title="PDP 上下文管理"
        hint="管理 PDP 上下文配置，包括协议类型和 APN 设置"
        extra={<RefreshBtn onClick={fetchPDPContexts} loading={loading.pdp} label="刷新状态" />}
      >
        {/* 窄屏放不下带三个操作按钮的表格，改成列表逐项展示 */}
        {isNarrow ? (
          <div className="cell-list">
            {pdpTableData.length === 0 ? (
              <div className="cell-list-empty">暂无 PDP 上下文</div>
            ) : (
              pdpTableData.map((ctx) => (
                <div className="cell-list-item" key={ctx.key}>
                  <div className="cell-list-body">
                    <div className="cell-list-main">
                      <Tag size="small" color={ctx.active ? 'green' : 'grey'}>
                        {ctx.active ? '已激活' : '未激活'}
                      </Tag>
                      <b>CID {ctx.cid}</b>
                      <span>{getPdpTypeText(ctx.type)}</span>
                    </div>
                    <div className="cell-list-sub">APN {ctx.apn || '—'}</div>
                  </div>
                  <Space>
                    <Button size="small" onClick={() => pdpActionsRef.current?.edit(ctx)}>
                      编辑
                    </Button>
                    <Button size="small" onClick={() => pdpActionsRef.current?.toggle(ctx.cid, !ctx.active)}>
                      {ctx.active ? '去激活' : '激活'}
                    </Button>
                    <Button
                      size="small"
                      type="danger"
                      theme="borderless"
                      onClick={() => pdpActionsRef.current?.remove(ctx.cid)}
                    >
                      删除
                    </Button>
                  </Space>
                </div>
              ))
            )}
          </div>
        ) : (
          <Table
            size="small"
            pagination={false}
            dataSource={pdpTableData}
            empty="暂无 PDP 上下文"
            columns={pdpColumns}
          />
        )}
        <div className="table-actions">
          <Button theme="solid" type="primary" onClick={() => openEdit(null)}>
            添加 PDP 上下文
          </Button>
        </div>
      </PageCard>

      {/* ---------- 修改拨号方式 ---------- */}
      <Modal
        title="修改拨号方式"
        visible={dialModeModal}
        onOk={handleConfirmModeChange}
        onCancel={() => {
          setDialModeModal(false);
          setPendingDialMode(null);
        }}
        okText="确认修改"
        cancelText="取消"
      >
        <Banner
          type="warning"
          closeIcon={null}
          description={
            pendingDialMode !== null ? (
              <>
                <p>当前拨号方式：{getDialModeText(settings.dialMode)}</p>
                <p>修改为：{getDialModeText(pendingDialMode)}</p>
                <p>修改拨号方式后，需要重新开启自动拨号才能生效，过程中网络可能临时中断。</p>
              </>
            ) : null
          }
        />
      </Modal>

      {/* ---------- 修改 USB 端口模式 ---------- */}
      <Modal
        title="修改USB端口模式"
        visible={usbModal}
        onOk={handleConfirmUSBModeChange}
        onCancel={() => {
          setUsbModal(false);
          setPendingUSBMode(null);
        }}
        okText="确认修改"
        cancelText="取消"
      >
        <Banner
          type="warning"
          closeIcon={null}
          description={
            pendingUSBMode !== null ? (
              <>
                <p>当前模式：{getUSBModeText(settings.usbMode ?? 0)}</p>
                <p>修改为：{getUSBModeText(pendingUSBMode)}</p>
                <p>警告：修改 USB 端口模式后，设备将会自动重启！</p>
              </>
            ) : null
          }
        />
      </Modal>

      {/* ---------- DMZ 确认 ---------- */}
      <Modal
        title={dmzPending?.action === 'disable' ? '确认关闭 DMZ' : '确认配置 DMZ'}
        visible={dmzModal}
        onOk={handleConfirmDMZ}
        onCancel={() => {
          setDmzModal(false);
          setDmzPending(null);
        }}
        okText={dmzPending?.action === 'disable' ? '确认关闭' : '确认配置'}
        cancelText="取消"
      >
        <Banner
          type={dmzPending?.action === 'disable' ? 'info' : 'warning'}
          closeIcon={null}
          description={
            dmzPending?.action === 'disable' ? (
              <>当前 DMZ 目标：{dmzConfig.host}。关闭 DMZ 后公网将无法直接访问该主机。</>
            ) : (
              <>
                将配置 DMZ 目标 IP：{dmzPending?.ip}。DMZ 主机将完全暴露在公网中，请确保目标设备有足够的安全措施！建议在拨号前配置。
              </>
            )
          }
        />
      </Modal>

      {/* ---------- 删除 PDP ---------- */}
      <Modal
        title="删除 PDP 上下文"
        visible={deleteModal}
        onOk={handleConfirmDeletePdp}
        onCancel={() => {
          setDeleteModal(false);
          setPendingDeleteCid(null);
        }}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ theme: 'solid', type: 'danger' }}
      >
        <Typography.Text>确认删除 CID {pendingDeleteCid} 的 PDP 上下文？</Typography.Text>
      </Modal>

      {/* ---------- 添加 / 编辑 PDP ---------- */}
      <Modal
        title={editingCid !== null ? `编辑 PDP 上下文 (CID: ${editingCid})` : '添加 PDP 上下文'}
        visible={editModal}
        onOk={handleSavePdp}
        onCancel={() => setEditModal(false)}
        okText="保存"
        cancelText="取消"
      >
        <Space vertical spacing="medium" style={{ width: '100%' }}>
          <Banner
            type="info"
            closeIcon={null}
            description="CID 和协议类型为必填项，APN 为可选项。如无特殊需求，APN 可不填，设备将使用默认值。"
          />
          <Field label="CID">
            <Input
              value={editData?.cid != null ? String(editData.cid) : ''}
              onChange={(v) => {
                if (v === '') {
                  setEditData((d) => (d ? { ...d, cid: 0 } : d));
                  return;
                }
                const n = Number(v);
                if (Number.isInteger(n) && n >= 1 && n <= 20) {
                  setEditData((d) => (d ? { ...d, cid: n } : d));
                }
              }}
              disabled={editingCid !== null}
              placeholder="请输入 CID (1-20)"
            />
          </Field>
          <Field label="协议类型">
            <Select
              value={editData?.type}
              onChange={(v) => setEditData((d) => (d ? { ...d, type: String(v) } : d))}
              optionList={PDP_TYPE_OPTIONS}
              placeholder="请选择协议类型"
              style={{ width: '100%' }}
            />
          </Field>
          <Field label="APN">
            <Input
              value={editData?.apn || ''}
              onChange={(v) => setEditData((d) => (d ? { ...d, apn: v } : d))}
              placeholder="请输入 APN（可选）"
              maxLength={99}
            />
          </Field>
          <Field label="PDP 地址">
            <Input
              value={editData?.pdp_addr || ''}
              onChange={(v) => setEditData((d) => (d ? { ...d, pdp_addr: v } : d))}
              placeholder="PDP 地址（可选）"
            />
          </Field>
        </Space>
      </Modal>
    </div>
  );
};

export default NetworkDial;
