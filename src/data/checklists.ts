import type { ChecklistItem } from './types';

/* ---------------------------------------------------------------------- */
/* Annual tax preparation                                                   */
/* Categories and document types only — amounts, caps, eligibility and     */
/* deadlines are set by IRAS and are never hard-coded here.                 */
/* ---------------------------------------------------------------------- */

export const TAX_INCOME_DOCUMENTS: ChecklistItem[] = [
  { id: 'ir8a', text: 'Employment income: Form IR8A from each employer, or confirm Auto-Inclusion Scheme submission in myTax Portal', essential: true, group: 'Income documents' },
  { id: 'bonus', text: 'Bonus, commission, allowances and benefits-in-kind statements', essential: false, group: 'Income documents' },
  { id: 'trade', text: 'Trade, business, profession or freelance income statement (revenue and allowable expenses)', essential: false, group: 'Income documents' },
  { id: 'rental', text: 'Rental income and expense records (tenancy agreements, receipts)', essential: false, group: 'Income documents' },
  { id: 'other', text: 'Other taxable income: director\'s fees, royalties, certain overseas income', essential: false, group: 'Income documents' },
  { id: 'prior', text: 'Previous year\'s Notice of Assessment for reference', essential: false, group: 'Income documents' },
];

export const TAX_RELIEF_CATEGORIES: ChecklistItem[] = [
  { id: 'earned', text: 'Earned Income Relief (automatically computed by IRAS where eligible)', essential: false, group: 'Reliefs to review' },
  { id: 'spouse', text: 'Spouse Relief or Handicapped Spouse Relief', essential: false, group: 'Reliefs to review' },
  { id: 'child', text: 'Qualifying Child Relief or Handicapped Child Relief', essential: false, group: 'Reliefs to review' },
  { id: 'wmcr', text: 'Working Mother\'s Child Relief', essential: false, group: 'Reliefs to review' },
  { id: 'parent', text: 'Parent Relief or Handicapped Parent Relief', essential: false, group: 'Reliefs to review' },
  { id: 'grandparent', text: 'Grandparent Caregiver Relief', essential: false, group: 'Reliefs to review' },
  { id: 'cpf', text: 'CPF Relief (employee contributions) and CPF Cash Top-up Relief', essential: false, group: 'Reliefs to review' },
  { id: 'srs', text: 'Supplementary Retirement Scheme (SRS) Relief', essential: false, group: 'Reliefs to review' },
  { id: 'life', text: 'Life Insurance Relief', essential: false, group: 'Reliefs to review' },
  { id: 'course', text: 'Course Fees Relief', essential: false, group: 'Reliefs to review' },
  { id: 'nsman', text: 'NSman Relief (self, wife or parent)', essential: false, group: 'Reliefs to review' },
  { id: 'fdw', text: 'Foreign Domestic Worker Levy Relief', essential: false, group: 'Reliefs to review' },
  { id: 'donations', text: 'Donations to approved institutions (tax deduction)', essential: false, group: 'Reliefs to review' },
];

export const TAX_FILING_TASKS: ChecklistItem[] = [
  { id: 'status', text: 'Check filing status and the current deadline in myTax Portal', essential: true, group: 'Filing tasks' },
  { id: 'verify', text: 'Verify pre-filled income and reliefs against your documents', essential: true, group: 'Filing tasks' },
  { id: 'claim', text: 'Add any reliefs or deductions not pre-filled, with supporting records kept', essential: true, group: 'Filing tasks' },
  { id: 'submit', text: 'Submit the return and save the acknowledgement', essential: true, group: 'Filing tasks' },
  { id: 'noa', text: 'Check the Notice of Assessment when it arrives and object within the stated window if needed', essential: true, group: 'Filing tasks' },
  { id: 'pay', text: 'Arrange payment (GIRO instalments or lump sum) by the due date', essential: true, group: 'Filing tasks' },
  { id: 'records', text: 'File records for the retention period IRAS requires', essential: false, group: 'Filing tasks' },
];

/* ---------------------------------------------------------------------- */
/* Annual life-admin maintenance                                             */
/* ---------------------------------------------------------------------- */

export interface ChecklistSection {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
  relatedPath?: string;
  relatedLabel?: string;
}

