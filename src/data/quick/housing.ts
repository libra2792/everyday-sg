import type { GuideExtras } from '../types';
import { guide, loanFor, num, official, pmt, sgd, sgdK, tool } from '@/lib/quick';

export const HOUSING_EXTRAS: Record<string, GuideExtras> = {
  'hdb-bto-vs-resale': {
    quick: {
      intro: 'Four quick answers give a direction and the two things to do next. Not an eligibility decision; HDB makes that.',
      fields: [
        { id: 'move', label: 'When do you need to move in?', type: 'choice', options: [{ value: 'soon', label: 'Within a year' }, { value: 'mid', label: '1 to 3 years' }, { value: 'flex', label: '3+ years or flexible' }], default: 'mid' },
        { id: 'priority', label: 'What matters more?', type: 'choice', options: [{ value: 'price', label: 'Lower price, fresh 99-year lease' }, { value: 'location', label: 'A specific estate or location' }, { value: 'see', label: 'Seeing the actual flat first' }], default: 'price' },
        { id: 'buyer', label: 'Who are you buying with?', type: 'choice', options: [{ value: 'couple', label: 'Spouse or fiancé(e)' }, { value: 'single', label: 'On my own' }, { value: 'family', label: 'Parents or siblings' }], default: 'couple' },
        { id: 'hfe', label: 'Do you have a valid HFE letter?', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'Not yet' }], default: 'no' },
      ],
      evaluate: (a) => {
        let bto = 0;
        let resale = 0;
        const why: string[] = [];
        if (a.move === 'soon') {
          resale += 2;
          why.push('Moving within a year: a resale purchase completes about 8 weeks after HDB accepts it; a BTO flat takes years.');
        } else if (a.move === 'mid') {
          resale += 1;
          why.push('A 1 to 3 year horizon is tight for most BTO projects; some shorter-wait launches exist, so check each launch.');
        } else {
          bto += 2;
          why.push('A flexible timeline removes BTO’s main cost: the wait.');
        }
        if (a.priority === 'price') {
          bto += 2;
          why.push('BTO flats are priced below comparable resale flats and start a fresh 99-year lease.');
        } else if (a.priority === 'location') {
          resale += 1;
          why.push('Resale lets you choose any estate and block; BTO depends on what launches.');
        } else {
          resale += 2;
          why.push('Only resale lets you walk through the exact flat before committing.');
        }
        if (a.buyer === 'single') why.push('Buying alone: HDB sets age and flat-type conditions for BTO; resale has fewer restrictions. Check the current rules.');
        if (a.buyer === 'family') why.push('Buying with parents or siblings uses different HDB schemes; confirm which apply before comparing prices.');
        const diff = resale - bto;
        const verdict = diff >= 2 ? 'Lean resale' : diff <= -2 ? 'Lean BTO' : 'Keep both routes open';
        const next = [];
        if (a.hfe === 'no') next.push(official('hdb-hfe', 'Both routes need the HFE letter first; it states your grants and loan ceiling.'));
        next.push(tool('housing', verdict === 'Lean BTO' ? 'Start from a launch price, then test a resale price for comparison.' : 'Start from S$620,000, the middle of HDB’s 4-room medians in non-mature towns (3Q 2026).', { price: verdict === 'Lean BTO' ? 450000 : 620000 }));
        next.push(guide('home-affordability-and-loans', 'Set the ceiling before you ballot or view.'));
        return {
          label: 'Direction',
          verdict,
          stats: [{ label: 'Points for BTO', value: String(bto) }, { label: 'Points for resale', value: String(resale) }],
          why,
          next,
          fine: 'A pointer from your answers, not an eligibility decision. HDB decides eligibility, grants and loan ceilings.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [
        { label: 'BTO', nodes: ['HFE letter', 'Apply at a launch', 'Ballot result', 'Book a flat', 'Keys'], wait: { from: 3, to: 4, label: 'wait: about 3 to 4 years of construction' } },
        { label: 'Resale', nodes: ['HFE letter', 'View flats', 'Option to Purchase', 'Resale application', 'HDB approval, keys'], wait: { from: 3, to: 4, label: 'about 8 weeks' } },
      ],
      caption: 'Both routes start with the HFE letter. The difference is in the last leg: years of construction for a BTO flat, about eight weeks from application to approval for a resale flat.',
      aria: 'Two timelines: BTO waits years for construction after booking; resale completes about eight weeks after the application.',
    },
  },

  'home-affordability-and-loans': {
    quick: {
      intro: 'Three numbers and one choice give a comfortable price band. It uses your comfort share and 25% upfront, so it is a planning pointer, not a loan approval.',
      fields: [
        { id: 'income', label: 'Gross monthly household income', type: 'money', benchmark: 'medianHouseholdIncome' },
        { id: 'cash', label: 'Cash you can commit', type: 'money', help: 'Keep the emergency fund out of this figure.' },
        { id: 'cpf', label: 'CPF OA you can commit', type: 'money' },
        { id: 'loan', label: 'Loan route', type: 'choice', options: [{ value: 'hdb', label: 'HDB loan, 2.6%' }, { value: 'bank', label: 'Bank loan, 3.5% (illustrative)' }], default: 'hdb' },
        { id: 'share', label: 'Comfort ceiling', type: 'choice', options: [{ value: '25', label: '25% of income' }, { value: '30', label: '30%' }, { value: '35', label: '35%' }], default: '30' },
      ],
      evaluate: (a) => {
        const inc = num(a.income);
        const cash = num(a.cash);
        const cpf = num(a.cpf);
        const rate = a.loan === 'bank' ? 3.5 : 2.6;
        const share = Number(a.share || 30);
        const M = (inc * share) / 100;
        const i = rate / 100 / 12;
        const n = 300;
        const loan = loanFor(M, i, n);
        const byLoan = loan / 0.75;
        const funds = cash + cpf;
        const byFunds = funds / 0.25;
        const price = Math.min(byLoan, byFunds);
        const limiter = byLoan <= byFunds ? 'repayments' : 'upfront';
        const repay = price > 0 ? pmt(price * 0.75, i, n) : 0;
        const why: string[] = [];
        if (inc === 0) why.push('Enter your gross household income to see the band.');
        else if (price === 0) why.push('Add the cash and CPF you can commit: with none, no price works on paper.');
        else {
          why.push(limiter === 'repayments' ? `Your ${share}% comfort ceiling (${sgd(M)} a month) is the binding limit; more upfront money would not raise it.` : `Your upfront funds (${sgd(funds)}) are the binding limit; at 25% down they stretch to ${sgd(byFunds)}.`);
          why.push(`At ${sgd(price)} the repayment would be about ${sgd(repay)} a month over 25 years at ${rate.toFixed(1)}%.`);
          if (price < 545000) why.push('That sits below HDB’s 4-room resale medians in non-mature towns (S$545,000 to 680,000, 3Q 2026); look at smaller flat types, BTO pricing or a longer runway.');
          else if (price > 1065000) why.push('That is above the highest 4-room median (Queenstown, S$1,065,000); the ceiling, not the market, is your constraint.');
          else why.push('That is within the range of 4-room resale medians (S$538,000 Jurong West to S$1,065,000 Queenstown, 3Q 2026).');
        }
        return {
          label: 'Pointer',
          verdict: inc === 0 || price === 0 ? 'Waiting for your numbers' : `Comfortable up to about ${sgdK(price)}`,
          stats: price > 0 ? [{ label: 'Comfortable price', value: sgd(price) }, { label: 'Repayment at that price', value: `${sgd(repay)}/mo` }] : undefined,
          why,
          next: [
            tool('housing', price > 0 ? `Opens with ${sgd(price)}, ${rate.toFixed(1)}% and 25 years filled in.` : 'Model any price, rate and tenure.', { price: price > 0 ? Math.round(price / 5000) * 5000 : 620000, rate, tenure: 25, down: 25, income: inc, cash, cpf, limit: share }),
            guide('hdb-bto-vs-resale', 'Which route fits your timeline.'),
          ],
          fine: 'Planning maths only: 25-year tenure, 25% down, no stamp duty, grants or debt-servicing rules. Your lender and the HFE letter decide.',
          figure: {
            type: 'band',
            max: 1200000,
            unit: 'sgd',
            bars: [
              { label: 'Repayments at your ceiling support', value: byLoan, strong: price > 0 && limiter === 'repayments' },
              { label: 'Upfront funds at 25% down support', value: byFunds, strong: price > 0 && limiter === 'upfront' },
            ],
            marker: price > 0 ? { value: price, label: `you: ${sgdK(price)}` } : undefined,
            ticks: [
              { value: 538000, label: 'Jurong West 538k', anchor: 'end' },
              { value: 680000, label: 'Punggol 680k', anchor: 'start' },
              { value: 1065000, label: 'Queenstown 1.07m', anchor: 'middle' },
            ],
            caption: price > 0 ? `Your comfortable price is the shorter bar: ${limiter === 'repayments' ? 'the monthly ceiling' : 'your upfront funds'} set it. Triangles mark HDB’s 4-room resale medians for 3Q 2026.` : 'Enter your income, cash and CPF above and the two bars show which one limits your price. Triangles mark HDB’s 4-room resale medians for 3Q 2026.',
            aria: 'Price band: the lower of what repayments support and what upfront funds support is the comfortable price, shown against HDB median resale prices.',
          },
        };
      },
    },
    figure: {
      type: 'band',
      max: 1200000,
      unit: 'sgd',
      bars: [
        { label: 'Repayments at your ceiling support', value: 0 },
        { label: 'Upfront funds at 25% down support', value: 0 },
      ],
      ticks: [
        { value: 538000, label: 'Jurong West 538k', anchor: 'end' },
        { value: 680000, label: 'Punggol 680k', anchor: 'start' },
        { value: 1065000, label: 'Queenstown 1.07m', anchor: 'middle' },
      ],
      caption: 'Enter your income, cash and CPF above to draw the bars. Triangles mark HDB’s 4-room resale medians for 3Q 2026.',
      aria: 'Empty price band with HDB median resale price markers.',
    },
  },

  'renting-in-singapore': {
    quick: {
      intro: 'The move-in bill is more than one month’s rent. Enter the rent and lease length to see the cash you need on signing.',
      fields: [
        { id: 'rent', label: 'Monthly rent', type: 'money' },
        { id: 'lease', label: 'Lease length', type: 'choice', options: [{ value: '12', label: '1 year' }, { value: '24', label: '2 years' }], default: '24' },
        { id: 'agent', label: 'Using your own agent?', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
      ],
      evaluate: (a) => {
        const rent = num(a.rent);
        const months = Number(a.lease || 24);
        const depositMonths = months >= 24 ? 2 : 1;
        const deposit = rent * depositMonths;
        const duty = rent * months * 0.004;
        const agentFee = a.agent === 'yes' ? (months >= 24 ? rent : rent / 2) : 0;
        const total = deposit + rent + duty + agentFee;
        const why: string[] = [];
        if (rent === 0) why.push('Enter the monthly rent to size the move-in bill.');
        else {
          why.push(`Security deposit: ${depositMonths} month${depositMonths > 1 ? 's' : ''} (${sgd(deposit)}) is the common practice for a ${months / 12}-year lease, plus the first month (${sgd(rent)}).`);
          why.push(`Stamp duty on the lease is 0.4% of the total rent for the term: ${sgd(duty)}. The tenant pays it to IRAS within 14 days of signing.`);
          if (agentFee > 0) why.push(`Your agent’s fee is commonly half a month for a 1-year lease and a month for 2 years: ${sgd(agentFee)}.`);
          else why.push('No agent fee counted; the landlord pays their own agent.');
        }
        return {
          label: 'Pointer',
          verdict: rent === 0 ? 'Waiting for your numbers' : `About ${sgd(total)} to move in`,
          stats: rent > 0 ? [{ label: 'On signing', value: sgd(total) }, { label: 'Over the lease', value: sgd(rent * months + duty + agentFee) }] : undefined,
          why,
          next: [tool('budget', rent > 0 ? 'Opens with the rent in your housing line.' : 'See what rent leaves for everything else.', rent > 0 ? { housing: rent } : undefined), guide('moving-checklist', 'Everything after the keys.')],
          fine: 'Deposit and agent fees are market practice, not law; your tenancy agreement sets them. Stamp duty rate from IRAS at the time of writing.',
          figure:
            rent > 0
              ? {
                  type: 'stack',
                  title: 'Cash on signing',
                  unit: 'sgd',
                  segments: [
                    { label: 'Deposit', value: deposit },
                    { label: 'First month', value: rent },
                    { label: 'Stamp duty', value: duty },
                    { label: 'Agent fee', value: agentFee },
                  ],
                  caption: 'The deposit comes back at the end of the lease if the flat is returned in order; the rest does not.',
                  aria: `Cash on signing: deposit ${sgd(deposit)}, first month ${sgd(rent)}, stamp duty ${sgd(duty)}, agent fee ${sgd(agentFee)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'Cash on signing (illustration: S$3,000 rent, 2-year lease, no agent)',
      unit: 'sgd',
      segments: [
        { label: 'Deposit (2 months)', value: 6000 },
        { label: 'First month', value: 3000 },
        { label: 'Stamp duty (0.4% of total rent)', value: 288 },
      ],
      caption: 'Enter your own rent above to see your move-in bill.',
      aria: 'Illustrative cash needed on signing a two-year lease.',
    },
  },

  'renovation-and-moving': {
    quick: {
      intro: 'Scope drives cost and time more than flat size. Pick what you are doing and see how your budget compares with typical ranges.',
      fields: [
        { id: 'flat', label: 'The flat is', type: 'choice', options: [{ value: 'bto', label: 'New (BTO or new launch)' }, { value: 'resale', label: 'Resale' }], default: 'bto' },
        { id: 'scope', label: 'Scope', type: 'choice', options: [{ value: 'light', label: 'Light: paint, lights, loose furniture' }, { value: 'standard', label: 'Standard: kitchen, wardrobes, some flooring' }, { value: 'full', label: 'Full: hacking, rewiring, every room' }], default: 'standard' },
        { id: 'budget', label: 'Your budget', type: 'money', benchmark: 'renovation' },
      ],
      evaluate: (a) => {
        const budget = num(a.budget);
        const ranges: Record<string, [number, number]> = {
          'bto-light': [15000, 30000],
          'bto-standard': [30000, 55000],
          'bto-full': [55000, 80000],
          'resale-light': [20000, 40000],
          'resale-standard': [40000, 70000],
          'resale-full': [70000, 110000],
        };
        const weeks: Record<string, string> = { light: '2 to 4 weeks', standard: '8 to 12 weeks', full: '12 to 16 weeks' };
        const [lo, hi] = ranges[`${a.flat}-${a.scope}`] ?? [30000, 80000];
        const why = [`Typical planning range for this scope: ${sgd(lo)} to ${sgd(hi)}, and ${weeks[String(a.scope)] ?? '8 to 12 weeks'} of works. Resale flats usually need more because of hacking and rectification.`];
        if (budget === 0) why.push('Enter your budget to compare.');
        else if (budget < lo) why.push(`Your budget is below the range. Trim scope (keep existing flooring, fewer built-ins) or phase the work rather than cutting the contingency.`);
        else if (budget > hi) why.push('Your budget is above the range; keep the difference as a contingency rather than spending it upfront.');
        else why.push('Your budget sits in the range. Keep 10 to 15% of it unallocated for changes and defects.');
        return {
          label: 'Pointer',
          verdict: budget === 0 ? `Plan for ${sgd(lo)} to ${sgd(hi)}` : budget < lo ? 'Budget below the typical range' : budget > hi ? 'Budget above the typical range' : 'Budget in the typical range',
          stats: [{ label: 'Typical range', value: `${sgdK(lo)} to ${sgdK(hi)}` }, { label: 'Works', value: weeks[String(a.scope)] ?? '8 to 12 weeks' }],
          why,
          next: [tool('housing', budget > 0 ? 'Opens with your renovation budget in the upfront costs.' : 'Add renovation to the upfront bill.', budget > 0 ? { reno: budget } : undefined), guide('moving-checklist', 'The eight weeks around moving day.')],
          fine: 'Ranges are planning guides from typical quotes, not statistics. Three itemised quotes beat any rule of thumb.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'Works', nodes: ['Keys', 'Quotes and design', 'Works start', 'Defects check', 'Move in'], wait: { from: 2, to: 3, label: 'about 8 to 12 weeks for a standard scope' } }],
      caption: 'Quotes and design take two to four weeks before works begin; a standard renovation then runs eight to twelve weeks before the defects check and the move.',
      aria: 'Timeline from keys through quotes, works, defects check and move-in, with works taking eight to twelve weeks.',
    },
  },
};
