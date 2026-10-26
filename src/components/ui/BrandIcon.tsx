import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';

/**
 * Brand glyphs for social links, from Font Awesome Free (icons CC BY 4.0).
 * Rendered in the current text colour, which both brands allow for monochrome use.
 */
const BRANDS: Record<BrandName, IconDefinition> = { instagram: faInstagram, linkedin: faLinkedinIn };
export type BrandName = 'instagram' | 'linkedin';

export function BrandIcon({ name, size = 16, className = '' }: { name: BrandName; size?: number; className?: string }) {
  const [w, h, , , path] = BRANDS[name].icon;
  const paths = Array.isArray(path) ? path : [path];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
