import { useState, type ReactNode } from 'react';
import { CALCULATOR_MAP } from '@/data/calculators';
import { GUIDE_MAP } from '@/data/guides';
import { useAppState } from '@/state/AppState';
import { Button } from '@/components/ui/Button';
import { Disclosure, Note, PageHeader, SectionHeading } from '@/components/ui/Misc';
import { GuideCard } from '@/components/GuideCard';
import { SaveButton } from '@/components/SaveButton';
import { SourceNote } from '@/components/SourceNote';

interface CalculatorShellProps {
  id: string;
  children: ReactNode; // inputs
  results: ReactNode;
  assumptions?: ReactNode;
  methodology?: ReactNode;
  onReset: () => void;
  snapshot?: { label: string; value: string }[];
  /** One or two headline figures shown in a compact strip on small screens while editing inputs. Defaults to the first two snapshot rows. */
  headline?: { label: string; value: string }[];
  sourceIds?: string[];
  relatedGuides?: string[];
  intro?: ReactNode;
  caveat?: ReactNode;
}

/**
 * Consistent frame for every calculator: header with actions, inputs on the left,
 * results near the inputs (sticky on wide screens), then assumptions, methodology,
 * sources and related guides.
 */
export function CalculatorShell({ id, children, results, assumptions, methodology, onReset, snapshot, headline, sourceIds = [], relatedGuides = [], intro, caveat }: CalculatorShellProps) {
  const meta = CALCULATOR_MAP[id];
  const { addSnapshot } = useAppState();
  const [savedFlash, setSavedFlash] = useState(false);
  const [resetFlash, setResetFlash] = useState(false);
  const strip = (headline ?? snapshot ?? []).slice(0, 2);

  const saveSnapshot = () => {
    if (!snapshot || snapshot.length === 0) return;
    addSnapshot({ refId: id, title: `${meta.shortName} — ${new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`, subtitle: meta.name, path: meta.path, snapshot });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };
  const handleReset = () => {
    onReset();
    setResetFlash(true);
    setTimeout(() => setResetFlash(false), 2000);
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: meta.kind === 'tool' ? 'Tools' : 'Calculators', to: '/calculators' }, { label: meta.shortName }]}
        eyebrow={meta.kind === 'tool' ? 'Tool' : 'Calculator'}
        title={meta.name}
        description={intro ?? meta.description}
        actions={
          <>
            <SaveButton type={meta.kind} refId={id} title={meta.name} subtitle={meta.description} path={meta.path} size="sm" />
            {snapshot && (
              <Button size="sm" variant="ghost" icon="save" onClick={saveSnapshot}>
                {savedFlash ? 'Saved to My Plan' : 'Save results'}
              </Button>
            )}
            <Button size="sm" variant="ghost" icon="printer" onClick={() => window.print()}>
              Print
            </Button>
            <Button size="sm" variant="ghost" icon="rotate-ccw" onClick={handleReset}>
              {resetFlash ? 'Reset done' : 'Reset inputs'}
            </Button>
          </>
        }
      />
      {caveat && <Note className="mb-6">{caveat}</Note>}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="order-2 min-w-0 space-y-6 lg:order-none">{children}</div>
        <aside className="order-1 min-w-0 lg:order-none lg:sticky lg:top-24" aria-label="Results">
          {results}
        </aside>
      </div>
      {strip.length > 0 && (
        <div
          className="no-print fixed inset-x-0 z-20 border-t border-stone-300 bg-stone-50/95 px-4 py-2 backdrop-blur lg:hidden"
          style={{ bottom: 'calc(3.75rem + env(safe-area-inset-bottom))' }}
          aria-hidden
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            {strip.map((s) => (
              <div key={s.label} className="min-w-0">
                <div className="truncate text-[11px] uppercase tracking-wider text-ink-faint">{s.label}</div>
                <div className="truncate text-[15px] font-semibold tabular-nums text-ink">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-10 space-y-3">
        {assumptions && (
          <Disclosure summary="Assumptions behind these figures" icon="sliders-horizontal">
            {assumptions}
          </Disclosure>
        )}
        {methodology && (
          <Disclosure summary="How the calculation works" icon="info">
            {methodology}
          </Disclosure>
        )}
      </div>
      <div className="mt-8">
        <SourceNote sourceIds={sourceIds} infoType="general" title="Sources and disclaimer" />
      </div>
      {relatedGuides.length > 0 && (
        <section className="mt-10">
          <SectionHeading title="Related guides" />
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedGuides.map((gid) => GUIDE_MAP[gid]).filter(Boolean).map((g) => (
              <GuideCard key={g.id} guide={g} compact />
            ))}
          </div>
        </section>
      )}
      <p className="mt-6 text-[12.5px] text-ink-faint">Your inputs are saved in this browser only, so you can come back later. Use “Reset inputs” to clear them.</p>
      {strip.length > 0 && <div className="h-14 lg:hidden" aria-hidden />}
    </div>
  );
}

export function ResultsPanel({ title = 'Results', children, footer }: { title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-stone-50 p-5 shadow-soft">
      <h2 className="mb-4 text-[13px] font-medium uppercase tracking-wider text-ink-faint">{title}</h2>
      <div aria-live="polite" className="space-y-5">
        {children}
      </div>
      {footer && <div className="mt-5 border-t border-stone-200 pt-4 text-[12.5px] leading-5 text-ink-faint">{footer}</div>}
    </div>
  );
}

export function InputGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="surface p-5">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-[13px] leading-5 text-ink-faint">{description}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}
