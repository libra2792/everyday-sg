import { CALCULATOR_MAP } from '@/data/calculators';
import { GUIDE_MAP } from '@/data/guides';
import type { ChecklistProgress, Profile } from '@/state/AppState';

export interface Recommendation {
  type: 'guide' | 'calculator' | 'tool';
  id: string;
  title: string;
  description: string;
  path: string;
  reason: string;
  /** Lower sorts first */
  priority: number;
}

interface Rule {
  when: (p: Profile) => boolean;
  reason: string;
  guides?: string[];
  calculators?: string[];
  priority?: number;
}

const RULES: Rule[] = [
  // Priorities — strongest signal
  { when: (p) => p.priorities.includes('budget'), reason: 'You said getting your budget under control is a priority', guides: ['build-a-budget', 'subscriptions-and-bills'], calculators: ['budget'], priority: 1 },
  { when: (p) => p.priorities.includes('debt'), reason: 'You want to clear debt or build savings', guides: ['emergency-fund', 'pay-down-debt'], calculators: ['emergency-debt'], priority: 1 },
  { when: (p) => p.priorities.includes('home'), reason: 'You are planning to buy or rent a home', guides: ['home-affordability-and-loans', 'hdb-bto-vs-resale', 'renting-in-singapore'], calculators: ['housing'], priority: 1 },
  { when: (p) => p.priorities.includes('baby'), reason: 'You are preparing for a baby', guides: ['preparing-for-pregnancy', 'newborn-first-year', 'childcare-and-preschool'], calculators: ['baby'], priority: 1 },
  { when: (p) => p.priorities.includes('parents'), reason: 'You are supporting your parents', guides: ['caregiving-plan', 'eldercare-costs-and-support'], calculators: ['caregiving'], priority: 1 },
  { when: (p) => p.priorities.includes('insurance'), reason: 'You want to sort out insurance', guides: ['insurance-basics', 'review-coverage-and-claims'], calculators: ['insurance'], priority: 1 },
  { when: (p) => p.priorities.includes('retirement'), reason: 'You are planning for retirement', guides: ['retirement-income-cpf-life', 'cpf-basics'], calculators: ['retirement'], priority: 1 },
  { when: (p) => p.priorities.includes('career'), reason: 'You are thinking about a job change or upskilling', guides: ['changing-jobs', 'upskilling-skillsfuture'], priority: 1 },
  { when: (p) => p.priorities.includes('estate'), reason: 'You want wills, LPA and nominations in place', guides: ['make-a-will', 'lasting-power-of-attorney', 'advance-care-planning'], priority: 1 },
  { when: (p) => p.priorities.includes('admin'), reason: 'You want to sort out your life admin', guides: ['annual-life-admin', 'document-renewals'], calculators: ['annual-admin'], priority: 1 },

  // Household
  { when: (p) => p.household.includes('supporting-parents'), reason: 'You support ageing parents', guides: ['caregiving-plan', 'hiring-a-helper'], calculators: ['caregiving'], priority: 2 },
  { when: (p) => p.household.includes('parent'), reason: 'You have children', guides: ['childcare-and-preschool', 'family-changes-and-reviews', 'make-a-will'], calculators: ['baby', 'insurance'], priority: 2 },
  { when: (p) => p.household.includes('married') || p.household.includes('partnered'), reason: 'You share finances with a partner', guides: ['shared-finances', 'family-changes-and-reviews'], priority: 3 },
  { when: (p) => p.household.includes('single'), reason: 'Foundations that matter when it is just you', guides: ['emergency-fund', 'insurance-basics'], priority: 3 },

  // Housing
  { when: (p) => p.housing === 'planning-to-buy', reason: 'You are planning to buy', guides: ['hdb-bto-vs-resale', 'home-affordability-and-loans'], calculators: ['housing'], priority: 2 },
  { when: (p) => p.housing === 'renting', reason: 'You are renting', guides: ['renting-in-singapore'], priority: 3 },
  { when: (p) => p.housing === 'hdb-owner' || p.housing === 'private-owner', reason: 'You own your home', guides: ['renovation-and-moving', 'annual-life-admin'], priority: 3 },

  // Employment
  { when: (p) => p.employment === 'self-employed', reason: 'You are self-employed', guides: ['freelance-variable-income', 'tax-filing-prep'], calculators: ['tax-prep'], priority: 2 },
  { when: (p) => p.employment === 'between-jobs', reason: 'You are between jobs', guides: ['retrenchment-and-job-loss', 'emergency-fund'], calculators: ['emergency-debt'], priority: 1 },
  { when: (p) => p.employment === 'retired', reason: 'You are retired', guides: ['retirement-income-cpf-life', 'advance-care-planning', 'healthcare-navigation'], priority: 2 },
  { when: (p) => p.employment === 'studying', reason: 'You are studying', guides: ['build-a-budget', 'account-security'], calculators: ['budget'], priority: 3 },
  { when: (p) => p.employment === 'employed', reason: 'Annual essentials for employees', guides: ['tax-filing-prep', 'cpf-basics'], priority: 4 },

  // Age
  { when: (p) => p.ageRange === '18-24', reason: 'Good foundations in your twenties', guides: ['build-a-budget', 'emergency-fund', 'account-security'], priority: 3 },
  { when: (p) => p.ageRange === '25-34', reason: 'Common decisions in this decade', guides: ['insurance-basics', 'home-affordability-and-loans'], priority: 3 },
  { when: (p) => p.ageRange === '35-44', reason: 'Mid-career review', guides: ['retirement-income-cpf-life', 'review-coverage-and-claims', 'make-a-will'], priority: 3 },
  { when: (p) => p.ageRange === '45-54', reason: 'Planning for the next stage', guides: ['retirement-income-cpf-life', 'caregiving-plan', 'lasting-power-of-attorney'], calculators: ['retirement'], priority: 3 },
  { when: (p) => p.ageRange === '55-64' || p.ageRange === '65+', reason: 'Decisions around 55 and 65', guides: ['retirement-income-cpf-life', 'advance-care-planning', 'healthcare-navigation'], calculators: ['retirement'], priority: 2 },

  // Horizon
  { when: (p) => p.horizon === 'next-3-months', reason: 'Quick wins for the next few months', guides: ['subscriptions-and-bills', 'scam-protection'], priority: 4 },
];

