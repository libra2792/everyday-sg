/**
 * The consolidated "Support for parents" table shown on the parenting guides.
 *
 * Amounts are deliberately left out, as elsewhere on the site: they change with each Budget.
 * Each row links to the agency page that has the current figures and eligibility rules.
 */

export interface ParentSupportRow {
  name: string;
  group: 'Leave' | 'Cash and accounts' | 'Childcare and school' | 'Tax';
  /** What the support helps with, in a line. */
  what: string;
  /** Who it is generally for; the agency decides eligibility. */
  who: string;
  /** How you get it. */
  how: string;
  /** Source id in the SOURCES registry. */
  sourceId: string;
}

export const LEAVE_PORTAL_SOURCE = 'gpl-paternity';

export const PARENT_SUPPORT: ParentSupportRow[] = [
  { group: 'Leave', name: 'Government-Paid Maternity Leave', what: 'Paid leave for working mothers around the birth', who: 'Mothers of a Singapore Citizen child who meet the work criteria', how: 'Apply through your employer; self-employed mothers claim on the GPL Portal', sourceId: 'mom-maternity' },
  { group: 'Leave', name: 'Government-Paid Paternity Leave', what: 'Paid leave for working fathers after the birth or adoption', who: 'Fathers of a Singapore Citizen child who meet the work criteria', how: 'Agree dates with your employer; self-employed fathers claim on the GPL Portal', sourceId: 'gpl-paternity' },
  { group: 'Leave', name: 'Shared Parental Leave', what: 'Extra paid leave that parents can divide between them', who: 'Working parents of an eligible Singapore Citizen child', how: 'Apply through your employer; self-employed parents claim on the GPL Portal', sourceId: 'mom-shared-parental' },
  { group: 'Leave', name: 'Childcare leave', what: 'Paid days each year for looking after young children', who: 'Working parents of a Singapore Citizen child under seven', how: 'Apply through your employer', sourceId: 'mom-childcare-leave' },
  { group: 'Leave', name: 'Unpaid infant care leave', what: 'Unpaid days each year for children under two', who: 'Working parents of a Singapore Citizen child under two', how: 'Apply through your employer', sourceId: 'mom-infant-care-leave' },
  { group: 'Cash and accounts', name: 'SG Child Support Package (replacing Baby Bonus)', what: 'Cash support paid out in stages over the early years', who: 'Parents of a Singapore Citizen child', how: 'Enrol on LifeSG, usually with birth registration', sourceId: 'lifesg-sg-child-support' },
  { group: 'Cash and accounts', name: 'Child Development Account (CDA)', what: 'A starting grant plus government matching of your savings, for approved childcare and healthcare costs', who: 'Singapore Citizen children', how: 'Open at a participating bank through LifeSG', sourceId: 'lifesg-baby-bonus' },
  { group: 'Cash and accounts', name: 'MediSave Maternity Package', what: 'Use MediSave for pre-delivery and delivery costs within limits', who: 'Parents with MediSave savings', how: 'Arrange with the hospital at admission', sourceId: 'cpf-healthcare' },
  { group: 'Cash and accounts', name: 'MediSave Grant for Newborns', what: 'A deposit into the baby\'s own MediSave for premiums and healthcare', who: 'Singapore Citizen newborns', how: 'Credited to the baby\'s MediSave once the child is enrolled', sourceId: 'cpf-healthcare' },
  { group: 'Childcare and school', name: 'Infant care and childcare subsidies', what: 'A basic subsidy on monthly fees, plus an additional income-assessed subsidy', who: 'Singapore Citizen children in licensed centres', how: 'Apply through the centre when you enrol', sourceId: 'ecda-subsidies' },
  { group: 'Childcare and school', name: 'Kindergarten Fee Assistance Scheme (KiFAS)', what: 'Help with kindergarten fees for lower- and middle-income households', who: 'Singapore Citizen children at eligible kindergartens', how: 'Apply through the kindergarten', sourceId: 'ecda-subsidies' },
  { group: 'Childcare and school', name: 'Edusave', what: 'Yearly contributions for school programmes and fees', who: 'Singapore Citizen children in school', how: 'Account opened automatically by MOE', sourceId: 'moe-edusave' },
  { group: 'Tax', name: 'Parenthood Tax Rebate and child reliefs', what: 'Rebates and reliefs on parents\' income tax, including child and working mother\'s reliefs', who: 'Tax-resident parents of eligible children', how: 'Claim in your yearly tax return on myTax Portal', sourceId: 'iras-reliefs' },
];
