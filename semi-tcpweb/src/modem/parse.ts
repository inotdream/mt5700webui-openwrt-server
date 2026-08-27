export function extractATData(data: string, command: string): string | null {
  const escaped = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = data.match(new RegExp(`${escaped}:\\s*([^\\r\\n]+)`));
  return match ? match[1] : null;
}

export function extractATDataMultiline(data: string, command: string): string[] {
  const escaped = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escaped}:\\s*(.+)`);
  return data
    .split('\n')
    .map((line) => {
      const match = line.match(regex);
      return match?.[1]?.trim();
    })
    .filter((v): v is string => Boolean(v));
}

export function convertRsrp(raw: number): number {
  if (raw === 0) return -140;
  if (raw >= 97) return -44;
  return -140 + raw;
}

export function convertRsrq(raw: number): number {
  if (raw === 0) return -19.5;
  if (raw >= 34) return -3;
  return -19.5 + raw * 0.5;
}

export function convertSinr(raw: number): number {
  const v = raw === 0 ? -20 : raw >= 251 ? 30 : -20 + raw * 0.2;
  return Math.min(30, Math.max(-20, v));
}

// 手册 13.5.3：rssi 档位 0~96 对应 -120~-25 dBm，255 为不可测。
export function convertRssi(raw: number): number {
  if (raw === 0) return -120;
  if (raw >= 96) return -25;
  return -121 + raw;
}

// 信号百分比的量程：-110 dBm 视作 0%，-70 dBm 及以上视作 100%。
// 原来是 5 档阶梯（-80 就直接算满格），调天线时数值要么不动、要么整档跳，
// 既看不出细微变化，也会把 -80 这种其实一般的信号显示成 100%。
export const SIGNAL_RSRP_RANGE: [number, number] = [-110, -70];

export function calculateSignalPercent(rsrp: number): string {
  // 拿不到 rsrp 时按 0 传进来，别把“不可测”显示成满格。
  if (!rsrp || rsrp >= 0) return '';
  const [worst, best] = SIGNAL_RSRP_RANGE;
  const ratio = (rsrp - worst) / (best - worst);
  return `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`;
}

export function parseHexValue(hexStr: string): number {
  return parseInt(hexStr, 16) || 0;
}

export function hexToIP(hex: string): string {
  if (!hex || typeof hex !== 'string') return '0.0.0.0';
  let clean = hex.trim().replace(/[\r\n]/g, '');
  if (!/^[0-9A-Fa-f]+$/.test(clean)) return '0.0.0.0';
  if (clean.length !== 8) clean = clean.padStart(8, '0').substring(0, 8);
  const bytes: number[] = [];
  for (let i = 0; i < 8; i += 2) {
    bytes.push(parseInt(clean.substring(i, i + 2), 16) || 0);
  }
  while (bytes.length < 4) bytes.push(0);
  return bytes.reverse().join('.');
}

export function parseTemperature(rawValue: string | number): number {
  const intValue = typeof rawValue === 'number' ? rawValue : parseInt(rawValue, 10);
  if (intValue >= 65535 || Number.isNaN(intValue) || intValue > 1500) return 0;
  return parseFloat((intValue / 10).toFixed(1));
}

export function formatFlow(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
}

export function formatSpeed(bytesPerSecond: number): string {
  const bits = bytesPerSecond * 8;
  if (bits >= 1e9) return `${(bits / 1e9).toFixed(2)} Gbps`;
  if (bits >= 1e6) return `${(bits / 1e6).toFixed(2)} Mbps`;
  if (bits >= 1e3) return `${(bits / 1e3).toFixed(2)} Kbps`;
  return `${Math.round(bits)} bps`;
}

export function splitSpeed(bytesPerSecond: number): { value: string; unit: string } {
  const bits = bytesPerSecond * 8;
  if (bits >= 1e9) return { value: (bits / 1e9).toFixed(2), unit: 'Gbps' };
  if (bits >= 1e6) return { value: (bits / 1e6).toFixed(2), unit: 'Mbps' };
  if (bits >= 1e3) return { value: (bits / 1e3).toFixed(1), unit: 'Kbps' };
  return { value: Math.round(bits).toString(), unit: 'bps' };
}

export function formatDuration(seconds: number, showDays: boolean): string {
  if (showDays) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remaining = seconds % 60;
    return `${days}天${hours}时${minutes}分${remaining}秒`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return `${hours}时${minutes}分${remaining}秒`;
}

export const NR_BANDS: Record<string, string> = {
  1: '2100 MHz (FDD)',
  2: '1900 MHz (FDD)',
  3: '1800 MHz (FDD)',
  5: '850 MHz (FDD)',
  7: '2600 MHz (FDD)',
  8: '900 MHz (FDD)',
  20: '800 MHz (FDD)',
  28: '700 MHz (FDD)',
  38: '2600 MHz (TDD)',
  40: '2300 MHz (TDD)',
  41: '2500 MHz (TDD)',
  77: '3700 MHz (TDD)',
  78: '3500 MHz (TDD)',
  79: '4700 MHz (TDD)',
};

export const LTE_BANDS: Record<string, string> = {
  1: '2100 MHz (FDD)',
  2: '1900 MHz (FDD)',
  3: '1800 MHz (FDD)',
  5: '850 MHz (FDD)',
  7: '2600 MHz (FDD)',
  8: '900 MHz (FDD)',
  20: '800 MHz (FDD)',
  38: '2600 MHz (TDD)',
  40: '2300 MHz (TDD)',
  41: '2500 MHz (TDD)',
};

export function operatorFromCode(code: string): string {
  switch (code) {
    case '46000':
    case '46002':
    case '46004':
    case '46007':
    case '46008':
    case '46020':
      return '中国移动';
    case '46001':
    case '46006':
    case '46009':
      return '中国联通';
    case '46003':
    case '46005':
    case '46011':
      return '中国电信';
    case '46015':
      return '中国广电';
    default:
      return '未知运营商';
  }
}

export function qciLabel(value: string | undefined): string {
  switch (value) {
    case '1':
      return '等级1：GBR业务,延迟100ms,丢包率10^-2,高优先级语音通话';
    case '2':
      return '等级2：GBR业务,延迟150ms,丢包率10^-3,标准语音通话';
    case '3':
      return '等级3：GBR业务,延迟50ms,丢包率10^-3,实时游戏';
    case '4':
      return '等级4：GBR业务,延迟300ms,丢包率10^-6,非会话视频';
    case '5':
      return '等级5：非GBR业务,延迟100ms,丢包率10^-6,IMS信令';
    case '6':
      return '等级6：非GBR业务,延迟300ms,丢包率10^-6,视频流媒体';
    case '7':
      return '等级7：非GBR业务,延迟100ms,丢包率10^-3,语音、视频、互动游戏';
    case '8':
      return '等级8：非GBR业务,延迟300ms,丢包率10^-6,视频流媒体、TCP应用';
    case '9':
      return '等级9：非GBR业务,延迟300ms,丢包率10^-6,标准数据传输';
    default:
      return value ? `QCI ${value}：未知服务等级` : '未能获取服务等级信息';
  }
}

export function ipv6CapDescription(capValue: number): string {
  switch (capValue) {
    case 0x01:
      return '仅支持IPv4协议';
    case 0x02:
      return '仅支持IPv6协议';
    case 0x07:
      return '支持IPv4、IPv6和双栈模式（使用相同APN）';
    case 0x0b:
      return '支持IPv4、IPv6和双栈模式（使用不同APN）';
    default:
      return `未知能力值 (0x${capValue.toString(16).toUpperCase()})`;
  }
}

export function psRegText(stat: number): string {
  switch (stat) {
    case 0:
      return '未搜索网络';
    case 1:
      return '已注册，本地网络';
    case 2:
      return '正在搜索网络...';
    case 3:
      return '注册被拒绝';
    case 4:
      return '未知状态';
    case 5:
      return '已注册，漫游网络';
    default:
      return '未知状态';
  }
}

export function getMCSModulation(mcs: number): string {
  if (mcs === 255) return '未使用';
  if (mcs <= 9) return 'QPSK';
  if (mcs <= 16) return '16QAM';
  if (mcs <= 28) return '64QAM';
  return '256QAM';
}

export function getMCSPerformance(mcs: number): { level: string; color: string } {
  if (mcs === 255) return { level: '未使用', color: 'var(--semi-color-text-2)' };
  if (mcs <= 9) return { level: '差', color: 'var(--semi-color-danger)' };
  if (mcs <= 16) return { level: '一般', color: 'var(--semi-color-warning)' };
  if (mcs <= 23) return { level: '好', color: 'var(--semi-color-success)' };
  return { level: '优秀', color: 'var(--semi-color-primary)' };
}

export interface HcsqResult {
  mode: 'LTE' | 'NR' | null;
  rsrp: number;
  sinr: number;
  rsrq: number;
  rssi: number;
  signalPercent: string;
  both?: boolean;
}

export function parseHCSQ(raw: string): HcsqResult {
  const rows = extractATDataMultiline(raw, '^HCSQ');
  let lte: string[] | null = null;
  let nr: string[] | null = null;
  rows.forEach((row) => {
    const parts = row.split(',');
    const mode = parts[0]?.replace(/"/g, '') || '';
    if (mode === 'LTE') lte = parts;
    if (mode === 'NR') nr = parts;
  });

  // 手册 13.5.3 的字段表：两种制式的取值含义不同，NR 没有 rssi。
  //   LTE: <lte_rssi>,<lte_rsrp>,<lte_sinr>,<lte_rsrq>
  //   NR:  <5g_rsrp>,<5g_sinr>,<5g_rsrq>
  const apply = (parts: string[], mode: 'LTE' | 'NR'): HcsqResult => {
    const at = (index: number): number => {
      const raw = parts.length > index ? parseInt(parts[index], 10) : 255;
      return Number.isNaN(raw) ? 255 : raw;
    };
    const conv = (raw: number, fn: (v: number) => number): number =>
      raw === 255 ? 0 : fn(raw);

    const rssiRaw = mode === 'LTE' ? at(1) : 255;
    const rsrpRaw = mode === 'LTE' ? at(2) : at(1);
    const sinrRaw = mode === 'LTE' ? at(3) : at(2);
    const rsrqRaw = mode === 'LTE' ? at(4) : at(3);

    const rsrp = conv(rsrpRaw, convertRsrp);
    return {
      mode,
      rsrp,
      sinr: Math.round(conv(sinrRaw, convertSinr)),
      rsrq: Math.round(conv(rsrqRaw, convertRsrq)),
      rssi: conv(rssiRaw, convertRssi),
      signalPercent: calculateSignalPercent(rsrp),
    };
  };

  if (nr) return { ...apply(nr, 'NR'), both: Boolean(lte) };
  if (lte) return apply(lte, 'LTE');
  return { mode: null, rsrp: 0, sinr: 0, rsrq: 0, rssi: 0, signalPercent: '' };
}

export interface ServingCell {
  mcc: string;
  mnc: string;
  channel: string;
  cid: string;
  pci: number;
  lac: string;
  rscp: number;
  ecio: number;
  rssi?: number;
  sysMode: string;
}

export function parseMONSC(raw: string): ServingCell | null {
  const monscStr = extractATData(raw, '^MONSC') || raw.replace(/^\^MONSC:\s*/, '').trim();
  if (!monscStr) return null;
  const data = monscStr.split(',');
  if (data.length < 7) return null;
  const sysMode = data[0]?.trim() || '';
  const mcc = data[1]?.trim() || '0';
  const mnc = data[2]?.trim() || '0';
  const channel = data[3]?.trim() || '0';
  if (sysMode === 'LTE') {
    return {
      sysMode,
      mcc,
      mnc,
      channel,
      cid: parseInt(data[4]?.trim() || '0', 16).toString(),
      pci: parseInt(data[5]?.trim() || '0', 16),
      lac: parseInt(data[6]?.trim() || '0', 16).toString(),
      rscp: parseInt(data[7]?.trim() || '0', 10),
      ecio: parseFloat(data[8]?.trim() || '0'),
      rssi: parseInt(data[9]?.trim() || '0', 10),
    };
  }
  if (sysMode === 'NR') {
    return {
      sysMode,
      mcc,
      mnc,
      channel,
      cid: parseInt(data[5]?.trim() || '0', 16).toString(),
      pci: parseInt(data[6]?.trim() || '0', 16),
      lac: parseInt(data[7]?.trim() || '0', 16).toString(),
      rscp: parseInt(data[8]?.trim() || '0', 10),
      ecio: parseFloat(data[9]?.trim() || '0'),
    };
  }
  if (sysMode === 'WCDMA') {
    return {
      sysMode,
      mcc,
      mnc,
      channel,
      cid: parseInt(data[5]?.trim() || '0', 16).toString(),
      pci: parseInt(data[4]?.trim() || '0', 10),
      lac: parseInt(data[6]?.trim() || '0', 16).toString(),
      rscp: parseInt(data[7]?.trim() || '0', 10),
      ecio: parseFloat(data[9]?.trim() || '0'),
    };
  }
  return null;
}

export interface CarrierInfo {
  band: string;
  bandShortName: string;
  bandDesc: string;
  dlFcn: string;
  dlFreq: string;
  dlBandwidth: number;
  ulFcn: string;
  ulFreq: string;
  ulBandwidth: number;
  sysMode: 'NR' | 'LTE';
}

export function parseHFREQINFO(raw: string): CarrierInfo[] {
  const carriers: CarrierInfo[] = [];
  extractATDataMultiline(raw, '^HFREQINFO').forEach((dataStr) => {
    const hfreqData = dataStr.split(',');
    if (hfreqData.length < 9) return;
    const sysMode = hfreqData[1];
    let index = 2;
    const maxCarriers = sysMode === '7' ? 3 : 4;
    while (index + 6 <= hfreqData.length && carriers.length < maxCarriers) {
      const bandNum = parseInt(hfreqData[index], 10);
      const isNr = sysMode === '7';
      carriers.push({
        band: String(bandNum),
        bandShortName: isNr ? `n${bandNum}` : `B${bandNum}`,
        bandDesc: isNr ? NR_BANDS[String(bandNum)] || '未知频段' : LTE_BANDS[String(bandNum)] || '未知频段',
        dlFcn: hfreqData[index + 1].trim(),
        dlFreq: (parseInt(hfreqData[index + 2], 10) * (isNr ? 0.001 : 0.1)).toFixed(2),
        dlBandwidth: parseInt(hfreqData[index + 3], 10) / 1000,
        ulFcn: hfreqData[index + 4].trim(),
        ulFreq: (parseInt(hfreqData[index + 5], 10) * (isNr ? 0.001 : 0.1)).toFixed(2),
        ulBandwidth: parseInt(hfreqData[index + 6], 10) / 1000,
        sysMode: isNr ? 'NR' : 'LTE',
      });
      index += 7;
    }
  });
  return carriers;
}

export function deriveNetworkMode(carriers: CarrierInfo[], hcsqFallback?: string): string {
  if (carriers.length > 0) {
    const hasNr = carriers.some((c) => c.sysMode === 'NR');
    const hasLte = carriers.some((c) => c.sysMode === 'LTE');
    if (hasNr && hasLte) return 'EN-DC (LTE+NR)';
    if (hasNr) return carriers.length > 1 ? 'NR-CA' : 'NR';
    if (hasLte) return carriers.length > 1 ? 'LTE-CA' : 'LTE';
  }
  const mode = hcsqFallback?.split(',')[0]?.replace(/"/g, '') || '';
  if (mode === 'NR' || mode === 'LTE' || mode === 'WCDMA') return mode;
  return '未知';
}

export interface MCSCarrier {
  index: number;
  mcsTableIndex: number;
  code0: number;
  code1: number;
  modulation: string;
  performance: string;
  color: string;
}

export interface MCSInfo {
  rat: 'LTE' | 'NR' | 'UNKNOWN';
  carriers: MCSCarrier[];
  avgMCS: number;
}

export function parseMCS(raw: string): MCSInfo {
  const carriers: MCSCarrier[] = [];
  let rat: MCSInfo['rat'] = 'UNKNOWN';
  extractATDataMultiline(raw, '^MCS').forEach((dataStr) => {
    const match = dataStr.match(/(\d+),(\d+),(.+)/);
    if (!match) return;
    const ratValue = match[2];
    if (ratValue === '1') rat = 'NR';
    else if (ratValue === '0' && rat === 'UNKNOWN') rat = 'LTE';
    const values = match[3].split(',').map((v) => parseInt(v.trim(), 10));
    for (let i = 0; i + 2 < values.length; i += 3) {
      const code0 = values[i + 1];
      const perf = getMCSPerformance(code0);
      carriers.push({
        index: carriers.length + 1,
        mcsTableIndex: values[i],
        code0,
        code1: values[i + 2],
        modulation: getMCSModulation(code0),
        performance: perf.level,
        color: perf.color,
      });
    }
  });
  const valid = carriers.map((c) => c.code0).filter((mcs) => mcs !== 255);
  return {
    rat,
    carriers,
    avgMCS: valid.length ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length) : 0,
  };
}

export function parseCHIPTEMP(raw: string) {
  const str = extractATData(raw, '^CHIPTEMP');
  if (!str) return null;
  const t = str.split(',');
  if (t.length < 12) return null;
  return {
    sub3GPA: parseTemperature(parseInt(t[0] || '0', 10)),
    sub6GPA: parseTemperature(parseInt(t[1] || '0', 10)),
    mimoPa: parseTemperature(parseInt(t[2] || '0', 10)),
    tcxo: parseTemperature(parseInt(t[3] || '0', 10)),
    peri1: parseTemperature(parseInt(t[4] || '0', 10)),
    peri2: parseTemperature(parseInt(t[5] || '0', 10)),
    ap1: parseTemperature(parseInt(t[6] || '0', 10)),
    ap2: parseTemperature(parseInt(t[7] || '0', 10)),
    modem1: parseTemperature(parseInt(t[8] || '0', 10)),
    modem2: parseTemperature(parseInt(t[9] || '0', 10)),
    bbp1: parseTemperature(parseInt(t[10] || '0', 10)),
    bbp2: parseTemperature(parseInt(t[11] || '0', 10)),
  };
}

export function getBandFromArfcn(type: 'LTE' | 'NR', arfcn: number): number | undefined {
  if (type === 'LTE') {
    if (arfcn >= 0 && arfcn <= 599) return 1;
    if (arfcn >= 1200 && arfcn <= 1949) return 3;
    if (arfcn >= 2400 && arfcn <= 2649) return 5;
    if (arfcn >= 3450 && arfcn <= 3799) return 8;
    if (arfcn >= 36200 && arfcn <= 36349) return 34;
    if (arfcn >= 37750 && arfcn <= 38249) return 38;
    if (arfcn >= 38250 && arfcn <= 38649) return 39;
    if (arfcn >= 38650 && arfcn <= 39649) return 40;
    if (arfcn >= 39650 && arfcn <= 41589) return 41;
  } else {
    if (arfcn >= 422000 && arfcn <= 434000) return 1;
    if (arfcn >= 361000 && arfcn <= 376000) return 3;
    if (arfcn >= 173800 && arfcn <= 178800) return 5;
    if (arfcn >= 185000 && arfcn <= 192000) return 8;
    if (arfcn >= 151600 && arfcn <= 160600) return 28;
    if (arfcn >= 499200 && arfcn <= 537999) return 41;
    if (arfcn >= 620000 && arfcn <= 653333) return 78;
    if (arfcn >= 653334 && arfcn <= 680000) return 77;
    if (arfcn >= 693334 && arfcn <= 733333) return 79;
  }
  return undefined;
}

export function getDefaultScsType(band?: number): number {
  if (!band) return 1;
  if ([77, 78, 79, 41].includes(band)) return 1;
  return 0;
}

export function signalColor(percent: string): string {
  const value = parseInt(percent, 10);
  if (!Number.isFinite(value)) return 'var(--semi-color-danger)';
  if (value >= 70) return 'var(--semi-color-success)';
  if (value >= 40) return 'var(--semi-color-warning)';
  return 'var(--semi-color-danger)';
}

export function rsrpColor(v: number): string {
  if (v >= -85) return 'var(--semi-color-success)';
  if (v >= -95) return 'var(--semi-color-warning)';
  return 'var(--semi-color-danger)';
}

export function tempColor(v: number): string {
  if (v <= 45) return 'var(--semi-color-success)';
  if (v <= 65) return 'var(--semi-color-warning)';
  return 'var(--semi-color-danger)';
}

export function modeColor(mode: string): string {
  if (mode.includes('NR')) return 'var(--semi-color-success)';
  if (mode.includes('LTE')) return 'var(--semi-color-tertiary)';
  if (mode.includes('WCDMA')) return 'var(--semi-color-warning)';
  return 'var(--semi-color-text-2)';
}
