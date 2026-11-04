import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CREATOR } from '@/data/creator';
import { Button } from '@/components/ui/Button';
import { FieldHelp, FieldLabel } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Note, PageHeader } from '@/components/ui/Misc';

/**
 * The feedback form, received by Netlify Forms. Netlify finds the form in the prerendered
 * /feedback page when the site is deployed (so every field must be in the HTML from the
 * start), and stores each submission for the site owner, who can have them emailed.
 * This is the one place on the site where what someone types is sent anywhere.
 */
export const FEEDBACK_FORM_NAME = 'feedback';

const TOPICS = [
  { value: 'suggestion', label: 'An idea or suggestion' },
  { value: 'mistake', label: 'Something is wrong or out of date' },
  { value: 'question', label: 'A question' },
  { value: 'other', label: 'Something else' },
];

export interface FeedbackFields {
  topic: string;
  page: string;
  message: string;
  name: string;
  email: string;
  phone: string;
}

const EMPTY: FeedbackFields = { topic: 'suggestion', page: '', message: '', name: '', email: '', phone: '' };
const MESSAGE_MAX = 3000;

type Errors = Partial<Record<keyof FeedbackFields, string>>;

/** Only the message is required; contact details are optional but must look usable if given. */
export function validateFeedback(f: FeedbackFields): Errors {
  const errors: Errors = {};
  if (f.message.trim().length < 5) errors.message = 'Please write a few words of feedback.';
  const email = f.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'That email address looks incomplete, for example name@example.com.';
  const phone = f.phone.trim();
  const digits = phone.replace(/\D/g, '').length;
  if (phone && (!/^\+?[\d\s()-]+$/.test(phone) || digits < 8 || digits > 15)) errors.phone = 'Enter a number of 8 to 15 digits, such as 9123 4567 or +65 9123 4567.';
  return errors;
}

async function sendFeedback(f: FeedbackFields, botField: string): Promise<void> {
  const body = new URLSearchParams({
    'form-name': FEEDBACK_FORM_NAME,
    'bot-field': botField,
    topic: TOPICS.find((t) => t.value === f.topic)?.label ?? f.topic,
    page: f.page.trim(),
    message: f.message.trim(),
    name: f.name.trim(),
    email: f.email.trim(),
    phone: f.phone.trim(),
  });
  // Only Netlify can receive the form. The dev server has nowhere to send it, so it says so.
  if (import.meta.env.DEV) {
    console.info('[feedback] not sent from the dev server; deployed, this goes to Netlify Forms:', Object.fromEntries(body));
    return;
  }
  const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
  if (!res.ok) throw new Error(`Feedback form returned ${res.status}`);
}

function Field({ id, label, optional, error, help, children }: { id: string; label: string; optional?: boolean; error?: string; help?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <FieldLabel htmlFor={id}>
        {label}
        {optional && (
          <>
            {' '}
            <span className="font-normal text-ink-faint">(optional)</span>
          </>
        )}
      </FieldLabel>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-5 text-clay-700">
          <Icon name="circle-alert" size={14} className="mt-[3px] shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        help && <FieldHelp id={`${id}-help`}>{help}</FieldHelp>
      )}
    </div>
  );
}

