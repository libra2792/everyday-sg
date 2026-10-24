import { Link } from 'react-router-dom';
import { CALCULATORS } from '@/data/calculators';
import { CATEGORY_MAP } from '@/data/categories';
import { Icon } from '@/components/ui/Icon';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';

export function Calculators() {
  const calcs = CALCULATORS.filter((c) => c.kind === 'calculator');
  const tools = CALCULATORS.filter((c) => c.kind === 'tool');
  return (
    <div>
      <PageHeader
        title="Calculators and tools"
        description="Interactive tools that recalculate as you type. Every figure comes from your own inputs and clearly stated assumptions — nothing is a quote, an eligibility decision or an official projection."
      />
      <SectionHeading title="Calculators" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {calcs.map((c) => (
          <li key={c.id}>
            <Link to={c.path} className="group flex h-full gap-4 rounded-lg border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-sage-400">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sage-50 text-sage-800">
                <Icon name={c.icon} size={18} />
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-[12px] font-medium uppercase tracking-wider text-sage-700">{CATEGORY_MAP[c.categoryId]?.shortName}</span>
                <span className="block text-[16px] font-semibold text-ink group-hover:text-sage-900">{c.name}</span>
                <span className="mt-1 block text-[13.5px] leading-6 text-ink-muted">{c.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <SectionHeading title="Checklists and admin tools" className="mt-12" description="Structured, persistent checklists with links to the agencies that run the process." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {tools.map((c) => (
          <li key={c.id}>
            <Link to={c.path} className="group flex h-full gap-4 rounded-lg border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-sage-400">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-200 text-ink">
                <Icon name={c.icon} size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold text-ink group-hover:text-sage-900">{c.name}</span>
                <span className="mt-1 block text-[13.5px] leading-6 text-ink-muted">{c.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-[13px] leading-6 text-ink-faint">
        Calculators are educational estimates. They do not model official eligibility rules, lender approval, grants, tax rates or CPF LIFE payouts; links to the relevant official tools are
        provided on each page.
      </p>
    </div>
  );
}
