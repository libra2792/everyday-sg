/**
 * Core financial calculations used by every calculator.
 *
 * Design rules:
 *  - Pure functions, no DOM, no side effects.
 *  - Every function tolerates zero, empty, negative or absurd inputs and never returns NaN or Infinity.
 *  - Results are estimates based on the user's own assumptions; nothing here models official
 *    eligibility rules, CPF LIFE payouts, grants, tax rates or lender approval.
 */

const MAX_MONTHS = 1200; // 100 years — a hard stop for any simulation

export function safe(n: unknown, fallback = 0): number {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function nonNeg(n: unknown): number {
  return Math.max(0, safe(n));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Loans and mortgages                                                   */
/* ------------------------------------------------------------------ */

/**
 * Standard amortising monthly repayment.
 * M = P * r / (1 - (1 + r)^-n), where r is the monthly rate and n the number of months.
 * A zero rate degrades to straight-line P / n.
 */
export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const P = nonNeg(principal);
  const n = Math.round(nonNeg(years) * 12);
  if (P === 0 || n === 0) return 0;
  const r = nonNeg(annualRatePct) / 100 / 12;
  if (r === 0) return P / n;
  const factor = Math.pow(1 + r, -n);
  const denominator = 1 - factor;
  if (denominator <= 0) return P / n;
  return (P * r) / denominator;
}

export interface LoanTotals {
  monthly: number;
  months: number;
  totalPaid: number;
  totalInterest: number;
}

export function loanTotals(principal: number, annualRatePct: number, years: number): LoanTotals {
  const monthly = monthlyPayment(principal, annualRatePct, years);
  const months = Math.round(nonNeg(years) * 12);
  const totalPaid = monthly * months;
  return { monthly, months, totalPaid, totalInterest: Math.max(0, totalPaid - nonNeg(principal)) };
}

/** Remaining balance after `monthsElapsed` payments on an amortising loan. */
export function remainingBalance(principal: number, annualRatePct: number, years: number, monthsElapsed: number): number {
  const P = nonNeg(principal);
  const n = Math.round(nonNeg(years) * 12);
  const k = Math.min(n, Math.max(0, Math.round(monthsElapsed)));
  if (P === 0 || n === 0) return 0;
  const r = nonNeg(annualRatePct) / 100 / 12;
  if (r === 0) return Math.max(0, P - (P / n) * k);
  const M = monthlyPayment(P, annualRatePct, years);
  const growth = Math.pow(1 + r, k);
  const balance = P * growth - (M * (growth - 1)) / r;
  return Math.max(0, balance);
}

/**
 * Flat-rate instalment (common for car loans in Singapore): interest is charged on the
 * original principal for the whole tenure, so monthly = (P + P * rate * years) / months.
 */
export function flatRateMonthly(principal: number, annualRatePct: number, years: number): number {
  const P = nonNeg(principal);
  const months = Math.round(nonNeg(years) * 12);
  if (P === 0 || months === 0) return 0;
  const totalInterest = P * (nonNeg(annualRatePct) / 100) * nonNeg(years);
  return (P + totalInterest) / months;
}

/* ------------------------------------------------------------------ */
/* Budget                                                                */
/* ------------------------------------------------------------------ */

export type BudgetKind = 'essential' | 'lifestyle' | 'savings';

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  kind: BudgetKind;
}

export interface BudgetInputs {
  takeHomeIncome: number;
  otherIncome: number;
  categories: BudgetCategory[];
  desiredMonthlySavings: number;
  /** Suggested allocation in percent, e.g. 50 / 30 / 20 */
  allocation: { essential: number; lifestyle: number; savings: number };
}

export interface BudgetResult {
  totalIncome: number;
  totalExpenses: number; // excludes savings contributions
  totalSavings: number; // savings & investments categories
  totalOutgoings: number; // expenses + savings
  surplus: number; // income - outgoings (can be negative)
  savingsRate: number; // totalSavings / totalIncome (fraction)
  effectiveSavingsRate: number; // (totalSavings + max(surplus,0)) / totalIncome
  byKind: Record<BudgetKind, number>;
  suggested: Record<BudgetKind, number>; // income * allocation
  variance: Record<BudgetKind, number>; // actual - suggested
  desiredVsActual: { desired: number; actual: number; difference: number };
  breakdown: { id: string; name: string; amount: number; kind: BudgetKind; share: number }[];
}

