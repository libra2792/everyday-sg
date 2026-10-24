import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, PRIORITY_OPTIONS } from '@/state/AppState';
import { GUIDES } from '@/data/guides';
import { recommend } from '@/lib/recommend';
import { daysUntil, describeDue, isValidISODate } from '@/lib/dates';
import { formatDate } from '@/lib/format';
import { clearAll, downloadJSON, exportAll, importAll, storageFootprintBytes } from '@/lib/storage';
import { Button, LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Panel } from '@/components/ui/Panel';
import { EmptyState, Note, PageHeader, ProgressBar } from '@/components/ui/Misc';
import { TextField } from '@/components/ui/Field';
import { ThemeOptions } from '@/components/ThemePicker';

const LABELS: Record<string, string> = {
  '18-24': '18–24',
  '25-34': '25–34',
  '35-44': '35–44',
  '45-54': '45–54',
  '55-64': '55–64',
  '65+': '65+',
  citizen: 'Singapore Citizen',
  pr: 'Permanent Resident',
  other: 'Other resident',
  single: 'Single',
  partnered: 'Partnered',
  married: 'Married',
  parent: 'Parent',
  'supporting-parents': 'Supporting parents',
  'with-family': 'Living with family',
  renting: 'Renting',
  'hdb-owner': 'HDB owner',
  'private-owner': 'Private-property owner',
  'planning-to-buy': 'Planning to buy',
  employed: 'Employed',
  'self-employed': 'Self-employed',
  studying: 'Studying',
  'between-jobs': 'Between jobs',
  retired: 'Retired',
  'next-3-months': 'Next 3 months',
  'this-year': 'This year',
  '2-5-years': '2–5 years',
  'long-term': 'Long term',
};

