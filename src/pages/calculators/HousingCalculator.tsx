import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { housingAffordability, monthlyPayment, type HousingInputs } from '@/lib/finance';
import { pct, sgd } from '@/lib/format';
import { BENCHMARKS } from '@/data/benchmarks';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { SliderField } from '@/components/ui/Field';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { ColumnChart } from '@/components/charts/Charts';
import { Note } from '@/components/ui/Misc';

const DEFAULTS: HousingInputs = {
  grossMonthlyIncome: 0,
  availableCash: 0,
  availableCpf: 0,
  propertyPrice: 500000,
  downPaymentPct: 25,
  cpfForDownPayment: 0,
  interestRatePct: 3,
  tenureYears: 25,
  renovationBudget: 0,
  otherUpfrontCosts: 0,
  monthlyRecurringCosts: 0,
  monthlyCpfOaContribution: 0,
  affordabilityLimitPct: 30,
};

export default function HousingCalculator() {
  const [state, setState, reset] = usePersistentState<HousingInputs>('calc:housing', DEFAULTS);
  const r = useMemo(() => housingAffordability(state), [state]);
  const set = <K extends keyof HousingInputs>(key: K) => (v: HousingInputs[K]) => setState((s) => ({ ...s, [key]: v }));

  const rateScenarios = useMemo(() => [-1, -0.5, 0, 0.5, 1, 2].map((d) => ({ delta: d, rate: Math.max(0, state.interestRatePct + d), monthly: monthlyPayment(r.loanAmount, Math.max(0, state.interestRatePct + d), state.tenureYears) })), [state.interestRatePct, state.tenureYears, r.loanAmount]);
  const tenureScenarios = useMemo(() => [15, 20, 25, 30].map((t) => ({ tenure: t, monthly: monthlyPayment(r.loanAmount, state.interestRatePct, t), interest: monthlyPayment(r.loanAmount, state.interestRatePct, t) * t * 12 - r.loanAmount })), [state.interestRatePct, r.loanAmount]);
  const priceScenarios = useMemo(
    () =>
      [-10, -5, 0, 5, 10].map((p) => {
        const price = state.propertyPrice * (1 + p / 100);
        const loan = price * (1 - Math.min(100, state.downPaymentPct) / 100);
        return { delta: p, price, monthly: monthlyPayment(loan, state.interestRatePct, state.tenureYears) };
      }),
    [state.propertyPrice, state.downPaymentPct, state.interestRatePct, state.tenureYears],
  );

  return (
    <CalculatorShell
      id="housing"
      onReset={reset}
      sourceIds={['hdb-loan', 'hdb-hfe', 'cpf-housing', 'moneysense-decisions', 'hdb-median-resale', 'singstat-income-2025']}
      relatedGuides={['home-affordability-and-loans', 'hdb-bto-vs-resale', 'renovation-and-moving']}
      headline={[
        { label: 'Monthly loan payment', value: sgd(r.monthlyLoan) },
        { label: 'Upfront cash', value: sgd(r.upfrontFromCash) },
      ]}
      snapshot={[
        { label: 'Property price', value: sgd(state.propertyPrice) },
        { label: 'Loan amount', value: sgd(r.loanAmount) },
        { label: 'Monthly loan payment', value: sgd(r.monthlyLoan) },
        { label: 'Upfront cash needed', value: sgd(r.upfrontFromCash) },
        { label: 'Upfront CPF needed', value: sgd(r.upfrontFromCpf) },
        { label: 'Monthly commitment', value: sgd(r.monthlyCommitment) },
      ]}
      caveat="This calculator does not determine HDB eligibility, loan eligibility, grants or your maximum borrowing capacity. Actual requirements depend on applicable rules, property type, buyer profile, lender and approval; the HFE letter and your lender are the authority. Use it to see what a given price and loan would cost you."
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>The loan is amortised with a fixed interest rate over the whole tenure; floating rates and repricing are not modelled.</li>
          <li>Down payment percentage is your assumption. Loan-to-value limits and minimum cash components differ by loan type and change over time.</li>
          <li>Stamp duties, legal and valuation fees and agent fees are entered by you as “other upfront costs”; use official calculators to estimate them.</li>
          <li>The CPF Ordinary Account contribution reduces monthly cash needed only up to the loan instalment.</li>
          <li>The affordability limit is your own comfort ceiling, not a regulatory ratio.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Down payment = price × down payment %. Loan = price − down payment.</li>
          <li>Monthly payment M = P × r ÷ (1 − (1 + r)^−n), where r is the annual rate ÷ 12 and n is tenure in months. A zero rate gives P ÷ n.</li>
          <li>Upfront from CPF = min(CPF you allocate, down payment). Upfront from cash = down payment − CPF portion + renovation + other upfront costs.</li>
          <li>Monthly commitment = loan payment + recurring costs. Share of income = commitment ÷ gross household income.</li>
        </ul>
      }
      results={
        <ResultsPanel>
          <StatGrid>
            <Stat label="Monthly loan payment" value={sgd(r.monthlyLoan)} size="lg" className="col-span-2 sm:col-span-3" hint={`${sgd(r.loanAmount)} over ${state.tenureYears} years at ${state.interestRatePct}% · ${sgd(r.totalInterest)} total interest`} />
            <Stat label="Upfront cash" value={sgd(r.upfrontFromCash)} tone={r.cashShortfall > 0 ? 'caution' : 'neutral'} hint={r.cashShortfall > 0 ? `${sgd(r.cashShortfall)} more than available` : 'Within available cash'} />
            <Stat label="Upfront CPF" value={sgd(r.upfrontFromCpf)} tone={r.cpfShortfall > 0 ? 'caution' : 'neutral'} hint={r.cpfShortfall > 0 ? `${sgd(r.cpfShortfall)} more than available` : 'Within available CPF'} />
            <Stat label="Monthly commitment" value={sgd(r.monthlyCommitment)} hint={state.grossMonthlyIncome > 0 ? `${pct(r.commitmentShareOfIncome)} of gross income` : 'Enter income for a share'} />
            <Stat label="Monthly cash after CPF OA" value={sgd(r.monthlyCashNeeded)} />
            <Stat label="Your limit" value={state.grossMonthlyIncome > 0 ? sgd(r.limitAmount) : '—'} tone={state.grossMonthlyIncome > 0 ? (r.withinLimit ? 'positive' : 'caution') : 'neutral'} hint={state.grossMonthlyIncome > 0 ? (r.withinLimit ? 'Commitment is within your limit' : 'Commitment exceeds your limit') : `${state.affordabilityLimitPct}% of income`} />
          </StatGrid>
          <DefinitionList
            dense
            rows={[
              { label: 'Down payment', value: sgd(r.downPayment) },
              { label: 'Renovation and furnishing', value: sgd(state.renovationBudget) },
              { label: 'Other upfront costs (your estimate)', value: sgd(state.otherUpfrontCosts) },
              { label: 'Total upfront', value: sgd(r.upfrontTotal), emphasis: true },
            ]}
          />
          {state.grossMonthlyIncome === 0 && <Note>Add your gross household income to see the commitment as a share of income and compare it with your own limit.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Your position" description="Income and what you can commit upfront. Keep an emergency fund out of the cash figure.">
        <SliderField label="Gross monthly household income" benchmark={BENCHMARKS.medianHouseholdIncome} prefix="S$" min={0} max={30000} step={100} value={state.grossMonthlyIncome} onChange={set('grossMonthlyIncome')} help="Before CPF and tax; lenders and HDB assess gross income." />
        <SliderField label="Available cash for the purchase" prefix="S$" min={0} max={500000} step={1000} value={state.availableCash} onChange={set('availableCash')} />
        <SliderField label="CPF savings allocated to the purchase" prefix="S$" min={0} max={500000} step={1000} value={state.availableCpf} onChange={set('availableCpf')} help="Ordinary Account savings you intend to use; CPF Board sets the rules on what can be used." />
        <SliderField label="Monthly CPF OA contribution for repayments" benchmark={BENCHMARKS.cpfOaForLoan} benchmarkValue={state.grossMonthlyIncome > 0 ? Math.round((state.grossMonthlyIncome * 0.23) / 10) * 10 : undefined} prefix="S$" min={0} max={5000} step={50} value={state.monthlyCpfOaContribution} onChange={set('monthlyCpfOaContribution')} help="If you plan to service the loan from CPF OA, this reduces monthly cash needed." />
      </InputGroup>

      <InputGroup title="The property and loan">
        <SliderField label="Estimated property price" benchmark={BENCHMARKS.resale4Room} prefix="S$" min={100000} max={3000000} step={5000} value={state.propertyPrice} onChange={set('propertyPrice')} />
        <SliderField label="Down payment" benchmark={BENCHMARKS.downPayment} suffix="%" min={0} max={100} step={1} value={state.downPaymentPct} onChange={set('downPaymentPct')} allowAboveMax={false} help={`Your assumption. ${sgd(r.downPayment)} at the current price; the loan would be ${sgd(r.loanAmount)}.`} />
        <SliderField label="Down payment to pay from CPF" prefix="S$" min={0} max={Math.max(1000, Math.round(r.downPayment))} step={1000} value={state.cpfForDownPayment} onChange={set('cpfForDownPayment')} help="The rest of the down payment is paid in cash. Minimum cash components may apply depending on loan type." />
        <SliderField label="Loan interest rate" benchmark={BENCHMARKS.hdbLoanRate} suffix="% p.a." min={0} max={8} step={0.05} value={state.interestRatePct} onChange={set('interestRatePct')} format={(n) => `${n.toFixed(2)}% p.a.`} />
        <SliderField label="Loan tenure" benchmark={BENCHMARKS.loanTenure} suffix="years" min={5} max={35} step={1} value={state.tenureYears} onChange={set('tenureYears')} allowAboveMax={false} help="Maximum tenures depend on loan type, age and property; check with HDB or your lender." />
      </InputGroup>

      <InputGroup title="Other costs">
        <SliderField label="Renovation and furnishing budget" benchmark={BENCHMARKS.renovation} prefix="S$" min={0} max={200000} step={1000} value={state.renovationBudget} onChange={set('renovationBudget')} />
        <SliderField label="Other upfront costs" benchmark={BENCHMARKS.upfrontCosts} prefix="S$" min={0} max={200000} step={500} value={state.otherUpfrontCosts} onChange={set('otherUpfrontCosts')} help="Buyer's Stamp Duty, Additional Buyer's Stamp Duty if applicable, legal, valuation and agent fees — your estimate from official calculators." />
        <SliderField label="Monthly maintenance and other recurring costs" benchmark={BENCHMARKS.recurringHousing} prefix="S$" min={0} max={3000} step={10} value={state.monthlyRecurringCosts} onChange={set('monthlyRecurringCosts')} help="Conservancy or maintenance fees, property tax, fire and home insurance." />
        <SliderField label="Your affordability limit" benchmark={BENCHMARKS.housingLimit} suffix="% of income" min={10} max={60} step={1} value={state.affordabilityLimitPct} onChange={set('affordabilityLimitPct')} allowAboveMax={false} help="The share of gross income you are comfortable committing to housing each month. This is your choice, not a regulatory figure." />
      </InputGroup>

      <InputGroup title="Scenario comparison" description="How the monthly payment moves when assumptions change. The current scenario is highlighted.">
        <div>
          <div className="mb-2 text-[13.5px] font-medium text-ink">If interest rates change</div>
          <ColumnChart ariaLabel="Monthly loan payment at different interest rates" items={rateScenarios.map((s) => ({ label: `${s.rate.toFixed(2)}%`, value: s.monthly, highlight: s.delta === 0 }))} />
        </div>
        <div>
          <div className="mb-2 text-[13.5px] font-medium text-ink">If the tenure changes</div>
          <DefinitionList dense rows={tenureScenarios.map((s) => ({ label: `${s.tenure} years`, value: `${sgd(s.monthly)} / month · ${sgd(Math.max(0, s.interest))} total interest`, emphasis: s.tenure === state.tenureYears }))} />
        </div>
        <div>
          <div className="mb-2 text-[13.5px] font-medium text-ink">If the price changes</div>
          <DefinitionList dense rows={priceScenarios.map((s) => ({ label: `${s.delta > 0 ? '+' : ''}${s.delta}% · ${sgd(s.price)}`, value: `${sgd(s.monthly)} / month`, emphasis: s.delta === 0 }))} />
        </div>
      </InputGroup>
    </CalculatorShell>
  );
}
