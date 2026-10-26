import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CALCULATOR_MAP } from '@/data/calculators';
import { CATEGORY_MAP } from '@/data/categories';
import { GUIDE_MAP } from '@/data/guides';
import { SOURCE_MAP } from '@/data/sources';
import { useAppState } from '@/state/AppState';
import { categoryTile } from './GuideCard';
import { Icon } from './ui/Icon';

/**
 * Two deliberately different link styles, so a reader knows before clicking whether they
 * are about to run numbers (dark calculator tile) or keep reading (tinted guide card).
 * Both pass a `from` state so the destination can show a trail bar back here.
 */

export interface FromRef {
  title: string;
  path: string;
  kind: 'guide' | 'tool';
}

export function useFrom(): FromRef | null {
  const { state } = useLocation();
  const from = (state as { from?: FromRef } | null)?.from;
  return from && from.path && from.title ? from : null;
}

function prefillQuery(prefill?: Record<string, number>): string {
  if (!prefill) return '';
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(prefill)) if (Number.isFinite(v)) p.set(k, String(Math.round(v * 100) / 100));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function ToolTile({ id, note, prefill, from }: { id: string; note?: string; prefill?: Record<string, number>; from: FromRef }) {
  const tool = CALCULATOR_MAP[id];
  if (!tool) return null;
  const isCalc = tool.kind === 'calculator';
  return (
    <Link
      to={`${tool.path}${prefillQuery(prefill)}`}
      state={{ from }}
      viewTransition
      className="group flex min-w-0 items-center gap-3.5 rounded-md bg-tool text-tool-ink transition-colors hover:bg-tool-hover px-3.5 py-3"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tool-accent text-tool-ink" aria-hidden>
        <Icon name={isCalc ? 'calculator' : 'clipboard-check'} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wider opacity-75">{isCalc ? 'Calculator' : 'Tool'}</span>
        <span className="block text-[15px] font-semibold leading-snug">{tool.name}</span>
        {note && <span className="mt-0.5 block text-[12.5px] leading-5 opacity-80">{note}</span>}
        {prefill && <span className="mt-1 block text-[11.5px] opacity-70">Opens with your numbers filled in</span>}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-current px-2.5 py-1 text-[12.5px] font-semibold opacity-90 group-hover:opacity-100">
        {isCalc ? 'Run' : 'Open'}
        <Icon name="arrow-right" size={13} />
      </span>
    </Link>
  );
}

export function GuideLinkCard({ id, note, from }: { id: string; note?: string; from: FromRef }) {
  const g = GUIDE_MAP[id];
  const { listCompletion } = useAppState();
  if (!g) return null;
  const cat = CATEGORY_MAP[g.categoryId];
  const { done, total } = listCompletion(g.id, g.checklist.map((c) => c.id));
  return (
    <Link
      to={`/guides/${g.id}`}
      state={{ from }}
      viewTransition
      className="group flex min-w-0 items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-3.5 py-3 transition-colors hover:border-sage-400"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${categoryTile(g.categoryId)} text-sage-800`} aria-hidden>
        <Icon name={g.icon} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-sage-800">Guide · {cat?.shortName}</span>
        <span className="block text-[15px] font-semibold leading-snug text-ink group-hover:text-sage-900">{g.title}</span>
        {note && <span className="mt-0.5 block text-[12.5px] leading-5 text-ink-muted">{note}</span>}
      </span>
      <span className="hidden shrink-0 items-center gap-2.5 whitespace-nowrap text-[12px] text-ink-faint sm:inline-flex">
        {g.estimatedMinutes && (
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={12} />
            {g.estimatedMinutes} min
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Icon name="list-checks" size={12} />
          {done > 0 ? `${done}/${total}` : total}
        </span>
      </span>
      <Icon name="chevron-right" size={16} className="shrink-0 text-stone-400 group-hover:text-sage-700" />
    </Link>
  );
}

export function OfficialLinkCard({ id, note, label }: { id: string; note?: string; label?: string }) {
  const s = SOURCE_MAP[id];
  if (!s) return null;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-3.5 py-3 transition-colors hover:border-sage-400"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-100 text-sage-800" aria-hidden>
        <Icon name="external-link" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-sage-800">Official · {s.agency}</span>
        <span className="block text-[15px] font-semibold leading-snug text-ink">{label ?? s.title}</span>
        {note && <span className="mt-0.5 block text-[12.5px] leading-5 text-ink-muted">{note}</span>}
      </span>
      <Icon name="chevron-right" size={16} className="shrink-0 text-stone-400 group-hover:text-sage-700" />
    </a>
  );
}

/**
 * Shown at the top of a guide or calculator reached from another page. Together with the
 * page transition it makes a move between similar-looking pages unmistakable.
 */
export function TrailBar({ nowTitle, nowKind, categoryId }: { nowTitle: string; nowKind: 'guide' | 'tool'; categoryId?: string }) {
  const from = useFrom();
  const navigate = useNavigate();
  if (!from) return null;
  const cat = categoryId ? CATEGORY_MAP[categoryId] : undefined;
  const tile = categoryId ? categoryTile(categoryId) : 'bg-stone-200';
  return (
    <div className="trail-fresh no-print mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-md border-l-[3px] border-sage-500 bg-stone-100 px-3.5 py-2.5 text-[13.5px]" role="status">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-stone-50">
        <Icon name="arrow-right" size={12} />
        New page
      </span>
      <button
        type="button"
        onClick={() => {
          document.documentElement.setAttribute('data-nav', 'back');
          navigate(-1);
          window.setTimeout(() => document.documentElement.removeAttribute('data-nav'), 700);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 py-1 pl-2 pr-2.5 font-medium text-ink hover:border-sage-500"
      >
        <Icon name="arrow-left" size={14} />
        Back to {from.title}
      </button>
      <span className="text-ink-muted">
        You are now in a{' '}
        <span className={`inline-flex items-center gap-1 rounded-full border border-stone-300 px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wider ${nowKind === 'tool' ? 'bg-tool text-tool-ink border-transparent' : `${tile} text-ink`}`}>
          <Icon name={nowKind === 'tool' ? 'calculator' : 'book-open'} size={12} />
          {nowKind === 'tool' ? 'Calculator' : `Guide · ${cat?.shortName ?? ''}`}
        </span>{' '}
        <b className="font-semibold text-ink">{nowTitle}</b>
      </span>
    </div>
  );
}
