/**
 * Locale-aware formatting helpers. Everything is Singapore-dollar and en-SG by default.
 */

const sgdFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const sgdCentsFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-SG', { maximumFractionDigits: 0 });

/** From S$10 million, amounts are abbreviated ("$12.3m", "$25.0b") so results stay readable. */
const ABBREVIATE_FROM = 10_000_000;

/** Format a number as S$ with no cents. Non-finite values render as an em dash. */
export function sgd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  // Avoid "-$0" artefacts
  const rounded = Math.round(value);
  const abs = Math.abs(rounded);
  if (abs >= ABBREVIATE_FROM) {
    const [div, unit] = abs >= 1e12 ? [1e12, 't'] : abs >= 1e9 ? [1e9, 'b'] : [1e6, 'm'];
    return `${rounded < 0 ? '-' : ''}$${(abs / div).toFixed(1)}${unit}`;
  }
  return sgdFormatter.format(rounded === 0 ? 0 : rounded);
}

/** Format as S$ with cents, for small per-unit amounts such as cost per km. */
export function sgdCents(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return sgdCentsFormatter.format(value);
}

/** Plain number with thousands separators. */
export function num(value: number | null | undefined, maxFractionDigits = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (maxFractionDigits === 0) return numberFormatter.format(Math.round(value));
  return new Intl.NumberFormat('en-SG', { maximumFractionDigits: maxFractionDigits }).format(value);
}

/** Percentage from a fraction (0.25 → "25%"). Beyond ±9,999% the exact figure means nothing. */
export function pct(fraction: number | null | undefined, digits = 0): string {
  if (fraction === null || fraction === undefined || !Number.isFinite(fraction)) return '—';
  if (Math.abs(fraction) >= 100) return `${fraction < 0 ? '−' : ''}over 9,999%`;
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Percentage from a percentage number (4.5 → "4.5%"). */
export function pctValue(percentage: number | null | undefined, digits = 1): string {
  if (percentage === null || percentage === undefined || !Number.isFinite(percentage)) return '—';
  return `${percentage.toFixed(digits)}%`;
}

/** Months → "2 years 3 months" style text. */
export function months(total: number | null | undefined): string {
  if (total === null || total === undefined || !Number.isFinite(total)) return '—';
  if (total <= 0) return 'Already there';
  const whole = Math.ceil(total);
  const y = Math.floor(whole / 12);
  const m = whole % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} ${y === 1 ? 'year' : 'years'}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? 'month' : 'months'}`);
  return parts.join(' ');
}

/** Clamp a number into [min, max], treating NaN as min. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Parse user text into a non-negative finite number; empty or invalid → 0. */
export function toNumber(input: string | number | null | undefined): number {
  if (typeof input === 'number') return Number.isFinite(input) ? input : 0;
  if (!input) return 0;
  const cleaned = String(input).replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** "15 Dec": day and month only, for short confirmations and snapshot titles. */
export function formatDayMonth(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}
