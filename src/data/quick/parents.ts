import type { GuideExtras } from '../types';
import { guide, num, official, plural, sgd, tool } from '@/lib/quick';

export const PARENTS_EXTRAS: Record<string, GuideExtras> = {
  'caregiving-plan': {
    quick: {
      intro: 'A plan starts with one number everyone can see: what care costs after support, and how it splits across the family.',
      fields: [
        { id: 'level', label: 'Care needed today', type: 'choice', options: [{ value: 'light', label: 'Light: errands, appointments, company' }, { value: 'moderate', label: 'Moderate: daily help, some supervision' }, { value: 'high', label: 'High: round-the-clock or nursing care' }], default: 'moderate' },
        { id: 'cost', label: 'Monthly care cost estimate', type: 'money', benchmark: 'helperCost' },
        { id: 'support', label: 'Support or subsidies you expect', type: 'money', benchmark: 'careSupport' },
        { id: 'people', label: 'Family members sharing the cost', type: 'number', suffix: 'people', default: 2, min: 1, max: 10 },
      ],
      evaluate: (a) => {
        const cost = num(a.cost);
        const support = num(a.support);
        const people = Math.max(1, Math.round(num(a.people)));
        const net = Math.max(0, cost - support);
        const each = net / people;
        const why: string[] = [];
        if (a.level === 'light') why.push('Light needs are usually met with family rota, day activities and transport; the cost is mostly time, so write the rota down.');
        if (a.level === 'moderate') why.push('Moderate needs are where a helper or day care enters; the levy concession and the Home Caregiving Grant are the first two things to check.');
        if (a.level === 'high') why.push('High needs: compare a helper plus home nursing against a nursing home; means-tested subsidies apply to both, through AIC.');
        if (cost === 0) why.push('Enter a monthly cost to split; the caregiving calculator has typical ranges.');
        else why.push(`${sgd(cost)} a month, less ${sgd(support)} support, is ${sgd(net)}; split ${people} ways that is ${sgd(each)} each, ${sgd(each * 12)} a year.`);
        why.push('Agree the split and a review date in writing; money arguments between siblings usually start with an unwritten assumption.');
        return {
          label: 'Pointer',
          verdict: cost === 0 ? 'Waiting for your numbers' : `About ${sgd(each)} each per month`,
          stats: cost > 0 ? [{ label: 'After support', value: `${sgd(net)}/mo` }, { label: 'Per person, per year', value: sgd(each * 12) }] : undefined,
          why,
          next: [
            tool('caregiving', cost > 0 ? 'Opens with your cost and support; add each contributor’s share.' : 'Break the cost down and set each contributor’s share.', cost > 0 ? { homecare: cost, support } : undefined),
            official('aic-financial', 'Subsidies and grants for care at home and in institutions.'),
            guide('lasting-power-of-attorney', 'The document that lets you act if your parent cannot.'),
          ],
          fine: 'Your own estimates; subsidy eligibility is means-tested and decided by AIC and MOH.',
          figure:
            cost > 0
              ? {
                  type: 'stack',
                  title: 'Who pays what each month',
                  unit: 'sgd',
                  segments: [...Array.from({ length: people }, (_, i) => ({ label: `Family member ${i + 1}`, value: each })), { label: 'Support and subsidies', value: support, muted: true }],
                  caption: 'An equal split after support. Shares can differ by income; the calculator lets you set each one.',
                  aria: `Monthly care cost ${sgd(cost)} split between ${people} family members after ${sgd(support)} support.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'Who pays what each month (illustration: S$1,500 helper, S$200 support, two siblings)',
      unit: 'sgd',
      segments: [
        { label: 'Sibling 1', value: 650 },
        { label: 'Sibling 2', value: 650 },
        { label: 'Support', value: 200, muted: true },
      ],
      caption: 'Enter your own cost, support and number of contributors above.',
      aria: 'Illustrative split of a monthly care cost between two siblings and support.',
    },
  },

  'eldercare-costs-and-support': {
    quick: {
      intro: 'Care costs compound: a monthly figure over several years, rising faster than general inflation. Three numbers show the total.',
      fields: [
        { id: 'arrangement', label: 'Arrangement', type: 'choice', options: [{ value: 'helper', label: 'At home with a helper' }, { value: 'daycare', label: 'At home with day care' }, { value: 'home', label: 'Nursing home' }], default: 'helper' },
        { id: 'monthly', label: 'Monthly cost before subsidies', type: 'money', benchmark: 'helperCost' },
        { id: 'years', label: 'Years to plan for', type: 'number', suffix: 'years', default: 5, min: 1, max: 20, benchmark: 'careDuration' },
        { id: 'inflation', label: 'Cost inflation', type: 'number', suffix: '% p.a.', default: 3, min: 0, max: 10, benchmark: 'careInflation' },
      ],
      evaluate: (a) => {
        const monthly = num(a.monthly);
        const years = Math.max(1, Math.round(num(a.years) || 5));
        const inf = num(a.inflation) / 100;
        const first = monthly * 12;
        const last = first * Math.pow(1 + inf, years - 1);
        const total = inf > 0 ? first * ((Math.pow(1 + inf, years) - 1) / inf) : first * years;
        const why: string[] = [];
        if (a.arrangement === 'helper') why.push('A helper is usually the cheapest full-time option once the levy concession applies; add medical, consumables and the helper’s own insurance.');
        if (a.arrangement === 'daycare') why.push('Day care centres charge monthly fees before means-tested subsidies; transport to and from the centre is often the forgotten cost.');
        if (a.arrangement === 'home') why.push('Nursing home fees vary widely by ward class; subsidies are means-tested on the whole household through AIC.');
        if (monthly === 0) why.push('Enter a monthly cost to project it.');
        else why.push(`${sgd(monthly)} a month is ${sgd(first)} in year one and about ${sgd(last)} in year ${years} at ${a.inflation}% inflation: roughly ${sgd(total)} over ${years} years before subsidies.`);
        return {
          label: 'Pointer',
          verdict: monthly === 0 ? 'Waiting for your numbers' : `About ${sgd(total)} over ${plural(years, 'year')}`,
          stats: monthly > 0 ? [{ label: 'Year one', value: sgd(first) }, { label: `Year ${years}`, value: sgd(last) }] : undefined,
          why,
          next: [
            tool('caregiving', monthly > 0 ? 'Opens with this cost, duration and inflation filled in.' : 'Model the full cost with support and family shares.', monthly > 0 ? { [a.arrangement === 'helper' ? 'helper' : 'homecare']: monthly, years, inflation: num(a.inflation) } : undefined),
            official('aic-financial', 'Means-tested subsidies and grants.'),
            guide('hiring-a-helper', 'What a helper really costs each month.'),
          ],
          fine: 'A projection of your own estimate; subsidies are not deducted. AIC and MOH decide eligibility.',
          figure:
            monthly > 0
              ? {
                  type: 'band',
                  max: Math.ceil(total / 10000) * 10000,
                  unit: 'sgd',
                  bars: [
                    { label: 'Year one', value: first },
                    { label: `Year ${years} (with ${a.inflation}% inflation)`, value: last },
                    { label: `Total over ${years} years`, value: total, strong: true },
                  ],
                  caption: 'The total is what the family funds before subsidies; the yearly bars show how inflation moves the bill.',
                  aria: `Care cost ${sgd(first)} in year one, ${sgd(last)} in year ${years}, ${sgd(total)} in total.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'band',
      max: 100000,
      unit: 'sgd',
      bars: [
        { label: 'Year one (S$1,500 a month)', value: 18000 },
        { label: 'Year five (3% inflation)', value: 20259 },
        { label: 'Total over five years', value: 95564, strong: true },
      ],
      caption: 'Illustration: a S$1,500 monthly cost over five years at 3% inflation. Enter your own figures above.',
      aria: 'Illustrative care cost over five years.',
    },
  },

  'hiring-a-helper': {
    quick: {
      intro: 'The salary is only part of the monthly bill. Add the levy, food and insurance, and the one-off agency fee, to see the real cost.',
      fields: [
        { id: 'salary', label: 'Monthly salary', type: 'money' },
        { id: 'levy', label: 'Monthly levy', type: 'money', help: 'MOM sets the levy; households with a young child or an elderly member may qualify for the concessionary rate. Check MOM for the current figures.' },
        { id: 'other', label: 'Food, insurance, phone, medical, per month', type: 'money' },
        { id: 'agency', label: 'One-off agency and placement fees', type: 'money' },
      ],
      evaluate: (a) => {
        const salary = num(a.salary);
        const levy = num(a.levy);
        const other = num(a.other);
        const agency = num(a.agency);
        const monthly = salary + levy + other;
        const firstYear = monthly * 12 + agency;
        const why: string[] = [];
        if (monthly === 0) why.push('Enter the salary and levy to see the monthly figure.');
        else {
          why.push(`Monthly all-in: ${sgd(monthly)} (${sgd(salary)} salary, ${sgd(levy)} levy, ${sgd(other)} other). First year with fees: ${sgd(firstYear)}.`);
          why.push('Employers must also buy medical and personal accident insurance, pay for the six-monthly medical exam and give a weekly rest day or compensation; MOM’s rules are the authority.');
          if (levy === 0) why.push('The levy is not zero; check whether the concessionary rate applies to your household and enter it.');
        }
        return {
          label: 'Pointer',
          verdict: monthly === 0 ? 'Waiting for your numbers' : `About ${sgd(monthly)} a month all-in`,
          stats: monthly > 0 ? [{ label: 'Per month', value: sgd(monthly) }, { label: 'First year', value: sgd(firstYear) }] : undefined,
          why,
          next: [
            tool('caregiving', monthly > 0 ? 'Opens with this helper cost in the care budget.' : 'Put the helper cost into the full care budget.', monthly > 0 ? { helper: monthly } : undefined),
            official('mom-mdw', 'Employer obligations, levy and insurance requirements.'),
            guide('caregiving-plan', 'Fit the helper into the wider plan and cost-sharing.'),
          ],
          fine: 'Your own figures; MOM sets the levy and the employer’s obligations.',
          figure:
            monthly > 0
              ? {
                  type: 'stack',
                  title: 'Monthly cost of a helper',
                  unit: 'sgd',
                  segments: [
                    { label: 'Salary', value: salary },
                    { label: 'Levy', value: levy },
                    { label: 'Food, insurance, other', value: other },
                  ],
                  marker: { value: 1500, label: 'typical S$1,200 to 1,800' },
                  caption: 'Your monthly all-in against the typical planning range for a helper.',
                  aria: `Monthly helper cost: salary ${sgd(salary)}, levy ${sgd(levy)}, other ${sgd(other)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'Monthly cost of a helper (illustration)',
      unit: 'sgd',
      segments: [
        { label: 'Salary', value: 700 },
        { label: 'Levy (concessionary)', value: 60 },
        { label: 'Food, insurance, other', value: 400 },
      ],
      caption: 'An illustration only; enter your own salary, levy and other costs above. MOM sets the levy rates.',
      aria: 'Illustrative monthly helper cost split into salary, levy and other costs.',
    },
  },
};
