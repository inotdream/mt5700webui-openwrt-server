// 手册 5.21 AT+CUSD-USSD 业务 / 5.22 +CUSD-主动上报。
//
//   AT+CUSD=<n>,<str>,<dcs>     n: 0 禁止上报 1 使能上报 2 退出会话
//   URC: +CUSD: <m>[,<str>,<dcs>]
//
// 手册示例 `AT+CUSD=1,"AAD86C3602",15` 里的 str 不是明文，而是 GSM 7bit
// 打包后的十六进制：按 3GPP 23.038 低位在前解出来正是 "*133#"。所以下发前
// 要打包、收到后要解包，直接塞明文查不到余额。

const GSM7_MAX = 160;

/** 按 3GPP 23.038 把字符串打包成 7bit 十六进制（低位在前）。 */
export const packGsm7 = (text: string): string => {
  const octets: number[] = [];
  let acc = 0;
  let bits = 0;

  for (const char of Array.from(text)) {
    acc |= (char.charCodeAt(0) & 0x7f) << bits;
    bits += 7;
    while (bits >= 8) {
      octets.push(acc & 0xff);
      acc >>= 8;
      bits -= 8;
    }
  }
  if (bits > 0) octets.push(acc & 0xff);

  return octets.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

/** packGsm7 的逆操作。 */
export const unpackGsm7 = (hex: string): string => {
  let out = '';
  let acc = 0;
  let bits = 0;

  for (let i = 0; i + 1 < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) return out;
    acc |= byte << bits;
    bits += 8;
    while (bits >= 7) {
      out += String.fromCharCode(acc & 0x7f);
      acc >>= 7;
      bits -= 7;
    }
  }
  // 末字节不足 7 位的补零会多解出一个 NUL，去掉它。
  return out.replace(/\0+$/, '');
};

const decodeUcs2 = (hex: string): string => {
  let out = '';
  for (let i = 0; i + 3 < hex.length; i += 4) {
    out += String.fromCharCode(Number.parseInt(hex.slice(i, i + 4), 16));
  }
  return out;
};

const decodeAscii = (hex: string): string => {
  let out = '';
  for (let i = 0; i + 1 < hex.length; i += 2) {
    out += String.fromCharCode(Number.parseInt(hex.slice(i, i + 2), 16));
  }
  return out;
};

/** 手册 5.21.3 <dcs>：15=7bit，68=8bit，72=UCS2。 */
export const DCS_GSM7 = 15;
export const DCS_8BIT = 68;
export const DCS_UCS2 = 72;

const isHex = (s: string): boolean => /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0;

/** 按 dcs 解出 USSD 应答文本；模组直接回明文时原样返回。 */
export const decodeUssd = (str: string, dcs: number): string => {
  const raw = str.trim();
  if (!isHex(raw)) return raw;
  switch (dcs) {
    case DCS_UCS2:
      return decodeUcs2(raw);
    case DCS_8BIT:
      return decodeAscii(raw);
    default:
      return unpackGsm7(raw);
  }
};

export interface UssdCommand {
  command: string;
  error?: string;
}

/** 拼 AT+CUSD 下发命令，n=1 表示要网络的回复。 */
export const buildUssdCommand = (code: string): UssdCommand => {
  const text = code.trim();
  if (!text) return { command: '', error: '请输入 USSD 代码，例如 *133#' };
  if (text.length > GSM7_MAX) return { command: '', error: `USSD 字符串最长 ${GSM7_MAX} 个字符` };
  if (!/^[0-9*#+]+$/.test(text)) return { command: '', error: 'USSD 代码只能包含数字与 * # +' };
  return { command: `AT+CUSD=1,"${packGsm7(text)}",${DCS_GSM7}` };
};

/** 退出 USSD 会话（手册 5.21.3：n=2）。 */
export const USSD_CANCEL_COMMAND = 'AT+CUSD=2';

// 手册 5.22.3 <m>
const RESULT_TYPES: Record<number, string> = {
  0: '网络无需回复',
  1: '网络等待进一步输入',
  2: '会话已被网络释放',
  3: '其他客户端已响应',
  4: '操作不支持',
  5: '网络超时',
};

export interface UssdReply {
  m: number;
  mText: string;
  text: string;
  needsReply: boolean;
}

/** 解析 +CUSD: <m>[,<str>,<dcs>]，查询应答和主动上报格式相同。 */
export const parseUssd = (line: string): UssdReply | null => {
  const match = line.match(/\+CUSD:\s*(\d+)(?:\s*,\s*"?([^"]*)"?\s*(?:,\s*(\d+))?)?/);
  if (!match) return null;

  const m = Number(match[1]);
  const dcs = match[3] !== undefined ? Number(match[3]) : DCS_GSM7;
  return {
    m,
    mText: RESULT_TYPES[m] ?? `状态 ${m}`,
    text: match[2] ? decodeUssd(match[2], dcs) : '',
    needsReply: m === 1,
  };
};
