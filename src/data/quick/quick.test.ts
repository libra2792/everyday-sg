import { describe, expect, it } from 'vitest';
import { GUIDES } from '../guides';
import { CALCULATOR_MAP } from '../calculators';
import { GUIDE_MAP } from '../guides';
import { SOURCE_MAP } from '../sources';
import { BENCHMARKS } from '../benchmarks';
import { GUIDE_EXTRAS } from './index';
import { answersWithDefaults } from '@/lib/quick';

const FIGURE_TYPES = ['timeline', 'gauge', 'band', 'stack', 'flow', 'compare'];

describe('quick checks', () => {
  it('every guide has a quick check and a figure', () => {
    for (const g of GUIDES) {
      const x = GUIDE_EXTRAS[g.id];
      expect(x, g.id).toBeTruthy();
      expect(x.quick.fields.length, g.id).toBeGreaterThan(1);
      expect(x.quick.intro.length, g.id).toBeGreaterThan(20);
      expect(FIGURE_TYPES, g.id).toContain(x.figure.type);
      for (const f of x.quick.fields) {
        if (f.type === 'choice') expect(f.options.some((o) => o.value === f.default), `${g.id}:${f.id}`).toBe(true);
        if ((f.type === 'money' || f.type === 'number') && f.benchmark) expect(BENCHMARKS, `${g.id}:${f.id}`).toHaveProperty(f.benchmark);
      }
    }
    expect(Object.keys(GUIDE_EXTRAS).every((id) => GUIDE_MAP[id])).toBe(true);
  });

  it('evaluates with defaults and with blanks, and only points to things that exist', () => {
    for (const g of GUIDES) {
      const x = GUIDE_EXTRAS[g.id];
      for (const answers of [answersWithDefaults(x.quick.fields, {}), answersWithDefaults(x.quick.fields.filter((f) => f.type === 'choice'), {})]) {
        const r = x.quick.evaluate(answers);
        expect(r.verdict.length, g.id).toBeGreaterThan(3);
        expect(r.why.length, g.id).toBeGreaterThan(0);
        expect(r.next.length, g.id).toBeGreaterThan(0);
        expect(r.fine.length, g.id).toBeGreaterThan(10);
        for (const n of r.next) {
          if (n.kind === 'tool') expect(CALCULATOR_MAP[n.id], `${g.id} → tool ${n.id}`).toBeTruthy();
          if (n.kind === 'guide') expect(GUIDE_MAP[n.id], `${g.id} → guide ${n.id}`).toBeTruthy();
          if (n.kind === 'official') expect(SOURCE_MAP[n.id], `${g.id} → source ${n.id}`).toBeTruthy();
          if (n.prefill) for (const v of Object.values(n.prefill)) expect(Number.isFinite(v), `${g.id} prefill`).toBe(true);
        }
        if (r.figure) expect(FIGURE_TYPES).toContain(r.figure.type);
      }
    }
  });

  it('turns numbers into pointers: affordability, emergency fund, debt payoff', () => {
    const afford = GUIDE_EXTRAS['home-affordability-and-loans'].quick.evaluate({ income: 9000, cash: 60000, cpf: 90000, loan: 'hdb', share: '30' });
    expect(afford.verdict).toMatch(/S\$600k/);
    expect(afford.next[0].prefill?.price).toBe(600000);
    const fund = GUIDE_EXTRAS['emergency-fund'].quick.evaluate({ ess: 3000, income: 'variable', earners: 'one', deps: 'yes', have: 6000, monthly: 500 });
    expect(fund.verdict).toBe('Aim for S$21,000');
    expect(fund.figure?.type).toBe('gauge');
    const debt = GUIDE_EXTRAS['pay-down-debt'].quick.evaluate({ balance: 5000, rate: 26, min: 150, extra: 100 });
    expect(debt.verdict).toMatch(/Clear in about \d+ months/);
    const stuck = GUIDE_EXTRAS['pay-down-debt'].quick.evaluate({ balance: 5000, rate: 26, min: 50, extra: 0 });
    expect(stuck.verdict).toBe('Payments too small to clear it');
    const bto = GUIDE_EXTRAS['hdb-bto-vs-resale'].quick.evaluate({ move: 'soon', priority: 'see', buyer: 'couple', hfe: 'no' });
    expect(bto.verdict).toBe('Lean resale');
    expect(bto.next[0].kind).toBe('official');
  });
});
