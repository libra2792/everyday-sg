import { describe, expect, it } from 'vitest';
import {
  babyBudget,
  budgetSummary,
  carOwnershipCost,
  caregivingPlan,
  compareExtraPayments,
  debtPayoff,
  emergencyFund,
  flatRateMonthly,
  futureValue,
  housingAffordability,
  insuranceNeed,
  loanTotals,
  monthlyPayment,
  projectRetirement,
  remainingBalance,
  requiredCapitalForGap,
} from './finance';

const finite = (n: number) => expect(Number.isFinite(n)).toBe(true);

describe('monthlyPayment', () => {
  it('matches the standard amortisation formula for a realistic HDB-sized loan', () => {
    // $400,000 at 2.6% over 25 years ≈ $1,814.6 per month (HDB loan-style example)
    const m = monthlyPayment(400_000, 2.6, 25);
    expect(m).toBeCloseTo(1814.6, 0);
  });
  it('matches a bank-loan style example', () => {
    // $1,000,000 at 4% over 30 years = $4,774.15
    expect(monthlyPayment(1_000_000, 4, 30)).toBeCloseTo(4774.15, 1);
  });
  it('degrades to straight-line when the rate is zero', () => {
    expect(monthlyPayment(120_000, 0, 10)).toBeCloseTo(1000, 6);
  });
  it('returns 0 for zero principal or zero tenure and never NaN', () => {
    expect(monthlyPayment(0, 3, 25)).toBe(0);
    expect(monthlyPayment(300_000, 3, 0)).toBe(0);
    expect(monthlyPayment(-5, 3, 10)).toBe(0);
    finite(monthlyPayment(Number.NaN, Number.NaN, Number.NaN));
  });
  it('remaining balance hits zero at maturity and starts at principal', () => {
    expect(remainingBalance(300_000, 3, 25, 0)).toBeCloseTo(300_000, 2);
    expect(remainingBalance(300_000, 3, 25, 300)).toBeCloseTo(0, 2);
    expect(remainingBalance(300_000, 0, 25, 150)).toBeCloseTo(150_000, 2);
  });
  it('loanTotals interest is total paid minus principal', () => {
    const t = loanTotals(400_000, 2.6, 25);
    expect(t.totalPaid).toBeCloseTo(t.monthly * 300, 6);
    expect(t.totalInterest).toBeCloseTo(t.totalPaid - 400_000, 6);
    expect(t.totalInterest).toBeGreaterThan(0);
  });
  it('flat-rate instalment charges interest on the original principal', () => {
    // $50,000 at 2.78% flat over 5 years → (50,000 + 50,000*0.0278*5)/60 = 949.17
    expect(flatRateMonthly(50_000, 2.78, 5)).toBeCloseTo(949.17, 1);
    expect(flatRateMonthly(0, 2.78, 5)).toBe(0);
  });
});

describe('budgetSummary', () => {
  const base = {
    takeHomeIncome: 5000,
    otherIncome: 500,
    desiredMonthlySavings: 1200,
    allocation: { essential: 50, lifestyle: 30, savings: 20 },
    categories: [
      { id: 'h', name: 'Housing', amount: 1500, kind: 'essential' as const },
      { id: 'f', name: 'Food', amount: 800, kind: 'essential' as const },
      { id: 'p', name: 'Personal', amount: 700, kind: 'lifestyle' as const },
      { id: 's', name: 'Savings', amount: 1000, kind: 'savings' as const },
    ],
  };
  it('computes totals, surplus and rates', () => {
    const r = budgetSummary(base);
    expect(r.totalIncome).toBe(5500);
    expect(r.totalExpenses).toBe(3000);
    expect(r.totalSavings).toBe(1000);
    expect(r.surplus).toBe(1500);
    expect(r.savingsRate).toBeCloseTo(1000 / 5500, 6);
    expect(r.effectiveSavingsRate).toBeCloseTo(2500 / 5500, 6);
    expect(r.suggested.essential).toBe(2750);
    expect(r.desiredVsActual.difference).toBe(2500 - 1200);
  });
  it('handles zero income and negative amounts without NaN', () => {
    const r = budgetSummary({ ...base, takeHomeIncome: 0, otherIncome: 0, categories: [{ id: 'x', name: 'X', amount: -50, kind: 'essential' }] });
    expect(r.savingsRate).toBe(0);
    expect(r.totalExpenses).toBe(0);
    finite(r.effectiveSavingsRate);
  });
  it('reports a deficit when outgoings exceed income', () => {
    const r = budgetSummary({ ...base, takeHomeIncome: 2000, otherIncome: 0 });
    expect(r.surplus).toBe(-2000);
    expect(r.effectiveSavingsRate).toBeCloseTo(1000 / 2000, 6);
  });
});

