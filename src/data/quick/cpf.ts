import type { GuideExtras } from '../types';
import { guide, num, official, sgd, tool } from '@/lib/quick';

export const CPF_EXTRAS: Record<string, GuideExtras> = {
  'cpf-basics': {
    quick: {
      intro: 'For employees aged 35 and below the split is simple; older age bands use different rates. Enter a monthly wage to see where each dollar goes.',
      fields: [
        { id: 'age', label: 'Your age', type: 'choice', options: [{ value: 'u35', label: '35 and below' }, { value: '36', label: '36 to 55' }, { value: '56', label: '56 and above' }], default: 'u35' },
        { id: 'wage', label: 'Monthly wage (before CPF)', type: 'money', help: 'Ordinary wages; the Ordinary Wage ceiling caps the amount that attracts CPF.' },
      ],
      evaluate: (a) => {
        const wage = num(a.wage);
        const under = a.age === 'u35';
        const emp = under ? wage * 0.2 : 0;
        const er = under ? wage * 0.17 : 0;
        const oa = under ? wage * 0.23 : 0;
        const sa = under ? wage * 0.06 : 0;
        const ma = under ? wage * 0.08 : 0;
        const why: string[] = [];
        if (!under) why.push('From 36 onwards the contribution and allocation rates step down by age band, with more going to MediSave and the retirement account. CPF Board’s table has the exact figures for your band.');
        else if (wage === 0) why.push('Enter a monthly wage to see the split.');
        else {
          why.push(`You contribute ${sgd(emp)} (20%) and your employer ${sgd(er)} (17%): ${sgd(emp + er)} a month in total, 37% of the wage.`);
          why.push(`Allocation: Ordinary Account ${sgd(oa)} (housing, some investments), Special Account ${sgd(sa)} (retirement, 4%-floor interest), MediSave ${sgd(ma)} (healthcare and premiums).`);
          why.push('Take-home is the wage less your 20%; the employer’s 17% is on top of your wage, not out of it.');
        }
        return {
          label: 'Pointer',
          verdict: !under ? 'Rates depend on your age band' : wage === 0 ? 'Waiting for your wage' : `${sgd(emp + er)} into CPF each month`,
          stats: under && wage > 0 ? [{ label: 'Take-home', value: sgd(wage - emp) }, { label: 'Ordinary Account', value: `${sgd(oa)}/mo` }] : undefined,
          why,
          next: [official('cpf', 'Contribution and allocation rates by age.'), tool('retirement', 'Project where the retirement portion lands.'), guide('retirement-income-cpf-life', 'What the money turns into at 65.')],
          fine: 'Rates shown are for employees aged 35 and below at the time of writing, below the wage ceiling. CPF Board publishes the current table.',
          figure:
            under && wage > 0
              ? {
                  type: 'stack',
                  title: `Where ${sgd(wage)} of wages goes (age 35 and below)`,
                  unit: 'sgd',
                  segments: [
                    { label: 'Take-home', value: wage - emp, muted: true },
                    { label: 'Ordinary Account (23%)', value: oa },
                    { label: 'Special Account (6%)', value: sa },
                    { label: 'MediSave (8%)', value: ma },
                  ],
                  caption: 'Your 20% and the employer’s 17% land in three accounts; the grey part is what reaches your bank account.',
                  aria: `Wage ${sgd(wage)}: take-home ${sgd(wage - emp)}, OA ${sgd(oa)}, SA ${sgd(sa)}, MediSave ${sgd(ma)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'Allocation of CPF contributions, employees aged 35 and below',
      unit: 'pct',
      segments: [
        { label: 'Ordinary Account 23%', value: 23 },
        { label: 'Special Account 6%', value: 6 },
        { label: 'MediSave 8%', value: 8 },
      ],
      caption: 'Of a 37% total (20% employee, 17% employer), as a share of the monthly wage. Older age bands shift the mix towards MediSave and retirement.',
      aria: 'Stacked bar: 23% Ordinary Account, 6% Special Account, 8% MediSave.',
    },
  },

  'retirement-income-cpf-life': {
    quick: {
      intro: 'Put your CPF LIFE estimate beside your expected spending to see how much the payouts cover and what your own savings must add.',
      fields: [
        { id: 'age', label: 'Your age now', type: 'number', suffix: 'years', default: 34, min: 18, max: 80 },
        { id: 'payout', label: 'Expected CPF LIFE monthly payout', type: 'money', help: 'From CPF Board’s payout estimator, in today’s dollars.' },
        { id: 'other', label: 'Other retirement income per month', type: 'money', help: 'Rental, annuities, part-time work.' },
        { id: 'spend', label: 'Expected monthly spending in retirement', type: 'money', benchmark: 'retirementSpending' },
      ],
      evaluate: (a) => {
        const age = Math.round(num(a.age));
        const payout = num(a.payout);
        const other = num(a.other);
        const spend = num(a.spend);
        const income = payout + other;
        const share = spend > 0 ? income / spend : 0;
        const gap = Math.max(0, spend - income);
        const why: string[] = [];
        if (spend === 0) why.push('Enter the monthly spending you expect; 60 to 70% of today’s take-home is a common starting point.');
        else {
          why.push(`CPF LIFE and other income cover ${Math.round(share * 100)}% of ${sgd(spend)} a month${gap > 0 ? `; your own savings must supply ${sgd(gap)} a month, ${sgd(gap * 12)} a year` : '; the payouts cover it on this estimate'}.`);
          if (payout === 0) why.push('Without a CPF LIFE estimate the picture is incomplete; the estimator takes two minutes with Singpass.');
          if (age < 55) why.push('Before 55, Special Account top-ups and avoiding early OA withdrawals raise the eventual payout; the retirement calculator shows the effect of saving outside CPF too.');
          else why.push('From 55, the Retirement Sum you set aside and the age you start payouts (65 to 70) change the monthly amount; deferring raises it.');
        }
        return {
          label: 'Pointer',
          verdict: spend === 0 ? 'Waiting for your numbers' : gap === 0 ? 'Payouts cover your spending' : `Payouts cover ${Math.round(share * 100)}%`,
          stats: spend > 0 ? [{ label: 'Covered by payouts', value: `${Math.round(share * 100)}%` }, { label: 'Gap per month', value: gap > 0 ? sgd(gap) : 'None' }] : undefined,
          why,
          next: [
            official('cpf-payout-estimator', 'Get your CPF LIFE estimate.'),
            tool('retirement', spend > 0 ? 'Opens with your age, spending and other income filled in.' : 'Project your savings through retirement.', spend > 0 ? { age, spend, other: income } : undefined),
            guide('start-investing', 'Closing the gap with savings outside CPF.'),
          ],
          fine: 'Today’s dollars throughout. CPF LIFE payouts depend on the plan, the sum set aside and the start age; CPF Board’s estimator is the authority.',
          figure:
            spend > 0
              ? {
                  type: 'stack',
                  title: 'Monthly retirement income against spending',
                  unit: 'sgd',
                  segments: [
                    { label: 'CPF LIFE payout', value: payout },
                    { label: 'Other income', value: other },
                    { label: 'Gap to fill from savings', value: gap, muted: true },
                  ],
                  marker: { value: spend, label: `spending ${sgd(spend)}` },
                  caption: 'Coloured segments are income that keeps coming; the grey gap is what your own savings must supply each month.',
                  aria: `Retirement income ${sgd(income)} against spending ${sgd(spend)}; gap ${sgd(gap)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'Monthly retirement income against spending (illustration)',
      unit: 'sgd',
      segments: [
        { label: 'CPF LIFE payout', value: 1500 },
        { label: 'Other income', value: 500 },
        { label: 'Gap to fill from savings', value: 1500, muted: true },
      ],
      marker: { value: 3500, label: 'spending S$3,500' },
      caption: 'An illustration with a S$3,500 monthly spend. Enter your own CPF LIFE estimate above.',
      aria: 'Illustrative retirement income stack against a spending marker.',
    },
  },

  'tax-filing-prep': {
    quick: {
      intro: 'Your employment type decides how much IRAS already has. Three answers list what you still need to gather.',
      fields: [
        { id: 'work', label: 'Your income is from', type: 'choice', options: [{ value: 'ais', label: 'An employer on the Auto-Inclusion Scheme' }, { value: 'nonais', label: 'An employer not on AIS' }, { value: 'self', label: 'Self-employment or freelance' }], default: 'ais' },
        { id: 'reliefs', label: 'Reliefs you might claim', type: 'choice', options: [{ value: 'none', label: 'None that I know of' }, { value: 'some', label: 'Parent, child, course fees, CPF top-ups, donations' }, { value: 'unsure', label: 'Not sure' }], default: 'unsure' },
        { id: 'nfs', label: 'Received a No-Filing Service notice?', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }], default: 'unsure' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.work === 'ais') why.push('Your employer submits your income to IRAS; you only confirm it and add anything else (rental, side income) and reliefs.');
        if (a.work === 'nonais') why.push('You need the IR8A from your employer and must enter the income yourself.');
        if (a.work === 'self') why.push('Keep a simple income and expense record; you declare net profit, and MediSave contributions are compulsory on it.');
        if (a.reliefs === 'some') why.push('Gather the proof: parent relief needs the parent’s details, course fees need receipts, CPF top-ups and donations are usually auto-included but check they appear.');
        if (a.reliefs === 'unsure') why.push('Run through IRAS’s relief list once; parent, spouse, child and course-fee reliefs are the ones most often missed.');
        if (a.nfs === 'yes') why.push('No-Filing Service: check the pre-filled figures and reliefs on myTax Portal; you only act if something is wrong or missing.');
        else why.push('Filing opens on 1 March; the e-filing deadline is 18 April. The Notice of Assessment follows from May, and payment is due within a month unless you use GIRO.');
        return {
          label: 'Pointer',
          verdict: a.nfs === 'yes' ? 'Check, do not file' : a.work === 'self' ? 'Prepare your income record' : 'Confirm income, add reliefs',
          why,
          next: [tool('tax-prep', 'The document checklist, saved in this browser.'), official('iras-filing', 'How filing works and the dates.'), guide('freelance-variable-income', 'Setting money aside for tax when income varies.')],
          fine: 'This site has no tax calculator on purpose; rates and reliefs change and IRAS’s own calculator is the authority.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'Tax year', nodes: ['Jan to Feb: gather documents', '1 Mar: filing opens', '18 Apr: e-filing deadline', 'From May: Notice of Assessment', 'Pay within a month or by GIRO'], wait: { from: 1, to: 2, label: 'filing season' } }],
      caption: 'The yearly rhythm of personal income tax in Singapore. Most of the work is in the first six weeks of the year, before the portal opens.',
      aria: 'Timeline of the tax year from gathering documents in January to payment after the Notice of Assessment.',
    },
  },

  'start-investing': {
    quick: {
      intro: 'Order matters more than product choice. Three answers say whether you are ready to invest or what to do first.',
      fields: [
        { id: 'fund', label: 'Emergency fund', type: 'choice', options: [{ value: 'none', label: 'None yet' }, { value: 'partial', label: 'Some, below target' }, { value: 'full', label: 'At target' }], default: 'partial' },
        { id: 'debt', label: 'Card or high-interest debt', type: 'choice', options: [{ value: 'no', label: 'None' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'horizon', label: 'When will you need this money?', type: 'choice', options: [{ value: 'short', label: 'Within 3 years' }, { value: 'mid', label: '3 to 10 years' }, { value: 'long', label: '10+ years' }], default: 'long' },
        { id: 'monthly', label: 'Amount you could invest each month', type: 'money' },
      ],
      evaluate: (a) => {
        const monthly = num(a.monthly);
        const why: string[] = [];
        let ready = true;
        if (a.debt === 'yes') {
          ready = false;
          why.push('Card debt at 26% or more beats any likely investment return. Clear it first; that is a guaranteed return at the card’s rate.');
        }
        if (a.fund === 'none') {
          ready = false;
          why.push('With no buffer, the first market dip or job change forces you to sell at the wrong time. Build at least one month, then start both in parallel.');
        } else if (a.fund === 'partial') why.push('A partial fund is fine to start small alongside; keep most of the monthly amount on the fund until it reaches target.');
        if (a.horizon === 'short') why.push('Money needed within three years does not belong in markets; use savings accounts, fixed deposits or Singapore Savings Bonds.');
        else if (a.horizon === 'mid') why.push('A 3 to 10 year horizon suits a mix of diversified funds and safer holdings; keep costs low and avoid single stocks.');
        else why.push('A 10-year-plus horizon is where low-cost, diversified, regular investing does its work; time in the market matters more than timing.');
        if (monthly > 0 && ready) why.push(`${sgd(monthly)} a month invested for 20 years at a 5% nominal return would grow to roughly ${sgd(monthly * ((Math.pow(1 + 0.05 / 12, 240) - 1) / (0.05 / 12)))} before fees and inflation.`);
        return {
          label: 'Direction',
          verdict: !ready ? 'Not yet: foundations first' : a.horizon === 'short' ? 'Save, don’t invest, for this goal' : 'Ready: start small and automate',
          why,
          next: [
            ready ? tool('retirement', monthly > 0 ? 'Opens with your monthly amount in the projection.' : 'See what regular investing adds over time.', monthly > 0 ? { monthly } : undefined) : guide('emergency-fund', 'The buffer that lets you stay invested.'),
            ready ? guide('retirement-income-cpf-life', 'What CPF already provides, so you invest for the gap.') : guide('pay-down-debt', 'Clear the expensive debt first.'),
            official('moneysense', 'Independent guides to investing basics and scams to avoid.'),
          ],
          fine: 'General principles, not a recommendation of any product. Returns are illustrative; markets fall as well as rise.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'Money left each month',
      question: 'Emergency fund at target and no card debt?',
      yes: 'Invest regularly: low cost, diversified, automated',
      no: 'Clear card debt, then build the fund',
      yesThen: 'Review once a year, not once a week',
      noThen: 'Start investing once the fund has one month',
      caption: 'The order most people get backwards: the buffer and the expensive debt come before the first investment.',
      aria: 'Flowchart: with an emergency fund and no card debt, invest regularly; otherwise clear debt and build the fund first.',
    },
  },
};
