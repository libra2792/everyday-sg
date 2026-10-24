import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMPTY_PROFILE, PRIORITY_OPTIONS, useAppState, type AgeRange, type Employment, type Horizon, type Household, type HousingSituation, type Profile, type Residency } from '@/state/AppState';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Misc';

function OptionGroup<T extends string>({ label, help, value, options, onChange }: { label: string; help?: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="surface p-5">
      <legend className="sr-only">{label}</legend>
      <div className="text-[15px] font-semibold text-ink">{label}</div>
      {help && <p className="mt-1 text-[13px] text-ink-faint">{help}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <label key={o.value} className={`cursor-pointer rounded-md border px-3 py-2 text-[14px] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-sage-600 ${active ? 'border-sage-600 bg-sage-50 text-ink' : 'border-stone-300 bg-stone-50 text-ink-muted hover:border-stone-400'}`}>
              <input type="radio" name={label} className="sr-only" checked={active} onChange={() => onChange(o.value)} />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function MultiGroup<T extends string>({ label, help, values, options, onChange }: { label: string; help?: string; values: T[]; options: { value: T; label: string }[]; onChange: (v: T[]) => void }) {
  const toggle = (v: T) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <fieldset className="surface p-5">
      <legend className="sr-only">{label}</legend>
      <div className="text-[15px] font-semibold text-ink">{label}</div>
      {help && <p className="mt-1 text-[13px] text-ink-faint">{help}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = values.includes(o.value);
          return (
            <label key={o.value} className={`cursor-pointer rounded-md border px-3 py-2 text-[14px] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-sage-600 ${active ? 'border-sage-600 bg-sage-50 text-ink' : 'border-stone-300 bg-stone-50 text-ink-muted hover:border-stone-400'}`}>
              <input type="checkbox" className="sr-only" checked={active} onChange={() => toggle(o.value)} />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProfilePage() {
  const { profile, setProfile, clearProfile, dismissProfile } = useAppState();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Profile>(profile ?? EMPTY_PROFILE);
  const answered = [draft.ageRange, draft.residency, draft.housing, draft.employment, draft.horizon].filter(Boolean).length + (draft.household.length > 0 ? 1 : 0) + (draft.priorities.length > 0 ? 1 : 0);

  const save = () => {
    setProfile(draft);
    navigate('/plan');
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        breadcrumbs={[{ label: 'My Plan', to: '/plan' }, { label: 'Profile' }]}
        title={profile ? 'Edit your profile' : 'Personalise Everyday SG'}
        description="Every question is optional and broad on purpose. Answers stay in this browser and are used only to suggest relevant guides and checklists. Nothing is sent anywhere."
      />
      <div className="space-y-4">
        <OptionGroup<AgeRange>
          label="Age range"
          value={draft.ageRange}
          onChange={(v) => setDraft({ ...draft, ageRange: v })}
          options={[
            { value: '18-24', label: '18–24' },
            { value: '25-34', label: '25–34' },
            { value: '35-44', label: '35–44' },
            { value: '45-54', label: '45–54' },
            { value: '55-64', label: '55–64' },
            { value: '65+', label: '65 and above' },
          ]}
        />
        <OptionGroup<Residency>
          label="Residency"
          help="Some schemes depend on this; Everyday SG only uses it to point you to the right pages."
          value={draft.residency}
          onChange={(v) => setDraft({ ...draft, residency: v })}
          options={[
            { value: 'citizen', label: 'Singapore Citizen' },
            { value: 'pr', label: 'Permanent Resident' },
            { value: 'other', label: 'Other resident' },
          ]}
        />
        <MultiGroup<Household>
          label="Household"
          help="Pick everything that applies."
          values={draft.household}
          onChange={(v) => setDraft({ ...draft, household: v })}
          options={[
            { value: 'single', label: 'Single' },
            { value: 'partnered', label: 'Partnered' },
            { value: 'married', label: 'Married' },
            { value: 'parent', label: 'Parent' },
            { value: 'supporting-parents', label: 'Supporting parents' },
          ]}
        />
        <OptionGroup<HousingSituation>
          label="Housing"
          value={draft.housing}
          onChange={(v) => setDraft({ ...draft, housing: v })}
          options={[
            { value: 'with-family', label: 'Living with family' },
            { value: 'renting', label: 'Renting' },
            { value: 'hdb-owner', label: 'HDB owner' },
            { value: 'private-owner', label: 'Private-property owner' },
            { value: 'planning-to-buy', label: 'Planning to buy' },
          ]}
        />
        <OptionGroup<Employment>
          label="Employment"
          value={draft.employment}
          onChange={(v) => setDraft({ ...draft, employment: v })}
          options={[
            { value: 'employed', label: 'Employed' },
            { value: 'self-employed', label: 'Self-employed' },
            { value: 'studying', label: 'Studying' },
            { value: 'between-jobs', label: 'Between jobs' },
            { value: 'retired', label: 'Retired' },
          ]}
        />
        <MultiGroup
          label="Main priorities"
          help="Up to three works best."
          values={draft.priorities}
          onChange={(v) => setDraft({ ...draft, priorities: v })}
          options={PRIORITY_OPTIONS.map((p) => ({ value: p.id, label: p.label }))}
        />
        <OptionGroup<Horizon>
          label="Planning horizon"
          value={draft.horizon}
          onChange={(v) => setDraft({ ...draft, horizon: v })}
          options={[
            { value: 'next-3-months', label: 'Next 3 months' },
            { value: 'this-year', label: 'This year' },
            { value: '2-5-years', label: '2–5 years' },
            { value: 'long-term', label: 'Long term' },
          ]}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="primary" icon="check" onClick={save}>
          Save profile
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            dismissProfile();
            navigate(-1);
          }}
        >
          Skip for now
        </Button>
        {profile && (
          <Button
            variant="danger"
            icon="trash-2"
            onClick={() => {
              clearProfile();
              setDraft(EMPTY_PROFILE);
            }}
          >
            Clear profile
          </Button>
        )}
        <span className="text-[13px] text-ink-faint">{answered} of 7 answered — any number is fine.</span>
      </div>
    </div>
  );
}
