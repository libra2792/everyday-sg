import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CALCULATOR_MAP } from '@/data/calculators';
import { CATEGORY_MAP } from '@/data/categories';
import { GUIDE_MAP } from '@/data/guides';
import { getSources } from '@/data/sources';
import { useAppState } from '@/state/AppState';
import { Checklist } from '@/components/Checklist';
import { GuideCard } from '@/components/GuideCard';
import { SaveButton } from '@/components/SaveButton';
import { SourceNote } from '@/components/SourceNote';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/Misc';
import { NotFound } from './NotFound';
import { isValidISODate } from '@/lib/dates';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24">
      <h2 id={`${id}-h`} className="mb-3 text-[18px] font-semibold text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-7 text-ink">
          <span className="mt-[13px] h-1 w-1 shrink-0 rounded-full bg-sage-600" aria-hidden />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

const SECTIONS = [
  ['plain', 'In plain English'],
  ['who', 'Who should consider it'],
  ['when', 'When to act'],
  ['steps', 'Recommended sequence'],
  ['documents', 'What to prepare'],
  ['costs', 'Costs and decisions'],
  ['mistakes', 'Common mistakes and tips'],
  ['eligibility', 'Eligibility considerations'],
  ['official', 'Official next steps'],
  ['related', 'Related calculators and guides'],
  ['checklist', 'Your checklist'],
] as const;

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
  const visibleSections = SECTIONS.filter(([key]) => {
    if (key === 'costs') return Boolean(guide.costsAndDecisions?.length);
    if (key === 'eligibility') return Boolean(guide.eligibility?.length);
    return true;
  });

  const addReminder = () => {
    addTask({ title: `Work through “${guide.title}”`, dueDate: isValidISODate(dueDate) ? dueDate : undefined, path: `/guides/${guide.id}`, source: 'guide' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <article>
      <PageHeader
        breadcrumbs={[{ label: 'Life Guides', to: '/guides' }, { label: category.shortName, to: `/guides?category=${category.id}` }, { label: guide.title }]}
        eyebrow={category.name}
        title={guide.title}
        description={guide.summary}
        actions={
          <>
            <SaveButton type="guide" refId={guide.id} title={guide.title} subtitle={guide.summary} path={`/guides/${guide.id}`} size="sm" />
            <Button size="sm" variant="ghost" icon="printer" onClick={() => window.print()}>
              Print
            </Button>
          </>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="no-print hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-ink-faint">On this page</div>
          <ol className="space-y-1 border-l border-stone-200">
            {visibleSections.map(([key, label]) => (
              <li key={key}>
                <a href={`#${key}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-[13px] text-ink-muted hover:border-sage-600 hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-5 text-[12.5px] text-ink-faint">
            {guide.estimatedMinutes ? `About ${guide.estimatedMinutes} minutes` : null}
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl space-y-10">
          <Section id="plain" title="In plain English">
            <div className="prose-esg">
              {guide.plainEnglish.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Section>

          <Section id="who" title="Who should consider it">
            <Bullets items={guide.whoShouldConsider} />
          </Section>

          <Section id="when" title="When to act">
            <Bullets items={guide.whenToAct} />
          </Section>

          <Section id="steps" title="Recommended sequence">
            <ol className="space-y-3">
              {guide.steps.map((s, i) => (
                <li key={i} className="flex gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[13px] font-semibold text-ink tabular-nums">{i + 1}</span>
                  <div>
                    <div className="text-[15px] font-semibold text-ink">{s.title}</div>
                    <p className="mt-1 text-[14px] leading-6 text-ink-muted">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="documents" title="What to prepare">
            <Bullets items={guide.documents} />
          </Section>

          {guide.costsAndDecisions && guide.costsAndDecisions.length > 0 && (
            <Section id="costs" title="Costs and decisions">
              <Bullets items={guide.costsAndDecisions} />
            </Section>
          )}

          <Section id="mistakes" title="Common mistakes and tips">
            <Bullets items={guide.mistakesAndTips} />
          </Section>

          {guide.eligibility && guide.eligibility.length > 0 && (
            <Section id="eligibility" title="Eligibility considerations">
              <Bullets items={guide.eligibility} />
              <p className="mt-3 text-[13px] leading-5 text-ink-faint">Eligibility is determined by the responsible agency. Everyday SG cannot confirm it for you.</p>
            </Section>
          )}

          <Section id="official" title="Official next steps">
            {sources.length > 0 ? (
              <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50">
                {sources.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-stone-100">
                      <span className="min-w-0">
                        <span className="block text-[14.5px] font-medium text-ink group-hover:text-sage-900">{s.title}</span>
                        <span className="block text-[12.5px] text-ink-faint">{s.agency}</span>
                      </span>
                      <Icon name="external-link" size={15} className="shrink-0 text-ink-faint" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-ink-muted">This guide is general practice and does not depend on a specific agency.</p>
            )}
          </Section>

          <Section id="related" title="Related calculators and guides">
            {calculators.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-2">
                {calculators.map((c) => (
                  <li key={c.id}>
                    <Link to={c.path} className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-[13.5px] font-medium text-ink hover:border-sage-500">
                      <Icon name={c.icon} size={15} className="text-sage-700" />
                      {c.name}
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
          </Section>

          <Section id="checklist" title="Your checklist">
            <Checklist listId={guide.id} items={guide.checklist} description="Ticks are saved in this browser and will be here when you come back." />
            <div className="no-print mt-5 rounded-lg border border-stone-200 bg-stone-100 p-4">
              <div className="text-[14px] font-medium text-ink">Add this guide to My Plan</div>
              <p className="mt-1 text-[13px] text-ink-faint">Optional: set a date and it will appear in “Due soon” on the home page.</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="guide-due" className="mb-1 block text-[13px] text-ink-muted">
                    Target date (optional)
                  </label>
                  <input id="guide-due" type="date" className="field-input !w-auto" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <Button variant="secondary" icon={added ? 'check' : 'plus'} onClick={addReminder}>
                  {added ? 'Added to My Plan' : 'Add to My Plan'}
                </Button>
              </div>
            </div>
          </Section>

          <SourceNote sources={sources} reviewedOn={guide.reviewedOn} infoType={guide.infoType} />
        </div>
      </div>
    </article>
  );
}
