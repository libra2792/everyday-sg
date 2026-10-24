import type { Category, LifeStage } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'money',
    name: 'Money and everyday finances',
    shortName: 'Money',
    description: 'Budgeting, emergency savings, debt, credit cards, cash flow, bills and subscriptions.',
    topics: ['Budgeting', 'Emergency savings', 'Debt repayment', 'Credit cards', 'Cash flow', 'Bills and subscriptions', 'Irregular expenses'],
    icon: 'wallet',
  },
  {
    id: 'housing',
    name: 'Housing and home ownership',
    shortName: 'Housing',
    description: 'BTO and resale planning, renting, affordability, mortgages, CPF housing use, renovation and moving.',
    topics: ['BTO and resale', 'Renting', 'Affordability', 'Mortgage', 'CPF for housing', 'Renovation', 'Moving'],
    icon: 'home',
  },
  {
    id: 'parenting',
    name: 'Pregnancy, babies and parenting',
    shortName: 'Parenting',
    description: 'Pre-pregnancy preparation, delivery, newborn essentials, parental leave, childcare, preschool and education savings.',
    topics: ['Pregnancy', 'Delivery', 'Newborn essentials', 'Parental leave', 'Baby expenses', 'Childcare and preschool', 'Education savings'],
    icon: 'baby',
  },
  {
    id: 'parents',
    name: 'Supporting ageing parents',
    shortName: 'Ageing parents',
    description: 'Caregiving, medical costs, healthcare subsidies, home care, long-term care, family cost-sharing and advance planning.',
    topics: ['Caregiving', 'Medical expenses', 'Healthcare subsidies', 'Home care', 'Long-term care', 'Respite', 'Family cost-sharing'],
    icon: 'heart-handshake',
  },
  {
    id: 'insurance',
    name: 'Insurance and healthcare',
    shortName: 'Insurance',
    description: 'Health, life, disability and critical illness coverage, employer benefits, premiums, claims and screening.',
    topics: ['Health coverage', 'Life insurance', 'Disability and critical illness', 'Employer benefits', 'Premiums', 'Claims', 'Preventive screening'],
    icon: 'shield-check',
  },
  {
    id: 'cpf-tax-retirement',
    name: 'CPF, tax, investing and retirement',
    shortName: 'CPF and retirement',
    description: 'CPF accounts and CPF LIFE, retirement savings, SRS, tax filing and reliefs, investing and inflation.',
    topics: ['CPF accounts', 'CPF LIFE', 'Retirement savings', 'SRS', 'Tax filing', 'Tax reliefs', 'Investing', 'Inflation'],
    icon: 'piggy-bank',
  },
  {
    id: 'careers',
    name: 'Careers and income security',
    shortName: 'Careers',
    description: 'Job changes, salary comparisons, benefits, resignation, retrenchment, upskilling and variable income.',
    topics: ['Job changes', 'Salary comparison', 'Benefits', 'Resignation', 'Retrenchment', 'SkillsFuture', 'Freelance income'],
    icon: 'briefcase',
  },
  {
    id: 'marriage',
    name: 'Marriage and family administration',
    shortName: 'Marriage and family',
    description: 'Shared budgets, marriage preparation, joint commitments, family planning, separation admin and beneficiary reviews.',
    topics: ['Shared budgets', 'Marriage preparation', 'Joint commitments', 'Family planning', 'Separation admin', 'Guardianship', 'Beneficiaries'],
    icon: 'users',
  },
  {
    id: 'legal',
    name: 'Legal, estate and end-of-life planning',
    shortName: 'Legal and estate',
    description: 'Wills, Lasting Power of Attorney, Advance Care Planning, nominations, document organisation and bereavement.',
    topics: ['Wills', 'Lasting Power of Attorney', 'Advance Care Planning', 'CPF nomination', 'Insurance nomination', 'Document organisation', 'Bereavement'],
    icon: 'scroll-text',
  },
  {
    id: 'transport',
    name: 'Transport and major purchases',
    shortName: 'Transport',
    description: 'Car ownership costs, vehicle financing, public transport comparisons, depreciation and major-purchase budgeting.',
    topics: ['Car ownership', 'Vehicle financing', 'Public transport', 'Depreciation', 'Insurance', 'Parking and fuel', 'Major purchases'],
    icon: 'car',
  },
  {
    id: 'digital',
    name: 'Digital safety and personal administration',
    shortName: 'Digital safety',
    description: 'Scam awareness, account and Singpass security, passwords, passports, document renewals, warranties and contracts.',
    topics: ['Scam awareness', 'Account security', 'Singpass', 'Password management', 'Passport', 'Document renewals', 'Warranties and contracts'],
    icon: 'lock-keyhole',
  },
  {
    id: 'wellbeing',
    name: 'Health, wellbeing and household organisation',
    shortName: 'Wellbeing',
    description: 'Healthcare navigation, screening, mental health resources, caregiver wellbeing, routines, moving and annual maintenance.',
    topics: ['Healthcare navigation', 'Screening reminders', 'Mental health', 'Caregiver wellbeing', 'Routines', 'Moving checklist', 'Annual life admin'],
    icon: 'leaf',
  },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const LIFE_STAGES: LifeStage[] = [
  {
    id: 'starting-out',
    name: 'Starting out',
    description: 'First jobs, first budgets, building habits and savings.',
    categories: ['money', 'careers', 'digital', 'insurance'],
  },
  {
    id: 'building',
    name: 'Building a base',
    description: 'A home, a partner, a career path and protection in place.',
    categories: ['housing', 'marriage', 'insurance', 'cpf-tax-retirement'],
  },
  {
    id: 'family',
    name: 'Growing a family',
    description: 'Pregnancy, newborns, childcare and the budget that goes with it.',
    categories: ['parenting', 'insurance', 'legal', 'housing'],
  },
  {
    id: 'midlife',
    name: 'Mid-life',
    description: 'Caring for parents, reviewing retirement and simplifying admin.',
    categories: ['parents', 'cpf-tax-retirement', 'legal', 'wellbeing'],
  },
  {
    id: 'later-life',
    name: 'Later life',
    description: 'Retirement income, health, estate planning and staying independent.',
    categories: ['cpf-tax-retirement', 'legal', 'wellbeing', 'parents'],
  },
];

export const LIFE_STAGE_MAP: Record<string, LifeStage> = Object.fromEntries(LIFE_STAGES.map((s) => [s.id, s]));
