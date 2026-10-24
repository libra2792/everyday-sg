import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { search } from '@/lib/search';
import { CATEGORIES } from '@/data/categories';
import { SearchBox } from '@/components/SearchBox';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader } from '@/components/ui/Misc';

const TYPE_LABEL = { guide: 'Guide', calculator: 'Calculator', tool: 'Tool' } as const;

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const results = useMemo(() => search(q, 30), [q]);

  return (
    <div>
      <PageHeader title="Search" description="Guides, calculators and tools. Try plain words: “BTO”, “helper levy”, “will”, “car loan”." />
      <div className="max-w-2xl">
        <SearchBox key={q} initialQuery={q} autoFocus={!q} size="lg" />
      </div>
      <div className="mt-8">
        {!q ? (
          <div>
            <h2 className="mb-3 text-[15px] font-semibold text-ink">Browse by category</h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link to={`/guides?category=${c.id}`} className="flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-ink hover:border-sage-400">
                    <Icon name={c.icon} size={16} className="text-sage-700" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length === 0 ? (
          <EmptyState title={`No results for “${q}”`} description="Try a different word, or browse the guide library by category and life stage." action={<Link to="/guides" className="link text-sm">Browse all guides</Link>} />
        ) : (
          <>
            <p className="mb-3 text-[13.5px] text-ink-faint" aria-live="polite">
              {results.length} {results.length === 1 ? 'result' : 'results'} for “{q}”
            </p>
            <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link to={r.path} className="group flex items-start justify-between gap-4 px-4 py-3.5 hover:bg-stone-100">
                    <span className="min-w-0">
                      <span className="mb-0.5 block text-[12px] uppercase tracking-wider text-ink-faint">
                        {TYPE_LABEL[r.type]} · {r.categoryName}
                      </span>
                      <span className="block text-[15px] font-medium text-ink group-hover:text-sage-900">{r.title}</span>
                      <span className="block text-[13.5px] leading-6 text-ink-muted">{r.description}</span>
                    </span>
                    <Icon name="chevron-right" size={16} className="mt-1 shrink-0 text-stone-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
