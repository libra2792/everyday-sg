import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { usePrefill } from '@/lib/usePrefill';
import { babyBudget, type BabyInputs, type ChildcareScenario } from '@/lib/finance';
import { pct, sgd } from '@/lib/format';
import { uid } from '@/lib/storage';
import { BENCHMARKS } from '@/data/benchmarks';
import { BenchmarkHint } from '@/components/ui/BenchmarkHint';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { NumberField, SliderField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { ColumnChart } from '@/components/charts/Charts';
import { Checklist } from '@/components/Checklist';
import { ExternalLink, Note } from '@/components/ui/Misc';
import { SOURCE_MAP } from '@/data/sources';
import type { ChecklistItem } from '@/data/types';

const DEFAULT_SCENARIOS: ChildcareScenario[] = [
  { id: 'family', name: 'Cared for by family', monthlyFee: 0, monthlySubsidy: 0 },
  { id: 'infant-care', name: 'Infant care centre', monthlyFee: 0, monthlySubsidy: 0 },
  { id: 'helper', name: 'Helper at home', monthlyFee: 0, monthlySubsidy: 0 },
];

const DEFAULTS: BabyInputs = {
  numberOfChildren: 1,
  setupBudget: 0,
  deliveryOutOfPocket: 0,
  monthlyInfantCost: 0,
  otherMonthlyCost: 0,
  lostIncomeDuringLeave: 0,
  scenarios: DEFAULT_SCENARIOS,
  selectedScenarioId: 'family',
  horizonYears: 3,
  householdMonthlyIncome: 0,
};

const PREP_CHECKLIST: ChecklistItem[] = [
  { id: 'insurance', text: 'Review hospitalisation and employer insurance for pregnancy and newborn cover', essential: true, group: 'Pregnancy' },
  { id: 'provider', text: 'Choose public or private care and get itemised cost estimates', essential: true, group: 'Pregnancy' },
  { id: 'medisave', text: 'Check MediSave Maternity Package limits (CPF Board / MOH)', essential: true, group: 'Pregnancy' },
  { id: 'leave', text: 'Confirm maternity, paternity and shared parental leave eligibility on MOM', essential: true, group: 'Pregnancy' },
  { id: 'budget', text: 'Agree the baby budget and start a dedicated savings transfer', essential: false, group: 'Pregnancy' },
  { id: 'register', text: 'Register the birth on LifeSG and enrol in the child support scheme', essential: true, group: 'Birth' },
  { id: 'cda', text: 'Open the Child Development Account and set up PayNow for payouts', essential: true, group: 'Birth' },
  { id: 'cover', text: 'Confirm MediShield Life and any additional cover for the baby', essential: true, group: 'Birth' },
  { id: 'apply-leave', text: 'Apply for leave with your employer', essential: true, group: 'Birth' },
  { id: 'childcare', text: 'Register interest at shortlisted infant care or childcare centres', essential: false, group: 'First year' },
  { id: 'subsidy', text: 'Apply for childcare subsidies through the centre (ECDA)', essential: false, group: 'First year' },
  { id: 'vaccines', text: 'Follow the childhood immunisation schedule', essential: true, group: 'First year' },
  { id: 'nominations', text: 'Update CPF and insurance nominations; consider a will with guardianship', essential: false, group: 'First year' },
  { id: 'review', text: 'Review the household budget after three months of real costs', essential: false, group: 'First year' },
];

export default function BabyCalculator() {
  const [state, setState, reset] = usePersistentState<BabyInputs>('calc:baby', DEFAULTS);
  const prefilled = usePrefill(setState, { children: 'numberOfChildren', setup: 'setupBudget', delivery: 'deliveryOutOfPocket', infant: 'monthlyInfantCost', other: 'otherMonthlyCost', leave: 'lostIncomeDuringLeave', horizon: 'horizonYears', income: 'householdMonthlyIncome' }, (params, s) => {
    const fee = Number(params.get('fee'));
    const sub = Number(params.get('subsidy'));
    if (!Number.isFinite(fee) && !Number.isFinite(sub)) return s;
    return { ...s, scenarios: s.scenarios.map((sc) => (sc.id === s.selectedScenarioId ? { ...sc, monthlyFee: Number.isFinite(fee) && params.has('fee') ? fee : sc.monthlyFee, monthlySubsidy: Number.isFinite(sub) && params.has('subsidy') ? sub : sc.monthlySubsidy } : sc)) };
  });
  const r = useMemo(() => babyBudget(state), [state]);
  const set = <K extends keyof BabyInputs>(key: K) => (v: BabyInputs[K]) => setState((s) => ({ ...s, [key]: v }));
  const updateScenario = (id: string, patch: Partial<ChildcareScenario>) => setState((s) => ({ ...s, scenarios: s.scenarios.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const addScenario = () => setState((s) => ({ ...s, scenarios: [...s.scenarios, { id: uid(), name: 'New arrangement', monthlyFee: 0, monthlySubsidy: 0 }] }));
  const removeScenario = (id: string) =>
    setState((s) => {
      const scenarios = s.scenarios.filter((x) => x.id !== id);
      return { ...s, scenarios, selectedScenarioId: s.selectedScenarioId === id ? (scenarios[0]?.id ?? '') : s.selectedScenarioId };
    });
  const selected = r.scenarioComparison.find((s) => s.id === state.selectedScenarioId) || r.scenarioComparison[0];
  const childSupport = SOURCE_MAP['lifesg-sg-child-support'];
  const ecda = SOURCE_MAP['ecda-subsidies'];

  return (
    <CalculatorShell
      id="baby"
      prefilled={prefilled}
      onReset={reset}
      sourceIds={['lifesg-sg-child-support', 'lifesg-baby-bonus', 'ecda-subsidies', 'mom-maternity', 'mom-paternity', 'mom-shared-parental', 'cpf-healthcare', 'ecda-aop', 'singstat-income-2025']}
      relatedGuides={['preparing-for-pregnancy', 'newborn-first-year', 'childcare-and-preschool']}
      headline={[
        { label: 'Monthly cost', value: sgd(r.monthlyTotal) },
        { label: 'First-year total', value: sgd(r.firstYearTotal) },
      ]}
      snapshot={[
        { label: 'One-time setup', value: sgd(r.oneTimeTotal) },
        { label: 'Monthly cost', value: sgd(r.monthlyTotal) },
        { label: 'First-year total', value: sgd(r.firstYearTotal) },
        { label: `${state.horizonYears}-year total`, value: sgd(r.horizonTotal) },
        { label: 'Arrangement', value: selected?.name ?? '—' },
      ]}
      caveat={
        <>
          Government benefits are not pre-filled. The subsidy fields are your own estimates; check eligibility and current amounts on{' '}
          <ExternalLink href={childSupport.url}>LifeSG (SG Child Support Package)</ExternalLink> and <ExternalLink href={ecda.url}>ECDA (preschool subsidies)</ExternalLink>.
        </>
      }
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Setup, delivery and monthly costs are per child and multiplied by the number of children; lost income during leave is a household one-time figure.</li>
          <li>Childcare fee net of subsidy is never negative. Subsidies are your assumptions, not confirmed entitlements.</li>
          <li>Costs are held flat across the horizon — no inflation and no change in arrangement as the child grows.</li>
          <li>Government cash benefits, CDA grants and tax reliefs are not deducted; add them to your household planning separately once confirmed.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>One-time total = (setup + delivery out-of-pocket) × children + lost income during leave.</li>
          <li>Monthly total = (monthly infant cost + other monthly cost + net childcare fee) × children. Annual = monthly × 12.</li>
          <li>First-year total = one-time total + annual total. Horizon total = one-time total + annual × years.</li>
          <li>Cash-flow impact = monthly total ÷ household monthly income.</li>
        </ul>
      }
      results={
        <ResultsPanel>
          <StatGrid>
            <Stat label="One-time setup cost" value={sgd(r.oneTimeTotal)} />
            <Stat label="Monthly cost" value={sgd(r.monthlyTotal)} size="lg" hint={selected ? `with “${selected.name}”` : undefined} />
            <Stat label="Annual cost" value={sgd(r.annualTotal)} />
            <Stat label="First-year spending" value={sgd(r.firstYearTotal)} hint="one-time + 12 months" />
            <Stat label={`Over ${state.horizonYears} years`} value={sgd(r.horizonTotal)} />
            <Stat label="Share of household income" value={state.householdMonthlyIncome > 0 ? pct(r.cashFlowShare) : '—'} hint={state.householdMonthlyIncome > 0 ? 'of monthly income' : 'Enter income to see'} tone={r.cashFlowShare > 0.3 ? 'caution' : 'neutral'} />
          </StatGrid>
          {r.monthlyTotal === 0 && r.oneTimeTotal === 0 && <Note>Enter your estimates to see the picture. Everyone's numbers are different; start with rough figures and refine them.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Family and horizon">
        <SliderField label="Expected number of children" min={1} max={5} step={1} value={state.numberOfChildren} onChange={set('numberOfChildren')} allowAboveMax={false} />
        <SliderField label="Planning horizon" suffix="years" min={1} max={10} step={1} value={state.horizonYears} onChange={set('horizonYears')} allowAboveMax={false} />
        <SliderField label="Household monthly income (take-home)" benchmark={BENCHMARKS.householdTakeHome} prefix="S$" min={0} max={30000} step={100} value={state.householdMonthlyIncome} onChange={set('householdMonthlyIncome')} help="Optional, for the cash-flow impact figure." />
      </InputGroup>

      <InputGroup title="One-time costs" description="Per child unless stated.">
        <SliderField label="Setup budget" benchmark={BENCHMARKS.babySetup} prefix="S$" min={0} max={20000} step={100} value={state.setupBudget} onChange={set('setupBudget')} help="Cot, pram, car seat, feeding and bathing gear, clothes, nursery." />
        <SliderField label="Delivery-related out-of-pocket" benchmark={BENCHMARKS.deliveryOop} prefix="S$" min={0} max={30000} step={100} value={state.deliveryOutOfPocket} onChange={set('deliveryOutOfPocket')} help="Antenatal and delivery costs after MediSave and insurance, using your hospital's estimate." />
        <SliderField label="Lost income during leave (household)" prefix="S$" min={0} max={60000} step={500} value={state.lostIncomeDuringLeave} onChange={set('lostIncomeDuringLeave')} help="Unpaid leave, reduced bonus or hours. Government-paid leave reduces this; check MOM for eligibility." />
      </InputGroup>

      <InputGroup title="Monthly costs" description="Per child.">
        <SliderField label="Monthly infant costs" benchmark={BENCHMARKS.infantMonthly} prefix="S$" min={0} max={3000} step={25} value={state.monthlyInfantCost} onChange={set('monthlyInfantCost')} help="Formula or feeding, diapers, clinic visits, clothing, insurance for the child." />
        <SliderField label="Other recurring costs" prefix="S$" min={0} max={3000} step={25} value={state.otherMonthlyCost} onChange={set('otherMonthlyCost')} help="Extra transport, household help, enrichment, savings for education." />
      </InputGroup>

      <InputGroup title="Childcare arrangements" description="Compare options side by side. Enter the monthly fee and your own subsidy assumption for each.">
        <div className="space-y-3">
          {state.scenarios.map((s) => (
            <div key={s.id} className={`relative rounded-md border p-3 ${s.id === state.selectedScenarioId ? 'border-sage-500 bg-sage-50' : 'border-stone-200 bg-stone-100'}`}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                <label className="col-span-2 flex items-center gap-2 pr-10 text-[13px] text-ink sm:col-span-1 sm:mb-2 sm:pr-0">
                  <input type="radio" name="baby-scenario" className="accent-sage-600" checked={s.id === state.selectedScenarioId} onChange={() => set('selectedScenarioId')(s.id)} />
                  Use
                </label>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={`sc-name-${s.id}`} className="mb-1 block text-[12px] text-ink-faint">
                    Arrangement
                  </label>
                  <input id={`sc-name-${s.id}`} className="field-input !py-1.5 text-sm" value={s.name} onChange={(e) => updateScenario(s.id, { name: e.target.value })} maxLength={40} />
                </div>
                <div>
                  <label htmlFor={`sc-fee-${s.id}`} className="mb-1 block text-[12px] text-ink-faint">
                    Monthly fee
                  </label>
                  <NumberField id={`sc-fee-${s.id}`} compact label={`${s.name} monthly fee`} prefix="S$" value={s.monthlyFee} onChange={(v) => updateScenario(s.id, { monthlyFee: v })} step={10} />
                </div>
                <div>
                  <label htmlFor={`sc-sub-${s.id}`} className="mb-1 block text-[12px] text-ink-faint">
                    Subsidy (your estimate)
                  </label>
                  <NumberField id={`sc-sub-${s.id}`} compact label={`${s.name} subsidy estimate`} prefix="S$" value={s.monthlySubsidy} onChange={(v) => updateScenario(s.id, { monthlySubsidy: v })} step={10} />
                </div>
                <Button size="sm" variant="ghost" icon="trash-2" aria-label={`Remove ${s.name}`} onClick={() => removeScenario(s.id)} disabled={state.scenarios.length <= 1} className="absolute right-2 top-2 sm:static sm:mb-0.5">
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" icon="plus" onClick={addScenario}>
          Add arrangement
        </Button>
        <BenchmarkHint benchmark={BENCHMARKS.infantCareCap} className="!mt-0" />
        {r.scenarioComparison.length > 0 && (
          <div>
            <div className="mb-2 text-[13.5px] font-medium text-ink">Monthly cost by arrangement (all children)</div>
            <ColumnChart ariaLabel="Monthly cost by childcare arrangement" items={r.scenarioComparison.map((s) => ({ label: s.name, value: s.monthlyTotal, highlight: s.id === state.selectedScenarioId }))} />
            <DefinitionList dense rows={r.scenarioComparison.map((s) => ({ label: s.name, value: `${sgd(s.monthlyTotal)} / month · ${sgd(s.annualTotal)} / year`, emphasis: s.id === state.selectedScenarioId }))} />
          </div>
        )}
      </InputGroup>

      <InputGroup title="Preparation checklist" description="Organised by pregnancy, birth and the first year. Saved in this browser.">
        <Checklist listId="calc-baby-checklist" items={PREP_CHECKLIST} />
      </InputGroup>
    </CalculatorShell>
  );
}
