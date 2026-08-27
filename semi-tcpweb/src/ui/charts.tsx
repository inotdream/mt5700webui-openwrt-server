import React, { useId } from 'react';

// 轻量 SVG 图表，零依赖。
//
// 页面跑在路由器上，不为几条曲线引入 echarts 一类的库。
// 视觉上跟随 Semi 的设计语言：语义色 token、细网格、无发光无渐变堆砌；
// 多序列同时用线型（实线/虚线）区分，不只依赖颜色；动效尊重 prefers-reduced-motion。

export interface Series {
  label: string;
  values: number[];
  /** 建议传 CSS 变量，如 var(--app-info)，保持和全站 token 一致 */
  color: string;
  /** 虚线序列：多条线并存时用线型区分，色弱用户也能分辨 */
  dashed?: boolean;
}

interface SparklineProps {
  series: Series[];
  height?: number;
  /** Y 轴最小跨度，避免数值几乎不动时把噪声放大成剧烈波动 */
  minRange?: number;
  /** 固定 Y 轴范围，信号这类有物理量程的指标用得上 */
  domain?: [number, number];
  format?: (value: number) => string;
  empty?: string;
  /** 图上方已有大号数值时可关掉图例，避免同一数据出现两遍 */
  showLegend?: boolean;
  className?: string;
}

const VIEW_W = 100;
const VIEW_H = 46;

// Catmull-Rom 样条转三次贝塞尔，得到平滑曲线；控制点夹在可视区内避免过冲。
function buildSmoothPath(points: Array<{ x: number; y: number }>, viewH: number, tension = 0.2): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp1y = Math.max(1, Math.min(viewH - 1, p1.y + (p2.y - p0.y) * tension));
    const cp2y = Math.max(1, Math.min(viewH - 1, p2.y - (p3.y - p1.y) * tension));

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

