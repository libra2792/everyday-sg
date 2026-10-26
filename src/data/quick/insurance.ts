import type { GuideExtras } from '../types';
import { guide, num, official, sgd, sgdK, tool } from '@/lib/quick';

export const INSURANCE_EXTRAS: Record<string, GuideExtras> = {
  'insurance-basics': {
    quick: {
      intro: 'Death cover is the one most people guess at. Four numbers give a first estimate of the gap between what your family would need and what you already have.',
      fields: [
        { id: 'deps', label: 'Anyone depending on your income?', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], default: 'yes' },
        { id: 'income', label: 'Your annual income', type: 'money', help: 'Gross, before CPF. The median full-time income is about S$69,000 a year (MOM 2025, including employer CPF).' },
        { id: 'years', label: 'Years of income to replace', type: 'number', suffix: 'years', default: 10, min: 0, max: 30, benchmark: 'incomeReplacementYears' },
        { id: 'debts', label: 'Debts to clear (mortgage, loans)', type: 'money' },
        { id: 'existing', label: 'Life cover you already have', type: 'money', help: 'Sum assured on term and whole-life policies plus any group cover at work.' },
      ],
      evaluate: (a) => {
        const income = num(a.income);
        const years = num(a.years);
        const debts = num(a.debts);
        const existing = num(a.existing);
        const need = income * years + debts;
        const gap = need - existing;
        const why: string[] = [];
        if (a.deps === 'no') why.push('With nobody depending on your income, death cover matters less than hospital, disability and critical-illness cover. Keep any debts covered.');
        if (income === 0 && debts === 0) why.push('Enter your income and debts to size the need.');
        else {
          why.push(`Need: ${sgd(income)} × ${years} years + ${sgd(debts)} debts = ${sgd(need)}. Existing cover ${sgd(existing)}.`);
          why.push(gap > 0 ? `Gap of about ${sgd(gap)}. Term cover for that amount is usually the cheapest way to close it.` : 'Your existing cover meets this estimate; check it is still in force and the nominations are current.');
          why.push('Hospital cover (MediShield Life plus an Integrated Shield plan if you want higher wards) and disability income cover sit alongside this; one does not replace the other.');
        }
        return {
          label: 'Pointer',
          verdict: income === 0 && debts === 0 ? 'Waiting for your numbers' : gap > 0 ? `Gap of about ${sgdK(gap)}` : 'Covered on this estimate',
          stats: need > 0 ? [{ label: 'Estimated need', value: sgd(need) }, { label: 'Gap', value: gap > 0 ? sgd(gap) : 'None' }] : undefined,
          why,
          next: [
            tool('insurance', need > 0 ? 'Opens with your years, debts and existing cover; add living expenses and commitments.' : 'Work out the need in full.', need > 0 ? { years, debts, existing } : undefined),
            guide('health-insurance-sg', 'How hospital bills are actually paid.'),
            official('moneysense', 'Independent explanations of each type of cover.'),
          ],
          fine: 'A rule-of-thumb estimate, not a recommendation of any product. A licensed adviser can assess the full picture.',
          figure:
            need > 0
              ? {
                  type: 'stack',
                  title: 'What the family would need',
                  unit: 'sgd',
                  segments: [
                    { label: `Income for ${years} years`, value: income * years },
                    { label: 'Debts to clear', value: debts },
                  ],
                  marker: existing > 0 ? { value: existing, label: `existing cover ${sgdK(existing)}` } : undefined,
                  caption: 'The bar is the estimated need; the dashed line is the cover you already hold. The distance between them is the gap.',
                  aria: `Need ${sgd(need)} against existing cover ${sgd(existing)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'compare',
      options: ['Term life', 'Whole life'],
      rows: [
        { label: 'Cover per dollar of premium', a: 3, b: 1, note: 'Term buys the most protection for the least premium' },
        { label: 'Cash value', a: 0, b: 2, note: 'Whole life builds a surrender value slowly' },
        { label: 'Flexibility to change later', a: 3, b: 1 },
        { label: 'Cover for life', a: 1, b: 3, note: 'Term ends at a chosen age' },
      ],
      caption: 'The two main ways to buy death cover. Most households need the protection first and can add savings separately.',
      aria: 'Comparison of term and whole-life insurance on cost, cash value, flexibility and duration.',
    },
  },

  'health-insurance-sg': {
    quick: {
      intro: 'Your ward preference decides which layers of cover matter. Three answers show how a bill would be paid.',
      fields: [
        { id: 'ward', label: 'Ward you would choose', type: 'choice', options: [{ value: 'sub', label: 'Subsidised (B2 or C)' }, { value: 'a', label: 'A or B1 in a public hospital' }, { value: 'pri', label: 'Private hospital' }], default: 'sub' },
        { id: 'ip', label: 'Integrated Shield plan', type: 'choice', options: [{ value: 'yes', label: 'Have one' }, { value: 'no', label: 'MediShield Life only' }, { value: 'unsure', label: 'Not sure' }], default: 'unsure' },
        { id: 'rider', label: 'Rider on the plan', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], default: 'no' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.ward === 'sub') {
          why.push('MediShield Life is designed around subsidised wards: the government subsidy comes off first, then MediShield Life pays most of what remains above the deductible, then MediSave and cash.');
          if (a.ip === 'yes') why.push('An Integrated Shield plan adds little if you will choose a subsidised ward; check whether the premium is buying ward choice you would not use.');
        } else {
          why.push(`${a.ward === 'a' ? 'A and B1 wards' : 'Private hospitals'} are unsubsidised. MediShield Life still pays, but at subsidised-ward levels, so an Integrated Shield plan for that ward class carries most of the bill.`);
          if (a.ip !== 'yes') why.push('Without an Integrated Shield plan, expect a large cash portion in those wards. Compare plans before you need one; pre-existing conditions are excluded once diagnosed.');
        }
        if (a.rider === 'yes') why.push('Riders reduce the deductible and co-insurance but must leave at least a 5% co-payment; premiums rise with age, so check the schedule.');
        else why.push('Without a rider you pay the deductible and co-insurance yourself; MediSave can be used within its limits.');
        why.push('Premiums for MediShield Life and Integrated Shield plans are payable from MediSave up to the Additional Withdrawal Limit; anything above is cash.');
        return {
          label: 'Pointer',
          verdict: a.ward === 'sub' ? 'MediShield Life carries most of it' : a.ip === 'yes' ? 'Your Integrated Shield plan carries most of it' : 'A large cash share without an Integrated Shield plan',
          why,
          next: [official('cpf-medishield', 'How MediShield Life claims and premiums work.'), tool('insurance', 'Put hospital cover beside your other protection needs.'), guide('review-coverage-and-claims', 'Making a claim when the bill arrives.')],
          fine: 'Describes the layers, not your policy. Deductibles, co-insurance and claim limits are set by MOH and your insurer.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'A bill', nodes: ['Hospital bill', 'Government subsidy', 'MediShield Life or Integrated Shield', 'Rider (if any)', 'MediSave', 'Cash'], wait: { from: 4, to: 5, label: 'what you pay yourself' } }],
      caption: 'The layers of a hospital bill in the order they apply. Each layer reduces what the next one sees; the last two are yours.',
      aria: 'Sequence showing how a hospital bill is paid: subsidy, MediShield Life or Integrated Shield, rider, MediSave, then cash.',
    },
  },

  'review-coverage-and-claims': {
    quick: {
      intro: 'Two things decide whether a review is due: how long since the last one, and what changed in your life.',
      fields: [
        { id: 'last', label: 'Last full review of your policies', type: 'choice', options: [{ value: 'recent', label: 'Within a year' }, { value: 'mid', label: '1 to 3 years ago' }, { value: 'long', label: '3+ years or never' }], default: 'long' },
        { id: 'change', label: 'Changed since then', type: 'choice', options: [{ value: 'none', label: 'Nothing major' }, { value: 'family', label: 'Married or a child' }, { value: 'home', label: 'Bought a home or took a loan' }, { value: 'job', label: 'Changed or lost a job' }], default: 'none' },
        { id: 'claim', label: 'A claim to make now?', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        let urgency = a.last === 'long' ? 2 : a.last === 'mid' ? 1 : 0;
        if (a.change !== 'none') urgency += 2;
        if (a.change === 'family') why.push('A spouse or child changes who depends on you: raise death and disability cover and update every nomination.');
        if (a.change === 'home') why.push('A mortgage is the largest debt most people carry; make sure it is covered by term or mortgage insurance that pays the lender off.');
        if (a.change === 'job') why.push('Group cover ends with the job; check whether your hospital and life cover now depend on a policy you own.');
        if (a.last === 'long') why.push('Policies more than three years old often have outdated nominations, lapsed riders or premiums paid from a closed account.');
        if (a.claim === 'yes') why.push('Notify the insurer as soon as possible; most policies set a window for notice. Keep every receipt, report and discharge summary.');
        if (why.length === 0) why.push('Recently reviewed with nothing major changed: a quick annual check of premiums, nominations and the beneficiaries’ details is enough.');
        return {
          label: 'Pointer',
          verdict: a.claim === 'yes' ? 'Notify the insurer first, then review' : urgency >= 3 ? 'Review now' : urgency >= 1 ? 'Review this quarter' : 'An annual check is enough',
          why,
          next: [tool('insurance', 'Re-run the needs estimate with the change included.'), guide('family-changes-and-reviews', 'Nominations to update after each life event.'), official('moneysense', 'How to read a policy and make a claim.')],
          fine: 'General practice; each policy’s notice periods and claim rules are in its terms.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'Something happens: hospital stay, accident, death',
      question: 'Within the policy’s notice window?',
      yes: 'Notify the insurer, gather documents, submit the claim',
      no: 'Notify anyway, explain the delay, ask about late-notice rules',
      yesThen: 'Claim assessed; keep copies of everything',
      noThen: 'Some insurers accept late claims with a reason',
      caption: 'The claim clock starts at the event, not when you find the policy. Notice first, documents second.',
      aria: 'Flowchart: after an event, notify the insurer within the notice window and submit documents; if late, notify anyway and explain.',
    },
  },
};
