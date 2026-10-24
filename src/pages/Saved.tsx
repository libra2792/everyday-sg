import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, type SavedItemType } from '@/state/AppState';
import { formatDate } from '@/lib/format';
import { Button, LinkButton } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { EmptyState, PageHeader } from '@/components/ui/Misc';

const TYPE_META: Record<SavedItemType, { label: string; icon: IconName }> = {
  guide: { label: 'Guide', icon: 'book-open' },
  calculator: { label: 'Calculator', icon: 'calculator' },
  tool: { label: 'Tool', icon: 'list-checks' },
  snapshot: { label: 'Results snapshot', icon: 'save' },
};

export function Saved() {
  const { saved, removeSaved } = useAppState();
  const [filter, setFilter] = useState<SavedItemType | 'all'>('all');
  const list = useMemo(() => (filter === 'all' ? saved : saved.filter((s) => s.type === filter)), [saved, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: saved.length };
    for (const s of saved) c[s.type] = (c[s.type] || 0) + 1;
    return c;
  }, [saved]);

  return (
    <div>
      <PageHeader title="Saved Items" description="Guides, calculators, tools and results snapshots you bookmarked. Stored in this browser only." actions={saved.length > 0 ? <Button size="sm" variant="ghost" icon="printer" onClick={() => window.print()}>Print</Button> : null} />
      {saved.length === 0 ? (
        <EmptyState icon="bookmark" title="Nothing saved yet" description="Use the Save button on any guide or calculator, or “Save results” on a calculator to keep a snapshot of the figures." action={<div className="flex gap-2"><LinkButton to="/guides">Browse guides</LinkButton><LinkButton to="/calculators">Open calculators</LinkButton></div>} />
      ) : (
        <>
          <div className="no-print mb-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter saved items">
            {(['all', 'guide', 'calculator', 'tool', 'snapshot'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setFilter(t)} aria-pressed={filter === t} className={`rounded-md px-3 py-1.5 text-[13.5px] ${filter === t ? 'bg-stone-200 font-medium text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`}>
                {t === 'all' ? 'All' : `${TYPE_META[t].label}s`} {counts[t] ? <span className="text-ink-faint">({counts[t]})</span> : null}
              </button>
            ))}
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {list.map((s) => (
              <li key={s.id} className="surface flex flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-sage-700">
                      <Icon name={TYPE_META[s.type].icon} size={13} />
                      {TYPE_META[s.type].label}
                    </div>
                    <Link to={s.path} className="block text-[15.5px] font-semibold text-ink hover:text-sage-900">
                      {s.title}
                    </Link>
                    {s.subtitle && <p className="mt-1 text-[13px] leading-5 text-ink-muted">{s.subtitle}</p>}
                  </div>
                  <Button size="sm" variant="ghost" icon="trash-2" aria-label={`Remove ${s.title}`} onClick={() => removeSaved(s.id)} className="no-print">
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                {s.snapshot && s.snapshot.length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-stone-200 pt-3 text-[13px]">
                    {s.snapshot.map((row) => (
                      <div key={row.label} className="contents">
                        <dt className="text-ink-faint">{row.label}</dt>
                        <dd className="text-right tabular-nums text-ink">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-3 text-[12px] text-ink-faint">Saved {formatDate(s.savedAt)}</div>
              </li>
            ))}
          </ul>
          {list.length === 0 && <p className="text-[13.5px] text-ink-faint">Nothing in this category.</p>}
        </>
      )}
    </div>
  );
}
