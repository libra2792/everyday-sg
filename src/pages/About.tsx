import { Link } from 'react-router-dom';
import { SOURCES, CONTENT_CHECK_DATE } from '@/data/sources';
import { GUIDES } from '@/data/guides';
import { formatDate } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';

export function About() {
  const agencies = [...new Set(SOURCES.map((s) => s.agency))];
  const reviewed = GUIDES.filter((g) => g.reviewedOn).length;
  const checkedContent = SOURCES.filter((s) => s.check === 'content').length;
  const checkedLink = SOURCES.filter((s) => s.check === 'link').length;
  const unchecked = SOURCES.filter((s) => s.check === 'unchecked').length;

  return (
    <div className="max-w-3xl">
      <PageHeader title="About Everyday SG" description="An independent, privacy-first toolkit for everyday life administration in Singapore." />

      <div className="prose-esg space-y-10">
        <section>
          <SectionHeading title="What it is, and is not" />
          <p>
            Everyday SG helps adults living in Singapore work out what applies to them, what to do, how much it might cost, what to prepare and where to complete the
            task. It combines plain-English guides, interactive calculators, persistent checklists and links to the agencies responsible for each process.
          </p>
          <p>
            It is <strong>not a government website</strong>, is not affiliated with or endorsed by any agency, and cannot submit applications on your behalf. The content
            is general information and the calculators are estimates built from your own inputs. They are not financial, legal, tax, insurance or medical advice. For
            decisions that depend on your circumstances, speak to the relevant agency or a licensed professional.
          </p>
        </section>

        <section>
          <SectionHeading title="Privacy and your data" />
          <ul className="list-disc space-y-2 pl-5">
            <li>Your profile, checklist ticks, saved items, tasks and calculator inputs are stored in this browser's local storage only. They are never sent to a server.</li>
            <li>There are no accounts, no cookies for tracking, no analytics and no third-party scripts. The site is static files served from a content delivery network.</li>
            <li>Everyday SG never asks for NRIC numbers, Singpass credentials, bank logins, full addresses or health information. Please do not enter them in free-text fields.</li>
            <li>Saved information may be lost if you clear browser data, use private browsing or switch devices. Export a copy from <Link to="/plan#data" className="link">My Plan</Link> to keep it, and import it on another browser.</li>
            <li>You can erase everything at any time with “Reset all saved data” in My Plan.</li>
          </ul>
        </section>

        <section>
          <SectionHeading title="How information is verified" />
          <p>
            Guides and tools reference {SOURCES.length} official or authoritative links across {agencies.length} organisations. During content preparation on {formatDate(CONTENT_CHECK_DATE)}, {checkedContent} of these pages were opened and read, {checkedLink} were confirmed to exist, and {unchecked} could not be automatically checked. {reviewed} of {GUIDES.length} guides were reviewed against their official sources; the rest are labelled as general guides and should be confirmed with the agency before you act.
          </p>
          <p>
            Each guide and tool shows its sources and how they were checked, and distinguishes official requirements from general guidance and from your own assumptions. Amounts, caps, eligibility rules and deadlines are deliberately not hard-coded, because they change; the responsible agency's website is always the authority.
          </p>
        </section>

        <section>
          <SectionHeading title="Official sources used" />
          <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50">
            {SOURCES.map((s) => (
              <li key={s.id} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-[13.5px]">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="link min-w-0 break-words">
                  <span className="font-medium">{s.agency}</span> — {s.title}
                  <Icon name="external-link" size={12} className="ml-1 inline-block align-[-1px]" />
                </a>
                <span className="shrink-0 text-[12px] text-ink-faint">{s.check === 'content' ? `Page read ${formatDate(s.checkedOn)}` : s.check === 'link' ? `Link checked ${formatDate(s.checkedOn)}` : 'Not auto-checked'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading title="Accessibility" />
          <p>
            The site is built to work with keyboard navigation and screen readers: visible focus states, labelled form fields, synchronised sliders and number inputs, sufficient text contrast and respect for reduced-motion preferences. If something does not work for you, the printable versions of guides and checklists are a fallback.
          </p>
        </section>
      </div>
    </div>
  );
}
