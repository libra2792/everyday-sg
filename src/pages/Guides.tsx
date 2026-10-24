import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORIES, CATEGORY_MAP, LIFE_STAGES, LIFE_STAGE_MAP } from '@/data/categories';
import { GUIDES } from '@/data/guides';
import type { LifeStageId } from '@/data/types';
import { search } from '@/lib/search';
import { GuideCard } from '@/components/GuideCard';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';

export function Guides() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const stage = (params.get('stage') || '') as LifeStageId | '';
  const q = params.get('q') || '';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    let list = GUIDES;
    if (q.trim()) {
      const ids = new Set(search(q, 100).filter((r) => r.type === 'guide').map((r) => r.id));
      list = list.filter((g) => ids.has(g.id));
      // keep search ranking order
      const order = search(q, 100).map((r) => r.id);
      list = [...list].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    }
    if (category) list = list.filter((g) => g.categoryId === category);
    if (stage) list = list.filter((g) => g.lifeStages.includes(stage));
    return list;
  }, [q, category, stage]);

  const activeCategory = category ? CATEGORY_MAP[category] : null;
  const activeStage = stage ? LIFE_STAGE_MAP[stage] : null;
  const anyFilter = Boolean(q || category || stage);

  return (
    <div>
      <PageHeader
        title="Life Guides"
        description={`${GUIDES.length} plain-English guides across 12 areas of life in Singapore. Each one explains what the topic means, who it applies to, what to do and in what order, what to prepare, and where to complete the task — with a checklist that remembers your progress.`}
      />

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Filters">
          <div>
            <label htmlFor="guide-search" className="mb-1.5 block text-sm font-medium text-ink">
              Search guides
            </label>
            <div className="relative">
              <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input id="guide-search" type="search" className="field-input pl-9" placeholder="e.g. HDB loan, LPA, childcare" value={q} onChange={(e) => update('q', e.target.value)} />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Life stage</legend>
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
              <button type="button" onClick={() => update('stage', '')} className={`rounded-md px-2.5 py-1.5 text-left text-[13.5px] ${!stage ? 'bg-stone-200 font-medium text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`} aria-pressed={!stage}>
                All stages
              </button>
              {LIFE_STAGES.map((s) => (
                <button key={s.id} type="button" onClick={() => update('stage', s.id === stage ? '' : s.id)} className={`rounded-md px-2.5 py-1.5 text-left text-[13.5px] ${stage === s.id ? 'bg-stone-200 font-medium text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`} aria-pressed={stage === s.id}>
                  {s.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Category</legend>
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
              <button type="button" onClick={() => update('category', '')} className={`rounded-md px-2.5 py-1.5 text-left text-[13.5px] ${!category ? 'bg-stone-200 font-medium text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`} aria-pressed={!category}>
                All categories
              </button>
              {CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => update('category', c.id === category ? '' : c.id)} className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13.5px] ${category === c.id ? 'bg-stone-200 font-medium text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`} aria-pressed={category === c.id}>
                  <Icon name={c.icon} size={14} className="shrink-0 text-sage-700" />
                  {c.shortName}
                </button>
              ))}
            </div>
          </fieldset>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px] text-ink-faint" aria-live="polite">
              {results.length} {results.length === 1 ? 'guide' : 'guides'}
              {activeCategory ? ` in ${activeCategory.shortName}` : ''}
              {activeStage ? ` for “${activeStage.name}”` : ''}
              {q ? ` matching “${q}”` : ''}
            </p>
            {anyFilter && (
              <Button size="sm" variant="ghost" icon="x" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </Button>
            )}
          </div>

          {activeCategory && (
            <div className="mb-5 rounded-lg border border-stone-200 bg-stone-100 p-4">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Icon name={activeCategory.icon} size={17} className="text-sage-700" />
                {activeCategory.name}
              </div>
              <p className="mt-1 text-[13.5px] leading-6 text-ink-muted">{activeCategory.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeCategory.topics.map((t) => (
                  <span key={t} className="rounded-full bg-stone-200 px-2 py-0.5 text-[11.5px] text-ink-muted">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <EmptyState title="No guides match" description="Try a broader word, clear a filter, or search calculators and tools as well." action={<Link to={`/search?q=${encodeURIComponent(q)}`} className="link text-sm">Search everything</Link>} />
          ) : !anyFilter ? (
            <div className="space-y-8">
              {CATEGORIES.map((c) => {
                const list = results.filter((g) => g.categoryId === c.id);
                if (list.length === 0) return null;
                return (
                  <section key={c.id} aria-labelledby={`cat-${c.id}`}>
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <h2 id={`cat-${c.id}`} className="flex items-center gap-2 text-[16px] font-semibold text-ink">
                        <Icon name={c.icon} size={16} className="text-sage-700" />
                        {c.name}
                      </h2>
                      <button type="button" onClick={() => update('category', c.id)} className="text-[13px] text-sage-800 hover:underline">
                        Only this
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {list.map((g) => (
                        <GuideCard key={g.id} guide={g} showCategory={false} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((g) => (
                <GuideCard key={g.id} guide={g} showCategory={!activeCategory} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
