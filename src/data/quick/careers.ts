import type { GuideExtras } from '../types';
import { guide, num, official, plural, sgd, tool } from '@/lib/quick';

export const CAREERS_EXTRAS: Record<string, GuideExtras> = {
  'changing-jobs': {
    quick: {
      intro: 'The gap between two jobs is where cover and cash slip through. Four answers list what to settle before the last day.',
      fields: [
        { id: 'notice', label: 'Notice period', type: 'choice', options: [{ value: '1', label: '1 month' }, { value: '2', label: '2 months' }, { value: '3', label: '3 months' }], default: '1' },
        { id: 'gap', label: 'Break between jobs', type: 'number', suffix: 'weeks', default: 0, min: 0, max: 52 },
        { id: 'group', label: 'Hospital or life cover through the current employer?', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }], default: 'unsure' },
        { id: 'bonus', label: 'Bonus or vesting due', type: 'choice', options: [{ value: 'before', label: 'Before I would leave' }, { value: 'after', label: 'After I would leave' }, { value: 'none', label: 'None' }], default: 'none' },
      ],
      evaluate: (a) => {
        const gap = Math.round(num(a.gap));
        const why: string[] = [];
        why.push(`Count back ${a.notice} month${a.notice === '1' ? '' : 's'} from the start date to find the latest day to resign; your contract sets the notice and whether leave can offset it.`);
        if (a.bonus === 'after') why.push('A bonus paid after your last day is usually forfeited unless the contract says otherwise; weigh resigning after the payment date.');
        if (a.group !== 'no') why.push(`Group cover ends on the last day. ${gap > 0 ? `A ${plural(gap, 'week')} gap with no hospital cover is the risk to close` : 'Even with no gap, check the new employer’s waiting period'}; MediShield Life continues regardless.`);
        if (gap > 0) why.push(`No salary for ${plural(gap, 'week')}: that is ${gap} weeks of essentials from savings, plus any premiums you now pay yourself.`);
        why.push('Before the last day: encash or clear leave per policy, get the IR8A or income letter, note the CPF contributions to the last month, and return company devices with your own files backed up.');
        return {
          label: 'Pointer',
          verdict: a.bonus === 'after' ? 'Time the resignation around the bonus' : gap > 0 ? `Plan for a ${plural(gap, 'week')} gap` : 'Line up the handover and the cover',
          why,
          next: [tool('budget', 'Check the months around the move.'), guide('retrenchment-and-job-loss', 'If the move is not your choice.'), official('mom-termination', 'Notice periods and termination rules.')],
          fine: 'General practice; your employment contract and MOM’s rules decide notice, leave and pay.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'The move', nodes: ['Offer accepted', 'Resign in writing', 'Notice period', 'Last day', 'Gap', 'First day'], wait: { from: 2, to: 3, label: '1 to 3 months of notice' } }],
      caption: 'Resign only after the offer is signed, and count the notice period back from the start date. Cover and pay stop at the last day, not the first.',
      aria: 'Timeline of changing jobs from offer to first day, with the notice period highlighted.',
    },
  },

  'retrenchment-and-job-loss': {
    quick: {
      intro: 'The first question is runway: how many months you can cover before the next salary. Four answers size it.',
      fields: [
        { id: 'saved', label: 'Months of essential expenses saved', type: 'number', suffix: 'months', default: 2, min: 0, max: 36 },
        { id: 'benefit', label: 'Retrenchment benefit or notice pay', type: 'number', suffix: 'months of pay', default: 0, min: 0, max: 24 },
        { id: 'deps', label: 'Anyone depending on your income?', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'group', label: 'Hospital cover was through the employer', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
      ],
      evaluate: (a) => {
        const saved = num(a.saved);
        const benefit = num(a.benefit);
        const runway = saved + benefit;
        const target = a.deps === 'yes' ? 6 : 4;
        const why: string[] = [];
        why.push(`Runway: ${saved} months saved plus ${benefit} months of pay is about ${plural(Math.round(runway), 'month')}. A search takes 3 to 6 months for many people; ${target} is a sensible floor ${a.deps === 'yes' ? 'with dependants' : 'for you'}.`);
        if (runway < target) why.push('Below the floor: cut the lifestyle lines now, not later, and ask about instalment plans for the fixed ones before missing a payment.');
        if (a.group === 'yes') why.push('Employer hospital cover ends with the job. MediShield Life continues; an Integrated Shield plan or a personal policy needs setting up before any treatment.');
        why.push('Register with Workforce Singapore for job-matching and check the support schemes; retrenchment benefits are not a legal right unless your contract or a collective agreement provides them.');
        return {
          label: 'Pointer',
          verdict: runway >= target ? `Runway of about ${plural(Math.round(runway), 'month')}` : `Runway short: about ${plural(Math.round(runway), 'month')}`,
          stats: [{ label: 'Runway', value: `${Math.round(runway)} mo` }, { label: 'Floor', value: `${target} mo` }],
          why,
          next: [tool('emergency-debt', 'Plan the fund and pause extra debt payments if needed.', { months: target }), official('mycareersfuture', 'Job-matching and support schemes.'), guide('emergency-fund', 'Rebuilding the buffer when income returns.')],
          fine: 'A planning floor, not a prediction of how long a search takes. MOM and WSG have the current support schemes.',
          figure: {
            type: 'gauge',
            blocks: Math.max(target, Math.ceil(runway)),
            filled: runway,
            title: 'Months of runway',
            right: `floor ${target} months`,
            foot: `you: ${Math.round(runway * 10) / 10} months (${saved} saved + ${benefit} pay)`,
            caption: 'Each block is a month of essentials. Savings plus any retrenchment pay fill it; the floor is where a typical search still fits.',
            aria: `Runway of ${runway} months against a floor of ${target}.`,
          },
        };
      },
    },
    figure: {
      type: 'gauge',
      blocks: 6,
      filled: 0,
      title: 'Months of runway',
      right: 'floor 4 to 6 months',
      foot: 'enter your savings and benefit above',
      caption: 'Each block is a month of essential expenses.',
      aria: 'Empty runway gauge.',
    },
  },

  'upskilling-skillsfuture': {
    quick: {
      intro: 'Course funding stacks: subsidies first, then SkillsFuture Credit, then anything an employer pays. See what is left for you.',
      fields: [
        { id: 'fee', label: 'Full course fee', type: 'money' },
        { id: 'subsidy', label: 'Course subsidy', type: 'choice', options: [{ value: '0', label: 'None' }, { value: '50', label: 'Around 50%' }, { value: '70', label: 'Around 70%' }, { value: '90', label: 'Around 90%' }], default: '0' },
        { id: 'credit', label: 'SkillsFuture Credit you can use', type: 'money', help: 'Check your balance on MySkillsFuture; some credit is tied to specific courses.' },
        { id: 'employer', label: 'Employer sponsorship', type: 'money' },
      ],
      evaluate: (a) => {
        const fee = num(a.fee);
        const sub = fee * (Number(a.subsidy || 0) / 100);
        const credit = Math.min(num(a.credit), Math.max(0, fee - sub));
        const employer = Math.min(num(a.employer), Math.max(0, fee - sub - credit));
        const own = Math.max(0, fee - sub - credit - employer);
        const why: string[] = [];
        if (fee === 0) why.push('Enter the full course fee from the provider’s page.');
        else {
          why.push(`Fee ${sgd(fee)}, subsidy ${sgd(sub)}, credit ${sgd(credit)}, employer ${sgd(employer)}: ${sgd(own)} from your own pocket.`);
          why.push('Subsidy rates depend on the course’s funding status and your age; the course page on MySkillsFuture shows the exact nett fee.');
          if (own > 0) why.push('Compare the nett fee with the pay or role change you expect; a course with no clear use is an expensive hobby.');
        }
        return {
          label: 'Pointer',
          verdict: fee === 0 ? 'Waiting for your numbers' : own === 0 ? 'Fully funded' : `About ${sgd(own)} out of pocket`,
          stats: fee > 0 ? [{ label: 'Nett fee', value: sgd(own) }, { label: 'Covered', value: sgd(fee - own) }] : undefined,
          why,
          next: [official('myskillsfuture', 'Check your credit and the course’s nett fee.'), tool('budget', 'Fit the nett fee into the month.'), guide('changing-jobs', 'Using the course to move roles.')],
          fine: 'Your own estimate of the subsidy; the course listing shows the funded fee.',
          figure:
            fee > 0
              ? {
                  type: 'stack',
                  title: 'Who pays the course fee',
                  unit: 'sgd',
                  segments: [
                    { label: 'Subsidy', value: sub },
                    { label: 'SkillsFuture Credit', value: credit },
                    { label: 'Employer', value: employer },
                    { label: 'You', value: own, muted: true },
                  ],
                  caption: 'The grey segment is what you pay after every other source is applied.',
                  aria: `Course fee ${sgd(fee)}: subsidy ${sgd(sub)}, credit ${sgd(credit)}, employer ${sgd(employer)}, you ${sgd(own)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'Who pays the course fee (illustration: S$2,000 course, 70% subsidy, S$500 credit)',
      unit: 'sgd',
      segments: [
        { label: 'Subsidy', value: 1400 },
        { label: 'SkillsFuture Credit', value: 500 },
        { label: 'You', value: 100, muted: true },
      ],
      caption: 'Enter your own fee and funding above.',
      aria: 'Illustrative course fee split between subsidy, credit and own payment.',
    },
  },

  'freelance-variable-income': {
    quick: {
      intro: 'Pay yourself a steady salary from a buffer account, and let the good months fill it. Four numbers set the salary and the buffer.',
      fields: [
        { id: 'low', label: 'Lowest month in the past year', type: 'money' },
        { id: 'typical', label: 'Typical month', type: 'money' },
        { id: 'high', label: 'Best month', type: 'money' },
        { id: 'ess', label: 'Essential monthly expenses', type: 'money', benchmark: 'essentialSpending' },
      ],
      evaluate: (a) => {
        const low = num(a.low);
        const typical = num(a.typical);
        const high = num(a.high);
        const ess = num(a.ess);
        const salary = Math.max(low, Math.min(typical, ess > 0 ? ess * 1.2 : typical));
        const buffer = ess * 6;
        const why: string[] = [];
        if (typical === 0 || ess === 0) why.push('Enter a typical month and your essentials to set the salary.');
        else {
          why.push(`Pay yourself about ${sgd(salary)} a month: enough for essentials with a margin, below your typical month so the buffer grows.`);
          why.push(`Buffer target: six months of essentials, ${sgd(buffer)}. Income above the salary goes there first, then to tax set-aside and investing.`);
          why.push('Set aside tax as you earn (a fixed share of each payment) and remember MediSave contributions are compulsory on self-employed income.');
          if (high > 0 && low > 0) why.push(`Your months range ${sgd(low)} to ${sgd(high)}; a steady salary turns that swing into a line.`);
        }
        return {
          label: 'Pointer',
          verdict: typical === 0 || ess === 0 ? 'Waiting for your numbers' : `Pay yourself about ${sgd(salary)} a month`,
          stats: ess > 0 ? [{ label: 'Steady salary', value: sgd(salary) }, { label: 'Buffer target', value: sgd(buffer) }] : undefined,
          why,
          next: [
            tool('emergency-debt', ess > 0 ? 'Opens with six months of your essentials as the target.' : 'Size the buffer.', ess > 0 ? { ess, months: 6 } : undefined),
            tool('budget', salary > 0 ? 'Opens with the steady salary as income.' : 'Budget on the steady salary, not the best month.', salary > 0 ? { income: salary } : undefined),
            guide('tax-filing-prep', 'What self-employed filing needs.'),
          ],
          fine: 'A smoothing method, not tax advice. IRAS and CPF Board set the self-employed obligations.',
          figure:
            typical > 0
              ? {
                  type: 'band',
                  max: Math.ceil((Math.max(high, typical, salary) * 1.15) / 500) * 500,
                  unit: 'sgd',
                  bars: [
                    { label: 'Lowest month', value: low },
                    { label: 'Typical month', value: typical },
                    { label: 'Best month', value: high },
                  ],
                  marker: salary > 0 ? { value: salary, label: `pay yourself ${sgd(salary)}` } : undefined,
                  caption: 'Income swings between the bars; the dashed line is the steady amount you move to your spending account every month.',
                  aria: `Income range from ${sgd(low)} to ${sgd(high)} with a steady salary of ${sgd(salary)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'band',
      max: 10000,
      unit: 'sgd',
      bars: [
        { label: 'Lowest month', value: 1800 },
        { label: 'Typical month', value: 4500 },
        { label: 'Best month', value: 9000 },
      ],
      marker: { value: 4000, label: 'pay yourself S$4,000' },
      caption: 'Illustration: a freelancer whose months swing from S$1,800 to S$9,000 pays themselves S$4,000 and lets the rest build a buffer.',
      aria: 'Illustrative income range with a steady self-paid salary marker.',
    },
  },
};