export function budgetSummary(inputs: BudgetInputs): BudgetResult {
  const totalIncome = nonNeg(inputs.takeHomeIncome) + nonNeg(inputs.otherIncome);
  const byKind: Record<BudgetKind, number> = { essential: 0, lifestyle: 0, savings: 0 };
  const cats = (inputs.categories || []).map((c) => ({ ...c, amount: nonNeg(c.amount) }));
  for (const c of cats) byKind[c.kind] += c.amount;
  const totalSavings = byKind.savings;
  const totalExpenses = byKind.essential + byKind.lifestyle;
  const totalOutgoings = totalExpenses + totalSavings;
  const surplus = totalIncome - totalOutgoings;
  const savingsRate = totalIncome > 0 ? totalSavings / totalIncome : 0;
  const effectiveSavingsRate = totalIncome > 0 ? (totalSavings + Math.max(0, surplus)) / totalIncome : 0;
  const alloc = inputs.allocation || { essential: 50, lifestyle: 30, savings: 20 };
  const suggested: Record<BudgetKind, number> = {
    essential: (totalIncome * nonNeg(alloc.essential)) / 100,
    lifestyle: (totalIncome * nonNeg(alloc.lifestyle)) / 100,
    savings: (totalIncome * nonNeg(alloc.savings)) / 100,
  };
  const variance: Record<BudgetKind, number> = {
    essential: byKind.essential - suggested.essential,
    lifestyle: byKind.lifestyle - suggested.lifestyle,
    savings: byKind.savings - suggested.savings,
  };
  const actualSaved = totalSavings + Math.max(0, surplus);
  const desired = nonNeg(inputs.desiredMonthlySavings);
  const breakdown = cats
    .filter((c) => c.amount > 0)
    .map((c) => ({ id: c.id, name: c.name, amount: c.amount, kind: c.kind, share: totalOutgoings > 0 ? c.amount / totalOutgoings : 0 }))
    .sort((a, b) => b.amount - a.amount);
  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    totalOutgoings,
    surplus,
    savingsRate,
    effectiveSavingsRate,
    byKind,
    suggested,
    variance,
    desiredVsActual: { desired, actual: actualSaved, difference: actualSaved - desired },
    breakdown,
  };
}

/* ------------------------------------------------------------------ */
/* Emergency fund                                                        */
/* ------------------------------------------------------------------ */

export interface EmergencyFundResult {
  target: number;
  gap: number;
  monthsToTarget: number | null; // null when no contribution and a gap exists
  coverageNow: number; // months of essential expenses currently covered
}

export function emergencyFund(currentSavings: number, essentialMonthly: number, coverageMonths: number, monthlyContribution: number): EmergencyFundResult {
  const current = nonNeg(currentSavings);
  const essential = nonNeg(essentialMonthly);
  const target = essential * nonNeg(coverageMonths);
  const gap = Math.max(0, target - current);
  const contribution = nonNeg(monthlyContribution);
  let monthsToTarget: number | null;
  if (gap === 0) monthsToTarget = 0;
  else if (contribution <= 0) monthsToTarget = null;
  else monthsToTarget = Math.min(MAX_MONTHS, Math.ceil(gap / contribution));
  const coverageNow = essential > 0 ? current / essential : 0;
  return { target, gap, monthsToTarget, coverageNow };
}

/* ------------------------------------------------------------------ */
/* Debt repayment                                                        */
/* ------------------------------------------------------------------ */

export interface Debt {
  id: string;
  name: string;
  balance: number;
  aprPct: number;
  minPayment: number;
}

export type PayoffStrategy = 'avalanche' | 'snowball';

export interface DebtPayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  paidOff: boolean; // false if the simulation hit the cap
  perDebt: { id: string; name: string; payoffMonth: number | null; interest: number }[];
  balanceByMonth: number[]; // total balance at the end of each month, index 0 = start
  insufficientPayment: boolean; // minimum + extra does not cover the first month's interest
}

/**
 * Month-by-month simulation. Interest accrues monthly on each balance (APR / 12).
 * Minimum payments are paid on every debt; the extra budget goes to the priority debt
 * (highest APR for avalanche, lowest balance for snowball). When a debt is cleared,
 * its minimum payment rolls into the extra budget. Fees and rate changes are not modelled.
 */
