import type { GuideExtras } from '../types';
import { guide, num, official, sgd, tool } from '@/lib/quick';

export const MARRIAGE_EXTRAS: Record<string, GuideExtras> = {
  'getting-married-admin': {
    quick: {
      intro: 'The wedding date sets one clock, the flat another. Three answers put the admin in order.',
      fields: [
        { id: 'when', label: 'Solemnisation is', type: 'choice', options: [{ value: 'soon', label: 'Within 6 months' }, { value: 'mid', label: '6 to 18 months away' }, { value: 'later', label: 'Not fixed yet' }], default: 'mid' },
        { id: 'flat', label: 'Home plans', type: 'choice', options: [{ value: 'bto', label: 'BTO applied or booked' }, { value: 'resale', label: 'Buying resale' }, { value: 'rent', label: 'Renting first' }, { value: 'none', label: 'Staying with family for now' }], default: 'none' },
        { id: 'budget', label: 'Wedding budget', type: 'money' },
        { id: 'saved', label: 'Saved towards it', type: 'money' },
      ],
      evaluate: (a) => {
        const budget = num(a.budget);
        const saved = num(a.saved);
        const why: string[] = [];
        why.push('File the notice of marriage with ROM at least 21 days and not more than 3 months before the solemnisation; book the date before the venue.');
        if (a.flat === 'bto') why.push('A BTO booked under the Fiancé/Fiancée Scheme needs the marriage certificate within the deadline HDB set at key collection; put that date next to the wedding date.');
        if (a.flat === 'resale') why.push('For a resale flat, the HFE letter and the solemnisation date both matter to HDB; check which must come first for your scheme.');
        if (a.flat === 'rent') why.push('Renting first keeps the flat decision separate from the wedding; it costs more, but it removes one deadline from the year.');
        if (budget > 0) why.push(saved >= budget ? `The wedding is funded (${sgd(saved)} of ${sgd(budget)}).` : `${sgd(budget - saved)} still to save; spreading it over the months to the date avoids starting married life with card debt.`);
        why.push('After the certificate: update CPF nominations (marriage revokes an earlier one), insurance nominations, the will, and decide how joint money will work.');
        return {
          label: 'Pointer',
          verdict: a.when === 'soon' ? 'File the ROM notice now' : budget > 0 && saved < budget ? `Save ${sgd(budget - saved)} before the date` : 'Put the two timelines side by side',
          stats: budget > 0 ? [{ label: 'Budget', value: sgd(budget) }, { label: 'Still to save', value: sgd(Math.max(0, budget - saved)) }] : undefined,
          why,
          next: [official('msf-marriage', 'Registry of Marriages: notice, documents and dates.'), guide('shared-finances', 'Deciding how money works as a couple.'), tool('budget', 'Fit the saving into the months ahead.')],
          fine: 'ROM and HDB rules are the authority for deadlines; this orders the steps.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [
        { label: 'Marriage', nodes: ['Notice filed', 'Solemnisation', 'Certificate', 'Nominations updated'], wait: { from: 0, to: 1, label: '21 days to 3 months' } },
        { label: 'Home', nodes: ['HFE letter', 'BTO ballot or resale search', 'Marriage certificate to HDB', 'Keys'] },
      ],
      caption: 'The notice of marriage must be filed between 21 days and 3 months before the solemnisation; the flat timeline runs alongside and meets it when HDB needs the certificate.',
      aria: 'Two timelines: marriage from notice to updated nominations, and home from HFE letter to keys.',
    },
  },

  'shared-finances': {
    quick: {
      intro: 'Two incomes and one set of shared bills: see what an equal split and a proportional split each cost you.',
      fields: [
        { id: 'you', label: 'Your take-home', type: 'money', benchmark: 'medianFullTimeIncome' },
        { id: 'partner', label: 'Partner’s take-home', type: 'money' },
        { id: 'shared', label: 'Shared monthly expenses', type: 'money', help: 'Rent or mortgage, utilities, groceries, insurance for the household, childcare.' },
        { id: 'method', label: 'You lean towards', type: 'choice', options: [{ value: 'equal', label: 'Equal split' }, { value: 'prop', label: 'Split by income' }, { value: 'pool', label: 'One shared pot' }], default: 'prop' },
      ],
      evaluate: (a) => {
        const you = num(a.you);
        const partner = num(a.partner);
        const shared = num(a.shared);
        const total = you + partner;
        const yourShareProp = total > 0 ? (you / total) * shared : 0;
        const partnerShareProp = shared - yourShareProp;
        const why: string[] = [];
        if (total === 0 || shared === 0) why.push('Enter both incomes and the shared expenses.');
        else {
          why.push(`Equal split: ${sgd(shared / 2)} each. By income: you ${sgd(yourShareProp)} (${Math.round((you / total) * 100)}%), partner ${sgd(partnerShareProp)}.`);
          why.push(`After the shared bills, an equal split leaves you ${sgd(you - shared / 2)} and your partner ${sgd(partner - shared / 2)}; a proportional split leaves ${sgd(you - yourShareProp)} and ${sgd(partner - partnerShareProp)}.`);
          if (a.method === 'pool') why.push('One pot is simplest and most transparent; agree a personal allowance each so nobody asks permission for coffee.');
          if (Math.abs(you - partner) / Math.max(you, partner) > 0.3 && a.method === 'equal') why.push('With incomes more than 30% apart, an equal split leaves the lower earner much tighter; many couples switch to a proportional split for that reason.');
        }
        return {
          label: 'Pointer',
          verdict: total === 0 || shared === 0 ? 'Waiting for your numbers' : a.method === 'equal' ? `${sgd(shared / 2)} each` : a.method === 'prop' ? `You ${sgd(yourShareProp)}, partner ${sgd(partnerShareProp)}` : 'One pot, two allowances',
          stats: total > 0 && shared > 0 ? [{ label: 'Your share by income', value: `${Math.round((you / total) * 100)}%` }, { label: 'Shared bills', value: `${sgd(shared)}/mo` }] : undefined,
          why,
          next: [tool('budget', total > 0 ? 'Opens with both incomes as household income.' : 'Build the household budget.', total > 0 ? { income: you, other: partner } : undefined), guide('emergency-fund', 'One buffer for the household, not two half-ones.'), guide('build-a-budget', 'The categories to agree on.')],
          fine: 'Arithmetic on your own figures; how you split is a decision for the two of you.',
          figure:
            total > 0 && shared > 0
              ? {
                  type: 'stack',
                  title: a.method === 'equal' ? 'Shared bills, split equally' : 'Shared bills, split by income',
                  unit: 'sgd',
                  segments: [
                    { label: 'You', value: a.method === 'equal' ? shared / 2 : yourShareProp },
                    { label: 'Partner', value: a.method === 'equal' ? shared / 2 : partnerShareProp },
                  ],
                  caption: 'Each segment is one person’s contribution to the shared bills under the method you chose.',
                  aria: `Shared bills ${sgd(shared)} split between you and your partner.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'compare',
      options: ['Equal split', 'Split by income'],
      rows: [
        { label: 'Simplicity', a: 3, b: 2 },
        { label: 'Fairness when incomes differ', a: 1, b: 3 },
        { label: 'Independence of personal money', a: 3, b: 3 },
        { label: 'Needs re-doing when pay changes', a: 1, b: 3, note: 'A proportional split moves with each raise' },
      ],
      caption: 'The two common ways to share bills. Enter your incomes above to see each in dollars.',
      aria: 'Comparison of equal and proportional expense splitting.',
    },
  },

  'family-changes-and-reviews': {
    quick: {
      intro: 'Each life event changes who should receive what. Say what happened and tick what you have already updated.',
      fields: [
        { id: 'event', label: 'What changed', type: 'choice', options: [{ value: 'married', label: 'Got married' }, { value: 'child', label: 'Had a child' }, { value: 'divorce', label: 'Divorced or separated' }, { value: 'death', label: 'A nominee or executor died' }, { value: 'home', label: 'Bought a home' }], default: 'married' },
        { id: 'cpf', label: 'CPF nomination', type: 'choice', options: [{ value: 'yes', label: 'Updated' }, { value: 'no', label: 'Not yet' }], default: 'no' },
        { id: 'ins', label: 'Insurance nominations', type: 'choice', options: [{ value: 'yes', label: 'Updated' }, { value: 'no', label: 'Not yet' }], default: 'no' },
        { id: 'will', label: 'Will', type: 'choice', options: [{ value: 'yes', label: 'Updated' }, { value: 'no', label: 'Not yet' }, { value: 'none', label: 'No will' }], default: 'no' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        const todo: string[] = [];
        if (a.event === 'married') {
          why.push('Marriage revokes an earlier CPF nomination and an earlier will (unless the will was made in contemplation of that marriage). Both need redoing, not just checking.');
        }
        if (a.event === 'divorce') why.push('Divorce does not revoke a CPF nomination or a will; an ex-spouse named in either still receives unless you change it.');
        if (a.event === 'child') why.push('A new child is not automatically added to nominations; the will is where guardianship is named.');
        if (a.event === 'death') why.push('A nominee or executor who has died leaves a gap: the share may fall to others or to the estate; name a replacement.');
        if (a.event === 'home') why.push('A home changes the estate’s size and the debt behind it; check the mortgage is insured and the will covers how the home is held.');
        if (a.cpf === 'no') todo.push('CPF nomination (online with Singpass, two witnesses).');
        if (a.ins === 'no') todo.push('Insurance nominations on each policy, including group cover at work.');
        if (a.will !== 'yes') todo.push(a.will === 'none' ? 'A will; without one the Intestate Succession Act decides.' : 'The will.');
        if (todo.length) why.push(`Still to update: ${todo.join(' ')}`);
        else why.push('Everything is updated for this event. Keep a dated note of what you changed.');
        return {
          label: 'Pointer',
          verdict: todo.length === 0 ? 'Up to date' : `${todo.length} to update`,
          why,
          next: [official('cpf-nomination', 'Make or change a CPF nomination.'), guide('make-a-will', 'Making or redoing the will.'), tool('annual-admin', 'Put the review on the yearly list.')],
          fine: 'General rules under Singapore law at the time of writing; a lawyer can confirm your situation.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'A life event: marriage, child, divorce, death, new home',
      question: 'Did it change who should receive your money?',
      yes: 'Redo CPF nomination, insurance nominations and will',
      no: 'Check they still exist and are valid',
      yesThen: 'Tell the people named where the documents are',
      noThen: 'Marriage revokes both a will and a CPF nomination',
      caption: 'Nominations and wills do not update themselves. Marriage revokes earlier ones; divorce leaves them standing.',
      aria: 'Flowchart: after a life event, redo nominations and will if beneficiaries should change; otherwise check validity, noting that marriage revokes earlier documents.',
    },
  },
};
