import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CALCULATORS } from '@/data/calculators';
import { CATEGORY_MAP, LIFE_STAGES } from '@/data/categories';
import { FEATURED_GUIDE_IDS, GUIDE_MAP, GUIDES } from '@/data/guides';
import { recommend } from '@/lib/recommend';
import { daysUntil, describeDue } from '@/lib/dates';
import { useAppState } from '@/state/AppState';
import { SearchBox } from '@/components/SearchBox';
import { GuideCard } from '@/components/GuideCard';
import { Icon, type IconName } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Misc';

const TILE_CLASSES = ['bg-tile-1', 'bg-tile-2', 'bg-tile-3'];

const QUICK_ACTIONS: { label: string; to: string; icon: IconName }[] = [
  { label: 'Plan my finances', to: '/calculators/budget', icon: 'wallet' },
  { label: 'Buy a home', to: '/guides/home-affordability-and-loans', icon: 'home' },
  { label: 'Prepare for a baby', to: '/guides/preparing-for-pregnancy', icon: 'baby' },
  { label: 'Support my parents', to: '/guides/caregiving-plan', icon: 'heart-handshake' },
  { label: 'Plan my retirement', to: '/calculators/retirement', icon: 'sunrise' },
  { label: 'Sort out my life admin', to: '/tools/annual-admin', icon: 'calendar-check' },
];

