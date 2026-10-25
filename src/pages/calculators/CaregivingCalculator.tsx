import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { caregivingPlan, type CaregivingInputs, type Contributor } from '@/lib/finance';
import { sgd } from '@/lib/format';
import { uid } from '@/lib/storage';
import { BENCHMARKS } from '@/data/benchmarks';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { NumberField, SliderField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { BarList, ColumnChart } from '@/components/charts/Charts';
import { Checklist } from '@/components/Checklist';
import { ExternalLink, Note } from '@/components/ui/Misc';
import { SOURCE_MAP } from '@/data/sources';
import type { ChecklistItem } from '@/data/types';

const DEFAULTS: CaregivingInputs = {
  homeCare: 0,
  helper: 0,
  transport: 0,
  medical: 0,
  other: 0,
  monthlyBudget: 0,
  monthlySupport: 0,
  contributors: [
    { id: 'me', name: 'Me', sharePct: 50 },
    { id: 'sibling', name: 'Sibling', sharePct: 50 },
  ],
  durationYears: 5,
  inflationPct: 3,
};

const RESOURCES: ChecklistItem[] = [
  { id: 'aic', text: 'Contact AIC (or the Silver Generation Office) for a care needs assessment and service options', essential: true, group: 'Care and assessment' },
  { id: 'msw', text: 'Ask the hospital medical social worker about support before discharge', essential: false, group: 'Care and assessment' },
  { id: 'hcg', text: 'Check Home Caregiving Grant eligibility on AIC', essential: true, group: 'Financial support' },
  { id: 'ltc', text: 'Read MOH long-term care and aged care subsidy pages (means-tested)', essential: true, group: 'Financial support' },
  { id: 'careshield', text: 'Confirm CareShield Life or ElderShield status and claim conditions', essential: true, group: 'Financial support' },
  { id: 'medisave', text: 'Check MediSave and MediShield Life use for the parent\'s medical bills', essential: false, group: 'Financial support' },
  { id: 'levy', text: 'If employing a helper, check MOM levy concession eligibility for households with elderly members', essential: false, group: 'Financial support' },
  { id: 'respite', text: 'Identify respite care options through AIC', essential: false, group: 'Caregiver wellbeing' },
  { id: 'training', text: 'Book caregiver training if specialised care is needed', essential: false, group: 'Caregiver wellbeing' },
  { id: 'lpa', text: 'Discuss Lasting Power of Attorney and Advance Care Planning with your parent', essential: true, group: 'Planning ahead' },
];

export default function CaregivingCalculator() {
  const [state, setState, reset] = usePersistentState<CaregivingInputs>('calc:caregiving', DEFAULTS);
  const r = useMemo(() => caregivingPlan(state), [state]);
  const set = <K extends keyof CaregivingInputs>(key: K) => (v: CaregivingInputs[K]) => setState((s) => ({ ...s, [key]: v }));
  const updateContributor = (id: string, patch: Partial<Contributor>) => setState((s) => ({ ...s, contributors: s.contributors.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addContributor = () => setState((s) => ({ ...s, contributors: [...s.contributors, { id: uid(), name: `Family member ${s.contributors.length + 1}`, sharePct: 0 }] }));
  const removeContributor = (id: string) => setState((s) => ({ ...s, contributors: s.contributors.filter((c) => c.id !== id) }));
  const aicFinancial = SOURCE_MAP['aic-financial'];

  return (
    <CalculatorShell
      id="caregiving"
      onReset={reset}
      sourceIds={['aic', 'aic-financial', 'aic-hcg', 'moh-ltc', 'moh-aged-care', 'cpf-careshield', 'mom-mdw']}
      relatedGuides={['caregiving-plan', 'eldercare-costs-and-support', 'hiring-a-helper']}
      headline={[
        { label: 'Monthly care cost', value: sgd(r.monthlyTotal) },
        { label: 'Monthly shortfall', value: sgd(r.monthlyShortfall) },
      ]}
      snapshot={[
        { label: 'Monthly care cost', value: sgd(r.monthlyTotal) },
        { label: 'After support', value: sgd(r.monthlyAfterSupport) },
        { label: 'Monthly shortfall', value: sgd(r.monthlyShortfall) },
        { label: `${state.durationYears}-year total (with inflation)`, value: sgd(r.durationTotalWithInflation) },
      ]}
      caveat={
        <>
          Subsidy eligibility is assessed by the agencies, not here. Enter your own estimate of support and confirm it on <ExternalLink href={aicFinancial.url}>AIC's financial assistance pages</ExternalLink> and MOH's subsidy pages.
        </>
      }
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Monthly costs are what you expect to pay before any support; support is your estimate and is subtracted first.</li>
          <li>Family contributions are percentages of the after-support cost; shares need not total 100%, and any uncovered amount shows as a shortfall.</li>
          <li>The duration scenario inflates the annual cost each year at the assumed rate and assumes care needs stay constant.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Monthly total = home care + helper + transport + medical + other. After support = max(0, total − support).</li>
          <li>Each contributor pays after-support × share %. Shortfall = after-support − sum of contributions.</li>
          <li>Duration total with inflation = Σ (after-support × 12 × (1 + inflation)^(year − 1)) over the planned years.</li>
        </ul>
      }
      results={
        <ResultsPanel>
          <StatGrid>
            <Stat label="Monthly care cost" value={sgd(r.monthlyTotal)} size="lg" className="col-span-2 sm:col-span-3" hint={`${sgd(r.annualTotal)} per year before support`} />
            <Stat label="After expected support" value={sgd(r.monthlyAfterSupport)} hint={`${sgd(state.monthlySupport)} support assumed`} />
            <Stat label="Versus your budget" value={state.monthlyBudget > 0 ? `${r.budgetGap > 0 ? '+' : ''}${sgd(r.budgetGap)}` : '—'} tone={state.monthlyBudget > 0 && r.budgetGap > 0 ? 'caution' : 'neutral'} hint={state.monthlyBudget > 0 ? (r.budgetGap > 0 ? 'over budget' : 'within budget') : 'Set a monthly budget'} />
            <Stat label="Monthly shortfall" value={sgd(r.monthlyShortfall)} tone={r.monthlyShortfall > 0 ? 'caution' : 'positive'} hint={r.monthlyShortfall > 0 ? 'not covered by contributions' : 'fully covered'} />
            <Stat label={`${state.durationYears}-year total`} value={sgd(r.durationTotalWithInflation)} hint={`${sgd(r.durationTotalNoInflation)} without inflation`} className="col-span-2 sm:col-span-3" />
          </StatGrid>
          {r.contributions.length > 0 && r.monthlyAfterSupport > 0 && (
            <BarList ariaLabel="Monthly contribution by family member" items={[...r.contributions.map((c) => ({ label: `${c.name} (${c.sharePct}%)`, value: c.monthly })), ...(r.monthlyShortfall > 0 ? [{ label: 'Uncovered', value: r.monthlyShortfall, colour: 'var(--chart-4)' }] : [])]} />
          )}
          {r.monthlyTotal === 0 && <Note>Enter the monthly care costs you expect. Rough figures from quotes or current spending are fine to start.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Monthly care costs" description="Before any subsidies or support.">
        <SliderField label="Home care services" benchmark={BENCHMARKS.homeCareCost} prefix="S$" min={0} max={8000} step={50} value={state.homeCare} onChange={set('homeCare')} help="Home nursing, personal care, therapy, day care fees." />
        <SliderField label="Helper (salary, levy, insurance, food)" benchmark={BENCHMARKS.helperCost} prefix="S$" min={0} max={4000} step={50} value={state.helper} onChange={set('helper')} />
        <SliderField label="Transport" prefix="S$" min={0} max={2000} step={10} value={state.transport} onChange={set('transport')} help="Medical transport, taxis to appointments." />
        <SliderField label="Medical and medication" prefix="S$" min={0} max={5000} step={50} value={state.medical} onChange={set('medical')} help="Consultations, medication, consumables, after MediSave and insurance." />
        <SliderField label="Other (equipment, home modifications, supplies)" prefix="S$" min={0} max={3000} step={25} value={state.other} onChange={set('other')} />
      </InputGroup>

      <InputGroup title="Budget and support">
        <SliderField label="Expected monthly care budget" prefix="S$" min={0} max={10000} step={100} value={state.monthlyBudget} onChange={set('monthlyBudget')} help="What the family intends to spend each month." />
        <SliderField label="Estimated support or subsidies (your estimate)" benchmark={BENCHMARKS.careSupport} prefix="S$" min={0} max={5000} step={25} value={state.monthlySupport} onChange={set('monthlySupport')} help="Home Caregiving Grant, long-term care subsidies, CareShield Life payouts or other support you expect, once confirmed." />
      </InputGroup>

      <InputGroup title="Family cost-sharing" description="Set each contributor's share of the after-support cost.">
        <div className="space-y-3">
          {state.contributors.map((c) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] items-end gap-2 rounded-md border border-stone-200 bg-stone-100 p-3">
              <div>
                <label htmlFor={`con-name-${c.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Name
                </label>
                <input id={`con-name-${c.id}`} className="field-input !py-1.5 text-sm" value={c.name} onChange={(e) => updateContributor(c.id, { name: e.target.value })} maxLength={30} />
              </div>
              <div>
                <label htmlFor={`con-share-${c.id}`} className="mb-1 block text-[12px] text-ink-faint">
                  Share
                </label>
                <NumberField id={`con-share-${c.id}`} compact label={`${c.name} share`} suffix="%" value={c.sharePct} onChange={(v) => updateContributor(c.id, { sharePct: v })} min={0} max={100} step={5} />
              </div>
              <Button size="sm" variant="ghost" icon="trash-2" aria-label={`Remove ${c.name}`} onClick={() => removeContributor(c.id)} className="mb-0.5">
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" icon="plus" onClick={addContributor}>
            Add family member
          </Button>
          <span className={`text-[13px] ${r.sharesTotalPct > 100 ? 'text-clay-700' : 'text-ink-faint'}`}>Shares total {r.sharesTotalPct}%</span>
        </div>
        <DefinitionList dense rows={r.contributions.map((c) => ({ label: c.name, value: `${sgd(c.monthly)} / month · ${sgd(c.annual)} / year` }))} />
      </InputGroup>

      <InputGroup title="Duration and inflation scenario">
        <SliderField label="Duration of care being planned for" benchmark={BENCHMARKS.careDuration} suffix="years" min={1} max={20} step={1} value={state.durationYears} onChange={set('durationYears')} allowAboveMax={false} />
        <SliderField label="Assumed annual cost inflation" benchmark={BENCHMARKS.careInflation} suffix="% p.a." min={0} max={8} step={0.5} value={state.inflationPct} onChange={set('inflationPct')} format={(n) => `${n.toFixed(1)}% p.a.`} help="Care and helper costs have tended to rise faster than general inflation." />
        {r.yearByYear.length > 0 && r.monthlyAfterSupport > 0 && <ColumnChart ariaLabel="Annual caregiving cost by year with inflation" items={r.yearByYear.slice(0, 12).map((y) => ({ label: `Yr ${y.year}`, value: y.annual }))} />}
      </InputGroup>

      <InputGroup title="Support and resources checklist" description="Links to each resource are in the sources section below and in the related guides.">
        <Checklist listId="calc-caregiving-resources" items={RESOURCES} />
      </InputGroup>
    </CalculatorShell>
  );
}
