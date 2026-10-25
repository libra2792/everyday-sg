import type { Benchmark } from '@/data/benchmarks';
import { SOURCE_MAP } from '@/data/sources';
import { formatDate } from '@/lib/format';
import { Icon } from './Icon';

interface BenchmarkHintProps {
  benchmark: Benchmark;
  /** Called with the benchmark value when the person presses "Use". */
  onUse?: (value: number) => void;
  /** Formats the value for the button, e.g. S$3,950 or 25%. */
  format?: (n: number) => string;
  /** The field's current value, so the button can show "Applied". */
  current?: number;
  /** Optional override for the button's value (e.g. a figure derived from another input). */
  value?: number;
  className?: string;
}

/**
 * A compact "what is typical" line under a calculator input. Official statistics are
 * labelled as such with their source and the date the source was read; rules of thumb are
 * labelled as planning guides so nobody mistakes them for data.
 */
export function BenchmarkHint({ benchmark, onUse, format, current, value, className = '' }: BenchmarkHintProps) {
  const source = benchmark.sourceId ? SOURCE_MAP[benchmark.sourceId] : undefined;
  const isStat = benchmark.kind === 'statistic';
  const useValue = value ?? benchmark.value;
  const applied = useValue !== undefined && current !== undefined && Math.abs(current - useValue) < 1e-9;
  const formatted = useValue === undefined ? '' : format ? format(useValue) : useValue.toLocaleString('en-SG');

  return (
    <div className={`mt-2 flex gap-2.5 rounded-md bg-stone-100 px-3 py-2 text-[12.5px] leading-5 text-ink-muted ${className}`}>
      <Icon name={isStat ? 'chart-column' : 'lightbulb'} size={14} className="mt-[3px] shrink-0 text-sage-700" aria-hidden />
      <p className="min-w-0 flex-1">
        <span className="font-medium text-ink">{isStat ? 'Official figure' : 'Planning guide'}: </span>
        {benchmark.text}
        {source && (
          <>
            {' '}
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="link whitespace-nowrap">
              {source.agency} source
              <Icon name="external-link" size={11} className="ml-0.5 inline-block align-[-1px]" />
            </a>
            {benchmark.checkedOn && <span className="text-ink-faint"> · read {formatDate(benchmark.checkedOn)}</span>}
          </>
        )}
        {onUse && useValue !== undefined && (
          <>
            {' '}
            <button
              type="button"
              onClick={() => onUse(useValue)}
              disabled={applied}
              className="ml-1 inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-stone-300 bg-stone-50 px-2 py-px align-[1px] text-[12px] font-medium text-sage-800 transition-colors hover:border-sage-400 hover:bg-sage-50 disabled:cursor-default disabled:opacity-60 disabled:hover:border-stone-300 disabled:hover:bg-stone-50"
              aria-label={applied ? `${formatted} applied` : `Use ${formatted}`}
            >
              {applied ? (
                <>
                  <Icon name="check" size={12} aria-hidden />
                  Applied
                </>
              ) : (
                `Use ${formatted}`
              )}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
