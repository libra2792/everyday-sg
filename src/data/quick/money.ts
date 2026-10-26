import type { GuideExtras } from '../types';
import { guide, num, plural, sgd, tool } from '@/lib/quick';

const FINE_PLAN = 'A planning pointer from your own numbers, not advice. Adjust it to your commitments and risk.';

/** Months to clear a balance at a monthly payment, with monthly interest; null if it never clears. */
function payoff(balance: number, aprPct: number, payment: number): { months: number; interest: number } | null {
  if (balance <= 0) return { months: 0, interest: 0 };
  const i = aprPct / 100 / 12;
  if (payment <= balance * i) return null;
  let b = balance;
  let months = 0;
  let interest = 0;
  while (b > 0 && months < 600) {
    const int = b * i;
    interest += int;
    b = b + int - payment;
    months += 1;
  }
  return b > 0 ? null : { months, interest };
}

export const MONEY_EXTRAS: Record<string, GuideExtras> = {
  'build-a-budget': {
    quick: {
      intro: 'Four monthly numbers show how your money splits today against the 50 / 30 / 20 rule of thumb.',
      fields: [
        { id: 'income', label: 'Take-home income', type: 'money', benchmark: 'medianFullTimeIncome' },
        { id: 'ess', label: 'Essentials (housing, food, transport, insurance, minimum debt payments)', type: 'money', benchmark: 'essentialSpending' },
        { id: 'life', label: 'Lifestyle (eating out, subscriptions, shopping, travel)', type: 'money' },
        { id: 'save', label: 'Saved or invested each month', type: 'money' },
      ],
      evaluate: (a) => {
        const income = num(a.income);
        const ess = num(a.ess);
        const life = num(a.life);
        const save = num(a.save);
        const spent = ess + life + save;
        const left = income - spent;
        const pct = (v: number) => (income > 0 ? Math.round((v / income) * 100) : 0);
        const why: string[] = [];
        if (income === 0) why.push('Enter your take-home income to see the split.');
        else {
          why.push(`Essentials ${pct(ess)}%, lifestyle ${pct(life)}%, saving ${pct(save)}%${left !== 0 ? `, ${left > 0 ? 'unallocated' : 'overspent'} ${sgd(Math.abs(left))}` : ''}. The rule of thumb is 50 / 30 / 20.`);
          if (pct(ess) > 60) why.push('Essentials above 60% leave little room; the housing and transport lines are usually the only ones that move.');
          if (pct(save) < 20 && left > 0) why.push(`You have ${sgd(left)} unassigned each month. Giving it a name (savings, a goal) is the easiest win.`);
          if (left < 0) why.push('Spending exceeds income. Start with the lifestyle line; it moves fastest.');
          if (pct(save) >= 20) why.push('Saving a fifth or more of take-home pay is on the common target.');
        }
        return {
          label: 'Pointer',
          verdict: income === 0 ? 'Waiting for your numbers' : left < 0 ? `Over by ${sgd(-left)} a month` : `Saving ${pct(save + Math.max(0, left))}% of take-home`,
          stats: income > 0 ? [{ label: 'Essentials', value: `${pct(ess)}%` }, { label: 'Lifestyle', value: `${pct(life)}%` }] : undefined,
          why,
          next: [tool('budget', 'Opens with your income and savings target; add categories there.', { income, savings: save }), guide('emergency-fund', 'The first thing the savings line should fund.')],
          fine: FINE_PLAN,
          figure:
            income > 0
              ? {
                  type: 'stack',
                  title: `Where ${sgd(income)} goes each month`,
                  unit: 'sgd',
                  segments: [
                    { label: 'Essentials', value: ess },
                    { label: 'Lifestyle', value: life },
                    { label: 'Saved', value: save },
                    { label: left > 0 ? 'Unallocated' : 'Overspent', value: Math.abs(left), muted: true },
                  ],
                  marker: { value: income * 0.5, label: '50% essentials line' },
                  caption: 'Your split against the 50 / 30 / 20 guide. The dashed line is where essentials would sit at half of income.',
                  aria: `Stacked bar of monthly income: essentials ${sgd(ess)}, lifestyle ${sgd(life)}, saved ${sgd(save)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'A 50 / 30 / 20 split of the median take-home pay (about S$3,950)',
      unit: 'sgd',
      segments: [
        { label: 'Essentials (50%)', value: 1975 },
        { label: 'Lifestyle (30%)', value: 1185 },
        { label: 'Saving (20%)', value: 790 },
      ],
      caption: 'The rule of thumb on the median full-time take-home pay (MOM 2025, after CPF). Enter your own numbers above to see your split.',
      aria: 'Stacked bar showing a 50/30/20 split of S$3,950.',
    },
  },

  'emergency-fund': {
    quick: {
      intro: 'Your target in months depends on how steady the income is and who depends on it. Enter what you can; the gauge updates as you go.',
      fields: [
        { id: 'ess', label: 'Essential monthly expenses', type: 'money', benchmark: 'essentialSpending' },
        { id: 'income', label: 'Your income is', type: 'choice', options: [{ value: 'stable', label: 'Stable salary' }, { value: 'variable', label: 'Variable or commission-based' }], default: 'stable' },
        { id: 'earners', label: 'Earners in the household', type: 'choice', options: [{ value: 'two', label: 'Two or more' }, { value: 'one', label: 'Just me' }], default: 'two' },
        { id: 'deps', label: 'Anyone depending on you?', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Children or parents' }], default: 'no' },
        { id: 'have', label: 'Set aside so far', type: 'money' },
        { id: 'monthly', label: 'You can add each month', type: 'money' },
      ],
      evaluate: (a) => {
        const ess = num(a.ess);
        const have = num(a.have);
        const monthly = num(a.monthly);
        const months = 3 + (a.income === 'variable' ? 2 : 0) + (a.earners === 'one' ? 1 : 0) + (a.deps === 'yes' ? 1 : 0);
        const target = months * ess;
        const gap = Math.max(0, target - have);
        const cover = ess > 0 ? have / ess : 0;
        const t = monthly > 0 ? Math.ceil(gap / monthly) : null;
        const why = [
          `Target: ${months} months of essentials${months === 3 ? ', the floor for a steady two-income household.' : ` (3 as a base${a.income === 'variable' ? ', +2 for variable income' : ''}${a.earners === 'one' ? ', +1 as the only earner' : ''}${a.deps === 'yes' ? ', +1 for dependants' : ''}).`}`,
        ];
        if (ess === 0) why.push('Enter your essential monthly expenses to turn that into a dollar figure.');
        else {
          why.push(`That is ${sgd(target)}. You have ${cover.toFixed(1)} months covered${gap === 0 ? '; the fund is full.' : `, ${sgd(gap)} to go.`}`);
          if (gap > 0) why.push(monthly > 0 ? `At ${sgd(monthly)} a month you reach it in about ${plural(t ?? 0, 'month')}.` : 'Enter a monthly amount to see how long it takes.');
        }
        return {
          label: 'Target',
          verdict: ess === 0 ? `${months} months is your target` : gap === 0 ? `Fund is full: ${months} months` : `Aim for ${sgd(target)}`,
          stats: ess > 0 ? [{ label: 'Target fund', value: sgd(target) }, { label: 'Covered so far', value: `${cover.toFixed(1)} mo` }] : undefined,
          why,
          next: [
            tool('emergency-debt', ess > 0 ? `Opens with ${sgd(ess)}, ${months} months and your savings filled in.` : 'Plan the target and timeline in full.', { ess: ess || 3500, months, savings: have, monthly: monthly || 600 }),
            guide('build-a-budget', 'Find the essentials figure if you are unsure.'),
          ],
          fine: FINE_PLAN,
          figure: {
            type: 'gauge',
            blocks: months,
            filled: cover,
            title: 'Months of cover',
            right: `target ${months} months${target > 0 ? ` · ${sgd(target)}` : ''}`,
            foot: cover > 0 ? `you: ${cover.toFixed(1)} months (${sgd(have)})` : 'enter your essentials and savings to fill the gauge',
            caption: 'Each block is one month of essential expenses. The target grows with variable income, a single earner and dependants; the filled part is what you already have.',
            aria: `Months of cover: ${cover.toFixed(1)} of a ${months}-month target.`,
          },
        };
      },
    },
    figure: {
      type: 'gauge',
      blocks: 6,
      filled: 0,
      title: 'Months of cover',
      right: 'target 3 to 6 months',
      foot: 'enter your essentials and savings above to fill the gauge',
      caption: 'Each block is one month of essential expenses.',
      aria: 'Empty six-block gauge of months of cover.',
    },
  },

  'pay-down-debt': {
    quick: {
      intro: 'One card or loan at a time: enter its balance, rate and minimum payment, then see what an extra amount does.',
      fields: [
        { id: 'balance', label: 'Balance outstanding', type: 'money' },
        { id: 'rate', label: 'Interest rate', type: 'number', suffix: '% p.a.', default: 26, benchmark: 'cardInterest' },
        { id: 'min', label: 'Minimum monthly payment', type: 'money', help: 'From the statement; cards often set 3% of the balance or S$50, whichever is higher.' },
        { id: 'extra', label: 'Extra you could pay each month', type: 'money' },
      ],
      evaluate: (a) => {
        const balance = num(a.balance);
        const rate = num(a.rate);
        const min = num(a.min);
        const extra = num(a.extra);
        const base = payoff(balance, rate, min);
        const boosted = payoff(balance, rate, min + extra);
        const why: string[] = [];
        if (balance === 0 || min === 0) why.push('Enter the balance and the minimum payment from your statement.');
        else if (!base) why.push(`${sgd(min)} a month does not even cover the interest at ${rate}% p.a.; the balance would grow. A larger payment or a lower-rate balance transfer is urgent.`);
        else {
          why.push(`Minimum payments only: about ${plural(base.months, 'month')} and ${sgd(base.interest)} in interest.`);
          if (extra > 0 && boosted) why.push(`With ${sgd(extra)} extra a month: ${plural(boosted.months, 'month')} and ${sgd(boosted.interest)} in interest, saving ${sgd(base.interest - boosted.interest)}.`);
          else why.push('Add an extra amount to see how much faster it clears; the first S$100 makes the biggest difference.');
          if (rate >= 15) why.push('At card rates, every dollar of extra repayment earns the card’s rate risk-free. Clear this before investing.');
        }
        const monthsMax = Math.max(base?.months ?? 0, boosted?.months ?? 0, 1);
        return {
          label: 'Pointer',
          verdict: balance === 0 || min === 0 ? 'Waiting for your numbers' : !base ? 'Payments too small to clear it' : boosted && extra > 0 ? `Clear in about ${plural(boosted.months, 'month')}` : `About ${plural(base.months, 'month')} on minimums`,
          stats: base ? [{ label: 'Interest on minimums', value: sgd(base.interest) }, { label: 'Interest with extra', value: boosted && extra > 0 ? sgd(boosted.interest) : '—' }] : undefined,
          why,
          next: [
            tool('emergency-debt', balance > 0 ? 'Opens with this debt added; add the others to see the payoff order.' : 'Add each card and loan to see the payoff order.', balance > 0 ? { debt_balance: balance, debt_rate: rate, debt_min: min, extra } : undefined),
            guide('emergency-fund', 'A small buffer stops the card refilling.'),
          ],
          fine: 'Assumes a fixed rate and no new spending on the card. Your statement’s figures and fees take precedence.',
          figure: base
            ? {
                type: 'band',
                max: Math.ceil(monthsMax / 6) * 6,
                unit: 'months',
                bars: [
                  { label: 'Minimum payments only', value: base.months },
                  { label: extra > 0 ? `With ${sgd(extra)} extra a month` : 'With an extra amount (enter one)', value: boosted && extra > 0 ? boosted.months : 0, strong: true },
                ],
                caption: `Months to clear ${sgd(balance)} at ${rate}% p.a. The shorter bar is the extra payment at work.`,
                aria: `Months to clear the debt: ${base.months} on minimums${boosted && extra > 0 ? `, ${boosted.months} with the extra payment` : ''}.`,
              }
            : undefined,
        };
      },
    },
    figure: {
      type: 'band',
      max: 60,
      unit: 'months',
      bars: [
        { label: 'S$5,000 at 26% p.a., S$150 a month', value: 51 },
        { label: 'Same card, S$250 a month', value: 25, strong: true },
      ],
      caption: 'An illustration: adding S$100 a month halves the time to clear a S$5,000 card balance. Enter your own figures above.',
      aria: 'Illustrative months to clear a card balance at two payment levels.',
    },
  },

  'subscriptions-and-bills': {
    quick: {
      intro: 'Count what you pay for every month and how many of those you actually used in the last 30 days.',
      fields: [
        { id: 'total', label: 'All subscriptions and memberships, per month', type: 'money', help: 'Streaming, gym, apps, cloud storage, delivery passes, insurance riders you forgot about.' },
        { id: 'count', label: 'How many of them', type: 'number', suffix: 'items', default: 6, min: 1, max: 60 },
        { id: 'unused', label: 'How many you did not use last month', type: 'number', suffix: 'items', default: 1, min: 0, max: 60 },
      ],
      evaluate: (a) => {
        const total = num(a.total);
        const count = Math.max(1, Math.round(num(a.count)));
        const unused = Math.min(count, Math.round(num(a.unused)));
        const each = total / count;
        const waste = each * unused;
        const yearly = waste * 12;
        const why: string[] = [];
        if (total === 0) why.push('Enter the monthly total; your bank or card statement lists the recurring ones.');
        else {
          why.push(`About ${sgd(each)} per subscription. ${unused > 0 ? `${plural(unused, 'unused item')} cost roughly ${sgd(waste)} a month, ${sgd(yearly)} a year.` : 'Everything was used last month; check again in three months.'}`);
          why.push(`All of them together are ${sgd(total * 12)} a year. Annual plans and family bundles usually cut 15 to 30% on the ones you keep.`);
        }
        return {
          label: 'Pointer',
          verdict: total === 0 ? 'Waiting for your numbers' : unused > 0 ? `${sgd(yearly)} a year on unused ones` : `${sgd(total * 12)} a year, all in use`,
          stats: total > 0 ? [{ label: 'Per month', value: sgd(total) }, { label: 'Per year', value: sgd(total * 12) }] : undefined,
          why,
          next: [tool('budget', 'Put the kept subscriptions in your budget as a lifestyle line.'), guide('document-renewals', 'Contracts and insurance that auto-renew belong on the same list.')],
          fine: 'Based on an even split of the total across your subscriptions; your statement has the exact amounts.',
          figure:
            total > 0
              ? {
                  type: 'stack',
                  title: 'A year of subscriptions',
                  unit: 'sgd',
                  segments: [
                    { label: 'Used', value: (total - waste) * 12 },
                    { label: 'Unused last month', value: yearly, muted: true },
                  ],
                  caption: 'The grey part is what the unused subscriptions cost over a year if nothing changes.',
                  aria: `Yearly subscriptions: ${sgd((total - waste) * 12)} used, ${sgd(yearly)} unused.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'A year of subscriptions (illustration: S$120 a month, one of six unused)',
      unit: 'sgd',
      segments: [
        { label: 'Used', value: 1200 },
        { label: 'Unused', value: 240, muted: true },
      ],
      caption: 'Enter your own total and count above to see your year.',
      aria: 'Illustrative yearly subscriptions split into used and unused.',
    },
  },
};

