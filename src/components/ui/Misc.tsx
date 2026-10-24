import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

/* ---------------------------------------------------------------------- */
/* Note — subtle inline callout (no loud colours)                          */
/* ---------------------------------------------------------------------- */

interface NoteProps {
  children: ReactNode;
  icon?: IconName;
  title?: ReactNode;
  tone?: 'neutral' | 'caution';
  className?: string;
}

export function Note({ children, icon = 'info', title, tone = 'neutral', className = '' }: NoteProps) {
  return (
    <div className={`flex gap-3 rounded-md border-l-2 bg-stone-100 px-4 py-3 text-[13.5px] leading-6 text-ink-muted ${tone === 'caution' ? 'border-clay-500' : 'border-sage-500'} ${className}`}>
      <Icon name={icon} size={16} className={`mt-1 shrink-0 ${tone === 'caution' ? 'text-clay-700' : 'text-sage-700'}`} />
      <div className="min-w-0">
        {title && <div className="font-medium text-ink">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Disclosure — native details/summary with consistent styling            */
/* ---------------------------------------------------------------------- */

interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: IconName;
}

export function Disclosure({ summary, children, defaultOpen, className = '', icon }: DisclosureProps) {
  return (
    <details className={`group rounded-md border border-stone-200 bg-stone-50 ${className}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {icon && <Icon name={icon} size={16} className="text-sage-700" />}
          {summary}
        </span>
        <Icon name="chevron-down" size={16} className="text-ink-faint transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-stone-200 px-4 py-4 text-[14px] leading-6 text-ink-muted">{children}</div>
    </details>
  );
}

/* ---------------------------------------------------------------------- */
/* Badge                                                                   */
/* ---------------------------------------------------------------------- */

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'sage' | 'caution'; className?: string }) {
  const cls = tone === 'sage' ? 'bg-sage-100 text-sage-800' : tone === 'caution' ? 'bg-clay-100 text-clay-700' : 'bg-stone-200 text-ink-muted';
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-medium uppercase tracking-wide ${cls} ${className}`}>{children}</span>;
}

/* ---------------------------------------------------------------------- */
/* EmptyState                                                              */
/* ---------------------------------------------------------------------- */

interface EmptyStateProps {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon = 'compass', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`rounded-lg border border-dashed border-stone-300 px-6 py-10 text-center ${className}`}>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-sage-700">
        <Icon name={icon} size={18} />
      </div>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md text-[13.5px] leading-6 text-ink-faint">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* PageHeader                                                              */
/* ---------------------------------------------------------------------- */

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, breadcrumbs, className = '' }: PageHeaderProps) {
  return (
    <header className={`mb-8 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="no-print mb-3">
          <ol className="flex flex-wrap items-center gap-1 text-[13px] text-ink-faint">
            {breadcrumbs.map((b, i) => (
              <li key={i} className="flex items-center gap-1">
                {b.to ? (
                  <Link to={b.to} className="hover:text-ink">
                    {b.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink-muted">
                    {b.label}
                  </span>
                )}
                {i < breadcrumbs.length - 1 && <Icon name="chevron-right" size={13} className="text-stone-400" />}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          {eyebrow && <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-sage-700">{eyebrow}</div>}
          <h1 className="text-[26px] font-semibold leading-tight sm:text-[32px]">{title}</h1>
          {description && <p className="mt-3 text-[15.5px] leading-7 text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------- */
/* Section heading                                                         */
/* ---------------------------------------------------------------------- */

export function SectionHeading({ title, description, action, as: Tag = 'h2', className = '' }: { title: ReactNode; description?: ReactNode; action?: ReactNode; as?: 'h2' | 'h3'; className?: string }) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <Tag className={`${Tag === 'h2' ? 'text-lg' : 'text-[15px]'} font-semibold text-ink`}>{title}</Tag>
        {description && <p className="mt-1 text-[13.5px] leading-6 text-ink-faint">{description}</p>}
      </div>
      {action && <div className="no-print">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Progress bar                                                            */
/* ---------------------------------------------------------------------- */

export function ProgressBar({ done, total, label, className = '' }: { done: number; total: number; label?: string; className?: string }) {
  const pctValue = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-[12.5px] text-ink-faint">
        <span>{label ?? 'Progress'}</span>
        <span className="tabular-nums">
          {done} of {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label ?? 'Progress'}>
        <div className="h-full rounded-full bg-sage-500 transition-[width]" style={{ width: `${pctValue}%` }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* External link                                                           */
/* ---------------------------------------------------------------------- */

export function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`link inline-flex items-center gap-1 ${className}`}>
      {children}
      <Icon name="external-link" size={13} className="shrink-0" />
    </a>
  );
}