export function debtPayoff(debts: Debt[], extraMonthly: number, strategy: PayoffStrategy = 'avalanche'): DebtPayoffResult {
  const working = (debts || [])
    .map((d) => ({ id: d.id, name: d.name, balance: nonNeg(d.balance), apr: nonNeg(d.aprPct), min: nonNeg(d.minPayment), interest: 0, payoffMonth: null as number | null }))
    .filter((d) => d.balance > 0);
  const extra = nonNeg(extraMonthly);
  const startBalance = working.reduce((s, d) => s + d.balance, 0);
  const balanceByMonth: number[] = [startBalance];
  if (working.length === 0) {
    return { months: 0, totalInterest: 0, totalPaid: 0, paidOff: true, perDebt: [], balanceByMonth, insufficientPayment: false };
  }

  const firstMonthInterest = working.reduce((s, d) => s + (d.balance * d.apr) / 100 / 12, 0);
  const firstMonthBudget = working.reduce((s, d) => s + d.min, 0) + extra;
  const insufficientPayment = firstMonthBudget <= firstMonthInterest;

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let rolledMinimums = 0;

  const pick = () => {
    const open = working.filter((d) => d.balance > 0);
    if (open.length === 0) return null;
    return open.reduce((best, d) => {
      if (strategy === 'avalanche') return d.apr > best.apr || (d.apr === best.apr && d.balance < best.balance) ? d : best;
      return d.balance < best.balance ? d : best;
    });
  };

  while (month < MAX_MONTHS) {
    const open = working.filter((d) => d.balance > 0);
    if (open.length === 0) break;
    month += 1;
    // 1. accrue interest
    for (const d of open) {
      const i = (d.balance * d.apr) / 100 / 12;
      d.balance += i;
      d.interest += i;
      totalInterest += i;
    }
    // 2. minimum payments
    for (const d of open) {
      const pay = Math.min(d.min, d.balance);
      d.balance -= pay;
      totalPaid += pay;
    }
    // 3. extra + rolled minimums to the priority debt, cascading leftovers
    let pool = extra + rolledMinimums;
    let guard = 0;
    while (pool > 0.005 && guard < 50) {
      guard += 1;
      const target = pick();
      if (!target) break;
      const pay = Math.min(pool, target.balance);
      target.balance -= pay;
      totalPaid += pay;
      pool -= pay;
    }
    // 4. mark payoffs, roll minimums
    for (const d of working) {
      if (d.balance <= 0.005 && d.payoffMonth === null) {
        d.balance = 0;
        d.payoffMonth = month;
        rolledMinimums += d.min;
      }
    }
    balanceByMonth.push(working.reduce((s, d) => s + d.balance, 0));
    if (insufficientPayment && month >= 360) break; // avoid a pointless 100-year loop
  }

  const paidOff = working.every((d) => d.balance === 0);
  return {
    months: month,
    totalInterest,
    totalPaid,
    paidOff,
    perDebt: working.map((d) => ({ id: d.id, name: d.name, payoffMonth: d.payoffMonth, interest: d.interest })),
    balanceByMonth,
    insufficientPayment,
  };
}

export function compareExtraPayments(debts: Debt[], extras: number[], strategy: PayoffStrategy) {
  return extras.map((extra) => {
    const r = debtPayoff(debts, extra, strategy);
    return { extra, months: r.months, totalInterest: r.totalInterest, paidOff: r.paidOff };
  });
}

/* ------------------------------------------------------------------ */
/* Housing affordability                                                 */
/* ------------------------------------------------------------------ */

export interface HousingInputs {
  grossMonthlyIncome: number;
  availableCash: number;
  availableCpf: number;
  propertyPrice: number;
  downPaymentPct: number; // user assumption
  cpfForDownPayment: number; // how much of the down payment the user intends to pay from CPF
  interestRatePct: number;
  tenureYears: number;
  renovationBudget: number;
  otherUpfrontCosts: number; // stamp duties, legal fees, valuation etc. (user estimate)
  monthlyRecurringCosts: number; // conservancy / maintenance, property tax, fire insurance etc.
  monthlyCpfOaContribution: number; // user may use OA to service the loan
  affordabilityLimitPct: number; // user-defined share of gross income for housing
}