export const Sparkline: React.FC<SparklineProps> = ({
  series,
  height = 100,
  minRange = 1,
  domain,
  format = (v) => v.toFixed(1),
  empty = '暂无数据',
  showLegend = true,
  className,
}) => {
  const gradientId = useId();
  const allValues = series.flatMap((s) => s.values);

  if (allValues.length === 0) {
    return (
      <div className={`chart-empty ${className || ''}`} style={{ height }}>
        {empty}
      </div>
    );
  }

  let min = domain ? domain[0] : Math.min(...allValues);
  let max = domain ? domain[1] : Math.max(...allValues);

  if (max - min < minRange) {
    const mid = (max + min) / 2;
    min = mid - minRange / 2;
    max = mid + minRange / 2;
  }
  if (!domain) {
    const pad = (max - min) * 0.14;
    // 速率这类非负序列不让下界跌破 0；RSRP 这类负值序列不能硬夹到 0，
    // 否则量程翻转，整条线会贴在边上。
    const nonNegative = Math.min(...allValues) >= 0;
    min = nonNegative ? Math.max(0, min - pad) : min - pad;
    max += pad;
  }
  const span = max - min || 1;

  const pointsOf = (values: number[]) =>
    values.map((v, idx) => {
      const x = values.length > 1 ? idx * (VIEW_W / (values.length - 1)) : VIEW_W;
      const clamped = Math.max(min, Math.min(max, v));
      const y = VIEW_H - ((clamped - min) / span) * (VIEW_H - 4) - 2;
      return { x, y };
    });

  return (
    <div className={`sparkline ${className || ''}`}>
      <div className="sparkline-canvas" style={{ height }}>
        <svg
          className="sparkline-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          style={{ height }}
          role="img"
          aria-label={series.map((s) => `${s.label} ${s.values.length ? format(s.values[s.values.length - 1]) : ''}`).join('，')}
        >
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.label} id={`${gradientId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {[0.25, 0.5, 0.75].map((r) => (
            <line
              key={r}
              className="chart-grid-line"
              x1="0"
              x2={VIEW_W}
              y1={VIEW_H * r}
              y2={VIEW_H * r}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {series.map((s, i) => {
            if (s.values.length === 0) return null;
            const points = pointsOf(s.values);
            const curve = buildSmoothPath(points, VIEW_H);
            if (!curve) return null;
            return (
              <g key={s.label}>
                <path d={`${curve} L ${VIEW_W},${VIEW_H} L 0,${VIEW_H} Z`} fill={`url(#${gradientId}-${i})`} />
                <path
                  d={curve}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        {/* 最新采样点标记。用 HTML 定位保持正圆，不随 SVG 非等比缩放变形 */}
        {series.map((s) => {
          if (s.values.length === 0) return null;
          const last = s.values[s.values.length - 1];
          const clamped = Math.max(min, Math.min(max, last));
          const yPct = ((VIEW_H - ((clamped - min) / span) * (VIEW_H - 4) - 2) / VIEW_H) * 100;
          return (
            <span
              key={`dot-${s.label}`}
              className="sparkline-dot"
              style={{ top: `${yPct}%`, backgroundColor: s.color }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {showLegend ? (
        <div className="sparkline-legend">
          {series.map((s) => (
            <span className="sparkline-legend-item" key={s.label}>
              <i
                className={s.dashed ? 'sparkline-legend-swatch sparkline-legend-swatch--dashed' : 'sparkline-legend-swatch'}
                style={{ backgroundColor: s.dashed ? undefined : s.color, borderColor: s.color }}
              />
              {s.label}
              <b>{s.values.length ? format(s.values[s.values.length - 1]) : '—'}</b>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

interface QualityBarProps {
  value: number | null;
  /** [最差, 最好]；温度这类"越高越糟"的指标把 higherIsWorse 置真即可 */
  domain: [number, number];
  label: string;
  unit?: string;
  higherIsWorse?: boolean;
}

/**
 * 单值质量条。档位只分好/中/差三档，用全站语义色，
 * 数值本身始终可见，不依赖颜色传达信息。
 */
export const QualityBar: React.FC<QualityBarProps> = ({
  value,
  domain,
  label,
  unit = '',
  higherIsWorse = false,
}) => {
  const [lo, hi] = domain;
  const ratio = value === null ? 0 : Math.max(0, Math.min(1, (value - lo) / (hi - lo || 1)));
  const goodness = higherIsWorse ? 1 - ratio : ratio;
  const tone =
    goodness >= 0.6 ? 'var(--app-success)' : goodness >= 0.35 ? 'var(--app-warning)' : 'var(--app-danger)';

  return (
    <div className="quality-bar">
      <div className="quality-bar-head">
        <span>{label}</span>
        <b>{value === null ? '—' : `${value}${unit}`}</b>
      </div>
      <div
        className="quality-bar-track"
        role="meter"
        aria-label={label}
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={value ?? undefined}
      >
        <div
          className="quality-bar-fill"
          style={{ width: `${Math.max(3, ratio * 100)}%`, background: value === null ? 'var(--app-border-strong)' : tone }}
        />
      </div>
    </div>
  );
};

interface RingGaugeProps {
  /** 0-100；null 表示不可测 */
  percent: number | null;
  label: string;
  size?: number;
  color?: string;
}

/** 环形仪表，用于"信号质量"这类单一百分比。数值居中，颜色随好坏档位。 */
export const RingGauge: React.FC<RingGaugeProps> = ({ percent, label, size = 76, color = 'var(--app-success)' }) => {
  const strokeWidth = 7;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const p = percent === null ? 0 : Math.max(0, Math.min(100, percent));

  return (
    <div className="ring-gauge">
      <div className="ring-gauge-dial" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent ?? undefined}
        >
          <circle
            className="ring-gauge-track"
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={strokeWidth}
          />
          <circle
            className="ring-gauge-arc"
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={percent === null ? 'var(--app-border-strong)' : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(circumference * p) / 100} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <b className="ring-gauge-value">{percent === null ? '—' : `${p}%`}</b>
      </div>
      <span className="ring-gauge-label">{label}</span>
    </div>
  );
};
