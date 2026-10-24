import { CALCULATORS } from '@/data/calculators';
import { CATEGORY_MAP } from '@/data/categories';
import { GUIDES } from '@/data/guides';
import type { Guide } from '@/data/types';

export type SearchResultType = 'guide' | 'calculator' | 'tool';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  description: string;
  path: string;
  categoryName: string;
  score: number;
}

interface IndexEntry {
  result: Omit<SearchResult, 'score'>;
  title: string;
  tags: string;
  body: string;
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s$]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Common synonyms so that everyday phrasing finds the right guide. */
const SYNONYMS: Record<string, string[]> = {
  flat: ['hdb', 'home', 'housing'],
  house: ['home', 'housing'],
  condo: ['private property', 'housing', 'mortgage'],
  loan: ['mortgage', 'debt'],
  kid: ['child', 'baby', 'parenting'],
  kids: ['children', 'baby', 'parenting'],
  pregnant: ['pregnancy'],
  mum: ['mother', 'maternity'],
  dad: ['father', 'paternity'],
  elderly: ['ageing parents', 'eldercare', 'caregiving'],
  old: ['ageing', 'retirement'],
  pension: ['retirement', 'cpf life'],
  die: ['death', 'bereavement', 'will'],
  dies: ['death', 'bereavement'],
  died: ['death', 'bereavement'],
  lawyer: ['legal', 'will', 'lpa'],
  helper: ['domestic worker', 'caregiving'],
  maid: ['helper', 'domestic worker'],
  job: ['career', 'employment'],
  fired: ['retrenchment', 'job loss'],
  quit: ['resignation', 'changing jobs'],
  resign: ['resignation', 'changing jobs'],
  save: ['savings', 'emergency fund'],
  saving: ['savings'],
  spend: ['spending', 'budget'],
  money: ['budget', 'finances'],
  scam: ['scams', 'scamshield'],
  hack: ['security', 'account'],
  password: ['security'],
  car: ['vehicle', 'coe', 'transport'],
  doctor: ['healthcare', 'gp', 'polyclinic'],
  hospital: ['healthcare', 'medishield', 'insurance'],
  stress: ['mental health', 'support'],
  anxious: ['mental health'],
  taxes: ['tax'],
  iras: ['tax'],
  marry: ['marriage', 'wedding'],
  wedding: ['marriage'],
  divorce: ['separation', 'family changes'],
  rent: ['renting', 'tenancy'],
  move: ['moving'],
  reno: ['renovation'],
  invest: ['investing'],
  stocks: ['investing'],
  cpf: ['cpf'],
  srs: ['retirement', 'tax'],
  study: ['skillsfuture', 'upskilling'],
  course: ['skillsfuture', 'upskilling'],
};

function expand(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const t of tokens) {
    out.add(t);
    for (const s of SYNONYMS[t] || []) out.add(s);
  }
  return [...out];
}

function guideBody(g: Guide): string {
  return [
    ...g.plainEnglish,
    ...g.whoShouldConsider,
    ...g.whenToAct,
    ...g.steps.map((s) => `${s.title} ${s.detail}`),
    ...g.documents,
    ...(g.costsAndDecisions || []),
    ...g.mistakesAndTips,
    ...g.checklist.map((c) => c.text),
  ].join(' ');
}

let INDEX: IndexEntry[] | null = null;

function buildIndex(): IndexEntry[] {
  const entries: IndexEntry[] = [];
  for (const g of GUIDES) {
    entries.push({
      result: { type: 'guide', id: g.id, title: g.title, description: g.summary, path: `/guides/${g.id}`, categoryName: CATEGORY_MAP[g.categoryId]?.shortName ?? '' },
      title: normalise(g.title),
      tags: normalise([...g.tags, g.summary, CATEGORY_MAP[g.categoryId]?.name ?? ''].join(' ')),
      body: normalise(guideBody(g)),
    });
  }
  for (const c of CALCULATORS) {
    entries.push({
      result: { type: c.kind, id: c.id, title: c.name, description: c.description, path: c.path, categoryName: CATEGORY_MAP[c.categoryId]?.shortName ?? '' },
      title: normalise(c.name),
      tags: normalise([...c.tags, c.description].join(' ')),
      body: '',
    });
  }
  return entries;
}

/** Score-based search across guides, calculators and tools. Returns results sorted by relevance. */
export function search(query: string, limit = 12): SearchResult[] {
  const q = normalise(query);
  if (!q) return [];
  if (!INDEX) INDEX = buildIndex();
  const rawTokens = q.split(' ').filter((t) => t.length > 1);
  if (rawTokens.length === 0) return [];
  const tokens = expand(rawTokens);
  const results: SearchResult[] = [];
  for (const entry of INDEX) {
    let score = 0;
    if (entry.title.includes(q)) score += 12;
    for (const t of tokens) {
      const isRaw = rawTokens.includes(t);
      const weight = isRaw ? 1 : 0.6;
      if (entry.title.includes(t)) score += 5 * weight;
      if (entry.tags.includes(t)) score += 3 * weight;
      if (entry.body.includes(t)) score += 1 * weight;
    }
    if (score > 0) results.push({ ...entry.result, score });
  }
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return results.slice(0, limit);
}
