import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  muted?: boolean;
  id?: string;
  as?: 'section' | 'div' | 'aside';
  padding?: 'md' | 'lg' | 'none';
}

/** A quiet bordered surface with an optional heading row. */
export function Panel({ title, description, icon, actions, children, className = '', muted, id, as: Tag = 'section', padding = 'md' }: PanelProps) {
  const pad = padding === 'none' ? '' : padding === 'lg' ? 'p-6 sm:p-7' : 'p-5';
  return (
    <Tag id={id} className={`${muted ? 'surface-muted' : 'surface'} ${pad} ${className}`} aria-labelledby={title && id ? `${id}-title` : undefined}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 id={id ? `${id}-title` : undefined} className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                {icon && <Icon name={icon} size={17} className="text-sage-700" />}
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-[13px] leading-5 text-ink-faint">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Tag>
  );
}

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'neutral' | 'positive' | 'caution';
  size?: 'md' | 'lg';
  className?: string;
}

/** A labelled result figure. Tone is expressed with restraint (text colour only). */
export function Stat({ label, value, hint, tone = 'neutral', size = 'md', className = '' }: StatProps) {
  const toneCls = tone === 'positive' ? 'text-sage-800' : tone === 'caution' ? 'text-clay-700' : 'text-ink';
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[13px] leading-5 text-ink-faint">{label}</div>
      <div className={`${size === 'lg' ? 'text-2xl sm:text-[28px]' : 'text-lg'} mt-0.5 font-semibold tabular-nums tracking-tight ${toneCls}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[13px] leading-5 text-ink-faint">{hint}</div>}
    </div>
  );
}

export function StatGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 ${className}`}>{children}</div>;
}

interface DefinitionListProps {
  rows: { label: ReactNode; value: ReactNode; emphasis?: boolean; tone?: 'neutral' | 'positive' | 'caution' }[];
  className?: string;
  dense?: boolean;
}

/** Compact label/value rows with hairline dividers — used for breakdowns and assumptions. */
export function DefinitionList({ rows, className = '', dense }: DefinitionListProps) {
  return (
    <dl className={`divide-y divide-stone-200 ${className}`}>
      {rows.map((r, i) => (
        <div key={i} className={`flex items-baseline justify-between gap-4 ${dense ? 'py-1.5' : 'py-2.5'}`}>
          <dt className={`text-[14px] ${r.emphasis ? 'font-medium text-ink' : 'text-ink-muted'}`}>{r.label}</dt>
          <dd className={`shrink-0 text-right text-[14px] tabular-nums ${r.emphasis ? 'font-semibold' : ''} ${r.tone === 'caution' ? 'text-clay-700' : r.tone === 'positive' ? 'text-sage-800' : 'text-ink'}`}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
