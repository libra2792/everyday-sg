import { useId, useState } from 'react';
import type { QuickAnswers, QuickCheck as QuickCheckSpec, QuickField, QuickResult } from '@/data/types';
import { BENCHMARKS, type Benchmark } from '@/data/benchmarks';
import { num } from '@/lib/quick';
import { BenchmarkHint } from './ui/BenchmarkHint';
import { Icon } from './ui/Icon';
import { GuideLinkCard, OfficialLinkCard, ToolTile, type FromRef } from './LinkTiles';

interface QuickCheckProps {
  spec: QuickCheckSpec;
  answers: QuickAnswers;
  onChange: (next: QuickAnswers) => void;
  result: QuickResult;
  from: FromRef;
  guideId: string;
}

function ChoiceField({ field, value, onChange, guideId }: { field: Extract<QuickField, { type: 'choice' }>; value: string; onChange: (v: string) => void; guideId: string }) {
  const name = `${guideId}-${field.id}`;
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-[13.5px] font-medium text-ink">{field.label}</legend>
      <div className="flex flex-wrap gap-1.5" role="radiogroup">
        {field.options.map((o) => {
          const active = o.value === value;
          return (
            <label
              key={o.value}
              className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-[13px] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-sage-600 has-focus-visible:ring-offset-1 has-focus-visible:ring-offset-canvas ${active ? 'border-sage-600 bg-sage-50 text-ink' : 'border-stone-300 bg-stone-50 text-ink-muted hover:border-stone-400'}`}
            >
              <input type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function NumberInput({
  field,
  value,
  onChange,
}: {
  field: Extract<QuickField, { type: 'money' | 'number' }>;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value === undefined ? '' : String(value));
  const [focused, setFocused] = useState(false);
  const shown = focused ? text : value === undefined ? '' : String(value);
  const prefix = field.type === 'money' ? 'S$' : undefined;
  const suffix = field.type === 'number' ? field.suffix : undefined;
  const bench: Benchmark | undefined = field.benchmark ? (BENCHMARKS as Record<string, Benchmark>)[field.benchmark] : undefined;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-medium text-ink">
        {field.label}
      </label>
      <div className="relative max-w-[220px]">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-faint">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={`field-input !py-1.5 text-[14px] tabular-nums ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-16' : ''}`}
          placeholder="0"
          value={shown}
          onFocus={() => {
            setText(value === undefined ? '' : String(value));
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            setText(e.target.value);
            const n = num(e.target.value);
            onChange(e.target.value.trim() === '' ? undefined : n);
          }}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-faint">{suffix}</span>}
      </div>
      {field.help && <p className="mt-1 text-[12.5px] leading-5 text-ink-faint">{field.help}</p>}
      {bench && <BenchmarkHint benchmark={bench} current={value} onUse={(v) => onChange(v)} format={(n) => (field.type === 'money' ? `S$${n.toLocaleString('en-SG')}` : `${n.toLocaleString('en-SG')}${suffix ? ` ${suffix}` : ''}`)} />}
    </div>
  );
}

/**
 * "Your situation": a few questions or numbers at the top of a guide that turn into a
 * tailored pointer, with the next step handed straight to a calculator or another guide.
 */
export function QuickCheck({ spec, answers, onChange, result, from, guideId }: QuickCheckProps) {
  const set = (id: string, v: string | number | undefined) => onChange({ ...answers, [id]: v });
  return (
    <section aria-labelledby={`quick-${guideId}`} className="overflow-hidden rounded-lg border border-sage-300 bg-stone-50">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-b border-sage-200 bg-sage-50 px-4 py-3.5 sm:px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-sage-300 bg-stone-50 text-sage-800" aria-hidden>
          <Icon name="sliders-horizontal" size={16} />
        </span>
        <h2 id={`quick-${guideId}`} className="text-[17px] font-semibold text-ink">
          Your situation
        </h2>
        <p className="basis-full text-[13px] leading-5 text-ink-muted">{spec.intro}</p>
      </div>
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          {spec.fields.map((f) =>
            f.type === 'choice' ? (
              <ChoiceField key={f.id} field={f} guideId={guideId} value={String(answers[f.id] ?? f.default)} onChange={(v) => set(f.id, v)} />
            ) : (
              <NumberInput key={f.id} field={f} value={answers[f.id] === undefined ? undefined : num(answers[f.id])} onChange={(v) => set(f.id, v)} />
            ),
          )}
        </form>
        <div className="grid min-w-0 content-start gap-3 rounded-md bg-stone-100 p-4" aria-live="polite">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-sage-800">{result.label}</span>
          <h3 className="text-[20px] font-semibold leading-tight text-ink">{result.verdict}</h3>
          {result.stats && result.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5">
              {result.stats.map((s) => (
                <div key={s.label} className="min-w-0 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-2">
                  <span className="block text-[11.5px] text-ink-faint">{s.label}</span>
                  <b className="text-[17px] font-semibold tabular-nums text-ink">{s.value}</b>
                </div>
              ))}
            </div>
          )}
          <ul className="grid gap-1.5 text-[13.5px] leading-5 text-ink-muted">
            {result.why.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-sage-600">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
          {result.next.length > 0 && (
            <div className="grid gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-faint">Do next</span>
              {result.next.map((n, i) =>
                n.kind === 'tool' ? <ToolTile key={i} id={n.id} note={n.note} prefill={n.prefill} from={from} /> : n.kind === 'guide' ? <GuideLinkCard key={i} id={n.id} note={n.note} from={from} /> : <OfficialLinkCard key={i} id={n.id} note={n.note} />,
              )}
            </div>
          )}
          <p className="border-t border-stone-200 pt-2.5 text-[12px] leading-5 text-ink-faint">{result.fine}</p>
        </div>
      </div>
    </section>
  );
}
