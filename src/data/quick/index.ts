import type { GuideExtras } from '../types';
import { MONEY_EXTRAS } from './money';
import { HOUSING_EXTRAS } from './housing';
import { PARENTING_EXTRAS } from './parenting';
import { PARENTS_EXTRAS } from './parents';
import { INSURANCE_EXTRAS } from './insurance';
import { CPF_EXTRAS } from './cpf';
import { CAREERS_EXTRAS } from './careers';
import { MARRIAGE_EXTRAS } from './marriage';
import { LEGAL_EXTRAS } from './legal';
import { TRANSPORT_EXTRAS } from './transport';
import { DIGITAL_EXTRAS } from './digital';
import { WELLBEING_EXTRAS } from './wellbeing';

/**
 * "Your situation" quick checks and "How it works" figures, keyed by guide id.
 * Content lives next to the guides but in its own files so the logic can be tested on its own.
 */
export const GUIDE_EXTRAS: Record<string, GuideExtras> = {
  ...MONEY_EXTRAS,
  ...HOUSING_EXTRAS,
  ...PARENTING_EXTRAS,
  ...PARENTS_EXTRAS,
  ...INSURANCE_EXTRAS,
  ...CPF_EXTRAS,
  ...CAREERS_EXTRAS,
  ...MARRIAGE_EXTRAS,
  ...LEGAL_EXTRAS,
  ...TRANSPORT_EXTRAS,
  ...DIGITAL_EXTRAS,
  ...WELLBEING_EXTRAS,
};
