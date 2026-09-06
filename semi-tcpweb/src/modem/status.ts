// 运行状态类查询的解析：
//   手册 11.7  AT^LENDC?     — NSA 下 LTE-NR 双连接是否真的建起来了
//   手册 13.23 AT^TXPOWER?   — GUL 发射功率（ENDC 下查的是 LTE 侧）
//   手册 13.24 AT^NTXPOWER?  — NR 发射功率，支持多 CC
//   手册 5.27  AT+C5GREG?    — 5G 核心网注册状态
//   手册 7.8   AT+CGPADDR    — PDP 上下文实际使用的地址

export interface EndcStatus {
  /** 当前小区是否支持 ENDC（SIB2 upperLayerIndication） */
  available: boolean;
  /** 当前小区所选 PLMN 是否支持 ENDC */
  plmnAvailable: boolean;
  /** 手册 11.7.3：0 表示 restricted，1 表示 not restricted */
  restricted: boolean;
  /** PSCell 是否为 NR，也就是 ENDC 是否真的建立了 */
  established: boolean;
}

/**
 * 查询应答比 URC 多一个 <enable> 前缀字段，手册 11.7.1 里两者格式不同：
 *   AT^LENDC? -> ^LENDC:<enable>,<endc_available>,<endc_plmn_available>,<endc_restricted>,<nr_pscell>
 *   URC       -> ^LENDC:<endc_available>,<endc_plmn_available>,<endc_restricted>,<nr_pscell>
 * 按字段个数区分，别把 enable 当成 available 用。
 */
export const parseLendc = (text: string): EndcStatus | null => {
  const match = text.match(/\^LENDC:\s*([\d,\s]+)/);
  if (!match) return null;

  const f = match[1]
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
  const v = f.length >= 5 ? f.slice(1) : f;
  if (v.length < 4) return null;

  return {
    available: v[0] === 1,
    plmnAvailable: v[1] === 1,
    restricted: v[2] === 0,
    established: v[3] === 1,
  };
};

export interface TxPower {
  /** 2G/3G 的总发射功率，单位已从 0.1dBm 还原为 dBm；4G 下模组填 999，这里给 null */
  total: number | null;
  pusch: number | null;
  pucch: number | null;
  srs: number | null;
  prach: number | null;
}

// 手册 13.23.3 / 13.24.3：各信道功率无效值都是 999。
const INVALID_POWER = 999;

const power = (v: string): number | null => {
  const n = Number((v || '').trim());
  if (!Number.isFinite(n) || n === INVALID_POWER) return null;
  return n;
};

/** 解析 AT^TXPOWER? 的应答（LTE/GU 发射功率）。 */
export const parseTxPower = (text: string): TxPower | null => {
  const match = text.match(/\^TXPOWER:\s*(.+)/);
  if (!match) return null;
  const f = match[1].split(',');
  if (f.length < 5) return null;

  const total = power(f[0]);
  return {
    // 手册：<stxpwr> 单位 0.1dBm，2G 上报 0~330，3G 上报 -510~240。
    total: total === null ? null : Number((total / 10).toFixed(1)),
    pusch: power(f[1]),
    pucch: power(f[2]),
    srs: power(f[3]),
    prach: power(f[4]),
  };
};

export interface NrTxPower {
  pusch: number | null;
  pucch: number | null;
  srs: number | null;
  prach: number | null;
  /** 手册：<FreqN> 单位 kHz，无效值 0 */
  freq: number | null;
}

/** 解析 AT^NTXPOWER? 的应答，每 5 个字段一个载波，最多 4 个。 */
export const parseNrTxPower = (text: string): NrTxPower[] => {
  const match = text.match(/\^NTXPOWER:\s*(.+)/);
  if (!match) return [];

  const f = match[1].split(',').map((s) => s.trim());
  const carriers: NrTxPower[] = [];
  for (let i = 0; i + 4 < f.length && carriers.length < 4; i += 5) {
    const freq = Number(f[i + 4]);
    carriers.push({
      pusch: power(f[i]),
      pucch: power(f[i + 1]),
      srs: power(f[i + 2]),
      prach: power(f[i + 3]),
      freq: Number.isFinite(freq) && freq !== 0 ? freq : null,
    });
  }
  return carriers;
};

