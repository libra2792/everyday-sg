export type CategoryId =
  | 'money'
  | 'housing'
  | 'parenting'
  | 'parents'
  | 'insurance'
  | 'cpf-tax-retirement'
  | 'careers'
  | 'marriage'
  | 'legal'
  | 'transport'
  | 'digital'
  | 'wellbeing';

export type LifeStageId = 'starting-out' | 'building' | 'family' | 'midlife' | 'later-life';

export type CalculatorId = 'budget' | 'emergency-debt' | 'housing' | 'baby' | 'retirement' | 'insurance' | 'caregiving' | 'car';

export type ToolId = 'tax-prep' | 'annual-admin';

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  topics: string[];
  icon: string; // lucide icon name, resolved in the UI
}

export interface LifeStage {
  id: LifeStageId;
  name: string;
  description: string;
  categories: CategoryId[];
}

/** How a source entry was checked during content preparation. */
export type SourceCheck = 'content' | 'link' | 'unchecked';

export interface Source {
  id: string;
  agency: string;
  title: string;
  url: string;
  /** 'content' = the page was opened and read; 'link' = the URL was confirmed to exist; 'unchecked' = not auto-checked. */
  check: SourceCheck;
  checkedOn?: string; // ISO date, only present when actually checked
  note?: string;
}

export interface GuideStep {
  title: string;
  detail: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  essential: boolean;
  /** Optional grouping label, e.g. "Pregnancy", "Birth", "First year" */
  group?: string;
}

export interface Guide {
  id: string;
  categoryId: CategoryId;
  title: string;
  /** One line, shown on cards and under the title. */
  summary: string;
  /** Line icon name used on cards and the guide header. */
  icon: string;
  lifeStages: LifeStageId[];
  tags: string[];
  /** Does the guide describe rules that change (official) or evergreen practice (general)? */
  infoType: 'official' | 'general';
  /** Date the guide's official references were checked, if they were. */
  reviewedOn?: string;
  /** "What this means" — 3 to 4 short bullets. */
  keyPoints: string[];
  /** "Who it's for" — short bullets. */
  whoFor: string[];
  /** "When to act" — short bullets. */
  when: string[];
  /** Recommended sequence — short title and a one-line detail. */
  steps: GuideStep[];
  /** Documents or information to prepare — short chips. */
  prepare: string[];
  /** Costs or decisions to consider — short bullets. */
  costs?: string[];
  /** Common mistakes and tips — short bullets. */
  watchOuts: string[];
  /** Eligibility considerations — short bullets. */
  eligibility?: string[];
  officialLinks: string[]; // Source ids
  relatedCalculators: (CalculatorId | ToolId)[];
  relatedGuides: string[];
  checklist: ChecklistItem[];
  estimatedMinutes?: number;
}

export interface CalculatorMeta {
  id: CalculatorId | ToolId;
  kind: 'calculator' | 'tool';
  name: string;
  shortName: string;
  description: string;
  categoryId: CategoryId;
  path: string;
  icon: string;
  popular?: boolean;
  tags: string[];
}

/* ---------------------------------------------------------------------- */
/* Quick checks ("Your situation") and figures shown on guide pages        */
/* ---------------------------------------------------------------------- */

export interface QuickFieldChoice {
  id: string;
  label: string;
  type: 'choice';
  options: { value: string; label: string }[];
  default: string;
}

export interface QuickFieldMoney {
  id: string;
  label: string;
  type: 'money';
  default?: number;
  help?: string;
  /** Key into BENCHMARKS, shown as an indicative figure with a "Use" button. */
  benchmark?: string;
}

export interface QuickFieldNumber {
  id: string;
  label: string;
  type: 'number';
  suffix?: string;
  default?: number;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  benchmark?: string;
}

export type QuickField = QuickFieldChoice | QuickFieldMoney | QuickFieldNumber;

/** Raw answers: choices as strings, numbers as numbers (undefined when blank). */
export type QuickAnswers = Record<string, string | number | undefined>;

export interface QuickNext {
  kind: 'tool' | 'guide' | 'official';
  /** Calculator/tool id, guide id, or source id depending on kind. */
  id: string;
  note?: string;
  /** Query parameters handed to the calculator so it opens pre-filled. */
  prefill?: Record<string, number>;
}

export interface QuickResult {
  /** Small label above the verdict, e.g. "Direction", "Pointer", "Target". */
  label: string;
  verdict: string;
  why: string[];
  next: QuickNext[];
  stats?: { label: string; value: string }[];
  /** The honest limits of the pointer, shown in small print. */
  fine: string;
  /** A figure drawn from the answers; replaces the guide's static figure. */
  figure?: FigureSpec;
}

export interface QuickCheck {
  intro: string;
  fields: QuickField[];
  evaluate: (answers: QuickAnswers) => QuickResult;
}

export type FigureSpec =
  | {
      type: 'timeline';
      lanes: { label: string; nodes: string[]; wait?: { from: number; to: number; label: string } }[];
      caption: string;
      aria: string;
    }
  | {
      type: 'gauge';
      blocks: number;
      filled: number;
      title: string;
      right?: string;
      foot?: string;
      caption: string;
      aria: string;
    }
  | {
      type: 'band';
      max: number;
      unit: 'sgd' | 'months' | 'pct' | 'number';
      bars: { label: string; value: number; strong?: boolean }[];
      marker?: { value: number; label: string };
      ticks?: { value: number; label: string; anchor?: 'start' | 'middle' | 'end' }[];
      caption: string;
      aria: string;
    }
  | {
      type: 'stack';
      title: string;
      unit: 'sgd' | 'pct' | 'months' | 'number';
      segments: { label: string; value: number; muted?: boolean }[];
      marker?: { value: number; label: string };
      caption: string;
      aria: string;
    }
  | {
      type: 'flow';
      start: string;
      question: string;
      yes: string;
      no: string;
      yesThen?: string;
      noThen?: string;
      caption: string;
      aria: string;
    }
  | {
      type: 'compare';
      options: [string, string];
      rows: { label: string; a: 0 | 1 | 2 | 3; b: 0 | 1 | 2 | 3; note?: string }[];
      caption: string;
      aria: string;
    };

export interface GuideExtras {
  quick: QuickCheck;
  figure: FigureSpec;
}
