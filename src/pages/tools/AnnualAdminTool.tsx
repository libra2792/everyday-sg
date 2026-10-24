import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePersistentState } from '@/lib/usePersistentState';
import { isValidISODate } from '@/lib/dates';
import { formatDate } from '@/lib/format';
import { useAppState } from '@/state/AppState';
import { ANNUAL_ADMIN_ALL_ITEMS, ANNUAL_ADMIN_SECTIONS } from '@/data/checklists';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { Checklist } from '@/components/Checklist';
import { TextField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { Note } from '@/components/ui/Misc';

interface AdminState {
  reviewDate: string;
  lastCompleted: string;
}

const LIST_ID = 'tool-annual-admin';

export default function AnnualAdminTool() {
  const [state, setState, reset] = usePersistentState<AdminState>('tool:annual-admin', { reviewDate: '', lastCompleted: '' });
  const { listCompletion, resetList, addTask, tasks } = useAppState();
  const [added, setAdded] = useState(false);
  const total = ANNUAL_ADMIN_ALL_ITEMS.length;
  const completion = listCompletion(LIST_ID, ANNUAL_ADMIN_ALL_ITEMS.map((i) => i.id));
  const existingTask = tasks.find((t) => t.source === 'annual-admin' && !t.done);

  const addReviewReminder = () => {
    if (!isValidISODate(state.reviewDate)) return;
    addTask({ title: 'Annual life-admin review', dueDate: state.reviewDate, path: '/tools/annual-admin', source: 'annual-admin' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const startNewYear = () => {
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({ ...s, lastCompleted: today }));
    resetList(LIST_ID);
  };

  return (
    <CalculatorShell
      id="annual-admin"
      onReset={() => {
        resetList(LIST_ID);
        reset();
      }}
      sourceIds={['moneysense', 'cpf', 'iras', 'healthhub', 'scamshield', 'ica-passport']}
      relatedGuides={['annual-life-admin', 'review-coverage-and-claims', 'document-renewals', 'subscriptions-and-bills']}
      intro="A reusable yearly review across eight areas. Tick items as you go — progress is saved in this browser — then reset it for next year."
      results={
        <ResultsPanel title="This year's review">
          <StatGrid>
            <Stat label="Completed" value={`${completion.done} of ${total}`} size="lg" className="col-span-2 sm:col-span-3" hint={completion.done === total ? 'All done for this year' : `${total - completion.done} to go`} />
          </StatGrid>
          <DefinitionList
            dense
            rows={ANNUAL_ADMIN_SECTIONS.map((s) => {
              const c = listCompletion(LIST_ID, s.items.map((i) => `${s.id}.${i.id}`));
              return { label: s.title, value: `${c.done}/${c.total}`, tone: c.done === c.total ? 'positive' : 'neutral' };
            })}
          />
          <DefinitionList
            dense
            rows={[
              { label: 'Next review date', value: state.reviewDate ? formatDate(state.reviewDate) : 'Not set' },
              { label: 'Last completed', value: state.lastCompleted ? formatDate(state.lastCompleted) : 'Never' },
              { label: 'Reminder in My Plan', value: existingTask ? 'Added' : 'Not added' },
            ]}
          />
          <div className="no-print flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={added ? 'check' : 'calendar-check'} onClick={addReviewReminder} disabled={!isValidISODate(state.reviewDate)}>
              {added ? 'Added to My Plan' : 'Add review date to My Plan'}
            </Button>
            <Button size="sm" variant="ghost" icon="rotate-ccw" onClick={startNewYear} disabled={completion.done === 0}>
              Mark year complete and reset
            </Button>
          </div>
          {!state.reviewDate && <Note>Set a review date below so next year's review has a trigger.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Schedule">
        <TextField label="Next annual review date" type="date" value={state.reviewDate} onChange={(v) => setState((s) => ({ ...s, reviewDate: v }))} help="Many people pick the start of the year, their birthday, or just after tax season." />
      </InputGroup>

      {ANNUAL_ADMIN_SECTIONS.map((section) => (
        <InputGroup key={section.id} title={section.title} description={section.description}>
          <Checklist listId={LIST_ID} items={section.items.map((i) => ({ ...i, id: `${section.id}.${i.id}` }))} compact />
          {section.relatedPath && (
            <Link to={section.relatedPath} className="link inline-flex text-[13.5px]">
              Open {section.relatedLabel}
            </Link>
          )}
        </InputGroup>
      ))}
    </CalculatorShell>
  );
}
