import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { compareExtraPayments, debtPayoff, emergencyFund, type Debt, type PayoffStrategy } from '@/lib/finance';
import { months as fmtMonths, sgd } from '@/lib/format';
import { uid } from '@/lib/storage';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { NumberField, Segmented, SliderField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { ColumnChart, LineChart } from '@/components/charts/Charts';
import { Note } from '@/components/ui/Misc';

interface State {
  currentSavings: number;
  essentialMonthly: number;
  coverageMonths: number;
  monthlyContribution: number;
  debts: Debt[];
  extraMonthly: number;
  strategy: PayoffStrategy;
}

const DEFAULTS: State = {
  currentSavings: 0,
  essentialMonthly: 0,
  coverageMonths: 6,
  monthlyContribution: 0,
  debts: [],
  extraMonthly: 0,
  strategy: 'avalanche',
};

export default function EmergencyDebtCalculator() {
  const [state, setState, reset] = usePersistentState<State>('calc:emergency-debt', DEFAULTS);
  const fund = useMemo(() => emergencyFund(state.currentSavings, state.essentialMonthly, state.coverageMonths, state.monthlyContribution), [state]);
  const payoff = useMemo(() => debtPayoff(state.debts, state.extraMonthly, state.strategy), [state.debts, state.extraMonthly, state.strategy]);
  const comparison = useMemo(() => {
    const extras = Array.from(new Set([0, state.extraMonthly, state.extraMonthly + 100, state.extraMonthly + 300, state.extraMonthly + 500])).sort((a, b) => a - b);
    return compareExtraPayments(state.debts, extras, state.strategy);
  }, [state.debts, state.extraMonthly, state.strategy]);
  const hasDebts = state.debts.some((d) => d.balance > 0);
  const totalDebt = state.debts.reduce((s, d) => s + Math.max(0, d.balance), 0);

  const updateDebt = (id: string, patch: Partial<Debt>) => setState((s) => ({ ...s, debts: s.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
  const addDebt = () => setState((s) => ({ ...s, debts: [...s.debts, { id: uid(), name: `Debt ${s.debts.length + 1}`, balance: 0, aprPct: 0, minPayment: 0 }] }));
  const removeDebt = (id: string) => setState((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== id) }));

  const balanceSeries = payoff.balanceByMonth.map((b, i) => ({ x: i, y: b })).filter((_, i, arr) => arr.length <= 120 || i % Math.ceil(arr.length / 120) === 0 || i === arr.length - 1);

  return (
    <CalculatorShell
      id="emergency-debt"
      onReset={reset}
      sourceIds={['moneysense']}
      relatedGuides={['emergency-fund', 'pay-down-debt', 'build-a-budget']}
      headline={[
        { label: 'Fund gap', value: sgd(fund.gap) },
        { label: 'Debt payoff', value: hasDebts ? (payoff.paidOff ? fmtMonths(payoff.months) : 'Not paid off') : 'No debts' },
      ]}
      snapshot={[
        { label: 'Emergency fund target', value: sgd(fund.target) },
        { label: 'Funding gap', value: sgd(fund.gap) },
        { label: 'Months to target', value: fund.monthsToTarget === null ? 'No contribution set' : fmtMonths(fund.monthsToTarget) },
        { label: 'Debt payoff time', value: hasDebts ? (payoff.paidOff ? fmtMonths(payoff.months) : 'Not paid off') : 'No debts' },
        { label: 'Interest paid', value: hasDebts ? sgd(payoff.totalInterest) : '—' },
      ]}
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Emergency fund target = essential monthly expenses × months of coverage. Only expenses that continue if income stopped belong in the essentials figure.</li>
          <li>Months to target assumes a fixed monthly contribution and ignores interest earned on the fund.</li>
          <li>Debt interest accrues monthly at APR ÷ 12 on the outstanding balance. Fees, late charges, promotional rates and rate changes are not modelled.</li>
          <li>Minimum payments are paid on every debt; the extra amount goes to the priority debt. When a debt is cleared, its minimum rolls into the extra amount.</li>
          <li>Avalanche prioritises the highest rate (least interest); snowball prioritises the smallest balance (quickest first win).</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Each month: interest is added to every balance, minimums are paid, then the extra amount is applied to the priority debt (cascading to the next if it clears).</li>
          <li>The simulation stops when all balances reach zero or after 100 years, and flags when payments do not cover the first month's interest.</li>
          <li>Total interest is the sum of interest added over the simulation; total paid = principal + interest.</li>
        </ul>
      }
      caveat="Repayment results are estimates based on the rates and minimums you enter. Your lender's statements and terms are the authoritative record of what you owe and what you will be charged."
      results={
        <ResultsPanel>
          <div>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-wider text-sage-700">Emergency fund</div>
            <StatGrid>
              <Stat label="Target" value={sgd(fund.target)} hint={`${state.coverageMonths} × ${sgd(state.essentialMonthly)}`} />
              <Stat label="Gap" value={sgd(fund.gap)} tone={fund.gap > 0 ? 'caution' : 'positive'} hint={fund.gap === 0 && fund.target > 0 ? 'Fully funded' : undefined} />
              <Stat label="Months to target" value={fund.monthsToTarget === null ? '—' : fmtMonths(fund.monthsToTarget)} hint={fund.monthsToTarget === null && fund.gap > 0 ? 'Set a monthly contribution' : undefined} />
              <Stat label="Covered today" value={`${fund.coverageNow.toFixed(1)} months`} />
            </StatGrid>
          </div>
          <div className="border-t border-stone-200 pt-5">
            <div className="mb-3 text-[12px] font-medium uppercase tracking-wider text-sage-700">Debt repayment</div>
            {!hasDebts ? (
              <p className="text-[13.5px] text-ink-faint">Add a debt below to see a repayment timeline.</p>
            ) : (
              <StatGrid>
                <Stat label="Total balance" value={sgd(totalDebt)} />
                <Stat label="Paid off in" value={payoff.paidOff ? fmtMonths(payoff.months) : 'Not within 100 years'} tone={payoff.paidOff ? 'positive' : 'caution'} size="lg" className="col-span-2 sm:col-span-1" />
                <Stat label="Interest cost" value={sgd(payoff.totalInterest)} hint="approximate" />
              </StatGrid>
            )}
            {payoff.insufficientPayment && <Note tone="caution" className="mt-4">Your minimum payments plus extra do not cover the first month's interest, so the balance would grow. Increase the extra amount or talk to your lenders.</Note>}
          </div>
        </ResultsPanel>
      }
    >
      <InputGroup title="Emergency fund" description="Cash you can reach within a day or two, kept separate from daily spending.">
        <SliderField label="Current emergency savings" prefix="S$" min={0} max={100000} step={500} value={state.currentSavings} onChange={(v) => setState((s) => ({ ...s, currentSavings: v }))} />
        <SliderField label="Essential monthly expenses" prefix="S$" min={0} max={15000} step={100} value={state.essentialMonthly} onChange={(v) => setState((s) => ({ ...s, essentialMonthly: v }))} help="Rent or mortgage, food, transport, insurance, minimum debt payments, family support." />
        <SliderField label="Desired coverage" suffix="months" min={1} max={12} step={1} value={state.coverageMonths} onChange={(v) => setState((s) => ({ ...s, coverageMonths: v }))} allowAboveMax={false} help="Three to six months is a common range; more if income is variable or you have dependants." />
        <SliderField label="Monthly contribution to the fund" prefix="S$" min={0} max={5000} step={50} value={state.monthlyContribution} onChange={(v) => setState((s) => ({ ...s, monthlyContribution: v }))} />
      </InputGroup>

      <InputGroup title="Debts" description="Add each card or loan with its balance, interest rate and minimum payment.">
        {state.debts.length === 0 && <p className="text-[13.5px] text-ink-faint">No debts added. If you have none, the emergency fund section is all you need.</p>}
        <div className="space-y-3">
          {state.debts.map((d) => (
            <div key={d.id} className="relative grid grid-cols-2 gap-2 rounded-md border border-stone-200 bg-stone-100 p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] sm:items-end">
              <div className="col-span-2 pr-10 sm:col-span-1 sm:pr-0">
                <label htmlFor={`debt-name-${d.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Name
                </label>
                <input id={`debt-name-${d.id}`} className="field-input !py-1.5 text-sm" value={d.name} onChange={(e) => updateDebt(d.id, { name: e.target.value })} maxLength={40} />
              </div>
              <div>
                <label htmlFor={`debt-bal-${d.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Balance
                </label>
                <NumberField id={`debt-bal-${d.id}`} compact label={`${d.name} balance`} prefix="S$" value={d.balance} onChange={(v) => updateDebt(d.id, { balance: v })} step={100} />
              </div>
              <div>
                <label htmlFor={`debt-apr-${d.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Rate (APR)
                </label>
                <NumberField id={`debt-apr-${d.id}`} compact label={`${d.name} interest rate`} suffix="%" value={d.aprPct} onChange={(v) => updateDebt(d.id, { aprPct: v })} step={0.1} max={100} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={`debt-min-${d.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Minimum / month
                </label>
                <NumberField id={`debt-min-${d.id}`} compact label={`${d.name} minimum payment`} prefix="S$" value={d.minPayment} onChange={(v) => updateDebt(d.id, { minPayment: v })} step={10} />
              </div>
              <Button size="sm" variant="ghost" icon="trash-2" aria-label={`Remove ${d.name}`} onClick={() => removeDebt(d.id)} className="absolute right-2 top-2 sm:static sm:mb-0.5">
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
        <Button variant="secondary" icon="plus" onClick={addDebt}>
          Add a debt
        </Button>
        <SliderField label="Extra monthly repayment" prefix="S$" min={0} max={5000} step={50} value={state.extraMonthly} onChange={(v) => setState((s) => ({ ...s, extraMonthly: v }))} help="On top of all minimum payments, applied to the priority debt." />
        <Segmented
          label="Repayment order"
          value={state.strategy}
          onChange={(v) => setState((s) => ({ ...s, strategy: v }))}
          options={[
            { value: 'avalanche', label: 'Avalanche — highest rate first' },
            { value: 'snowball', label: 'Snowball — smallest balance first' },
          ]}
        />
      </InputGroup>

      {hasDebts && (
        <InputGroup title="Repayment timeline" description="Total balance over time with the selected strategy and extra payment.">
          {payoff.paidOff && <LineChart ariaLabel="Total debt balance by month" series={[{ name: 'Total balance', points: balanceSeries }]} xLabel="Months from now" formatX={(n) => `${Math.round(n)}`} height={200} />}
          <DefinitionList
            rows={payoff.perDebt.map((d) => ({ label: d.name, value: d.payoffMonth ? `Cleared in month ${d.payoffMonth} · ${sgd(d.interest)} interest` : 'Not cleared' }))}
            dense
          />
        </InputGroup>
      )}

      {hasDebts && (
        <InputGroup title="What a different extra payment would do" description="Months to clear all debts for a few extra-payment amounts, using the same strategy.">
          <ColumnChart ariaLabel="Months to pay off debts by extra monthly payment" items={comparison.map((c) => ({ label: `+${sgd(c.extra)}/mo`, value: c.paidOff ? c.months : 0, highlight: c.extra === state.extraMonthly }))} format={(n) => (n > 0 ? fmtMonths(n) : 'n/a')} />
          <DefinitionList rows={comparison.map((c) => ({ label: `Extra ${sgd(c.extra)} per month`, value: c.paidOff ? `${fmtMonths(c.months)} · ${sgd(c.totalInterest)} interest` : 'Not paid off', emphasis: c.extra === state.extraMonthly }))} dense />
        </InputGroup>
      )}
    </CalculatorShell>
  );
}
