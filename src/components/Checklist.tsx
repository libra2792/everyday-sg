import { useMemo } from 'react';
import type { ChecklistItem } from '@/data/types';
import { useAppState } from '@/state/AppState';
import { Button } from './ui/Button';
import { CheckboxField } from './ui/Field';
import { Badge, ProgressBar } from './ui/Misc';

interface ChecklistProps {
  listId: string;
  items: ChecklistItem[];
  title?: string;
  description?: string;
  showEssentialBadges?: boolean;
  compact?: boolean;
}

/**
 * A persistent checklist. Progress is stored by listId in localStorage through AppState,
 * so it survives reloads. Items can be grouped and marked essential or optional.
 */
export function Checklist({ listId, items, title, description, showEssentialBadges = true, compact }: ChecklistProps) {
  const { isChecked, toggleItem, setItems } = useAppState();
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const done = ids.filter((id) => isChecked(listId, id)).length;
  const groups = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const item of items) {
      const key = item.group || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()];
  }, [items]);
  const essentialCount = items.filter((i) => i.essential).length;

  return (
    <div>
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="text-[15px] font-semibold text-ink">{title}</h3>}
          {description && <p className="mt-1 text-[13px] leading-5 text-ink-faint">{description}</p>}
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <ProgressBar done={done} total={ids.length} label={done === ids.length && ids.length > 0 ? 'All done' : 'Progress'} className="min-w-[200px] flex-1" />
        <div className="no-print flex gap-2">
          <Button size="sm" variant="ghost" icon="check" onClick={() => setItems(listId, ids, true)} disabled={done === ids.length}>
            Tick all
          </Button>
          <Button size="sm" variant="ghost" icon="rotate-ccw" onClick={() => setItems(listId, ids, false)} disabled={done === 0}>
            Reset
          </Button>
        </div>
      </div>
      {showEssentialBadges && essentialCount > 0 && essentialCount < items.length && (
        <p className="mb-3 text-[12.5px] text-ink-faint">
          <span className="font-medium text-ink-muted">Essential</span> items matter most; the rest are optional suggestions. There is no deadline unless you set one.
        </p>
      )}
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        {groups.map(([group, groupItems]) => (
          <div key={group || 'default'}>
            {group && <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-ink-faint">{group}</div>}
            <ul className={`divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50 ${compact ? '' : ''}`}>
              {groupItems.map((item) => (
                <li key={item.id} className={`flex items-start justify-between gap-3 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
                  <CheckboxField id={`${listId}-${item.id}`} label={item.text} checked={isChecked(listId, item.id)} onChange={() => toggleItem(listId, item.id)} className="min-w-0 flex-1" />
                  {showEssentialBadges && (
                    <span className="print-only">{item.essential ? '(essential)' : ''}</span>
                  )}
                  {showEssentialBadges && item.essential && <Badge tone="sage" className="no-print mt-1 shrink-0">Essential</Badge>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
