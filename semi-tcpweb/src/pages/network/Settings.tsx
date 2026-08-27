import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Banner,
  Button,
  Collapse,
  Space,
  Spin,
  Table,
  Tag,
  Toast,
  Typography,
} from '@douyinfe/semi-ui';
import { ATService, type ATResponse, type URCData } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getBandFromArfcn, getDefaultScsType } from '@/modem/parse';
import {
  buildLockCommand,
  checkArfcn,
  checkPci,
  emptyLockItem,
  type LockItem,
} from '@/modem/lock';
import { atErrorText, setFlightMode, sleep } from '@/modem/atx';
import { type RejectInfo } from '@/modem/reject';
import { AutoRefresh, Field, PageCard, Panel, SectionHeader, TwoCol } from '@/ui/widgets';
import { LockEditor } from '@/ui/LockEditor';
import { SchedulePanel } from './SchedulePanel';
import { ScanPanel } from './ScanPanel';

const at = () => ATService.getInstance();

type Neighbor = { type: string; arfcn: string; pci: number; rsrp: string | number; rsrq?: string | number; sinr?: string | number; rxlev?: string; band?: number };

const emptyItem = emptyLockItem;

const NetworkSettings: React.FC = () => {
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>(['nrLock']);
  const [lteLockType, setLteLockType] = useState(0);
  const [nrLockType, setNrLockType] = useState(0);
  const [lteMobility, setLteMobility] = useState(0);
  const [nrMobility, setNrMobility] = useState(0);
  const [lteItems, setLteItems] = useState<LockItem[]>([emptyItem()]);
  const [nrItems, setNrItems] = useState<LockItem[]>([emptyItem()]);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const lockCellRef = useRef<(cell: Neighbor) => void>(() => {});
  const neighborTableData = useMemo(
    () => neighbors.map((cell, index) => ({ ...cell, key: `${cell.type}-${cell.pci}-${index}` })),
    [neighbors],
  );
  const neighborColumns = useMemo(
    () => [
      { title: '制式', dataIndex: 'type' },
      {
        title: '频段',
        dataIndex: 'band',
        render: (value: number | undefined, record: Neighbor) =>
          value ? (record.type === 'NR' ? `n${value}` : `B${value}`) : '—',
      },
      { title: 'ARFCN', dataIndex: 'arfcn' },
      { title: 'PCI', dataIndex: 'pci' },
      { title: 'RSRP', dataIndex: 'rsrp' },
      {
        title: 'RSRQ',
        dataIndex: 'rsrq',
        render: (value: string | number | undefined) => value ?? '—',
      },
      {
        title: 'SINR',
        dataIndex: 'sinr',
        render: (value: string | number | undefined) => value ?? '—',
      },
      {
        title: '操作',
        render: (_value: unknown, record: Neighbor) => (
          <Button size="small" onClick={() => lockCellRef.current(record)}>
            锁定
          </Button>
        ),
      },
    ],
    [],
  );
  const [scanLoading, setScanLoading] = useState(false);
  // 全网扫频期间模组被独占，页面上的轮询和其它命令都要先让路。
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(false);
  scanningRef.current = scanning;
  const [reject, setReject] = useState<RejectInfo | null>(null);
  const [auto, setAuto] = useState(false);
  const [interval, setIntervalSec] = useState(5);
  const [option5g, setOption5g] = useState<{ nr_sa_support_flag: number; nr_dc_mode: number; gc_access_mode: number } | null>(null);
  const [ssb, setSsb] = useState<{
    servingCell: { arfcn: string; cid: string; pci: string; rsrp: number; sinr: number; ta: number; ssbs: Array<{ ssbId: number; rsrp: number }> };
    neighborCells: Array<{ pci: string; arfcn: string; rsrp: number; sinr: number; ssbs: Array<{ ssbId: number; rsrp: number }> }>;
  } | null>(null);
  const scanTimer = useRef<number>();

  const parseLockResponse = (raw: string, prefix: '^LTEFREQLOCK' | '^NRFREQLOCK') => {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.includes('OK') && !l.startsWith('AT'));
    const head = lines.findIndex((l) => l.startsWith(prefix));
    const typeMatch = lines[head]?.match(new RegExp(`${prefix.replace('^', '\\^')}:\\s*(\\d+)`));
    if (!typeMatch) return null;
    const lockType = Number(typeMatch[1]);
    if (lockType === 0) return { lockType, mobility: 0, items: [emptyItem()] };
    const [mobility, num] = (lines[head + 1] || '0,0').split(',').map(Number);
    const items: LockItem[] = [];
    for (let i = 0; i < num; i += 1) {
      const parts = (lines[head + i + 2] || '').split(',').map((v) => (v ? Number(v) : undefined));
      if (prefix === '^LTEFREQLOCK') {
        items.push({ band: parts[0], arfcn: parts[1] != null ? String(parts[1]) : undefined, pci: parts[2] != null ? String(parts[2]) : undefined });
      } else {
        items.push({
          band: parts[0],
          arfcn: parts[1] != null ? String(parts[1]) : undefined,
          scs: parts[2],
          pci: parts[3] != null ? String(parts[3]) : undefined,
        });
      }
    }
    return { lockType, mobility, items: items.length ? items : [emptyItem()] };
  };

  const fetchCurrent = async () => {
    setLoading(true);
    try {
      const lte = await at().sendCommand('AT^LTEFREQLOCK?');
      if (lte.success && lte.data) {
        const parsed = parseLockResponse(String(lte.data), '^LTEFREQLOCK');
        if (parsed) {
          setLteLockType(parsed.lockType);
          setLteMobility(parsed.mobility);
          setLteItems(parsed.items);
          if (parsed.lockType !== 0) setActiveKeys((prev) => Array.from(new Set([...prev, 'lteLock'])));
        }
      }
      const nr = await at().sendCommand('AT^NRFREQLOCK?');
      if (nr.success && nr.data) {
        const parsed = parseLockResponse(String(nr.data), '^NRFREQLOCK');
        if (parsed) {
          setNrLockType(parsed.lockType);
          setNrMobility(parsed.mobility);
          setNrItems(parsed.items);
          if (parsed.lockType !== 0) setActiveKeys((prev) => Array.from(new Set([...prev, 'nrLock'])));
        }
      }
      await query5G();
    } catch {
      Toast.error('获取锁频设置失败');
    } finally {
      setLoading(false);
    }
  };

  useATReady(fetchCurrent);

  const query5G = async () => {
    await sleep(200);
    const res = await at().sendCommand('AT^C5GOPTION?');
    if (res.success && res.data) {
      const match = String(res.data).match(/\^C5GOPTION:\s*(\d+),(\d+),(\d+)/);
      if (match) {
        setOption5g({
          nr_sa_support_flag: Number(match[1]),
          nr_dc_mode: Number(match[2]),
          gc_access_mode: Number(match[3]),
        });
      }
    }
  };

  const buildLteCmd = () => buildLockCommand('lte', lteLockType, lteMobility, lteItems);
  const buildNrCmd = () => buildLockCommand('nr', nrLockType, nrMobility, nrItems);

  const applyLock = async () => {
    if (busy) return;
    setBusy(true);
    setLoading(true);
    let radioOff = false;
    try {
      const lteCmd = buildLteCmd();
      const nrCmd = buildNrCmd();
      radioOff = true;
      const ok = await setFlightMode(true);
      if (!ok) throw new Error('开启飞行模式失败');
      // LTE 与 NR 互不依赖: LTE 锁受 NV2141 使能控制, NR 锁需单板支持 NR,
      // 任一被模组拒绝时另一条仍要下发
      const lteRes = await at().sendCommand(lteCmd);
      await sleep(1000);
      const nrRes = await at().sendCommand(nrCmd);
      await sleep(1000);
      const off = await setFlightMode(false);
      if (!off) throw new Error('关闭飞行模式失败');
      await sleep(2000);
      const failed = [
        !lteRes.success && atErrorText(lteRes, 'LTE 锁频设置失败'),
        !nrRes.success && atErrorText(nrRes, 'NR 锁频设置失败'),
      ].filter(Boolean) as string[];
      if (failed.length === 2) throw new Error(failed.join('；'));
      if (failed.length === 1) Toast.warning(`${failed[0]}，另一制式已生效`);
      else Toast.success('锁频设置成功');
      await fetchCurrent();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '锁频设置失败');
      if (radioOff) await setFlightMode(false);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  const scanNeighbors = async () => {
    if (busy) return;
    setBusy(true);
    setScanLoading(true);
    try {
      const res = await at().sendCommand('AT^MONNC');
      const cells: Neighbor[] = [];
      if (res.success && res.data) {
        String(res.data)
          .split('\n')
          .forEach((line) => {
            if (!line.startsWith('^MONNC:')) return;
            const matched = line.match(/\^MONNC:\s*(\w+)(?:,(.+))?/);
            if (!matched || matched[1] === 'NONE') return;
            const type = matched[1];
            const values = (matched[2] || '').split(',').map((v) => v.trim().replace(/"/g, ''));
            if (type === 'LTE') {
              const arfcn = values[0];
              cells.push({
                type,
                arfcn,
                pci: parseInt(values[1], 16),
                rsrp: values[2],
                rsrq: values[3],
                rxlev: values[4],
                band: getBandFromArfcn('LTE', parseInt(arfcn, 10)),
              });
            } else if (type === 'NR') {
              const arfcn = values[0];
              // 有的固件按 1/8 dB 上报。阈值取各指标的合法量程边界（手册 13.27.3：
              // RSRP -156~-31、RSRQ -43~20、SINR -23~40），超出即视为 8 倍值还原。
              const scale = (raw: string, big: number) => {
                const n = parseInt(raw, 10);
                return Math.abs(n) > big ? (n / 8).toFixed(1) : n;
              };
              cells.push({
                type,
                arfcn,
                pci: parseInt(values[1], 16),
                rsrp: scale(values[2], 157),
                rsrq: scale(values[3], 43.5),
                sinr: scale(values[4], 40),
                band: getBandFromArfcn('NR', parseInt(arfcn, 10)),
              });
            }
          });
      }
      setNeighbors(cells);
    } catch {
      Toast.error('扫描邻区失败');
    } finally {
      setScanLoading(false);
      setBusy(false);
    }
  };

  // 手册 13.14：注册/业务请求被网络拒绝时模组会主动上报原因值。
  useEffect(() => {
    const handle = (response: ATResponse) => {
      if (!('type' in response) || response.type !== 'urc_data') return;
      const urc = response.data as URCData;
      if (urc.type === 'REJINFO') setReject(urc.parsed as RejectInfo);
    };
    at().subscribe(handle);
    return () => at().unsubscribe(handle);
  }, []);

  useEffect(() => {
    if (scanTimer.current) window.clearInterval(scanTimer.current);
    if (!auto) return undefined;
    scanTimer.current = window.setInterval(() => {
      if (scanningRef.current) return;
      scanNeighbors();
    }, interval * 1000);
    return () => {
      if (scanTimer.current) window.clearInterval(scanTimer.current);
    };
  }, [auto, interval]);

  const lockCell = async (cell: Neighbor & { scs?: number }) => {
    if (busy) return;
    setBusy(true);
    let radioOff = false;
    try {
      const kind = cell.type === 'LTE' ? 'lte' : 'nr';
      if (cell.band == null) throw new Error(`无法由频点 ${cell.arfcn} 判断频段，请在上方锁频表单中手动选择`);
      const arfcn = checkArfcn(cell.type, String(cell.arfcn).trim());
      const pci = checkPci(kind, String(cell.pci).trim());
      // 扫频结果里带模组实测的子载波间隔，比按频段推断准，优先用它。
      const scs = cell.scs ?? getDefaultScsType(cell.band);
      const cmd =
        kind === 'lte'
          ? `AT^LTEFREQLOCK=2,0,1,"${cell.band}","${arfcn}","${pci}"`
          : `AT^NRFREQLOCK=2,0,1,"${cell.band}","${arfcn}","${scs}","${pci}"`;
      radioOff = true;
      const ok = await setFlightMode(true);
      if (!ok) throw new Error('开启飞行模式失败');
      await sleep(1000);
      const res = await at().sendCommand(cmd);
      if (!res.success) throw new Error(atErrorText(res, '锁定失败'));
      await setFlightMode(false);
      Toast.success(`已锁定 ${cell.type} PCI ${cell.pci}`);
      await fetchCurrent();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '锁定失败');
      if (radioOff) await setFlightMode(false);
    } finally {
      setBusy(false);
    }
  };

  lockCellRef.current = lockCell;

  const set5G = async (option: { nr_sa_support_flag: number; nr_dc_mode: number; gc_access_mode: number }) => {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await setFlightMode(true);
      if (!ok) throw new Error('开启飞行模式失败');
      const res = await at().sendCommand(`AT^C5GOPTION=${option.nr_sa_support_flag},${option.nr_dc_mode},${option.gc_access_mode}`);
      if (!res.success) throw new Error('设置 5G 接入模式失败');
      Toast.success('设置成功');
      await query5G();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : '设置失败');
    } finally {
      await setFlightMode(false);
      setBusy(false);
    }
  };

  const querySSB = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await at().sendCommand('AT^NRSSBID?');
      if (!res.success || !res.data) return;
      const dataLine = String(res.data)
        .split('\n')
        .find((l) => l.startsWith('^NRSSBID:'));
      if (!dataLine) return;
      const data = dataLine.replace('^NRSSBID:', '').trim().split(',');
      const [arfcn, cid, pci, rsrp, sinr, ta] = data;
      const servingSSBs = [];
      for (let i = 0; i < 8; i += 1) {
        const ssbId = Number(data[6 + i * 2]);
        const ssbRsrp = Number(data[7 + i * 2]);
        if (ssbId !== 255 && ssbRsrp !== 32767) servingSSBs.push({ ssbId, rsrp: ssbRsrp });
      }
      const neighborCount = Number(data[22]);
      const neighborCells = [];
      let offset = 23;
      for (let i = 0; i < neighborCount; i += 1) {
        const nbSSBs = [];
        for (let j = 0; j < 4; j += 1) {
          const ssbId = Number(data[offset + 4 + j * 2]);
          const ssbRsrp = Number(data[offset + 5 + j * 2]);
          if (ssbId !== 255 && ssbRsrp !== 32767) nbSSBs.push({ ssbId, rsrp: ssbRsrp });
        }
        neighborCells.push({
          pci: data[offset],
          arfcn: data[offset + 1],
          rsrp: Number(data[offset + 2]),
          sinr: Number(data[offset + 3]),
          ssbs: nbSSBs,
        });
        offset += 12;
      }
      setSsb({
        servingCell: { arfcn, cid, pci, rsrp: Number(rsrp), sinr: Number(sinr), ta: Number(ta), ssbs: servingSSBs },
        neighborCells,
      });
    } catch {
      Toast.error('查询 SSB 失败');
    } finally {
      setBusy(false);
    }
  };

  const optionText = () => {
    if (!option5g) return '未知';
    const { nr_sa_support_flag: sa, nr_dc_mode: dc, gc_access_mode: gc } = option5g;
    if (sa === 1 && dc === 0 && gc === 1) return '仅 SA';
    if (sa === 0 && dc === 1 && gc === 0) return '仅 NSA';
    if (sa === 1 && dc === 1 && gc === 1) return 'SA+NSA';
    return '其他';
  };

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <SectionHeader title="锁频与邻区" desc="锁定 LTE / NR 频点、小区或 Band；扫描邻区并查看波束信息" />
        {reject ? (
          <Banner
            type="warning"
            closeIcon
            onClose={() => setReject(null)}
            title={`网络拒绝：${reject.rejectTypeText}（${reject.causeText}）`}
            description={
              <span>
                {reject.ratText} · PLMN {reject.plmn} · {reject.domainText} · 小区 {reject.cellId || '—'}
                {reject.esmCause !== undefined ? ` · ESM 原因 #${reject.esmCause}` : ''}
                <br />
                锁频后掉网时，这里能区分是被网络拒绝还是没有覆盖。
              </span>
            }
          />
        ) : null}
        <PageCard title="锁频设置" extra={<Button theme="solid" type="primary" loading={busy} disabled={scanning} onClick={applyLock}>应用锁频</Button>}>
          <Collapse activeKey={activeKeys} onChange={(keys) => setActiveKeys(Array.isArray(keys) ? keys : [keys])}>
            <Collapse.Panel header="4G 锁频设置" itemKey="lteLock">
              <LockEditor
                kind="lte"
                type={lteLockType}
                items={lteItems}
                mobility={lteMobility}
                onTypeChange={setLteLockType}
                onItemsChange={setLteItems}
                onMobilityChange={setLteMobility}
              />
            </Collapse.Panel>
            <Collapse.Panel header="5G 锁频设置" itemKey="nrLock">
              <LockEditor
                kind="nr"
                type={nrLockType}
                items={nrItems}
                mobility={nrMobility}
                onTypeChange={setNrLockType}
                onItemsChange={setNrItems}
                onMobilityChange={setNrMobility}
              />
            </Collapse.Panel>
          </Collapse>
        </PageCard>

        <SchedulePanel />

        <ScanPanel
          disabled={busy}
          onScanningChange={setScanning}
          onLock={(target) =>
            lockCell({
              type: target.type,
              band: target.band,
              arfcn: target.arfcn,
              pci: Number(target.pci),
              rsrp: '',
              scs: target.scs,
            })
          }
        />

        <PageCard
          title="邻区扫描"
          extra={
            <Space>
              <Button loading={scanLoading} disabled={scanning} onClick={scanNeighbors}>
                扫描邻区
              </Button>
              <AutoRefresh
                enabled={auto}
                interval={interval}
                onChange={(e, i) => {
                  setAuto(e);
                  setIntervalSec(i);
                  if (e) scanNeighbors();
                }}
              />
            </Space>
          }
        >
          {/* 窄屏放不下 8 列表格，"锁定"按钮会被裁出屏幕，改成列表逐项展示 */}
          {isNarrow ? (
            <div className="cell-list">
              {neighborTableData.length === 0 ? (
                <div className="cell-list-empty">暂无邻区</div>
              ) : (
                neighborTableData.map((cell) => (
                  <div className="cell-list-item" key={cell.key}>
                    <div className="cell-list-body">
                      <div className="cell-list-main">
                        <Tag size="small" color={cell.type === 'NR' ? 'violet' : 'blue'}>
                          {cell.type}
                        </Tag>
                        <b>
                          {cell.band ? (cell.type === 'NR' ? `n${cell.band}` : `B${cell.band}`) : '—'}
                          {` · ${cell.arfcn}`}
                        </b>
                        <span>PCI {cell.pci}</span>
                      </div>
                      <div className="cell-list-sub">
                        RSRP {cell.rsrp}
                        {cell.rsrq !== undefined ? ` · RSRQ ${cell.rsrq}` : ''}
                        {cell.sinr !== undefined ? ` · SINR ${cell.sinr}` : ''}
                      </div>
                    </div>
                    <Button size="small" onClick={() => lockCellRef.current(cell)}>
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
              dataSource={neighborTableData}
              empty="暂无邻区"
              columns={neighborColumns}
            />
          )}
        </PageCard>

        <PageCard title="SSB 波束信息" extra={<Button loading={busy} onClick={querySSB}>查询 SSB</Button>}>
          {!ssb ? (
            <Typography.Text type="tertiary">尚未查询。SSB 用于 5G 小区搜索与初始接入。</Typography.Text>
          ) : (
            <TwoCol>
              <Panel title={`服务小区 PCI ${ssb.servingCell.pci}`}>
                <Typography.Text type="tertiary">
                  ARFCN {ssb.servingCell.arfcn} · CID {ssb.servingCell.cid} · RSRP {ssb.servingCell.rsrp} · SINR {ssb.servingCell.sinr} · TA {ssb.servingCell.ta}
                </Typography.Text>
                <Space wrap style={{ marginTop: 8 }}>
                  {ssb.servingCell.ssbs.map((b) => (
                    <Tag key={b.ssbId} color="red">
                      SSB {b.ssbId}: {b.rsrp} dBm
                    </Tag>
                  ))}
                </Space>
              </Panel>
              <Panel title="邻区波束">
                {ssb.neighborCells.length === 0 ? (
                  <Typography.Text type="tertiary">无邻区 SSB</Typography.Text>
                ) : (
                  ssb.neighborCells.map((n) => (
                    <div key={`${n.pci}-${n.arfcn}`} style={{ marginBottom: 8 }}>
                      <Typography.Text>
                        PCI {n.pci} · ARFCN {n.arfcn} · RSRP {n.rsrp}
                      </Typography.Text>
                      <div>
                        {n.ssbs.map((b) => (
                          <Tag key={b.ssbId} size="small">
                            {b.ssbId}:{b.rsrp}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </Panel>
            </TwoCol>
          )}
        </PageCard>

        <SectionHeader
          title="5G 接入模式"
          desc="切换 SA / NSA 会短暂进入飞行模式，设置后自动重新查询"
          extra={<Tag color="red">当前：{optionText()}</Tag>}
        />
        <PageCard title="5G 接入模式设置">
          <Banner type="info" closeIcon={null} description="切换 SA/NSA 会短暂进入飞行模式。当前模式会在设置后重新查询。" />
          <div className="action-row" style={{ marginTop: 12 }}>
            <Button onClick={() => set5G({ nr_sa_support_flag: 1, nr_dc_mode: 0, gc_access_mode: 1 })}>仅 SA</Button>
            <Button onClick={() => set5G({ nr_sa_support_flag: 0, nr_dc_mode: 1, gc_access_mode: 0 })}>仅 NSA</Button>
            <Button onClick={() => set5G({ nr_sa_support_flag: 1, nr_dc_mode: 1, gc_access_mode: 1 })}>SA+NSA</Button>
          </div>
        </PageCard>
      </div>
    </Spin>
  );
};

export default NetworkSettings;
