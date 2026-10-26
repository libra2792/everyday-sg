import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { usePrefill } from '@/lib/usePrefill';
import { insuranceNeed, type InsuranceInputs } from '@/lib/finance';
import { sgd } from '@/lib/format';
import { BENCHMARKS } from '@/data/benchmarks';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { SliderField } from '@/components/ui/Field';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { Checklist } from '@/components/Checklist';
import { Note } from '@/components/ui/Misc';
import { BarList } from '@/components/charts/Charts';
import type { ChecklistItem } from '@/data/types';

const DEFAULTS: InsuranceInputs = {
  dependants: 0,
  yearsOfIncomeReplacement: 10,
  annualHouseholdExpenses: 0,
  outstandingDebts: 0,
  futureCommitments: 0,
  existingLifeCoverage: 0,
  liquidAssetsToCount: 0,
};

const INVENTORY: ChecklistItem[] = [
  { id: 'medishield', text: 'MediShield Life status confirmed (and any Integrated Shield Plan and rider recorded)', essential: true, group: 'Health' },
  { id: 'employer-medical', text: 'Employer medical and group insurance benefits recorded, with end-of-employment terms', essential: false, group: 'Health' },
  { id: 'careshield', text: 'CareShield Life or ElderShield status and any supplements recorded', essential: false, group: 'Health' },
  { id: 'term', text: 'Term or whole-life policies: insurer, sum assured, term end, premium, nominee', essential: true, group: 'Life and income' },
  { id: 'ci', text: 'Critical illness cover: definitions, sum, early-stage coverage, premium', essential: false, group: 'Life and income' },
  { id: 'disability', text: 'Disability income or total permanent disability cover recorded', essential: false, group: 'Life and income' },
  { id: 'pa', text: 'Personal accident cover recorded', essential: false, group: 'Life and income' },
  { id: 'home', text: 'Home contents and fire insurance (mortgage fire insurance if applicable)', essential: false, group: 'Property' },
  { id: 'car', text: 'Motor insurance renewal date and no-claim discount', essential: false, group: 'Property' },
  { id: 'nominations', text: 'Nominations checked on every policy after family changes', essential: true, group: 'Admin' },
  { id: 'payments', text: 'Premium payment method and dates confirmed; no lapsed policies', essential: true, group: 'Admin' },
  { id: 'location', text: 'Policy documents and claim hotlines stored where family can find them', essential: false, group: 'Admin' },
];

const QUESTIONS = [
  'What exactly does this policy pay for, and what are the exclusions and waiting periods?',
  'How much is the deductible or co-insurance, and are there annual or lifetime limits?',
  'How will premiums change as I age, and is the policy guaranteed renewable?',
  'If I stop paying, what happens — does cover lapse, reduce, or convert?',
  'Does this overlap with cover I already have through my employer or another policy?',
  'How are claims made, and what documents are needed? What is the insurer\'s typical turnaround?',
  'Is the nominee current, and is it a trust or revocable nomination?',
  'If this is a bundled savings policy, what is the protection component worth on its own, and what are the charges?',
];

