// 手册 16.18 AT^SETAUTODIAL：
//   设置  AT^SETAUTODIAL=<enable>,<dial_mode>,[[<protocol>],[<apn>],[<usrname>,<password>,<authtype>]]
//   查询  ^SETAUTODIAL:<enable>,<dial_mode>,[[<protocol>],[<apn>],[<usrname>,<password>,<authtype>]]
//         或只有 ^SETAUTODIAL:<enable>
// 手册原文里查询应答写成了 ^SETAUTODAIL（拼写不一致），解析时两种都认。

export interface AutoDialConfig {
  enable: number;
  dialMode?: number;
  protocol?: string;
  apn?: string;
  username?: string;
  password?: string;
  authType?: number;
}

export const parseAutoDial = (raw: string): AutoDialConfig | null => {
  const line = raw
    .replace(/\r/g, '')
    .split('\n')
    .map((item) => item.trim())
    .find((item) => /^\^SETAUTOD(?:IAL|AIL):/i.test(item));
  if (!line) return null;

  const payload = line.slice(line.indexOf(':') + 1).trim();
  const fields = payload.match(/(?:[^,"]+|"[^"]*")+/g)?.map((field) => field.trim().replace(/^"|"$/g, ''));
  if (!fields?.length || !/^\d+$/.test(fields[0])) return null;

  const parsed: AutoDialConfig = { enable: Number(fields[0]) };
  if (fields.length >= 2 && /^\d+$/.test(fields[1])) parsed.dialMode = Number(fields[1]);
  if (fields.length >= 3) parsed.protocol = fields[2] || '';
  if (fields.length >= 4) parsed.apn = fields[3] || '';
  if (fields.length >= 5) parsed.username = fields[4] || '';
  if (fields.length >= 6) parsed.password = fields[5] || '';
  if (fields.length >= 7 && /^\d+$/.test(fields[6])) parsed.authType = Number(fields[6]);
  return parsed;
};

/**
 * 生成把自动拨号恢复成快照状态的命令。
 * 快照里带完整的 APN/鉴权字段时原样回放，避免只回 <enable>,<dial_mode> 两个参数
 * 把用户配好的 APN 冲掉；只有开关和模式时才退化成两参数形式。
 */
export const buildAutoDialRestoreCommand = (snapshot: AutoDialConfig): string => {
  const mode = snapshot.dialMode ?? 1;
  const full =
    snapshot.protocol !== undefined &&
    snapshot.apn !== undefined &&
    snapshot.username !== undefined &&
    snapshot.password !== undefined &&
    snapshot.authType !== undefined;
  if (!full) return `AT^SETAUTODIAL=1,${mode}`;
  return `AT^SETAUTODIAL=1,${mode},"${snapshot.protocol}","${snapshot.apn}","${snapshot.username}","${snapshot.password}",${snapshot.authType}`;
};
