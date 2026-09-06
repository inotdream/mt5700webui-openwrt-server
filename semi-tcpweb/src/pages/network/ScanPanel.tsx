import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Modal, Progress, Select, Space, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import { ATService, type ATResponse } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  buildScanCommand,
  isScanRunning,
  parseScanLine,
  parseScanLines,
  SCAN_ABORT_COMMAND,
  SCAN_STATE_COMMAND,
  type ScanCell,
  type ScanFilter,
  type ScanPush,
} from '@/modem/cellscan';
import { LTE_BANDS, NR_BANDS, SCS_TYPES } from '@/modem/lock';
import { buildAutoDialRestoreCommand, parseAutoDial, type AutoDialConfig } from '@/modem/autodial';
import { Field, PageCard, TwoCol } from '@/ui/widgets';

const at = () => ATService.getInstance();
const SCAN_WARNING_KEY = 'cellscanDisconnectWarningAcknowledged';

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

interface ScanDialSnapshot {
  autoDialEnabled: boolean;
  /** 关闭前 ^SETAUTODIAL? 的完整应答，恢复时原样回放以免丢掉 APN/鉴权配置 */
  autoDial: AutoDialConfig | null;
  ndisActive: boolean;
}

interface ScanDeniedDiagnostics {
  autoDialEnabled?: boolean;
  ndisActive?: boolean;
  functionLevel?: number;
}

const isOperationNotAllowed = (message: string): boolean =>
  /\+CME ERROR:\s*operation not allowed/i.test(message);

const queryText = async (command: string): Promise<string> => {
  try {
    const response = await at().sendCommand(command);
    return response.success ? String(response.data || '') : '';
  } catch {
    return '';
  }
};

const diagnoseScanDenied = async (): Promise<ScanDeniedDiagnostics> => {
  // AT 通道是串行的，诊断命令也按顺序发，避免互相抢应答。
  const autoDial = await queryText('AT^SETAUTODIAL?');
  const ndis = await queryText('AT^NDISSTATQRY?');
  const cfun = await queryText('AT+CFUN?');
  const autoDialMatch = autoDial.match(/\^SETAUTODIAL:\s*(\d+)/i);
  const cfunMatch = cfun.match(/\+CFUN:\s*(\d+)/i);
  return {
    autoDialEnabled: autoDialMatch ? autoDialMatch[1] === '1' : undefined,
    ndisActive: ndis ? /\^NDISSTATQRY:\s*1\s*,/i.test(ndis) : undefined,
    functionLevel: cfunMatch ? Number(cfunMatch[1]) : undefined,
  };
};

export interface ScanLockTarget {
  type: 'LTE' | 'NR';
  band: number;
  arfcn: string;
  pci: string;
  scs?: number;
}

interface Props {
  /** 由页面提供锁频动作：扫频结果里的频段/频点/PCI/SCS 都是模组直接给的，比反推可靠。 */
  onLock: (target: ScanLockTarget) => Promise<void>;
  /** 扫频期间模组被独占，通知页面暂停轮询。 */
  onScanningChange?: (scanning: boolean) => void;
  disabled?: boolean;
}

const RAT_OPTIONS = [
  { value: '', label: '全部制式' },
  { value: '2', label: 'LTE' },
  { value: '3', label: 'NR' },
  // 手册 5.35.3：<rat> 0 为 GSM，标注暂不支持。
  { value: '1', label: 'WCDMA' },
];

const signalText = (cell: ScanCell): string => {
  if (cell.rsrp != null) return `${cell.rsrp} dBm`;
  if (cell.rxlev != null) return `${cell.rxlev} dBm`;
  return '—';
};

const channelText = (cell: ScanCell): string => {
  if (cell.arfcn == null) return '—';
  return cell.frequencyMhz == null
    ? String(cell.arfcn)
    : `${cell.arfcn}（${cell.frequencyMhz.toFixed(3)} MHz）`;
};

