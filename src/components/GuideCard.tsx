import { Link } from 'react-router-dom';
import type { Guide } from '@/data/types';
import { CATEGORY_MAP } from '@/data/categories';
import { useAppState } from '@/state/AppState';
import { Icon } from './ui/Icon';

interface GuideCardProps {
  guide: Guide;
  showCategory?: boolean;
  compact?: boolean;
}

/** A quiet list-style card for a guide, with checklist progress when started. */
export function GuideCard({ guide, showCategory = true, compact }: GuideCardProps) {
  const { listCompletion } = useAppState();
  const { done, total } = listCompletion(guide.id, guide.checklist.map((c) => c.id));
  const category = CATEGORY_MAP[guide.categoryId];
  return (
    <Link
      to={`/guides/${guide.id}`}
      className={`group block rounded-lg border border-stone-200 bg-stone-50 transition-colors hover:border-sage-400 ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showCategory && category && (
            <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-sage-700">
              <Icon name={category.icon} size={13} />
              {category.shortName}
            </div>
          )}
          <h3 className={`${compact ? 'text-[15px]' : 'text-[16px]'} font-semibold leading-snug text-ink group-hover:text-sage-900`}>{guide.title}</h3>
          {!compact && <p className="mt-1.5 text-[13.5px] leading-6 text-ink-muted">{guide.summary}</p>}
        </div>
        <Icon name="chevron-right" size={16} className="mt-1 shrink-0 text-stone-400 group-hover:text-sage-700" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-faint">
        {guide.estimatedMinutes && <span>{guide.estimatedMinutes} min</span>}
        <span>{guide.checklist.length}-item checklist</span>
        {done > 0 && (
          <span className="inline-flex items-center gap-1 text-sage-800">
            <Icon name="circle-check" size={13} />
            {done === total ? 'Completed' : `${done} of ${total} done`}
          </span>
        )}
        {guide.reviewedOn ? <span>Reviewed against sources</span> : null}
      </div>
    </Link>
  );
}
