// 手册 5.35 AT^CELLSCAN-小区扫频。
//
// 应答格式（每个小区一行）：
//   ^CELLSCAN: <rat>,<plmn>,<freq>,[pci],<band>,<lac>,<cid>,[rxlev],[bsic],
//              [psc],[5GSCS],[5GRSRP],[5GRSRQ],[5GRSINR],[LTERSINR]
//
// 有两处得当心：
//  1. 手册写的是 15 个字段，但它自己给的示例只有 14 个（末尾的空字段被省了），
//     所以解析必须容忍末尾缺字段。
//  2. <band>/<lac>/<cid> 是十六进制，<pci>/<psc> 是十进制，混在同一行里。

export type ScanRat = 0 | 1 | 2 | 3;

export interface ScanCell {
  rat: ScanRat;
  ratName: string;
  plmn: string;
  /** 模组在 ^CELLSCAN 第三个字段里上报的原始值，不同固件可能是频率或 ARFCN。 */
  freq: number | null;
  /** 归一化后的 LTE EARFCN / NR-ARFCN，可直接用于锁频。 */
  arfcn: number | null;
  /** 根据原始频率或 ARFCN 换算出的中心频率，单位 MHz。 */
  frequencyMhz: number | null;
  pci: number | null;
  /** 频段号，已从手册的十六进制换算成十进制；解析不出来时为 null */
  band: number | null;
  lac: string;
  cid: string;
  rxlev: number | null;
  bsic: number | null;
  psc: number | null;
  scs: number | null;
  rsrp: number | null;
  rsrq: number | null;
  sinr: number | null;
  raw: string;
}

const RAT_NAMES: Record<number, string> = { 0: 'GSM', 1: 'WCDMA', 2: 'LTE', 3: 'NR' };

// 手册 5.35.3：<5GRSRP>/<5GRSRQ>/<5GRSINR> 无效值均为 99。
const INVALID_MEASURE = 99;

