import React from 'react';
import {
  Banner,
  Button,
  Card,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import { IconRefresh } from '@douyinfe/semi-icons';

const joinClassNames = (...names: Array<string | false | null | undefined>) =>
  names.filter(Boolean).join(' ');

export const PageCard: React.FC<{
  title: React.ReactNode;
  extra?: React.ReactNode;
  hint?: string;
  variant?: 'default' | 'hero' | 'group';
  bodyClassName?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, extra, hint, variant = 'default', bodyClassName, footer, children }) => (
  <Card
    className={joinClassNames('page-card', variant !== 'default' && `page-card--${variant}`)}
    title={
      <div className="page-card-title">
        <span>{title}</span>
        {hint ? <span className="page-card-hint">{hint}</span> : null}
      </div>
    }
    headerExtraContent={extra}
  >
    {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    {footer ? <div className="page-card-footer">{footer}</div> : null}
  </Card>
);

export const Panel: React.FC<{
  title?: React.ReactNode;
  extra?: React.ReactNode;
  accent?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, extra, accent, className, children }) => (
  <div className={joinClassNames('panel', accent && 'panel--accent', className)}>
    {title ? (
      <div className="panel-head">
        <span>{title}</span>
        {extra ? <span className="panel-head-extra">{extra}</span> : null}
      </div>
    ) : null}
    {children}
  </div>
);

export const SectionHeader: React.FC<{
  title: React.ReactNode;
  desc?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  id?: string;
}> = ({ title, desc, icon, extra, id }) => (
  <div className="section-header" id={id}>
    <div className="section-header-main">
      {icon ? <span className="section-header-icon">{icon}</span> : <span className="section-header-marker" />}
      <div>
        <div className="section-header-title">{title}</div>
        {desc ? <div className="section-header-desc">{desc}</div> : null}
      </div>
    </div>
    {extra ? <div className="section-header-extra">{extra}</div> : null}
  </div>
);

export const Metric: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  color?: string;
  size?: 'lg' | 'md' | 'sm';
  align?: 'left' | 'center';
  tile?: boolean;
}> = ({ label, value, hint, color, size = 'md', align = 'left', tile }) => (
  <div
    className={joinClassNames(
      'metric',
      size !== 'md' && `metric--${size}`,
      align === 'center' && 'metric--center',
      tile && 'metric-tile',
    )}
  >
    <div className="metric-value" style={color ? { color } : undefined}>
      {value ?? '—'}
    </div>
    <div className="metric-label">{label}</div>
    {hint ? <div className="metric-hint">{hint}</div> : null}
  </div>
);

export const Kv: React.FC<{
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: 1 | 2 | 3 | 4;
  dense?: boolean;
}> = ({ items, columns = 2, dense }) => (
  <div
    className={joinClassNames(
      'kv-grid',
      columns !== 2 && `kv-grid--${columns}`,
      dense && 'kv-grid--dense',
    )}
  >
    {items.map((item) => (
      <div className="kv-item" key={item.label}>
        <div className="kv-label">{item.label}</div>
        <div className="kv-value">{item.value ?? '—'}</div>
      </div>
    ))}
  </div>
);

export const AutoRefresh: React.FC<{
  enabled: boolean;
  interval: number;
  onChange: (enabled: boolean, interval: number) => void;
}> = ({ enabled, interval, onChange }) => (
  <Space>
    <Switch checked={enabled} onChange={(value) => onChange(value, interval)} />
    <Typography.Text size="small" type="tertiary">
      自动刷新
    </Typography.Text>
    {enabled ? (
      <>
        <InputNumber
          size="small"
          min={1}
          max={60}
          value={interval}
          onChange={(value) => onChange(true, Number(value) || 5)}
          style={{ width: 72 }}
        />
        <Typography.Text size="small">秒</Typography.Text>
      </>
    ) : null}
  </Space>
);

export const RefreshBtn: React.FC<{ onClick: () => void; loading?: boolean; label?: string }> = ({
  onClick,
  loading,
  label = '刷新',
}) => (
  <Button icon={<IconRefresh />} onClick={onClick} loading={loading} size="small">
    {label}
  </Button>
);

export const TwoCol: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={joinClassNames('two-col', className)}>{children}</div>;

export const Field: React.FC<{
  label: string;
  extra?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ label, extra, hint, className, children }) => (
  <div className={joinClassNames('field', className)}>
    <div className="field-label">
      {label}
      {extra}
    </div>
    {children}
    {hint ? <div className="field-hint">{hint}</div> : null}
  </div>
);

export const ConfigSelect: React.FC<{
  label: string;
  current: React.ReactNode;
  currentColor?: string;
  value?: string | number;
  onChange: (value: any) => void;
  options: Array<{ label: React.ReactNode; value: string | number; disabled?: boolean }>;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  hint?: React.ReactNode;
  warning?: React.ReactNode;
}> = ({
  label,
  current,
  currentColor = 'red',
  value,
  onChange,
  options,
  placeholder,
  loading,
  disabled,
  hint,
  warning,
}) => (
  <div className="config-select">
    <div className="config-select-current">
      <span className="config-select-current-label">当前状态</span>
      <Tag color={currentColor as any}>{current ?? '未知'}</Tag>
    </div>
    <Field label={label} hint={hint}>
      <Select
        value={value}
        optionList={options as any}
        placeholder={placeholder}
        loading={loading}
        disabled={disabled}
        onChange={onChange}
      />
    </Field>
    {warning ? <Banner type="warning" closeIcon={null} description={warning} /> : null}
  </div>
);
