import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CALCULATOR_MAP } from '@/data/calculators';
import { CATEGORY_MAP } from '@/data/categories';
import { GUIDE_MAP } from '@/data/guides';
import { getSources } from '@/data/sources';
import { useAppState } from '@/state/AppState';
import { Checklist } from '@/components/Checklist';
import { GuideCard, categoryTile } from '@/components/GuideCard';
import { SaveButton } from '@/components/SaveButton';
import { SourceNote } from '@/components/SourceNote';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { NotFound } from './NotFound';
import { isValidISODate } from '@/lib/dates';
import { formatDate } from '@/lib/format';

/* A short bullet list: one line per point, a small dot, no paragraphs. */
function Points({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {items.map((t, i) => {
        const tip = t.startsWith('Tip:');
        return (
          <li key={i} className="flex gap-2.5 text-[14px] leading-6 text-ink">
            {tip ? <Icon name="lightbulb" size={14} className="mt-[5px] shrink-0 text-sage-700" /> : <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-sage-600" aria-hidden />}
            <span className={tip ? 'text-ink-muted' : ''}>{tip ? t.replace(/^Tip:\s*/, '') : t}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* A card with an icon header. */
function Card({ id, icon, title, children, tone = 'surface', className = '' }: { id?: string; icon: IconName; title: string; children: ReactNode; tone?: 'surface' | 'muted' | 'tint'; className?: string }) {
  const bg = tone === 'muted' ? 'bg-stone-100' : tone === 'tint' ? 'bg-sage-50' : 'bg-stone-50';
  return (
    <section id={id} aria-labelledby={id ? `${id}-h` : undefined} className={`scroll-mt-24 rounded-lg border border-stone-200 ${bg} p-4 sm:p-5 ${className}`}>
      <h2 id={id ? `${id}-h` : undefined} className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-50 text-sage-800 ring-1 ring-stone-200" aria-hidden>
          <Icon name={icon} size={15} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const STEP_ICONS: IconName[] = ['flag', 'search', 'scale', 'route', 'pencil', 'calendar-check', 'circle-check'];

export function GuidePage() {
  const { guideId = '' } = useParams();
  const guide = GUIDE_MAP[guideId];
  const { addTask } = useAppState();
  const [dueDate, setDueDate] = useState('');
  const [added, setAdded] = useState(false);
  if (!guide) return <NotFound />;

  const category = CATEGORY_MAP[guide.categoryId];
  const sources = getSources(guide.officialLinks);
  const related = guide.relatedGuides.map((id) => GUIDE_MAP[id]).filter(Boolean);
  const calculators = guide.relatedCalculators.map((id) => CALCULATOR_MAP[id]).filter(Boolean);
  const tile = categoryTile(guide.categoryId);

  const addReminder = () => {
    addTask({ title: `Work through “${guide.title}”`, dueDate: isValidISODate(dueDate) ? dueDate : undefined, path: `/guides/${guide.id}`, source: 'guide' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const nav: { id: string; label: string }[] = [
    { id: 'glance', label: 'At a glance' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'steps', label: 'Steps' },
    { id: 'prepare', label: 'Prepare' },
    { id: 'watch', label: 'Watch out' },
    { id: 'official', label: 'Official links' },
    { id: 'related', label: 'Related' },
  ];

  return (
    <article>
      {/* Header */}
      <header className="mb-8">
        <nav aria-label="Breadcrumb" className="no-print mb-4">
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
          </ol>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
            <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${tile} text-sage-800 sm:h-20 sm:w-20`} aria-hidden>
              <Icon name={guide.icon} size={34} strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <div className="mb-1 text-[12px] font-medium uppercase tracking-wider text-sage-700">{category.name}</div>
              <h1 className="text-[26px] font-semibold leading-tight sm:text-[32px]">{guide.title}</h1>
              <p className="mt-2 text-[15px] leading-6 text-ink-muted">{guide.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
                {guide.estimatedMinutes && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-1 text-ink-muted">
                    <Icon name="clock" size={12} /> ~{guide.estimatedMinutes} min
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-1 text-ink-muted">
                  <Icon name="list-checks" size={12} /> {guide.checklist.length} checklist items
                </span>
                {guide.reviewedOn ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-1 text-sage-800">
                    <Icon name="circle-check" size={12} /> Reviewed {formatDate(guide.reviewedOn)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-1 text-ink-muted">
                    <Icon name="info" size={12} /> General guide
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            <SaveButton type="guide" refId={guide.id} title={guide.title} subtitle={guide.summary} path={`/guides/${guide.id}`} size="sm" />
            <Button size="sm" variant="ghost" icon="printer" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="no-print hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-ink-faint">On this page</div>
          <ol className="space-y-1 border-l border-stone-200">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-[13px] text-ink-muted hover:border-sage-600 hover:text-ink">
                  {n.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-6">
          {/* At a glance: three cards */}
          <div id="glance" className="scroll-mt-24 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
            <Card icon="lightbulb" title="What it means" tone="tint">
              <Points items={guide.keyPoints} />
            </Card>
            <Card icon="users" title="Who it's for">
              <Points items={guide.whoFor} />
            </Card>
            <Card icon="calendar-days" title="When to act">
              <Points items={guide.when} />
            </Card>
          </div>

          {/* Checklist comes early */}
          <Card id="checklist" icon="list-checks" title="Your checklist">
            <Checklist listId={guide.id} items={guide.checklist} description="Ticks are saved in this browser. Essential items first; the rest are optional." />
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
          </Card>

          {/* Steps as cards */}
          <section id="steps" aria-labelledby="steps-h" className="scroll-mt-24">
            <h2 id="steps-h" className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-50 text-sage-800 ring-1 ring-stone-200" aria-hidden>
                <Icon name="route" size={15} />
              </span>
              Steps, in order
            </h2>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {guide.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tile} text-sage-800`} aria-hidden>
                    <Icon name={STEP_ICONS[i % STEP_ICONS.length]} size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium uppercase tracking-wider text-ink-faint">Step {i + 1}</span>
                    <span className="block text-[14.5px] font-semibold leading-snug text-ink">{s.title}</span>
                    <span className="mt-1 block text-[13px] leading-5 text-ink-muted">{s.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Prepare + costs + watch outs */}
          <div className="grid gap-3 md:grid-cols-2">
            <Card id="prepare" icon="files" title="Prepare">
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
            <Card id="watch" icon="triangle-alert" title="Watch out for">
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
          </div>

          {/* Official links as a grid */}
          <section id="official" aria-labelledby="official-h" className="scroll-mt-24">
            <h2 id="official-h" className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-50 text-sage-800 ring-1 ring-stone-200" aria-hidden>
                <Icon name="landmark" size={15} />
              </span>
              Official next steps
            </h2>
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

          {/* Related */}
          <section id="related" aria-labelledby="related-h" className="scroll-mt-24">
            <h2 id="related-h" className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-50 text-sage-800 ring-1 ring-stone-200" aria-hidden>
                <Icon name="compass" size={15} />
              </span>
              Related tools and guides
            </h2>
            {calculators.length > 0 && (
              <ul className="mb-3 flex flex-wrap gap-2">
                {calculators.map((c) => (
                  <li key={c.id}>
                    <Link to={c.path} className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-[13.5px] font-medium text-ink hover:border-sage-500">
                      <Icon name={c.icon} size={15} className="text-sage-700" />
                      {c.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {related.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((g) => (
                  <GuideCard key={g.id} guide={g} compact />
                ))}
              </div>
            )}
          </section>

          <SourceNote sources={sources} reviewedOn={guide.reviewedOn} infoType={guide.infoType} />
        </div>
      </div>
    </article>
  );
}
