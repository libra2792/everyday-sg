import { useEffect, useId, useRef, useState } from 'react';
import { THEMES, type ThemeId } from '@/lib/theme';
import { useAppState } from '@/state/AppState';
import { Icon } from './ui/Icon';

function Swatch({ colours, className = '' }: { colours: [string, string]; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 ${className}`}
      style={{ background: `linear-gradient(135deg, ${colours[0]} 50%, ${colours[1]} 50%)` }}
    />
  );
}

/** Radio-style list of the four themes, used in My Plan and the footer. */
export function ThemeOptions({ compact }: { compact?: boolean }) {
  const { theme, setTheme } = useAppState();
  const name = useId();
  return (
    <div role="radiogroup" aria-label="Appearance" className={compact ? 'flex flex-wrap gap-1.5' : 'grid gap-2 sm:grid-cols-2'}>
      {THEMES.map((t) => {
        const active = t.id === theme;
        return (
          <label
            key={t.id}
            className={`flex cursor-pointer items-start gap-2.5 rounded-md border transition-colors has-focus-visible:ring-2 has-focus-visible:ring-sage-600 ${compact ? 'px-2.5 py-1.5 text-[13px]' : 'p-3 text-[14px]'} ${active ? 'border-sage-600 bg-sage-50 text-ink' : 'border-stone-300 bg-stone-50 text-ink-muted hover:border-stone-400'}`}
          >
            <input type="radio" name={name} className="sr-only" checked={active} onChange={() => setTheme(t.id)} />
            <Swatch colours={t.swatch} className={compact ? 'mt-[3px]' : 'mt-1'} />
            <span className="min-w-0">
              <span className="block font-medium">{t.name}</span>
              {!compact && <span className="block text-[12.5px] leading-5 text-ink-faint">{t.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Compact header control: a button that opens a small menu of themes. */
export function ThemeMenu() {
  const { theme, setTheme } = useAppState();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (id: ThemeId) => {
    setTheme(id);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-2.5 py-2 text-sm text-ink-muted hover:border-stone-400 hover:text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Appearance: ${active.name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Swatch colours={active.swatch} />
        <span className="hidden lg:inline">{active.name}</span>
        <Icon name="chevron-down" size={14} />
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label="Appearance" className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-lg border border-stone-300 bg-stone-50 p-1 shadow-soft">
          <div className="px-2.5 pb-1 pt-1.5 text-[11.5px] font-medium uppercase tracking-wider text-ink-faint">Appearance</div>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={t.id === theme}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm ${t.id === theme ? 'bg-sage-50 text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`}
              onClick={() => choose(t.id)}
            >
              <Swatch colours={t.swatch} />
              <span className="flex-1">{t.name}</span>
              {t.id === theme && <Icon name="check" size={14} className="text-sage-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