export const ScanPanel: React.FC<Props> = ({ onLock, onScanningChange, disabled }) => {
  const [filter, setFilter] = useState<ScanFilter>({ rat: '' });
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const [scanning, setScanning] = useState(false);
  const [cells, setCells] = useState<ScanCell[]>([]);
  const [note, setNote] = useState('');
  const onScanningChangeRef = useRef(onScanningChange);
  onScanningChangeRef.current = onScanningChange;
  const onLockRef = useRef(onLock);
  onLockRef.current = onLock;
  // 只有本页面发起过的扫频才需要在离开时收掉。
  const startedRef = useRef(false);
  const preparingDialRef = useRef(false);
  const scanAcceptedRef = useRef(false);
  const diagnosingDeniedRef = useRef(false);
  const dialSnapshotRef = useRef<ScanDialSnapshot | null>(null);
  const restorePromiseRef = useRef<Promise<void> | null>(null);
  const restoreDialRef = useRef<() => Promise<void>>(async () => {});

  const restoreDial = async () => {
    if (restorePromiseRef.current) return restorePromiseRef.current;
    const snapshot = dialSnapshotRef.current;
    if (!snapshot) return;

    const restoring = (async () => {
      try {
        // 原先开启自动拨号时按快照原样恢复（含 APN/鉴权字段，手册 16.18.1），
        // 它会自行重建数据会话；原先仅有手动 NDIS 会话时才显式重新拨号，
        // 避免对同一个 CID 重复发起连接。
        const command = snapshot.autoDialEnabled
          ? buildAutoDialRestoreCommand(snapshot.autoDial ?? { enable: 1 })
          : snapshot.ndisActive
            ? 'AT^NDISDUP=1,1'
            : '';
        if (command) {
          const response = await at().sendCommand(command);
          if (!response.success) throw new Error(('error' in response && response.error) || '恢复拨号失败');
          await sleep(1500);
        }
      } catch (error) {
        Toast.warning(`扫描已结束，但${error instanceof Error ? error.message : '恢复拨号失败'}，请到拨号页面手动恢复`);
      } finally {
        dialSnapshotRef.current = null;
        restorePromiseRef.current = null;
      }
    })();

    restorePromiseRef.current = restoring;
    return restoring;
  };
  restoreDialRef.current = restoreDial;

  const prepareDialForScan = async () => {
    preparingDialRef.current = true;
    try {
      const autoDial = parseAutoDial(await queryText('AT^SETAUTODIAL?'));
      const ndisRaw = await queryText('AT^NDISSTATQRY?');
      const snapshot: ScanDialSnapshot = {
        autoDialEnabled: autoDial?.enable === 1,
        autoDial,
        ndisActive: /\^NDISSTATQRY:\s*1\s*,/i.test(ndisRaw),
      };
      dialSnapshotRef.current = snapshot;

      if (snapshot.autoDialEnabled) {
        setNote('正在临时关闭自动拨号');
        const response = await at().sendCommand('AT^SETAUTODIAL=0');
        if (!response.success) throw new Error(('error' in response && response.error) || '关闭自动拨号失败');
        await sleep(800);
      }
      const currentNdisRaw = snapshot.ndisActive ? await queryText('AT^NDISSTATQRY?') : '';
      const ndisStillActive = currentNdisRaw
        ? /\^NDISSTATQRY:\s*1\s*,/i.test(currentNdisRaw)
        : snapshot.ndisActive;
      if (ndisStillActive) {
        setNote('正在释放数据拨号，网络可能暂时中断');
        const response = await at().sendCommand('AT^NDISDUP=1,0');
        if (!response.success) throw new Error(('error' in response && response.error) || '关闭数据拨号失败');
        await sleep(1500);
        const verify = await queryText('AT^NDISSTATQRY?');
        if (verify && /\^NDISSTATQRY:\s*1\s*,/i.test(verify)) {
          await sleep(1500);
        }
      }
    } finally {
      preparingDialRef.current = false;
    }
  };

  const showOperationNotAllowed = async (error: string) => {
    if (diagnosingDeniedRef.current) return;
    diagnosingDeniedRef.current = true;
    try {
      const diagnostics = await diagnoseScanDenied();
      const reasons: string[] = [];
      if (diagnostics.autoDialEnabled) reasons.push('自动拨号仍处于开启状态');
      if (diagnostics.ndisActive) reasons.push('数据拨号仍未完全释放');
      if (diagnostics.functionLevel != null && diagnostics.functionLevel !== 1) {
        reasons.push(`模组功能级别为 CFUN=${diagnostics.functionLevel}`);
      }
      Modal.error({
        title: '模组不允许开始扫频',
        content: (
          <div>
            <p>{error}</p>
            <p>
              {reasons.length
                ? `检测到：${reasons.join('；')}。请等待业务释放后重试。`
                : '拨号已尝试临时关闭，但模组仍拒绝命令。请结束通话、短信或其它占用射频/AT 通道的业务，稍等后重试。'}
            </p>
          </div>
        ),
        okText: '知道了',
      });
    } finally {
      diagnosingDeniedRef.current = false;
    }
  };

  useEffect(() => {
    const handle = (response: ATResponse) => {
      if (!('type' in response) || response.type !== 'cellscan') return;
      const push = response.data as ScanPush;

      if (push.state === 'running') {
        scanAcceptedRef.current = true;
        const cell = push.cell ? parseScanLine(push.cell) : null;
        if (cell) setCells((prev) => [...prev, cell]);
        return;
      }

      setScanning(false);
      startedRef.current = false;
      scanAcceptedRef.current = false;
      onScanningChangeRef.current?.(false);
      // 结束推送带的是完整结果，用它覆盖，免得中途丢包导致列表和 count 对不上。
      if (push.lines) setCells(parseScanLines(push.lines));

      if (push.state === 'error') {
        setNote('');
        const error = push.error || '未知错误';
        void (async () => {
          if (isOperationNotAllowed(error)) await showOperationNotAllowed(error);
          else Toast.error(`扫频失败：${error}`);
          await restoreDialRef.current();
        })();
        return;
      }
      // 手册：打断完成后按扫描完成处理，已扫到的结果依然有效。
      setNote(push.state === 'aborted' ? `已取消，保留已扫到的 ${push.count} 个小区` : `扫描完成，共 ${push.count} 个小区`);
      void restoreDialRef.current();
    };

    at().subscribe(handle);
    return () => at().unsubscribe(handle);
  }, []);

  // 页面刷新时服务端的扫频还在跑，恢复出"扫描中"的界面，
  // 否则用户只会看到所有操作都失败却找不到取消入口。
  useATReady(() => {
    void (async () => {
      const res = await at().sendCommand(SCAN_STATE_COMMAND);
      if (res.success && isScanRunning(String(res.data || ''))) {
        setScanning(true);
        scanAcceptedRef.current = true;
        onScanningChangeRef.current?.(true);
        setNote('检测到后台仍在扫描，可取消或等待结果');
      }
    })();
  });

  // 结束推送可能因为断线重连而收不到，那样界面会永远停在"扫描中"，
  // 连锁频按钮都点不了。扫描期间定期跟服务端核对一次真实状态。
  useEffect(() => {
    if (!scanning) return undefined;
    const timer = window.setInterval(async () => {
      if (preparingDialRef.current) return;
      const res = await at().sendCommand(SCAN_STATE_COMMAND);
      if (res.success && !isScanRunning(String(res.data || ''))) {
        setScanning(false);
        startedRef.current = false;
        scanAcceptedRef.current = false;
        onScanningChangeRef.current?.(false);
        setNote('扫描已结束');
        void restoreDialRef.current();
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [scanning]);

  // 离开页面时结果已经没人看了，留着扫频只会一直占着模组，主动收掉。
  useEffect(
    () => () => {
      void (async () => {
        if (startedRef.current) await at().sendCommand(SCAN_ABORT_COMMAND);
        await restoreDialRef.current();
      })();
    },
    [],
  );

  const beginScan = async (command: string) => {
    setCells([]);
    setNote('');
    setScanning(true);
    scanAcceptedRef.current = false;
    onScanningChangeRef.current?.(true);
    try {
      await prepareDialForScan();
      startedRef.current = true;
      const res = await at().sendCommand(command);
      if (!res.success) throw new Error(('error' in res && res.error) || '模组拒绝了扫频命令');
      scanAcceptedRef.current = true;
      setNote('扫描中，全频段扫描可能需要几分钟');
    } catch (err) {
      setScanning(false);
      startedRef.current = false;
      scanAcceptedRef.current = false;
      onScanningChangeRef.current?.(false);
      const message = err instanceof Error ? err.message : '启动扫频失败';
      if (isOperationNotAllowed(message)) await showOperationNotAllowed(message);
      else Toast.error(message);
      await restoreDial();
    }
  };

  const start = () => {
    const { command, error } = buildScanCommand(filter);
    if (error) {
      Toast.error(error);
      return;
    }

    let acknowledged = false;
    try {
      acknowledged = window.localStorage.getItem(SCAN_WARNING_KEY) === '1';
    } catch {
      // 禁用本地存储时退化为每次提示，不影响扫频本身。
    }
    if (acknowledged) {
      void beginScan(command);
      return;
    }

    Modal.confirm({
      title: '扫频期间网络可能中断',
      content: '开始前会临时关闭当前数据拨号，扫频完成或取消后自动恢复。通过网络 AT 连接时，页面也可能短暂掉线并自动重连。此提示在当前浏览器只显示一次。',
      okText: '继续扫描',
      cancelText: '取消',
      onOk: async () => {
        try {
          window.localStorage.setItem(SCAN_WARNING_KEY, '1');
        } catch {
          // 本地存储不可用不应阻止用户继续。
        }
        await beginScan(command);
      },
    });
  };

  const cancel = async () => {
    // 提示要在等应答之前给：模组收尾很快，结束推送常常比这条命令的应答先到，
    // 等应答回来再设提示会把"已取消"的最终状态又盖回去。
    setNote('已下发取消，等待模组收尾');
    try {
      const res = await at().sendCommand(SCAN_ABORT_COMMAND);
      if (!res.success) throw new Error(('error' in res && res.error) || '取消失败');
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : '取消扫频失败');
    }
  };

  const lockable = (cell: ScanCell): boolean =>
    (cell.ratName === 'LTE' || cell.ratName === 'NR') && cell.band != null && cell.arfcn != null && cell.pci != null;

  const columns = useMemo(
    () => [
      {
        title: '制式',
        dataIndex: 'ratName',
        render: (value: string) => <Tag color={value === 'NR' ? 'violet' : 'blue'}>{value}</Tag>,
      },
      { title: 'PLMN', dataIndex: 'plmn', render: (value: string) => value || '—' },
      {
        title: '频段',
        dataIndex: 'band',
        render: (value: number | null, record: ScanCell) =>
          value == null ? '—' : record.ratName === 'NR' ? `n${value}` : `B${value}`,
      },
      {
        title: 'ARFCN（频率）',
        dataIndex: 'arfcn',
        render: (_value: number | null, record: ScanCell) => channelText(record),
      },
      { title: 'PCI', dataIndex: 'pci', render: (value: number | null) => value ?? '—' },
      {
        title: '信号',
        render: (_v: unknown, record: ScanCell) => signalText(record),
      },
      {
        title: 'SINR',
        dataIndex: 'sinr',
        render: (value: number | null) => (value == null ? '—' : value),
      },
      {
        title: '操作',
        render: (_v: unknown, record: ScanCell) => (
          <Button
            size="small"
            disabled={disabled || scanning || !lockable(record)}
            onClick={() =>
              onLockRef.current({
                type: record.ratName as 'LTE' | 'NR',
                band: record.band as number,
                arfcn: String(record.arfcn),
                pci: String(record.pci),
                scs: record.scs ?? undefined,
              })
            }
          >
            锁定
          </Button>
        ),
      },
    ],
    [disabled, scanning],
  );

  const data = useMemo(
    () => cells.map((cell, index) => ({ ...cell, key: `${cell.ratName}-${cell.arfcn}-${cell.pci}-${index}` })),
    [cells],
  );

  const bandOptions = filter.rat === '3' ? NR_BANDS : LTE_BANDS;

  return (
    <PageCard
      title="全网扫频"
      hint="优先显示可直接用于锁频的 ARFCN，括号内附中心频率。扫描前会临时释放数据拨号，完成或取消后自动恢复。"
      extra={
        <Space>
          {scanning ? (
            <Button type="danger" onClick={cancel}>
              取消扫描
            </Button>
          ) : (
            <Button theme="solid" type="primary" disabled={disabled} onClick={start}>
              开始扫描
            </Button>
          )}
        </Space>
      }
    >
      <TwoCol>
        <Field label="接入技术">
          <Select
            style={{ width: '100%' }}
            disabled={scanning}
            value={filter.rat as string}
            optionList={RAT_OPTIONS}
            onChange={(value) => setFilter((prev) => ({ ...prev, rat: (value as ScanFilter['rat']) ?? '' }))}
          />
        </Field>
        <Field label="PLMN" hint="留空扫描所有运营商，例如 46000">
          <Input
            disabled={scanning}
            value={filter.plmn}
            placeholder="46000"
            onChange={(value) => setFilter((prev) => ({ ...prev, plmn: value }))}
          />
        </Field>
        <Field label="频段" hint="与频点二选一，留空则全频段扫描">
          <Select
            style={{ width: '100%' }}
            disabled={scanning || !filter.rat || !!filter.freq}
            placeholder="全频段"
            showClear
            value={filter.band}
            optionList={bandOptions.map((b) => ({ value: String(b.value), label: b.label }))}
            onChange={(value) => setFilter((prev) => ({ ...prev, band: (value as string) || '' }))}
          />
        </Field>
        <Field label="频点" hint="指定频点时必须选择接入技术">
          <Input
            disabled={scanning || !!filter.band}
            value={filter.freq}
            placeholder="留空则不限"
            onChange={(value) => setFilter((prev) => ({ ...prev, freq: value }))}
          />
        </Field>
        <Field label="PCI" hint="需同时指定频点，仅 LTE/NR 支持">
          <Input
            disabled={scanning}
            value={filter.pci}
            placeholder="留空则不限"
            onChange={(value) => setFilter((prev) => ({ ...prev, pci: value }))}
          />
        </Field>
        {filter.rat === '3' ? (
          <Field label="子载波间隔" hint="NR 指定频点或 PCI 时必填">
            <Select
              style={{ width: '100%' }}
              disabled={scanning}
              placeholder="不限"
              showClear
              value={filter.scs}
              optionList={SCS_TYPES.map((s) => ({ value: String(s.value), label: s.label }))}
              onChange={(value) => setFilter((prev) => ({ ...prev, scs: (value as string) || '' }))}
            />
          </Field>
        ) : null}
      </TwoCol>

      {scanning ? <Progress percent={100} stroke="var(--semi-color-primary)" showInfo={false} /> : null}
      {note ? (
        <Typography.Text type="tertiary" size="small">
          {note}
        </Typography.Text>
      ) : null}

      {/* 窄屏放不下 8 列表格，硬塞会把"锁定"按钮裁到屏幕外，改成列表逐项展示 */}
      {isNarrow ? (
        <div className="cell-list">
          {data.length === 0 ? (
            <div className="cell-list-empty">{scanning ? '扫描中…' : '暂无扫描结果'}</div>
          ) : (
            data.map((cell) => (
              <div className="cell-list-item" key={cell.key}>
                <div className="cell-list-body">
                  <div className="cell-list-main">
                    <Tag size="small" color={cell.ratName === 'NR' ? 'violet' : 'blue'}>
                      {cell.ratName}
                    </Tag>
                    <b>
                      {cell.band == null ? '—' : cell.ratName === 'NR' ? `n${cell.band}` : `B${cell.band}`}
                      {cell.arfcn != null ? ` · ${channelText(cell)}` : ''}
                    </b>
                    {cell.pci != null ? <span>PCI {cell.pci}</span> : null}
                  </div>
                  <div className="cell-list-sub">
                    {cell.plmn ? `${cell.plmn} · ` : ''}
                    {signalText(cell)}
                    {cell.sinr != null ? ` · SINR ${cell.sinr}` : ''}
                  </div>
                </div>
                <Button
                  size="small"
                  disabled={disabled || scanning || !lockable(cell)}
                  onClick={() =>
                    onLockRef.current({
                      type: cell.ratName as 'LTE' | 'NR',
                      band: cell.band as number,
                      arfcn: String(cell.arfcn),
                      pci: String(cell.pci),
                      scs: cell.scs ?? undefined,
                    })
                  }
                >
                  锁定
                </Button>
              </div>
            ))
          )}
        </div>
      ) : (
        <Table
          size="small"
          pagination={false}
          dataSource={data}
          columns={columns}
          empty={scanning ? '扫描中…' : '暂无扫描结果'}
        />
      )}
    </PageCard>
  );
};
