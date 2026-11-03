import type { IconName } from '@/components/ui/Icon';

/**
 * The home page's quick-start chips. Each opens a small hub listing the guides and
 * calculators or tools most relevant to that intent, so the reader picks their own way in.
 */
export interface Intent {
  id: string;
  /** The chip's text on the home page, and the hub's heading. */
  label: string;
  icon: IconName;
  /** One line under the hub's heading. */
  lede: string;
  /** Guide ids, most useful first. */
  guides: string[];
  /** Calculator or tool ids. */
  tools: string[];
  /** Where to browse the rest of the topic. */
  browse: { label: string; to: string };
}

export const INTENTS: Intent[] = [
  {
    id: 'finances',
    label: 'Plan my finances',
    icon: 'wallet',
    lede: 'Get a clear monthly picture, then build the buffer and clear what costs most.',
    guides: ['build-a-budget', 'emergency-fund', 'pay-down-debt'],
    tools: ['budget', 'emergency-debt'],
    browse: { label: 'All money guides', to: '/guides?category=money' },
  },
  {
    id: 'home',
    label: 'Buy a home',
    icon: 'home',
    lede: 'Work out what you can afford, choose a route, and plan the move.',
    guides: ['home-affordability-and-loans', 'hdb-bto-vs-resale', 'renting-in-singapore', 'renovation-and-moving'],
    tools: ['housing'],
    browse: { label: 'All housing guides', to: '/guides?category=housing' },
  },
  {
    id: 'baby',
    label: 'Prepare for a baby',
    icon: 'baby',
    lede: 'From pregnancy to the first year, and the budget that goes with it.',
    guides: ['preparing-for-pregnancy', 'newborn-first-year', 'childcare-and-preschool'],
    tools: ['baby'],
    browse: { label: 'All parenting guides', to: '/guides?category=parenting' },
  },
  {
    id: 'parents',
    label: 'Support my parents',
    icon: 'heart-handshake',
    lede: 'Plan care with the family, cost it, and see what support exists.',
    guides: ['caregiving-plan', 'eldercare-costs-and-support', 'hiring-a-helper', 'lasting-power-of-attorney'],
    tools: ['caregiving'],
    browse: { label: 'All guides on ageing parents', to: '/guides?category=parents' },
  },
  {
    id: 'retirement',
    label: 'Plan my retirement',
    icon: 'sunrise',
    lede: 'See what CPF LIFE will pay, size the gap, and grow savings for the rest.',
    guides: ['retirement-income-cpf-life', 'cpf-basics', 'start-investing'],
    tools: ['retirement'],
    browse: { label: 'All CPF and retirement guides', to: '/guides?category=cpf-tax-retirement' },
  },
  {
    id: 'admin',
    label: 'Sort out my life admin',
    icon: 'calendar-check',
    lede: 'One yearly sweep of documents, renewals, tax and contracts.',
    guides: ['annual-life-admin', 'document-renewals', 'tax-filing-prep'],
    tools: ['annual-admin', 'tax-prep'],
    browse: { label: 'All guides', to: '/guides' },
  },
];

export const INTENT_MAP: Record<string, Intent> = Object.fromEntries(INTENTS.map((i) => [i.id, i]));