export function Feedback() {
  const [fields, setFields] = useState<FeedbackFields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [sentTo, setSentTo] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const botRef = useRef<HTMLInputElement>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);

  // The thank-you is much shorter than the form: bring it into view, and to screen readers.
  useEffect(() => {
    if (status === 'sent') thanksRef.current?.focus();
  }, [status]);

  const set = (key: keyof FeedbackFields) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  // Error text replaces the help text, so the field points at whichever is showing.
  const describe = (key: keyof FeedbackFields, hasHelp = false) => (errors[key] ? `fb-${key}-error` : hasHelp ? `fb-${key}-help` : undefined);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateFeedback(fields);
    setErrors(found);
    const first = (Object.keys(found) as (keyof FeedbackFields)[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#fb-${first}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      await sendFeedback(fields, botRef.current?.value ?? '');
      setSentTo(fields.email.trim() || fields.phone.trim());
      setFields(EMPTY);
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Feedback"
        title="Tell me what to fix or add"
        description="Spotted a mistake, missing a topic, or found something useful? I read every message, and corrections go to the top of the list."
      />

      {status === 'sent' ? (
        <section className="surface p-6 sm:p-8" aria-live="polite">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-100 text-sage-800" aria-hidden>
            <Icon name="check" size={22} strokeWidth={2.2} />
          </span>
          <h2 ref={thanksRef} tabIndex={-1} className="mt-4 scroll-mt-24 text-[20px] font-semibold text-ink outline-none">
            Thank you, it’s on its way
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-ink-muted">
            {sentTo ? `If it needs a reply, I’ll get back to you at ${sentTo}.` : 'You did not leave a way to reach you, so I won’t be able to reply, but I will read it.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" icon="pencil" onClick={() => setStatus('idle')}>
              Send another
            </Button>
            <Link to="/guides" className="inline-flex items-center gap-1.5 self-center text-[14px] text-sage-800 hover:underline">
              Back to the guides
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </section>
      ) : (
        <>
          <Note icon="lock-keyhole" title="This form is the one thing on the site that sends what you type" className="mb-6">
            Your message, and the name, email or number if you add them, go to me through Netlify, the site’s host. I use your details only to reply to you; they are
            not shared or added to any mailing list. Nothing else you have entered on Everyday SG is included.
          </Note>

          <form
            ref={formRef}
            name={FEEDBACK_FORM_NAME}
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={submit}
            noValidate
            className="surface space-y-5 p-5 sm:p-6"
          >
            <input type="hidden" name="form-name" value={FEEDBACK_FORM_NAME} />
            {/* A field people never see: bots that fill in every input give themselves away. */}
            <p className="hidden" aria-hidden>
              <label>
                Leave this empty: <input ref={botRef} name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="fb-topic" label="What is it about?">
                <div className="relative">
                  <select id="fb-topic" name="topic" className="field-input field-select" value={fields.topic} onChange={set('topic')}>
                    {TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" size={16} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                </div>
              </Field>
              <Field id="fb-page" label="Which page or topic?" optional>
                <input id="fb-page" name="page" className="field-input" value={fields.page} onChange={set('page')} placeholder="e.g. Parent Relief, housing calculator" maxLength={200} />
              </Field>
            </div>

            <Field id="fb-message" label="Your feedback" error={errors.message} help={`Up to ${MESSAGE_MAX.toLocaleString('en-SG')} characters.`}>
              <textarea
                id="fb-message"
                name="message"
                rows={6}
                className="field-input min-h-[140px] resize-y leading-6"
                value={fields.message}
                onChange={set('message')}
                maxLength={MESSAGE_MAX}
                required
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={describe('message', true)}
              />
            </Field>

            <fieldset className="space-y-4 border-t border-stone-200 pt-5">
              <legend className="float-left mb-1 w-full text-[15px] font-semibold text-ink">How can I reach you?</legend>
              <p className="clear-left text-[13px] leading-5 text-ink-faint">All optional. Leave an email or a number if you would like a reply.</p>
              <Field id="fb-name" label="Name" optional>
                <input id="fb-name" name="name" className="field-input" value={fields.name} onChange={set('name')} autoComplete="name" maxLength={100} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="fb-email" label="Email" optional error={errors.email}>
                  <input
                    id="fb-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="field-input"
                    value={fields.email}
                    onChange={set('email')}
                    maxLength={200}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={describe('email')}
                  />
                </Field>
                <Field id="fb-phone" label="Contact number" optional error={errors.phone}>
                  <input
                    id="fb-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="field-input"
                    value={fields.phone}
                    onChange={set('phone')}
                    placeholder="e.g. 9123 4567"
                    maxLength={30}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={describe('phone')}
                  />
                </Field>
              </div>
            </fieldset>

            {status === 'failed' && (
              <Note tone="caution" icon="circle-alert" title="That did not go through">
                Your message is still here. Please try again in a moment, or message me on{' '}
                {CREATOR.socials.map((s, i) => (
                  <span key={s.id}>
                    {i > 0 && ' or '}
                    <a href={s.url} target="_blank" rel="me noopener noreferrer" className="link inline-flex items-center gap-1">
                      <BrandIcon name={s.brand} size={12} />
                      {s.label}
                    </a>
                  </span>
                ))}
                .
              </Note>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button type="submit" variant="primary" icon="mail" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send feedback'}
              </Button>
              <span className="text-[13px] text-ink-faint">Goes to Nigel only.</span>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
