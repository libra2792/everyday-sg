import { useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORY_MAP } from '@/data/categories';
import { GUIDE_MAP } from '@/data/guides';
import { GUIDE_EXTRAS } from '@/data/quick';
import { getSources } from '@/data/sources';
import type { QuickAnswers } from '@/data/types';
import { useAppState } from '@/state/AppState';
import { Checklist } from '@/components/Checklist';
import { categoryTile } from '@/components/GuideCard';
import { Figure } from '@/components/figures/Figures';
import { Illustration } from '@/components/Illustration';
import { GuideLinkCard, ToolTile, TrailBar, type FromRef } from '@/components/LinkTiles';
import { QuickCheck } from '@/components/QuickCheck';
import { SaveButton } from '@/components/SaveButton';
import { SourceNote } from '@/components/SourceNote';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { NotFound } from './NotFound';
import { isValidISODate } from '@/lib/dates';
import { formatDate } from '@/lib/format';
import { answersWithDefaults } from '@/lib/quick';
import { usePersistentState } from '@/lib/usePersistentState';

/* A short bullet list: one line per point, a small dot, no paragraphs. */
function Points({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {items.map((t, i) => {
        const tip = t.startsWith('Tip:');
        return (
          <li key={i} className="flex gap-2.5 text-[14px] leading-6 text-ink">
            {tip ? <Icon name="lightbulb" size={14} className="mt-[5px] shrink-0 text-clay-700" /> : <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500" aria-hidden />}
            <span className={tip ? 'text-ink-muted' : ''}>{tip ? t.replace(/^Tip:\s*/, '') : t}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* A card with an icon header. */
function Card({ icon, title, children, tone = 'surface', iconTile, className = '' }: { icon: IconName; title: string; children: ReactNode; tone?: 'surface' | 'muted'; iconTile?: string; className?: string }) {
  return (
    <div className={`min-w-0 rounded-lg border border-stone-200 ${tone === 'muted' ? 'bg-stone-100' : 'bg-stone-50'} p-4 sm:p-5 ${className}`}>
      <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${iconTile ?? 'bg-stone-100'} text-sage-800`} aria-hidden>
          <Icon name={icon} size={15} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function SectionHead({ id, icon, title, lede, dark }: { id: string; icon: IconName; title: string; lede?: string; dark?: boolean }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-md ${dark ? 'bg-tool text-tool-ink' : 'bg-stone-100 text-sage-800 ring-1 ring-stone-200'}`} aria-hidden>
        <Icon name={icon} size={16} />
      </span>
      <h2 id={`${id}-h`} className="text-[18px] font-semibold text-ink">
        {title}
      </h2>
      {lede && <span className="ml-auto text-[13px] text-ink-faint">{lede}</span>}
    </div>
  );
}

export function GuidePage() {
  const { guideId = '' } = useParams();
  const guide = GUIDE_MAP[guideId];
  const extras = GUIDE_EXTRAS[guideId];
  const { addTask } = useAppState();
  const [dueDate, setDueDate] = useState('');
  const [added, setAdded] = useState(false);
  const [answers, setAnswers] = usePersistentState<QuickAnswers>(`quick:${guideId}`, {});
  const result = useMemo(() => (extras ? extras.quick.evaluate(answersWithDefaults(extras.quick.fields, answers)) : null), [extras, answers]);
  if (!guide) return <NotFound />;

  const category = CATEGORY_MAP[guide.categoryId];
  const sources = getSources(guide.officialLinks);
  const tile = categoryTile(guide.categoryId);
  const from: FromRef = { title: guide.title, path: `/guides/${guide.id}`, kind: 'guide' };
  const figure = result?.figure ?? extras?.figure;

  const addReminder = () => {
    addTask({ title: `Work through “${guide.title}”`, dueDate: isValidISODate(dueDate) ? dueDate : undefined, path: `/guides/${guide.id}`, source: 'guide' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const nav: { id: string; label: string }[] = [
    { id: 'glance', label: 'At a glance' },
    ...(extras ? [{ id: 'situation', label: 'Your situation' }] : []),
    { id: 'checklist', label: 'Checklist' },
    ...(figure ? [{ id: 'how', label: 'How it works' }] : []),
    { id: 'steps', label: 'Steps' },
    { id: 'prepare', label: 'Prepare' },
    { id: 'tools', label: 'Run the numbers' },
    { id: 'reading', label: 'Keep reading' },
    { id: 'official', label: 'Official links' },
  ];

  return (
    <article>
      <nav aria-label="Breadcrumb" className="no-print mb-3">
        <ol className="flex flex-wrap items-center gap-1 text-[13px] text-ink-faint">
          <li>
            <Link to="/guides" className="hover:text-ink">
              Life Guides
            </Link>
          </li>
          <li aria-hidden>
            <Icon name="chevron-right" size={13} className="text-stone-400" />
          </li>
          <li>
            <Link to={`/guides?category=${category.id}`} className="hover:text-ink">
              {category.shortName}
            </Link>
          </li>
          <li aria-hidden>
            <Icon name="chevron-right" size={13} className="text-stone-400" />
          </li>
          <li className="text-ink-muted">{guide.title}</li>
        </ol>
      </nav>

      <TrailBar nowTitle={guide.title} nowKind="guide" categoryId={guide.categoryId} />

      {/* Header band in the category's colour, with its illustration */}
      <header className={`grid items-center gap-5 rounded-lg border border-stone-200 ${tile} px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto]`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-sage-800">
            <span className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-stone-50 px-1.5 py-0.5 text-ink">
              <Icon name="book-open" size={12} /> Guide
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name={category.icon} size={13} /> {category.name}
            </span>
          </div>
          <h1 className="mt-2.5 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">{guide.title}</h1>
          <p className="mt-2 max-w-[58ch] text-[16px] leading-6 text-ink-muted">{guide.summary}</p>
          <div className="mt-3.5 flex flex-wrap gap-1.5 text-[12px]">
            {guide.estimatedMinutes && (
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-50 px-2.5 py-1 text-ink-muted">
                <Icon name="clock" size={12} /> ~{guide.estimatedMinutes} min
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-50 px-2.5 py-1 text-ink-muted">
              <Icon name="list-checks" size={12} /> {guide.checklist.length} checklist items
            </span>
            {guide.reviewedOn ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-sage-300 bg-stone-50 px-2.5 py-1 text-sage-800">
                <Icon name="circle-check" size={12} /> Reviewed {formatDate(guide.reviewedOn)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-50 px-2.5 py-1 text-ink-muted">
                <Icon name="info" size={12} /> General guide
              </span>
            )}
          </div>
          <div className="no-print mt-4 flex flex-wrap items-center gap-2">
            <SaveButton type="guide" refId={guide.id} title={guide.title} subtitle={guide.summary} path={`/guides/${guide.id}`} size="sm" />
            <Button size="sm" variant="ghost" icon="printer" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
        <div className="order-first w-24 md:order-none md:w-[150px]">
          <Illustration category={guide.categoryId} className="block h-auto w-full" />
        </div>
      </header>

      <nav aria-label="On this page" className="no-print -mx-4 mt-4 mb-2 overflow-x-auto border-b border-stone-200 px-4 sm:mx-0 sm:px-0">
        <ol className="flex gap-1 whitespace-nowrap">
          {nav.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className="block border-b-2 border-transparent px-2.5 py-2 text-[13px] text-ink-muted hover:border-stone-400 hover:text-ink">
                {n.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-5 space-y-7">
        {/* At a glance */}
        <section id="glance" aria-label="At a glance" className="scroll-mt-24 grid gap-3 md:grid-cols-[1.35fr_1fr_1fr]">
          <Card icon="lightbulb" title="What it means" tone="muted" iconTile="bg-tile-1">
            <Points items={guide.keyPoints} />
          </Card>
          <Card icon="users" title="Who it's for" iconTile="bg-tile-2">
            <Points items={guide.whoFor} />
          </Card>
          <Card icon="calendar-days" title="When to act" iconTile="bg-tile-3">
            <Points items={guide.when} />
          </Card>
        </section>

        {/* Your situation */}
        {extras && result && (
          <div id="situation" className="scroll-mt-24">
            <QuickCheck spec={extras.quick} answers={answers} onChange={setAnswers} result={result} from={from} guideId={guide.id} />
          </div>
        )}

        {/* Checklist */}
        <section id="checklist" aria-labelledby="checklist-h" className="scroll-mt-24">
          <SectionHead id="checklist" icon="list-checks" title="Your checklist" lede="Ticks are saved in this browser" />
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 sm:p-5">
            <Checklist listId={guide.id} items={guide.checklist} description="Essential items first; the rest are optional." />
            <div className="no-print mt-4 flex flex-wrap items-end gap-3 border-t border-stone-200 pt-4">
              <div>
                <label htmlFor="guide-due" className="mb-1 block text-[12.5px] text-ink-muted">
                  Add to My Plan with a target date (optional)
                </label>
                <input id="guide-due" type="date" className="field-input !w-auto !py-1.5 text-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button size="sm" variant="secondary" icon={added ? 'check' : 'plus'} onClick={addReminder}>
                {added ? 'Added to My Plan' : 'Add to My Plan'}
              </Button>
            </div>
          </div>
        </section>

        {/* How it works: a diagram */}
        {figure && (
          <section id="how" aria-labelledby="how-h" className="scroll-mt-24">
            <SectionHead id="how" icon="chart-column" title="How it works" lede={result?.figure ? 'Drawn from your answers above' : undefined} />
            <Figure spec={figure} />
          </section>
        )}

        {/* Steps */}
        <section id="steps" aria-labelledby="steps-h" className="scroll-mt-24">
          <SectionHead id="steps" icon="route" title="Steps, in order" />
          <ol className="stepper">
            {guide.steps.map((s, i) => (
              <li key={i} className="step">
                <span className="step-n" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="text-[14.5px] font-semibold leading-snug text-ink">{s.title}</h3>
                <p className="text-[13px] leading-5 text-ink-muted">{s.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Prepare + watch out */}
        <section id="prepare" aria-label="Prepare and watch out" className="scroll-mt-24 grid gap-3 md:grid-cols-2">
          <Card icon="files" title="Prepare" iconTile="bg-tile-1">
            <ul className="flex flex-wrap gap-2">
              {guide.prepare.map((p, i) => (
                <li key={i} className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1.5 text-[13px] text-ink">
                  <Icon name="file-text" size={13} className="text-sage-700" />
                  {p}
                </li>
              ))}
            </ul>
            {guide.costs && guide.costs.length > 0 && (
              <div className="mt-4 border-t border-stone-200 pt-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted">
                  <Icon name="coins" size={13} className="text-sage-700" />
                  Costs and decisions
                </div>
                <Points items={guide.costs} />
              </div>
            )}
          </Card>
          <Card icon="triangle-alert" title="Watch out for" iconTile="bg-clay-100">
            <Points items={guide.watchOuts} />
            {guide.eligibility && guide.eligibility.length > 0 && (
              <div className="mt-4 border-t border-stone-200 pt-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted">
                  <Icon name="scale" size={13} className="text-sage-700" />
                  Eligibility
                </div>
                <Points items={guide.eligibility} />
                <p className="mt-2 text-[12px] text-ink-faint">Eligibility is decided by the agency, not here.</p>
              </div>
            )}
          </Card>
        </section>

        {/* Run the numbers */}
        {guide.relatedCalculators.length > 0 && (
          <section id="tools" aria-labelledby="tools-h" className="scroll-mt-24">
            <SectionHead id="tools" icon="calculator" title="Run the numbers" lede="Calculators: your figures in, results out" dark />
            <div className="grid gap-2.5 md:grid-cols-2">
              {guide.relatedCalculators.map((id) => (
                <ToolTile key={id} id={id} from={from} />
              ))}
            </div>
          </section>
        )}

        {/* Keep reading */}
        {guide.relatedGuides.length > 0 && (
          <section id="reading" aria-labelledby="reading-h" className="scroll-mt-24">
            <SectionHead id="reading" icon="book-open" title="Keep reading" lede="Guides: explanations and checklists" />
            <div className="grid gap-2.5 md:grid-cols-2">
              {guide.relatedGuides.map((id) => (
                <GuideLinkCard key={id} id={id} from={from} />
              ))}
            </div>
          </section>
        )}

        {/* Official links */}
        <section id="official" aria-labelledby="official-h" className="scroll-mt-24">
          <SectionHead id="official" icon="landmark" title="Official next steps" />
          {sources.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {sources.map((s) => (
                <li key={s.id} className="min-w-0">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex h-full min-w-0 items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 hover:border-sage-400">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-ink-muted" aria-hidden>
                      <Icon name="external-link" size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block break-words text-[14px] font-medium leading-snug text-ink group-hover:text-sage-900">{s.title}</span>
                      <span className="block text-[12px] text-ink-faint">{s.agency}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-ink-muted">General practice; no agency process involved.</p>
          )}
        </section>

        <SourceNote sources={sources} reviewedOn={guide.reviewedOn} infoType={guide.infoType} />
      </div>
    </article>
  );
}
