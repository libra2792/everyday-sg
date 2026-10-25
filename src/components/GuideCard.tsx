import { Link } from 'react-router-dom';
import type { Guide } from '@/data/types';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import { useAppState } from '@/state/AppState';
import { Icon } from './ui/Icon';

const TILES = ['bg-tile-1', 'bg-tile-2', 'bg-tile-3'];

/** The tinted tile colour for a category — cycles through the theme's three tile tokens. */
export function categoryTile(categoryId: string): string {
  const idx = Math.max(0, CATEGORIES.findIndex((c) => c.id === categoryId));
  return TILES[idx % 3];
}

interface GuideCardProps {
  guide: Guide;
  showCategory?: boolean;
  compact?: boolean;
}

/** A visual card for a guide: icon badge, short title, one-line summary, progress. */
export function GuideCard({ guide, showCategory = true, compact }: GuideCardProps) {
  const { listCompletion } = useAppState();
  const { done, total } = listCompletion(guide.id, guide.checklist.map((c) => c.id));
  const category = CATEGORY_MAP[guide.categoryId];
  const tile = categoryTile(guide.categoryId);
  return (
    <Link
      to={`/guides/${guide.id}`}
      className={`group flex gap-4 rounded-lg border border-stone-200 bg-stone-50 transition-colors hover:border-sage-400 ${compact ? 'p-3.5' : 'p-4'}`}
    >
      <span className={`flex shrink-0 items-center justify-center rounded-lg ${tile} text-sage-800 ${compact ? 'h-11 w-11' : 'h-14 w-14'}`} aria-hidden>
        <Icon name={guide.icon} size={compact ? 20 : 26} strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        {showCategory && category && <span className="mb-0.5 block text-[11.5px] font-medium uppercase tracking-wider text-sage-700">{category.shortName}</span>}
        <span className={`block font-semibold leading-snug text-ink group-hover:text-sage-900 ${compact ? 'text-[14.5px]' : 'text-[16px]'}`}>{guide.title}</span>
        {!compact && <span className="mt-1 block text-[13px] leading-5 text-ink-muted">{guide.summary}</span>}
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-faint">
          {guide.estimatedMinutes && (
            <span className="inline-flex items-center gap-1">
              <Icon name="clock" size={12} />
              {guide.estimatedMinutes} min
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Icon name="list-checks" size={12} />
            {done > 0 ? `${done}/${total}` : total} {done === total && total > 0 ? 'done' : 'steps'}
          </span>
          {guide.reviewedOn && (
            <span className="inline-flex items-center gap-1 text-sage-800">
              <Icon name="circle-check" size={12} />
              Reviewed
            </span>
          )}
        </span>
      </span>
      <Icon name="chevron-right" size={16} className="mt-1 shrink-0 self-start text-stone-400 group-hover:text-sage-700" />
    </Link>
  );
}
