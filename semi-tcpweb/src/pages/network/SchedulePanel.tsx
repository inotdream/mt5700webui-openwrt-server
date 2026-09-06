import React, { useCallback, useState } from 'react';
import { Banner, Button, Collapse, Input, InputNumber, Space, Switch, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import { useATReady } from '@/hooks/useATReady';
import { fetchSchedule, modeText, saveSchedule, type ScheduleConfig, type SchedulePeriod } from '@/modem/schedule';
import { fromLockLists, toLockLists, type LockItem } from '@/modem/lock';
import { Field, PageCard, TwoCol } from '@/ui/widgets';
import { LockEditor } from '@/ui/LockEditor';

type PeriodDraft = {
  enabled: boolean;
  start: string;
  end: string;
  lteType: number;
  nrType: number;
  lteItems: LockItem[];
  nrItems: LockItem[];
};

type Draft = {
  checkInterval: number;
  timeout: number;
  unlockLte: boolean;
  unlockNr: boolean;
  toggleAirplane: boolean;
  night: PeriodDraft;
  day: PeriodDraft;
};

const toPeriodDraft = (p: SchedulePeriod): PeriodDraft => ({
  enabled: p.enabled,
  start: p.start || '22:00',
  end: p.end || '06:00',
  lteType: p.lte.type,
  nrType: p.nr.type,
  lteItems: fromLockLists('lte', p.lte),
  nrItems: fromLockLists('nr', p.nr),
});

const toDraft = (cfg: ScheduleConfig): Draft => ({
  checkInterval: cfg.check_interval,
  timeout: cfg.timeout,
  unlockLte: cfg.unlock_lte,
  unlockNr: cfg.unlock_nr,
  toggleAirplane: cfg.toggle_airplane,
  night: toPeriodDraft(cfg.night),
  day: toPeriodDraft(cfg.day),
});

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * 定时锁频编排。总开关在 LuCI（uci: at-webserver.config.schedule_enabled），
 * 这里只在已启用时显示，避免在 WebUI 里关掉之后就再也打不开。
 */
export const SchedulePanel: React.FC = () => {
  const [cfg, setCfg] = useState<ScheduleConfig | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [keys, setKeys] = useState<string[]>(['night']);
  // 编排表单又长又不常动，默认收起；运行状态一直显示在卡片头下
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    const next = await fetchSchedule();
    setCfg(next);
    if (next) setDraft(toDraft(next));
  }, []);

  // 只刷新运行状态，不动表单，否则会把用户还没保存的修改冲掉
  const refreshStatus = useCallback(async () => {
    const next = await fetchSchedule();
    if (next) setCfg(next);
  }, []);

  useATReady(load);

  if (!cfg || !cfg.enabled || !draft) return null;

  const patchPeriod = (which: 'night' | 'day', next: Partial<PeriodDraft>) =>
    setDraft({ ...draft, [which]: { ...draft[which], ...next } });

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!HHMM.test(draft.night.start) || !HHMM.test(draft.night.end)) {
        throw new Error('夜间时段请填写 HH:MM 格式，例如 22:00');
      }
      // 先在本地按手册的取值范围校验，错误提示比等后端返回更及时
      const payload: ScheduleConfig = {
        ...cfg,
        check_interval: draft.checkInterval,
        timeout: draft.timeout,
        unlock_lte: draft.unlockLte,
        unlock_nr: draft.unlockNr,
        toggle_airplane: draft.toggleAirplane,
        night: {
          enabled: draft.night.enabled,
          start: draft.night.start,
          end: draft.night.end,
          lte: toLockLists('lte', draft.night.lteType, draft.night.lteItems),
          nr: toLockLists('nr', draft.night.nrType, draft.night.nrItems),
        },
        day: {
          enabled: draft.day.enabled,
          lte: toLockLists('lte', draft.day.lteType, draft.day.lteItems),
          nr: toLockLists('nr', draft.day.nrType, draft.day.nrItems),
        },
      };
      await saveSchedule(payload);
      Toast.success('定时锁频配置已保存，下个检测周期生效');
      await load();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setBusy(false);
    }
  };

  const status = cfg.status;
  const renderPeriod = (which: 'night' | 'day') => {
    const p = draft[which];
    return (
      <>
        <Field label="启用">
          <Switch checked={p.enabled} onChange={(v) => patchPeriod(which, { enabled: v })} />
        </Field>
        {which === 'night' && (
          <Field label="夜间时段">
            <Space>
              <Input
                style={{ width: 90 }}
                placeholder="22:00"
                value={p.start}
                onChange={(v) => patchPeriod(which, { start: v })}
              />
              <Typography.Text type="tertiary">至</Typography.Text>
              <Input
                style={{ width: 90 }}
                placeholder="06:00"
                value={p.end}
                onChange={(v) => patchPeriod(which, { end: v })}
              />
              <Typography.Text type="tertiary">跨零点有效，其余时间按日间模式</Typography.Text>
            </Space>
          </Field>
        )}
        <Collapse>
          <Collapse.Panel header={`4G 锁频（${which === 'night' ? '夜间' : '日间'}）`} itemKey={`${which}-lte`}>
            <LockEditor
              kind="lte"
              type={p.lteType}
              items={p.lteItems}
              onTypeChange={(t) => patchPeriod(which, { lteType: t })}
              onItemsChange={(items) => patchPeriod(which, { lteItems: items })}
            />
          </Collapse.Panel>
          <Collapse.Panel header={`5G 锁频（${which === 'night' ? '夜间' : '日间'}）`} itemKey={`${which}-nr`}>
            <LockEditor
              kind="nr"
              type={p.nrType}
              items={p.nrItems}
              onTypeChange={(t) => patchPeriod(which, { nrType: t })}
              onItemsChange={(items) => patchPeriod(which, { nrItems: items })}
            />
          </Collapse.Panel>
        </Collapse>
      </>
    );
  };

  return (
    <PageCard
      title="定时锁频编排"
      extra={
        <Space>
          {expanded ? (
            <>
              <Button size="small" loading={busy} onClick={refreshStatus}>
                刷新状态
              </Button>
              <Button size="small" theme="solid" type="primary" loading={busy} onClick={save}>
                保存编排
              </Button>
              <Button size="small" onClick={() => setExpanded(false)}>
                收起
              </Button>
            </>
          ) : (
            <Button size="small" onClick={() => setExpanded(true)}>
              展开配置
            </Button>
          )}
        </Space>
      }
    >
      <Banner
        fullMode={false}
        type="info"
        closeIcon={null}
        description={
          <Space wrap>
            <span>
              当前时段：<Tag color="blue">{modeText(status?.current_mode ?? '')}</Tag>
            </span>
            <span>下次切换：{status?.next_switch || '—'}</span>
            <span>已切换 {status?.switch_count ?? 0} 次</span>
          </Space>
        }
      />
      {expanded ? (
        <>
          <TwoCol>
            <Field label="检测间隔">
              <InputNumber
                min={10}
                suffix="秒"
                value={draft.checkInterval}
                onChange={(v) => setDraft({ ...draft, checkInterval: Number(v) })}
              />
            </Field>
            <Field label="无服务超时">
              <InputNumber
                min={30}
                suffix="秒"
                value={draft.timeout}
                onChange={(v) => setDraft({ ...draft, timeout: Number(v) })}
              />
            </Field>
            <Field label="解锁时下发 LTE 解锁">
              <Switch checked={draft.unlockLte} onChange={(v) => setDraft({ ...draft, unlockLte: v })} />
            </Field>
            <Field label="解锁时下发 NR 解锁">
              <Switch checked={draft.unlockNr} onChange={(v) => setDraft({ ...draft, unlockNr: v })} />
            </Field>
            <Field label="切换飞行模式使其生效">
              <Switch checked={draft.toggleAirplane} onChange={(v) => setDraft({ ...draft, toggleAirplane: v })} />
            </Field>
          </TwoCol>
          <Collapse activeKey={keys} onChange={(k) => setKeys(Array.isArray(k) ? k : [k])}>
            <Collapse.Panel header="夜间模式" itemKey="night">
              {renderPeriod('night')}
            </Collapse.Panel>
            <Collapse.Panel header="日间模式" itemKey="day">
              {renderPeriod('day')}
            </Collapse.Panel>
          </Collapse>
        </>
      ) : null}
    </PageCard>
  );
};