describe('emergencyFund', () => {
  it('computes target, gap and months to target', () => {
    const r = emergencyFund(3000, 2500, 6, 500);
    expect(r.target).toBe(15_000);
    expect(r.gap).toBe(12_000);
    expect(r.monthsToTarget).toBe(24);
    expect(r.coverageNow).toBeCloseTo(1.2, 6);
  });
  it('returns null months when there is a gap but no contribution', () => {
    expect(emergencyFund(0, 2000, 3, 0).monthsToTarget).toBeNull();
  });
  it('returns 0 months when already funded and handles zero expenses', () => {
    expect(emergencyFund(20_000, 2000, 6, 0).monthsToTarget).toBe(0);
    expect(emergencyFund(0, 0, 6, 0).coverageNow).toBe(0);
  });
});

describe('debtPayoff', () => {
  const debts = [
    { id: 'a', name: 'Credit card', balance: 5000, aprPct: 26, minPayment: 150 },
    { id: 'b', name: 'Personal loan', balance: 10_000, aprPct: 7, minPayment: 300 },
  ];
  it('pays off everything with sensible interest and ordering (avalanche)', () => {
    const r = debtPayoff(debts, 400, 'avalanche');
    expect(r.paidOff).toBe(true);
    expect(r.months).toBeGreaterThan(12);
    expect(r.months).toBeLessThan(60);
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.totalPaid).toBeCloseTo(15_000 + r.totalInterest, 0);
    const card = r.perDebt.find((d) => d.id === 'a')!;
    const loan = r.perDebt.find((d) => d.id === 'b')!;
    expect(card.payoffMonth!).toBeLessThan(loan.payoffMonth!);
    expect(r.balanceByMonth[0]).toBe(15_000);
    expect(r.balanceByMonth[r.balanceByMonth.length - 1]).toBe(0);
  });
  it('snowball clears the smaller balance first', () => {
    const r = debtPayoff(
      [
        { id: 'small', name: 'S', balance: 1000, aprPct: 5, minPayment: 50 },
        { id: 'big', name: 'B', balance: 8000, aprPct: 25, minPayment: 200 },
      ],
      200,
      'snowball',
    );
    const small = r.perDebt.find((d) => d.id === 'small')!;
    const big = r.perDebt.find((d) => d.id === 'big')!;
    expect(small.payoffMonth!).toBeLessThan(big.payoffMonth!);
  });
  it('more extra payment means fewer months and less interest', () => {
    const rows = compareExtraPayments(debts, [0, 200, 500], 'avalanche');
    expect(rows[0].months).toBeGreaterThan(rows[1].months);
    expect(rows[1].months).toBeGreaterThan(rows[2].months);
    expect(rows[0].totalInterest).toBeGreaterThan(rows[2].totalInterest);
  });
  it('flags payments that do not cover interest and stops safely', () => {
    const r = debtPayoff([{ id: 'x', name: 'X', balance: 10_000, aprPct: 30, minPayment: 100 }], 0, 'avalanche');
    expect(r.insufficientPayment).toBe(true);
    expect(r.paidOff).toBe(false);
    finite(r.totalInterest);
  });
  it('handles empty, zero and negative balances', () => {
    expect(debtPayoff([], 100).months).toBe(0);
    expect(debtPayoff([{ id: 'z', name: 'Z', balance: 0, aprPct: 10, minPayment: 10 }], 100).paidOff).toBe(true);
    expect(debtPayoff([{ id: 'n', name: 'N', balance: -500, aprPct: 10, minPayment: 10 }], 100).months).toBe(0);
  });
  it('zero-interest debt pays off in balance / payment months', () => {
    const r = debtPayoff([{ id: 'z', name: 'Z', balance: 1200, aprPct: 0, minPayment: 100 }], 0);
    expect(r.months).toBe(12);
    expect(r.totalInterest).toBe(0);
  });
});

