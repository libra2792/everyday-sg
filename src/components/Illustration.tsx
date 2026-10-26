import type { ReactElement } from 'react';
import type { CategoryId } from '@/data/types';

/**
 * One spot illustration per category, drawn with simple shapes in the theme's own colours
 * so they recolour with every skin. Decorative: the guide title carries the meaning.
 */
const S = {
  line: { fill: 'none', stroke: 'var(--sage-700)', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const },
  solid: { fill: 'var(--sage-700)' },
  light: { fill: 'var(--stone-50)', stroke: 'var(--sage-700)', strokeWidth: 2 },
  tint: { fill: 'var(--tile-3)', stroke: 'var(--sage-700)', strokeWidth: 2 },
  coin: { fill: 'var(--chart-4)', stroke: 'var(--sage-700)', strokeWidth: 2 },
  leaf: { fill: 'var(--sage-300)', stroke: 'var(--sage-700)', strokeWidth: 1.5 },
  ground: { fill: 'var(--stone-300)' },
};

const DRAWINGS: Record<CategoryId, ReactElement> = {
  money: (
    <>
      <rect x="8" y="104" width="104" height="3" rx="1.5" style={S.ground} />
      <rect x="34" y="40" width="52" height="64" rx="12" style={S.light} />
      <rect x="30" y="32" width="60" height="12" rx="4" style={S.solid} />
      <circle cx="50" cy="90" r="8" style={S.coin} />
      <circle cx="66" cy="92" r="8" style={S.coin} />
      <circle cx="72" cy="78" r="8" style={S.coin} />
      <circle cx="54" cy="74" r="8" style={S.coin} />
      <rect x="56" y="12" width="12" height="8" rx="4" style={S.coin} />
      <path d="M62 22v6" style={{ ...S.line, strokeDasharray: '2 3' }} />
    </>
  ),
  housing: (
    <>
      <rect x="8" y="98" width="104" height="3" rx="1.5" style={S.ground} />
      <rect x="28" y="56" width="58" height="42" rx="3" style={S.light} />
      <path d="M20 58 57 26l37 32" style={{ ...S.line, strokeWidth: 3 }} />
      <rect x="52" y="72" width="14" height="26" rx="2" style={S.solid} />
      <rect x="34" y="66" width="12" height="12" rx="2" style={S.tint} />
      <rect x="70" y="66" width="12" height="12" rx="2" style={S.tint} />
      <rect x="72" y="36" width="8" height="14" rx="1" style={S.solid} />
      <circle cx="103" cy="84" r="7" style={S.coin} />
      <path d="M103 91v9M103 96h5M103 100h4" style={S.line} />
      <circle cx="103" cy="84" r="2" style={{ fill: 'var(--stone-50)' }} />
    </>
  ),
  parenting: (
    <>
      <rect x="8" y="104" width="104" height="3" rx="1.5" style={S.ground} />
      <path d="M24 60h54a24 24 0 0 0-24-24H24Z" style={S.tint} />
      <path d="M24 60h66v12a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8Z" style={S.light} />
      <path d="M90 60 104 34h8" style={S.line} />
      <circle cx="36" cy="92" r="9" style={S.light} />
      <circle cx="80" cy="92" r="9" style={S.light} />
      <circle cx="36" cy="92" r="2.5" style={S.solid} />
      <circle cx="80" cy="92" r="2.5" style={S.solid} />
      <path d="M44 80 36 92M72 80l8 12" style={S.line} />
      <circle cx="48" cy="48" r="5" style={S.coin} />
    </>
  ),
  parents: (
    <>
      <rect x="8" y="104" width="104" height="3" rx="1.5" style={S.ground} />
      <circle cx="40" cy="44" r="22" style={S.leaf} />
      <rect x="37" y="60" width="6" height="40" rx="2" style={S.solid} />
      <rect x="62" y="70" width="46" height="8" rx="3" style={S.light} />
      <rect x="62" y="58" width="46" height="8" rx="3" style={S.tint} />
      <path d="M66 78v24M104 78v24M66 58v12M104 58v12" style={S.line} />
    </>
  ),
  insurance: (
    <>
      <path d="M12 62a48 48 0 0 1 96 0Z" style={S.tint} />
      <path d="M36 62a24 24 0 0 1 48 0" style={{ ...S.line, fill: 'var(--stone-50)' }} />
      <path d="M60 14v6M60 62v34a8 8 0 0 0 16 0" style={S.line} />
      <path d="M20 86l-4 10M44 90l-4 10M80 92l-4 10M100 84l-4 10" style={{ ...S.line, stroke: 'var(--sage-400)' }} />
    </>
  ),
  'cpf-tax-retirement': (
    <>
      <path d="M14 78a46 46 0 0 1 92 0Z" style={S.coin} />
      <rect x="8" y="78" width="104" height="3" rx="1.5" style={S.ground} />
      <path d="M60 18v-8M30 30l-5-6M90 30l5-6M20 56h-8M100 56h8" style={{ ...S.line, stroke: 'var(--clay-500)' }} />
      <rect x="44" y="92" width="32" height="7" rx="3.5" style={S.coin} />
      <rect x="44" y="84" width="32" height="7" rx="3.5" style={S.coin} />
      <rect x="44" y="100" width="32" height="7" rx="3.5" style={S.coin} />
    </>
  ),
  careers: (
    <>
      <rect x="8" y="104" width="104" height="3" rx="1.5" style={S.ground} />
      <rect x="20" y="44" width="72" height="50" rx="8" style={S.light} />
      <path d="M44 44v-8a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v8" style={S.line} />
      <rect x="20" y="62" width="72" height="4" style={S.solid} />
      <rect x="50" y="58" width="12" height="12" rx="2" style={S.coin} />
      <path d="M98 70V30M86 42l12-12 12 12" style={{ ...S.line, stroke: 'var(--clay-500)', strokeWidth: 3 }} />
    </>
  ),
  marriage: (
    <>
      <rect x="8" y="104" width="104" height="3" rx="1.5" style={S.ground} />
      <circle cx="46" cy="64" r="24" style={{ ...S.line, strokeWidth: 6, stroke: 'var(--chart-4)' }} />
      <circle cx="74" cy="64" r="24" style={{ ...S.line, strokeWidth: 6, stroke: 'var(--sage-500)' }} />
      <path d="M60 24c-5-9-18-6-18 4 0 8 10 12 18 20 8-8 18-12 18-20 0-10-13-13-18-4Z" style={{ fill: 'var(--clay-500)' }} />
    </>
  ),
  legal: (
    <>
      <rect x="8" y="104" width="104" height="3" rx="1.5" style={S.ground} />
      <path d="M30 14h50l12 12v70a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" style={S.light} />
      <path d="M80 14v12h12" style={S.line} />
      <path d="M38 40h44M38 52h44M38 64h28" style={{ ...S.line, stroke: 'var(--sage-400)' }} />
      <circle cx="78" cy="82" r="10" style={S.coin} />
      <path d="M72 90l-4 14 10-6 10 6-4-14" style={{ fill: 'var(--clay-500)' }} />
    </>
  ),
  transport: (
    <>
      <rect x="8" y="98" width="104" height="3" rx="1.5" style={S.ground} />
      <path d="M18 78V62a8 8 0 0 1 8-8h8l12-16h28l14 16h10a8 8 0 0 1 8 8v16Z" style={S.light} />
      <path d="M38 54h50" style={S.line} />
      <path d="M46 54l8-12h20l10 12" style={S.tint} />
      <circle cx="36" cy="84" r="10" style={S.light} />
      <circle cx="88" cy="84" r="10" style={S.light} />
      <circle cx="36" cy="84" r="3" style={S.solid} />
      <circle cx="88" cy="84" r="3" style={S.solid} />
      <rect x="20" y="66" width="10" height="6" rx="2" style={S.coin} />
    </>
  ),
  digital: (
    <>
      <path d="M60 10 98 26v30c0 24-16 40-38 50C38 96 22 80 22 56V26Z" style={S.tint} />
      <rect x="44" y="52" width="32" height="26" rx="5" style={S.light} />
      <path d="M50 52v-8a10 10 0 0 1 20 0v8" style={S.line} />
      <circle cx="60" cy="65" r="3.5" style={S.solid} />
      <path d="M60 68v5" style={S.line} />
    </>
  ),
  wellbeing: (
    <>
      <path d="M60 100C36 82 14 68 14 44c0-14 10-24 22-24 10 0 18 6 24 16 6-10 14-16 24-16 12 0 22 10 22 24 0 24-22 38-46 56Z" style={S.tint} />
      <path d="M26 60h18l6-12 8 24 8-18 4 6h24" style={{ ...S.line, strokeWidth: 3 }} />
      <path d="M92 20c10 0 16 6 16 16-10 0-16-6-16-16Z" style={S.leaf} />
    </>
  ),
};

export function Illustration({ category, className = '' }: { category: CategoryId; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" className={className}>
      {DRAWINGS[category]}
    </svg>
  );
}
