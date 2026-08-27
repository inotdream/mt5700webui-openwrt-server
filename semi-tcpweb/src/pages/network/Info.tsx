import React, { useEffect, useRef, useState } from 'react';
import { Banner, Button, InputNumber, Modal, Space, Spin, Switch, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import { IconArrowDown, IconArrowUp, IconSetting } from '@douyinfe/semi-icons';
import { ATResponse, ATService, PDCPData, URCData } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import { useCommandQueue } from '@/hooks/useCommandQueue';
import {
  calculateSignalPercent,
  convertRsrp,
  convertRsrq,
  convertRssi,
  convertSinr,
  deriveNetworkMode,
  extractATData,
  extractATDataMultiline,
  formatDuration,
  formatFlow,
  splitSpeed,
  hexToIP,
  ipv6CapDescription,
  operatorFromCode,
  parseCHIPTEMP,
  parseHCSQ,
  parseHFREQINFO,
  parseMCS,
  parseMONSC,
  parseHexValue,
  psRegText,
  qciLabel,
  rsrpColor,
  signalColor,
  SIGNAL_RSRP_RANGE,
  type CarrierInfo,
  type MCSInfo,
} from '@/modem/parse';
import { AutoRefresh, Kv, Metric, PageCard, Panel, SectionHeader, TwoCol } from '@/ui/widgets';
import { QualityBar, RingGauge, Sparkline } from '@/ui/charts';
import { Diagnostics } from './Diagnostics';
import {
  carrierSignalFor,
  parseCascellAll,
  parseMonsscAll,
  unmatchedSecondaries,
  type SecondaryLTE,
  type SecondaryNR,
} from '@/modem/carrier';

const at = () => ATService.getInstance();

// 曲线最多保留这么多采样点。速率是 PDCP 上报驱动的（默认约 0.75 秒一次），
// 60 个点差不多是最近一分钟。
const HISTORY_POINTS = 60;

const trimHistory = <T,>(list: T[]): T[] =>
  list.length > HISTORY_POINTS ? list.slice(list.length - HISTORY_POINTS) : list;

// 页面里的信号值有的是字符串有的是数字，取不到就当没有，别画成 0。
const numOrNull = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n !== 0 ? n : null;
};

const EMPTY_CELL = {
  rscp: 0,
  signalPercent: '',
  ecio: 0,
  sinr: 0,
  rssi: 0,
  mcc: '',
  mnc: '',
  lac: '',
  cid: '',
  channel: '',
  pci: 0,
  carrierInfo: [] as CarrierInfo[],
  carrierCount: 0,
  networkMode: '',
  sysMode: '未知',
};

