import { Link, useParams } from 'react-router-dom';
import { CALCULATOR_MAP } from '@/data/calculators';
import { GUIDE_MAP } from '@/data/guides';
import { INTENT_MAP } from '@/data/intents';
import { GuideLinkCard, ToolTile, type FromRef } from '@/components/LinkTiles';
import { Icon } from '@/components/ui/Icon';
import { PageHeader, SectionHeading } from '@/components/ui/Misc';
import { NotFound } from './NotFound';

/** Where a home-page quick-start chip lands: a short choice of guides and calculators for that intent. */
export function IntentHub() {
  const { intentId = '' } = useParams();
  const intent = INTENT_MAP[intentId];
  if (!intent) return <NotFound />;
  const from: FromRef = { title: intent.label, path: `/start/${intent.id}`, kind: 'guide' };

  return (
    <div>
      <PageHeader breadcrumbs={[{ label: 'Home', to: '/' }, { label: intent.label }]} eyebrow="Start here" title={intent.label} description={intent.lede} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        <section aria-label="Guides">
          <SectionHeading title="Read first" description="Guides: what it means, the steps in order, and a checklist that remembers your progress." />
          <div className="grid gap-2.5">
            {intent.guides.map((id) => (
              <GuideLinkCard key={id} id={id} note={GUIDE_MAP[id]?.summary} from={from} />
            ))}
          </div>
        </section>
        <section aria-label="Calculators and tools">
          <SectionHeading title="Run the numbers" description="Calculators and tools: your figures in, results out. Nothing leaves this browser." />
          <div className="grid gap-2.5">
            {intent.tools.map((id) => (
              <ToolTile key={id} id={id} note={CALCULATOR_MAP[id]?.description} from={from} />
            ))}
          </div>
        </section>
      </div>
      <p className="mt-8 text-[13.5px]">
        <Link to={intent.browse.to} className="link inline-flex items-center gap-1">
          {intent.browse.label}
          <Icon name="arrow-right" size={13} />
        </Link>
      </p>
    </div>
  );
}