// 手册 5.27.3 <stat>
const REG_STATES: Record<number, string> = {
  0: '未注册，未搜网',
  1: '已注册本地网络',
  2: '未注册，搜网中',
  3: '注册被拒绝',
  4: '未知原因',
  5: '已注册漫游网络',
  8: '仅紧急业务',
};

// 手册 5.27.3 <AcT>
const ACT_TYPES: Record<number, string> = { 10: 'EUTRAN-5GC', 11: 'NR-5GC' };

export interface Reg5G {
  stat: number;
  statText: string;
  registered: boolean;
  tac: string;
  ci: string;
  act: string;
  nssai: string;
}

/**
 * 解析 AT+C5GREG? 的应答：+C5GREG: <n>,<stat>[,<tac>,<ci>,<AcT>,<len>,<NSSAI>]。
 * 第一个字段是 URC 上报模式而不是注册状态，真机上常见 1 或 2。
 */
export const parseC5greg = (text: string): Reg5G | null => {
  const match = text.match(/\+C5GREG:\s*(.+)/);
  if (!match) return null;

  const f = match[1].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
  if (f.length < 2) return null;

  const stat = Number(f[1]);
  if (!Number.isFinite(stat)) return null;
  const act = Number(f[4]);

  return {
    stat,
    statText: REG_STATES[stat] ?? `状态 ${stat}`,
    registered: stat === 1 || stat === 5,
    tac: f[2] || '',
    ci: f[3] || '',
    act: ACT_TYPES[act] ?? '',
    nssai: f[6] || '',
  };
};

export interface PdpAddress {
  cid: number;
  address: string;
  family: 'IPv4' | 'IPv6' | '未知';
}

/**
 * 手册 7.8.5 的 IPv6 示例是 16 个点分十进制字节
 * （"32.8.0.2.0.2.0.1.255.255.255.255.255.255.255.255"），
 * 直接显示没法看，这里还原成标准写法。
 */
const formatPdpAddress = (raw: string): { address: string; family: PdpAddress['family'] } => {
  const parts = raw.split('.').map((v) => Number(v));
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    return { address: parts.join('.'), family: 'IPv4' };
  }
  if (parts.length === 16 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const groups: string[] = [];
    for (let i = 0; i < 16; i += 2) {
      groups.push(((parts[i] << 8) | parts[i + 1]).toString(16));
    }
    return { address: compressIPv6(groups), family: 'IPv6' };
  }
  return { address: raw, family: raw.includes(':') ? 'IPv6' : '未知' };
};

// 把最长的一段连续 0 折叠成 ::，符合 RFC 5952 的常见写法。
const compressIPv6 = (groups: string[]): string => {
  let bestStart = -1;
  let bestLen = 0;
  let start = -1;
  let len = 0;
  groups.forEach((g, i) => {
    if (g === '0') {
      if (start < 0) start = i;
      len += 1;
      if (len > bestLen) {
        bestLen = len;
        bestStart = start;
      }
    } else {
      start = -1;
      len = 0;
    }
  });
  if (bestLen < 2) return groups.join(':');
  const head = groups.slice(0, bestStart).join(':');
  const tail = groups.slice(bestStart + bestLen).join(':');
  return `${head}::${tail}`;
};

export const parseCgpaddr = (text: string): PdpAddress[] =>
  text
    .split(/\r?\n/)
    .map((line) => line.match(/\+CGPADDR:\s*(\d+),?\s*"?([^"\r\n]*)"?/))
    .filter((m): m is RegExpMatchArray => m !== null && m[2].trim() !== '')
    .map((m) => {
      const { address, family } = formatPdpAddress(m[2].trim());
      return { cid: Number(m[1]), address, family };
    });