describe('housingAffordability', () => {
  const inputs = {
    grossMonthlyIncome: 9000,
    availableCash: 60_000,
    availableCpf: 120_000,
    propertyPrice: 550_000,
    downPaymentPct: 25,
    cpfForDownPayment: 100_000,
    interestRatePct: 3,
    tenureYears: 25,
    renovationBudget: 40_000,
    otherUpfrontCosts: 15_000,
    monthlyRecurringCosts: 300,
    monthlyCpfOaContribution: 1500,
    affordabilityLimitPct: 30,
  };
  it('splits upfront between CPF and cash and computes the loan', () => {
    const r = housingAffordability(inputs);
    expect(r.downPayment).toBe(137_500);
    expect(r.loanAmount).toBe(412_500);
    expect(r.upfrontFromCpf).toBe(100_000);
    expect(r.upfrontFromCash).toBe(37_500 + 40_000 + 15_000);
    expect(r.cashShortfall).toBe(32_500);
    expect(r.cpfShortfall).toBe(0);
    expect(r.monthlyLoan).toBeCloseTo(monthlyPayment(412_500, 3, 25), 6);
    expect(r.monthlyCommitment).toBeCloseTo(r.monthlyLoan + 300, 6);
    expect(r.monthlyCashNeeded).toBeCloseTo(r.monthlyCommitment - 1500, 6);
    expect(r.limitAmount).toBe(2700);
    expect(r.withinLimit).toBe(r.monthlyCommitment <= 2700);
  });
  it('caps CPF use at the down payment and tolerates zero income', () => {
    const r = housingAffordability({ ...inputs, cpfForDownPayment: 999_999, grossMonthlyIncome: 0 });
    expect(r.upfrontFromCpf).toBe(137_500);
    expect(r.commitmentShareOfIncome).toBe(0);
    expect(r.withinLimit).toBe(true);
  });
  it('handles a 100% down payment (no loan)', () => {
    const r = housingAffordability({ ...inputs, downPaymentPct: 100 });
    expect(r.loanAmount).toBe(0);
    expect(r.monthlyLoan).toBe(0);
  });
});

describe('babyBudget', () => {
  const inputs = {
    numberOfChildren: 1,
    setupBudget: 3000,
    deliveryOutOfPocket: 4000,
    monthlyInfantCost: 500,
    otherMonthlyCost: 100,
    lostIncomeDuringLeave: 2000,
    scenarios: [
      { id: 'family', name: 'Family cares', monthlyFee: 0, monthlySubsidy: 0 },
      { id: 'infant', name: 'Infant care', monthlyFee: 1800, monthlySubsidy: 600 },
    ],
    selectedScenarioId: 'infant',
    horizonYears: 3,
    householdMonthlyIncome: 8000,
  };
  it('computes one-time, monthly, first-year and horizon totals', () => {
    const r = babyBudget(inputs);
    expect(r.oneTimeTotal).toBe(9000);
    expect(r.monthlyTotal).toBe(600 + 1200);
    expect(r.annualTotal).toBe(21_600);
    expect(r.firstYearTotal).toBe(30_600);
    expect(r.horizonTotal).toBe(9000 + 21_600 * 3);
    expect(r.cashFlowShare).toBeCloseTo(1800 / 8000, 6);
    expect(r.scenarioComparison[0].monthlyTotal).toBe(600);
  });
  it('scales per-child costs by the number of children and never goes negative on subsidies', () => {
    const r = babyBudget({ ...inputs, numberOfChildren: 2, scenarios: [{ id: 'x', name: 'X', monthlyFee: 500, monthlySubsidy: 9000 }], selectedScenarioId: 'x' });
    expect(r.monthlyTotal).toBe(1200);
    expect(r.oneTimeTotal).toBe(7000 * 2 + 2000);
  });
});