export default function InsuranceCalculator() {
  const [state, setState, reset] = usePersistentState<InsuranceInputs>('calc:insurance', DEFAULTS);
  const prefilled = usePrefill(setState, { dependants: 'dependants', years: 'yearsOfIncomeReplacement', expenses: 'annualHouseholdExpenses', debts: 'outstandingDebts', commitments: 'futureCommitments', existing: 'existingLifeCoverage', assets: 'liquidAssetsToCount' });
  const r = useMemo(() => insuranceNeed(state), [state]);
  const set = <K extends keyof InsuranceInputs>(key: K) => (v: InsuranceInputs[K]) => setState((s) => ({ ...s, [key]: v }));

  return (
    <CalculatorShell
      id="insurance"
      prefilled={prefilled}
      onReset={reset}
      sourceIds={['moneysense', 'cpf-medishield', 'cpf-careshield', 'singstat-hes-2023']}
      relatedGuides={['insurance-basics', 'review-coverage-and-claims', 'health-insurance-sg']}
      headline={[
        { label: 'Illustrative need', value: sgd(r.totalNeed) },
        { label: r.gap > 0 ? 'Gap' : 'Surplus', value: sgd(Math.abs(r.gap)) },
      ]}
      snapshot={[
        { label: 'Illustrative need', value: sgd(r.totalNeed) },
        { label: 'Existing cover + assets', value: sgd(r.resources) },
        { label: r.gap > 0 ? 'Gap' : 'Surplus', value: sgd(Math.abs(r.gap)) },
      ]}
      caveat="This organiser is educational. It does not recommend products, insurers or purchases, and it only looks at one risk: your household losing your income. Disability, critical illness, health and life coverage protect against different events and cannot be treated as interchangeable."
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>The income-replacement figure is years × annual household living expenses, without inflation, investment returns or changes in spending over time.</li>
          <li>Debts and future commitments are added in full; you may prefer to count only the part not covered by other arrangements.</li>
          <li>Existing life coverage and liquid assets are counted at face value; the real value of some policies may differ.</li>
          <li>The number of dependants is recorded for your own reference and does not change the arithmetic.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Income replacement = years of replacement × annual household expenses.</li>
          <li>Total need = income replacement + outstanding debts + future commitments.</li>
          <li>Resources = existing life coverage + liquid assets you choose to count. Gap = total need − resources.</li>
        </ul>
      }
      results={
        <ResultsPanel>
          <StatGrid>
            <Stat label="Illustrative income-protection need" value={sgd(r.totalNeed)} size="lg" className="col-span-2 sm:col-span-3" hint={`${sgd(r.incomeReplacement)} income replacement + ${sgd(state.outstandingDebts)} debts + ${sgd(state.futureCommitments)} commitments`} />
            <Stat label="Existing cover and assets" value={sgd(r.resources)} />
            <Stat label={r.gap > 0 ? 'Difference (shortfall)' : 'Difference (surplus)'} value={sgd(Math.abs(r.gap))} tone={r.gap > 0 ? 'caution' : 'positive'} />
            <Stat label="Dependants" value={`${state.dependants}`} />
          </StatGrid>
          {r.totalNeed > 0 && (
            <BarList
              ariaLabel="Composition of the illustrative need"
              items={[
                { label: 'Income replacement', value: r.incomeReplacement },
                { label: 'Outstanding debts', value: state.outstandingDebts },
                { label: 'Future commitments', value: state.futureCommitments },
                { label: 'Existing cover + assets', value: r.resources, colour: 'var(--chart-3)' },
              ]}
            />
          )}
          {r.totalNeed === 0 && <Note>Enter annual household expenses and the years of income you would want replaced to see an illustrative figure.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Your household">
        <SliderField label="Number of dependants" min={0} max={8} step={1} value={state.dependants} onChange={set('dependants')} allowAboveMax={false} help="Children, a non-working spouse, parents you support." />
        <SliderField label="Years of income replacement wanted" benchmark={BENCHMARKS.incomeReplacementYears} suffix="years" min={0} max={30} step={1} value={state.yearsOfIncomeReplacement} onChange={set('yearsOfIncomeReplacement')} allowAboveMax={false} help="For example, until the youngest child finishes education or a partner could re-establish income." />
        <SliderField label="Annual household living expenses" benchmark={BENCHMARKS.annualHouseholdExpenses} prefix="S$" min={0} max={300000} step={1000} value={state.annualHouseholdExpenses} onChange={set('annualHouseholdExpenses')} help="What your dependants would need per year, not your current gross income." />
      </InputGroup>

      <InputGroup title="Obligations to cover">
        <SliderField label="Outstanding debts" prefix="S$" min={0} max={2000000} step={5000} value={state.outstandingDebts} onChange={set('outstandingDebts')} help="Mortgage balance, car loan, other loans. If a mortgage is already covered by a mortgage-reducing policy, leave it out." />
        <SliderField label="Known future family commitments" prefix="S$" min={0} max={1000000} step={5000} value={state.futureCommitments} onChange={set('futureCommitments')} help="Children's education, parents' care, a planned wedding or home." />
      </InputGroup>

      <InputGroup title="What you already have">
        <SliderField label="Existing life coverage" prefix="S$" min={0} max={3000000} step={10000} value={state.existingLifeCoverage} onChange={set('existingLifeCoverage')} help="Sum assured on term and whole-life policies, plus group life cover through an employer (note it ends with the job)." />
        <SliderField label="Liquid assets to count" prefix="S$" min={0} max={2000000} step={5000} value={state.liquidAssetsToCount} onChange={set('liquidAssetsToCount')} help="Savings and investments your household could use; many people exclude the emergency fund and retirement savings." />
      </InputGroup>

      <InputGroup title="Policy inventory" description="Tick off what you have recorded. This checklist is saved in your browser.">
        <Checklist listId="calc-insurance-inventory" items={INVENTORY} />
      </InputGroup>

      <InputGroup title="Questions to ask when reviewing coverage">
        <DefinitionList rows={QUESTIONS.map((q, i) => ({ label: `${i + 1}. ${q}`, value: '' }))} dense />
      </InputGroup>
    </CalculatorShell>
  );
}
