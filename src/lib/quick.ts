import type { QuickAnswers, QuickNext } from '@/data/types';
import { sgd as fmtSgd } from './format';

/** Number from an answer; blank, invalid or negative → 0. */
export function num(v: string | number | undefined): number {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : 0;
  if (!v) return 0;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function str(v: string | number | undefined, fallback = ''): string {
  return v === undefined || v === null ? fallback : String(v);
}

/** "S$1,200": the app's formatter prefixed for prose, so quick-check text reads consistently. */
export function sgd(n: number | null | undefined): string {
  return fmtSgd(n).replace(/^(-?)\$/, '$1S$');
}

/** "S$620k" / "S$1.07m" for compact labels. */
export function sgdK(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1e6) return `S$${(n / 1e6).toFixed(2).replace(/\.?0+$/, '')}m`;
  if (Math.abs(n) >= 1e3) return `S$${Math.round(n / 1000)}k`;
  return fmtSgd(n);
}

/** Monthly payment for a loan (monthly rate i, n payments). */
export function pmt(principal: number, i: number, n: number): number {
  if (principal <= 0 || n <= 0) return 0;
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

/** Loan size a monthly payment supports. */
export function loanFor(payment: number, i: number, n: number): number {
  if (payment <= 0 || n <= 0) return 0;
  if (i === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + i, -n))) / i;
}

export function round(n: number, to = 1): number {
  return Math.round(n / to) * to;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export const tool = (id: string, note?: string, prefill?: Record<string, number>): QuickNext => ({ kind: 'tool', id, note, prefill });
export const guide = (id: string, note?: string): QuickNext => ({ kind: 'guide', id, note });
export const official = (id: string, note?: string): QuickNext => ({ kind: 'official', id, note });

export function answersWithDefaults(fields: { id: string; type: string; default?: string | number }[], answers: QuickAnswers): QuickAnswers {
  const out: QuickAnswers = { ...answers };
  for (const f of fields) if (out[f.id] === undefined && f.default !== undefined) out[f.id] = f.default;
  return out;
}
