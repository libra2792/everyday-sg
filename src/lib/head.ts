import { CALCULATORS, CALCULATOR_MAP } from '@/data/calculators';
import { CATEGORY_MAP, LIFE_STAGE_MAP } from '@/data/categories';
import { GUIDES, GUIDE_MAP } from '@/data/guides';
import { INTENTS, INTENT_MAP } from '@/data/intents';

/**
 * Per-route <title> and description. Used in the browser (useDocumentHead) and at build
 * time, where each route gets its own copy of index.html with these tags filled in, so
 * link previews and search engines can tell 41 guides apart without running JavaScript.
 */

export const SITE_NAME = 'Everyday SG';
export const HOME_TITLE = 'Everyday SG — Your guide to adulting in Singapore';
export const DEFAULT_DESCRIPTION =
  'Everyday SG — your guide to adulting in Singapore. Plain-English guides, calculators and checklists for money, housing, family, caregiving, insurance, CPF, careers and life admin.';
/** Default share image, in public/. */
export const OG_IMAGE_PATH = '/og-image.png';

export interface HeadInfo {
  title: string;
  description: string;
  /** False for pages that should not be indexed (personal data, search results, 404). */
  index: boolean;
}

const page = (title: string, description: string, index = true): HeadInfo => ({ title: `${title} · ${SITE_NAME}`, description, index });

const STATIC: Record<string, HeadInfo> = {
  '/': { title: HOME_TITLE, description: DEFAULT_DESCRIPTION, index: true },
  '/guides': page('Life Guides', `${GUIDES.length} plain-English guides to money, housing, family, caregiving, insurance, CPF, careers and life admin in Singapore, each with steps and a checklist.`),
  '/calculators': page('Calculators and tools', 'Budget, emergency fund, housing, baby, retirement, insurance, caregiving and car calculators, plus tax and life-admin checklists. Your figures stay in your browser.'),
  '/plan': page('My Plan', 'Your profile, suggested next steps, dated tasks and checklist progress, stored only in this browser.', false),
  '/plan/profile': page('Your profile', 'A few optional questions that tailor the suggestions. Answers stay in this browser.', false),
  '/saved': page('Saved Items', 'Your bookmarked guides, calculators and tools, and calculator snapshots, stored only in this browser.', false),
  '/about': page('About Everyday SG', 'What Everyday SG is and is not, how your data stays in your browser, and the official sources behind the guides.'),
  '/creator': page('Who made this', 'Why an ordinary Singaporean built Everyday SG, and the life admin behind it.'),
};

/** Title and description for a path (and its query string, for search and filters). */
export function headForPath(pathname: string, search = ''): HeadInfo {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const params = new URLSearchParams(search);
  if (path === '/search') {
    const q = (params.get('q') || '').trim();
    return page(q ? `Search: ${q}` : 'Search', 'Search the guides, calculators and tools.', false);
  }
  if (path === '/guides') {
    const category = CATEGORY_MAP[params.get('category') || ''];
    const stage = LIFE_STAGE_MAP[params.get('stage') || ''];
    if (category) return page(`${category.name} guides`, category.description);
    if (stage) return page(`Guides for ${stage.name.toLowerCase()}`, stage.description);
  }
  if (STATIC[path]) return STATIC[path];
  const [, section, id] = path.split('/');
  if (section === 'guides' && GUIDE_MAP[id]) return page(GUIDE_MAP[id].title, GUIDE_MAP[id].summary);
  if ((section === 'calculators' || section === 'tools') && CALCULATOR_MAP[id] && CALCULATOR_MAP[id].path === path) return page(CALCULATOR_MAP[id].name, CALCULATOR_MAP[id].description);
  if (section === 'start' && INTENT_MAP[id]) return page(INTENT_MAP[id].label, INTENT_MAP[id].lede);
  return page('Page not found', 'That page does not exist. Search Everyday SG or start from the home page.', false);
}

/** Every public route worth its own HTML file at build time. */
export function headRoutes(): string[] {
  return [...Object.keys(STATIC).filter((p) => STATIC[p].index), ...GUIDES.map((g) => `/guides/${g.id}`), ...CALCULATORS.map((c) => c.path), ...INTENTS.map((i) => `/start/${i.id}`)];
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The <head> tags for a route, as HTML, for the build step. `origin` is the site's
 * address when known (Netlify sets URL during builds); without it, absolute URLs are left
 * out rather than guessed.
 */
export function headTags(pathname: string, origin?: string): string {
  const h = headForPath(pathname);
  const url = origin ? `${origin.replace(/\/$/, '')}${pathname === '/' ? '/' : pathname}` : '';
  return [
    `<title>${escape(h.title)}</title>`,
    `<meta name="description" content="${escape(h.description)}" />`,
    `<meta property="og:title" content="${escape(h.title)}" />`,
    `<meta property="og:description" content="${escape(h.description)}" />`,
    url && `<meta property="og:url" content="${escape(url)}" />`,
    url && `<link rel="canonical" href="${escape(url)}" />`,
    `<meta property="og:image" content="${escape((origin ? origin.replace(/\/$/, '') : '') + OG_IMAGE_PATH)}" />`,
    h.index ? '' : '<meta name="robots" content="noindex" />',
  ]
    .filter(Boolean)
    .join('\n    ');
}
