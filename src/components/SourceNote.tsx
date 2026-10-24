import type { Source } from '@/data/types';
import { getSources } from '@/data/sources';
import { formatDate } from '@/lib/format';
import { Icon } from './ui/Icon';

interface SourceNoteProps {
  sourceIds?: string[];
  sources?: Source[];
  /** Date the surrounding content was reviewed against its sources, if it was. */
  reviewedOn?: string;
  /** 'official' content references rules that change; 'general' is evergreen guidance. */
  infoType?: 'official' | 'general';
  title?: string;
  className?: string;
}

function checkLabel(s: Source): string {
  if (s.check === 'content' && s.checkedOn) return `Page read ${formatDate(s.checkedOn)}`;
  if (s.check === 'link' && s.checkedOn) return `Link checked ${formatDate(s.checkedOn)}`;
  return 'Not auto-checked';
}

/**
 * Lists official sources with an honest statement of how they were checked, plus the
 * standard disclaimer. Used on every page that contains changeable policy information.
 */
export function SourceNote({ sourceIds = [], sources, reviewedOn, infoType = 'official', title = 'Sources and verification', className = '' }: SourceNoteProps) {
  const list = sources ?? getSources(sourceIds);
  return (
    <section aria-label={title} className={`rounded-lg border border-stone-200 bg-stone-100 p-5 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
        {reviewedOn ? (
          <span className="text-[12.5px] text-ink-faint">Content reviewed against sources on {formatDate(reviewedOn)}</span>
        ) : (
          <span className="text-[12.5px] text-ink-faint">{infoType === 'official' ? 'General guide — not yet reviewed against official sources' : 'General guidance'}</span>
        )}
      </div>
      {list.length > 0 && (
        <ul className="mt-3 space-y-2">
          {list.map((s) => (
            <li key={s.id} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-[13.5px]">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="link min-w-0 break-words">
                <span className="font-medium">{s.agency}</span>
                <span className="text-ink-muted"> — {s.title}</span>
                <Icon name="external-link" size={12} className="ml-1 inline-block align-[-1px]" />
              </a>
              <span className="shrink-0 text-[12px] text-ink-faint">{checkLabel(s)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[12.5px] leading-5 text-ink-faint">
        Everyday SG is independent and not affiliated with any government agency. It cannot submit applications for you. Official requirements, amounts and
        deadlines change: confirm current rules with the responsible agency before acting. Figures you enter are your own assumptions, not verified data.
      </p>
    </section>
  );
}