export interface HousingResult {
  downPayment: number;
  loanAmount: number;
  monthlyLoan: number;
  totalInterest: number;
  upfrontTotal: number; // down payment + reno + other
  upfrontFromCpf: number;
  upfrontFromCash: number;
  cashShortfall: number; // if upfront cash needed exceeds available cash
  cpfShortfall: number;
  monthlyCommitment: number; // loan + recurring
  monthlyCashNeeded: number; // commitment less CPF OA contribution used
  commitmentShareOfIncome: number; // fraction
  limitAmount: number;
  withinLimit: boolean;
}

export function housingAffordability(i: HousingInputs): HousingResult {
  const price = nonNeg(i.propertyPrice);
  const dpPct = Math.min(100, nonNeg(i.downPaymentPct));
  const downPayment = (price * dpPct) / 100;
  const loanAmount = Math.max(0, price - downPayment);
  const monthlyLoan = monthlyPayment(loanAmount, i.interestRatePct, i.tenureYears);
  const totals = loanTotals(loanAmount, i.interestRatePct, i.tenureYears);
  const cpfForDp = Math.min(downPayment, nonNeg(i.cpfForDownPayment));
  const upfrontFromCpf = cpfForDp;
  const upfrontFromCash = downPayment - cpfForDp + nonNeg(i.renovationBudget) + nonNeg(i.otherUpfrontCosts);
  const upfrontTotal = upfrontFromCpf + upfrontFromCash;
  const cashShortfall = Math.max(0, upfrontFromCash - nonNeg(i.availableCash));
  const cpfShortfall = Math.max(0, upfrontFromCpf - nonNeg(i.availableCpf));
  const monthlyCommitment = monthlyLoan + nonNeg(i.monthlyRecurringCosts);
  const monthlyCashNeeded = Math.max(0, monthlyCommitment - Math.min(monthlyLoan, nonNeg(i.monthlyCpfOaContribution)));
  const income = nonNeg(i.grossMonthlyIncome);
  const commitmentShareOfIncome = income > 0 ? monthlyCommitment / income : 0;
  const limitAmount = (income * nonNeg(i.affordabilityLimitPct)) / 100;
  return {
    downPayment,
    loanAmount,
    monthlyLoan,
    totalInterest: totals.totalInterest,
    upfrontTotal,
    upfrontFromCpf,
    upfrontFromCash,
    cashShortfall,
    cpfShortfall,
    monthlyCommitment,
    monthlyCashNeeded,
    commitmentShareOfIncome,
    limitAmount,
    withinLimit: income > 0 ? monthlyCommitment <= limitAmount : true,
  };
}

/* ------------------------------------------------------------------ */
/* Baby and childcare                                                    */
/* ------------------------------------------------------------------ */

export interface ChildcareScenario {
  id: string;
  name: string;
  monthlyFee: number;
  monthlySubsidy: number; // user-entered assumption
}

export interface BabyInputs {
  numberOfChildren: number;
  setupBudget: number; // one-time, per child
  deliveryOutOfPocket: number; // one-time, per child
  monthlyInfantCost: number; // per child
  otherMonthlyCost: number; // per child
  lostIncomeDuringLeave: number; // one-time, household
  scenarios: ChildcareScenario[];
  selectedScenarioId: string;
  horizonYears: number;
  householdMonthlyIncome: number;
}

export interface BabyResult {
  oneTimeTotal: number;
  monthlyTotal: number; // all children, selected scenario
  annualTotal: number;
  firstYearTotal: number; // one-time + 12 months
  horizonTotal: number;
  cashFlowShare: number; // monthly total / household income
  scenarioComparison: { id: string; name: string; netMonthly: number; monthlyTotal: number; annualTotal: number }[];
}

