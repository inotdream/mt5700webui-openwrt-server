import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Banner, Button, Input, Modal, Space, Toast, Typography } from '@douyinfe/semi-ui';
import { IconLock } from '@douyinfe/semi-icons';
import { ATService, type ATResponse, type URCData } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import {
  buildPinCommand,
  parseCpin,
  parseSimsq,
  simErrorMessage,
  type SimSlotStatus,
  type SimState,
} from '@/modem/sim';

const at = () => ATService.getInstance();

/**
 * SIM 卡被 PIN/PUK 锁住时，模组不会注册上网，页面上只会表现为"没信号"，
 * 用户很难联想到是卡锁。这里在任意页面都监控卡状态，一旦需要密码就弹窗，
 * 不用先摸到模组设置页去找。
 */
const SimPinHandler: React.FC = () => {
  const [sim, setSim] = useState<SimState | null>(null);
  const [slot, setSlot] = useState<SimSlotStatus | null>(null);
  const [visible, setVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [busy, setBusy] = useState(false);
  // 用户点了"稍后处理"就不再自动弹，除非卡状态又变了。
  const dismissedRef = useRef('');
  const lastRefreshRef = useRef(0);

  // force 用于解锁之后这类必须拿到最新状态的场合；上报触发的走节流，
  // 因为卡状态变化时模组常常连着推好几条，别把 AT 通道刷满。
  const refresh = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < 2000) return;
    lastRefreshRef.current = now;

    const res = await at().sendCommand('AT+CPIN?');
    const state = parseCpin(String(('data' in res && res.data) || ('error' in res && res.error) || ''));
    if (!state) return;

    setSim(state);
    if (state.blocked) {
      if (dismissedRef.current !== state.code) setVisible(true);
    } else {
      setVisible(false);
      dismissedRef.current = '';
    }

    // 手册 6.6：^SIMSQ 能区分"卡不在位""卡被锁""PUK 锁死"，比 +CPIN 更细。
    const sq = await at().sendCommand('AT^SIMSQ?');
    if (sq.success && sq.data) setSlot(parseSimsq(String(sq.data)));
  }, []);

  useATReady(refresh);

  // 插拔卡或解锁成功后模组会主动上报，据此重新判断，不做轮询。
  useEffect(() => {
    const handle = (response: ATResponse) => {
      if (!('type' in response)) return;
      if (response.type === 'urc_data') {
        const urc = response.data as URCData;
        if (urc.raw && /\^SIMSQ:|\+CPIN:|\^SIMST/.test(urc.raw)) refresh();
      }
    };
    at().subscribe(handle);
    return () => at().unsubscribe(handle);
  }, [refresh]);

  const reset = () => {
    setPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const submit = async () => {
    if (!sim) return;
    if (sim.needsNewPin && newPin !== confirmPin) {
      Toast.error('两次输入的新 PIN 码不一致');
      return;
    }

    const op = sim.needsNewPin ? 'unblock' : 'verify';
    const { command, error } = buildPinCommand(op, {
      pin,
      newPin,
      pin2: sim.lock === 'pin2' || sim.lock === 'puk2',
    });
    if (error) {
      Toast.error(error);
      return;
    }

    setBusy(true);
    try {
      const res = await at().sendCommand(command);
      if (!res.success) {
        Toast.error(simErrorMessage(String(('error' in res && res.error) || ''), '解锁失败'));
        return;
      }
      reset();
      if (sim.needsNewPin) {
        // 手册 6.3.2：用 PUK 解锁后需重启模组才能生效。
        Toast.success('PUK 解锁成功，需要重启模组后才会生效');
      } else {
        Toast.success('PIN 码验证成功');
      }
      setVisible(false);
      // 模组要花点时间完成卡初始化，等一下再回读状态。
      setTimeout(() => void refresh(true), 2000);
    } finally {
      setBusy(false);
    }
  };

  const later = () => {
    if (sim) dismissedRef.current = sim.code;
    setVisible(false);
    reset();
  };

  if (!sim) return null;

  const title = sim.needsNewPin ? 'SIM 卡需要 PUK 解锁' : 'SIM 卡需要 PIN 码';

  return (
    <Modal
      visible={visible}
      title={
        <Space>
          <IconLock />
          {title}
        </Space>
      }
      maskClosable={false}
      closable={false}
      width={420}
      footer={
        <Space>
          <Button onClick={later}>稍后处理</Button>
          <Button theme="solid" type="primary" loading={busy} onClick={submit}>
            {sim.needsNewPin ? '解锁并设置新 PIN' : '验证'}
          </Button>
        </Space>
      }
    >
      <Banner
        type={slot?.dead ? 'danger' : 'warning'}
        closeIcon={null}
        description={
          slot?.dead
            ? '这张卡已经失效：PUK 输错次数用尽或卡片物理损坏，需要联系运营商补卡。'
            : sim.needsNewPin
              ? 'PIN 码输错次数过多，卡已被锁。请输入运营商提供的 8 位 PUK 码，并设置一个新的 PIN 码。PUK 输错次数用尽后卡会永久失效。'
              : `${sim.label}。未输入 PIN 码前模组无法注册网络。PIN 连续输错会转为需要 PUK 解锁。`
        }
      />

      <div className="form-stack" style={{ marginTop: 16 }}>
        <Input
          mode="password"
          autoFocus
          value={pin}
          placeholder={sim.needsNewPin ? '请输入 PUK 码' : '请输入 PIN 码'}
          prefix={sim.needsNewPin ? 'PUK' : 'PIN'}
          disabled={busy || slot?.dead}
          onChange={setPin}
          onEnterPress={submit}
        />
        {sim.needsNewPin ? (
          <>
            <Input
              mode="password"
              value={newPin}
              placeholder="设置新的 PIN 码（4-8 位数字）"
              prefix="新 PIN"
              disabled={busy || slot?.dead}
              onChange={setNewPin}
            />
            <Input
              mode="password"
              value={confirmPin}
              placeholder="再次输入新的 PIN 码"
              prefix="确认"
              disabled={busy || slot?.dead}
              onChange={setConfirmPin}
              onEnterPress={submit}
            />
          </>
        ) : null}
      </div>

      {slot ? (
        <Typography.Text type="tertiary" size="small">
          卡状态：{slot.label}
        </Typography.Text>
      ) : null}
    </Modal>
  );
};

export default SimPinHandler;
