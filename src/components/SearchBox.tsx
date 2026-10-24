import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { search, type SearchResult } from '@/lib/search';
import { Icon } from './ui/Icon';

interface SearchBoxProps {
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
  initialQuery?: string;
  className?: string;
}

const TYPE_LABEL: Record<SearchResult['type'], string> = { guide: 'Guide', calculator: 'Calculator', tool: 'Tool' };

/** Search field with an accessible suggestion list; Enter goes to the full results page. */
export function SearchBox({ placeholder = 'What are you trying to figure out?', autoFocus, size = 'md', initialQuery = '', className = '' }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const results = query.trim().length > 1 ? search(query, 6) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && results[active]) {
            navigate(results[active].path);
            setOpen(false);
          } else submit();
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search guides, calculators and tools
        </label>
        <div className="relative">
          <Icon name="search" size={size === 'lg' ? 20 : 16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            id={`${listId}-input`}
            type="search"
            autoComplete="off"
            autoFocus={autoFocus}
            className={`field-input ${size === 'lg' ? 'py-3.5 pl-12 pr-4 text-[16px]' : 'py-2.5 pl-10 pr-4'}`}
            placeholder={placeholder}
            value={query}
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(results.length - 1, a + 1));
                setOpen(true);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(-1, a - 1));
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
          />
        </div>
      </form>
      {open && results.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-stone-300 bg-stone-50 shadow-soft">
          {results.map((r, i) => (
            <li key={`${r.type}-${r.id}`} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active}>
              <Link
                to={r.path}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${i === active ? 'bg-sage-50' : 'hover:bg-stone-100'}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{r.title}</span>
                  <span className="block truncate text-[12.5px] text-ink-faint">{r.categoryName}</span>
                </span>
                <span className="shrink-0 text-[11.5px] uppercase tracking-wide text-ink-faint">{TYPE_LABEL[r.type]}</span>
              </Link>
            </li>
          ))}
          <li className="border-t border-stone-200">
            <button type="button" onClick={submit} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-sage-800 hover:bg-stone-100">
              <Icon name="arrow-right" size={14} />
              See all results for “{query.trim()}”
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