export function babyBudget(i: BabyInputs): BabyResult {
  const children = Math.max(0, Math.round(safe(i.numberOfChildren, 1)));
  const oneTimeTotal = (nonNeg(i.setupBudget) + nonNeg(i.deliveryOutOfPocket)) * children + nonNeg(i.lostIncomeDuringLeave);
  const baseMonthlyPerChild = nonNeg(i.monthlyInfantCost) + nonNeg(i.otherMonthlyCost);
  const scenarios = i.scenarios && i.scenarios.length > 0 ? i.scenarios : [{ id: 'none', name: 'No paid childcare', monthlyFee: 0, monthlySubsidy: 0 }];
  const scenarioComparison = scenarios.map((s) => {
    const netMonthly = Math.max(0, nonNeg(s.monthlyFee) - nonNeg(s.monthlySubsidy));
    const monthlyTotal = (baseMonthlyPerChild + netMonthly) * children;
    return { id: s.id, name: s.name, netMonthly, monthlyTotal, annualTotal: monthlyTotal * 12 };
  });
  const selected = scenarioComparison.find((s) => s.id === i.selectedScenarioId) || scenarioComparison[0];
  const monthlyTotal = selected.monthlyTotal;
  const annualTotal = monthlyTotal * 12;
  const horizon = Math.min(25, nonNeg(i.horizonYears));
  const income = nonNeg(i.householdMonthlyIncome);
  return {
    oneTimeTotal,
    monthlyTotal,
    annualTotal,
    firstYearTotal: oneTimeTotal + annualTotal,
    horizonTotal: oneTimeTotal + annualTotal * horizon,
    cashFlowShare: income > 0 ? monthlyTotal / income : 0,
    scenarioComparison,
  };
}

/* ------------------------------------------------------------------ */
/* Retirement projection                                                 */
/* ------------------------------------------------------------------ */

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  monthlySpendingToday: number; // in today's dollars
  nominalReturnPct: number; // annual, before inflation
  inflationPct: number; // annual
  otherMonthlyIncomeToday: number; // in today's dollars, e.g. expected annuity or rental
  planToAge: number; // e.g. 90
}

export interface RetirementYearPoint {
  age: number;
  nominal: number;
  real: number; // in today's dollars
}

export interface RetirementResult {
  yearsToRetirement: number;
  yearsInRetirement: number;
  savingsAtRetirementNominal: number;
  savingsAtRetirementReal: number;
  futureMonthlySpending: number; // at retirement, inflated
  futureOtherIncome: number; // at retirement, inflated
  monthlyGapAtRetirement: number; // spending - other income (nominal, at retirement)
  monthlyGapToday: number; // same in today's dollars
  requiredCapital: number; // capital needed at retirement to fund the gap until planToAge
  shortfall: number; // requiredCapital - savingsAtRetirementNominal (positive = short)
  fundsLastUntilAge: number | null; // null = beyond planToAge
  sustainableMonthlyToday: number; // what the projected savings could fund per month (today's dollars) until planToAge
  trajectory: RetirementYearPoint[];
  contributionsTotal: number;
}

/** Future value of a lump sum plus level monthly contributions, compounded monthly. */
export function futureValue(present: number, monthlyContribution: number, annualRatePct: number, years: number): number {
  const r = safe(annualRatePct) / 100 / 12;
  const n = Math.round(nonNeg(years) * 12);
  const P = nonNeg(present);
  const c = nonNeg(monthlyContribution);
  if (n === 0) return P;
  if (Math.abs(r) < 1e-12) return P + c * n;
  const growth = Math.pow(1 + r, n);
  return P * growth + (c * (growth - 1)) / r;
}

/**
 * Capital needed at retirement to pay a withdrawal that starts at `firstMonthly` and grows
 * with inflation every year, for `years` years, while the remaining capital earns `nominalPct`.
 * Uses the real-return growing-annuity formula on an annual basis.
 */
export function requiredCapitalForGap(firstMonthly: number, nominalPct: number, inflationPct: number, years: number): number {
  const annual = nonNeg(firstMonthly) * 12;
  const n = nonNeg(years);
  if (annual === 0 || n === 0) return 0;
  const i = safe(nominalPct) / 100;
  const g = safe(inflationPct) / 100;
  const realRate = (1 + i) / (1 + g) - 1;
  if (Math.abs(realRate) < 1e-9) return annual * n;
  // present value of an annuity-due-like stream in real terms
  return annual * ((1 - Math.pow(1 + realRate, -n)) / realRate);
}

