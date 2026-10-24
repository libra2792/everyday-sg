import type { Source } from './types';

/**
 * Registry of official and authoritative links used across guides and tools.
 *
 * `check` records how each entry was verified when this content was prepared:
 *   - 'content'   the page was opened and its content read
 *   - 'link'      the URL was confirmed to exist (returned by an official page or search)
 *   - 'unchecked' listed from general knowledge only; confirm before relying on it
 *
 * Everyday SG is independent and not affiliated with any agency. Rules change; always
 * confirm current requirements on the agency's own website.
 */
const CHECKED = '2026-10-24';

export const SOURCES: Source[] = [
  // ---- Portals (as provided in the product brief) ------------------------------------
  { id: 'lifesg', agency: 'LifeSG', title: 'LifeSG — government services for life events', url: 'https://www.life.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'cpf', agency: 'CPF Board', title: 'CPF Board', url: 'https://www.cpf.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'moneysense', agency: 'MoneySense', title: 'MoneySense — national financial education programme', url: 'https://www.moneysense.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'hdb', agency: 'HDB', title: 'Housing & Development Board', url: 'https://www.hdb.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'iras', agency: 'IRAS', title: 'Inland Revenue Authority of Singapore', url: 'https://www.iras.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'moh', agency: 'MOH', title: 'Ministry of Health', url: 'https://www.moh.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'healthhub', agency: 'HealthHub', title: 'HealthHub', url: 'https://www.healthhub.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'msf', agency: 'MSF', title: 'Ministry of Social and Family Development', url: 'https://www.msf.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'mom', agency: 'MOM', title: 'Ministry of Manpower', url: 'https://www.mom.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'skillsfuture', agency: 'SkillsFuture SG', title: 'SkillsFuture Singapore', url: 'https://www.skillsfuture.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'singpass', agency: 'Singpass', title: 'Singpass', url: 'https://www.singpass.gov.sg/', check: 'unchecked', note: 'The site blocks automated checks; open it directly.' },
  { id: 'lta', agency: 'LTA', title: 'Land Transport Authority', url: 'https://www.lta.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'moe', agency: 'MOE', title: 'Ministry of Education', url: 'https://www.moe.gov.sg/', check: 'content', checkedOn: CHECKED },

  // ---- CPF -------------------------------------------------------------------------
  { id: 'cpf-life', agency: 'CPF Board', title: 'CPF LIFE — lifelong monthly payouts', url: 'https://www.cpf.gov.sg/member/retirement-income/monthly-payouts/cpf-life', check: 'content', checkedOn: CHECKED },
  { id: 'cpf-payout-estimator', agency: 'CPF Board', title: 'CPF monthly payout estimator', url: 'https://www.cpf.gov.sg/payoutestimator', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-calculators', agency: 'CPF Board', title: 'CPF calculators and tools', url: 'https://www.cpf.gov.sg/member/tools-and-services/calculators', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-retirement-income', agency: 'CPF Board', title: 'Retirement income — overview', url: 'https://www.cpf.gov.sg/member/retirement-income', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-planner', agency: 'CPF Board', title: 'CPF Planner — retirement income', url: 'https://www.cpf.gov.sg/member/retirement-income/about-cpf-planner-retirement-income', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-housing', agency: 'CPF Board', title: 'Using your CPF to buy a home', url: 'https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-medishield', agency: 'CPF Board', title: 'MediShield Life', url: 'https://www.cpf.gov.sg/member/healthcare-financing/medishield-life', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-careshield', agency: 'CPF Board', title: 'CareShield Life', url: 'https://www.cpf.gov.sg/member/healthcare-financing/careshield-life', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-healthcare', agency: 'CPF Board', title: 'Healthcare financing (MediSave and schemes)', url: 'https://www.cpf.gov.sg/member/healthcare-financing', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-nomination', agency: 'CPF Board', title: 'Making a CPF nomination', url: 'https://www.cpf.gov.sg/member/account-services/providing-for-your-loved-ones/making-a-cpf-nomination', check: 'link', checkedOn: CHECKED },

  // ---- HDB -------------------------------------------------------------------------
  { id: 'hdb-buying', agency: 'HDB', title: 'Buying a flat', url: 'https://www.hdb.gov.sg/buying-a-flat', check: 'content', checkedOn: CHECKED },
  { id: 'hdb-hfe', agency: 'HDB', title: 'HDB Flat Eligibility (HFE) letter', url: 'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/application-for-an-hdb-flat-eligibility-hfe-letter', check: 'link', checkedOn: CHECKED },
  { id: 'hdb-loan', agency: 'HDB', title: 'Housing loan options (HDB loan vs financial institutions)', url: 'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/housing-loan', check: 'content', checkedOn: CHECKED },
  { id: 'hdb-ehg', agency: 'HDB', title: 'Enhanced CPF Housing Grant (couples and families)', url: 'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/couples-and-families/enhanced-cpf-housing-grant', check: 'link', checkedOn: CHECKED },
  { id: 'hdb-grants', agency: 'HDB', title: 'CPF Housing Grants (couples and families)', url: 'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/couples-and-families/cpf-housing-grants', check: 'link', checkedOn: CHECKED },
  { id: 'hdb-singles-grant', agency: 'HDB', title: 'Enhanced CPF Housing Grant (singles)', url: 'https://www.hdb.gov.sg/buying-a-flat/flat-grant-and-loan-eligibility/singles/enhanced-cpf-housing-grant', check: 'link', checkedOn: CHECKED },
  { id: 'hdb-renting', agency: 'HDB', title: 'Renting a flat', url: 'https://www.hdb.gov.sg/renting-a-flat', check: 'link', checkedOn: CHECKED },
  { id: 'hdb-eservices', agency: 'HDB', title: 'HDB e-Services for buying a flat', url: 'https://www.hdb.gov.sg/eservices/buying-a-flat/', check: 'link', checkedOn: CHECKED },

  // ---- IRAS ------------------------------------------------------------------------
  { id: 'iras-rates', agency: 'IRAS', title: 'Individual income tax rates', url: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates', check: 'link', checkedOn: CHECKED },
  { id: 'iras-reliefs', agency: 'IRAS', title: 'Tax reliefs, rebates and deductions', url: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions', check: 'link', checkedOn: CHECKED },
  { id: 'iras-filing', agency: 'IRAS', title: 'Understanding my income tax filing', url: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/understanding-my-income-tax-filing', check: 'link', checkedOn: CHECKED },
  { id: 'iras-file', agency: 'IRAS', title: 'File income tax return (digital service)', url: 'https://www.iras.gov.sg/digital-services/employees/file-income-tax-return', check: 'link', checkedOn: CHECKED },
  { id: 'iras-mytax', agency: 'IRAS', title: 'Managing your myTax Portal account', url: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/managing-mytax-portal-account', check: 'link', checkedOn: CHECKED },
  { id: 'iras-srs', agency: 'IRAS', title: 'SRS contributions and tax relief', url: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/supplementary-retirement-scheme-(srs)-relief', check: 'link', checkedOn: CHECKED },

  // ---- MOM -------------------------------------------------------------------------
  { id: 'mom-leave', agency: 'MOM', title: 'Leave — overview of entitlements', url: 'https://www.mom.gov.sg/employment-practices/leave', check: 'content', checkedOn: CHECKED },
  { id: 'mom-maternity', agency: 'MOM', title: 'Maternity leave', url: 'https://www.mom.gov.sg/employment-practices/leave/maternity-leave', check: 'content', checkedOn: CHECKED },
  { id: 'mom-paternity', agency: 'MOM', title: 'Paternity leave', url: 'https://www.mom.gov.sg/employment-practices/leave/paternity-leave', check: 'link', checkedOn: CHECKED },
  { id: 'mom-shared-parental', agency: 'MOM', title: 'Shared parental leave', url: 'https://www.mom.gov.sg/employment-practices/leave/shared-parental-leave', check: 'link', checkedOn: CHECKED },
  { id: 'mom-childcare-leave', agency: 'MOM', title: 'Childcare leave', url: 'https://www.mom.gov.sg/employment-practices/leave/childcare-leave', check: 'link', checkedOn: CHECKED },
  { id: 'mom-infant-care-leave', agency: 'MOM', title: 'Unpaid infant care leave', url: 'https://www.mom.gov.sg/employment-practices/leave/unpaid-infant-care-leave', check: 'link', checkedOn: CHECKED },
  { id: 'mom-annual-leave', agency: 'MOM', title: 'Annual leave', url: 'https://www.mom.gov.sg/employment-practices/leave/annual-leave', check: 'link', checkedOn: CHECKED },
  { id: 'mom-sick-leave', agency: 'MOM', title: 'Sick leave', url: 'https://www.mom.gov.sg/employment-practices/leave/sick-leave', check: 'link', checkedOn: CHECKED },
  { id: 'mom-termination', agency: 'MOM', title: 'Termination of employment (notice, resignation, dismissal)', url: 'https://www.mom.gov.sg/employment-practices/termination-of-employment', check: 'link', checkedOn: CHECKED },
  { id: 'mom-employment-act', agency: 'MOM', title: 'Who is covered by the Employment Act', url: 'https://www.mom.gov.sg/employment-practices/employment-act/who-is-covered', check: 'link', checkedOn: CHECKED },
  { id: 'mom-mdw', agency: 'MOM', title: 'Work Permit for migrant domestic workers', url: 'https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-domestic-worker', check: 'link', checkedOn: CHECKED },

  // ---- Family, children, education -------------------------------------------------
  { id: 'lifesg-baby-bonus', agency: 'LifeSG', title: 'Baby Bonus Scheme — apply on LifeSG', url: 'https://life.gov.sg/services/baby-bonus', check: 'content', checkedOn: CHECKED },
  { id: 'lifesg-bb-overview', agency: 'LifeSG', title: 'Baby Bonus Scheme — overview', url: 'https://www.life.gov.sg/family-parenting/benefits-support/baby-bonus-scheme', check: 'link', checkedOn: CHECKED },
  { id: 'lifesg-sg-child-support', agency: 'LifeSG', title: 'SG Child Support Package', url: 'https://www.life.gov.sg/family-parenting/benefits-support/sg-child-support-package', check: 'content', checkedOn: CHECKED },
  { id: 'msf-baby-bonus', agency: 'MSF', title: 'Baby Bonus Scheme (MSF)', url: 'https://www.msf.gov.sg/what-we-do/support-families-and-parents/article/programmes/Baby-Bonus-Scheme', check: 'link', checkedOn: CHECKED },
  { id: 'ecda-subsidies', agency: 'ECDA', title: 'Preschool subsidies (infant care, childcare, KiFAS)', url: 'https://www.ecda.gov.sg/parents/preschool-subsidies', check: 'content', checkedOn: CHECKED },
  { id: 'ecda-income', agency: 'ECDA', title: 'Assessment of household income for subsidies', url: 'https://www.ecda.gov.sg/parents/preschool-subsidies/assessment-of-household-income', check: 'link', checkedOn: CHECKED },
  { id: 'ecda-search', agency: 'ECDA', title: 'Preschool Search Portal', url: 'https://www.ecda.gov.sg/parents/preschool-search', check: 'link', checkedOn: CHECKED },
  { id: 'ecda-choosing', agency: 'ECDA', title: 'Choosing a preschool for your child', url: 'https://www.ecda.gov.sg/parents/choosing-a-preschool/choosing-a-preschool-for-your-child', check: 'link', checkedOn: CHECKED },
  { id: 'healthhub-pregnancy', agency: 'HealthHub', title: 'Pregnancy and infant health', url: 'https://www.healthhub.sg/well-being-and-lifestyle/pregnancy-and-infant-health', check: 'link', checkedOn: CHECKED },
  { id: 'healthhub-parent-hub', agency: 'HealthHub', title: 'Parent Hub', url: 'https://www.healthhub.sg/programmes/parent-hub', check: 'link', checkedOn: CHECKED },
  { id: 'moe-preschool', agency: 'MOE', title: 'Preschool (MOE)', url: 'https://www.moe.gov.sg/preschool', check: 'link', checkedOn: CHECKED },
  { id: 'moe-primary', agency: 'MOE', title: 'Primary school (MOE)', url: 'https://www.moe.gov.sg/primary', check: 'link', checkedOn: CHECKED },
  { id: 'moe-edusave', agency: 'MOE', title: 'Edusave account', url: 'https://www.moe.gov.sg/financial-matters/edusave-account', check: 'link', checkedOn: CHECKED },
  { id: 'moe-fas', agency: 'MOE', title: 'MOE financial assistance', url: 'https://www.moe.gov.sg/financial-matters/financial-assistance', check: 'link', checkedOn: CHECKED },
  { id: 'msf-comcare', agency: 'MSF', title: 'ComCare — social assistance', url: 'https://www.msf.gov.sg/what-we-do/comcare', check: 'link', checkedOn: CHECKED },
  { id: 'msf-fsc', agency: 'MSF', title: 'Family Service Centres', url: 'https://www.msf.gov.sg/what-we-do/help-those-in-need/article/programmes/Family-Service-Centres', check: 'link', checkedOn: CHECKED },
  { id: 'msf-marriage', agency: 'MSF', title: 'Support for families and parents — marriage journey', url: 'https://www.msf.gov.sg/what-we-do/support-families-and-parents', check: 'link', checkedOn: CHECKED },

  // ---- Caregiving and healthcare ---------------------------------------------------
  { id: 'aic', agency: 'AIC', title: 'Agency for Integrated Care', url: 'https://www.aic.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'aic-caregiving', agency: 'AIC', title: 'Caregiving support', url: 'https://www.aic.sg/Caregiving-Support', check: 'link', checkedOn: CHECKED },
  { id: 'aic-financial', agency: 'AIC', title: 'Financial assistance for care', url: 'https://www.aic.sg/Financial-Assistance', check: 'link', checkedOn: CHECKED },
  { id: 'aic-hcg', agency: 'AIC', title: 'Home Caregiving Grant', url: 'https://www.aic.sg/Financial-Assistance/Home-Caregiving-Grant', check: 'link', checkedOn: CHECKED },
  { id: 'aic-care-services', agency: 'AIC', title: 'Care services (home, day, residential)', url: 'https://www.aic.sg/Care-Services', check: 'link', checkedOn: CHECKED },
  { id: 'aic-day-care', agency: 'AIC', title: 'Day care services', url: 'https://www.aic.sg/Care-Services/Day-Care', check: 'link', checkedOn: CHECKED },
  { id: 'aic-respite', agency: 'AIC', title: 'Take a break — respite options for caregivers', url: 'https://www.aic.sg/Caregiving-Support/Take-a-Break', check: 'link', checkedOn: CHECKED },
  { id: 'aic-dementia', agency: 'AIC', title: 'Dementia support', url: 'https://www.aic.sg/Caregiving-Support/Dementia-Support', check: 'link', checkedOn: CHECKED },
  { id: 'aic-sgo', agency: 'AIC', title: 'Silver Generation Office', url: 'https://www.aic.sg/Age-Well/Silver-Generation-Office', check: 'link', checkedOn: CHECKED },
  { id: 'aic-acp', agency: 'AIC', title: 'Doing your Advance Care Plan', url: 'https://www.aic.sg/Care-Services/Advance-Care-Planning-ACP/Doing-Your-ACP', check: 'link', checkedOn: CHECKED },
  { id: 'aic-acp-facilitator', agency: 'AIC', title: 'Finding an ACP facilitator', url: 'https://www.aic.sg/Care-Services/Advance-Care-Planning-ACP/Finding-an-ACP-Facilitator', check: 'link', checkedOn: CHECKED },
  { id: 'moh-affordable', agency: 'MOH', title: 'Keeping healthcare affordable — schemes and subsidies', url: 'https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/', check: 'content', checkedOn: CHECKED },
  { id: 'moh-hospital', agency: 'MOH', title: 'Subsidies for hospital stays', url: 'https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/hospital-stays/', check: 'link', checkedOn: CHECKED },
  { id: 'moh-outpatient', agency: 'MOH', title: 'Subsidies for outpatient treatment', url: 'https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/outpatient-treatment/', check: 'link', checkedOn: CHECKED },
  { id: 'moh-ltc', agency: 'MOH', title: 'Long-term care schemes', url: 'https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/long-term-care/', check: 'link', checkedOn: CHECKED },
  { id: 'moh-aged-care', agency: 'MOH', title: 'Financial support for aged care', url: 'https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/aged-care/', check: 'link', checkedOn: CHECKED },
  { id: 'moh-bills', agency: 'MOH', title: 'Managing medical bills', url: 'https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/managing-medical-bills/', check: 'link', checkedOn: CHECKED },
  { id: 'moh-acp', agency: 'MOH', title: 'Advance Care Planning', url: 'https://moh.gov.sg/ageing-well/advance-care-planning', check: 'content', checkedOn: CHECKED },
  { id: 'moh-mindline', agency: 'MOH', title: 'National mindline 1771 — round-the-clock mental health support', url: 'https://www.moh.gov.sg/newsroom/national-mindline-1771-to-provide--round-the-clock-support-for-mental-health/', check: 'content', checkedOn: CHECKED },
  { id: 'mindline', agency: 'mindline.sg', title: 'mindline.sg — mental health resources and webchat', url: 'https://mindline.sg/', check: 'link', checkedOn: CHECKED },
  { id: 'healthhub-screening', agency: 'HealthHub', title: 'Screen for Life — screening journey', url: 'https://www.healthhub.sg/programmes/screen_for_life/screening-journey', check: 'link', checkedOn: CHECKED },
  { id: 'healthhub-healthiersg-screening', agency: 'HealthHub', title: 'Healthier SG health screening', url: 'https://www.healthhub.sg/programmes/healthiersg-screening', check: 'link', checkedOn: CHECKED },
  { id: 'healthiersg-enrol', agency: 'HealthHub', title: 'Enrol in Healthier SG', url: 'https://eservices.healthhub.sg/healthiersg/enrolment/intro-splash', check: 'link', checkedOn: CHECKED },
  { id: 'healthhub-mental', agency: 'HealthHub', title: 'Mental wellness', url: 'https://www.healthhub.sg/well-being-and-lifestyle/mental-wellness', check: 'link', checkedOn: CHECKED },
  { id: 'healthhub-programmes', agency: 'HealthHub', title: 'HealthHub programmes', url: 'https://www.healthhub.sg/programmes', check: 'link', checkedOn: CHECKED },

  // ---- Legal and estate ------------------------------------------------------------
  { id: 'opg-what-lpa', agency: 'MSF (OPG)', title: 'What is a Lasting Power of Attorney', url: 'https://www.msf.gov.sg/what-we-do/opg/lasting-power-of-attorney/what-is-a-lasting-power-of-attorney', check: 'link', checkedOn: CHECKED },
  { id: 'opg-make-lpa', agency: 'MSF (OPG)', title: 'How to make a Lasting Power of Attorney', url: 'https://www.msf.gov.sg/what-we-do/opg/lasting-power-of-attorney/how-to-make-a-lasting-power-of-attorney', check: 'content', checkedOn: CHECKED },
  { id: 'opg-online', agency: 'MSF (OPG)', title: 'OPG Online (LPA e-service)', url: 'https://opg-eservice.msf.gov.sg/', check: 'link', checkedOn: CHECKED },
  { id: 'opg-deputy', agency: 'MSF (OPG)', title: 'How to become a deputy', url: 'https://www.msf.gov.sg/what-we-do/opg/deputyship/how-do-i-become-a-deputy', check: 'link', checkedOn: CHECKED },
  { id: 'lifesg-acp', agency: 'LifeSG', title: 'myACP — prepare an Advance Care Plan online', url: 'https://www.life.gov.sg/pages/8DRr1arW/legacy-planning/plan-your-future-care-and-medical-wishes/myacp-prepare-an-advance-care-plan-online', check: 'link', checkedOn: CHECKED },
  { id: 'mylegacy', agency: 'LifeSG', title: 'MyLegacy@LifeSG — legacy planning and what to do when someone dies', url: 'https://mylegacy.life.gov.sg/', check: 'link', checkedOn: CHECKED },

  // ---- Transport -------------------------------------------------------------------
  { id: 'onemotoring', agency: 'LTA', title: 'OneMotoring', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home.html', check: 'content', checkedOn: CHECKED },
  { id: 'onemotoring-buying', agency: 'LTA', title: 'Buying a vehicle', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/buying.html', check: 'link', checkedOn: CHECKED },
  { id: 'onemotoring-upfront', agency: 'LTA', title: 'Upfront vehicle costs', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/upfront-vehicle-costs.html', check: 'link', checkedOn: CHECKED },
  { id: 'onemotoring-coe', agency: 'LTA', title: 'Certificate of Entitlement (COE)', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/upfront-vehicle-costs/certificate-of-entitlement--coe-.html', check: 'link', checkedOn: CHECKED },
  { id: 'onemotoring-coe-results', agency: 'LTA', title: 'COE open bidding results', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/coe-open-bidding.html', check: 'link', checkedOn: CHECKED },
  { id: 'onemotoring-ongoing', agency: 'LTA', title: 'Ongoing car costs', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/owning/ongoing-car-costs.html', check: 'link', checkedOn: CHECKED },
  { id: 'onemotoring-road-tax', agency: 'LTA', title: 'Road tax', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/owning/ongoing-car-costs/road-tax.html', check: 'link', checkedOn: CHECKED },
  { id: 'onemotoring-selling', agency: 'LTA', title: 'Selling or deregistering a vehicle', url: 'https://onemotoring.lta.gov.sg/content/onemotoring/home/selling-deregistering.html', check: 'link', checkedOn: CHECKED },
  { id: 'lta-fares', agency: 'LTA', title: 'Public transport fare calculator', url: 'https://www.lta.gov.sg/content/ltagov/en/map/fare-calculator.html', check: 'link', checkedOn: CHECKED },

  // ---- Digital safety and personal admin -------------------------------------------
  { id: 'scamshield', agency: 'ScamShield', title: 'ScamShield — scam protection portal', url: 'https://www.scamshield.gov.sg/', check: 'content', checkedOn: CHECKED },
  { id: 'scamshield-check', agency: 'ScamShield', title: 'Check for scams (helpline 1799)', url: 'https://www.scamshield.gov.sg/check-for-scams/', check: 'link', checkedOn: CHECKED },
  { id: 'scamshield-report', agency: 'ScamShield', title: 'Report a scam', url: 'https://go.gov.sg/scamreport', check: 'link', checkedOn: CHECKED },
  { id: 'scamshield-app', agency: 'ScamShield', title: 'ScamShield app', url: 'https://go.gov.sg/scamshield-dynamic', check: 'link', checkedOn: CHECKED },
  { id: 'scamshield-learn', agency: 'ScamShield', title: 'Learn to recognise scams', url: 'https://www.scamshield.gov.sg/i-want-protection-from-scams/learn-to-recognise-scams/', check: 'link', checkedOn: CHECKED },
  { id: 'ica-passport', agency: 'ICA', title: 'Apply or renew a Singapore passport', url: 'https://www.ica.gov.sg/documents/passport/apply', check: 'link', checkedOn: CHECKED },
  { id: 'ica-myica', agency: 'ICA', title: 'MyICA e-services', url: 'https://eservices.ica.gov.sg/icsbip', check: 'link', checkedOn: CHECKED },
  { id: 'ica-ic-reregister', agency: 'ICA', title: 'Re-register identity card at 30 and 55', url: 'https://www.ica.gov.sg/documents/ic/re-registration', check: 'link', checkedOn: CHECKED },
  { id: 'ica-address', agency: 'ICA', title: 'Update residential address on identity card', url: 'https://www.ica.gov.sg/documents/ic/update_residential_address', check: 'link', checkedOn: CHECKED },

  // ---- Careers ---------------------------------------------------------------------
  { id: 'myskillsfuture', agency: 'SkillsFuture SG', title: 'MySkillsFuture — courses and credit', url: 'https://www.myskillsfuture.gov.sg', check: 'link', checkedOn: CHECKED },
  { id: 'mycareersfuture', agency: 'WSG', title: 'MyCareersFuture — jobs and career services', url: 'https://www.mycareersfuture.gov.sg', check: 'link', checkedOn: CHECKED },

  // ---- Money -----------------------------------------------------------------------
  { id: 'moneysense-decisions', agency: 'MoneySense', title: 'Navigating major financial decisions', url: 'https://www.moneysense.gov.sg/navigating-major-financial-decisions/', check: 'link', checkedOn: CHECKED },
  { id: 'cpf-retirement-planning', agency: 'CPF Board', title: 'Retirement planning (CPF infohub)', url: 'https://www.cpf.gov.sg/member/infohub/retirement-planning', check: 'link', checkedOn: CHECKED },
];

export const SOURCE_MAP: Record<string, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

export function getSources(ids: string[]): Source[] {
  return ids.map((id) => SOURCE_MAP[id]).filter((s): s is Source => Boolean(s));
}

export const CONTENT_CHECK_DATE = CHECKED;
