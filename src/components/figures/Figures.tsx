import type { FigureSpec } from '@/data/types';
import { sgd } from '@/lib/format';
import { sgdK } from '@/lib/quick';

/**
 * Data-driven diagrams for guide pages. Every drawing is inline SVG in the page's own
 * colours: strokes and text use currentColor, fills use the theme variables, and the one
 * element that carries the point (a wait, a binding limit, a chosen branch) uses --chart-1.
 */

function unitLabel(v: number, unit: 'sgd' | 'months' | 'pct' | 'number'): string {
  if (unit === 'sgd') return v >= 10000 ? sgdK(v) : sgd(v);
  if (unit === 'months') return `${Math.round(v * 10) / 10} mo`;
  if (unit === 'pct') return `${Math.round(v)}%`;
  return String(Math.round(v));
}

function Timeline({ spec }: { spec: Extract<FigureSpec, { type: 'timeline' }> }) {
  const laneGap = 110;
  const top = 70;
  const height = top + laneGap * (spec.lanes.length - 1) + 60;
  const maxNodes = Math.max(...spec.lanes.map((l) => l.nodes.length));
  const x0 = 120;
  const x1 = 700;
  const step = maxNodes > 1 ? (x1 - x0) / (maxNodes - 1) : 0;
  return (
    <svg viewBox={`0 0 760 ${height}`} role="img" aria-label={spec.aria} style={{ minWidth: 560 }}>
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
    </svg>
  );
}

function Band({ spec }: { spec: Extract<FigureSpec, { type: 'band' }> }) {
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
    <svg viewBox={`0 0 760 ${height}`} role="img" aria-label={spec.aria} style={{ minWidth: 560 }}>
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
    </svg>
  );
}

function Gauge({ spec }: { spec: Extract<FigureSpec, { type: 'gauge' }> }) {
  const X0 = 40;
  const X1 = 720;
  const n = Math.max(1, Math.round(spec.blocks));
  const gap = 6;
  const w = (X1 - X0 - gap * (n - 1)) / n;
  return (
    <svg viewBox="0 0 760 120" role="img" aria-label={spec.aria} style={{ minWidth: 560 }}>
      <text x={X0} y="22" fontSize="12" fontWeight="600" fill="currentColor">
        {spec.title}
      </text>
      {spec.right && (
        <text x={X1} y="22" textAnchor="end" fontSize="12" fill="currentColor">
          {spec.right}
        </text>
      )}
      {Array.from({ length: n }, (_, k) => {
        const x = X0 + k * (w + gap);
        const fill = Math.max(0, Math.min(1, spec.filled - k));
        return (
          <g key={k}>
            <rect x={x} y="36" width={w} height="34" rx="6" style={{ fill: 'var(--stone-200)' }} />
            {fill > 0 && <rect x={x} y="36" width={w * fill} height="34" rx="6" style={{ fill: 'var(--chart-1)' }} />}
            <text x={x + w / 2} y="92" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".8">
              {k + 1}
            </text>
          </g>
        );
      })}
      {spec.foot && (
        <text x={X0} y="112" fontSize="11.5" fill="currentColor">
          {spec.foot}
        </text>
      )}
    </svg>
  );
}

const STACK_FILLS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--stone-300)'];

function Stack({ spec }: { spec: Extract<FigureSpec, { type: 'stack' }> }) {
  const X0 = 40;
  const X1 = 720;
  const total = spec.segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  const scaleMax = Math.max(total, spec.marker?.value ?? 0, 1);
  const sx = (v: number) => X0 + (v / scaleMax) * (X1 - X0);
  let acc = 0;
  const rows = spec.segments.length;
  const legendY = 96;
  const height = legendY + Math.ceil(rows / 2) * 20 + 8;
  return (
    <svg viewBox={`0 0 760 ${height}`} role="img" aria-label={spec.aria} style={{ minWidth: 560 }}>
      <text x={X0} y="22" fontSize="12" fontWeight="600" fill="currentColor">
        {spec.title}
      </text>
      <text x={X1} y="22" textAnchor="end" fontSize="12" fill="currentColor">
        {total > 0 ? `total ${unitLabel(total, spec.unit)}` : ''}
      </text>
      <rect x={X0} y="36" width={X1 - X0} height="34" rx="6" style={{ fill: 'var(--stone-200)' }} />
      {spec.segments.map((seg, i) => {
        const v = Math.max(0, seg.value);
        const x = sx(acc);
        const w = sx(acc + v) - x;
        acc += v;
        return <rect key={seg.label} x={x} y="36" width={w} height="34" style={{ fill: seg.muted ? 'var(--stone-300)' : STACK_FILLS[i % STACK_FILLS.length] }} />;
      })}
      {spec.marker && spec.marker.value > 0 && (
        <>
          <line x1={sx(spec.marker.value)} y1="28" x2={sx(spec.marker.value)} y2="78" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
          <text x={sx(spec.marker.value)} y="90" textAnchor={spec.marker.value / scaleMax > 0.85 ? 'end' : 'middle'} fontSize="11.5" fontWeight="700" fill="currentColor">
            {spec.marker.label}
          </text>
        </>
      )}
      {spec.segments.map((seg, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = X0 + col * 340;
        const y = legendY + row * 20;
        return (
          <g key={seg.label + 'l'}>
            <rect x={x} y={y - 9} width="12" height="12" rx="3" style={{ fill: seg.muted ? 'var(--stone-300)' : STACK_FILLS[i % STACK_FILLS.length] }} />
            <text x={x + 18} y={y + 1} fontSize="11.5" fill="currentColor">
              {seg.label}
              {seg.value > 0 ? ` · ${unitLabel(seg.value, spec.unit)}` : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function wrapText(text: string, max: number): string[] {
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
  return lines.slice(0, 3);
}

function Box({ x, y, w, h, text, tone }: { x: number; y: number; w: number; h: number; text: string; tone?: 'start' | 'yes' | 'no' | 'then' }) {
  const lines = wrapText(text, Math.floor(w / 6.4));
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

function Flow({ spec }: { spec: Extract<FigureSpec, { type: 'flow' }> }) {
  const hasThen = Boolean(spec.yesThen || spec.noThen);
  const W = 760;
  const H = 230;
  const qx = 300;
  const qy = 115;
  const outX = hasThen ? 420 : 500;
  const outW = hasThen ? 150 : 200;
  const qLines = wrapText(spec.question, 20);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.aria} style={{ minWidth: 560 }}>
      <defs>
        <marker id="fl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="currentColor" />
        </marker>
      </defs>
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
    </svg>
  );
}

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
    <div role="img" aria-label={spec.aria} className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-[13.5px]">
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
  return (
    <figure className={`m-0 rounded-lg border border-stone-200 bg-stone-50 px-4 pb-3 pt-4 ${className}`}>
      <div className={spec.type === 'compare' ? '' : 'overflow-x-auto [&>svg]:block [&>svg]:h-auto [&>svg]:w-full'}>
        {spec.type === 'timeline' && <Timeline spec={spec} />}
        {spec.type === 'band' && <Band spec={spec} />}
        {spec.type === 'gauge' && <Gauge spec={spec} />}
        {spec.type === 'stack' && <Stack spec={spec} />}
        {spec.type === 'flow' && <Flow spec={spec} />}
        {spec.type === 'compare' && <Compare spec={spec} />}
      </div>
      <figcaption className="mt-2 text-[12.5px] leading-5 text-ink-faint">{spec.caption}</figcaption>
    </figure>
  );
}