describe('projectRetirement', () => {
  const inputs = {
    currentAge: 35,
    retirementAge: 65,
    currentSavings: 100_000,
    monthlyContribution: 1000,
    monthlySpendingToday: 3000,
    nominalReturnPct: 5,
    inflationPct: 2.5,
    otherMonthlyIncomeToday: 1000,
    planToAge: 90,
  };
  it('future value matches the closed-form formula', () => {
    const fv = futureValue(100_000, 1000, 5, 30);
    // closed form: 100000*(1.004167)^360 + 1000*((1.004167)^360-1)/0.004167
    const r = 0.05 / 12;
    const g = Math.pow(1 + r, 360);
    expect(fv).toBeCloseTo(100_000 * g + (1000 * (g - 1)) / r, 2);
    expect(futureValue(1000, 0, 0, 10)).toBe(1000);
    expect(futureValue(0, 100, 0, 1)).toBe(1200);
  });
  it('produces a coherent projection', () => {
    const r = projectRetirement(inputs);
    expect(r.yearsToRetirement).toBe(30);
    expect(r.yearsInRetirement).toBe(25);
    expect(r.savingsAtRetirementNominal).toBeCloseTo(futureValue(100_000, 1000, 5, 30), 0);
    expect(r.savingsAtRetirementReal).toBeLessThan(r.savingsAtRetirementNominal);
    expect(r.futureMonthlySpending).toBeCloseTo(3000 * Math.pow(1.025, 30), 2);
    expect(r.monthlyGapAtRetirement).toBeCloseTo(2000 * Math.pow(1.025, 30), 2);
    expect(r.trajectory[0].age).toBe(35);
    expect(r.trajectory[30].age).toBe(65);
    expect(r.requiredCapital).toBeGreaterThan(0);
    finite(r.shortfall);
    finite(r.sustainableMonthlyToday);
    expect(r.contributionsTotal).toBe(360_000);
  });
  it('required capital equals a plain annuity when real return is zero', () => {
    expect(requiredCapitalForGap(1000, 2, 2, 20)).toBeCloseTo(240_000, 2);
    expect(requiredCapitalForGap(0, 5, 2, 20)).toBe(0);
  });
  it('handles retirement age below current age and zero years without crashing', () => {
    const r = projectRetirement({ ...inputs, currentAge: 70, retirementAge: 65, planToAge: 60 });
    expect(r.yearsToRetirement).toBe(0);
    expect(r.yearsInRetirement).toBe(0);
    expect(r.savingsAtRetirementNominal).toBe(100_000);
    expect(r.fundsLastUntilAge).toBeNull();
  });
  it('detects when funds run out before the planning age', () => {
    const r = projectRetirement({ ...inputs, currentSavings: 0, monthlyContribution: 100, monthlySpendingToday: 5000, otherMonthlyIncomeToday: 0 });
    expect(r.fundsLastUntilAge).not.toBeNull();
    expect(r.fundsLastUntilAge!).toBeLessThanOrEqual(90);
    expect(r.shortfall).toBeGreaterThan(0);
  });
});

describe('insuranceNeed', () => {
  it('adds the components and nets off resources', () => {
    const r = insuranceNeed({ dependants: 2, yearsOfIncomeReplacement: 10, annualHouseholdExpenses: 60_000, outstandingDebts: 300_000, futureCommitments: 100_000, existingLifeCoverage: 500_000, liquidAssetsToCount: 50_000 });
    expect(r.incomeReplacement).toBe(600_000);
    expect(r.totalNeed).toBe(1_000_000);
    expect(r.resources).toBe(550_000);
    expect(r.gap).toBe(450_000);
  });
  it('shows a surplus as a negative gap and ignores negatives', () => {
    const r = insuranceNeed({ dependants: 0, yearsOfIncomeReplacement: -3, annualHouseholdExpenses: 10_000, outstandingDebts: 0, futureCommitments: 0, existingLifeCoverage: 100_000, liquidAssetsToCount: 0 });
    expect(r.totalNeed).toBe(0);
    expect(r.gap).toBe(-100_000);
  });
});

