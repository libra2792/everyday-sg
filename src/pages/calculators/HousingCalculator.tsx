import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { usePrefill } from '@/lib/usePrefill';
import { housingAffordability, monthlyPayment, type HousingInputs } from '@/lib/finance';
import { pct, sgd } from '@/lib/format';
import { BENCHMARKS } from '@/data/benchmarks';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { Segmented, SliderField } from '@/components/ui/Field';
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
  cpfDownAuto: true,
  interestRatePct: 3,
  tenureYears: 25,
  renovationBudget: 0,
  otherUpfrontCosts: 0,
  monthlyRecurringCosts: 0,
  monthlyCpfOaContribution: 0,
  affordabilityLimitPct: 30,
  withPartner: true,
  partnerGrossMonthlyIncome: 0,
  partnerAvailableCash: 0,
  partnerAvailableCpf: 0,
  partnerMonthlyCpfOaContribution: 0,
  splitMode: 'income',
  partnerSharePct: 50,
};

const SPLIT_OPTIONS: { value: NonNullable<HousingInputs['splitMode']>; label: string }[] = [
  { value: 'income', label: 'By income' },
  { value: 'equal', label: 'Equally' },
  { value: 'custom', label: 'My own split' },
];

/** Inputs saved before the CPF portion could follow the allocation: a 0 there was the untouched default. */
function migrate(saved: unknown, fallback: HousingInputs): HousingInputs {
  const s = { ...fallback, ...(saved as Partial<HousingInputs>) };
  if ((saved as Partial<HousingInputs>).cpfDownAuto === undefined) s.cpfDownAuto = !(s.cpfForDownPayment > 0);
  return s;
}

/** The CPF portion of the down payment when it follows the allocation. */
function autoCpfDown(s: HousingInputs): number {
  const cpf = s.availableCpf + (s.withPartner ? (s.partnerAvailableCpf ?? 0) : 0);
  return Math.min(cpf, (s.propertyPrice * Math.min(100, s.downPaymentPct)) / 100);
}

