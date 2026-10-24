import { useMemo, useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { sgd } from '@/lib/format';
import { isValidISODate } from '@/lib/dates';
import { useAppState } from '@/state/AppState';
import { TAX_ALL_ITEMS, TAX_FILING_TASKS, TAX_INCOME_DOCUMENTS, TAX_RELIEF_CATEGORIES } from '@/data/checklists';
import { SOURCE_MAP } from '@/data/sources';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { Checklist } from '@/components/Checklist';
import { NumberField, SelectField, TextField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { ExternalLink, Note } from '@/components/ui/Misc';

interface TaxState {
  incomeYear: number;
  filingDeadline: string;
  incomes: Record<string, number>;
  reliefs: Record<string, number>;
  notes: string;
}

const INCOME_LINES = [
  { id: 'employment', label: 'Employment income (salary, bonus, allowances, benefits-in-kind)' },
  { id: 'trade', label: 'Trade, business or freelance net income' },
  { id: 'rental', label: 'Net rental income' },
  { id: 'other', label: 'Other taxable income' },
];

function defaultState(): TaxState {
  const now = new Date();
  // Filing in Mar–Apr covers the previous calendar year; before March, most people are still preparing last year's figures.
  const incomeYear = now.getFullYear() - 1;
  return { incomeYear, filingDeadline: '', incomes: {}, reliefs: {}, notes: '' };
}

export default function TaxPrepTool() {
  const [state, setState, reset] = usePersistentState<TaxState>('tool:tax-prep', defaultState);
  const { addTask, tasks, resetList, listCompletion } = useAppState();
  const [added, setAdded] = useState(false);
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y].map((v) => ({ value: String(v), label: `Income earned in ${v} (Year of Assessment ${v + 1})` }));
  }, []);
  const ya = state.incomeYear + 1;
  const listId = `tool-tax-prep-${ya}`;
  const completion = listCompletion(listId, TAX_ALL_ITEMS.map((i) => i.id));
  const totalIncome = Object.values(state.incomes).reduce((s, v) => s + Math.max(0, v || 0), 0);
  const totalReliefs = Object.values(state.reliefs).reduce((s, v) => s + Math.max(0, v || 0), 0);
  const estimatedChargeable = Math.max(0, totalIncome - totalReliefs);
  const existingTask = tasks.find((t) => t.source === 'tax' && t.title.includes(`YA ${ya}`) && !t.done);

  const addDeadline = () => {
    if (!isValidISODate(state.filingDeadline)) return;
    addTask({ title: `File income tax for YA ${ya}`, dueDate: state.filingDeadline, path: '/tools/tax-prep', source: 'tax' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleReset = () => {
    resetList(listId);
    reset();
  };

  return (
    <CalculatorShell
      id="tax-prep"
      onReset={handleReset}
      sourceIds={['iras-filing', 'iras-file', 'iras-reliefs', 'iras-rates', 'iras-mytax']}
      relatedGuides={['tax-filing-prep', 'freelance-variable-income', 'cpf-basics']}
      intro="Organise the documents, review the relief categories that may apply, and track what is done for the Year of Assessment you are preparing. IRAS determines the actual assessment; this tool keeps you organised and links you to the right place."
      caveat={
        <>
          Everyday SG does not estimate tax payable, and it does not store tax rates, relief amounts or deadlines, because IRAS changes them. The organiser below only adds up figures you enter. Use{' '}
          <ExternalLink href={SOURCE_MAP['iras-rates'].url}>IRAS's tax rates page</ExternalLink> and the calculators in myTax Portal for the actual numbers.
        </>
      }
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Relief categories listed are the common ones IRAS publishes; eligibility, caps and whether a category applies to you are decided by IRAS rules for that Year of Assessment.</li>
          <li>The organiser's arithmetic is simply income entered minus reliefs entered; it does not apply caps, rebates or rates.</li>
          <li>The filing deadline is whatever you enter from IRAS; it is not pre-filled.</li>
        </ul>
      }
      results={
        <ResultsPanel title={`Year of Assessment ${ya}`}>
          <StatGrid>
            <Stat label="Items done" value={`${completion.done} of ${completion.total}`} size="lg" className="col-span-2 sm:col-span-3" hint={completion.done === completion.total ? 'Everything ticked for this year' : `${completion.total - completion.done} outstanding`} />
            <Stat label="Income you recorded" value={sgd(totalIncome)} />
            <Stat label="Reliefs you plan to claim" value={sgd(totalReliefs)} />
            <Stat label="Income minus reliefs (your own arithmetic)" value={sgd(estimatedChargeable)} className="col-span-2 sm:col-span-3" hint="Not a tax computation. IRAS applies eligibility, caps and rates." />
          </StatGrid>
          <DefinitionList
            dense
            rows={[
              { label: 'Filing deadline you entered', value: state.filingDeadline ? state.filingDeadline : 'Not set' },
              { label: 'Reminder in My Plan', value: existingTask ? 'Added' : 'Not added' },
            ]}
          />
          <div className="no-print flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={added ? 'check' : 'calendar-check'} onClick={addDeadline} disabled={!isValidISODate(state.filingDeadline)}>
              {added ? 'Added to My Plan' : 'Add deadline to My Plan'}
            </Button>
          </div>
          {!state.filingDeadline && <Note>Enter the filing deadline from IRAS to add a reminder that shows in “Due soon” on the home page.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Which year are you preparing?">
        <SelectField label="Income year and Year of Assessment" value={String(state.incomeYear)} onChange={(v) => setState((s) => ({ ...s, incomeYear: Number(v) }))} options={yearOptions} help="Singapore assesses income earned in the previous calendar year. Progress below is tracked separately for each Year of Assessment." />
        <TextField label="Filing deadline (from IRAS)" type="date" value={state.filingDeadline} onChange={(v) => setState((s) => ({ ...s, filingDeadline: v }))} help="IRAS publishes the e-filing deadline each year. Enter it here; it is not pre-filled." />
      </InputGroup>

      <InputGroup title="Income documents to collect">
        <Checklist listId={listId} items={TAX_INCOME_DOCUMENTS} showEssentialBadges />
      </InputGroup>

      <InputGroup title="Relief categories to review" description="Tick the ones you have checked against IRAS's eligibility rules for this year. Amounts and caps are on IRAS's site.">
        <Checklist listId={listId} items={TAX_RELIEF_CATEGORIES} showEssentialBadges={false} />
      </InputGroup>

      <InputGroup title="Filing tasks">
        <Checklist listId={listId} items={TAX_FILING_TASKS} />
      </InputGroup>

      <InputGroup title="Income and relief organiser (optional)" description="For your own records. Adds up what you enter; it does not compute tax.">
        <div className="grid gap-3 sm:grid-cols-2">
          {INCOME_LINES.map((line) => (
            <NumberField key={line.id} label={line.label} prefix="S$" step={100} value={state.incomes[line.id] ?? 0} onChange={(v) => setState((s) => ({ ...s, incomes: { ...s.incomes, [line.id]: v } }))} />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TAX_RELIEF_CATEGORIES.map((rel) => (
            <NumberField key={rel.id} label={rel.text.replace(/\s*\(.*\)\s*/g, '')} prefix="S$" step={100} value={state.reliefs[rel.id] ?? 0} onChange={(v) => setState((s) => ({ ...s, reliefs: { ...s.reliefs, [rel.id]: v } }))} />
          ))}
        </div>
        <TextField label="Notes for next year" value={state.notes} onChange={(v) => setState((s) => ({ ...s, notes: v }))} placeholder="e.g. Keep course fee receipts in the tax folder; decide on SRS by November." maxLength={500} />
      </InputGroup>
    </CalculatorShell>
  );
}
