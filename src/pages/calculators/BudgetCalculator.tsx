import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { usePrefill } from '@/lib/usePrefill';
import { budgetSummary, type BudgetCategory, type BudgetKind } from '@/lib/finance';
import { formatDate, pct, sgd } from '@/lib/format';
import { SOURCE_MAP } from '@/data/sources';
import { Icon } from '@/components/ui/Icon';
import { uid } from '@/lib/storage';
import { BENCHMARKS } from '@/data/benchmarks';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { NumberField, SelectField, SliderField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { BarList, StackedBar } from '@/components/charts/Charts';
import { Note } from '@/components/ui/Misc';

interface BudgetState {
  takeHomeIncome: number;
  otherIncome: number;
  desiredMonthlySavings: number;
  allocation: { essential: number; lifestyle: number; savings: number };
  categories: BudgetCategory[];
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: 'housing', name: 'Housing (rent, mortgage, conservancy)', amount: 0, kind: 'essential' },
  { id: 'food', name: 'Food and groceries', amount: 0, kind: 'essential' },
  { id: 'transport', name: 'Transport', amount: 0, kind: 'essential' },
  { id: 'insurance', name: 'Insurance premiums', amount: 0, kind: 'essential' },
  { id: 'healthcare', name: 'Healthcare', amount: 0, kind: 'essential' },
  { id: 'family', name: 'Family and childcare', amount: 0, kind: 'essential' },
  { id: 'debt', name: 'Debt payments', amount: 0, kind: 'essential' },
  { id: 'personal', name: 'Personal spending', amount: 0, kind: 'lifestyle' },
  { id: 'savings', name: 'Savings and investments', amount: 0, kind: 'savings' },
  { id: 'other', name: 'Other expenses', amount: 0, kind: 'lifestyle' },
];

const DEFAULTS: BudgetState = {
  takeHomeIncome: 0,
  otherIncome: 0,
  desiredMonthlySavings: 0,
  allocation: { essential: 50, lifestyle: 30, savings: 20 },
  categories: DEFAULT_CATEGORIES,
};

const KIND_LABEL: Record<BudgetKind, string> = { essential: 'Essential', lifestyle: 'Lifestyle', savings: 'Savings' };
const KIND_OPTIONS: { value: BudgetKind; label: string }[] = [
  { value: 'essential', label: 'Essential' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'savings', label: 'Savings' },
];

