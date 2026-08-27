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
  /** LTE/NR 下为频点（可直接用于锁频），GSM/WCDMA 下为该制式的频点 */
  freq: number | null;
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

  return {
    rat: rat as ScanRat,
    ratName: RAT_NAMES[rat],
    plmn: f[1].replace(/"/g, ''),
    freq: dec(f[2]),
    pci: dec(f[3]),
    band: parseBand(f[4]),
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
