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

/**
 * A relief to review, with the plain-English note shown behind its info button: what it is
 * for, who qualifies and how it is given. Thresholds are described, not quoted, like the rest
 * of the site; the linked IRAS pages have the figures.
 */
export interface TaxRelief extends ChecklistItem {
  /** Short name, for the note's heading and the organiser's field. */
  name: string;
  what: string;
  who: string;
  /** Automatic, pre-filled, or claimed by you, and how. */
  claim: string;
  note?: string;
  /** The first Year of Assessment it can no longer be claimed for, once IRAS has ended it. */
  lapsedFrom?: number;
  sourceIds: string[];
}

const RELIEF = { essential: false, group: 'Reliefs to review' } as const;

export const TAX_RELIEF_CATEGORIES: TaxRelief[] = [
  {
    ...RELIEF,
    id: 'earned',
    text: 'Earned Income Relief (automatically computed by IRAS where eligible)',
    name: 'Earned Income Relief',
    what: 'Recognises that you work for a living. It applies to income from a job, a trade, a business or a profession.',
    who: 'Anyone with earned income in the previous year. It is larger from 55 and again from 60, and larger again with a disability.',
    claim: 'Automatic, from your income records. With a disability, tell IRAS the first time; later years follow on their own.',
    sourceIds: ['iras-relief-earned'],
  },
  {
    ...RELIEF,
    id: 'spouse',
    text: 'Spouse Relief or Spouse Relief (Disability)',
    name: 'Spouse Relief',
    what: 'For supporting a husband or wife who earns little or nothing.',
    who: 'Your spouse lived with you or was supported by you, and their income in the previous year (including most tax-exempt and overseas income) was within IRAS’s limit. There is no income test if your spouse has a disability. Only one person can claim for the same spouse.',
    claim: 'Claim it yourself the first year, under Deductions, Tax Reliefs and Rebates when you e-file. It is pre-filled in later years.',
    note: 'IRAS raised the spouse’s income limit from YA 2025, so more couples now qualify.',
    sourceIds: ['iras-relief-spouse'],
  },
  {
    ...RELIEF,
    id: 'child',
    text: 'Qualifying Child Relief or Child Relief (Disability)',
    name: 'Qualifying Child Relief',
    what: 'For each child you support.',
    who: 'Your own, step or legally adopted child, unmarried, and under 16 or in full-time education. The child’s own income must be within IRAS’s limit, unless the child has a disability.',
    claim: 'Claim it yourself the first year; it is pre-filled after that. Parents can split it for the same child, but not beyond the amount for one child.',
    note: 'Working mothers can claim Working Mother’s Child Relief for the same child as well.',
    sourceIds: ['iras-relief-child'],
  },
  {
    ...RELIEF,
    id: 'wmcr',
    text: 'Working Mother\'s Child Relief',
    name: 'Working Mother’s Child Relief',
    what: 'Encourages mothers to keep working after having children.',
    who: 'Working mothers who are married, divorced or widowed. Each child must be a Singapore Citizen and meet the Qualifying Child Relief conditions.',
    claim: 'Claim it with the child when you e-file (answer Yes to Working Mother’s Child Relief); IRAS works out the amount. It is pre-filled in later years.',
    note: 'For a child born or adopted on or after 1 January 2024, it is a fixed amount per child from YA 2025, rather than a share of the mother’s earned income.',
    sourceIds: ['iras-relief-wmcr'],
  },
  {
    ...RELIEF,
    id: 'parent',
    text: 'Parent Relief or Parent Relief (Disability)',
    name: 'Parent Relief',
    what: 'For supporting your parents, grandparents or parents-in-law, including step and adoptive ones.',
    who: 'The dependant is 55 or older, their income was within IRAS’s limit (neither test applies with a disability), they lived in Singapore, and they either lived with you or you gave them at least IRAS’s minimum support. Up to two dependants.',
    claim: 'Claim it yourself the first year; it is pre-filled after that. Siblings supporting the same parent can share it.',
    note: 'IRAS raised the dependant’s income limit from YA 2025.',
    sourceIds: ['iras-relief-parent'],
  },
  {
    ...RELIEF,
    id: 'grandparent',
    text: 'Grandparent Caregiver Relief',
    name: 'Grandparent Caregiver Relief',
    what: 'For working mothers whose parents, grandparents or in-laws look after their children.',
    who: 'Working mothers who are married, divorced or widowed. The caregiver lived in Singapore and was not working, or earned within IRAS’s limit. The child is a Singapore Citizen aged 12 or under (no age limit with a disability). One claim per caregiver.',
    claim: 'Claim it yourself the first year; it is pre-filled after that.',
    sourceIds: ['iras-relief-grandparent'],
  },
  {
    ...RELIEF,
    id: 'cpf',
    text: 'CPF Relief (employee contributions) and CPF Cash Top-up Relief',
    name: 'CPF Relief and CPF Cash Top-up Relief',
    what: 'Your compulsory CPF contributions as an employee are not taxed, and neither are cash top-ups to your own or your family’s CPF accounts.',
    who: 'CPF Relief: Singapore Citizen and PR employees, on compulsory contributions only. Top-up Relief: cash top-ups to your own Special, Retirement or MediSave Account, or to parents, grandparents, a spouse or siblings, up to the yearly limit and only while the account is below its retirement or healthcare sum.',
    claim: 'Usually automatic: CPF Relief comes from your employer through Auto-Inclusion (claim it yourself if your employer is not in the scheme), and Top-up Relief from CPF Board’s records.',
    note: 'A top-up counts for the year CPF Board receives it, so top up by 31 December for relief in the next Year of Assessment. Top-ups the Government matches under the Matched Retirement Savings Scheme do not get relief.',
    sourceIds: ['iras-relief-cpf', 'iras-relief-cpf-topup'],
  },
  {
    ...RELIEF,
    id: 'srs',
    text: 'Supplementary Retirement Scheme (SRS) Relief',
    name: 'SRS Relief',
    what: 'For money you put into a Supplementary Retirement Scheme account: voluntary retirement savings on top of CPF.',
    who: 'Tax residents, on contributions made in the previous calendar year, up to the yearly contribution cap (higher for foreigners). No relief on an amount you withdraw again in the same year.',
    claim: 'Automatic, from your SRS operator (your bank).',
    note: 'Contribute by 31 December for relief in the next Year of Assessment. Withdrawals are taxed later, with a concession from the statutory retirement age.',
    sourceIds: ['iras-srs'],
  },
  {
    ...RELIEF,
    id: 'life',
    text: 'Life Insurance Relief',
    name: 'Life Insurance Relief',
    what: 'For premiums on a life policy on your own life or your spouse’s.',
    who: 'Only if your compulsory CPF contributions in the previous year were below IRAS’s limit, which rules out most full-time employees. Hospitalisation (including Integrated Shield), accident, critical illness and disability policies do not count.',
    claim: 'Claim it yourself under Life Insurance when you e-file; it is pre-filled in later years.',
    sourceIds: ['iras-relief-life'],
  },
  {
    ...RELIEF,
    id: 'course',
    text: 'Course Fees Relief (YA 2025 is the last year it can be claimed)',
    name: 'Course Fees Relief',
    what: 'Was for fees you paid yourself for courses leading to an approved qualification or relevant to your work.',
    who: 'Courses attended in 2024, claimed for YA 2025, were the last to qualify. Fees paid by an employer or with SkillsFuture Credit never counted.',
    claim: 'For YA 2025, claimed in the return. Nothing to claim from YA 2026.',
    note: 'IRAS ended this relief from YA 2026.',
    lapsedFrom: 2026,
    sourceIds: ['iras-relief-course'],
  },
  {
    ...RELIEF,
    id: 'nsman',
    text: 'NSman Relief (self, wife or parent)',
    name: 'NSman Relief',
    what: 'Recognises national service by NSmen, and the support of their wives and parents.',
    who: 'Self: you completed full-time NS (MINDEF, SPF and SCDF regulars excluded); the amount depends on whether you did NS activities in the previous work year and your appointment. Wife and parent: Singapore Citizens whose husband or child qualifies.',
    claim: 'Automatic, from MINDEF, SPF and SCDF records. If a wife or parent relief is missing, write to IRAS through myTax Mail.',
    sourceIds: ['iras-relief-nsman'],
  },
  {
    ...RELIEF,
    id: 'fdw',
    text: 'Foreign Domestic Worker Levy Relief',
    name: 'Foreign Domestic Worker Levy Relief',
    what: 'Was for married working women who paid the levy on a foreign domestic worker.',
    who: 'YA 2024 was the last year it could be claimed.',
    claim: 'Nothing to claim from YA 2025.',
    note: 'IRAS ended this relief from YA 2025.',
    lapsedFrom: 2025,
    sourceIds: ['iras-relief-fdwl'],
  },
  {
    ...RELIEF,
    id: 'donations',
    text: 'Donations to approved institutions (tax deduction)',
    name: 'Donations to approved IPCs',
    what: 'A tax deduction larger than the amount you give, for donations to approved Institutions of a Public Character (IPCs).',
    who: 'Only approved IPCs count, so check the charity’s status first. Outright gifts qualify; anything you get in return reduces or removes the deduction.',
    claim: 'Automatic: give the IPC your NRIC or FIN when you donate, as IRAS does not accept receipts as a claim. Payroll donations through an employer not in Auto-Inclusion go in your return.',
    note: 'Deductions you cannot use this year carry forward for up to five years.',
    sourceIds: ['iras-donations'],
  },
];

/** Whether IRAS has ended a relief by this Year of Assessment. */
export function reliefLapsed(relief: TaxRelief, ya: number): boolean {
  return relief.lapsedFrom !== undefined && ya >= relief.lapsedFrom;
}

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
