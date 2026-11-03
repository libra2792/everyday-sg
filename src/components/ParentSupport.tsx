import { Fragment } from 'react';
import { LEAVE_PORTAL_SOURCE, PARENT_SUPPORT, type ParentSupportRow } from '@/data/parentSupport';
import { SOURCE_MAP } from '@/data/sources';
import { Icon } from '@/components/ui/Icon';

const GROUPS: ParentSupportRow['group'][] = ['Leave', 'Cash and accounts', 'Childcare and school', 'Tax'];

function SourceLink({ id }: { id: string }) {
  const s = SOURCE_MAP[id];
  if (!s) return null;
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 whitespace-nowrap">
      {s.agency}
      <Icon name="external-link" size={12} />
    </a>
  );
}

/** Call to action for the Government-Paid Leave Portal, then the consolidated support table. */
export function ParentSupport() {
  const portal = SOURCE_MAP[LEAVE_PORTAL_SOURCE];
  return (
    <div className="space-y-3">
      {portal && (
        <a href={portal.url} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 items-center gap-3 rounded-lg border border-sage-300 bg-tile-2 px-4 py-3.5 hover:border-sage-500">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-50 text-sage-800" aria-hidden>
            <Icon name="calendar-days" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-ink group-hover:text-sage-900">Apply for government-paid leave</span>
            <span className="block text-[13px] leading-5 text-ink-muted">Paternity, maternity, shared parental and childcare leave on MSF's Government-Paid Leave Portal. Employees apply through their employer; self-employed parents claim on the portal.</span>
          </span>
          <Icon name="external-link" size={16} className="shrink-0 text-ink-muted" />
        </a>
      )}

      {/* Desktop: one table, grouped */}
      <div className="hidden overflow-hidden rounded-lg border border-stone-200 bg-stone-50 md:block">
        <table className="w-full border-collapse text-left text-[13.5px]">
          <caption className="sr-only">Government support for parents: what it helps with, who it is for, how to get it, and the official page</caption>
          <thead>
            <tr className="border-b border-stone-200 text-[12px] uppercase tracking-wider text-ink-faint">
              <th scope="col" className="px-4 py-2.5 font-medium">Support</th>
              <th scope="col" className="px-3 py-2.5 font-medium">What it helps with</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Generally for</th>
              <th scope="col" className="px-3 py-2.5 font-medium">How you get it</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Official page</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <Fragment key={g}>
                <tr className="bg-stone-100">
                  <th scope="colgroup" colSpan={5} className="px-4 py-1.5 text-[12.5px] font-semibold text-sage-800">
                    {g}
                  </th>
                </tr>
                {PARENT_SUPPORT.filter((r) => r.group === g).map((r) => (
                  <tr key={r.name} className="border-t border-stone-200 align-top">
                    <th scope="row" className="px-4 py-2.5 font-medium text-ink">
                      {r.name}
                    </th>
                    <td className="px-3 py-2.5 text-ink-muted">{r.what}</td>
                    <td className="px-3 py-2.5 text-ink-muted">{r.who}</td>
                    <td className="px-3 py-2.5 text-ink-muted">{r.how}</td>
                    <td className="px-4 py-2.5">
                      <SourceLink id={r.sourceId} />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: the same rows as stacked cards */}
      <div className="space-y-4 md:hidden">
        {GROUPS.map((g) => (
          <div key={g}>
            <h3 className="mb-1.5 text-[13px] font-semibold text-sage-800">{g}</h3>
            <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50">
              {PARENT_SUPPORT.filter((r) => r.group === g).map((r) => (
                <li key={r.name} className="px-4 py-3 text-[13.5px]">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-medium text-ink">{r.name}</span>
                    <SourceLink id={r.sourceId} />
                  </div>
                  <p className="mt-1 leading-5 text-ink-muted">{r.what}</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-ink-faint">
                    {r.who} · {r.how}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-[12px] leading-5 text-ink-faint">Amounts and eligibility change with each Budget, so they are not listed here. The official page for each scheme has the current figures and decides who qualifies.</p>
    </div>
  );
}