export function projectRetirement(i: RetirementInputs): RetirementResult {
  const currentAge = Math.max(0, Math.round(safe(i.currentAge, 30)));
  const retirementAge = Math.max(currentAge, Math.round(safe(i.retirementAge, 65)));
  const planToAge = Math.max(retirementAge, Math.round(safe(i.planToAge, 90)));
  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = planToAge - retirementAge;
  const ret = safe(i.nominalReturnPct) / 100;
  const infl = safe(i.inflationPct) / 100;
  const monthlyRate = ret / 12;

  // Accumulation trajectory, year by year
  const trajectory: RetirementYearPoint[] = [];
  let balance = nonNeg(i.currentSavings);
  let contributionsTotal = 0;
  trajectory.push({ age: currentAge, nominal: balance, real: balance });
  for (let y = 1; y <= yearsToRetirement; y += 1) {
    for (let m = 0; m < 12; m += 1) {
      balance = balance * (1 + monthlyRate) + nonNeg(i.monthlyContribution);
      contributionsTotal += nonNeg(i.monthlyContribution);
    }
    const deflator = Math.pow(1 + infl, y);
    trajectory.push({ age: currentAge + y, nominal: balance, real: deflator > 0 ? balance / deflator : balance });
  }
  const savingsAtRetirementNominal = balance;
  const inflationFactor = Math.pow(1 + infl, yearsToRetirement);
  const savingsAtRetirementReal = inflationFactor > 0 ? savingsAtRetirementNominal / inflationFactor : savingsAtRetirementNominal;
  const futureMonthlySpending = nonNeg(i.monthlySpendingToday) * inflationFactor;
  const futureOtherIncome = nonNeg(i.otherMonthlyIncomeToday) * inflationFactor;
  const monthlyGapAtRetirement = Math.max(0, futureMonthlySpending - futureOtherIncome);
  const monthlyGapToday = Math.max(0, nonNeg(i.monthlySpendingToday) - nonNeg(i.otherMonthlyIncomeToday));
  const requiredCapital = requiredCapitalForGap(monthlyGapAtRetirement, i.nominalReturnPct, i.inflationPct, yearsInRetirement);
  const shortfall = requiredCapital - savingsAtRetirementNominal;

  // Drawdown simulation: withdraw the gap, indexed to inflation each year
  let fundsLastUntilAge: number | null = null;
  let draw = balance;
  let withdrawal = monthlyGapAtRetirement;
  for (let y = 1; y <= yearsInRetirement; y += 1) {
    for (let m = 0; m < 12; m += 1) {
      draw = draw * (1 + monthlyRate) - withdrawal;
      if (draw < 0) break;
    }
    const age = retirementAge + y;
    trajectory.push({ age, nominal: Math.max(0, draw), real: Math.max(0, draw) / Math.pow(1 + infl, yearsToRetirement + y) });
    if (draw < 0) {
      fundsLastUntilAge = age;
      break;
    }
    withdrawal *= 1 + infl;
  }
  if (monthlyGapAtRetirement === 0) fundsLastUntilAge = null;

  // Sustainable monthly in today's dollars: invert requiredCapital for the projected savings
  const unitCapital = requiredCapitalForGap(1, i.nominalReturnPct, i.inflationPct, yearsInRetirement);
  const sustainableAtRetirement = unitCapital > 0 ? savingsAtRetirementNominal / unitCapital : 0;
  const sustainableMonthlyToday = inflationFactor > 0 ? sustainableAtRetirement / inflationFactor : sustainableAtRetirement;

  return {
    yearsToRetirement,
    yearsInRetirement,
    savingsAtRetirementNominal,
    savingsAtRetirementReal,
    futureMonthlySpending,
    futureOtherIncome,
    monthlyGapAtRetirement,
    monthlyGapToday,
    requiredCapital,
    shortfall,
    fundsLastUntilAge,
    sustainableMonthlyToday,
    trajectory,
    contributionsTotal,
  };
}

/* ------------------------------------------------------------------ */
/* Insurance needs (income protection)                                   */
/* ------------------------------------------------------------------ */

export interface InsuranceInputs {
  dependants: number;
  yearsOfIncomeReplacement: number;
  annualHouseholdExpenses: number;
  outstandingDebts: number;
  futureCommitments: number; // education, parents' care, etc.
  existingLifeCoverage: number;
  liquidAssetsToCount: number;
}

export interface InsuranceResult {
  incomeReplacement: number;
  totalNeed: number;
  resources: number;
  gap: number; // positive = shortfall, negative = surplus
}

export function insuranceNeed(i: InsuranceInputs): InsuranceResult {
  const incomeReplacement = nonNeg(i.yearsOfIncomeReplacement) * nonNeg(i.annualHouseholdExpenses);
  const totalNeed = incomeReplacement + nonNeg(i.outstandingDebts) + nonNeg(i.futureCommitments);
  const resources = nonNeg(i.existingLifeCoverage) + nonNeg(i.liquidAssetsToCount);
  return { incomeReplacement, totalNeed, resources, gap: totalNeed - resources };
}