export default function HousingCalculator() {
  const [state, setState, reset] = usePersistentState<HousingInputs>('calc:housing', DEFAULTS, migrate);
  const prefilled = usePrefill(
    setState,
    { income: 'grossMonthlyIncome', cash: 'availableCash', cpf: 'availableCpf', cpfDown: 'cpfForDownPayment', price: 'propertyPrice', down: 'downPaymentPct', rate: 'interestRatePct', tenure: 'tenureYears', reno: 'renovationBudget', upfront: 'otherUpfrontCosts', recurring: 'monthlyRecurringCosts', oa: 'monthlyCpfOaContribution', limit: 'affordabilityLimitPct' },
    (params, s) => {
      // household=1: the income is a household total (a guide asks for it that way), so
      // enter it as one buyer rather than as "your" half with a partner on zero.
      const next = params.get('household') === '1' ? { ...s, withPartner: false } : s;
      if (!params.has('cpfDown')) return next;
      // A CPF portion equal to what the allocation gives keeps following it as inputs change.
      return { ...next, cpfDownAuto: Math.abs(next.cpfForDownPayment - autoCpfDown(next)) < 1 };
    },
  );
  const r = useMemo(() => housingAffordability(state), [state]);
  const set = <K extends keyof HousingInputs>(key: K) => (v: HousingInputs[K]) => setState((s) => ({ ...s, [key]: v }));
  const withPartner = Boolean(state.withPartner);
  const hasIncome = r.householdIncome > 0;
  const incomeWord = withPartner ? 'combined' : 'gross';
  const shareStat = (who: string, share: NonNullable<typeof r.partner>, fraction: number, income: number) => (
    <Stat
      label={`${who} · ${pct(fraction)}`}
      value={`${sgd(share.monthlyCommitment)} / mo`}
      hint={`${sgd(share.upfrontCash)} cash${share.upfrontCpf > 0 ? ` and ${sgd(share.upfrontCpf)} CPF` : ''} upfront${income > 0 ? ` · ${pct(share.shareOfOwnIncome)} of own income` : ''}`}
    />
  );

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
      prefilled={prefilled}
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
        ...(r.partner
          ? [
              { label: 'Household gross income', value: sgd(r.householdIncome) },
              { label: 'Your monthly share', value: sgd(r.you.monthlyCommitment) },
              { label: "Partner's monthly share", value: sgd(r.partner.monthlyCommitment) },
            ]
          : []),
      ]}
      caveat="This calculator does not determine HDB eligibility, loan eligibility, grants or your maximum borrowing capacity. Actual requirements depend on applicable rules, property type, buyer profile, lender and approval; the HFE letter and your lender are the authority. Use it to see what a given price and loan would cost you."
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>The loan is amortised with a fixed interest rate over the whole tenure; floating rates and repricing are not modelled.</li>
          <li>Down payment percentage is your assumption. Loan-to-value limits and minimum cash components differ by loan type and change over time.</li>
          <li>Stamp duties, legal and valuation fees and agent fees are entered by you as “other upfront costs”; use official calculators to estimate them.</li>
          <li>The CPF Ordinary Account contribution reduces monthly cash needed only up to the loan instalment.</li>
          <li>The affordability limit is your own comfort ceiling, not a regulatory ratio.</li>
          <li>When buying with a partner, both incomes, cash, CPF and OA contributions are pooled. The split is how you choose to share costs; it does not decide ownership shares or how CPF can legally be used.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Down payment = price × down payment %. Loan = price − down payment.</li>
          <li>Monthly payment M = P × r ÷ (1 − (1 + r)^−n), where r is the annual rate ÷ 12 and n is tenure in months. A zero rate gives P ÷ n.</li>
          <li>Upfront from CPF = the down payment you pay from CPF. Until you change that field it is min(CPF you allocate, down payment), with your partner's CPF counted when buying together. Upfront from cash = down payment − CPF portion + renovation + other upfront costs.</li>
          <li>Monthly commitment = loan payment + recurring costs. Share of income = commitment ÷ gross household income (yours plus your partner's).</li>
          <li>Shortfalls compare upfront needs with your combined cash and CPF. Monthly cash after CPF OA uses both partners' OA contributions, up to the loan instalment.</li>
          <li>Each person's share = upfront and monthly costs × their split. “By income” splits in proportion to gross incomes; with no income entered it splits equally.</li>
        </ul>
      }
      results={
        <ResultsPanel>
          <StatGrid>
            <Stat label="Monthly loan payment" value={sgd(r.monthlyLoan)} size="lg" className="col-span-2 sm:col-span-3" hint={`${sgd(r.loanAmount)} over ${state.tenureYears} years at ${state.interestRatePct}% · ${sgd(r.totalInterest)} total interest`} />
            <Stat label="Upfront cash" value={sgd(r.upfrontFromCash)} tone={r.cashShortfall > 0 ? 'caution' : 'neutral'} hint={r.cashShortfall > 0 ? `${sgd(r.cashShortfall)} more than available` : withPartner ? 'Within your combined cash' : 'Within available cash'} />
            <Stat label="Upfront CPF" value={sgd(r.upfrontFromCpf)} tone={r.cpfShortfall > 0 ? 'caution' : 'neutral'} hint={r.cpfShortfall > 0 ? `${sgd(r.cpfShortfall)} more than available` : withPartner ? 'Within your combined CPF' : 'Within available CPF'} />
            <Stat label="Monthly commitment" value={sgd(r.monthlyCommitment)} hint={hasIncome ? `${pct(r.commitmentShareOfIncome)} of ${incomeWord} income` : 'Enter income for a share'} />
            <Stat label="Monthly cash after CPF OA" value={sgd(r.monthlyCashNeeded)} />
            <Stat label={withPartner ? 'Your joint limit' : 'Your limit'} value={hasIncome ? sgd(r.limitAmount) : '—'} tone={hasIncome ? (r.withinLimit ? 'positive' : 'caution') : 'neutral'} hint={hasIncome ? (r.withinLimit ? 'Commitment is within your limit' : 'Commitment exceeds your limit') : `${state.affordabilityLimitPct}% of income`} />
          </StatGrid>
          {r.partner && (
            <div>
              <div className="mb-1.5 text-[13.5px] font-medium text-ink">How the costs split between you</div>
              <div className="grid grid-cols-2 gap-3">
                {shareStat('You', r.you, 1 - r.partnerShare, state.grossMonthlyIncome)}
                {shareStat('Partner', r.partner, r.partnerShare, state.partnerGrossMonthlyIncome ?? 0)}
              </div>
            </div>
          )}
          <DefinitionList
            dense
            rows={[
              { label: 'Down payment', value: sgd(r.downPayment) },
              { label: 'Renovation and furnishing', value: sgd(state.renovationBudget) },
              { label: 'Other upfront costs (your estimate)', value: sgd(state.otherUpfrontCosts) },
              { label: 'Total upfront', value: sgd(r.upfrontTotal), emphasis: true },
            ]}
          />
          {!hasIncome && <Note>Add {withPartner ? 'your and your partner’s' : 'your'} gross income to see the commitment as a share of income and compare it with your own limit.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="You" description="Your income and what you can commit upfront. Keep an emergency fund out of the cash figure.">
        <SliderField label={withPartner ? 'Your gross monthly income' : 'Gross monthly household income'} benchmark={withPartner ? BENCHMARKS.medianFullTimeIncome : BENCHMARKS.medianHouseholdIncome} prefix="S$" min={0} max={30000} step={100} value={state.grossMonthlyIncome} onChange={set('grossMonthlyIncome')} help="Before CPF and tax; lenders and HDB assess gross income." />
        <SliderField label="Your cash for the purchase" prefix="S$" min={0} max={500000} step={1000} value={state.availableCash} onChange={set('availableCash')} />
        <SliderField label="Your CPF savings allocated to the purchase" prefix="S$" min={0} max={500000} step={1000} value={state.availableCpf} onChange={set('availableCpf')} help="Ordinary Account savings you intend to use; CPF Board sets the rules on what can be used." />
        <SliderField label="Your monthly CPF OA contribution for repayments" benchmark={BENCHMARKS.cpfOaForLoan} benchmarkValue={state.grossMonthlyIncome > 0 ? Math.round((state.grossMonthlyIncome * 0.23) / 10) * 10 : undefined} prefix="S$" min={0} max={5000} step={50} value={state.monthlyCpfOaContribution} onChange={set('monthlyCpfOaContribution')} help="If you plan to service the loan from CPF OA, this reduces monthly cash needed." />
      </InputGroup>

      <InputGroup title="Your partner" description="Most couples buy together. Their income, cash and CPF add to yours.">
        <Segmented
          label="Who is buying"
          value={withPartner ? 'partner' : 'alone'}
          onChange={(v) => set('withPartner')(v === 'partner')}
          options={[
            { value: 'partner', label: 'With a partner' },
            { value: 'alone', label: 'Just me' },
          ]}
          help={withPartner ? undefined : 'Choose “Just me” if buying alone, or to enter household totals in the section above.'}
        />
        {withPartner && (
          <>
            <SliderField label="Partner's gross monthly income" benchmark={BENCHMARKS.medianFullTimeIncome} prefix="S$" min={0} max={30000} step={100} value={state.partnerGrossMonthlyIncome ?? 0} onChange={set('partnerGrossMonthlyIncome')} />
            <SliderField label="Partner's cash for the purchase" prefix="S$" min={0} max={500000} step={1000} value={state.partnerAvailableCash ?? 0} onChange={set('partnerAvailableCash')} />
            <SliderField label="Partner's CPF savings allocated to the purchase" prefix="S$" min={0} max={500000} step={1000} value={state.partnerAvailableCpf ?? 0} onChange={set('partnerAvailableCpf')} />
            <SliderField label="Partner's monthly CPF OA contribution for repayments" benchmark={BENCHMARKS.cpfOaForLoan} benchmarkValue={(state.partnerGrossMonthlyIncome ?? 0) > 0 ? Math.round(((state.partnerGrossMonthlyIncome ?? 0) * 0.23) / 10) * 10 : undefined} prefix="S$" min={0} max={5000} step={50} value={state.partnerMonthlyCpfOaContribution ?? 0} onChange={set('partnerMonthlyCpfOaContribution')} />
            <Segmented label="How you split the costs" value={state.splitMode ?? 'income'} onChange={set('splitMode')} options={SPLIT_OPTIONS} help={state.splitMode === 'custom' ? undefined : `Your partner would carry ${pct(r.partnerShare)} of upfront and monthly costs.`} />
            {state.splitMode === 'custom' && <SliderField label="Partner's share of the costs" suffix="%" min={0} max={100} step={5} value={state.partnerSharePct ?? 50} onChange={set('partnerSharePct')} allowAboveMax={false} />}
          </>
        )}
      </InputGroup>

      <InputGroup title="The property and loan">
        <SliderField label="Estimated property price" benchmark={BENCHMARKS.resale4Room} prefix="S$" min={100000} max={3000000} step={5000} value={state.propertyPrice} onChange={set('propertyPrice')} />
        <SliderField label="Down payment" benchmark={BENCHMARKS.downPayment} suffix="%" min={0} max={100} step={1} value={state.downPaymentPct} onChange={set('downPaymentPct')} allowAboveMax={false} help={`Your assumption. ${sgd(r.downPayment)} at the current price; the loan would be ${sgd(r.loanAmount)}.`} />
        <SliderField
          label="Down payment to pay from CPF"
          prefix="S$"
          min={0}
          max={Math.max(1000, Math.round(r.downPayment))}
          step={1000}
          value={Math.round(r.upfrontFromCpf)}
          onChange={(v) => setState((s) => ({ ...s, cpfForDownPayment: v, cpfDownAuto: false }))}
          allowAboveMax={false}
          help={
            state.cpfDownAuto ? (
              'Follows the CPF you allocated, up to the down payment; the rest is paid in cash. Minimum cash components may apply depending on loan type.'
            ) : (
              <>
                The rest of the down payment is paid in cash. Minimum cash components may apply depending on loan type.{' '}
                <button type="button" className="link" onClick={() => setState((s) => ({ ...s, cpfDownAuto: true }))}>
                  Use all the CPF allocated
                </button>
              </>
            )
          }
        />
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
