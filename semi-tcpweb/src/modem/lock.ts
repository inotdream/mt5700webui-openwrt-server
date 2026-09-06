import { getDefaultScsType } from './parse';

// 锁频参数的取值范围来自 AT 手册 13.12.3 / 13.13.3：
// 锁的个数 1~20，band 0~65535，频点 0~4294967295，LTE PCI 0~503，NR PCI 0~1007。
export const MAX_LOCK_ITEMS = 20;
export const MAX_ARFCN = 4294967295;
export const MAX_PCI = { lte: 503, nr: 1007 } as const;

export type LockKind = 'lte' | 'nr';
export type LockItem = { band?: number; arfcn?: string; pci?: string; scs?: number };

// 与后端 UCI 里的 schedule_*_{lte,nr}_* 一组选项对应，逗号分隔的分组字符串。
export type LockLists = { type: number; bands: string; arfcns: string; scs_types: string; pcis: string };

export const LOCK_TYPES = [
  { label: '关闭', value: 0 },
  { label: '锁定频点', value: 1 },
  { label: '锁定小区', value: 2 },
  { label: '锁定 Band', value: 3 },
];

export const LTE_BANDS = [
  { label: 'B1 2100MHz', value: 1 },
  { label: 'B3 1800MHz', value: 3 },
  { label: 'B5 850MHz', value: 5 },
  { label: 'B8 900MHz', value: 8 },
  { label: 'B34 2100MHz TDD', value: 34 },
  { label: 'B38 2600MHz TDD', value: 38 },
  { label: 'B39 1900MHz TDD', value: 39 },
  { label: 'B40 2300MHz TDD', value: 40 },
  { label: 'B41 2500MHz TDD', value: 41 },
];

export const NR_BANDS = [
  { label: 'n1 2100MHz', value: 1 },
  { label: 'n3 1800MHz', value: 3 },
  { label: 'n5 850MHz', value: 5 },
  { label: 'n8 900MHz', value: 8 },
  { label: 'n28 700MHz', value: 28 },
  { label: 'n41 2500MHz', value: 41 },
  { label: 'n77 3700MHz', value: 77 },
  { label: 'n78 3500MHz', value: 78 },
  { label: 'n79 4700MHz', value: 79 },
];

export const SCS_TYPES = [
  { label: '15 kHz', value: 0 },
  { label: '30 kHz', value: 1 },
  { label: '60 kHz', value: 2 },
  { label: '120 kHz', value: 3 },
  { label: '240 kHz', value: 4 },
];

export const emptyLockItem = (): LockItem => ({});

export const lockKindLabel = (kind: LockKind) => (kind === 'lte' ? 'LTE' : 'NR');

export function checkArfcn(label: string, raw: string): string {
  if (!/^\d+$/.test(raw)) throw new Error(`${label} 频点必须为 0-${MAX_ARFCN} 的整数`);
  if (Number(raw) > MAX_ARFCN) throw new Error(`${label} 频点超出范围（0-${MAX_ARFCN}）`);
  return raw;
}

export function checkPci(kind: LockKind, raw: string): string {
  const max = MAX_PCI[kind];
  const label = lockKindLabel(kind);
  if (!/^\d+$/.test(raw)) throw new Error(`${label} PCI 必须为 0-${max} 的整数`);
  if (Number(raw) > max) throw new Error(`${label} PCI 超出范围（0-${max}）`);
  return raw;
}

/**
 * 把界面上的锁频项整理成手册要求的分组参数：每个参数是一个带引号的字符串，
 * 内部用逗号分隔，且各参数携带的个数必须与 num 相同（手册 13.12.3）。
 * 校验不通过时抛错，调用方应当在下发任何命令、切飞行模式之前先调用它。
 */
export function toLockLists(kind: LockKind, type: number, items: LockItem[]): LockLists {
  const empty: LockLists = { type, bands: '', arfcns: '', scs_types: '', pcis: '' };
  if (type === 0) return empty;

  const label = lockKindLabel(kind);
  const valid = items.filter((i) => i.band != null);
  if (!valid.length) throw new Error(`请至少输入一个有效的 ${label} 频段`);
  if (valid.length > MAX_LOCK_ITEMS) throw new Error(`${label} 最多只能锁 ${MAX_LOCK_ITEMS} 组`);

  const bands = valid.map((i) => String(i.band)).join(',');
  if (type === 3) return { ...empty, bands };

  const arfcns = valid.map((i) => checkArfcn(label, String(i.arfcn || '').trim())).join(',');
  const scs_types = kind === 'nr' ? valid.map((i) => String(i.scs ?? getDefaultScsType(i.band))).join(',') : '';
  if (type === 1) return { ...empty, bands, arfcns, scs_types };

  const pcis = valid.map((i) => checkPci(kind, String(i.pci || '').trim())).join(',');
  return { type, bands, arfcns, scs_types, pcis };
}

/** 按手册 13.12.1 / 13.13.1 拼出锁频命令。NR 比 LTE 多一个 scstype 参数。 */
export function buildLockCommand(kind: LockKind, type: number, mobility: number, items: LockItem[]): string {
  const cmd = kind === 'lte' ? 'AT^LTEFREQLOCK' : 'AT^NRFREQLOCK';
  if (type === 0) return `${cmd}=0`;

  const l = toLockLists(kind, type, items);
  const num = l.bands.split(',').length;
  const head = `${cmd}=${type},${mobility},${num}`;
  if (type === 3) return `${head},"${l.bands}"`;
  if (kind === 'lte') {
    return type === 1
      ? `${head},"${l.bands}","${l.arfcns}"`
      : `${head},"${l.bands}","${l.arfcns}","${l.pcis}"`;
  }
  return type === 1
    ? `${head},"${l.bands}","${l.arfcns}","${l.scs_types}"`
    : `${head},"${l.bands}","${l.arfcns}","${l.scs_types}","${l.pcis}"`;
}

/** 把后端存的分组字符串还原成界面用的逐行结构。 */
export function fromLockLists(kind: LockKind, lists: LockLists): LockItem[] {
  const split = (v: string) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
  const bands = split(lists.bands);
  if (!bands.length) return [emptyLockItem()];

  const arfcns = split(lists.arfcns);
  const scs = split(lists.scs_types);
  const pcis = split(lists.pcis);
  return bands.map((band, i) => ({
    band: Number(band),
    arfcn: arfcns[i],
    pci: pcis[i],
    scs: kind === 'nr' ? (scs[i] != null ? Number(scs[i]) : getDefaultScsType(Number(band))) : undefined,
  }));
}