const NetworkInfo: React.FC = () => {
  const { enqueue } = useCommandQueue();
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('等待状态中');
  const [operator, setOperator] = useState('未知运营商');
  const [cell, setCell] = useState(EMPTY_CELL);
  const [apn, setApn] = useState('未知');
  const [qci, setQci] = useState('未知');
  const [downSpeed, setDownSpeed] = useState(0);
  const [upSpeed, setUpSpeed] = useState(0);
  const [pdcp, setPdcp] = useState<PDCPData | null>(null);
  const [lastPdcp, setLastPdcp] = useState<PDCPData | null>(null);
  const [pdcpOn, setPdcpOn] = useState(false);
  // 每个载波各自的信号质量，合并进上面的载波聚合卡片显示。
  const [secondaryNR, setSecondaryNR] = useState<SecondaryNR[]>([]);
  const [secondaryLTE, setSecondaryLTE] = useState<SecondaryLTE[]>([]);
  // 曲线用的历史序列，只留最近一段，避免长时间开着页面把内存撑大。
  const [speedHistory, setSpeedHistory] = useState<Array<{ up: number; down: number }>>([]);
  const [signalHistory, setSignalHistory] = useState<Array<{ rsrp: number; sinr: number }>>([]);

  const dash = (v: number | null | undefined, unit = ''): string =>
    v == null ? '—' : `${v}${unit}`;
  const [pdcpInterval, setPdcpInterval] = useState(500);
  const [intervalModal, setIntervalModal] = useState(false);
  const [tempInterval, setTempInterval] = useState(500);
  const [uplinkMCS, setUplinkMCS] = useState<MCSInfo | null>(null);
  const [downlinkMCS, setDownlinkMCS] = useState<MCSInfo | null>(null);
  const [showDays, setShowDays] = useState(false);
  const [dhcpv4, setDhcpv4] = useState({
    ipv4Address: '',
    subnetMask: '',
    gateway: '',
    dhcpServer: '',
    primaryDNS: '',
    secondaryDNS: '',
  });
  const [dhcpv6, setDhcpv6] = useState({
    ipv6Address: '',
    netmask: '',
    gateway: '',
    dhcpServer: '',
    primaryDNS: '',
    secondaryDNS: '',
  });
  const [ipv6Cap, setIpv6Cap] = useState({ capValue: 0, description: '' });
  const [temps, setTemps] = useState({
    sub3GPA: 0,
    sub6GPA: 0,
    mimoPa: 0,
    tcxo: 0,
    ap1: 0,
    ap2: 0,
    modem1: 0,
  });
  const [flow, setFlow] = useState({
    lastDsTime: 0,
    lastTxFlow: 0,
    lastRxFlow: 0,
    totalDsTime: 0,
    totalTxFlow: 0,
    totalRxFlow: 0,
  });
  const [auto, setAuto] = useState({
    networkInfo: { enabled: false, interval: 5 },
    flowStats: { enabled: false, interval: 5 },
    tempMonitor: { enabled: false, interval: 5 },
  });
  const timers = useRef<Record<string, number>>({});
  const activeCidRef = useRef<number | null>(null);
  const pdcpOnRef = useRef(false);
  pdcpOnRef.current = pdcpOn;

  const getPSReg = async () => {
    const response = await at().getPSRegStatus();
    if (response.success && response.data) {
      const parsed = JSON.parse(response.data as string);
      setNetworkStatus(psRegText(parsed.stat));
    }
  };

  const getOperator = async () => {
    const res = await at().sendCommand('AT^EONS=2');
    if (res.success && res.data) {
      const str = extractATData(res.data as string, '^EONS');
      const code = str?.split(',')[1]?.trim().replace(/"/g, '') || '';
      setOperator(operatorFromCode(code));
    }
  };

  // ^DSAMBR 和 +CGEQOSRDP 都是按 PDP 上下文查的，而 cid 随拨号方式/运营商而变
  // （手册 7.2 的拨号步骤里 cid 由 AT+CGDCONT 自己定义），写死数字只是碰巧对上某些设备。
  // 这里从 AT+CGACT? 里取真正处于激活态的 cid。
  const resolveActiveCid = async (force = false): Promise<number | null> => {
    if (!force && activeCidRef.current !== null) return activeCidRef.current;
    const res = await at().sendCommand('AT+CGACT?');
    if (!res.success || !res.data) return activeCidRef.current;
    const active: number[] = [];
    for (const row of extractATDataMultiline(res.data as string, '+CGACT')) {
      const [cid, state] = row.split(',');
      if (state?.trim() === '1' && Number(cid) > 0) active.push(Number(cid));
    }
    activeCidRef.current = active.length ? Math.min(...active) : null;
    return activeCidRef.current;
  };

  const getAMBR = async () => {
    const cid = await resolveActiveCid();
    // 手册 16.17 的 ^DSAMBR 必须带 cid，且写明“目前只支持 cid 为 1 的查询”，
    // 所以激活的 cid 查不到时退回 1。
    const candidates = Array.from(new Set([cid, 1].filter((v): v is number => !!v && v > 0)));
    for (const candidate of candidates) {
      const res = await at().sendCommand(`AT^DSAMBR=${candidate}`);
      const str = res.success && res.data ? extractATData(res.data as string, '^DSAMBR') : null;
      if (!str) continue;
      // 手册只定义 <cid>,<DlApnAmbr>,<UlApnAmbr>，APN 是部分固件多给的，
      // 所以速率不能绑在“必须有第四个字段”上，否则按手册应答就一个都不显示。
      const parts = str.split(',');
      if (parts.length >= 3) {
        setDownSpeed((parseInt(parts[1], 10) || 0) / 1000);
        setUpSpeed((parseInt(parts[2], 10) || 0) / 1000);
      }
      if (parts.length >= 4) {
        setApn(parts[3].trim().replace(/^["']|["']$/g, '') || '未知');
      }
      return;
    }
    // 全都没答上来，可能是缓存的 cid 已经失效（比如换了拨号方式），下次重新解析。
    activeCidRef.current = null;
  };

  const getQCI = async () => {
    const cid = await resolveActiveCid();
    // 手册 13.30：cid 是可选的，不带时会把所有激活承载列出来，比猜 cid 稳。
    let res = await at().sendCommand('AT+CGEQOSRDP');
    if ((!res.success || !res.data) && cid) {
      res = await at().sendCommand(`AT+CGEQOSRDP=${cid}`);
    }
    if (!res.success || !res.data) return;
    const rows = extractATDataMultiline(res.data as string, '+CGEQOSRDP');
    const row = rows.find((r) => cid !== null && Number(r.split(',')[0]) === cid) ?? rows[0];
    // non-GBR 承载的应答只有 <cid>,<QCI> 两个字段（手册 13.30.5 的例子就是 "3,5"）。
    if (row) setQci(qciLabel(row.split(',')[1]?.trim()));
  };

  const getDHCP = async () => {
    const v6 = await at().sendCommand('AT^DHCPV6?');
    if (v6.success && v6.data) {
      const str = extractATData(v6.data as string, '^DHCPV6');
      if (str) {
        const d = str.split(',');
        if (d.length >= 6) {
          setDhcpv6({
            ipv6Address: d[0].trim(),
            netmask: d[1].trim(),
            gateway: d[2].trim(),
            dhcpServer: d[3].trim(),
            primaryDNS: d[4].trim(),
            secondaryDNS: d[5].trim(),
          });
        }
      }
    }
    const v4 = await at().sendCommand('AT^DHCP?');
    if (v4.success && v4.data) {
      const str = extractATData(v4.data as string, '^DHCP');
      if (str) {
        const d = str.split(',');
        if (d.length >= 6) {
          setDhcpv4({
            ipv4Address: hexToIP(d[0].trim()),
            subnetMask: hexToIP(d[1].trim()),
            gateway: hexToIP(d[2].trim()),
            dhcpServer: hexToIP(d[3].trim()),
            primaryDNS: hexToIP(d[4].trim()),
            secondaryDNS: hexToIP(d[5].trim()),
          });
        }
      }
    }
    const cap = await at().sendCommand('AT^IPV6CAP?');
    if (cap.success && cap.data) {
      const str = extractATData(cap.data as string, '^IPV6CAP');
      if (str) {
        const value = parseInt(str.trim(), 10);
        if (!Number.isNaN(value)) setIpv6Cap({ capValue: value, description: ipv6CapDescription(value) });
      }
    }
  };

  const getFlow = async () => {
    const res = await at().sendCommand('AT^DSFLOWQRY');
    if (res.success && res.data) {
      const str = extractATData(res.data as string, '^DSFLOWQRY');
      if (str) {
        const d = str.split(',');
        if (d.length >= 6) {
          setFlow({
            lastDsTime: parseHexValue(d[0]),
            lastTxFlow: parseHexValue(d[1]),
            lastRxFlow: parseHexValue(d[2]),
            totalDsTime: parseHexValue(d[3]),
            totalTxFlow: parseHexValue(d[4]),
            totalRxFlow: parseHexValue(d[5]),
          });
        }
      }
    }
  };

  const getTemp = async () => {
    const res = await at().sendCommand('AT^CHIPTEMP?');
    if (res.success && res.data) {
      const parsed = parseCHIPTEMP(res.data as string);
      if (parsed) {
        setTemps({
          sub3GPA: parsed.sub3GPA,
          sub6GPA: parsed.sub6GPA,
          mimoPa: parsed.mimoPa,
          tcxo: parsed.tcxo,
          ap1: parsed.ap1,
          ap2: parsed.ap2,
          modem1: parsed.modem1,
        });
      }
    }
  };

  const getMCS = async () => {
    const dl = await at().sendCommand('AT^MCS=1');
    if (dl.success && dl.data) setDownlinkMCS(parseMCS(dl.data as string));
    const ul = await at().sendCommand('AT^MCS=0');
    if (ul.success && ul.data) setUplinkMCS(parseMCS(ul.data as string));
  };

  const updateNetworkInfo = async () => {
    const monsc = await at().sendCommand('AT^MONSC');
    const serving = monsc.success && monsc.data ? parseMONSC(monsc.data as string) : null;
    const hfreq = await at().sendCommand('AT^HFREQINFO?');
    const carriers = hfreq.success && hfreq.data ? parseHFREQINFO(hfreq.data as string) : [];
    let fallback = '';
    if (!carriers.length) {
      const hcsq = await at().sendCommand('AT^HCSQ?');
      fallback = (hcsq.data as string) || '';
    }
    setCell((prev) => ({
      ...prev,
      ...(serving
        ? {
            mcc: serving.mcc,
            mnc: serving.mnc,
            channel: serving.channel,
            cid: serving.cid,
            pci: serving.pci,
            lac: serving.lac,
            rscp: serving.rscp || prev.rscp,
            ecio: serving.ecio || prev.ecio,
            rssi: serving.rssi ?? prev.rssi,
            sysMode: serving.sysMode,
            signalPercent: calculateSignalPercent(serving.rscp || prev.rscp),
          }
        : {}),
      carrierInfo: carriers,
      carrierCount: carriers.length,
      networkMode: deriveNetworkMode(carriers, fallback),
    }));

    // 手册 13.27 / 13.18：非 NSA、未配置 CA 时这两条本来就会失败，属正常情况，
    // 查不到就当没有辅小区，不打扰用户。
    const monssc = await at().sendCommand('AT^MONSSC');
    setSecondaryNR(monssc.success && monssc.data ? parseMonsscAll(String(monssc.data)) : []);
    const cascell = await at().sendCommand('AT^CASCELLINFO?');
    setSecondaryLTE(cascell.success && cascell.data ? parseCascellAll(String(cascell.data)) : []);
  };

  const updateSignal = async () => {
    const res = await at().sendCommand('AT^HCSQ?');
    if (res.success && res.data) {
      const parsed = parseHCSQ(res.data as string);
      if (parsed.mode) {
        setCell((prev) => ({
          ...prev,
          rscp: parsed.rsrp,
          sinr: parsed.sinr,
          ecio: parsed.rsrq,
          rssi: parsed.rssi || prev.rssi,
          signalPercent: parsed.signalPercent,
          sysMode: parsed.mode || prev.sysMode,
          networkMode: parsed.both ? 'EN-DC (LTE+NR)' : prev.networkMode || parsed.mode || '',
        }));
        // 轮询到的值同样入曲线：有些固件的 ^HCSQ 主动上报很稀疏，
        // 只靠上报的话趋势图会长时间空着。
        if (Number.isFinite(parsed.rsrp) && parsed.rsrp < 0) {
          setSignalHistory((hist) => trimHistory([...hist, { rsrp: parsed.rsrp, sinr: parsed.sinr }]));
        }
      }
    }
  };

  const loadAll = () => {
    setLoading(true);
    enqueue(async () => {
      await getPSReg();
      await updateSignal();
      await getOperator();
      await updateNetworkInfo();
      await getAMBR();
      await getQCI();
      await getDHCP();
      await getFlow();
      await getTemp();
      await getMCS();
      setLoading(false);
      // 进入页面默认激活实时速率上报，让看板动态展现
      void at().setPDCPDataReport(true, pdcpInterval).catch(() => {});
    });
  };

  useATReady(loadAll);

  useEffect(() => {
    const handle = (response: ATResponse) => {
      if (!('type' in response)) return;
      if (response.type === 'pdcp_data' && 'data' in response) {
        const data = response.data as PDCPData;
        setPdcpOn(true);
        pdcpOnRef.current = true;
        if (data.ulPdcpRate > 0 || data.dlPdcpRate > 0) setLastPdcp(data);
        setPdcp(data);
        // 速率曲线：PDCP 上报的单位是 Bytes/s，乘以 8 换算成 Mbps
        const upMbps = Number(((data.ulPdcpRate * 8) / 1_000_000).toFixed(2));
        const downMbps = Number(((data.dlPdcpRate * 8) / 1_000_000).toFixed(2));
        setSpeedHistory((prev) =>
          trimHistory([
            ...prev,
            { up: upMbps, down: downMbps },
          ]),
        );
      }
      if (response.type === 'urc_data' && 'data' in response) {
        const urc = response.data as URCData;
        if (urc.type === 'HCSQ' && urc.parsed) {
          const { networkMode, rsrp, rsrq, sinr, rssi } = urc.parsed;
          let actualRsrp = 0;
          let actualRsrq = 0;
          let actualSinr = 0;
          let actualRssi = 0;
          if (networkMode === 'LTE' || networkMode === 'NR') {
            actualRsrp = convertRsrp(rsrp);
            actualRsrq = convertRsrq(rsrq);
            if (sinr !== undefined) actualSinr = convertSinr(sinr);
            if (rssi !== undefined) actualRssi = convertRssi(rssi);
          }
          setCell((prev) => {
            const next = {
              ...prev,
              rscp: actualRsrp || prev.rscp,
              ecio: actualRsrq || prev.ecio,
              sinr: Math.round(actualSinr) || prev.sinr,
              rssi: actualRssi || prev.rssi,
              signalPercent: calculateSignalPercent(actualRsrp || prev.rscp),
              sysMode: networkMode || prev.sysMode,
            };
            // 信号趋势：调天线时看曲线比看单个数字直观得多
            const rsrp = Number(next.rscp);
            if (Number.isFinite(rsrp) && rsrp < 0) {
              setSignalHistory((hist) => trimHistory([...hist, { rsrp, sinr: next.sinr }]));
            }
            return next;
          });
        }
        if (urc.type === 'DSAMBR' && urc.parsed) {
          if (urc.parsed.apn) setApn(String(urc.parsed.apn).replace(/^["']|["']$/g, ''));
          if (urc.parsed.maxDownlinkRate) setDownSpeed(urc.parsed.maxDownlinkRate / 1000);
          if (urc.parsed.maxUplinkRate) setUpSpeed(urc.parsed.maxUplinkRate / 1000);
        }
      }
    };
    at().subscribe(handle);
    return () => {
      at().unsubscribe(handle);
      if (pdcpOnRef.current) at().setPDCPDataReport(false);
      Object.values(timers.current).forEach((id) => window.clearInterval(id));
    };
  }, []);

  const setAutoRefresh = (key: keyof typeof auto, enabled: boolean, interval: number) => {
    if (timers.current[key]) {
      window.clearInterval(timers.current[key]);
      delete timers.current[key];
    }
    setAuto((prev) => ({ ...prev, [key]: { enabled, interval } }));
    if (!enabled) return;
    const tick = () => {
      enqueue(async () => {
        try {
          if (key === 'networkInfo') {
            await updateNetworkInfo();
            await getMCS();
            await updateSignal();
          } else if (key === 'flowStats') {
            await getFlow();
          } else {
            await getTemp();
          }
        } catch {
          Toast.error('自动刷新失败，已停止');
          setAutoRefresh(key, false, interval);
        }
      });
    };
    tick();
    timers.current[key] = window.setInterval(tick, interval * 1000);
  };

  const confirmPdcp = async () => {
    const res = await at().setPDCPDataReport(true, tempInterval);
    if (res.success) {
      setPdcpOn(true);
      setPdcpInterval(tempInterval);
      setIntervalModal(false);
      Toast.success('实时网速已开启');
    } else {
      Toast.error('开启失败');
    }
  };

  const togglePdcp = async (on: boolean) => {
    if (on) {
      const res = await at().setPDCPDataReport(true, pdcpInterval);
      if (res.success) {
        setPdcpOn(true);
        pdcpOnRef.current = true;
        Toast.success('实时网速已开启');
      } else {
        Toast.error('开启实时网速失败');
      }
      return;
    }
    const res = await at().setPDCPDataReport(false);
    if (res.success) {
      setPdcpOn(false);
      pdcpOnRef.current = false;
      setPdcp(null);
      Toast.success('实时网速已暂停');
    } else {
      Toast.error('关闭失败');
    }
  };

  const clearFlow = async () => {
    const res = await at().sendCommand('AT^DSFLOWCLR');
    if (res.success) {
      Toast.success('流量已清零');
      await getFlow();
    } else Toast.error('清零失败');
  };

  const displayPdcp = pdcp && (pdcp.ulPdcpRate > 0 || pdcp.dlPdcpRate > 0) ? pdcp : lastPdcp;
  const nr = cell.networkMode.includes('NR') || cell.sysMode === 'NR';
  const lte = cell.sysMode === 'LTE' || cell.networkMode.includes('LTE');
  // NR 的 ^HCSQ 不上报 RSSI（手册 13.5），只有纯 LTE 且确实拿到值时才展示它
  const showRssi = lte && !nr && numOrNull(cell.rssi) !== null;

  const ulRate = displayPdcp?.ulPdcpRate || 0;
  const dlRate = displayPdcp?.dlPdcpRate || 0;
  const upSplit = splitSpeed(ulRate);
  const downSplit = splitSpeed(dlRate);
  const maxDownSpeed = speedHistory.length ? Math.max(0, ...speedHistory.map((p) => p.down)) : 0;
  const maxUpSpeed = speedHistory.length ? Math.max(0, ...speedHistory.map((p) => p.up)) : 0;

  // 合并展示不能把数据吞掉：没能对上任何载波的辅小区单独列出来。
  const orphan = unmatchedSecondaries(cell.carrierInfo, secondaryNR, secondaryLTE);

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <SectionHeader title="信号与驻留" desc="当前驻留小区、信号质量与网络参数" />

        <PageCard
          variant="hero"
          title="网络信息"
          hint="当前驻留小区与载波"
          extra={<AutoRefresh enabled={auto.networkInfo.enabled} interval={auto.networkInfo.interval} onChange={(e, i) => setAutoRefresh('networkInfo', e, i)} />}
        >
          <div className="net-hero">
            <div className="net-hero-primary">
              <div className="net-hero-tags">
                {cell.networkMode ? <Tag color="red">{cell.networkMode}</Tag> : null}
                <Tag color={networkStatus.includes('本地') ? 'green' : networkStatus.includes('漫游') ? 'orange' : 'red'}>
                  {networkStatus}
                </Tag>
              </div>
              <div>
                <div className="signal-overview">
                  <RingGauge
                    percent={cell.signalPercent ? parseInt(cell.signalPercent, 10) : null}
                    label="信号质量"
                    color={signalColor(cell.signalPercent)}
                  />
                  <div className="signal-overview-side">
                    <span className="signal-overview-caption">
                      {cell.signalPercent
                        ? parseInt(cell.signalPercent, 10) >= 70
                          ? '信号良好'
                          : parseInt(cell.signalPercent, 10) >= 40
                            ? '信号一般'
                            : '信号较差'
                        : '暂无测量'}
                    </span>
                    <span className="signal-overview-note">按 RSRP {SIGNAL_RSRP_RANGE[0]}~{SIGNAL_RSRP_RANGE[1]} dBm 线性映射</span>
                  </div>
                </div>
                <div className="metric-row">
                  {/* 不带小字提示：三列窄格子里"参考信号接收功率"会折行，把整块挤乱，
                      标签本身已经写明指标名，冗余提示不值一次换行 */}
                  <Metric
                    size="sm"
                    label={nr || lte ? 'RSRP (dBm)' : cell.sysMode === 'WCDMA' ? 'RSCP (dBm)' : 'RSSI (dBm)'}
                    value={cell.rscp || '—'}
                    color={rsrpColor(cell.rscp)}
                  />
                  <Metric size="sm" label="SINR (dB)" value={cell.sinr || '—'} />
                  {/* 手册 13.5：^HCSQ 在 NR 下没有 RSSI 字段，5G/EN-DC 显示 RSSI 只会是"—"。
                      有 NR 就显示 RSRQ；纯 LTE 且真拿到了 RSSI 才显示 RSSI。 */}
                  <Metric
                    size="sm"
                    label={showRssi ? 'RSSI (dBm)' : 'RSRQ (dB)'}
                    value={showRssi ? cell.rssi : cell.ecio || '—'}
                  />
                </div>
                <div className="quality-grid">
                  <QualityBar label="RSRP" value={numOrNull(cell.rscp)} domain={SIGNAL_RSRP_RANGE} unit=" dBm" />
                  <QualityBar label="SINR" value={numOrNull(cell.sinr)} domain={[0, 25]} unit=" dB" />
                </div>
              </div>
            </div>

            <div className="net-hero-details">
              <Panel title="运营商与网络参数" className="net-operator-panel">
                <Kv
                  columns={3}
                  dense
                  items={[
                    { label: '运营商', value: operator },
                    { label: 'APN', value: apn },
                    { label: 'QCI', value: qci.split('：')[0] },
                    { label: 'AMBR 上行', value: `${upSpeed.toFixed(1)} Mbps` },
                    { label: 'AMBR 下行', value: `${downSpeed.toFixed(1)} Mbps` },
                  ]}
                />
                {/* 只有拿到 QCI 释义时才显示这行，否则会孤零零冒出一个"未知" */}
                {qci.includes('：') ? (
                  <Typography.Text type="tertiary" size="small">
                    {qci.split('：')[1]}
                  </Typography.Text>
                ) : null}
                <div className="net-cell-params">
                  <div className="net-cell-params-title">小区参数</div>
                  <Kv
                    columns={3}
                    dense
                    items={[
                      { label: 'PCI', value: cell.pci || '—' },
                      { label: '频点', value: cell.channel || '—' },
                      { label: 'MCC-MNC', value: cell.mcc && cell.mnc ? `${cell.mcc}-${cell.mnc}` : '—' },
                      { label: 'TAC / LAC', value: cell.lac || '—' },
                      { label: '小区 ID', value: cell.cid || '—' },
                    ]}
                  />
                </div>
              </Panel>
            </div>
          </div>

          {/* 趋势图横贯整卡：左右两列高度对齐，右下不再空一块，曲线也更宽更好读。
              调天线朝向时盯着曲线比盯单个数字直观：能看出是真的变好还是在抖 */}
          <div className="net-hero-trend">
            <Sparkline
              height={86}
              minRange={6}
              empty="等待信号上报…"
              format={(v) => `${Math.round(v)} dBm`}
              series={[
                {
                  label: 'RSRP 趋势',
                  color: 'var(--app-info)',
                  values: signalHistory.map((p) => p.rsrp),
                },
              ]}
            />
          </div>
        </PageCard>

        <SectionHeader
          title="载波聚合"
          desc={`${cell.carrierCount} 载波 · DL ${cell.carrierInfo.reduce((s, c) => s + c.dlBandwidth, 0).toFixed(1)} MHz / UL ${cell.carrierInfo.reduce((s, c) => s + c.ulBandwidth, 0).toFixed(1)} MHz`}
        />
        <div className="carrier-grid">
          {cell.carrierInfo.length === 0 ? (
            <Panel>暂无载波信息</Panel>
          ) : (
            cell.carrierInfo.map((c, i) => {
              const dl = downlinkMCS?.carriers[i];
              const ul = uplinkMCS?.carriers[i];
              // ^HFREQINFO 只给频点与带宽，每个载波各自的信号质量要从
              // ^MONSSC(NSA 辅站) 与 ^CASCELLINFO(LTE CA) 里按下行频点对上来。
              const sig = carrierSignalFor(c, secondaryNR, secondaryLTE);
              return (
                <Panel
                  key={`${c.bandShortName}-${i}`}
                  title={i === 0 ? '主载波' : `辅载波 ${i}`}
                  extra={<Tag size="small">{c.sysMode}</Tag>}
                >
                  <Kv
                    items={[
                      { label: '频段', value: `${c.bandShortName} ${c.bandDesc}` },
                      { label: '下行频点 / 频率', value: `${c.dlFcn} / ${c.dlFreq} MHz` },
                      { label: '上行频点 / 频率', value: `${c.ulFcn} / ${c.ulFreq} MHz` },
                      { label: '带宽 DL / UL', value: `${c.dlBandwidth} / ${c.ulBandwidth} MHz` },
                      ...(sig
                        ? [
                            { label: 'PCI', value: String(sig.pci) },
                            {
                              label: 'RSRP / RSRQ',
                              value: (
                                <span>
                                  {/* RSRP 按好坏着色，一眼看出哪个载波信号差 */}
                                  <span style={{ color: sig.rsrp !== null ? rsrpColor(sig.rsrp) : undefined }}>
                                    {dash(sig.rsrp, ' dBm')}
                                  </span>
                                  {` / ${dash(sig.rsrq, ' dB')}`}
                                </span>
                              ),
                            },
                            {
                              label: sig.sinr !== null ? 'SINR' : 'RSSI',
                              value:
                                sig.sinr !== null
                                  ? `${dash(sig.sinr, ' dB')}${sig.measType && sig.measType !== '—' ? ` · ${sig.measType}` : ''}`
                                  : dash(sig.rssi ?? null, ' dBm'),
                            },
                          ]
                        : []),
                      {
                        label: '下行 MCS',
                        value: dl ? (
                          <span style={{ color: dl.color }}>
                            {dl.code0 === 255 ? '—' : `${dl.code0} ${dl.modulation}`}
                          </span>
                        ) : (
                          '—'
                        ),
                      },
                      {
                        label: '上行 MCS',
                        value: ul ? (
                          <span style={{ color: ul.color }}>
                            {ul.code0 === 255 ? '—' : `${ul.code0} ${ul.modulation}`}
                          </span>
                        ) : (
                          '—'
                        ),
                      },
                    ]}
                  />
                </Panel>
              );
            })
          )}
        </div>

        {orphan.nr.length > 0 || orphan.lte.length > 0 ? (
          <Panel title="未归入上方载波的辅小区" accent>
            <Typography.Text type="tertiary" size="small">
              这些小区来自 ^MONSSC / ^CASCELLINFO 上报，但频点没能和 ^HFREQINFO
              报出的载波对上（两条命令的上报时机可能不同步）。列在这里是为了不丢数据，
              正常聚合的载波都在上方卡片里。
            </Typography.Text>
            <Kv
              items={[
                ...orphan.nr.map((c) => ({
                  label: `NR 频点 ${c.arfcn} · PCI ${c.pci}`,
                  value: `${dash(c.rsrp, ' dBm')} / ${dash(c.rsrq, ' dB')} / ${dash(c.sinr, ' dB')}`,
                })),
                ...orphan.lte.map((c) => ({
                  label: `LTE B${c.band} · PCI ${c.pci}`,
                  value: `${dash(c.rsrp, ' dBm')} / ${dash(c.rsrq, ' dB')} / ${dash(c.rssi, ' dBm')}`,
                })),
              ]}
            />
          </Panel>
        ) : null}

        <Diagnostics />

        <SectionHeader title="速率与流量" desc="实时网速与累计流量统计" />
        <TwoCol>
          <PageCard
            title="网络速率"
            bodyClassName="network-speed-body"
            extra={
              <Space>
                <Button
                  size="small"
                  theme="borderless"
                  icon={<IconSetting />}
                  aria-label="设置上报间隔"
                  title="设置上报间隔"
                  onClick={() => {
                    setTempInterval(pdcpInterval);
                    setIntervalModal(true);
                  }}
                />
                <Typography.Text size="small" type="tertiary">
                  实时网速
                </Typography.Text>
                <Switch checked={pdcpOn} onChange={togglePdcp} aria-label="实时网速开关" />
              </Space>
            }
          >
            <div className="speed-dashboard">
              <div className="speed-stat-grid">
                <div className="speed-stat-card speed-stat-card--down">
                  <div className="speed-stat-head">
                    <span className="speed-stat-icon" aria-hidden="true">
                      <IconArrowDown size="small" />
                    </span>
                    下行速率
                  </div>
                  <div className="speed-stat-main">
                    <span className="speed-stat-val">{downSplit.value}</span>
                    <span className="speed-stat-unit">{downSplit.unit}</span>
                  </div>
                  <div className="speed-stat-sub">
                    {maxDownSpeed > 0 ? `峰值 ${maxDownSpeed.toFixed(2)} Mbps` : '等待采样'}
                  </div>
                </div>

                <div className="speed-stat-card speed-stat-card--up">
                  <div className="speed-stat-head">
                    <span className="speed-stat-icon" aria-hidden="true">
                      <IconArrowUp size="small" />
                    </span>
                    上行速率
                  </div>
                  <div className="speed-stat-main">
                    <span className="speed-stat-val">{upSplit.value}</span>
                    <span className="speed-stat-unit">{upSplit.unit}</span>
                  </div>
                  <div className="speed-stat-sub">
                    {maxUpSpeed > 0 ? `峰值 ${maxUpSpeed.toFixed(2)} Mbps` : '等待采样'}
                  </div>
                </div>
              </div>

              {/* 上方数字已经是图例（图标颜色与线色一致），图下不再重复一遍 */}
              <Sparkline
                height={116}
                minRange={0.5}
                showLegend={false}
                empty={pdcpOn ? '等待速率上报…' : '实时网速已关闭，打开右上角开关开始采样'}
                format={(v) => `${v.toFixed(2)} Mbps`}
                series={[
                  {
                    label: '下行',
                    color: 'var(--app-info)',
                    values: speedHistory.map((p) => p.down),
                  },
                  {
                    label: '上行',
                    color: 'var(--app-success)',
                    dashed: true,
                    values: speedHistory.map((p) => p.up),
                  },
                ]}
              />
            </div>
          </PageCard>

          <PageCard
            title="流量统计"
            extra={
              <Space>
                <Button size="small" onClick={() => setShowDays((v) => !v)}>
                  {showDays ? '显示时分秒' : '显示天数'}
                </Button>
                <Button size="small" type="danger" onClick={clearFlow}>
                  清零
                </Button>
                <AutoRefresh
                  enabled={auto.flowStats.enabled}
                  interval={auto.flowStats.interval}
                  onChange={(e, i) => setAutoRefresh('flowStats', e, i)}
                />
              </Space>
            }
          >
            <Panel title="最后一次连接">
              <div className="metric-row">
                <Metric label="连接时长" value={formatDuration(flow.lastDsTime, showDays)} />
                <Metric label="上传流量" value={formatFlow(flow.lastTxFlow)} />
                <Metric label="下载流量" value={formatFlow(flow.lastRxFlow)} />
              </div>
            </Panel>
            <Panel title="累计统计">
              <div className="metric-row">
                <Metric label="总连接时长" value={formatDuration(flow.totalDsTime, showDays)} />
                <Metric label="总上传流量" value={formatFlow(flow.totalTxFlow)} />
                <Metric label="总下载流量" value={formatFlow(flow.totalRxFlow)} />
              </div>
            </Panel>
          </PageCard>
        </TwoCol>

        <SectionHeader title="DHCP 配置" desc="IPv4 / IPv6 地址、网关与 DNS" />
        <Panel title="IPv6 能力" accent>
          <Typography.Text>
            {ipv6Cap.capValue ? `0x${ipv6Cap.capValue.toString(16).toUpperCase().padStart(2, '0')} · ${ipv6Cap.description}` : '未获取'}
          </Typography.Text>
        </Panel>
        <TwoCol>
          <Panel title="IPv4 网络配置">
            <Kv
              items={[
                { label: '地址', value: dhcpv4.ipv4Address || '未获取' },
                { label: '掩码', value: dhcpv4.subnetMask || '未获取' },
                { label: '网关', value: dhcpv4.gateway || '未获取' },
                { label: 'DHCP', value: dhcpv4.dhcpServer || '未获取' },
                { label: '主 DNS', value: dhcpv4.primaryDNS || '未获取' },
                { label: '备 DNS', value: dhcpv4.secondaryDNS || '未获取' },
              ]}
            />
          </Panel>
          <Panel title="IPv6 网络配置">
            <Kv
              items={[
                { label: '地址', value: dhcpv6.ipv6Address || '未获取' },
                { label: '前缀', value: dhcpv6.netmask || '未获取' },
                { label: '网关', value: dhcpv6.gateway || '未获取' },
                { label: 'DHCP', value: dhcpv6.dhcpServer || '未获取' },
                { label: '主 DNS', value: dhcpv6.primaryDNS || '未获取' },
                { label: '备 DNS', value: dhcpv6.secondaryDNS || '未获取' },
              ]}
            />
          </Panel>
        </TwoCol>

        <SectionHeader
          title="模组温度"
          desc="关键芯片实时温度"
          extra={<AutoRefresh enabled={auto.tempMonitor.enabled} interval={auto.tempMonitor.interval} onChange={(e, i) => setAutoRefresh('tempMonitor', e, i)} />}
        />
        <div className="temp-grid">
          {[
            ['3G PA', temps.sub3GPA],
            ['6G PA', temps.sub6GPA],
            ['MIMO PA', temps.mimoPa],
            ['TCXO', temps.tcxo],
            ['AP1', temps.ap1],
            ['AP2', temps.ap2],
            ['Modem1', temps.modem1],
          ].map(([label, value]) => (
            <div className="temp-tile" key={String(label)}>
              <QualityBar
                label={`${label}温度`}
                value={numOrNull(value)}
                unit="°C"
                domain={[20, 85]}
                higherIsWorse
              />
            </div>
          ))}
        </div>
      </div>

      <Modal
        title="主动刷新时间"
        visible={intervalModal}
        onCancel={() => setIntervalModal(false)}
        onOk={confirmPdcp}
        okText="开启"
      >
        <Typography.Paragraph type="tertiary">PDCP 上报间隔（毫秒），范围 200–65535</Typography.Paragraph>
        <InputNumber min={200} max={65535} step={100} value={tempInterval} onChange={(v) => setTempInterval(Number(v) || 500)} />
      </Modal>
    </Spin>
  );
};

export default NetworkInfo;
