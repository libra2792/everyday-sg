import { useEffect, useId, useRef, useState } from 'react';
import { sgd } from '@/lib/format';

/**
 * Measure the rendered width of a chart container so the SVG viewBox can match it.
 * Keeps text at a readable size on narrow screens instead of scaling a fixed-width drawing down.
 */
function useContainerWidth(fallback = 640): [React.RefObject<HTMLElement | null>, number] {
  const ref = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(Math.max(280, Math.round(w)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/* ---------------------------------------------------------------------- */
/* Palette — restrained, consistent across charts                          */
/* ---------------------------------------------------------------------- */

export const CHART_COLOURS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--sage-900)', 'var(--stone-300)', 'var(--clay-700)'];

function ChartPlaceholder({ text = 'The chart appears once there are figures to plot.' }: { text?: string }) {
  return <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-stone-300 text-[13px] text-ink-faint">{text}</div>;
}

/* ---------------------------------------------------------------------- */
/* BarList — horizontal bars with labels, the workhorse for breakdowns     */
/* ---------------------------------------------------------------------- */

export interface BarListItem {
  label: string;
  value: number;
  colour?: string;
  hint?: string;
}

interface BarListProps {
  items: BarListItem[];
  format?: (n: number) => string;
  max?: number;
  ariaLabel: string;
  className?: string;
}

export function BarList({ items, format = sgd, max, ariaLabel, className = '' }: BarListProps) {
  const top = max ?? Math.max(1, ...items.map((i) => Math.abs(i.value)));
  return (
    <div className={`space-y-2.5 ${className}`} role="list" aria-label={ariaLabel}>
      {items.map((item, i) => {
        const width = Math.max(0, Math.min(100, (Math.abs(item.value) / top) * 100));
        return (
          <div key={`${item.label}-${i}`} role="listitem">
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate text-ink-muted">{item.label}</span>
              <span className="shrink-0 tabular-nums text-ink">
                {format(item.value)}
                {item.hint && <span className="ml-1.5 text-ink-faint">{item.hint}</span>}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full" style={{ width: `${width}%`, background: item.colour ?? CHART_COLOURS[i % CHART_COLOURS.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* StackedBar — a single composition bar with a legend                     */
/* ---------------------------------------------------------------------- */

interface StackedBarProps {
  segments: { label: string; value: number; colour?: string }[];
  format?: (n: number) => string;
  ariaLabel: string;
  className?: string;
}

export function StackedBar({ segments, format = sgd, ariaLabel, className = '' }: StackedBarProps) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  return (
    <div className={className}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-stone-200" role="img" aria-label={ariaLabel}>
        {total > 0 &&
          segments.map((seg, i) => (
            <div key={seg.label} style={{ width: `${(Math.max(0, seg.value) / total) * 100}%`, background: seg.colour ?? CHART_COLOURS[i % CHART_COLOURS.length] }} title={`${seg.label}: ${format(seg.value)}`} />
          ))}
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
        {segments.map((seg, i) => (
          <li key={seg.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink-muted">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: seg.colour ?? CHART_COLOURS[i % CHART_COLOURS.length] }} aria-hidden />
              {seg.label}
            </span>
            <span className="tabular-nums text-ink">
              {format(seg.value)}
              <span className="ml-1.5 text-ink-faint">{total > 0 ? `${Math.round((Math.max(0, seg.value) / total) * 100)}%` : ''}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* LineChart — small multi-series line chart in SVG                        */
/* ---------------------------------------------------------------------- */

export interface LineSeries {
  name: string;
  colour?: string;
  points: { x: number; y: number }[];
  dashed?: boolean;
}

interface LineChartProps {
  series: LineSeries[];
  xLabel?: string;
  yLabel?: string;
  formatX?: (n: number) => string;
  formatY?: (n: number) => string;
  ariaLabel: string;
  height?: number;
  className?: string;
  /** Optional vertical marker, e.g. retirement age */
  markerX?: number;
  markerLabel?: string;
}

function niceTicks(min: number, max: number, count = 4): number[] {
  if (!(max > min)) return [min];
  const span = max - min;
  const rough = span / count;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * pow);
  const step = candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1];
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(v);
  return ticks;
}

export function LineChart({ series, xLabel, yLabel, formatX = (n) => String(Math.round(n)), formatY = sgd, ariaLabel, height = 220, className = '', markerX, markerLabel }: LineChartProps) {
  const id = useId();
  const [ref, width] = useContainerWidth();
  const pad = { top: 16, right: 16, bottom: 36, left: width < 420 ? 56 : 64 };
  const all = series.flatMap((s) => s.points);
  const yMaxRaw = all.length ? Math.max(0, ...all.map((p) => p.y)) : 0;
  if (all.length === 0 || yMaxRaw === 0) {
    return (
      <figure className={className} ref={ref as React.RefObject<HTMLElement>}>
        <ChartPlaceholder />
      </figure>
    );
  }
  const xMin = Math.min(...all.map((p) => p.x));
  const xMax = Math.max(...all.map((p) => p.x));
  const yTicks = niceTicks(0, yMaxRaw || 1);
  const yMax = Math.max(yTicks[yTicks.length - 1] ?? yMaxRaw, yMaxRaw) || 1;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const sx = (x: number) => pad.left + (xMax === xMin ? 0 : ((x - xMin) / (xMax - xMin)) * innerW);
  const sy = (y: number) => pad.top + innerH - (Math.max(0, y) / yMax) * innerH;
  const xTicks = niceTicks(xMin, xMax, width < 420 ? 4 : 6);
  const compactY = (n: number) => (width < 420 && Math.abs(n) >= 1000 ? `$${Math.round(n / 1000)}k` : formatY(n));

  return (
    <figure className={className} ref={ref as React.RefObject<HTMLElement>}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="h-auto w-full" role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{ariaLabel}</title>
        {/* grid + y axis */}
        {yTicks.map((t) => (
          <g key={`y-${t}`}>
            <line x1={pad.left} x2={width - pad.right} y1={sy(t)} y2={sy(t)} style={{ stroke: 'var(--chart-grid)' }} strokeWidth={1} />
            <text x={pad.left - 8} y={sy(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} className="fill-ink-faint">
              {compactY(t)}
            </text>
          </g>
        ))}
        {/* x axis */}
        {xTicks.map((t) => (
          <text key={`x-${t}`} x={sx(t)} y={height - pad.bottom + 16} textAnchor="middle" fontSize={11} className="fill-ink-faint">
            {formatX(t)}
          </text>
        ))}
        {xLabel && (
          <text x={pad.left + innerW / 2} y={height - 4} textAnchor="middle" fontSize={11} className="fill-ink-faint">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text x={12} y={pad.top + innerH / 2} textAnchor="middle" fontSize={11} className="fill-ink-faint" transform={`rotate(-90 12 ${pad.top + innerH / 2})`}>
            {yLabel}
          </text>
        )}
        {markerX !== undefined && markerX >= xMin && markerX <= xMax && (
          <g>
            <line x1={sx(markerX)} x2={sx(markerX)} y1={pad.top} y2={pad.top + innerH} style={{ stroke: 'var(--stone-500)' }} strokeDasharray="4 4" />
            {markerLabel && (
              <text x={sx(markerX) + 4} y={pad.top + 10} fontSize={11} className="fill-ink-muted">
                {markerLabel}
              </text>
            )}
          </g>
        )}
        {series.map((s, i) => {
          const d = s.points.map((p, j) => `${j === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
          return <path key={s.name} d={d} fill="none" style={{ stroke: s.colour ?? CHART_COLOURS[i % CHART_COLOURS.length] }} strokeWidth={2} strokeDasharray={s.dashed ? '6 4' : undefined} strokeLinejoin="round" />;
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-muted">
        {series.map((s, i) => (
          <span key={s.name} className="inline-flex items-center gap-2">
            <span className="inline-block h-0.5 w-5 rounded" style={{ background: s.colour ?? CHART_COLOURS[i % CHART_COLOURS.length], borderTop: s.dashed ? '2px dashed' : undefined }} aria-hidden />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------------- */
/* ColumnChart — simple vertical columns for scenario comparisons           */
/* ---------------------------------------------------------------------- */

interface ColumnChartProps {
  items: { label: string; value: number; colour?: string; highlight?: boolean }[];
  format?: (n: number) => string;
  ariaLabel: string;
  height?: number;
  className?: string;
}

export function ColumnChart({ items, format = sgd, ariaLabel, height = 180, className = '' }: ColumnChartProps) {
  const id = useId();
  const [ref, width] = useContainerWidth();
  const pad = { top: 24, right: 8, bottom: 28, left: 8 };
  const max = Math.max(1, ...items.map((i) => Math.max(0, i.value)));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const gap = width < 420 ? 6 : 12;
  const colW = items.length > 0 ? (innerW - gap * (items.length - 1)) / items.length : innerW;
  const compact = (n: number) => (colW < 70 && Math.abs(n) >= 10000 ? `$${Math.round(n / 1000)}k` : format(n));
  const shorten = (s: string) => {
    const maxChars = Math.max(4, Math.floor(colW / 6.5));
    return s.length > maxChars ? `${s.slice(0, maxChars - 1)}…` : s;
  };
  if (items.length === 0 || items.every((i) => !(i.value > 0))) {
    return (
      <figure className={className} ref={ref as React.RefObject<HTMLElement>}>
        <ChartPlaceholder />
      </figure>
    );
  }
  return (
    <figure className={className} ref={ref as React.RefObject<HTMLElement>}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="h-auto w-full" role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{ariaLabel}</title>
        <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} style={{ stroke: 'var(--stone-400)' }} />
        {items.map((it, i) => {
          const h = (Math.max(0, it.value) / max) * innerH;
          const x = pad.left + i * (colW + gap);
          const y = pad.top + innerH - h;
          return (
            <g key={`${it.label}-${i}`}>
              <rect x={x} y={y} width={colW} height={h} rx={3} style={{ fill: it.colour ?? (it.highlight ? 'var(--chart-2)' : 'var(--chart-3)') }} />
              <text x={x + colW / 2} y={y - 6} textAnchor="middle" fontSize={11} className="fill-ink">
                {compact(it.value)}
              </text>
              <text x={x + colW / 2} y={pad.top + innerH + 16} textAnchor="middle" fontSize={11} className="fill-ink-faint">
                <title>{it.label}</title>
                {shorten(it.label)}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
