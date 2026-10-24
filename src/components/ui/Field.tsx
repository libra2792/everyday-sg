import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { clamp } from '@/lib/format';

/* ---------------------------------------------------------------------- */
/* Shared pieces                                                           */
/* ---------------------------------------------------------------------- */

export function FieldLabel({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {children}
      </label>
      {hint && <span className="text-xs text-ink-faint tabular-nums">{hint}</span>}
    </div>
  );
}

export function FieldHelp({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-[13px] leading-5 text-ink-faint">
      {children}
    </p>
  );
}

function useNumberText(value: number, format?: (n: number) => string) {
  const [text, setText] = useState(() => (format ? format(value) : String(value)));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setText(format ? format(value) : String(value));
  }, [value, format]);
  return { text, setText, focused };
}

/* ---------------------------------------------------------------------- */
/* NumberField                                                             */
/* ---------------------------------------------------------------------- */

interface NumberFieldProps {
  id?: string;
  label: ReactNode;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  help?: ReactNode;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  allowNegative?: boolean;
  'aria-label'?: string;
}

export function NumberField({ id, label, value, onChange, min, max, step = 1, prefix, suffix, help, placeholder, className = '', compact, allowNegative = false }: NumberFieldProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const helpId = `${fieldId}-help`;
  const { text, setText, focused } = useNumberText(value);
  const lower = min ?? (allowNegative ? Number.NEGATIVE_INFINITY : 0);
  const upper = max ?? Number.POSITIVE_INFINITY;
  const invalid = text.trim() !== '' && !Number.isFinite(Number(text));

  const commit = (raw: string) => {
    setText(raw);
    if (raw.trim() === '' || raw === '-' || raw === '.') {
      onChange(lower === Number.NEGATIVE_INFINITY ? 0 : Math.max(0, lower));
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(clamp(n, lower, upper));
  };

  return (
    <div className={className}>
      {!compact && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-faint">{prefix}</span>}
        <input
          id={fieldId}
          type="number"
          inputMode="decimal"
          className={`field-input tabular-nums ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-12' : ''}`}
          value={text}
          min={Number.isFinite(lower) ? lower : undefined}
          max={Number.isFinite(upper) ? upper : undefined}
          step={step}
          placeholder={placeholder}
          aria-label={compact ? (typeof label === 'string' ? label : undefined) : undefined}
          aria-describedby={help ? helpId : undefined}
          aria-invalid={invalid ? 'true' : undefined}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={() => {
            focused.current = false;
            setText(String(value));
          }}
          onChange={(e) => commit(e.target.value)}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-faint">{suffix}</span>}
      </div>
      {help && <FieldHelp id={helpId}>{help}</FieldHelp>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SliderField — number input and range input, always in sync             */
/* ---------------------------------------------------------------------- */

interface SliderFieldProps {
  id?: string;
  label: ReactNode;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  help?: ReactNode;
  format?: (n: number) => string;
  className?: string;
  /** Allow typing values above the slider's max (slider pins at max). */
  allowAboveMax?: boolean;
}

export function SliderField({ id, label, value, onChange, min, max, step = 1, prefix, suffix, help, format, className = '', allowAboveMax = true }: SliderFieldProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const sliderId = `${fieldId}-slider`;
  const helpId = `${fieldId}-help`;
  const { text, setText, focused } = useNumberText(value);
  const upper = allowAboveMax ? Number.POSITIVE_INFINITY : max;
  const display = format ? format(value) : `${prefix ?? ''}${value.toLocaleString('en-SG')}${suffix ? ` ${suffix}` : ''}`;

  const commitText = (raw: string) => {
    setText(raw);
    if (raw.trim() === '' || raw === '-' || raw === '.') {
      onChange(Math.max(0, min));
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(clamp(n, Math.min(0, min), upper));
  };

  return (
    <div className={className}>
      <FieldLabel htmlFor={fieldId} hint={display}>
        {label}
      </FieldLabel>
      <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] items-center gap-3">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamp(value, min, max)}
          aria-label={typeof label === 'string' ? `${label} slider` : 'slider'}
          aria-valuetext={display}
          aria-describedby={help ? helpId : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="relative">
          {prefix && <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-ink-faint">{prefix}</span>}
          <input
            id={fieldId}
            type="number"
            inputMode="decimal"
            className={`field-input !py-1.5 text-sm tabular-nums ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-8' : ''}`}
            value={text}
            min={Math.min(0, min)}
            step={step}
            aria-describedby={help ? helpId : undefined}
            onFocus={() => {
              focused.current = true;
            }}
            onBlur={() => {
              focused.current = false;
              setText(String(value));
            }}
            onChange={(e) => commitText(e.target.value)}
          />
          {suffix && <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-ink-faint">{suffix}</span>}
        </div>
      </div>
      {help && <FieldHelp id={helpId}>{help}</FieldHelp>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SelectField                                                             */
/* ---------------------------------------------------------------------- */

interface SelectFieldProps<T extends string> {
  id?: string;
  label: ReactNode;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  help?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function SelectField<T extends string>({ id, label, value, onChange, options, help, className = '', compact }: SelectFieldProps<T>) {
  const autoId = useId();
  const fieldId = id || autoId;
  const helpId = `${fieldId}-help`;
  return (
    <div className={className}>
      {!compact && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
      <div className="relative">
      <select
        id={fieldId}
        className="field-input field-select"
        value={value}
        aria-label={compact && typeof label === 'string' ? label : undefined}
        aria-describedby={help ? helpId : undefined}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
      </div>
      {help && <FieldHelp id={helpId}>{help}</FieldHelp>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* TextField / DateField                                                   */
/* ---------------------------------------------------------------------- */

interface TextFieldProps {
  id?: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'date' | 'search';
  placeholder?: string;
  help?: ReactNode;
  className?: string;
  compact?: boolean;
  maxLength?: number;
}

export function TextField({ id, label, value, onChange, type = 'text', placeholder, help, className = '', compact, maxLength }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  const helpId = `${fieldId}-help`;
  return (
    <div className={className}>
      {!compact && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
      <input
        id={fieldId}
        type={type}
        className="field-input"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={compact && typeof label === 'string' ? label : undefined}
        aria-describedby={help ? helpId : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {help && <FieldHelp id={helpId}>{help}</FieldHelp>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* CheckboxField                                                           */
/* ---------------------------------------------------------------------- */

interface CheckboxFieldProps {
  id?: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: ReactNode;
  className?: string;
}

export function CheckboxField({ id, label, checked, onChange, description, className = '' }: CheckboxFieldProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <label htmlFor={fieldId} className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input
        id={fieldId}
        type="checkbox"
        className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-stone-400 accent-sage-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className={`block text-[15px] leading-6 ${checked ? 'text-ink-faint line-through decoration-stone-400' : 'text-ink'}`}>{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-5 text-ink-faint">{description}</span>}
      </span>
    </label>
  );
}

/* ---------------------------------------------------------------------- */
/* Segmented choice (radio group)                                          */
/* ---------------------------------------------------------------------- */

interface SegmentedProps<T extends string> {
  label: ReactNode;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; description?: string }[];
  help?: ReactNode;
  className?: string;
}

export function Segmented<T extends string>({ label, value, onChange, options, help, className = '' }: SegmentedProps<T>) {
  const groupId = useId();
  return (
    <fieldset className={className}>
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-describedby={help ? `${groupId}-help` : undefined}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <label
              key={o.value}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-sage-600 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-canvas ${active ? 'border-sage-600 bg-sage-50 text-ink' : 'border-stone-300 bg-stone-50 text-ink-muted hover:border-stone-400'}`}
            >
              <input type="radio" name={groupId} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
              {o.label}
            </label>
          );
        })}
      </div>
      {help && <FieldHelp id={`${groupId}-help`}>{help}</FieldHelp>}
    </fieldset>
  );
}
