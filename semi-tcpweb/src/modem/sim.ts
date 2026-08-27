// SIM 卡锁相关：
//   手册 6.3  AT+CPIN   — 查询是否有密码输入请求，以及校验 PIN / 用 PUK 解锁
//   手册 6.6  AT^SIMSQ  — SIM 卡状态查询与主动上报（卡不在位/被锁/锁死等）
//   手册 5.6  AT+CLCK   — "SC" 即 SIM PIN1 的启用/关闭/查询
//   手册 5.7  AT+CPWD   — 修改 PIN，<fac> 只支持 "SC" 与 "P2"
//   手册 20.2 CME ERROR 列表

export type SimLock = 'ready' | 'pin' | 'puk' | 'pin2' | 'puk2' | 'network' | 'absent' | 'unknown';

export interface SimState {
  /** +CPIN 原始 <code>，例如 "SIM PIN" */
  code: string;
  lock: SimLock;
  label: string;
  /** 是否需要用户输入密码才能继续用卡 */
  blocked: boolean;
  /** 需要 PUK 时为 true：此时要同时输入 PUK 和新 PIN */
  needsNewPin: boolean;
}

// 手册 6.3.3 <code> 取值。
const CPIN_CODES: Record<string, { lock: SimLock; label: string }> = {
  READY: { lock: 'ready', label: '无需密码，SIM 卡可用' },
  'SIM PIN': { lock: 'pin', label: '需要输入 PIN 码' },
  'SIM PUK': { lock: 'puk', label: 'PIN 已被锁定，需要 PUK 解锁' },
  'SIM PIN2': { lock: 'pin2', label: '需要输入 PIN2 码' },
  'SIM PUK2': { lock: 'puk2', label: 'PIN2 已被锁定，需要 PUK2 解锁' },
  'PH-NET PIN': { lock: 'network', label: '需要网络锁 PIN 码' },
  'PH-NET PUK': { lock: 'network', label: '需要网络锁 PUK 码' },
  'PH-NETSUB PIN': { lock: 'network', label: '需要子网锁 PIN 码' },
  'PH-NETSUB PUK': { lock: 'network', label: '需要子网锁 PUK 码' },
  'PH-SP PIN': { lock: 'network', label: '需要服务提供商锁 PIN 码' },
  'PH-SP PUK': { lock: 'network', label: '需要服务提供商锁 PUK 码' },
};

