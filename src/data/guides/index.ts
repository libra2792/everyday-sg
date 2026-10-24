import type { Guide } from '../types';
import { MONEY_GUIDES } from './money';
import { HOUSING_GUIDES } from './housing';
import { PARENTING_GUIDES } from './parenting';
import { PARENTS_GUIDES } from './parents';
import { INSURANCE_GUIDES } from './insurance';
import { CPF_GUIDES } from './cpf';
import { CAREERS_GUIDES } from './careers';
import { MARRIAGE_GUIDES } from './marriage';
import { LEGAL_GUIDES } from './legal';
import { TRANSPORT_GUIDES } from './transport';
import { DIGITAL_GUIDES } from './digital';
import { WELLBEING_GUIDES } from './wellbeing';

/** Every guide, in category order. Adding a guide to a category file is all that is needed. */
export const GUIDES: Guide[] = [
  ...MONEY_GUIDES,
  ...HOUSING_GUIDES,
  ...PARENTING_GUIDES,
  ...PARENTS_GUIDES,
  ...INSURANCE_GUIDES,
  ...CPF_GUIDES,
  ...CAREERS_GUIDES,
  ...MARRIAGE_GUIDES,
  ...LEGAL_GUIDES,
  ...TRANSPORT_GUIDES,
  ...DIGITAL_GUIDES,
  ...WELLBEING_GUIDES,
];

export const GUIDE_MAP: Record<string, Guide> = Object.fromEntries(GUIDES.map((g) => [g.id, g]));

export function guidesInCategory(categoryId: string): Guide[] {
  return GUIDES.filter((g) => g.categoryId === categoryId);
}

/** Guides shown as "popular" on the home page — a curated, cross-category set. */
export const FEATURED_GUIDE_IDS = ['build-a-budget', 'home-affordability-and-loans', 'newborn-first-year', 'caregiving-plan', 'retirement-income-cpf-life', 'scam-protection'];