function TasksSection() {
  const { tasks, addTask, updateTask, removeTask } = useAppState();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const da = a.dueDate ? daysUntil(a.dueDate) ?? 9999 : 9999;
      const db = b.dueDate ? daysUntil(b.dueDate) ?? 9999 : 9999;
      return da - db;
    });
  }, [tasks]);

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    addTask({ title: t, dueDate: isValidISODate(due) ? due : undefined, source: 'manual' });
    setTitle('');
    setDue('');
  };

  return (
    <Panel title="Dates and tasks" description="Anything with a date in the next 60 days appears on the home page." icon="calendar-days" id="tasks">
      <form
        className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextField label="New task" value={title} onChange={setTitle} placeholder="e.g. Renew passport, review insurance" maxLength={120} />
        <TextField label="Due date (optional)" type="date" value={due} onChange={setDue} />
        <Button type="submit" variant="primary" icon="plus" className="sm:mb-0">
          Add
        </Button>
      </form>
      {sorted.length === 0 ? (
        <p className="text-[13.5px] text-ink-faint">No tasks yet. Add your own, or use “Add to My Plan” on any guide, the tax tool or the annual checklist.</p>
      ) : (
        <ul className="divide-y divide-stone-200">
          {sorted.map((t) => {
            const d = t.dueDate ? daysUntil(t.dueDate) : null;
            return (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <input type="checkbox" className="h-[18px] w-[18px] accent-sage-600" checked={t.done} onChange={(e) => updateTask(t.id, { done: e.target.checked })} aria-label={`Mark “${t.title}” ${t.done ? 'not done' : 'done'}`} />
                <div className="min-w-0 flex-1">
                  {t.path ? (
                    <Link to={t.path} className={`block truncate text-[14.5px] ${t.done ? 'text-ink-faint line-through' : 'text-ink hover:text-sage-900'}`}>
                      {t.title}
                    </Link>
                  ) : (
                    <span className={`block truncate text-[14.5px] ${t.done ? 'text-ink-faint line-through' : 'text-ink'}`}>{t.title}</span>
                  )}
                  {t.dueDate && <span className={`text-[12.5px] ${d !== null && d < 0 && !t.done ? 'text-clay-700' : 'text-ink-faint'}`}>{formatDate(t.dueDate)} · {describeDue(t.dueDate)}</span>}
                </div>
                <Button size="sm" variant="ghost" icon="trash-2" aria-label={`Remove ${t.title}`} onClick={() => removeTask(t.id)}>
                  <span className="sr-only">Remove</span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function DataSection() {
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const footprint = storageFootprintBytes();

  const doExport = () => {
    downloadJSON(`everyday-sg-plan-${new Date().toISOString().slice(0, 10)}.json`, exportAll());
    setMessage('Exported. The file contains only what Everyday SG saved in this browser.');
  };
  const doImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = importAll(parsed);
      if (!result.ok) {
        setMessage(result.error ?? 'Import failed.');
        return;
      }
      setMessage(`Imported ${result.imported} items. Reloading…`);
      setTimeout(() => window.location.reload(), 600);
    } catch {
      setMessage('That file could not be read as JSON.');
    }
  };
  const doReset = () => {
    if (!window.confirm('Erase everything Everyday SG has saved in this browser? This cannot be undone unless you exported a copy.')) return;
    const n = clearAll();
    setMessage(`Removed ${n} saved items. Reloading…`);
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <Panel title="Your data" description="Everything lives in this browser's local storage. Export a copy to move between devices, or erase it entirely." icon="lock-keyhole" id="data" muted>
      <div className="flex flex-wrap gap-2">
        <Button icon="download" onClick={doExport}>
          Export as JSON
        </Button>
        <Button icon="upload" onClick={() => fileRef.current?.click()}>
          Import JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose an Everyday SG export file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void doImport(f);
            e.target.value = '';
          }}
        />
        <Button icon="printer" onClick={() => window.print()}>
          Print summary
        </Button>
        <Button variant="danger" icon="trash-2" onClick={doReset}>
          Reset all saved data
        </Button>
      </div>
      {message && (
        <p className="mt-3 text-[13.5px] text-ink-muted" role="status">
          {message}
        </p>
      )}
      <p className="mt-4 text-[12.5px] leading-5 text-ink-faint">
        Saved information resides only in this browser and may be lost if browser data is cleared or if you use private browsing. About {Math.max(1, Math.round(footprint / 1024))} KB is stored right now. No personal inputs are transmitted to any server, and there is no third-party tracking or analytics.
      </p>
    </Panel>
  );
}

export function MyPlan() {
  const { profile, progress, saved } = useAppState();
  const recs = useMemo(() => recommend(profile, progress, 8), [profile, progress]);
  const checklistSummary = useMemo(
    () =>
      GUIDES.map((g) => {
        const list = progress[g.id] || {};
        const done = g.checklist.filter((c) => list[c.id]).length;
        return { guide: g, done, total: g.checklist.length };
      }).filter((x) => x.done > 0),
    [progress],
  );

  return (
    <div>
      <PageHeader title="My Plan" description="Your profile, next steps, dates and checklist progress — and full control over the data behind them." actions={<LinkButton to="/plan/profile" size="sm" icon="pencil">{profile ? 'Edit profile' : 'Set up profile'}</LinkButton>} />

      <div className="print-only mb-6">
        <h2 className="text-lg font-semibold">Everyday SG — plan summary ({formatDate(new Date().toISOString())})</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Panel title="Profile" icon="user" id="profile" actions={profile ? <span className="text-[12.5px] text-ink-faint">Updated {formatDate(profile.updatedAt)}</span> : null}>
            {!profile ? (
              <EmptyState icon="user" title="No profile yet" description="Answer a few optional questions and the home page will suggest what to look at first." action={<LinkButton to="/plan/profile" variant="primary" icon="arrow-right">Personalise (2 minutes)</LinkButton>} />
            ) : (
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {[
                  ['Age range', LABELS[profile.ageRange]],
                  ['Residency', LABELS[profile.residency]],
                  ['Household', profile.household.map((h) => LABELS[h]).join(', ')],
                  ['Housing', LABELS[profile.housing]],
                  ['Employment', LABELS[profile.employment]],
                  ['Horizon', LABELS[profile.horizon]],
                  ['Priorities', profile.priorities.map((p) => PRIORITY_OPTIONS.find((o) => o.id === p)?.label).filter(Boolean).join(', ')],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[12.5px] text-ink-faint">{k}</dt>
                    <dd className="text-[14.5px] text-ink">{v || <span className="text-ink-faint">Not set</span>}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Panel>

          <Panel title="Suggested next steps" icon="compass" id="next-steps" description={profile ? 'Ranked from your profile; completed guides drop off the list.' : 'General suggestions until you set up a profile.'}>
            <ul className="divide-y divide-stone-200">
              {recs.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link to={r.path} className="group flex items-center gap-3 py-3">
                    <Icon name={r.type === 'guide' ? 'book-open' : r.type === 'tool' ? 'list-checks' : 'calculator'} size={16} className="shrink-0 text-sage-700" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-medium text-ink group-hover:text-sage-900">{r.title}</span>
                      <span className="block text-[12.5px] text-ink-faint">{r.reason}</span>
                    </span>
                    <Icon name="chevron-right" size={15} className="text-stone-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <TasksSection />

          <Panel title="Checklist progress" icon="list-checks" id="progress" description="Guides you have started. Progress is kept per guide.">
            {checklistSummary.length === 0 ? (
              <p className="text-[13.5px] text-ink-faint">You have not ticked anything yet. Open a guide and start with its essential items.</p>
            ) : (
              <ul className="space-y-4">
                {checklistSummary.map((x) => (
                  <li key={x.guide.id}>
                    <Link to={`/guides/${x.guide.id}`} className="text-[14.5px] font-medium text-ink hover:text-sage-900">
                      {x.guide.title}
                    </Link>
                    <ProgressBar done={x.done} total={x.total} label={x.done === x.total ? 'Completed' : 'In progress'} className="mt-1.5" />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Saved items" icon="bookmark" id="saved-summary" actions={<Link to="/saved" className="text-[13px] text-sage-800 hover:underline">Open</Link>}>
            {saved.length === 0 ? (
              <p className="text-[13.5px] text-ink-faint">Save guides, calculators and results snapshots to find them again quickly.</p>
            ) : (
              <ul className="space-y-2 text-[14px]">
                {saved.slice(0, 6).map((s) => (
                  <li key={s.id} className="truncate">
                    <Link to={s.path} className="text-ink hover:text-sage-900">
                      {s.title}
                    </Link>
                  </li>
                ))}
                {saved.length > 6 && <li className="text-[12.5px] text-ink-faint">and {saved.length - 6} more</li>}
              </ul>
            )}
          </Panel>
          <Panel title="Appearance" icon="sliders-horizontal" id="appearance" description="Four looks for the same app. Your choice is saved in this browser.">
            <ThemeOptions />
          </Panel>
          <DataSection />
          <Note>Everyday SG is independent and not affiliated with any government agency. It cannot submit applications for you; the guides link to the agencies that can.</Note>
        </div>
      </div>
    </div>
  );
}