export const simStateOf = (code: string): SimState => {
  const key = code.trim().replace(/"/g, '').toUpperCase();
  const hit = CPIN_CODES[key];
  const lock = hit?.lock ?? 'unknown';
  return {
    code: key,
    lock,
    label: hit?.label ?? `未知状态：${key || '空'}`,
    blocked: lock !== 'ready' && lock !== 'unknown',
    needsNewPin: lock === 'puk' || lock === 'puk2',
  };
};

/**
 * 解析 AT+CPIN? 的应答。没插卡时模组回的是 +CME ERROR: 10 而不是 +CPIN，
 * 所以失败分支也要看一眼错误码，不能只当成"查询失败"。
 */
export const parseCpin = (text: string): SimState | null => {
  const match = text.match(/\+CPIN:\s*([^\r\n]+)/);
  if (match) return simStateOf(match[1]);

  const err = cmeErrorCode(text);
  if (err === 10) {
    return { code: 'ABSENT', lock: 'absent', label: '未检测到 SIM 卡', blocked: false, needsNewPin: false };
  }
  // 手册 20.2：11/17 需要 PIN，12/18 需要 PUK。有些固件在查询时也用错误码答复。
  if (err === 11) return simStateOf('SIM PIN');
  if (err === 12) return simStateOf('SIM PUK');
  if (err === 17) return simStateOf('SIM PIN2');
  if (err === 18) return simStateOf('SIM PUK2');
  return null;
};

// 手册 6.6.3 <sim_status>
const SIM_STATUS: Record<number, string> = {
  0: '卡不在位',
  1: '卡已插入',
  2: '卡被 PIN/PUK 锁定',
  3: 'SIMLOCK 锁定',
  10: '卡文件初始化中',
  11: '卡初始化完成，可接入网络',
  12: '卡就绪，短信与电话本可用',
  98: '卡已失效（PUK 锁死或物理损坏）',
  99: '卡已移除',
  100: '卡初始化失败',
};

export interface SimSlotStatus {
  status: number;
  label: string;
  /** 98 是 PUK 输错次数用尽或卡物理损坏，已经救不回来了 */
  dead: boolean;
  present: boolean;
}

/** 解析 AT^SIMSQ? 的应答或同名主动上报：^SIMSQ: <mode>,<sim_status>。 */
export const parseSimsq = (text: string): SimSlotStatus | null => {
  const match = text.match(/\^SIMSQ:\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  const status = Number(match[2]);
  return {
    status,
    label: SIM_STATUS[status] ?? `状态 ${status}`,
    dead: status === 98,
    present: status !== 0 && status !== 99,
  };
};

// 手册 20.2 CME ERROR 列表里与 SIM 相关的条目。
const CME_MESSAGES: Record<number, string> = {
  3: '操作不允许（当前没有待输入的密码）',
  5: '需要输入 PH-SIM PIN 码',
  10: '没有检测到 SIM 卡',
  11: '需要先输入 PIN 码',
  12: '需要先用 PUK 解锁',
  13: 'SIM 卡故障',
  14: 'SIM 卡忙，请稍后重试',
  15: 'SIM 卡错误',
  16: '密码错误',
  17: '需要先输入 PIN2 码',
  18: '需要先用 PUK2 解锁',
};

// CMEE=2 时模组回的是描述字符串而不是编号，两种都要认。
const CME_TEXTS: Record<string, number> = {
  'operation not allowed': 3,
  'sim not inserted': 10,
  'sim pin required': 11,
  'sim puk required': 12,
  'sim failure': 13,
  'sim busy': 14,
  'sim wrong': 15,
  'incorrect password': 16,
  'sim pin2 required': 17,
  'sim puk2 required': 18,
};

/** 从应答里取出 CME 错误码；模组回的是描述字符串时反查成编号。 */
export const cmeErrorCode = (raw: string): number | null => {
  const match = String(raw || '').match(/\+CME ERROR:\s*(.+)/i);
  if (!match) return null;
  const body = match[1].trim().replace(/[\r\n].*$/s, '');
  if (/^\d+$/.test(body)) return Number(body);
  return CME_TEXTS[body.toLowerCase()] ?? null;
};

/** 把失败应答翻译成给用户看的话。 */
export const simErrorMessage = (raw: string, fallback: string): string => {
  const code = cmeErrorCode(raw);
  if (code !== null && CME_MESSAGES[code]) return CME_MESSAGES[code];
  const match = String(raw || '').match(/\+CME ERROR:\s*(.+)/i);
  if (match) return `${fallback}：${match[1].trim()}`;
  return fallback;
};

export type PinOperation = 'verify' | 'unblock' | 'enable' | 'disable' | 'change';

// 手册 6.3.3：<pin>/<newpin> 长度 4~8；手册 5.7.3：CPWD 密码为 '0'~'9'，最大长度 8。
const PIN_MIN = 4;
const PIN_MAX = 8;

const checkDigits = (value: string, label: string): string | null => {
  if (!/^\d+$/.test(value)) return `${label}只能是数字`;
  if (value.length < PIN_MIN || value.length > PIN_MAX) return `${label}长度必须为 ${PIN_MIN}-${PIN_MAX} 位`;
  return null;
};

export interface PinCommand {
  command: string;
  error?: string;
}

/**
 * 拼 PIN 操作命令。<fac> 只用 "SC"（SIM PIN1）与 "P2"（PIN2），
 * 手册 5.7.3 注明只支持这两种。
 */
export const buildPinCommand = (
  op: PinOperation,
  input: { pin: string; newPin?: string; pin2?: boolean },
): PinCommand => {
  const pin = (input.pin || '').trim();
  const newPin = (input.newPin || '').trim();
  const fac = input.pin2 ? 'P2' : 'SC';

  const label = op === 'unblock' ? 'PUK 码' : 'PIN 码';
  const bad = checkDigits(pin, label);
  if (bad) return { command: '', error: bad };

  if (op === 'unblock' || op === 'change') {
    const badNew = checkDigits(newPin, '新 PIN 码');
    if (badNew) return { command: '', error: badNew };
    if (op === 'change' && pin === newPin) return { command: '', error: '新 PIN 码不能与原 PIN 码相同' };
  }

  switch (op) {
    case 'verify':
      return { command: `AT+CPIN="${pin}"` };
    // 手册 6.3.2：PUK 解锁时 <pin> 是 PUK、<newpin> 是新设的 PIN。
    case 'unblock':
      return { command: `AT+CPIN="${pin}","${newPin}"` };
    case 'enable':
      return { command: `AT+CLCK="${fac}",1,"${pin}"` };
    case 'disable':
      return { command: `AT+CLCK="${fac}",0,"${pin}"` };
    case 'change':
      return { command: `AT+CPWD="${fac}","${pin}","${newPin}"` };
  }
};

/** 解析 AT+CLCK="SC",2 的应答：+CLCK: <status>，1 表示 PIN 锁已启用。 */
export const parseClck = (text: string): boolean | null => {
  const match = text.match(/\+CLCK:\s*(\d+)/);
  return match ? match[1] === '1' : null;
};