/* ------------------------------------------------------------------ */
/* Caregiving and eldercare                                              */
/* ------------------------------------------------------------------ */

export interface Contributor {
  id: string;
  name: string;
  sharePct: number;
}

export interface CaregivingInputs {
  homeCare: number;
  helper: number;
  transport: number;
  medical: number;
  other: number;
  monthlyBudget: number; // the family's intended monthly care budget
  monthlySupport: number; // subsidies / support the user expects (own estimate)
  contributors: Contributor[];
  durationYears: number;
  inflationPct: number;
}

export interface CaregivingResult {
  monthlyTotal: number;
  annualTotal: number;
  monthlyAfterSupport: number;
  budgetGap: number; // monthlyAfterSupport - monthlyBudget (positive = over budget)
  contributions: { id: string; name: string; sharePct: number; monthly: number; annual: number }[];
  sharesTotalPct: number;
  monthlyShortfall: number; // after support and contributions
  durationTotalNoInflation: number;
  durationTotalWithInflation: number;
  yearByYear: { year: number; annual: number }[];
}

export function caregivingPlan(i: CaregivingInputs): CaregivingResult {
  const monthlyTotal = nonNeg(i.homeCare) + nonNeg(i.helper) + nonNeg(i.transport) + nonNeg(i.medical) + nonNeg(i.other);
  const monthlyAfterSupport = Math.max(0, monthlyTotal - nonNeg(i.monthlySupport));
  const contributors = (i.contributors || []).map((c) => ({ ...c, sharePct: nonNeg(c.sharePct) }));
  const sharesTotalPct = contributors.reduce((s, c) => s + c.sharePct, 0);
  const contributions = contributors.map((c) => {
    const monthly = (monthlyAfterSupport * Math.min(100, c.sharePct)) / 100;
    return { id: c.id, name: c.name, sharePct: c.sharePct, monthly, annual: monthly * 12 };
  });
  const covered = contributions.reduce((s, c) => s + c.monthly, 0);
  const monthlyShortfall = Math.max(0, monthlyAfterSupport - covered);
  const years = Math.min(40, nonNeg(i.durationYears));
  const infl = safe(i.inflationPct) / 100;
  const yearByYear: { year: number; annual: number }[] = [];
  let withInflation = 0;
  for (let y = 1; y <= Math.ceil(years); y += 1) {
    const fraction = Math.min(1, years - (y - 1));
    const annual = monthlyAfterSupport * 12 * Math.pow(1 + infl, y - 1) * fraction;
    withInflation += annual;
    yearByYear.push({ year: y, annual });
  }
  return {
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    monthlyAfterSupport,
    budgetGap: monthlyAfterSupport - nonNeg(i.monthlyBudget),
    contributions,
    sharesTotalPct,
    monthlyShortfall,
    durationTotalNoInflation: monthlyAfterSupport * 12 * years,
    durationTotalWithInflation: withInflation,
    yearByYear,
  };
}

/* ------------------------------------------------------------------ */
/* Car ownership                                                         */
/* ------------------------------------------------------------------ */

export interface CarInputs {
  purchasePrice: number;
  initialPayment: number;
  otherUpfrontCosts: number; // e.g. registration, first insurance, accessories (user estimate)
  loanInterestPct: number;
  loanTenureYears: number;
  loanType: 'flat' | 'reducing';
  resaleValueAtEnd: number; // user estimate at the end of the ownership period
  insuranceAnnual: number;
  roadTaxAnnual: number;
  fuelMonthly: number;
  parkingMonthly: number;
  erpAndTollsMonthly: number;
  maintenanceAnnual: number;
  annualMileageKm: number;
  ownershipYears: number;
  alternativeTransportMonthly: number; // user-defined public transport / alternative budget
}

export interface CarResult {
  loanAmount: number;
  loanMonthly: number;
  loanMonths: number;
  totalLoanInterest: number;
  upfrontCash: number;
  runningMonthly: number; // excluding loan instalment
  cashOutflowMonthly: number; // running + loan (while the loan runs)
  cashOutflowAnnualYear1: number;
  totalCashOutflow: number; // over the ownership period (upfront + instalments within period + running)
  depreciation: number; // price - resale
  economicCost: number; // depreciation + interest + running costs over the period
  economicCostMonthly: number;
  economicCostAnnual: number;
  costPerKm: number | null;
  alternativeTotal: number;
  differenceVsAlternative: number; // economic cost - alternative total (positive = car costs more)
  loanExtendsBeyondOwnership: boolean;
}

