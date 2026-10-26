import type { GuideExtras } from '../types';
import { guide, official, tool } from '@/lib/quick';

export const WELLBEING_EXTRAS: Record<string, GuideExtras> = {
  'healthcare-navigation': {
    quick: {
      intro: 'Where you go first decides how much you pay and how long you wait. Three answers point to the right door.',
      fields: [
        { id: 'situation', label: 'Right now', type: 'choice', options: [{ value: 'emergency', label: 'Possible emergency: chest pain, breathing trouble, severe injury' }, { value: 'urgent', label: 'Needs attention today' }, { value: 'routine', label: 'Routine or a check-up' }, { value: 'chronic', label: 'Ongoing condition or follow-up' }], default: 'routine' },
        { id: 'subsidised', label: 'Want the subsidised route?', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'Speed matters more' }], default: 'yes' },
        { id: 'gp', label: 'Have a regular GP or Healthier SG enrolment', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], default: 'no' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.situation === 'emergency') why.push('Call 995 or go to the nearest Emergency Department now. Cost is not the question in an emergency; the bill is settled later and subsidies apply.');
        else if (a.situation === 'urgent') why.push(a.subsidised === 'yes' ? 'A polyclinic (same-day appointments through the app) or a CHAS GP clinic for subsidised care; the Emergency Department is for emergencies and charges a flat attendance fee.' : 'A GP clinic sees you fastest; a Urgent Care Centre handles things between a GP and an emergency.');
        else if (a.situation === 'routine') why.push(a.gp === 'yes' ? 'Your regular GP or Healthier SG clinic is the right door; enrolment adds free screenings and vaccinations under the national plan.' : 'Enrol with one GP under Healthier SG so your records, screenings and follow-ups sit in one place.');
        else why.push('For a chronic condition, a polyclinic or a CHAS GP keeps care subsidised; a polyclinic referral to a specialist outpatient clinic keeps the subsidy, a private referral does not.');
        if (a.subsidised === 'yes' && a.situation !== 'emergency') why.push('The subsidy follows the route: polyclinic referral to a public specialist clinic is subsidised; walking into the same clinic privately is not.');
        why.push('MediSave covers set outpatient treatments and chronic disease management within limits; the clinic will tell you what can be charged to it.');
        return {
          label: 'Direction',
          verdict: a.situation === 'emergency' ? 'Call 995 or go to A&E now' : a.situation === 'urgent' ? 'Polyclinic or GP today' : a.gp === 'yes' ? 'Your regular GP' : 'Enrol with a GP first',
          why,
          next: [official('moh-affordable', 'Subsidies, MediSave and the routes that keep care affordable.'), guide('health-insurance-sg', 'How a hospital bill gets paid.'), official('healthiersg-enrol', 'Enrol with a Healthier SG clinic.')],
          fine: 'General routing, not medical advice. In any emergency, call 995.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'Feeling unwell',
      question: 'Life-threatening?',
      yes: 'Call 995 or go to the Emergency Department',
      no: 'GP or polyclinic first',
      yesThen: 'Bills settled after; subsidies still apply',
      noThen: 'A polyclinic referral keeps specialist care subsidised',
      caption: 'The first door decides the cost of everything after it. Emergencies go straight in; everything else starts at primary care.',
      aria: 'Flowchart: life-threatening cases go to 995 or the Emergency Department; others start at a GP or polyclinic, whose referral keeps specialist care subsidised.',
    },
  },

  'mental-health-support': {
    quick: {
      intro: 'Three answers point to the right kind of help, from a conversation today to ongoing care.',
      fields: [
        { id: 'what', label: 'What fits best', type: 'choice', options: [{ value: 'crisis', label: 'I or someone else may be in danger right now' }, { value: 'weeks', label: 'Low, anxious or not coping for weeks' }, { value: 'support', label: 'Supporting someone else' }, { value: 'curious', label: 'Want to understand the options' }], default: 'weeks' },
        { id: 'seen', label: 'Spoken to a professional before', type: 'choice', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }], default: 'no' },
        { id: 'cost', label: 'Cost is a concern', type: 'choice', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], default: 'yes' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.what === 'crisis') why.push('If anyone is in immediate danger, call 995. For a crisis conversation at any hour, the 24-hour helplines in the official links below answer; you do not need to explain everything to start.');
        if (a.what === 'weeks') why.push(a.seen === 'no' ? 'A GP or polyclinic is a sensible first visit: they can assess, treat common conditions and refer onward. mindline.sg has self-help tools and a chat service if talking in person feels too big a step.' : 'Go back to the professional you saw, or ask your GP for a referral if you want a different kind of support.');
        if (a.what === 'support') why.push('Caregivers burn out quietly. Look for caregiver support groups and respite, and keep your own GP in the loop; you cannot pour from an empty cup.');
        if (a.what === 'curious') why.push('Options run from self-help and peer support, through GPs and polyclinics, to community mental health teams and specialist clinics. Starting low and stepping up is normal.');
        if (a.cost === 'yes') why.push('Polyclinic and public hospital psychiatric care are subsidised; MediSave can be used for approved outpatient treatment of some conditions, and community services are often free.');
        return {
          label: 'Direction',
          verdict: a.what === 'crisis' ? 'Reach a helpline or 995 now' : a.what === 'support' ? 'Support for the supporter too' : a.seen === 'no' ? 'Start with a GP or mindline.sg' : 'Go back, or ask for a referral',
          why,
          next: [official('mindline', '24-hour chat, self-help tools and where to get help.'), official('healthhub-mental', 'Services and helplines, by situation.'), guide('healthcare-navigation', 'Subsidised routes to care.')],
          fine: 'Information about where to find help, not clinical advice. If you are in danger, call 995.',
        };
      },
    },
    figure: {
      type: 'flow',
      start: 'Not coping',
      question: 'Immediate danger to you or someone else?',
      yes: 'Call 995, or a 24-hour helpline to talk now',
      no: 'GP or polyclinic, or mindline.sg to start',
      yesThen: 'Stay with the person until help arrives',
      noThen: 'Referral onward if more support is needed',
      caption: 'The first step is smaller than it feels: a conversation with a helpline, a GP or an online service. Everything else can follow from there.',
      aria: 'Flowchart: in immediate danger call 995 or a 24-hour helpline; otherwise start with a GP, polyclinic or mindline.sg and step up if needed.',
    },
  },

  'annual-life-admin': {
    quick: {
      intro: 'One yearly review keeps everything else current. Three answers pick where to start this year.',
      fields: [
        { id: 'last', label: 'Last full review', type: 'choice', options: [{ value: 'year', label: 'This year' }, { value: 'old', label: 'Last year or earlier' }, { value: 'never', label: 'Never' }], default: 'never' },
        { id: 'change', label: 'Big change this year', type: 'choice', options: [{ value: 'none', label: 'None' }, { value: 'family', label: 'Family: marriage, child, loss' }, { value: 'money', label: 'Money: home, job, income' }], default: 'none' },
        { id: 'month', label: 'It is currently', type: 'choice', options: [{ value: 'q1', label: 'January to March' }, { value: 'q2', label: 'April to June' }, { value: 'q3', label: 'July to September' }, { value: 'q4', label: 'October to December' }], default: 'q4' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.month === 'q1') why.push('First quarter: gather tax documents and reliefs before filing opens on 1 March; check CPF contributions landed all year.');
        if (a.month === 'q2') why.push('Second quarter: file tax by 18 April, then the mid-year insurance review while the Notice of Assessment arrives.');
        if (a.month === 'q3') why.push('Third quarter: nominations, will and LPA check; retirement projection with this year’s numbers.');
        if (a.month === 'q4') why.push('Fourth quarter: subscriptions and renewals audit, document expiries, and the budget for next year.');
        if (a.change === 'family') why.push('A family change moves nominations and the will to the top of the list, whatever the quarter.');
        if (a.change === 'money') why.push('A money change (new home, new job, income shift) means re-running the budget, the insurance need and the emergency fund target.');
        if (a.last === 'never') why.push('First time: do the whole list once, badly if necessary. The second year takes a quarter of the time.');
        return {
          label: 'Direction',
          verdict: a.change !== 'none' ? 'Start with what changed' : a.last === 'never' ? 'Do the full list once' : 'This quarter’s items',
          why,
          next: [tool('annual-admin', 'The yearly checklist, saved in this browser.'), tool('tax-prep', 'The tax documents checklist.'), guide('review-coverage-and-claims', 'The insurance review.')],
          fine: 'A rhythm, not a rule. Dates for tax filing are IRAS’s; the rest is whenever you can.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'The year', nodes: ['Jan to Feb: tax documents', 'Mar to Apr: file tax', 'Jun: insurance review', 'Sep: nominations, will, retirement check', 'Dec: subscriptions, documents, next year’s budget'] }],
      caption: 'Spread across the year, each piece of admin takes an hour. Left for one weekend, it never happens.',
      aria: 'Yearly timeline of admin tasks from tax documents in January to the budget in December.',
    },
  },

  'moving-checklist': {
    quick: {
      intro: 'The move date sets the clock. Three answers list what to do this week.',
      fields: [
        { id: 'when', label: 'Moving in', type: 'choice', options: [{ value: 'soon', label: 'Less than 2 weeks' }, { value: 'mid', label: '2 to 8 weeks' }, { value: 'far', label: 'More than 2 months' }], default: 'mid' },
        { id: 'from', label: 'Moving from', type: 'choice', options: [{ value: 'parents', label: 'Family home' }, { value: 'rental', label: 'A rental' }, { value: 'own', label: 'A home you own' }], default: 'parents' },
        { id: 'extra', label: 'Moving with', type: 'choice', options: [{ value: 'none', label: 'Just us' }, { value: 'kids', label: 'Children' }, { value: 'pets', label: 'Pets' }], default: 'none' },
      ],
      evaluate: (a) => {
        const why: string[] = [];
        if (a.when === 'far') why.push('Now: declutter, measure the new place, get three mover quotes, and plan any renovation so it finishes before the move.');
        if (a.when === 'mid') why.push('Now: book the movers, give notice on utilities and broadband, start packing the rooms you use least, and list every address to change.');
        if (a.when === 'soon') why.push('This week: confirm the movers and lift booking, pack an essentials box for the first night, and set up utilities at the new place so the lights work on day one.');
        if (a.from === 'rental') why.push('Rental: give notice per the tenancy, photograph the flat before handing back, and agree the deposit return in writing.');
        if (a.from === 'own') why.push('Selling or renting out the old place runs on its own timeline; separate the two moves on paper.');
        if (a.extra === 'kids') why.push('Children: school or childcare transfers take longer than the move; start them first.');
        if (a.extra === 'pets') why.push('Pets: a licence update and a quiet room on moving day; many movers will not transport animals.');
        why.push('After the move, report the change of address to ICA within 28 days; most other records (banks, insurers, CPF, IRAS) read from it or need their own update.');
        return {
          label: 'Direction',
          verdict: a.when === 'soon' ? 'Confirm movers, pack essentials, set up utilities' : a.when === 'mid' ? 'Book, notify, start packing' : 'Declutter, measure, get quotes',
          why,
          next: [official('ica-address', 'Report a change of address within 28 days.'), tool('budget', 'Moving costs in the month’s budget.'), guide('renovation-and-moving', 'If works happen before the move.')],
          fine: 'General sequencing; ICA sets the address-reporting deadline and your tenancy sets the notice rules.',
        };
      },
    },
    figure: {
      type: 'timeline',
      lanes: [{ label: 'The move', nodes: ['8 weeks: declutter, quotes', '4 weeks: book, notify', '1 week: pack, essentials box', 'Moving day', 'Within 28 days: address with ICA'], wait: { from: 3, to: 4, label: 'legal deadline' } }],
      caption: 'Counting back from moving day. The one hard deadline sits after it: the address change with ICA.',
      aria: 'Timeline from eight weeks before a move to the ICA address update within 28 days after.',
    },
  },
};