const dec = (v: string): number | null => {
  const t = v.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const hex = (v: string): number | null => {
  const t = v.trim();
  if (t === '') return null;
  const n = Number.parseInt(t, 16);
  return Number.isNaN(n) ? null : n;
};

const measure = (v: string, scale = 1): number | null => {
  const n = dec(v);
  if (n === null || n === INVALID_MEASURE) return null;
  return scale === 1 ? n : n * scale;
};

/**
 * 上报的 <band> 是十六进制的频段号（手册：LTE/NR"按值表示band，例如 1-Band1、
 * 100-band256"）。但手册自己的 LTE 示例给的是 10000，换算过来是 65536，
 * 根本不是合法频段号。宁可显示"未知"也不要把 65536 当频段展示出去。
 */
const MAX_BAND = 512;

const parseBand = (v: string): number | null => {
  const n = hex(v);
  if (n === null || n <= 0 || n > MAX_BAND) return null;
  return n;
};

interface NormalizedFrequency {
  arfcn: number | null;
  frequencyMhz: number | null;
}

// 3GPP TS 38.104 的全局 NR-ARFCN 栅格。常用频段范围用于区分模组上报的是
// ARFCN 还是 kHz；例如 n78 的 3408960 kHz 会被换算成 NR-ARFCN 627264。
const NR_ARFCN_RANGES: Record<number, [number, number]> = {
  1: [422000, 434000],
  3: [361000, 376000],
  5: [173800, 178800],
  8: [185000, 192000],
  28: [151600, 160600],
  41: [499200, 537999],
  77: [620000, 680000],
  78: [620000, 653333],
  79: [693334, 733333],
};

const nrFrequencyKhzFromArfcn = (arfcn: number): number => {
  if (arfcn < 600000) return arfcn * 5;
  if (arfcn < 2016667) return 3000000 + (arfcn - 600000) * 15;
  return 24250080 + (arfcn - 2016667) * 60;
};

const nrArfcnFromFrequencyKhz = (frequencyKhz: number): number => {
  if (frequencyKhz < 3000000) return Math.round(frequencyKhz / 5);
  if (frequencyKhz < 24250080) return 600000 + Math.round((frequencyKhz - 3000000) / 15);
  return 2016667 + Math.round((frequencyKhz - 24250080) / 60);
};

const normalizeNrFrequency = (raw: number, band: number | null): NormalizedFrequency => {
  const range = band == null ? undefined : NR_ARFCN_RANGES[band];
  const rawIsArfcn = !!range && raw >= range[0] && raw <= range[1];
  const arfcn = rawIsArfcn ? raw : nrArfcnFromFrequencyKhz(raw);
  return { arfcn, frequencyMhz: nrFrequencyKhzFromArfcn(arfcn) / 1000 };
};

interface LteBandRaster {
  low100Khz: number;
  offset: number;
  min: number;
  max: number;
}

// LTE 下行 EARFCN 栅格，3GPP TS 36.101 Table 5.7.3-1：
// F_DL = F_DL_low + 0.1 MHz × (N_DL − N_Offs-DL)。low100Khz 即 F_DL_low 以 100 kHz 计。
const LTE_BAND_RASTERS: Record<number, LteBandRaster> = {
  1: { low100Khz: 21100, offset: 0, min: 0, max: 599 },
  2: { low100Khz: 19300, offset: 600, min: 600, max: 1199 },
  3: { low100Khz: 18050, offset: 1200, min: 1200, max: 1949 },
  4: { low100Khz: 21100, offset: 1950, min: 1950, max: 2399 },
  5: { low100Khz: 8690, offset: 2400, min: 2400, max: 2649 },
  7: { low100Khz: 26200, offset: 2750, min: 2750, max: 3449 },
  8: { low100Khz: 9250, offset: 3450, min: 3450, max: 3799 },
  12: { low100Khz: 7290, offset: 5010, min: 5010, max: 5179 },
  13: { low100Khz: 7460, offset: 5180, min: 5180, max: 5279 },
  17: { low100Khz: 7340, offset: 5730, min: 5730, max: 5849 },
  18: { low100Khz: 8600, offset: 5850, min: 5850, max: 5999 },
  19: { low100Khz: 8750, offset: 6000, min: 6000, max: 6149 },
  20: { low100Khz: 7910, offset: 6150, min: 6150, max: 6449 },
  25: { low100Khz: 19300, offset: 8040, min: 8040, max: 8689 },
  26: { low100Khz: 8590, offset: 8690, min: 8690, max: 9039 },
  28: { low100Khz: 7580, offset: 9210, min: 9210, max: 9659 },
  34: { low100Khz: 20100, offset: 36200, min: 36200, max: 36349 },
  38: { low100Khz: 25700, offset: 37750, min: 37750, max: 38249 },
  39: { low100Khz: 18800, offset: 38250, min: 38250, max: 38649 },
  40: { low100Khz: 23000, offset: 38650, min: 38650, max: 39649 },
  41: { low100Khz: 24960, offset: 39650, min: 39650, max: 41589 },
  42: { low100Khz: 34000, offset: 41590, min: 41590, max: 43589 },
  43: { low100Khz: 36000, offset: 43590, min: 43590, max: 45589 },
  66: { low100Khz: 21100, offset: 66436, min: 66436, max: 67335 },
};

// EARFCN 是 16 位数（TS 36.101 上限 65535），比它大的值只可能是 kHz 频率。
const MAX_EARFCN = 65535;

/** 把锁频/邻区接口使用的 ARFCN 转为便于阅读的中心频率。 */
export const arfcnToFrequencyMhz = (
  type: 'LTE' | 'NR',
  arfcn: number,
  band?: number | null,
): number | null => {
  if (!Number.isFinite(arfcn)) return null;
  if (type === 'NR') return nrFrequencyKhzFromArfcn(arfcn) / 1000;
  const raster = band == null ? undefined : LTE_BAND_RASTERS[band];
  if (!raster || arfcn < raster.min || arfcn > raster.max) return null;
  return (raster.low100Khz + arfcn - raster.offset) / 10;
};

// 手册 5.35.3：LTE/NR 下 <freq> 上报的是 kHz 频率，只有 GSM/WCDMA 才是频点。
// 换算不出可靠 EARFCN 的情况一律返回 arfcn=null：锁频按钮据此禁用，
// 绝不能把 kHz 原值当 ARFCN 塞进 AT^LTEFREQLOCK。
const normalizeLteFrequency = (raw: number, band: number | null): NormalizedFrequency => {
  const raster = band == null ? undefined : LTE_BAND_RASTERS[band];
  if (!raster) {
    // 频段没有栅格表：值大于 EARFCN 上限的一定是 kHz，至少把频率显示出来；
    // 否则当作某些固件直接上报的 EARFCN，但没有栅格算不出频率。
    return raw > MAX_EARFCN
      ? { arfcn: null, frequencyMhz: raw / 1000 }
      : { arfcn: raw, frequencyMhz: null };
  }

  const rawIsArfcn = raw >= raster.min && raw <= raster.max;
  const arfcn = rawIsArfcn ? raw : raster.offset + Math.round(raw / 100 - raster.low100Khz);
  if (arfcn < raster.min || arfcn > raster.max) {
    // 频率落在该频段的栅格之外，频段和频率对不上，只展示频率不给锁
    return { arfcn: null, frequencyMhz: raw > MAX_EARFCN ? raw / 1000 : null };
  }
  return { arfcn, frequencyMhz: arfcnToFrequencyMhz('LTE', arfcn, band) };
};

const normalizeFrequency = (rat: number, raw: number | null, band: number | null): NormalizedFrequency => {
  if (raw == null) return { arfcn: null, frequencyMhz: null };
  if (rat === 3) return normalizeNrFrequency(raw, band);
  if (rat === 2) return normalizeLteFrequency(raw, band);
  return { arfcn: raw, frequencyMhz: null };
};

/** 解析一行 ^CELLSCAN 应答，不是扫频结果则返回 null。 */
export const parseScanLine = (line: string): ScanCell | null => {
  const idx = line.indexOf('^CELLSCAN:');
  if (idx < 0) return null;

  const body = line.slice(idx + '^CELLSCAN:'.length).trim();
  if (body === '' || /^(STARTED|OK)$/i.test(body)) return null;

  // 末尾字段可能被省略，补齐到 15 个再取，避免下标越界。
  const f = body.split(',').map((s) => s.trim());
  while (f.length < 15) f.push('');

  const rat = dec(f[0]);
  if (rat === null || !(rat in RAT_NAMES)) return null;

  const rawFreq = dec(f[2]);
  const band = parseBand(f[4]);
  const normalized = normalizeFrequency(rat, rawFreq, band);

  return {
    rat: rat as ScanRat,
    ratName: RAT_NAMES[rat],
    plmn: f[1].replace(/"/g, ''),
    freq: rawFreq,
    arfcn: normalized.arfcn,
    frequencyMhz: normalized.frequencyMhz,
    pci: dec(f[3]),
    band,
    lac: f[5].trim(),
    cid: f[6].trim(),
    rxlev: dec(f[7]),
    bsic: dec(f[8]),
    psc: dec(f[9]),
    scs: dec(f[10]),
    rsrp: measure(f[11]),
    // 手册：<5GRSRQ> 单位 0.5dB，<5GRSINR> 单位 0.5dB，<LTESINR> 单位 0.125dB。
    rsrq: measure(f[12], 0.5),
    sinr: rat === 2 ? measure(f[14], 0.125) : measure(f[13], 0.5),
    raw: line.trim(),
  };
};

export const parseScanLines = (lines: string[]): ScanCell[] =>
  lines.map(parseScanLine).filter((c): c is ScanCell => c !== null);

export interface ScanFilter {
  /** 空串表示不指定接入技术，由模组扫描所有支持的制式。 */
  rat?: '' | '1' | '2' | '3';
  plmn?: string;
  freq?: string;
  pci?: string;
  band?: string;
  scs?: string;
}

export interface ScanCommand {
  command: string;
  error?: string;
}

/**
 * 手册 5.35.3 明说"<band> 分为指定 Band 和 上报 Band，格式不同"：
 * 上报的是十六进制数值（1 就是 Band1），而**指定**的是十六进制位图
 * （"01：Lte Band1；40：Lte Band7；8000000000：Nr Band40"，即 1<<(N-1)）。
 * 直接把频段号填进去会扫到完全不相干的频段，所以这里做位移换算。
 * n78 需要 1<<77，超出 Number 安全范围，只能用 BigInt。
 */
export const scanBandMask = (band: number): string => (1n << BigInt(band - 1)).toString(16).toUpperCase();

/**
 * 按手册 5.35.1 拼扫频命令，同时把手册写明的几条约束提前挡下来，
 * 免得白等一次几分钟的超时才拿到 CME ERROR。
 */
export const buildScanCommand = (f: ScanFilter): ScanCommand => {
  const rat = f.rat || '';
  const plmn = (f.plmn || '').trim();
  const freq = (f.freq || '').trim();
  const pci = (f.pci || '').trim();
  const band = (f.band || '').trim();
  const scs = (f.scs || '').trim();

  // 手册：不指定接入技术的情况下指定频点/小区，返回失败。
  if ((freq || pci) && rat === '') return { command: '', error: '指定频点或 PCI 时必须选择接入技术' };
  // 手册：<pci> 在指定接入技术和频点的情况下才有效。
  if (pci && !freq) return { command: '', error: '指定 PCI 时必须同时指定频点' };
  // 手册：<band> 和 <freq> 不能同时指定。
  if (band && freq) return { command: '', error: '频段与频点不能同时指定' };
  // 手册：只支持制式为 LTE、NR 下指定 pci。
  if (pci && rat !== '2' && rat !== '3') return { command: '', error: '只有 LTE 与 NR 支持指定 PCI' };
  // 手册：<rat> 等于 3 并且指定了 <freq> 或 <pci> 时，必须同时指定 <5GSCS>。
  if (rat === '3' && (freq || pci) && scs === '') {
    return { command: '', error: 'NR 指定频点或 PCI 时必须同时选择子载波间隔' };
  }

  let bandArg = '';
  if (band) {
    const n = Number(band);
    if (!Number.isInteger(n) || n < 1 || n > MAX_BAND) return { command: '', error: `频段号超出范围（1-${MAX_BAND}）` };
    bandArg = scanBandMask(n);
  }

  const args = [rat, plmn ? `"${plmn}"` : '', freq, pci, bandArg, scs];
  while (args.length > 0 && args[args.length - 1] === '') args.pop();
  if (args.length === 0) return { command: 'AT^CELLSCAN' };
  return { command: `AT^CELLSCAN=${args.join(',')}` };
};

/** 打断扫频的伪命令，服务端会翻译成手册要求的 abcd。 */
export const SCAN_ABORT_COMMAND = 'AT^CELLSCAN=ABORT';

/**
 * 查询服务端是否还有扫频在跑的伪命令。扫频是异步执行的，页面刷新后前端并不
 * 知道还有一次扫描在进行，只会看到所有命令都被"正在扫频"挡回来却不知道为什么。
 */
export const SCAN_STATE_COMMAND = 'AT^CELLSCAN=STATE';

export const isScanRunning = (text: string): boolean => /\^CELLSCAN:\s*RUNNING/i.test(text);

export type ScanState = 'running' | 'done' | 'aborted' | 'error';

export interface ScanPush {
  state: ScanState;
  cell?: string;
  lines?: string[];
  count: number;
  error?: string;
}
