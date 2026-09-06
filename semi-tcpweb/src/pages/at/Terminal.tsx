import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Modal, Space, Toast, Typography } from '@douyinfe/semi-ui';
import { IconDelete, IconSend } from '@douyinfe/semi-icons';
import { ATService } from '@/services/at';
import { useATReady } from '@/hooks/useATReady';
import { PageCard, Panel } from '@/ui/widgets';

interface SavedCommand {
  command: string;
  remark: string;
}

interface LogEntry {
  cmd: string;
  body: string;
  ok: boolean;
  at: string;
}

const COMMON = [
  { label: '查询信号强度', command: 'AT^HCSQ?' },
  { label: '查询 IMEI', command: 'AT+CGSN' },
  { label: '查询版本', command: 'ATI' },
  { label: '查询 SIM 状态', command: 'AT+CPIN?' },
  { label: '查询网络注册', command: 'AT+CREG?' },
  { label: '查询基站信息', command: 'AT+CGREG?' },
  { label: '查询网络时间', command: 'AT^NWTIME?' },
];

const ATTerminal: React.FC = () => {
  const [command, setCommand] = useState('');
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedCommand[]>([]);
  const [modal, setModal] = useState(false);
  const [remark, setRemark] = useState('');
  const [tempCmd, setTempCmd] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);

  useATReady(() => {
    try {
      const raw = localStorage.getItem('savedAtCommands');
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  });

  // 新输出出现时贴到底部，像真终端一样跟随最新内容
  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const send = async (cmd = command) => {
    if (!cmd.trim()) {
      Toast.warning('请输入 AT 指令');
      return;
    }
    setLoading(true);
    try {
      const result = await ATService.getInstance().sendCommand(cmd);
      setEntries((prev) => [
        ...prev,
        {
          cmd: cmd.trim(),
          body: result.success ? String(result.data || '(无输出)') : String(result.error || '未知错误'),
          ok: !!result.success,
          at: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        },
      ]);
      setCommand('');
    } catch {
      Toast.error('发送失败');
    } finally {
      setLoading(false);
    }
  };

  const persist = (list: SavedCommand[]) => {
    setSaved(list);
    localStorage.setItem('savedAtCommands', JSON.stringify(list));
  };

  return (
    <PageCard title="AT 调试终端" hint="直接向模组发送指令">
      <div className="form-stack">
        <div className="at-console" ref={consoleRef} role="log" aria-label="AT 指令输出">
          {entries.length === 0 ? (
            <div className="at-console-empty">暂无输出，输入 AT 指令开始调试</div>
          ) : (
            entries.map((entry, index) => (
              <div className="at-console-entry" key={`${entry.at}-${index}`}>
                <div className="at-console-cmd">
                  <span className="at-console-prompt">›</span>
                  <b>{entry.cmd}</b>
                  <time>{entry.at}</time>
                </div>
                <pre className={entry.ok ? 'at-console-res' : 'at-console-res at-console-res--err'}>
                  {entry.body}
                </pre>
              </div>
            ))
          )}
        </div>
        <div className="at-input-row">
          <Input
            value={command}
            onChange={setCommand}
            onEnterPress={() => send()}
            placeholder="输入 AT 指令，回车发送"
          />
          <Button theme="solid" type="primary" icon={<IconSend />} loading={loading} onClick={() => send()}>
            发送
          </Button>
          <Button onClick={() => setEntries([])}>清空</Button>
          <Button
            onClick={() => {
              if (!command.trim()) {
                Toast.warning('请输入要保存的指令');
                return;
              }
              setTempCmd(command);
              setRemark('');
              setModal(true);
            }}
          >
            保存命令
          </Button>
        </div>

        <Panel title="常用命令">
          <Space wrap>
            {COMMON.map((item) => (
              <Button key={item.command} onClick={() => setCommand(item.command)}>
                {item.label}
              </Button>
            ))}
          </Space>
        </Panel>

        {saved.length > 0 ? (
          <Panel title="已保存的命令">
            <Space wrap>
              {saved.map((item) => (
                <Button
                  key={item.command}
                  onClick={() => setCommand(item.command)}
                  icon={<IconDelete />}
                  iconPosition="right"
                  onMouseDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.semi-icon-delete, .semi-icon')) {
                      e.preventDefault();
                      persist(saved.filter((c) => c.command !== item.command));
                      Toast.success('已删除');
                    }
                  }}
                >
                  {item.remark}
                </Button>
              ))}
            </Space>
          </Panel>
        ) : null}

        <Typography.Text type="tertiary" size="small">
          输入指令后按回车或点击发送。清空仅清除本页日志，不影响模组。
        </Typography.Text>
      </div>

      <Modal
        title="保存 AT 命令"
        visible={modal}
        onCancel={() => setModal(false)}
        onOk={() => {
          if (!remark.trim()) {
            Toast.warning('请输入备注');
            return;
          }
          if (saved.some((c) => c.command === tempCmd)) {
            Toast.warning('该命令已存在');
            setModal(false);
            return;
          }
          persist([...saved, { command: tempCmd, remark }]);
          Toast.success('已保存');
          setModal(false);
        }}
      >
        <Space vertical style={{ width: '100%' }}>
          <Input value={tempCmd} readonly />
          <Input value={remark} onChange={setRemark} placeholder="命令备注" />
        </Space>
      </Modal>
    </PageCard>
  );
};

export default ATTerminal;