export const ANNUAL_ADMIN_SECTIONS: ChecklistSection[] = [
  {
    id: 'finances',
    title: 'Household finances',
    description: 'A fresh look at income, spending, savings and debt.',
    relatedPath: '/calculators/budget',
    relatedLabel: 'Budget calculator',
    items: [
      { id: 'budget', text: 'Update the household budget with the last three months of actual spending', essential: true },
      { id: 'emergency', text: 'Check the emergency fund against current essential expenses', essential: true },
      { id: 'debt', text: 'Review every debt: balances, rates, and whether to repay faster or refinance', essential: true },
      { id: 'subscriptions', text: 'Audit subscriptions and recurring charges', essential: false },
      { id: 'goals', text: 'Set or update savings goals and automatic transfers', essential: false },
    ],
  },
  {
    id: 'insurance',
    title: 'Insurance and nominations',
    description: 'Cover that matches your life, with the right people named.',
    relatedPath: '/calculators/insurance',
    relatedLabel: 'Insurance needs organiser',
    items: [
      { id: 'inventory', text: 'Update the policy inventory and confirm premiums are being paid', essential: true },
      { id: 'needs', text: 'Re-run the insurance needs organiser after any life change', essential: true },
      { id: 'nominations', text: 'Check insurance nominations and CPF nomination', essential: true },
      { id: 'health', text: 'Review hospitalisation cover, ward class and rider premiums', essential: false },
    ],
  },
  {
    id: 'cpf',
    title: 'CPF and retirement',
    description: 'Your long-term position, once a year.',
    relatedPath: '/calculators/retirement',
    relatedLabel: 'Retirement projection',
    items: [
      { id: 'statement', text: 'Review CPF balances and contribution history', essential: true },
      { id: 'projection', text: 'Update the retirement projection with current savings and contributions', essential: true },
      { id: 'topups', text: 'Decide on CPF top-ups or SRS contributions for the year', essential: false },
      { id: 'cpf-life', text: 'If near 55 or 65, review retirement sum and CPF LIFE options on CPF Board\'s site', essential: false },
    ],
  },
  {
    id: 'tax',
    title: 'Tax filing preparation',
    description: 'Get ahead of the filing season.',
    relatedPath: '/tools/tax-prep',
    relatedLabel: 'Tax preparation checklist',
    items: [
      { id: 'documents', text: 'Gather income documents and relief records', essential: true },
      { id: 'deadline', text: 'Note the filing deadline from IRAS and add it to My Plan', essential: true },
      { id: 'file', text: 'File and keep the acknowledgement; check the Notice of Assessment', essential: true },
    ],
  },
  {
    id: 'documents',
    title: 'Important documents',
    description: 'Nothing expires unnoticed.',
    items: [
      { id: 'passports', text: 'Check passport validity for every family member', essential: true },
      { id: 'register', text: 'Update the document register (IDs, licences, warranties, contracts) with expiry dates', essential: true },
      { id: 'will', text: 'Confirm your will, LPA and ACP are current and findable', essential: false },
      { id: 'copies', text: 'Refresh secure copies of key documents', essential: false },
    ],
  },
  {
    id: 'health',
    title: 'Healthcare and screening',
    description: 'Preventive care for the household.',
    items: [
      { id: 'screening', text: 'Book recommended health screening for your age and risk', essential: true },
      { id: 'dental', text: 'Book dental checks for the household', essential: false },
      { id: 'medisave', text: 'Check MediSave balances and MediShield Life or Integrated Shield Plan status', essential: false },
      { id: 'records', text: 'Update medication, allergy and condition lists', essential: false },
    ],
  },
  {
    id: 'security',
    title: 'Passwords and account security',
    description: 'Lock the doors that matter.',
    items: [
      { id: 'email', text: 'Confirm two-factor authentication on email, Singpass and banking', essential: true },
      { id: 'passwords', text: 'Rotate weak or reused passwords using a password manager', essential: true },
      { id: 'breaches', text: 'Check breach notifications and remove unused accounts', essential: false },
      { id: 'scams', text: 'Review current scam patterns and update family members', essential: false },
    ],
  },
  {
    id: 'housing',
    title: 'Housing and recurring contracts',
    description: 'Home loans, rent, and anything that auto-renews.',
    items: [
      { id: 'mortgage', text: 'Review home loan rate, lock-in and refinancing options', essential: true },
      { id: 'tenancy', text: 'Note tenancy or lease renewal dates and notice periods', essential: false },
      { id: 'utilities', text: 'Compare electricity, telco and broadband contracts', essential: false },
      { id: 'maintenance', text: 'Schedule home maintenance (aircon servicing, safety devices, water heater)', essential: false },
    ],
  },
];

export const ANNUAL_ADMIN_ALL_ITEMS = ANNUAL_ADMIN_SECTIONS.flatMap((s) => s.items.map((i) => ({ ...i, id: `${s.id}.${i.id}` })));
export const TAX_ALL_ITEMS = [...TAX_INCOME_DOCUMENTS, ...TAX_RELIEF_CATEGORIES, ...TAX_FILING_TASKS];
