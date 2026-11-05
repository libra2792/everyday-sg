import type { ReactNode } from 'react';
import type { FigureSpec } from '@/data/types';
import { sgd } from '@/lib/format';
import { sgdK } from '@/lib/quick';
import { useContainerWidth } from '@/components/charts/Charts';

/**
 * Data-driven diagrams for guide pages. Every drawing is inline SVG in the page's own
 * colours: strokes and text use currentColor, fills use the theme variables, and the one
 * element that carries the point (a wait, a binding limit, a chosen branch) uses --chart-1.
 *
 * Wide containers draw on a fixed 760-unit canvas scaled to fit. Narrow ones (phones) are
 * drawn at their real pixel width with a layout of their own, so text stays readable and
 * nothing is clipped or scrolls sideways.
 */

const WIDE = 760;
/** Below this container width the narrow layouts are used. */
const NARROW_BELOW = 600;
/** A stroke in the figure's background colour behind text, so lines passing under it stay clear of the glyphs. */
const HALO: React.CSSProperties = { paintOrder: 'stroke', stroke: 'var(--stone-50)', strokeWidth: 4, strokeLinejoin: 'round' };
/** Average glyph width as a share of the font size, for fitting labels without measuring. */
const CHAR = 0.56;

type Anchor = 'start' | 'middle' | 'end';

function textWidth(text: string, size: number): number {
  return text.length * size * CHAR;
}

/** Left and right edges of a label drawn at x with the given anchor. */
function span(x: number, anchor: Anchor, w: number): [number, number] {
  return anchor === 'start' ? [x, x + w] : anchor === 'end' ? [x - w, x] : [x - w / 2, x + w / 2];
}

/** Keep a label inside [pad, W − pad]: as placed where it fits, otherwise pinned to the nearer edge. */
function fitLabel(x: number, anchor: Anchor, text: string, size: number, W: number, pad = 4): { x: number; anchor: Anchor } {
  const [l, r] = span(x, anchor, textWidth(text, size));
  if (l < pad) return { x: pad, anchor: 'start' };
  if (r > W - pad) return { x: W - pad, anchor: 'end' };
  return { x, anchor };
}

/** How many characters of a given font size fit in a width. */
function charsFor(width: number, size: number): number {
  return Math.max(6, Math.floor(width / (size * CHAR)));
}

function unitLabel(v: number, unit: 'sgd' | 'months' | 'pct' | 'number'): string {
  if (unit === 'sgd') return v >= 10000 ? sgdK(v) : sgd(v);
  if (unit === 'months') return `${Math.round(v * 10) / 10} mo`;
  if (unit === 'pct') return `${Math.round(v)}%`;
  return String(Math.round(v));
}

function wrapText(text: string, max: number, maxLines = 3): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

function Lines({ x, y, lines, size = 11.5, gap = 14, anchor = 'start', ...rest }: { x: number; y: number; lines: string[]; size?: number; gap?: number; anchor?: Anchor; fontWeight?: string; opacity?: string; style?: React.CSSProperties }) {
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={y + i * gap} textAnchor={anchor} fontSize={size} fill="currentColor" {...rest}>
          {l}
        </text>
      ))}
    </>
  );
}