function NextSteps() {
  const { profile, profileDismissed, progress, tasks } = useAppState();
  const recs = useMemo(() => recommend(profile, progress, 5), [profile, progress]);
  const inProgress = useMemo(
    () =>
      GUIDES.map((g) => {
        const list = progress[g.id] || {};
        const done = g.checklist.filter((c) => list[c.id]).length;
        return { guide: g, done, total: g.checklist.length };
      })
        .filter((x) => x.done > 0 && x.done < x.total)
        .slice(0, 3),
    [progress],
  );
  const openTasks = tasks.filter((t) => !t.done).length;

  return (
    <section aria-labelledby="next-steps-title" className="surface-muted min-w-0 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="next-steps-title" className="text-lg font-semibold text-ink">
            Your next steps
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-faint">
            {profile ? 'Based on your profile and what you have ticked off.' : 'A two-minute profile makes these suggestions personal. Everything stays in this browser.'}
          </p>
        </div>
        <LinkButton to={profile ? '/plan/profile' : '/plan/profile'} size="sm" variant={profile ? 'ghost' : 'primary'} icon={profile ? 'pencil' : 'user'}>
          {profile ? 'Edit profile' : profileDismissed ? 'Set up profile' : 'Personalise'}
        </LinkButton>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {recs.map((r) => (
          <Link key={`${r.type}-${r.id}`} to={r.path} className="group flex items-start gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-sage-400">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-800">
              <Icon name={r.type === 'guide' ? 'book-open' : r.type === 'tool' ? 'list-checks' : 'calculator'} size={14} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14.5px] font-medium text-ink group-hover:text-sage-900">{r.title}</span>
              <span className="mt-0.5 block text-[12.5px] text-ink-faint">{r.reason}</span>
            </span>
          </Link>
        ))}
      </div>
      {(inProgress.length > 0 || openTasks > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-muted">
          {inProgress.map((x) => (
            <Link key={x.guide.id} to={`/guides/${x.guide.id}`} className="inline-flex items-center gap-1.5 hover:text-ink">
              <Icon name="circle-check" size={13} className="text-sage-700" />
              Continue “{x.guide.title}” ({x.done}/{x.total})
            </Link>
          ))}
          {openTasks > 0 && (
            <Link to="/plan" className="inline-flex items-center gap-1.5 hover:text-ink">
              <Icon name="list-checks" size={13} className="text-sage-700" />
              {openTasks} open {openTasks === 1 ? 'task' : 'tasks'} in My Plan
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

function DueSoon() {
  const { tasks } = useAppState();
  const due = useMemo(() => {
    return tasks
      .filter((t) => !t.done && t.dueDate)
      .map((t) => ({ task: t, days: daysUntil(t.dueDate) ?? 9999 }))
      .filter((x) => x.days <= 60)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
  }, [tasks]);
  if (due.length === 0) return null;
  return (
    <section aria-labelledby="due-title" className="surface min-w-0 p-5">
      <div className="flex items-center justify-between">
        <h2 id="due-title" className="text-[15px] font-semibold text-ink">
          Due soon
        </h2>
        <Link to="/plan" className="text-[13px] text-sage-800 hover:underline">
          All tasks
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-stone-200">
        {due.map(({ task, days }) => (
          <li key={task.id} className="flex items-center justify-between gap-3 py-2 text-[14px]">
            {task.path ? (
              <Link to={task.path} className="min-w-0 truncate text-ink hover:text-sage-900">
                {task.title}
              </Link>
            ) : (
              <span className="min-w-0 truncate text-ink">{task.title}</span>
            )}
            <span className={`shrink-0 text-[12.5px] tabular-nums ${days < 0 ? 'text-clay-700' : 'text-ink-faint'}`}>{describeDue(task.dueDate)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Home() {
  const popular = CALCULATORS.filter((c) => c.popular);
  const featured = FEATURED_GUIDE_IDS.map((id) => GUIDE_MAP[id]).filter(Boolean);

  return (
    <div className="space-y-12">
      <section className="rounded-lg bg-hero p-(--hero-pad) text-hero-ink">
        <div className="max-w-2xl">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-hero-eyebrow">Everyday SG</p>
          <h1 className="text-[30px] font-semibold leading-[1.15] text-hero-ink sm:text-[40px]">Your guide to adulting in Singapore.</h1>
          <p className="mt-4 text-[16px] leading-7 text-hero-muted">
            Independent, practical help with money, housing, family, caregiving, insurance, CPF, careers and the admin in between. What applies to you, what to do,
            what it might cost, and where to get it done.
          </p>
        </div>
        <div className="mt-7 max-w-2xl">
          <SearchBox size="lg" />
          <p className="mt-2 text-[12.5px] text-hero-muted">Try “BTO or resale”, “emergency fund”, “LPA”, “childcare subsidy” or “car cost”.</p>
        </div>
        <ul className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6" aria-label="Quick actions">
          {QUICK_ACTIONS.map((a, i) => (
            <li key={a.to}>
              <Link to={a.to} className={`flex h-full items-center gap-2.5 rounded-md border border-stone-200 px-3.5 py-3 text-[13.5px] font-medium text-ink transition-colors hover:border-sage-400 ${TILE_CLASSES[i % 3]}`}>
                <Icon name={a.icon} size={16} className="shrink-0 text-sage-700" />
                {a.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <NextSteps />
        <DueSoon />
      </div>

      <section aria-labelledby="stage-title">
        <SectionHeading title="Where are you in life?" description="Pick a stage to see the guides that usually matter most." />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LIFE_STAGES.map((s, i) => (
            <li key={s.id}>
              <Link to={`/guides?stage=${s.id}`} className={`block h-full rounded-lg border border-stone-200 p-4 transition-colors hover:border-sage-400 ${TILE_CLASSES[i % 3]}`}>
                <div className="text-[14.5px] font-semibold text-ink">{s.name}</div>
                <p className="mt-1 text-[12.5px] leading-5 text-ink-faint">{s.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {s.categories.slice(0, 3).map((cid) => (
                    <span key={cid} className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-ink-muted">
                      {CATEGORY_MAP[cid]?.shortName}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="calc-title">
        <SectionHeading title="Popular calculators" description="Real numbers from your own assumptions. Nothing is sent anywhere." action={<Link to="/calculators" className="text-[13px] text-sage-800 hover:underline">All calculators and tools</Link>} />
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50">
          {popular.map((c) => (
            <li key={c.id}>
              <Link to={c.path} className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-stone-100">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sage-50 text-sage-800">
                  <Icon name={c.icon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink group-hover:text-sage-900">{c.name}</span>
                  <span className="block truncate text-[13px] text-ink-faint">{c.description}</span>
                </span>
                <Icon name="chevron-right" size={16} className="shrink-0 text-stone-400 group-hover:text-sage-700" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guides-title">
        <SectionHeading title="Practical guides" description="Plain-English explainers with steps, documents, pitfalls and a checklist you can tick off." action={<Link to="/guides" className="text-[13px] text-sage-800 hover:underline">Browse all {GUIDES.length} guides</Link>} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((g) => (
            <GuideCard key={g.id} guide={g} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-stone-100 p-5 text-[13.5px] leading-6 text-ink-muted sm:p-6">
        <strong className="text-ink">Independent and private by design.</strong> Everyday SG is not a government website and cannot submit applications for you. Guides link to
        the responsible agencies, where rules and amounts are kept current. Your profile, checklists and calculator inputs are stored only in this browser; you can export,
        import or erase them at any time from <Link to="/plan" className="link">My Plan</Link>. Made by one Singaporean figuring it out too:{' '}
        <Link to="/creator" className="link">read the story</Link>.
      </section>
    </div>
  );
}
