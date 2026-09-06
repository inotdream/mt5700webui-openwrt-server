// 辅载波/辅站小区解析：
//   手册 13.27 AT^MONSSC     — NSA 下的 5G 辅连接服务小区（最多 8CC）
//   手册 13.18 AT^CASCELLINFO? — LTE CA 的辅小区（最多 4 个 SCELL）
//
// 现有的载波聚合展示来自 ^HFREQINFO，只有频点和带宽；这两条命令补的是
// 每个辅载波各自的信号质量，判断"聚上了但辅载波信号很差"要靠它们。

export interface SecondaryNR {
  arfcn: number;
  pci: number;
  rsrp: number | null;
  rsrq: number | null;
  sinr: number | null;
  measType: string;
}

// 手册 13.27.3 <MEASTYPE>：0 SSB 测量，1 CSI-RS 测量，
// 信号为无效值时填 BUTT（示例里是 2）。
const MEAS_TYPES: Record<number, string> = { 0: 'SSB', 1: 'CSI-RS' };

// 手册 13.27.3 给的无效值：RSRP -1256、RSRQ -348、SINR -188。
const NR_INVALID = { rsrp: -1256, rsrq: -348, sinr: -188 };

/**
 * 手册在这里自相矛盾：参数表说 RSRP 取值 -156~-31、无效值写成 -1256(-157*8)，
 * 暗示上报值是 8 倍；但它自己的示例给的是 -70、-20、-10 这种未放大的值。
 * 所以按量级判断：超出合法区间的当成 8 倍值还原，否则原样用。
 * 现有的 ^MONNC 解析也是这么处理的。
 */
const descale = (value: number, min: number, max: number): number =>
  value < min || value > max ? Number((value / 8).toFixed(1)) : value;

