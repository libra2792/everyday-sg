import { Link } from 'react-router-dom';
import { CREATOR, type CreatorPhoto, type CreatorSection } from '@/data/creator';
import { Icon } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';

const TILES = ['bg-tile-1', 'bg-tile-2', 'bg-tile-3'];
const SHAPE: Record<CreatorPhoto['shape'], string> = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/10]',
  square: 'aspect-square',
};

function Photo({ photo, tile, priority }: { photo: CreatorPhoto; tile: string; priority?: boolean }) {
  return (
    <figure className={`overflow-hidden rounded-lg ${tile} p-2`}>
      <img
        src={photo.src}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full rounded-md object-cover ${SHAPE[photo.shape]}`}
      />
      <figcaption className="px-1 pb-1 pt-2 text-[12.5px] leading-5 text-ink-muted">{photo.caption}</figcaption>
    </figure>
  );
}

function Section({ section, index }: { section: CreatorSection; index: number }) {
  const tile = TILES[index % TILES.length];
  const photosLeft = section.photoSide === 'left';
  const photos = section.photos ?? [];
  const wide = photos.length > 1; // two photos side by side need a wider column
  return (
    <section aria-labelledby={`creator-${section.id}`} className="grid gap-6 md:grid-cols-12 md:gap-10">
      <div className={`min-w-0 ${wide ? 'md:col-span-6' : 'md:col-span-7'} ${photosLeft ? 'md:order-2' : ''}`}>
        <div className="mb-3 flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tile} text-sage-800`} aria-hidden>
            <Icon name={section.icon} size={20} strokeWidth={1.7} />
          </span>
          <h2 id={`creator-${section.id}`} className="text-[22px] font-semibold leading-tight text-ink">
            {section.title}
          </h2>
        </div>
        <div className="prose-esg space-y-3 text-[15.5px] leading-7 text-ink-muted">
          {section.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'text-ink' : ''}>
              {p}
            </p>
          ))}
        </div>
      </div>
      {photos.length > 0 && (
        <div className={`min-w-0 ${wide ? 'md:col-span-6' : 'md:col-span-5'} ${photosLeft ? 'md:order-1' : ''}`}>
          <div className={wide ? 'grid grid-cols-2 gap-3' : 'mx-auto max-w-sm md:max-w-none'}>
            {photos.map((photo, i) => (
              <Photo key={photo.src} photo={photo} tile={TILES[(index + i) % TILES.length]} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function Creator() {
  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-sage-700">{CREATOR.eyebrow}</p>
        <h1 className="text-[30px] font-semibold leading-[1.15] text-ink sm:text-[38px]">{CREATOR.title}</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-7 text-ink-muted">{CREATOR.lead}</p>
      </header>

      <Photo photo={CREATOR.heroPhoto} tile="bg-tile-1" priority />

      <div className="mt-14 space-y-16">
        {CREATOR.sections.map((section, i) => (
          <Section key={section.id} section={section} index={i} />
        ))}
      </div>

      <section aria-labelledby="creator-promises" className="mt-16">
        <h2 id="creator-promises" className="text-[22px] font-semibold leading-tight text-ink">
          What this site is, and is not
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {CREATOR.promises.map((p, i) => (
            <div key={p.title} className="flex gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${TILES[i % TILES.length]} text-sage-800`} aria-hidden>
                <Icon name={p.icon} size={18} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-ink">{p.title}</div>
                <p className="mt-0.5 text-[13.5px] leading-6 text-ink-muted">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-lg bg-hero p-6 text-hero-ink sm:p-8">
        <p className="text-[18px] font-semibold leading-snug sm:text-[20px]">{CREATOR.closing}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton to="/guides" variant="primary" icon="book-open">
            Start with a guide
          </LinkButton>
          <LinkButton to="/calculators" icon="calculator">
            Try a calculator
          </LinkButton>
        </div>
      </section>

      <p className="mt-8 text-[13px] leading-6 text-ink-faint">
        {CREATOR.credit} Privacy, data handling and sources are explained on the{' '}
        <Link to="/about" className="link">
          About page
        </Link>
        .
      </p>
    </div>
  );
}
