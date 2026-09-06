import React from 'react';
import { Button, Input, Radio, RadioGroup, Select } from '@douyinfe/semi-ui';
import { getDefaultScsType } from '@/modem/parse';
import {
  emptyLockItem,
  LOCK_TYPES,
  LTE_BANDS,
  MAX_LOCK_ITEMS,
  MAX_PCI,
  NR_BANDS,
  SCS_TYPES,
  lockKindLabel,
  type LockItem,
  type LockKind,
} from '@/modem/lock';
import { Field } from './widgets';

type Props = {
  kind: LockKind;
  type: number;
  items: LockItem[];
  onTypeChange: (type: number) => void;
  onItemsChange: (items: LockItem[]) => void;
  /** 定时锁频固定使用"禁止重选和切换"，不显示这一项 */
  mobility?: number;
  onMobilityChange?: (mobility: number) => void;
};

/**
 * 锁频参数编辑器。即时锁频与定时锁频编排共用，保证两处的参数约束一致。
 * 手册 13.12.3：锁频点需要 band+频点，锁小区还需要 PCI，锁 Band 只要 band；
 * NR 另外需要 scstype（13.13.3）。
 */
export const LockEditor: React.FC<Props> = ({
  kind,
  type,
  items,
  onTypeChange,
  onItemsChange,
  mobility,
  onMobilityChange,
}) => {
  const bands = kind === 'lte' ? LTE_BANDS : NR_BANDS;
  const label = lockKindLabel(kind);
  const patch = (index: number, next: Partial<LockItem>) => {
    const copy = [...items];
    copy[index] = { ...copy[index], ...next };
    onItemsChange(copy);
  };

  return (
    <>
      <Field label="锁频类型">
        <RadioGroup value={type} onChange={(e) => onTypeChange(e.target.value)}>
          {LOCK_TYPES.map((o) => (
            <Radio key={o.value} value={o.value}>
              {o.label}
            </Radio>
          ))}
        </RadioGroup>
      </Field>
      {type !== 0 && onMobilityChange && (
        <Field label="移动性设置">
          <RadioGroup value={mobility} onChange={(e) => onMobilityChange(e.target.value)}>
            <Radio value={0}>禁止重选和切换</Radio>
            <Radio value={1}>允许重选和切换</Radio>
          </RadioGroup>
        </Field>
      )}
      {type !== 0 &&
        items.map((item, index) => (
          <div className="lock-row" key={`${kind}-${index}`}>
            <Select
              placeholder="频段"
              optionList={bands}
              value={item.band}
              onChange={(v) =>
                patch(index, {
                  band: Number(v),
                  ...(kind === 'nr' ? { scs: getDefaultScsType(Number(v)) } : null),
                })
              }
              style={{ minWidth: 160 }}
            />
            {(type === 1 || type === 2) && (
              <Input placeholder="ARFCN" value={item.arfcn || ''} onChange={(v) => patch(index, { arfcn: v })} />
            )}
            {kind === 'nr' && (type === 1 || type === 2) && (
              <Select
                placeholder="SCS"
                optionList={SCS_TYPES}
                value={item.scs}
                onChange={(v) => patch(index, { scs: Number(v) })}
                style={{ minWidth: 110 }}
              />
            )}
            {type === 2 && (
              <Input
                placeholder={`PCI 0-${MAX_PCI[kind]}`}
                value={item.pci || ''}
                onChange={(v) => patch(index, { pci: v })}
              />
            )}
            {index > 0 && (
              <Button type="danger" theme="borderless" onClick={() => onItemsChange(items.filter((_, i) => i !== index))}>
                删除
              </Button>
            )}
          </div>
        ))}
      {type !== 0 && items.length < MAX_LOCK_ITEMS && (
        <Button theme="light" onClick={() => onItemsChange([...items, emptyLockItem()])}>
          添加{label}锁频项
        </Button>
      )}
    </>
  );
};
