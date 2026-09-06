import React, { useState } from 'react';
import { Button, Tag, Typography } from '@douyinfe/semi-ui';
import { ATService } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import {
  parseC5greg,
  parseCgpaddr,
  parseLendc,
  parseNrTxPower,
  parseTxPower,
  type EndcStatus,
  type NrTxPower,
  type PdpAddress,
  type Reg5G,
  type TxPower,
} from '@/modem/status';
import { Kv, Panel, SectionHeader, TwoCol } from '@/ui/widgets';

const at = () => ATService.getInstance();

const dbm = (v: number | null): string => (v == null ? '—' : `${v} dBm`);

export const Diagnostics: React.FC = () => {
  const [endc, setEndc] = useState<EndcStatus | null>(null);
  const [reg, setReg] = useState<Reg5G | null>(null);
  const [tx, setTx] = useState<TxPower | null>(null);
  const [nrTx, setNrTx] = useState<NrTxPower[]>([]);
  const [addrs, setAddrs] = useState<PdpAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      // 这几条都可能因为"当前不是那个组网"而失败，属于正常情况，静默处理。
      // 手册 11.7.2：仅 LTE 主模且单板支持 NR 时查询才有效。
      const lendc = await at().sendCommand('AT^LENDC?');
      setEndc(lendc.success && lendc.data ? parseLendc(String(lendc.data)) : null);

      // 手册 5.27.2：仅当终端注册在 5G 核心网时上报。
      const c5g = await at().sendCommand('AT+C5GREG?');
      setReg(c5g.success && c5g.data ? parseC5greg(String(c5g.data)) : null);

      // 手册 13.23.2：仅 GUL 下有效，ENDC 场景查的是 LTE 侧。
      const txp = await at().sendCommand('AT^TXPOWER?');
      setTx(txp.success && txp.data ? parseTxPower(String(txp.data)) : null);

      // 手册 13.24.2：仅 NR/L 下有效，ENDC 场景查的是 NR 侧。
      const ntxp = await at().sendCommand('AT^NTXPOWER?');
      setNrTx(ntxp.success && ntxp.data ? parseNrTxPower(String(ntxp.data)) : []);

      // 不带 cid 就返回所有已激活 PDP 上下文的地址（手册 7.8.2）。
      const pdp = await at().sendCommand('AT+CGPADDR');
      setAddrs(pdp.success && pdp.data ? parseCgpaddr(String(pdp.data)) : []);
    } finally {
      setLoading(false);
    }
  };

  useATReady(refresh);

  const endcTag = () => {
    if (!endc) return <Tag color="grey">不适用</Tag>;
    if (endc.established) return <Tag color="green">已建立</Tag>;
    if (!endc.available) return <Tag color="red">小区不支持</Tag>;
    if (!endc.plmnAvailable) return <Tag color="orange">运营商未开通</Tag>;
    if (endc.restricted) return <Tag color="orange">网络侧受限</Tag>;
    return <Tag color="blue">支持但未建立</Tag>;
  };

  return (
    <>
      {/* 分组标题与刷新按钮放在一起，和页面其它区块的结构保持一致，
          不再额外套一层同名卡片 */}
      <SectionHeader
        title="连接诊断"
        desc="ENDC 是否真的建起来、5G 核心网注册状态、上行发射功率与 PDP 地址；发射功率接近上限通常说明信号弱或摆位不佳"
        extra={
          <Button size="small" loading={loading} onClick={refresh}>
            刷新
          </Button>
        }
      />
      <TwoCol>
        <Panel title="双连接与注册">
          <Kv
            items={[
              { label: 'ENDC 双连接', value: endcTag() },
              {
                label: '5G 核心网注册',
                value: reg ? (
                  <span>
                    {reg.statText}
                    {reg.act ? ` · ${reg.act}` : ''}
                  </span>
                ) : (
                  '未注册 5GC'
                ),
              },
              { label: 'TAC / 小区', value: reg && reg.tac ? `${reg.tac} / ${reg.ci || '—'}` : '—' },
              { label: '网络切片', value: reg && reg.nssai ? reg.nssai : '—' },
            ]}
          />
        </Panel>

        <Panel title="发射功率">
          <Kv
            items={[
              { label: 'LTE PUSCH / PUCCH', value: tx ? `${dbm(tx.pusch)} / ${dbm(tx.pucch)}` : '—' },
              { label: 'LTE SRS / PRACH', value: tx ? `${dbm(tx.srs)} / ${dbm(tx.prach)}` : '—' },
              ...(tx && tx.total !== null ? [{ label: '2G/3G 总功率', value: dbm(tx.total) }] : []),
              ...nrTx.map((c, i) => ({
                label: `NR CC${i + 1} PUSCH`,
                value: `${dbm(c.pusch)}${c.freq ? ` · ${(c.freq / 1000).toFixed(1)} MHz` : ''}`,
              })),
            ]}
          />
        </Panel>
      </TwoCol>

      {addrs.length > 0 ? (
        <Panel title="PDP 地址">
          <Kv
            items={addrs.map((a) => ({
              label: `CID ${a.cid} · ${a.family}`,
              value: a.address,
            }))}
          />
        </Panel>
      ) : (
        <Typography.Text type="tertiary" size="small">
          没有已激活的 PDP 上下文地址。
        </Typography.Text>
      )}
    </>
  );
};
