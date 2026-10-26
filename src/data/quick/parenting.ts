import type { GuideExtras } from '../types';
import { guide, num, official, sgd, tool } from '@/lib/quick';

export const PARENTING_EXTRAS: Record<string, GuideExtras> = {
  'preparing-for-pregnancy': {
    quick: {
      intro: 'Where you plan to deliver and what cover is already in place decide most of the out-of-pocket bill. Three answers set the plan.',
      fields: [
        { id: 'where', label: 'Planned delivery', type: 'choice', options: [{ value: 'public-sub', label: 'Public hospital, subsidised ward' }, { value: 'public-pri', label: 'Public hospital, A or B1 ward' }, { value: 'private', label: 'Private hospital' }], default: 'public-sub' },
        { id: 'cover', label: 'Maternity or hospital cover already in place?', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'Not yet' }, { value: 'unsure', label: 'Not sure' }], default: 'unsure' },
        { id: 'weeks', label: 'Weeks pregnant', type: 'number', suffix: 'weeks', min: 0, max: 42 },
        { id: 'save', label: 'Set aside for delivery so far', type: 'money' },
      ],
      evaluate: (a) => {
        const weeks = num(a.weeks);
        const save = num(a.save);
        const est = a.where === 'private' ? 8000 : a.where === 'public-pri' ? 4000 : 1500;
        const why = [
          a.where === 'public-sub'
            ? 'Subsidised public wards usually leave a few hundred to about S$2,000 out of pocket after MediSave; S$1,500 is used as the planning figure here.'
            : a.where === 'public-pri'
              ? 'A or B1 wards in public hospitals are unsubsidised; plan for roughly S$3,000 to 5,000 after MediSave. Ask the hospital for its package estimate.'
              : 'Private delivery commonly runs S$5,000 to 10,000 or more after MediSave; S$8,000 is the planning figure here. Get the package quote in writing.',
        ];
        if (a.cover === 'no' || a.cover === 'unsure') why.push('Most hospital plans exclude a pregnancy that has already started; maternity riders need to be bought early. Check what you have before relying on it.');
        else why.push('Confirm what the policy pays for delivery, complications and the newborn, and the waiting period.');
        if (weeks > 0 && weeks < 20) why.push('Before 20 weeks: book antenatal care, settle the hospital choice and check leave entitlements with your employers.');
        else if (weeks >= 20) why.push(`At ${weeks} weeks: confirm the MediSave Maternity Package use, pre-register at the hospital, and line up the birth registration (within 42 days of birth).`);
        if (save > 0) why.push(save >= est ? `You have set aside ${sgd(save)}, at or above the planning figure.` : `You have ${sgd(save)} of about ${sgd(est)}; ${sgd(est - save)} to go.`);
        return {
          label: 'Pointer',
          verdict: `Plan for about ${sgd(est)} out of pocket`,
          stats: [{ label: 'Planning figure', value: sgd(est) }, { label: 'Set aside', value: sgd(save) }],
          why,
          next: [
            tool('baby', 'Opens with this delivery estimate; add setup and monthly costs.', { delivery: est }),
            official('mom-maternity', 'Government-Paid Maternity Leave: who qualifies and how to apply.'),
            guide('newborn-first-year', 'The admin that starts the day after.'),
          ],
          fine: 'Delivery figures are planning guides, not quotes. MediSave withdrawal limits and leave rules are set by CPF Board and MOM.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [
        { label: 'Before', nodes: ['Pregnancy confirmed', 'Antenatal care booked', 'Insurance and MediSave checked', 'Hospital pre-registered', 'Delivery'] },
        { label: 'After', nodes: ['Delivery', 'Birth registered (42 days)', 'Leave applications', 'Baby Bonus and CDA', 'First vaccinations'], wait: { from: 0, to: 1, label: 'register within 42 days' } },
      ],
      caption: 'The admin runs on two clocks: what to settle before delivery, and what starts the day after. Birth registration has a legal deadline of 42 days.',
      aria: 'Two timelines of pregnancy admin: before delivery and after, with birth registration due within 42 days.',
    },
  },

  'newborn-first-year': {
    quick: {
      intro: 'Tick what is already done and the list shrinks to what is left, in the order the deadlines fall.',
      fields: [
        { id: 'age', label: 'Your baby is', type: 'choice', options: [{ value: 'soon', label: 'Not born yet' }, { value: 'new', label: '0 to 6 weeks' }, { value: 'older', label: '2 to 12 months' }], default: 'new' },
        { id: 'reg', label: 'Birth registered', type: 'choice', options: [{ value: 'yes', label: 'Done' }, { value: 'no', label: 'Not yet' }], default: 'no' },
        { id: 'cda', label: 'Baby Bonus and CDA', type: 'choice', options: [{ value: 'yes', label: 'Done' }, { value: 'no', label: 'Not yet' }], default: 'no' },
        { id: 'ins', label: 'Baby added to insurance', type: 'choice', options: [{ value: 'yes', label: 'Done' }, { value: 'no', label: 'Not yet' }], default: 'no' },
        { id: 'care', label: 'Childcare or caregiver plan', type: 'choice', options: [{ value: 'yes', label: 'Settled' }, { value: 'no', label: 'Not yet' }], default: 'no' },
      ],
      evaluate: (a) => {
        const todo: string[] = [];
        if (a.reg === 'no') todo.push(a.age === 'soon' ? 'Register the birth within 42 days; most hospitals let you do it before discharge.' : 'Register the birth now if the 42-day window is still open; everything else keys off the birth certificate.');
        if (a.cda === 'no') todo.push('Enrol for Baby Bonus and open the Child Development Account; the cash gift and matching are paid into it.');
        if (a.ins === 'no') todo.push('Add the baby to hospital cover; MediShield Life covers citizens from birth, and insurers set windows for adding a newborn without underwriting.');
        if (a.care === 'no') todo.push('Decide on infant care, a helper or family care early; infant care places have waiting lists, so apply months ahead.');
        const vacc = 'Keep to the National Childhood Immunisation Schedule; the polyclinic or paediatrician tracks the dates.';
        const why = todo.length ? todo : ['Everything on the first-year list is done. Keep the vaccination dates and the childcare application in your calendar.'];
        if (todo.length) why.push(vacc);
        return {
          label: 'Pointer',
          verdict: todo.length === 0 ? 'All settled for now' : `${todo.length} thing${todo.length > 1 ? 's' : ''} to do next`,
          why,
          next: [official('lifesg-baby-bonus', 'Enrol for Baby Bonus and the CDA.'), tool('baby', 'Budget the first year and compare childcare options.'), guide('childcare-and-preschool', 'Choosing and paying for childcare.')],
          fine: 'Deadlines and amounts are set by ICA, MSF and the insurers; the official links have the current rules.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'Year one', nodes: ['Birth', 'Register (42 days)', 'Baby Bonus and CDA', 'Vaccinations', 'Childcare application', 'First birthday'], wait: { from: 0, to: 1, label: 'legal deadline' } }],
      caption: 'The only hard legal deadline is birth registration; the rest follow in order, with childcare applications earlier than most parents expect.',
      aria: 'Timeline of first-year admin from birth to first birthday.',
    },
  },

  'childcare-and-preschool': {
    quick: {
      intro: 'Enter the fee you have been quoted and your subsidy estimate to see the monthly cost against the Anchor Operator fee caps.',
      fields: [
        { id: 'type', label: 'Type of care', type: 'choice', options: [{ value: 'infant', label: 'Infant care (2 to 18 months)' }, { value: 'child', label: 'Childcare (18 months and up)' }], default: 'infant' },
        { id: 'fee', label: 'Monthly fee quoted', type: 'money', benchmark: 'infantCareCap' },
        { id: 'subsidy', label: 'Subsidy you expect', type: 'money', help: 'Basic Subsidy depends on whether the mother works; Additional Subsidy depends on household income. ECDA’s calculator gives your figure.' },
        { id: 'kids', label: 'Children in care', type: 'number', suffix: 'children', default: 1, min: 1, max: 5 },
      ],
      evaluate: (a) => {
        const fee = num(a.fee);
        const subsidy = num(a.subsidy);
        const kids = Math.max(1, Math.round(num(a.kids)));
        const cap = a.type === 'infant' ? 1235 : 610;
        const net = Math.max(0, fee - subsidy);
        const why: string[] = [];
        if (fee === 0) why.push('Enter the quoted monthly fee.');
        else {
          why.push(fee > cap ? `The quote is above the Anchor Operator cap of ${sgd(cap)} (excluding GST); the centre is probably not an Anchor Operator. Subsidies still apply if it is licensed.` : `The quote is within the Anchor Operator cap of ${sgd(cap)} (excluding GST).`);
          why.push(subsidy > 0 ? `After your subsidy estimate: ${sgd(net)} a month${kids > 1 ? `, ${sgd(net * kids)} for ${kids} children` : ''}, ${sgd(net * 12 * kids)} a year.` : 'Add your subsidy estimate; it changes the picture a lot.');
          why.push('GST and registration or deposit fees come on top; ask for the full fee schedule in writing.');
        }
        return {
          label: 'Pointer',
          verdict: fee === 0 ? 'Waiting for your numbers' : `About ${sgd(net * kids)} a month after subsidy`,
          stats: fee > 0 ? [{ label: 'Per child, after subsidy', value: sgd(net) }, { label: 'Per year, all children', value: sgd(net * 12 * kids) }] : undefined,
          why,
          next: [tool('baby', fee > 0 ? 'Opens with this fee and subsidy in the selected arrangement.' : 'Compare arrangements side by side.', fee > 0 ? { fee, subsidy, children: kids } : undefined), official('ecda-subsidies', 'Check the subsidy you qualify for.'), guide('newborn-first-year', 'When to apply and what to prepare.')],
          fine: 'Fee caps from ECDA (page updated Apr 2026). Subsidy amounts depend on your household; use ECDA’s calculator.',
          figure: {
            type: 'band',
            max: Math.max(2000, Math.ceil((fee * 1.1) / 500) * 500),
            unit: 'sgd',
            bars: [
              { label: 'Fee quoted', value: fee },
              { label: 'After your subsidy estimate', value: net, strong: true },
            ],
            ticks: [
              { value: 610, label: 'AOP childcare cap S$610', anchor: a.type === 'infant' ? 'end' : 'middle' },
              { value: 1235, label: 'AOP infant care cap S$1,235', anchor: 'middle' },
            ],
            caption: 'Your quote and what you would pay after subsidy, against the Anchor Operator monthly fee caps (ECDA, excluding GST).',
            aria: `Fee quoted ${sgd(fee)}, after subsidy ${sgd(net)}, against caps of S$610 and S$1,235.`,
          },
        };
      },
    },
    figure: {
      type: 'band',
      max: 2000,
      unit: 'sgd',
      bars: [
        { label: 'Fee quoted', value: 0 },
        { label: 'After your subsidy estimate', value: 0, strong: true },
      ],
      ticks: [
        { value: 610, label: 'AOP childcare cap S$610', anchor: 'end' },
        { value: 1235, label: 'AOP infant care cap S$1,235', anchor: 'middle' },
      ],
      caption: 'Enter a fee above. Triangles mark the Anchor Operator monthly fee caps (ECDA, excluding GST).',
      aria: 'Empty fee band with Anchor Operator cap markers.',
    },
  },
};