export default function BudgetCalculator() {
  const [state, setState, reset] = usePersistentState<BudgetState>('calc:budget', DEFAULTS);
  const prefilled = usePrefill(setState, { income: 'takeHomeIncome', other: 'otherIncome', savings: 'desiredMonthlySavings' }, (params, s) => {
    const byId: Record<string, string> = { housing: 'housing', food: 'food', transport: 'transport', insurance: 'insurance', childcare: 'family', debt: 'debt', personal: 'personal', saving: 'savings' };
    let cats = s.categories;
    for (const [param, catId] of Object.entries(byId)) {
      const raw = params.get(param);
      if (raw === null || !Number.isFinite(Number(raw))) continue;
      cats = cats.map((c) => (c.id === catId ? { ...c, amount: Number(raw) } : c));
    }
    return { ...s, categories: cats };
  });
  const result = useMemo(() => budgetSummary(state), [state]);
  const allocationTotal = state.allocation.essential + state.allocation.lifestyle + state.allocation.savings;

  const updateCategory = (id: string, patch: Partial<BudgetCategory>) => setState((s) => ({ ...s, categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeCategory = (id: string) => setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  const addCategory = () => setState((s) => ({ ...s, categories: [...s.categories, { id: uid(), name: 'New category', amount: 0, kind: 'lifestyle' }] }));

  const surplusTone = result.surplus < 0 ? 'caution' : result.surplus > 0 ? 'positive' : 'neutral';

  return (
    <CalculatorShell
      id="budget"
      prefilled={prefilled}
      onReset={reset}
      sourceIds={['moneysense', 'moneysense-decisions', 'mom-labour-force-2025', 'singstat-income-2025', 'singstat-hes-2023']}
      relatedGuides={['build-a-budget', 'emergency-fund', 'subscriptions-and-bills']}
      headline={[
        { label: result.surplus < 0 ? 'Monthly deficit' : 'Monthly surplus', value: sgd(Math.abs(result.surplus)) },
        { label: 'Savings rate', value: pct(result.effectiveSavingsRate) },
      ]}
      snapshot={[
        { label: 'Monthly income', value: sgd(result.totalIncome) },
        { label: 'Monthly outgoings', value: sgd(result.totalOutgoings) },
        { label: 'Surplus / deficit', value: sgd(result.surplus) },
        { label: 'Savings rate', value: pct(result.effectiveSavingsRate) },
      ]}
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Income is your take-home pay after CPF and tax; CPF contributions are not counted as savings here.</li>
          <li>The suggested allocation is a user-adjustable rule of thumb (default 50 / 30 / 20), not a standard anyone is required to meet.</li>
          <li>Savings rate counts your “Savings and investments” categories; the effective rate also counts any surplus you leave unspent.</li>
          <li>Irregular yearly costs should be entered as one-twelfth of the annual amount.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Total income = take-home pay + other household income.</li>
          <li>Outgoings = essential + lifestyle categories + savings contributions. Surplus = income − outgoings.</li>
          <li>Suggested amounts = income × your allocation percentages. Variance = actual − suggested for each bucket.</li>
          <li>Actual savings = savings contributions + any positive surplus, compared with your desired monthly savings.</li>
        </ul>
      }
      results={
        <ResultsPanel footer="Figures update as you type. Nothing is sent anywhere.">
          <StatGrid>
            <Stat label="Monthly income" value={sgd(result.totalIncome)} />
            <Stat label="Monthly outgoings" value={sgd(result.totalOutgoings)} hint={`${sgd(result.totalExpenses)} spending + ${sgd(result.totalSavings)} saved`} />
            <Stat label={result.surplus < 0 ? 'Monthly deficit' : 'Monthly surplus'} value={sgd(Math.abs(result.surplus))} tone={surplusTone} size="lg" className="col-span-2 sm:col-span-1" />
            <Stat label="Savings rate" value={pct(result.savingsRate)} hint={`${pct(result.effectiveSavingsRate)} if surplus is saved`} />
            <Stat label="Desired savings" value={sgd(result.desiredVsActual.desired)} hint={result.desiredVsActual.desired > 0 ? `${result.desiredVsActual.difference >= 0 ? 'On track' : `Short by ${sgd(Math.abs(result.desiredVsActual.difference))}`}` : 'Set a target below'} tone={result.desiredVsActual.desired > 0 && result.desiredVsActual.difference < 0 ? 'caution' : 'neutral'} />
          </StatGrid>
          {result.totalOutgoings > 0 && (
            <div>
              <div className="mb-2 text-[13px] text-ink-faint">Where it goes</div>
              <StackedBar
                ariaLabel="Breakdown of outgoings into essential, lifestyle and savings"
                segments={[
                  { label: 'Essential', value: result.byKind.essential },
                  { label: 'Lifestyle', value: result.byKind.lifestyle },
                  { label: 'Savings', value: result.byKind.savings },
                ]}
              />
            </div>
          )}
          {result.totalIncome === 0 && <Note>Enter your take-home income to see the comparison with your suggested allocation.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Income" description="Monthly figures, after CPF and tax.">
        <SliderField label="Monthly take-home income" benchmark={BENCHMARKS.medianFullTimeIncome} prefix="S$" min={0} max={20000} step={100} value={state.takeHomeIncome} onChange={(v) => setState((s) => ({ ...s, takeHomeIncome: v }))} />
        <SliderField label="Other household income" benchmark={BENCHMARKS.householdIncomeContext} prefix="S$" min={0} max={20000} step={100} value={state.otherIncome} onChange={(v) => setState((s) => ({ ...s, otherIncome: v }))} help="A partner's take-home pay, rental income, regular allowances." />
        <SliderField label="Desired monthly savings" benchmark={BENCHMARKS.savingsTarget} benchmarkValue={state.takeHomeIncome > 0 ? Math.round((state.takeHomeIncome + state.otherIncome) * 0.2 / 50) * 50 : undefined} prefix="S$" min={0} max={10000} step={50} value={state.desiredMonthlySavings} onChange={(v) => setState((s) => ({ ...s, desiredMonthlySavings: v }))} help="What you would like to put away each month. The results compare this with what the budget actually allows." />
      </InputGroup>

      <InputGroup title="Monthly spending and savings" description="Edit names, amounts and types. Add or remove categories to match your life.">
        <div className="space-y-3">
          {state.categories.map((c) => (
            <div key={c.id} className="relative grid grid-cols-2 gap-2 rounded-md border border-stone-200 bg-stone-100 p-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] sm:items-end">
              <div className="col-span-2 pr-10 sm:col-span-1 sm:pr-0">
                <label htmlFor={`cat-name-${c.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Category
                </label>
                <input id={`cat-name-${c.id}`} className="field-input !py-1.5 text-sm" value={c.name} onChange={(e) => updateCategory(c.id, { name: e.target.value })} maxLength={60} />
              </div>
              <div>
                <label htmlFor={`cat-amount-${c.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Monthly amount
                </label>
                <NumberField id={`cat-amount-${c.id}`} compact label={`${c.name} amount`} prefix="S$" value={c.amount} onChange={(v) => updateCategory(c.id, { amount: v })} min={0} step={10} />
              </div>
              <div>
                <label htmlFor={`cat-kind-${c.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Type
                </label>
                <SelectField id={`cat-kind-${c.id}`} compact label={`${c.name} type`} value={c.kind} onChange={(v) => updateCategory(c.id, { kind: v })} options={KIND_OPTIONS} />
              </div>
              <Button size="sm" variant="ghost" icon="trash-2" aria-label={`Remove ${c.name}`} onClick={() => removeCategory(c.id)} className="absolute right-2 top-2 sm:static sm:mb-0.5">
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
        <Button variant="secondary" icon="plus" onClick={addCategory}>
          Add category
        </Button>
        <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-[13px] font-medium text-ink">
            <Icon name="chart-column" size={14} className="text-sage-700" />
            What the average household spent in 2023
          </div>
          <p className="text-[12.5px] leading-5 text-ink-faint">
            SingStat's Household Expenditure Survey 2023 puts average spending at S$5,931 a month across all households. The three largest items are below; use them as a reference, not a target.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(
              [
                { id: 'housing', label: 'Housing and related', benchmark: BENCHMARKS.avgHousingSpend },
                { id: 'food', label: 'Food (incl. eating out)', benchmark: BENCHMARKS.avgFoodSpend },
                { id: 'transport', label: 'Transport', benchmark: BENCHMARKS.avgTransportSpend },
              ] as const
            ).map((row) => {
              const target = state.categories.find((c) => c.id === row.id);
              const applied = target !== undefined && target.amount === row.benchmark.value;
              return (
                <div key={row.id} className="flex items-center justify-between gap-2 rounded-md bg-stone-100 px-3 py-2 text-[13px]">
                  <span className="min-w-0">
                    <span className="block text-ink-faint">{row.label}</span>
                    <span className="font-medium tabular-nums text-ink">{sgd(row.benchmark.value)}</span>
                  </span>
                  {target && (
                    <button
                      type="button"
                      className="shrink-0 rounded-md border border-stone-300 bg-stone-50 px-2 py-0.5 text-[12px] font-medium text-sage-800 hover:border-sage-400 disabled:opacity-60"
                      disabled={applied}
                      onClick={() => updateCategory(row.id, { amount: row.benchmark.value ?? 0 })}
                      aria-label={applied ? `${row.label} set to the average` : `Use ${sgd(row.benchmark.value)} for ${target.name}`}
                    >
                      {applied ? 'Applied' : 'Use'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-ink-faint">
            Housing is 29.8% and food 20.0% of the S$5,931 average; transport was S$951.{' '}
            <a href={SOURCE_MAP['singstat-hes-2023'].url} target="_blank" rel="noopener noreferrer" className="link">
              SingStat source
            </a>{' '}
            · read {formatDate('2026-10-25')}.
          </p>
        </div>
      </InputGroup>

      <InputGroup title="Suggested allocation" description="A rule of thumb you can edit. Compare it with your actual spending.">
        <div className="grid gap-4 sm:grid-cols-3">
          <SliderField label="Essentials" suffix="%" min={0} max={100} step={1} value={state.allocation.essential} onChange={(v) => setState((s) => ({ ...s, allocation: { ...s.allocation, essential: v } }))} allowAboveMax={false} />
          <SliderField label="Lifestyle" suffix="%" min={0} max={100} step={1} value={state.allocation.lifestyle} onChange={(v) => setState((s) => ({ ...s, allocation: { ...s.allocation, lifestyle: v } }))} allowAboveMax={false} />
          <SliderField label="Savings" suffix="%" min={0} max={100} step={1} value={state.allocation.savings} onChange={(v) => setState((s) => ({ ...s, allocation: { ...s.allocation, savings: v } }))} allowAboveMax={false} />
        </div>
        {allocationTotal !== 100 && <p className="text-[13px] text-clay-700">Your allocation adds up to {allocationTotal}%. It usually makes sense for the three parts to total 100%.</p>}
        <DefinitionList
          rows={(['essential', 'lifestyle', 'savings'] as BudgetKind[]).map((k) => ({
            label: `${KIND_LABEL[k]} — suggested ${sgd(result.suggested[k])}, actual ${sgd(result.byKind[k])}`,
            value: result.totalIncome > 0 ? `${result.variance[k] > 0 ? '+' : ''}${sgd(result.variance[k])}` : '—',
            tone: result.totalIncome > 0 && ((k !== 'savings' && result.variance[k] > 0) || (k === 'savings' && result.variance[k] < 0)) ? 'caution' : 'neutral',
          }))}
        />
      </InputGroup>

      {result.breakdown.length > 0 && (
        <InputGroup title="Expense breakdown" description="Largest categories first, as a share of all outgoings.">
          <BarList ariaLabel="Expense breakdown by category" items={result.breakdown.map((b) => ({ label: b.name, value: b.amount, hint: pct(b.share), colour: b.kind === 'savings' ? 'var(--chart-2)' : b.kind === 'lifestyle' ? 'var(--chart-3)' : 'var(--chart-1)' }))} />
        </InputGroup>
      )}
    </CalculatorShell>
  );
}
