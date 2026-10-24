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
  summary: string;
  lifeStages: LifeStageId[];
  tags: string[];
  /** Does the guide describe rules that change (official) or evergreen practice (general)? */
  infoType: 'official' | 'general';
  /** Date the guide's official references were checked, if they were. */
  reviewedOn?: string;
  plainEnglish: string[];
  whoShouldConsider: string[];
  whenToAct: string[];
  steps: GuideStep[];
  documents: string[];
  costsAndDecisions?: string[];
  mistakesAndTips: string[];
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