export function carOwnershipCost(i: CarInputs): CarResult {
  const price = nonNeg(i.purchasePrice);
  const initial = Math.min(price, nonNeg(i.initialPayment));
  const loanAmount = Math.max(0, price - initial);
  const tenure = nonNeg(i.loanTenureYears);
  const loanMonths = Math.round(tenure * 12);
  const loanMonthly = loanAmount > 0 && loanMonths > 0 ? (i.loanType === 'reducing' ? monthlyPayment(loanAmount, i.loanInterestPct, tenure) : flatRateMonthly(loanAmount, i.loanInterestPct, tenure)) : 0;
  const totalLoanInterest = Math.max(0, loanMonthly * loanMonths - loanAmount);
  const years = Math.min(30, nonNeg(i.ownershipYears));
  const ownershipMonths = Math.round(years * 12);
  const runningMonthly = (nonNeg(i.insuranceAnnual) + nonNeg(i.roadTaxAnnual) + nonNeg(i.maintenanceAnnual)) / 12 + nonNeg(i.fuelMonthly) + nonNeg(i.parkingMonthly) + nonNeg(i.erpAndTollsMonthly);
  const upfrontCash = initial + nonNeg(i.otherUpfrontCosts);
  const instalmentMonthsInPeriod = Math.min(loanMonths, ownershipMonths);
  const instalmentsInPeriod = loanMonthly * instalmentMonthsInPeriod;
  const runningTotal = runningMonthly * ownershipMonths;
  const totalCashOutflow = upfrontCash + instalmentsInPeriod + runningTotal;
  const resale = Math.min(price, nonNeg(i.resaleValueAtEnd));
  const depreciation = Math.max(0, price - resale);
  // Interest attributable to the period: if the loan outlasts ownership, the remaining principal is
  // settled from the resale proceeds; we count only the interest within the period for the flat-rate
  // approximation, and the amortised interest for reducing loans.
  let interestInPeriod = 0;
  if (loanAmount > 0 && loanMonths > 0) {
    if (i.loanType === 'reducing') {
      const paid = loanMonthly * instalmentMonthsInPeriod;
      const remaining = remainingBalance(loanAmount, i.loanInterestPct, tenure, instalmentMonthsInPeriod);
      interestInPeriod = Math.max(0, paid - (loanAmount - remaining));
    } else {
      interestInPeriod = totalLoanInterest * (loanMonths > 0 ? instalmentMonthsInPeriod / loanMonths : 0);
    }
  }
  const economicCost = depreciation + interestInPeriod + runningTotal + nonNeg(i.otherUpfrontCosts);
  const economicCostMonthly = ownershipMonths > 0 ? economicCost / ownershipMonths : 0;
  const totalKm = nonNeg(i.annualMileageKm) * years;
  const costPerKm = totalKm > 0 ? economicCost / totalKm : null;
  const alternativeTotal = nonNeg(i.alternativeTransportMonthly) * ownershipMonths;
  return {
    loanAmount,
    loanMonthly,
    loanMonths,
    totalLoanInterest,
    upfrontCash,
    runningMonthly,
    cashOutflowMonthly: runningMonthly + loanMonthly,
    cashOutflowAnnualYear1: (runningMonthly + loanMonthly) * 12,
    totalCashOutflow,
    depreciation,
    economicCost,
    economicCostMonthly,
    economicCostAnnual: economicCostMonthly * 12,
    costPerKm,
    alternativeTotal,
    differenceVsAlternative: economicCost - alternativeTotal,
    loanExtendsBeyondOwnership: loanMonths > ownershipMonths,
  };
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                          */
/* ------------------------------------------------------------------ */

export function inflate(todayAmount: number, inflationPct: number, years: number): number {
  return nonNeg(todayAmount) * Math.pow(1 + safe(inflationPct) / 100, nonNeg(years));
}

export function deflate(futureAmount: number, inflationPct: number, years: number): number {
  const f = Math.pow(1 + safe(inflationPct) / 100, nonNeg(years));
  return f > 0 ? nonNeg(futureAmount) / f : nonNeg(futureAmount);
}
