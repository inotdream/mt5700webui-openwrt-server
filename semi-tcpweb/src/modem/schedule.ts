import { ATService } from '@/services/at';
import type { LockLists } from './lock';

// 定时锁频配置通过 WebSocket 上的伪 AT 命令读写（后端 schedconfig.go），
// 因此复用了 WebSocket 的密钥认证，不需要额外的 HTTP 接口。
const QUERY = 'AT+SCHED?';
const SET_PREFIX = 'AT+SCHED=';

export type SchedulePeriod = {
  enabled: boolean;
  start?: string;
  end?: string;
  lte: LockLists;
  nr: LockLists;
};

export type ScheduleStatus = {
  current_mode: string;
  next_switch: string;
  switch_count: number;
  applied: boolean;
};

export type ScheduleConfig = {
  enabled: boolean;
  check_interval: number;
  timeout: number;
  unlock_lte: boolean;
  unlock_nr: boolean;
  toggle_airplane: boolean;
  night: SchedulePeriod;
  day: SchedulePeriod;
  status?: ScheduleStatus;
};

/**
 * 读取定时锁频配置。返回 null 表示这个后端不支持（旧版本会把 AT+SCHED? 当作
 * 真命令转发给模组，模组回 ERROR），调用方应当据此隐藏整个面板。
 */
export async function fetchSchedule(): Promise<ScheduleConfig | null> {
  const res = await ATService.getInstance().sendCommand(QUERY);
  if (!res.success || !res.data) return null;
  // 应答形如 "+SCHED: {...}\r\nOK"，按 AT 应答的样子包装是为了通过响应匹配校验
  const json = String(res.data).match(/\+SCHED:\s*(\{[\s\S]*\})/)?.[1];
  if (!json) return null;
  try {
    return JSON.parse(json) as ScheduleConfig;
  } catch {
    return null;
  }
}

/** 保存配置。后端校验失败时把原始提示抛出来，界面直接显示原因。 */
export async function saveSchedule(cfg: ScheduleConfig): Promise<void> {
  const { status, ...payload } = cfg;
  void status;
  const res = await ATService.getInstance().sendCommand(SET_PREFIX + JSON.stringify(payload));
  if (!res.success) throw new Error(String(res.error || '保存定时锁频配置失败'));
}

export const modeText = (mode: string) => (mode === '' ? '当前时段不锁频' : mode);