const int = (v: string): number | null => {
  const t = (v || '').trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** 解析一行 ^MONSSC。NONE（非 ENDC）或解析失败返回 null。 */
export const parseMonssc = (line: string): SecondaryNR | null => {
  const match = line.match(/\^MONSSC:\s*(.+)/);
  if (!match) return null;

  const f = match[1].split(',').map((s) => s.trim());
  const rat = f[0].replace(/"/g, '').toUpperCase();
  // 手册：NONE 表示非 ENDC 状态，后续无参数。LTE 分支手册标注暂不支持。
  if (rat !== 'NR' || f.length < 3) return null;

  const arfcn = int(f[1]);
  // 手册 13.27.3：<PCI> 十六进制，取值范围 0~0x3EF。
  const pci = f[2] === '' ? null : Number.parseInt(f[2], 16);
  if (arfcn === null || pci === null || Number.isNaN(pci)) return null;

  const raw = { rsrp: int(f[3]), rsrq: int(f[4]), sinr: int(f[5]) };
  const meas = int(f[6]);

  return {
    arfcn,
    pci,
    rsrp: raw.rsrp === null || raw.rsrp === NR_INVALID.rsrp ? null : descale(raw.rsrp, -156, -31),
    rsrq: raw.rsrq === null || raw.rsrq === NR_INVALID.rsrq ? null : descale(raw.rsrq, -43, 20),
    sinr: raw.sinr === null || raw.sinr === NR_INVALID.sinr ? null : descale(raw.sinr, -23, 40),
    measType: meas !== null && MEAS_TYPES[meas] ? MEAS_TYPES[meas] : '—',
  };
};

export const parseMonsscAll = (text: string): SecondaryNR[] =>
  text
    .split(/\r?\n/)
    .map(parseMonssc)
    .filter((c): c is SecondaryNR => c !== null);

export interface SecondaryLTE {
  index: number;
  pci: number;
  rssi: number | null;
  rsrp: number | null;
  rsrq: number | null;
  band: number;
  ulArfcn: number | null;
  dlArfcn: number | null;
  ulFreq: number | null;
  dlFreq: number | null;
  ulBandwidth: number | null;
  dlBandwidth: number | null;
}

// 手册 13.18.3 <ulbw>/<dlbw>
const LTE_BANDWIDTHS: Record<number, number> = { 0: 1.4, 1: 3, 2: 5, 3: 10, 4: 15, 5: 20 };

/** 解析一行 ^CASCELLINFO。CA 未配置时模组直接回 ERROR，这里自然解析不到。 */
export const parseCascell = (line: string): SecondaryLTE | null => {
  const match = line.match(/\^CASCELLINFO:\s*(.+)/);
  if (!match) return null;

  const f = match[1].split(',').map((s) => s.trim());
  if (f.length < 12) return null;

  const index = int(f[0]);
  const pci = int(f[1]);
  if (index === null || pci === null) return null;

  const bw = (v: string): number | null => {
    const n = int(v);
    return n === null ? null : (LTE_BANDWIDTHS[n] ?? null);
  };
  const freq = (v: string): number | null => {
    const n = int(v);
    // 手册：<ulfreq>/<dlfreq> 单位 100kHz，换成 MHz 显示。
    return n === null ? null : Number((n / 10).toFixed(1));
  };

  return {
    index,
    pci,
    rssi: int(f[2]),
    rsrp: int(f[3]),
    rsrq: int(f[4]),
    band: int(f[5]) ?? 0,
    ulArfcn: int(f[6]),
    dlArfcn: int(f[7]),
    ulFreq: freq(f[8]),
    dlFreq: freq(f[9]),
    ulBandwidth: bw(f[10]),
    dlBandwidth: bw(f[11]),
  };
};

export const parseCascellAll = (text: string): SecondaryLTE[] =>
  text
    .split(/\r?\n/)
    .map(parseCascell)
    .filter((c): c is SecondaryLTE => c !== null);

export interface CarrierSignal {
  pci: number;
  rsrp: number | null;
  rsrq: number | null;
  sinr: number | null;
  rssi?: number | null;
  measType?: string;
}

/**
 * 把 ^MONSSC / ^CASCELLINFO 的信号质量对应到 ^HFREQINFO 报出来的某个载波上。
 * 三条命令描述的是同一批载波，只是各报一部分：^HFREQINFO 给频点与带宽，
 * 另外两条给信号。按下行频点对齐即可合并展示。
 */
export const carrierSignalFor = (
  carrier: { sysMode: 'NR' | 'LTE'; dlFcn: string },
  nr: SecondaryNR[],
  lte: SecondaryLTE[],
): CarrierSignal | null => {
  const arfcn = Number(carrier.dlFcn);
  if (!Number.isFinite(arfcn)) return null;

  if (carrier.sysMode === 'NR') {
    const hit = nr.find((c) => c.arfcn === arfcn);
    return hit
      ? { pci: hit.pci, rsrp: hit.rsrp, rsrq: hit.rsrq, sinr: hit.sinr, measType: hit.measType }
      : null;
  }

  const hit = lte.find((c) => c.dlArfcn === arfcn);
  return hit ? { pci: hit.pci, rsrp: hit.rsrp, rsrq: hit.rsrq, sinr: null, rssi: hit.rssi } : null;
};

/** 找出没能对应到任何载波的辅小区，避免合并之后把数据悄悄丢掉。 */
export const unmatchedSecondaries = (
  carriers: Array<{ sysMode: 'NR' | 'LTE'; dlFcn: string }>,
  nr: SecondaryNR[],
  lte: SecondaryLTE[],
): { nr: SecondaryNR[]; lte: SecondaryLTE[] } => {
  const arfcns = new Set(carriers.map((c) => Number(c.dlFcn)));
  return {
    nr: nr.filter((c) => !arfcns.has(c.arfcn)),
    lte: lte.filter((c) => c.dlArfcn === null || !arfcns.has(c.dlArfcn)),
  };
};
