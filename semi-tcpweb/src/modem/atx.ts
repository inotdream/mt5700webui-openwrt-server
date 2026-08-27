import { ATService } from '@/services/at';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const at = () => ATService.getInstance();

export async function setFlightMode(enable: boolean): Promise<boolean> {
  for (let retry = 0; retry < 3; retry += 1) {
    const response = await at().sendCommand(`AT+CFUN=${enable ? '0' : '1'}`);
    if (response.success) {
      if (!enable) return true;
      await sleep(2000);
      const verify = await at().sendCommand('AT+CFUN?');
      if (verify.success && String(verify.data || '').includes('+CFUN: 0')) return true;
    }
    if (retry < 2) await sleep(2000 * (retry + 1));
  }
  return false;
}

/**
 * 取出模组给的失败原因。后端初始化时下发了 AT+CMEE=2（手册 3.14），
 * 模组会用 "+CME ERROR: <错误描述>" 代替干巴巴的 ERROR，把它带到界面上，
 * 比一律显示"设置失败"有用得多。
 */
export function atErrorText(res: { success: boolean; data?: unknown; error?: unknown }, fallback: string): string {
  const text = String(res.error ?? res.data ?? '');
  const match = text.match(/\+CM[ES] ERROR:\s*(.+)/i);
  if (match) return `${fallback}：${match[1].trim()}`;
  const trimmed = text.trim();
  if (trimmed && trimmed !== 'ERROR') return `${fallback}：${trimmed}`;
  return fallback;
}

export async function withFlightMode<T>(fn: () => Promise<T>): Promise<T> {
  const enabled = await setFlightMode(true);
  if (!enabled) throw new Error('开启飞行模式失败');
  try {
    return await fn();
  } finally {
    await setFlightMode(false);
  }
}