describe('caregivingPlan', () => {
  const inputs = {
    homeCare: 800,
    helper: 1200,
    transport: 150,
    medical: 400,
    other: 100,
    monthlyBudget: 2000,
    monthlySupport: 250,
    contributors: [
      { id: 'me', name: 'Me', sharePct: 50 },
      { id: 'sis', name: 'Sister', sharePct: 30 },
    ],
    durationYears: 5,
    inflationPct: 3,
  };
  it('computes totals, shares, shortfall and inflation scenario', () => {
    const r = caregivingPlan(inputs);
    expect(r.monthlyTotal).toBe(2650);
    expect(r.monthlyAfterSupport).toBe(2400);
    expect(r.budgetGap).toBe(400);
    expect(r.contributions[0].monthly).toBe(1200);
    expect(r.contributions[1].monthly).toBe(720);
    expect(r.sharesTotalPct).toBe(80);
    expect(r.monthlyShortfall).toBe(480);
    expect(r.durationTotalNoInflation).toBe(2400 * 12 * 5);
    expect(r.durationTotalWithInflation).toBeGreaterThan(r.durationTotalNoInflation);
    expect(r.yearByYear).toHaveLength(5);
  });
  it('handles support larger than costs and fractional durations', () => {
    const r = caregivingPlan({ ...inputs, monthlySupport: 99_999, durationYears: 1.5 });
    expect(r.monthlyAfterSupport).toBe(0);
    expect(r.yearByYear).toHaveLength(2);
    expect(r.durationTotalWithInflation).toBe(0);
  });
});

describe('carOwnershipCost', () => {
  const inputs = {
    purchasePrice: 150_000,
    initialPayment: 60_000,
    otherUpfrontCosts: 2000,
    loanInterestPct: 2.78,
    loanTenureYears: 5,
    loanType: 'flat' as const,
    resaleValueAtEnd: 60_000,
    insuranceAnnual: 1800,
    roadTaxAnnual: 700,
    fuelMonthly: 250,
    parkingMonthly: 250,
    erpAndTollsMonthly: 60,
    maintenanceAnnual: 1200,
    annualMileageKm: 12_000,
    ownershipYears: 5,
    alternativeTransportMonthly: 300,
  };
  it('separates cash outflow from economic cost', () => {
    const r = carOwnershipCost(inputs);
    expect(r.loanAmount).toBe(90_000);
    expect(r.loanMonthly).toBeCloseTo(flatRateMonthly(90_000, 2.78, 5), 6);
    expect(r.runningMonthly).toBeCloseTo((1800 + 700 + 1200) / 12 + 560, 6);
    expect(r.upfrontCash).toBe(62_000);
    expect(r.totalCashOutflow).toBeCloseTo(62_000 + r.loanMonthly * 60 + r.runningMonthly * 60, 2);
    expect(r.depreciation).toBe(90_000);
    // Economic cost excludes loan principal (it is captured by depreciation) but includes interest
    expect(r.economicCost).toBeCloseTo(90_000 + r.totalLoanInterest + r.runningMonthly * 60 + 2000, 2);
    expect(r.costPerKm!).toBeCloseTo(r.economicCost / 60_000, 6);
    expect(r.alternativeTotal).toBe(18_000);
    expect(r.differenceVsAlternative).toBeCloseTo(r.economicCost - 18_000, 6);
    expect(r.loanExtendsBeyondOwnership).toBe(false);
  });
  it('handles no loan, zero mileage and a loan longer than ownership', () => {
    const noLoan = carOwnershipCost({ ...inputs, initialPayment: 150_000, annualMileageKm: 0 });
    expect(noLoan.loanMonthly).toBe(0);
    expect(noLoan.costPerKm).toBeNull();
    const longLoan = carOwnershipCost({ ...inputs, loanTenureYears: 7, ownershipYears: 3, loanType: 'reducing' });
    expect(longLoan.loanExtendsBeyondOwnership).toBe(true);
    expect(longLoan.totalCashOutflow).toBeLessThan(62_000 + longLoan.loanMonthly * 84 + longLoan.runningMonthly * 36 + 1);
    finite(longLoan.economicCost);
  });
});
