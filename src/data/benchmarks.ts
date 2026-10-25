/**
 * Indicative figures shown beside calculator inputs.
 *
 * Two kinds:
 *  - 'statistic': an official published figure, with its source and the date it was checked.
 *  - 'guide': a planning rule of thumb or typical range, labelled as such. Not a statistic.
 *
 * `value` is what the "Use" button applies. Statistics are quoted as published; derived
 * figures (e.g. take-home from gross) say so in the text.
 */
export interface Benchmark {
  text: string;
  value?: number;
  kind: 'statistic' | 'guide';
  sourceId?: string;
  checkedOn?: string;
}

const D = '2026-10-25';

export const BENCHMARKS = {
  // ---- Income and spending -----------------------------------------------------------
  medianFullTimeIncome: {
    text: 'Median full-time income was S$5,775/month in 2025, gross and including employer CPF (MOM); that is roughly S$3,950 take-home after CPF for someone under 55.',
    value: 3950,
    kind: 'statistic',
    sourceId: 'mom-labour-force-2025',
    checkedOn: D,
  },
  medianHouseholdIncome: {
    text: 'Median household market income was S$12,446/month in 2025, all members and sources, before transfers and taxes (SingStat).',
    value: 12446,
    kind: 'statistic',
    sourceId: 'singstat-income-2025',
    checkedOn: D,
  },
  medianHouseholdIncomePerMember: {
    text: 'Median monthly household market income per household member was S$4,160 in 2025 (SingStat).',
    value: 4160,
    kind: 'statistic',
    sourceId: 'singstat-income-2025',
    checkedOn: D,
  },
  avgHouseholdSpending: {
    text: 'The average household spent S$5,931/month in 2023 (SingStat Household Expenditure Survey).',
    value: 5931,
    kind: 'statistic',
    sourceId: 'singstat-hes-2023',
    checkedOn: D,
  },
  avgHousingSpend: {
    text: 'Housing was 29.8% of average household spending in 2023, about S$1,770/month (SingStat HES 2023).',
    value: 1770,
    kind: 'statistic',
    sourceId: 'singstat-hes-2023',
    checkedOn: D,
  },
  avgFoodSpend: {
    text: 'Food was 20.0% of average household spending in 2023, about S$1,190/month, of which S$966 was eating out (SingStat HES 2023).',
    value: 1190,
    kind: 'statistic',
    sourceId: 'singstat-hes-2023',
    checkedOn: D,
  },
  avgTransportSpend: {
    text: 'Transport averaged S$951/month per household in 2023 (SingStat HES 2023).',
    value: 951,
    kind: 'statistic',
    sourceId: 'singstat-hes-2023',
    checkedOn: D,
  },
  essentialSpending: {
    text: 'Essentials are usually 50 to 70% of spending. The average household spent S$5,931/month in 2023 (SingStat), so S$3,000 to 4,000 is a common starting point.',
    value: 3500,
    kind: 'guide',
    sourceId: 'singstat-hes-2023',
  },
  insurancePremiums: { text: 'Many households spend 5 to 15% of take-home pay on premiums across health, life and accident cover.', kind: 'guide' },
  savingsTarget: { text: 'Saving 20% of take-home pay is a common target; any consistent amount beats none.', kind: 'guide' },
  emergencyMonths: { text: '3 months if income is stable with a second earner; 6 or more if income is variable or you have dependants.', value: 6, kind: 'guide' },
  cardInterest: { text: 'Credit cards commonly charge around 26 to 28% p.a. once a balance rolls over; personal loans often 4 to 8% p.a. effective. Use your statement\'s rate.', kind: 'guide' },

  // ---- Housing ------------------------------------------------------------------------
  resale4Room: {
    text: 'Median 4-room resale prices, 3Q 2026: S$538,000 (Jurong West) to S$1,065,000 (Queenstown); S$545,000 to 680,000 in Woodlands, Yishun, Sengkang, Tampines and Punggol; about S$750,000 in Bishan and Bedok (HDB).',
    value: 620000,
    kind: 'statistic',
    sourceId: 'hdb-median-resale',
    checkedOn: D,
  },
  downPayment: { text: '25% is a common assumption: HDB and bank loans both cap the loan at 75% of the price, and HDB and MAS change the limits from time to time.', value: 25, kind: 'guide' },
  hdbLoanRate: { text: 'HDB loan: 2.6% p.a. (0.1% above the CPF OA rate), unchanged for many years. Bank loans have ranged roughly 2.5 to 4% recently.', value: 2.6, kind: 'guide' },
  loanTenure: { text: '25 years is the longest HDB loan tenure for most buyers; bank loans can run longer. Shorter tenures cut total interest sharply.', value: 25, kind: 'guide' },
  renovation: { text: 'Typical HDB renovations run S$30,000 to 80,000 depending on scope; new BTO flats often need less than resale flats.', value: 50000, kind: 'guide' },
  upfrontCosts: { text: 'Buyer\'s Stamp Duty is progressive and usually 1 to 4% of the price for most homes; add about S$2,000 to 3,000 legal fees. Use IRAS\'s calculator for the exact duty.', kind: 'guide' },
  recurringHousing: { text: 'HDB service and conservancy charges are commonly S$50 to 120/month; condominium maintenance S$300 to 500/month; property tax is billed yearly.', value: 100, kind: 'guide' },
  housingLimit: { text: '30% of gross income is a common comfort ceiling. Lenders apply their own ratios.', value: 30, kind: 'guide' },
  cpfOaForLoan: { text: 'For employees aged 35 and below, 23% of monthly wages (employee plus employer contributions) goes to the Ordinary Account; the share falls in older age bands. Check CPF Board\'s table for yours.', kind: 'guide', sourceId: 'cpf-housing' },
  householdIncomeContext: { text: 'Median household market income was S$12,446/month in 2025 across all members (SingStat). Enter only the other members\' take-home pay here.', kind: 'statistic', sourceId: 'singstat-income-2025', checkedOn: D },
  householdTakeHome: { text: 'Median household market income was S$12,446/month in 2025 (SingStat); after CPF deductions that is roughly S$8,500 to 10,000 take-home for a household near the median.', value: 9000, kind: 'guide', sourceId: 'singstat-income-2025' },
  emergencyContribution: { text: 'Many people direct 10 to 20% of take-home pay to the fund until it reaches the target, then redirect that amount to other goals.', kind: 'guide' },

  // ---- Baby ---------------------------------------------------------------------------
  babySetup: { text: 'S$2,000 to 5,000 for a cot, pram, car seat and essentials; much less with hand-me-downs.', value: 3000, kind: 'guide' },
  deliveryOop: { text: 'After MediSave, subsidised public wards often leave a few hundred to about S$2,000 out of pocket; private delivery can be S$5,000 to 10,000 or more. Use your hospital\'s estimate.', value: 2000, kind: 'guide' },
  infantMonthly: { text: 'S$300 to 800/month for milk or formula, diapers, clinic visits and clothes.', value: 500, kind: 'guide' },
  infantCareCap: {
    text: 'Anchor Operator preschools cap full-day fees at S$1,235/month for infant care and S$610/month for childcare, excluding GST and before subsidies are deducted (ECDA, page updated Apr 2026). Private centres often charge more.',
    value: 1235,
    kind: 'statistic',
    sourceId: 'ecda-aop',
    checkedOn: D,
  },
  childcareCap: {
    text: 'ECDA caps full-day childcare fees at Anchor Operator preschools at S$610/month, excluding GST; subsidies come off the fee charged.',
    value: 610,
    kind: 'statistic',
    sourceId: 'ecda-aop',
    checkedOn: D,
  },

  // ---- Retirement ---------------------------------------------------------------------
  retirementAge: { text: 'CPF LIFE payouts can start from 65. The statutory retirement age is being raised in steps to 65 by 2030.', value: 65, kind: 'guide' },
  planToAge: { text: 'Life expectancy at birth is about 83 in Singapore; planning to 90 or beyond guards against outliving savings.', value: 90, kind: 'guide' },
  retirementSpending: { text: 'A common rule of thumb is 60 to 70% of current take-home pay. The average household spent S$5,931/month in 2023 (SingStat).', value: 3500, kind: 'guide', sourceId: 'singstat-hes-2023' },
  nominalReturn: { text: 'Cash-like savings earn about 2 to 3%; long-run diversified portfolio assumptions are commonly 4 to 6% nominal, with volatility.', value: 4, kind: 'guide' },
  inflation: { text: 'Singapore inflation has averaged around 2% a year over the long run, with higher spikes in some years; 2.5% is a cautious planning figure.', value: 2.5, kind: 'guide' },
  otherRetirementIncome: { text: 'Enter your own CPF LIFE estimate from CPF Board\'s payout estimator here.', kind: 'guide' },

  // ---- Insurance ----------------------------------------------------------------------
  incomeReplacementYears: { text: 'A common industry guideline is death cover of about 9 to 10 times annual income; 10 years is a typical starting point.', value: 10, kind: 'guide' },
  annualHouseholdExpenses: { text: 'The average household spent S$5,931/month in 2023, about S$71,000 a year (SingStat).', value: 71000, kind: 'statistic', sourceId: 'singstat-hes-2023', checkedOn: D },

  // ---- Caregiving ---------------------------------------------------------------------
  helperCost: { text: 'All-in cost of a helper is commonly S$1,200 to 1,800/month (salary, levy, food, insurance). The levy concession for households with elderly members lowers it.', value: 1500, kind: 'guide' },
  homeCareCost: { text: 'Home care services are commonly S$25 to 60/hour; day care centres S$1,000 to 2,000/month before subsidies.', value: 800, kind: 'guide' },
  careDuration: { text: 'Families often plan 5 to 10 years; needs tend to rise over time.', value: 5, kind: 'guide' },
  careInflation: { text: 'Care and helper costs have risen faster than headline inflation; 3 to 5% a year is a cautious assumption.', value: 3, kind: 'guide' },
  careSupport: { text: 'The Home Caregiving Grant pays a monthly cash amount to eligible households; check AIC for the current amount and criteria before entering it.', kind: 'guide' },

  // ---- Car ----------------------------------------------------------------------------
  coePrice: {
    text: 'The Category A COE alone closed at S$132,004 at the 21 Oct 2026 bidding (LTA). A new mid-size car including COE is often S$150,000 to 200,000.',
    value: 170000,
    kind: 'statistic',
    sourceId: 'onemotoring-coe-results',
    checkedOn: D,
  },
  carDownPayment: { text: 'MAS rules cap car loans at 60 to 70% of the price, so expect 30 to 40% upfront.', kind: 'guide' },
  carLoanRate: { text: 'Car loans are often quoted at 2.5 to 3.5% flat; the effective rate is roughly double.', value: 2.8, kind: 'guide' },
  carLoanTenure: { text: 'Maximum 7 years under MAS rules; 5 years is common.', value: 5, kind: 'guide' },
  carResale: { text: 'Cars commonly lose 50 to 60% of their price over 5 years; the PARF rebate and remaining COE support the resale value.', kind: 'guide' },
  carInsurance: { text: 'S$1,000 to 2,500/year for a typical driver with no-claim discount.', value: 1500, kind: 'guide' },
  roadTax: { text: 'About S$700 to 1,200/year for a 1.6-litre petrol car; EVs are rated differently (LTA).', value: 800, kind: 'guide' },
  fuel: { text: 'S$250 to 400/month at about 1,000 km/month.', value: 300, kind: 'guide' },
  parking: { text: 'HDB season parking is around S$110 to 120/month; office or condo parking adds more.', value: 200, kind: 'guide' },
  erp: { text: 'S$30 to 100/month for regular CBD trips.', value: 50, kind: 'guide' },
  maintenance: { text: 'S$800 to 2,000/year including servicing and tyres.', value: 1200, kind: 'guide' },
  mileage: { text: 'Private cars in Singapore average roughly 15,000 km a year.', value: 15000, kind: 'guide' },
  ownershipYears: { text: 'Most owners keep a car 5 to 10 years, often the full COE.', value: 5, kind: 'guide' },
  alternativeTransport: { text: 'S$150 to 400/month covers MRT, bus and occasional ride-hailing for many commuters.', value: 300, kind: 'guide' },
} satisfies Record<string, Benchmark>;

export type BenchmarkId = keyof typeof BENCHMARKS;