const ALWAYS: Omit<Recommendation, 'priority'>[] = [
  { type: 'tool', id: 'annual-admin', title: 'Annual life-admin checklist', description: 'A yearly review of finances, insurance, CPF, tax, documents, health, security and contracts.', path: '/tools/annual-admin', reason: 'Worth running once a year, whatever your situation' },
];

/** Shown before a profile exists: the foundations that apply to almost everyone. */
const NO_PROFILE_DEFAULTS: { type: 'guide' | 'calculator'; id: string; reason: string }[] = [
  { type: 'guide', id: 'build-a-budget', reason: 'A good first step for almost everyone' },
  { type: 'calculator', id: 'budget', reason: 'See your monthly surplus and savings rate in a few minutes' },
  { type: 'guide', id: 'emergency-fund', reason: 'The buffer that makes every other plan safer' },
  { type: 'guide', id: 'insurance-basics', reason: 'Know which risks you are actually covered for' },
];

function guideComplete(guideId: string, progress: ChecklistProgress): boolean {
  const g = GUIDE_MAP[guideId];
  if (!g) return false;
  const essentials = g.checklist.filter((c) => c.essential);
  if (essentials.length === 0) return false;
  const list = progress[guideId] || {};
  return essentials.every((c) => list[c.id]);
}

/**
 * Build a ranked list of recommendations from the profile and checklist progress.
 * Completed guides (all essential items ticked) are excluded.
 */
export function recommend(profile: Profile | null, progress: ChecklistProgress, limit = 6): Recommendation[] {
  const out = new Map<string, Recommendation>();
  const push = (rec: Recommendation) => {
    const key = `${rec.type}:${rec.id}`;
    const existing = out.get(key);
    if (!existing || existing.priority > rec.priority) out.set(key, rec);
  };

  if (profile) {
    for (const rule of RULES) {
      if (!rule.when(profile)) continue;
      const priority = rule.priority ?? 3;
      for (const id of rule.guides || []) {
        const g = GUIDE_MAP[id];
        if (!g || guideComplete(id, progress)) continue;
        push({ type: 'guide', id, title: g.title, description: g.summary, path: `/guides/${id}`, reason: rule.reason, priority });
      }
      for (const id of rule.calculators || []) {
        const c = CALCULATOR_MAP[id];
        if (!c) continue;
        push({ type: c.kind, id, title: c.name, description: c.description, path: c.path, reason: rule.reason, priority: priority + 0.5 });
      }
    }
  }
  if (!profile) {
    for (const d of NO_PROFILE_DEFAULTS) {
      if (d.type === 'guide') {
        const g = GUIDE_MAP[d.id];
        if (!g || guideComplete(d.id, progress)) continue;
        push({ type: 'guide', id: d.id, title: g.title, description: g.summary, path: `/guides/${d.id}`, reason: d.reason, priority: 5 });
      } else {
        const c = CALCULATOR_MAP[d.id];
        if (!c) continue;
        push({ type: c.kind, id: d.id, title: c.name, description: c.description, path: c.path, reason: d.reason, priority: 5.5 });
      }
    }
  }
  for (const a of ALWAYS) push({ ...a, priority: 9 });

  return [...out.values()].sort((a, b) => a.priority - b.priority).slice(0, limit);
}
