import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { projectRetirement, type RetirementInputs } from '@/lib/finance';
import { sgd } from '@/lib/format';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { SliderField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { LineChart } from '@/components/charts/Charts';
import { ExternalLink, Note } from '@/components/ui/Misc';
import { SOURCE_MAP } from '@/data/sources';

const DEFAULTS: RetirementInputs = {
  currentAge: 35,
  retirementAge: 65,
  currentSavings: 0,
  monthlyContribution: 0,
  monthlySpendingToday: 0,
  nominalReturnPct: 4,
  inflationPct: 2.5,
  otherMonthlyIncomeToday: 0,
  planToAge: 90,
};

const SCENARIOS: { id: string; label: string; returnPct: number; inflationPct: number; note: string }[] = [
  { id: 'cautious', label: 'Cautious', returnPct: 2.5, inflationPct: 2.5, note: 'Return roughly keeps pace with inflation' },
  { id: 'moderate', label: 'Moderate', returnPct: 4, inflationPct: 2.5, note: 'A balanced, diversified portfolio over long periods' },
  { id: 'growth', label: 'Growth-tilted', returnPct: 6, inflationPct: 2.5, note: 'Higher equity exposure; higher volatility' },
];

export default function RetirementCalculator() {
  const [state, setState, reset] = usePersistentState<RetirementInputs>('calc:retirement', DEFAULTS);
  const r = useMemo(() => projectRetirement(state), [state]);
  const set = <K extends keyof RetirementInputs>(key: K) => (v: RetirementInputs[K]) => setState((s) => ({ ...s, [key]: v }));
  const cpfEstimator = SOURCE_MAP['cpf-payout-estimator'];

  const contributionScenarios = useMemo(
    () =>
      [0, 250, 500, 1000].map((delta) => {
        const alt = projectRetirement({ ...state, monthlyContribution: state.monthlyContribution + delta });
        return { delta, savings: alt.savingsAtRetirementNominal, shortfall: alt.shortfall, sustainable: alt.sustainableMonthlyToday };
      }),
    [state],
  );
  const ageScenarios = useMemo(
    () =>
      [-3, 0, 3, 5].map((delta) => {
        const age = Math.max(state.currentAge, state.retirementAge + delta);
        const alt = projectRetirement({ ...state, retirementAge: age });
        return { age, savings: alt.savingsAtRetirementNominal, shortfall: alt.shortfall, sustainable: alt.sustainableMonthlyToday };
      }),
    [state],
  );

  const activeScenario = SCENARIOS.find((s) => s.returnPct === state.nominalReturnPct && s.inflationPct === state.inflationPct);

  return (
    <CalculatorShell
      id="retirement"
      onReset={reset}
      sourceIds={['cpf-life', 'cpf-payout-estimator', 'cpf-planner', 'cpf-retirement-planning', 'moneysense']}
      relatedGuides={['retirement-income-cpf-life', 'cpf-basics', 'start-investing']}
      headline={[
        { label: 'Savings at retirement', value: sgd(r.savingsAtRetirementNominal) },
        { label: r.shortfall > 0 ? 'Shortfall' : 'Surplus', value: sgd(Math.abs(r.shortfall)) },
      ]}
      snapshot={[
        { label: 'Retire at', value: `${state.retirementAge}` },
        { label: 'Projected savings (nominal)', value: sgd(r.savingsAtRetirementNominal) },
        { label: "Projected savings (today's dollars)", value: sgd(r.savingsAtRetirementReal) },
        { label: 'Monthly spending at retirement', value: sgd(r.futureMonthlySpending) },
        { label: 'Capital needed for the gap', value: sgd(r.requiredCapital) },
        { label: r.shortfall > 0 ? 'Shortfall' : 'Surplus', value: sgd(Math.abs(r.shortfall)) },
      ]}
      caveat={
        <>
          This is an illustration from your own assumptions, not a forecast, a guaranteed return, guaranteed retirement income or an official CPF LIFE estimate. For CPF-specific projections, use{' '}
          <ExternalLink href={cpfEstimator.url}>CPF Board's payout estimator</ExternalLink> and enter the result as “other monthly income” here.
        </>
      }
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Contributions are level every month until retirement and earn the assumed nominal return, compounded monthly. Real returns vary year to year; the order of good and bad years matters and is not modelled.</li>
          <li>Spending and other income are entered in today's dollars and inflated to the retirement year at the assumed inflation rate; withdrawals keep rising with inflation through retirement.</li>
          <li>During retirement the remaining balance keeps earning the same nominal return. Tax, fees, CPF rules and healthcare shocks are not modelled.</li>
          <li>The scenario presets are illustrative labels only. They are not recommendations or predictions.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Savings at retirement: balance grows each month by (1 + return ÷ 12) and adds the monthly contribution. Today's-dollar value divides by (1 + inflation)^years.</li>
          <li>Future monthly spending = spending today × (1 + inflation)^years to retirement; the same for other income. Monthly gap = spending − other income.</li>
          <li>Capital needed = annual gap × [1 − (1 + real)^−n] ÷ real, where real = (1 + return) ÷ (1 + inflation) − 1 and n = years in retirement. If real ≈ 0, capital = annual gap × n.</li>
          <li>Funds-last-until: a month-by-month drawdown of the gap, indexed to inflation yearly, until the balance is exhausted or the planning age is reached.</li>
          <li>Sustainable monthly spending = projected savings ÷ capital needed per S$1 of monthly gap, converted back to today's dollars.</li>
        </ul>
      }
      results={
        <ResultsPanel>
          <StatGrid>
            <Stat label="Projected savings at retirement" value={sgd(r.savingsAtRetirementNominal)} size="lg" className="col-span-2 sm:col-span-3" hint={`${sgd(r.savingsAtRetirementReal)} in today's dollars · ${sgd(r.contributionsTotal)} contributed over ${r.yearsToRetirement} years`} />
            <Stat label="Monthly spending at retirement" value={sgd(r.futureMonthlySpending)} hint={`${sgd(state.monthlySpendingToday)} today, inflated`} />
            <Stat label="Monthly gap to fund" value={sgd(r.monthlyGapAtRetirement)} hint={`after ${sgd(r.futureOtherIncome)} other income`} />
            <Stat label="Capital needed for the gap" value={sgd(r.requiredCapital)} hint={`to age ${state.planToAge}`} />
            <Stat label={r.shortfall > 0 ? 'Shortfall at retirement' : 'Surplus at retirement'} value={sgd(Math.abs(r.shortfall))} tone={r.shortfall > 0 ? 'caution' : 'positive'} />
            <Stat label="Funds last until" value={r.monthlyGapAtRetirement === 0 ? 'No gap' : r.fundsLastUntilAge ? `age ${r.fundsLastUntilAge}` : `beyond ${state.planToAge}`} tone={r.fundsLastUntilAge ? 'caution' : 'positive'} />
            <Stat label="Sustainable spending" value={sgd(r.sustainableMonthlyToday)} hint="per month, today's dollars, on top of other income" />
          </StatGrid>
          {state.monthlySpendingToday === 0 && <Note>Enter your expected monthly retirement spending to see the gap and the capital it would need.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Ages">
        <SliderField label="Current age" min={18} max={80} step={1} value={state.currentAge} onChange={set('currentAge')} allowAboveMax={false} />
        <SliderField label="Intended retirement age" min={40} max={80} step={1} value={state.retirementAge} onChange={set('retirementAge')} allowAboveMax={false} help="CPF LIFE payouts can start from 65 and be deferred up to 70; your own savings can start earlier or later." />
        <SliderField label="Plan to age" min={70} max={105} step={1} value={state.planToAge} onChange={set('planToAge')} allowAboveMax={false} help="How long your own savings should last. Planning to 90 or beyond is common because of longevity." />
      </InputGroup>

      <InputGroup title="Savings and spending" description="Today's dollars. Exclude CPF balances that will become CPF LIFE payouts; add those payouts as other income instead.">
        <SliderField label="Current retirement savings (outside CPF LIFE)" prefix="S$" min={0} max={2000000} step={5000} value={state.currentSavings} onChange={set('currentSavings')} />
        <SliderField label="Monthly contributions" prefix="S$" min={0} max={10000} step={50} value={state.monthlyContribution} onChange={set('monthlyContribution')} />
        <SliderField label="Expected monthly retirement spending (today's dollars)" prefix="S$" min={0} max={15000} step={100} value={state.monthlySpendingToday} onChange={set('monthlySpendingToday')} />
        <SliderField label="Other expected monthly retirement income (today's dollars)" prefix="S$" min={0} max={10000} step={50} value={state.otherMonthlyIncomeToday} onChange={set('otherMonthlyIncomeToday')} help="CPF LIFE estimate from CPF Board's tool, rental income, annuities, part-time work." />
      </InputGroup>

      <InputGroup title="Assumptions" description="Adjust freely. The presets are labelled illustrations, not predictions.">
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <Button key={s.id} size="sm" variant={activeScenario?.id === s.id ? 'primary' : 'secondary'} onClick={() => setState((st) => ({ ...st, nominalReturnPct: s.returnPct, inflationPct: s.inflationPct }))} title={s.note}>
              {s.label}: {s.returnPct}% return, {s.inflationPct}% inflation
            </Button>
          ))}
        </div>
        <SliderField label="Assumed nominal investment return" suffix="% p.a." min={0} max={10} step={0.1} value={state.nominalReturnPct} onChange={set('nominalReturnPct')} format={(n) => `${n.toFixed(1)}% p.a.`} help="Before inflation. Cash-like savings earn less; diversified portfolios have historically earned more over long periods, with volatility." />
        <SliderField label="Assumed annual inflation" suffix="% p.a." min={0} max={6} step={0.1} value={state.inflationPct} onChange={set('inflationPct')} format={(n) => `${n.toFixed(1)}% p.a.`} />
        <p className="text-[13px] text-ink-faint">Real return implied by these assumptions: {(((1 + state.nominalReturnPct / 100) / (1 + state.inflationPct / 100) - 1) * 100).toFixed(2)}% p.a.</p>
      </InputGroup>

      <InputGroup title="Savings trajectory" description="Nominal balance and its value in today's dollars, through accumulation and drawdown.">
        <LineChart
          ariaLabel="Projected savings by age, nominal and in today's dollars"
          series={[
            { name: 'Nominal balance', points: r.trajectory.map((p) => ({ x: p.age, y: p.nominal })) },
            { name: "Today's dollars", points: r.trajectory.map((p) => ({ x: p.age, y: p.real })), dashed: true },
          ]}
          xLabel="Age"
          markerX={state.retirementAge}
          markerLabel="Retire"
          height={240}
        />
      </InputGroup>

      <InputGroup title="What would change the picture" description="Each row re-runs the projection with one change, holding everything else constant.">
        <div>
          <div className="mb-2 text-[13.5px] font-medium text-ink">Contributing more each month</div>
          <DefinitionList dense rows={contributionScenarios.map((s) => ({ label: `${s.delta === 0 ? 'Current' : `+${sgd(s.delta)} / month`} → ${sgd(s.savings)} at retirement`, value: s.shortfall > 0 ? `short ${sgd(s.shortfall)}` : `surplus ${sgd(-s.shortfall)}`, tone: s.shortfall > 0 ? 'caution' : 'positive', emphasis: s.delta === 0 }))} />
        </div>
        <div>
          <div className="mb-2 text-[13.5px] font-medium text-ink">Retiring at a different age</div>
          <DefinitionList dense rows={ageScenarios.map((s) => ({ label: `Retire at ${s.age} → ${sgd(s.savings)}`, value: s.shortfall > 0 ? `short ${sgd(s.shortfall)}` : `surplus ${sgd(-s.shortfall)}`, tone: s.shortfall > 0 ? 'caution' : 'positive', emphasis: s.age === state.retirementAge }))} />
        </div>
      </InputGroup>
    </CalculatorShell>
  );
}