function Svg({ W, H, aria, children }: { W: number; H: number; aria: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Timeline                                                                */
/* ---------------------------------------------------------------------- */

type TimelineSpec = Extract<FigureSpec, { type: 'timeline' }>;

function Timeline({ spec }: { spec: TimelineSpec }) {
  const laneGap = 110;
  const top = 70;
  const height = top + laneGap * (spec.lanes.length - 1) + 60;
  const maxNodes = Math.max(...spec.lanes.map((l) => l.nodes.length));
  const x0 = 120;
  const x1 = 700;
  const step = maxNodes > 1 ? (x1 - x0) / (maxNodes - 1) : 0;
  return (
    <Svg W={WIDE} H={height} aria={spec.aria}>
      {spec.lanes.map((lane, li) => {
        const y = top + li * laneGap;
        const xs = lane.nodes.map((_, i) => x0 + i * step);
        return (
          <g key={lane.label}>
            <text x="16" y={y + 4} fontSize="12" fontWeight="700" fill="currentColor">
              {lane.label}
            </text>
            <line x1={xs[0]} y1={y} x2={xs[xs.length - 1]} y2={y} stroke="currentColor" strokeWidth="2" />
            {lane.wait && (
              <>
                <line x1={xs[lane.wait.from]} y1={y} x2={xs[lane.wait.to]} y2={y} style={{ stroke: 'var(--chart-1)' }} strokeWidth="10" strokeLinecap="round" />
                <text x={(xs[lane.wait.from] + xs[lane.wait.to]) / 2} y={y - 18} textAnchor="middle" fontSize="11.5" fontWeight="600" style={{ fill: 'var(--chart-2)' }}>
                  {lane.wait.label}
                </text>
              </>
            )}
            {lane.nodes.map((label, i) => (
              <g key={label + i}>
                <circle cx={xs[i]} cy={y} r="7" style={{ fill: i === lane.nodes.length - 1 ? 'var(--chart-1)' : 'var(--stone-50)' }} stroke="currentColor" strokeWidth="2" />
                <text x={xs[i]} y={y + 28} textAnchor="middle" fontSize="11.5" fill="currentColor">
                  {label}
                </text>
              </g>
            ))}
          </g>
        );
      })}
      {spec.lanes.length > 1 && <line x1={x0} y1={top + 14} x2={x0} y2={top + laneGap * (spec.lanes.length - 1) - 14} stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".5" />}
    </Svg>
  );
}

/** Phones: each lane runs top to bottom; two lanes sit side by side so they can be compared. */
function TimelineNarrow({ spec, W }: { spec: TimelineSpec; W: number }) {
  const FS = 11.5;
  const LINE = 13;
  const groups = spec.lanes.length <= 2 ? [spec.lanes] : spec.lanes.map((l) => [l]);
  let y0 = 0;
  const drawn = groups.map((lanes, gi) => {
    const colW = W / lanes.length;
    const chars = charsFor(colW - 30, FS);
    const wrapped = lanes.map((lane) => ({ labels: lane.nodes.map((n) => wrapText(n, chars, 4)), wait: lane.wait ? wrapText(lane.wait.label, chars, 4) : [] }));
    const rows = Math.max(...lanes.map((l) => l.nodes.length));
    // Shared row heights keep the steps of both lanes level with each other.
    const rowH = Array.from({ length: rows }, (_, i) => {
      const lines = Math.max(1, ...wrapped.map((w) => w.labels[i]?.length ?? 0));
      const wait = Math.max(0, ...lanes.map((l, li) => (l.wait && l.wait.from === i ? wrapped[li].wait.length * LINE + 6 : 0)));
      return Math.max(28, lines * LINE + 14) + wait;
    });
    const top = y0 + 38;
    const ys = rowH.map((_, i) => top + rowH.slice(0, i).reduce((a, b) => a + b, 0));
    const el = (
      <g key={gi}>
        {lanes.map((lane, li) => {
          const cx = li * colW + 10;
          const tx = cx + 16;
          const nodeYs = lane.nodes.map((_, i) => ys[i]);
          return (
            <g key={lane.label}>
              <text x={li * colW + 2} y={y0 + 16} fontSize="12" fontWeight="700" fill="currentColor">
                {lane.label}
              </text>
              <line x1={cx} y1={nodeYs[0]} x2={cx} y2={nodeYs[nodeYs.length - 1]} stroke="currentColor" strokeWidth="2" />
              {lane.wait && <line x1={cx} y1={nodeYs[lane.wait.from]} x2={cx} y2={nodeYs[lane.wait.to]} style={{ stroke: 'var(--chart-1)' }} strokeWidth="8" strokeLinecap="round" />}
              {lane.nodes.map((label, i) => (
                <g key={label + i}>
                  <circle cx={cx} cy={nodeYs[i]} r="6" style={{ fill: i === lane.nodes.length - 1 ? 'var(--chart-1)' : 'var(--stone-50)' }} stroke="currentColor" strokeWidth="2" />
                  <Lines x={tx} y={nodeYs[i] + 4} lines={wrapped[li].labels[i]} size={FS} gap={LINE} />
                </g>
              ))}
              {lane.wait && <Lines x={tx} y={nodeYs[lane.wait.from] + 4 + wrapped[li].labels[lane.wait.from].length * LINE + 4} lines={wrapped[li].wait} size={FS} gap={LINE} fontWeight="600" style={{ fill: 'var(--chart-2)' }} />}
            </g>
          );
        })}
        {lanes.length > 1 && <line x1={colW - 4} y1={y0 + 4} x2={colW - 4} y2={ys[ys.length - 1] + 8} stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".35" />}
      </g>
    );
    y0 = ys[ys.length - 1] + rowH[rowH.length - 1] - 6;
    return el;
  });
  return (
    <Svg W={W} H={y0} aria={spec.aria}>
      {drawn}
    </Svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Band                                                                    */
/* ---------------------------------------------------------------------- */

type BandSpec = Extract<FigureSpec, { type: 'band' }>;

function Band({ spec }: { spec: BandSpec }) {
  const X0 = 40;
  const X1 = 720;
  const sx = (v: number) => X0 + (Math.min(Math.max(v, 0), spec.max) / spec.max) * (X1 - X0);
  const barH = 22;
  const rows = spec.bars.length;
  const axisY = 30 + rows * 46 + 8;
  const height = axisY + (spec.ticks && spec.ticks.length ? 48 : 30);
  const tickValues: number[] = [];
  const stepGuess = spec.max / 6;
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * Math.pow(10, Math.floor(Math.log10(stepGuess)))).find((s) => spec.max / s <= 7) ?? stepGuess;
  for (let v = 0; v <= spec.max + 1e-9; v += nice) tickValues.push(v);
  return (
    <Svg W={WIDE} H={height} aria={spec.aria}>
      {spec.bars.map((b, i) => {
        const y = 30 + i * 46;
        const w = Math.max(0, sx(b.value) - X0);
        return (
          <g key={b.label}>
            <text x={X0} y={y - 6} fontSize="11.5" fill="currentColor">
              {b.label}
              {b.value > 0 ? ` · ${unitLabel(b.value, spec.unit)}` : ''}
            </text>
            <rect x={X0} y={y} width={w} height={barH} rx="4" style={{ fill: b.strong ? 'var(--chart-1)' : 'var(--chart-3)' }} />
            {b.value > spec.max && (
              <text x={X1 + 4} y={y + 15} fontSize="11" fill="currentColor">
                ›
              </text>
            )}
          </g>
        );
      })}
      {spec.marker && spec.marker.value > 0 && (
        <>
          <line x1={sx(spec.marker.value)} y1="22" x2={sx(spec.marker.value)} y2={axisY - 10} stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
          <text x={sx(spec.marker.value)} y={axisY - 14 + 10} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="currentColor" dy="-14">
            {spec.marker.label}
          </text>
        </>
      )}
      <line x1={X0} y1={axisY} x2={X1} y2={axisY} stroke="currentColor" strokeWidth="1" />
      {tickValues.map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={axisY} x2={sx(v)} y2={axisY + 5} stroke="currentColor" />
          <text x={sx(v)} y={axisY + 18} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity=".8">
            {v === 0 ? '0' : unitLabel(v, spec.unit)}
          </text>
        </g>
      ))}
      {spec.ticks?.map((t) => (
        <g key={t.label}>
          <polygon points={`${sx(t.value)},${axisY} ${sx(t.value) - 5},${axisY - 8} ${sx(t.value) + 5},${axisY - 8}`} style={{ fill: 'var(--clay-500)' }} />
          <text x={sx(t.value)} y={axisY + 36} textAnchor={t.anchor ?? 'middle'} fontSize="10.5" style={{ fill: 'var(--clay-700)' }}>
            {t.label}
          </text>
        </g>
      ))}
    </Svg>
  );
}

/** Phones: fewer axis ticks, the full axis kept on screen, and marker labels stacked when they would collide. */
function BandNarrow({ spec, W }: { spec: BandSpec; W: number }) {
  const X0 = 12;
  const X1 = W - 12;
  const FS = 11.5;
  const TS = 10.5;
  const sx = (v: number) => X0 + (Math.min(Math.max(v, 0), spec.max) / spec.max) * (X1 - X0);

  // Bars: the label on the left, the value pinned right; long labels wrap.
  let y = 16;
  const bars = spec.bars.map((b) => {
    const value = b.value > 0 ? unitLabel(b.value, spec.unit) : '';
    const lines = wrapText(b.label, charsFor(X1 - X0 - textWidth(value, FS) - 8, FS), 2);
    const top = y;
    y += lines.length * 14 + 30;
    return { b, value, lines, top };
  });
  const axisY = y + (spec.marker && spec.marker.value > 0 ? 26 : 2);

  // Axis ticks at least ~56px apart, preferring a step that lands on the end of the axis.
  const maxIntervals = Math.max(2, Math.floor((X1 - X0) / 56));
  const mag = Math.pow(10, Math.floor(Math.log10(spec.max / maxIntervals)));
  const steps = [1, 2, 2.5, 3, 4, 5, 10, 20].map((m) => m * mag).filter((s) => spec.max / s <= maxIntervals + 1e-9);
  const step = steps.find((s) => Math.abs(spec.max / s - Math.round(spec.max / s)) < 1e-9) ?? steps[0] ?? spec.max;
  const tickValues: number[] = [];
  for (let v = 0; v <= spec.max + 1e-9; v += step) tickValues.push(v);

  // Marker labels (e.g. median prices): each keeps its side of the triangle, and drops to
  // the next row if it would overlap one already placed.
  const placed: { x: number; anchor: Anchor; row: number; label: string; value: number }[] = [];
  for (const t of spec.ticks ?? []) {
    const fit = fitLabel(sx(t.value), t.anchor ?? 'middle', t.label, TS, W);
    const [l, r] = span(fit.x, fit.anchor, textWidth(t.label, TS));
    let row = 0;
    while (placed.some((p) => p.row === row && (() => { const [pl, pr] = span(p.x, p.anchor, textWidth(p.label, TS)); return l < pr + 6 && r > pl - 6; })())) row += 1;
    placed.push({ ...fit, row, label: t.label, value: t.value });
  }
  const labelRows = placed.length ? Math.max(...placed.map((p) => p.row)) + 1 : 0;
  const height = axisY + 26 + (labelRows ? labelRows * 13 + 8 : 0);
  const marker = spec.marker && spec.marker.value > 0 ? { ...fitLabel(sx(spec.marker.value), 'middle', spec.marker.label, FS, W), label: spec.marker.label } : null;

  return (
    <Svg W={W} H={height} aria={spec.aria}>
      {/* The marker goes underneath, and the labels carry a halo in the figure's background, so the dashed line never cuts through text. */}
      {marker && spec.marker && (
        <>
          <line x1={sx(spec.marker.value)} y1="6" x2={sx(spec.marker.value)} y2={axisY - 24} stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" opacity=".7" />
          <text x={marker.x} y={axisY - 12} textAnchor={marker.anchor} fontSize={FS} fontWeight="700" fill="currentColor">
            {marker.label}
          </text>
        </>
      )}
      {bars.map(({ b, value, lines, top }) => (
        <g key={b.label}>
          <Lines x={X0} y={top} lines={lines} size={FS} style={HALO} />
          {value && (
            <text x={X1} y={top} textAnchor="end" fontSize={FS} fontWeight="600" fill="currentColor" style={HALO}>
              {value}
            </text>
          )}
          <rect x={X0} y={top + (lines.length - 1) * 14 + 6} width={Math.max(0, sx(b.value) - X0)} height="18" rx="4" style={{ fill: b.strong ? 'var(--chart-1)' : 'var(--chart-3)' }} />
        </g>
      ))}
      <line x1={X0} y1={axisY} x2={X1} y2={axisY} stroke="currentColor" strokeWidth="1" />
      {tickValues.map((v) => {
        const label = v === 0 ? '0' : unitLabel(v, spec.unit);
        const fit = fitLabel(sx(v), 'middle', label, TS, W, 2);
        return (
          <g key={v}>
            <line x1={sx(v)} y1={axisY} x2={sx(v)} y2={axisY + 5} stroke="currentColor" />
            <text x={fit.x} y={axisY + 18} textAnchor={fit.anchor} fontSize={TS} fill="currentColor" opacity=".8">
              {label}
            </text>
          </g>
        );
      })}
      {placed.map((t) => (
        <g key={t.label}>
          <polygon points={`${sx(t.value)},${axisY} ${sx(t.value) - 5},${axisY - 8} ${sx(t.value) + 5},${axisY - 8}`} style={{ fill: 'var(--clay-500)' }} />
          <line x1={sx(t.value)} y1={axisY + 22} x2={sx(t.value)} y2={axisY + 26 + t.row * 13} style={{ stroke: 'var(--clay-500)' }} strokeWidth="1" opacity=".6" />
          <text x={t.x} y={axisY + 36 + t.row * 13} textAnchor={t.anchor} fontSize={TS} style={{ fill: 'var(--clay-700)' }}>
            {t.label}
          </text>
        </g>
      ))}
    </Svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Gauge                                                                   */
/* ---------------------------------------------------------------------- */

function Gauge({ spec, W, narrow }: { spec: Extract<FigureSpec, { type: 'gauge' }>; W: number; narrow: boolean }) {
  const X0 = narrow ? 4 : 40;
  const X1 = W - (narrow ? 4 : 40);
  const n = Math.max(1, Math.round(spec.blocks));
  const gap = 6;
  const w = (X1 - X0 - gap * (n - 1)) / n;
  // On phones the right-hand note gets its own line under the title.
  const top = narrow && spec.right ? 54 : 36;
  const foot = narrow && spec.foot ? wrapText(spec.foot, charsFor(X1 - X0, 11.5), 2) : spec.foot ? [spec.foot] : [];
  const height = top + 84 + (Math.max(1, foot.length) - 1) * 14;
  return (
    <Svg W={W} H={height} aria={spec.aria}>
      <text x={X0} y="22" fontSize="12" fontWeight="600" fill="currentColor">
        {spec.title}
      </text>
      {spec.right && (
        <text x={narrow ? X0 : X1} y={narrow ? 40 : 22} textAnchor={narrow ? 'start' : 'end'} fontSize="12" fill="currentColor">
          {spec.right}
        </text>
      )}
      {Array.from({ length: n }, (_, k) => {
        const x = X0 + k * (w + gap);
        const fill = Math.max(0, Math.min(1, spec.filled - k));
        return (
          <g key={k}>
            <rect x={x} y={top} width={w} height="34" rx="6" style={{ fill: 'var(--stone-200)' }} />
            {fill > 0 && <rect x={x} y={top} width={w * fill} height="34" rx="6" style={{ fill: 'var(--chart-1)' }} />}
            <text x={x + w / 2} y={top + 56} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".8">
              {k + 1}
            </text>
          </g>
        );
      })}
      <Lines x={X0} y={top + 76} lines={foot} />
    </Svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Stack                                                                   */
/* ---------------------------------------------------------------------- */

const STACK_FILLS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--stone-300)'];

function Stack({ spec, W, narrow }: { spec: Extract<FigureSpec, { type: 'stack' }>; W: number; narrow: boolean }) {
  const X0 = narrow ? 4 : 40;
  const X1 = W - (narrow ? 4 : 40);
  const total = spec.segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  const scaleMax = Math.max(total, spec.marker?.value ?? 0, 1);
  const sx = (v: number) => X0 + (v / scaleMax) * (X1 - X0);
  const totalText = total > 0 ? `total ${unitLabel(total, spec.unit)}` : '';
  // Phones: the title wraps and the total sits under it; the legend is one column.
  const title = narrow ? wrapText(spec.title, charsFor(X1 - X0, 12), 3) : [spec.title];
  const barY = narrow ? 18 + title.length * 15 + (totalText ? 22 : 4) : 36;
  const cols = narrow ? 1 : 2;
  const legend = spec.segments.map((seg) => wrapText(`${seg.label}${seg.value > 0 ? ` · ${unitLabel(seg.value, spec.unit)}` : ''}`, narrow ? charsFor(X1 - X0 - 20, 11.5) : 200, 2));
  // On phones the marker's label sits under the bar, so the legend moves down to clear it.
  const legendY = barY + 60 + (narrow && spec.marker && spec.marker.value > 0 ? 10 : 0);
  const legendRows = Array.from({ length: Math.ceil(spec.segments.length / cols) }, (_, r) => Math.max(...legend.slice(r * cols, r * cols + cols).map((l) => l.length)));
  const rowY = legendRows.map((_, r) => legendY + legendRows.slice(0, r).reduce((a, b) => a + (b - 1) * 14 + 20, 0));
  const height = (rowY[rowY.length - 1] ?? legendY) + ((legendRows[legendRows.length - 1] ?? 1) - 1) * 14 + 28;
  const marker = spec.marker && spec.marker.value > 0 ? fitLabel(sx(spec.marker.value), spec.marker.value / scaleMax > 0.85 ? 'end' : 'middle', spec.marker.label, 11.5, W) : null;
  let acc = 0;
  return (
    <Svg W={W} H={height} aria={spec.aria}>
      <Lines x={X0} y={22} lines={title} size={12} gap={15} fontWeight="600" />
      <text x={narrow ? X0 : X1} y={narrow ? 22 + title.length * 15 : 22} textAnchor={narrow ? 'start' : 'end'} fontSize="12" fill="currentColor">
        {totalText}
      </text>
      <rect x={X0} y={barY} width={X1 - X0} height="34" rx="6" style={{ fill: 'var(--stone-200)' }} />
      {spec.segments.map((seg, i) => {
        const v = Math.max(0, seg.value);
        const x = sx(acc);
        const w = sx(acc + v) - x;
        acc += v;
        return <rect key={seg.label} x={x} y={barY} width={w} height="34" style={{ fill: seg.muted ? 'var(--stone-300)' : STACK_FILLS[i % STACK_FILLS.length] }} />;
      })}
      {marker && spec.marker && (
        <>
          <line x1={sx(spec.marker.value)} y1={barY - (narrow ? 4 : 8)} x2={sx(spec.marker.value)} y2={barY + 42} stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
          <text x={marker.x} y={barY + 54} textAnchor={marker.anchor} fontSize="11.5" fontWeight="700" fill="currentColor">
            {spec.marker.label}
          </text>
        </>
      )}
      {spec.segments.map((seg, i) => {
        const x = X0 + (i % cols) * 340;
        const y = rowY[Math.floor(i / cols)];
        return (
          <g key={seg.label + 'l'}>
            <rect x={x} y={y - 9} width="12" height="12" rx="3" style={{ fill: seg.muted ? 'var(--stone-300)' : STACK_FILLS[i % STACK_FILLS.length] }} />
            <Lines x={x + 18} y={y + 1} lines={legend[i]} />
          </g>
        );
      })}
    </Svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Flow                                                                    */
/* ---------------------------------------------------------------------- */

type FlowSpec = Extract<FigureSpec, { type: 'flow' }>;

function Box({ x, y, w, h, text, tone, maxLines = 3 }: { x: number; y: number; w: number; h: number; text: string; tone?: 'start' | 'yes' | 'no' | 'then'; maxLines?: number }) {
  const lines = wrapText(text, Math.floor(w / 6.4), maxLines);
  const fill = tone === 'yes' ? 'var(--chart-3)' : tone === 'start' ? 'var(--stone-100)' : 'var(--stone-50)';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" style={{ fill }} stroke="currentColor" strokeWidth="1.5" />
      {lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={y + h / 2 + (i - (lines.length - 1) / 2) * 14 + 4} textAnchor="middle" fontSize="11.5" fill="currentColor">
          {l}
        </text>
      ))}
    </g>
  );
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="fl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill="currentColor" />
      </marker>
    </defs>
  );
}

function Flow({ spec }: { spec: FlowSpec }) {
  const hasThen = Boolean(spec.yesThen || spec.noThen);
  const W = WIDE;
  const H = 230;
  const qx = 300;
  const qy = 115;
  const outX = hasThen ? 420 : 500;
  const outW = hasThen ? 150 : 200;
  const qLines = wrapText(spec.question, 20);
  return (
    <Svg W={W} H={H} aria={spec.aria}>
      <ArrowDefs />
      <Box x={20} y={85} w={150} h={60} text={spec.start} tone="start" />
      <line x1="170" y1="115" x2="222" y2="115" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
      <polygon points={`${qx},${qy - 52} ${qx + 78},${qy} ${qx},${qy + 52} ${qx - 78},${qy}`} style={{ fill: 'var(--stone-100)' }} stroke="currentColor" strokeWidth="1.5" />
      {qLines.map((l, i) => (
        <text key={i} x={qx} y={qy + (i - (qLines.length - 1) / 2) * 14 + 4} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="currentColor">
          {l}
        </text>
      ))}
      <path d={`M${qx + 78} ${qy} H${outX - 30} V40 H${outX - 4}`} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
      <text x={outX - 36} y="52" textAnchor="end" fontSize="11" fontWeight="700" style={{ fill: 'var(--chart-2)' }}>
        Yes
      </text>
      <path d={`M${qx + 78} ${qy} H${outX - 30} V190 H${outX - 4}`} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
      <text x={outX - 36} y="186" textAnchor="end" fontSize="11" fontWeight="700" fill="currentColor" opacity=".8">
        No
      </text>
      <Box x={outX} y={12} w={outW} h={56} text={spec.yes} tone="yes" />
      <Box x={outX} y={162} w={outW} h={56} text={spec.no} tone="no" />
      {spec.yesThen && (
        <>
          <line x1={outX + outW} y1="40" x2={outX + outW + 26} y2="40" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
          <Box x={outX + outW + 30} y={12} w={W - (outX + outW + 50)} h={56} text={spec.yesThen} tone="then" />
        </>
      )}
      {spec.noThen && (
        <>
          <line x1={outX + outW} y1="190" x2={outX + outW + 26} y2="190" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
          <Box x={outX + outW + 30} y={162} w={W - (outX + outW + 50)} h={56} text={spec.noThen} tone="then" />
        </>
      )}
    </Svg>
  );
}

/** Phones: the same decision drawn top to bottom, with Yes and No as two columns. */
function FlowNarrow({ spec, W }: { spec: FlowSpec; W: number }) {
  const pad = 4;
  const gap = 10;
  const colW = (W - pad * 2 - gap) / 2;
  const boxH = (text: string, w: number) => wrapText(text, Math.floor(w / 6.4), 5).length * 14 + 18;
  const startH = boxH(spec.start, W - pad * 2);
  const hw = Math.min(130, (W - pad * 2) / 2);
  const hh = 50;
  const qLines = wrapText(spec.question, charsFor(hw * 1.15, 11.5), 4);
  const qy = startH + 22 + hh;
  const splitY = qy + hh + 14;
  const branchY = splitY + 26;
  const branchH = Math.max(boxH(spec.yes, colW), boxH(spec.no, colW));
  const thenY = branchY + branchH + 24;
  const thenH = Math.max(spec.yesThen ? boxH(spec.yesThen, colW) : 0, spec.noThen ? boxH(spec.noThen, colW) : 0);
  const H = (thenH ? thenY + thenH : branchY + branchH) + 4;
  const cx = W / 2;
  const leftX = pad + colW / 2;
  const rightX = pad + colW + gap + colW / 2;
  return (
    <Svg W={W} H={H} aria={spec.aria}>
      <ArrowDefs />
      <Box x={pad} y={0} w={W - pad * 2} h={startH} text={spec.start} tone="start" maxLines={5} />
      <line x1={cx} y1={startH} x2={cx} y2={qy - hh - 3} stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
      <polygon points={`${cx},${qy - hh} ${cx + hw},${qy} ${cx},${qy + hh} ${cx - hw},${qy}`} style={{ fill: 'var(--stone-100)' }} stroke="currentColor" strokeWidth="1.5" />
      <Lines x={cx} y={qy - ((qLines.length - 1) / 2) * 14 + 4} lines={qLines} anchor="middle" fontWeight="600" />
      <path d={`M${cx} ${qy + hh} V${splitY} H${leftX} V${branchY - 3}`} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
      <path d={`M${cx} ${splitY} H${rightX} V${branchY - 3}`} fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
      <text x={leftX + 6} y={splitY + 16} fontSize="11" fontWeight="700" style={{ fill: 'var(--chart-2)' }}>
        Yes
      </text>
      <text x={rightX + 6} y={splitY + 16} fontSize="11" fontWeight="700" fill="currentColor" opacity=".8">
        No
      </text>
      <Box x={pad} y={branchY} w={colW} h={branchH} text={spec.yes} tone="yes" maxLines={5} />
      <Box x={pad + colW + gap} y={branchY} w={colW} h={branchH} text={spec.no} tone="no" maxLines={5} />
      {spec.yesThen && (
        <>
          <line x1={leftX} y1={branchY + branchH} x2={leftX} y2={thenY - 3} stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
          <Box x={pad} y={thenY} w={colW} h={thenH} text={spec.yesThen} tone="then" maxLines={5} />
        </>
      )}
      {spec.noThen && (
        <>
          <line x1={rightX} y1={branchY + branchH} x2={rightX} y2={thenY - 3} stroke="currentColor" strokeWidth="1.5" markerEnd="url(#fl-arrow)" />
          <Box x={pad + colW + gap} y={thenY} w={colW} h={thenH} text={spec.noThen} tone="then" maxLines={5} />
        </>
      )}
    </Svg>
  );
}

/* ---------------------------------------------------------------------- */
/* Compare                                                                 */
/* ---------------------------------------------------------------------- */

function Dots({ n }: { n: 0 | 1 | 2 | 3 }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${n} of 3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < n ? 'bg-sage-500' : 'bg-stone-300'}`} />
      ))}
    </span>
  );
}

function Compare({ spec }: { spec: Extract<FigureSpec, { type: 'compare' }> }) {
  return (
    <div role="img" aria-label={spec.aria}>
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-wider text-ink-faint">
            <th className="py-2 pr-3 font-medium">More of…</th>
            <th className="py-2 pr-3 font-semibold text-ink">{spec.options[0]}</th>
            <th className="py-2 font-semibold text-ink">{spec.options[1]}</th>
          </tr>
        </thead>
        <tbody>
          {spec.rows.map((r) => (
            <tr key={r.label} className="border-t border-stone-200">
              <td className="py-2.5 pr-3 text-ink">
                {r.label}
                {r.note && <span className="block text-[12px] text-ink-faint">{r.note}</span>}
              </td>
              <td className="py-2.5 pr-3">
                <Dots n={r.a} />
              </td>
              <td className="py-2.5">
                <Dots n={r.b} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A figure with its caption; the caption states the claim the picture makes. */
export function Figure({ spec, className = '' }: { spec: FigureSpec; className?: string }) {
  const [ref, measured] = useContainerWidth(WIDE);
  const narrow = measured < NARROW_BELOW;
  const W = narrow ? measured : WIDE;
  return (
    <figure className={`m-0 rounded-lg border border-stone-200 bg-stone-50 px-4 pb-3 pt-4 ${className}`}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className={spec.type === 'compare' ? '' : '[&>svg]:block [&>svg]:h-auto [&>svg]:w-full'}>
        {spec.type === 'timeline' && (narrow ? <TimelineNarrow spec={spec} W={W} /> : <Timeline spec={spec} />)}
        {spec.type === 'band' && (narrow ? <BandNarrow spec={spec} W={W} /> : <Band spec={spec} />)}
        {spec.type === 'gauge' && <Gauge spec={spec} W={W} narrow={narrow} />}
        {spec.type === 'stack' && <Stack spec={spec} W={W} narrow={narrow} />}
        {spec.type === 'flow' && (narrow ? <FlowNarrow spec={spec} W={W} /> : <Flow spec={spec} />)}
        {spec.type === 'compare' && <Compare spec={spec} />}
      </div>
      <figcaption className="mt-2 text-[12.5px] leading-5 text-ink-faint">{spec.caption}</figcaption>
    </figure>
  );
}
