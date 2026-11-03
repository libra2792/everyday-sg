import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigationType } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAppState, useStorageControl } from '@/state/AppState';
import { UndoNotice } from '@/components/ui/Misc';
import { ThemeMenu, ThemeOptions } from '@/components/ThemePicker';
import { useDocumentHead } from '@/lib/useDocumentHead';

/**
 * `mobile: false` keeps an item out of the phone tab bar (it stays in the header and footer).
 * `short` is the label where space is tight: the phone tab bar, and the header below `lg`.
 */
const NAV: { to: string; label: string; short?: string; icon: IconName; end?: boolean; mobile?: false }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/guides', label: 'Life Guides', short: 'Guides', icon: 'book-open' },
  { to: '/calculators', label: 'Calculators', icon: 'calculator' },
  { to: '/plan', label: 'My Plan', icon: 'list-checks' },
  { to: '/saved', label: 'Saved Items', short: 'Saved', icon: 'bookmark' },
  { to: '/creator', label: 'Who made this', icon: 'user', mobile: false },
];

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-md text-ink" aria-label="Everyday SG home">
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-sage-500 bg-stone-50" aria-hidden>
        <Icon name="check" size={16} className="text-ink" strokeWidth={2.5} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">Everyday SG</span>
        {/* Hidden while the header nav needs the room. */}
        <span className="hidden text-[11.5px] text-ink-faint sm:block md:hidden xl:block">Your guide to adulting in Singapore</span>
      </span>
    </Link>
  );
}

function Header() {
  const { saved } = useAppState();
  return (
    <header className="no-print relative sticky top-0 z-30 border-b border-stone-200 bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <LoadSweep />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden md:block">
          {/* Tighter, with short labels, from md to lg, so every item stays on one line. */}
          <ul className="flex items-center gap-0.5 lg:gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-[13px] transition-colors lg:gap-2 lg:px-3 lg:text-sm ${isActive ? 'bg-nav-active font-medium text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`
                  }
                >
                  {item.short ? (
                    <>
                      <span className="lg:hidden">{item.short}</span>
                      <span className="hidden lg:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                  {item.to === '/saved' && saved.length > 0 && <span className="rounded-full bg-sage-100 px-1.5 text-[11px] font-medium text-sage-800 tabular-nums">{saved.length}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/search" className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-2.5 py-2 text-sm text-ink-muted hover:border-stone-400 hover:text-ink md:hidden" aria-label="Search">
            <Icon name="search" size={16} />
            <span className="sr-only sm:not-sr-only">Search</span>
          </Link>
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <nav aria-label="Main (mobile)" className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-canvas/95 backdrop-blur md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-5">
        {NAV.filter((item) => item.mobile !== false).map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => `flex flex-col items-center gap-1 px-1 py-2 text-[11px] ${isActive ? 'font-medium text-ink' : 'text-ink-faint'}`}>
              {({ isActive }) => (
                <>
                  <span className={`flex h-7 w-10 items-center justify-center rounded-full ${isActive ? 'bg-nav-active' : ''}`}>
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="truncate">{item.short ?? item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-stone-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-[13px] text-ink-faint sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-md">
          <div className="text-sm font-semibold text-ink">Everyday SG</div>
          <p className="mt-2 leading-6">
            A personal, practical life-admin toolkit for adults living in Singapore. Not a government website and not affiliated with any agency. Guides and
            calculators are general information and estimates based on your own inputs — not financial, legal, tax or medical advice.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">Explore</div>
          <ul className="mt-2 space-y-1.5">
            <li>
              <Link to="/guides" className="hover:text-ink">
                Life Guides
              </Link>
            </li>
            <li>
              <Link to="/calculators" className="hover:text-ink">
                Calculators and tools
              </Link>
            </li>
            <li>
              <Link to="/tools/annual-admin" className="hover:text-ink">
                Annual life-admin checklist
              </Link>
            </li>
            <li>
              <Link to="/tools/tax-prep" className="hover:text-ink">
                Tax preparation checklist
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">About</div>
          <ul className="mt-2 space-y-1.5">
            <li>
              <Link to="/creator" className="hover:text-ink">
                Who made this
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-ink">
                Privacy, data and sources
              </Link>
            </li>
            <li>
              <Link to="/plan" className="hover:text-ink">
                Export, import or reset your data
              </Link>
            </li>
          </ul>
          <p className="mt-4 leading-5">Everything you enter stays in this browser. No accounts, no tracking, no servers.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-stone-200 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-faint">
          <span className="font-medium text-ink">Appearance</span>
          <ThemeOptions compact />
        </div>
      </div>
    </footer>
  );
}

/**
 * Every new page opens at the top, like a full page load. `behavior: 'instant'` matters:
 * 'auto' inherits the global `scroll-behavior: smooth`, and a smooth scroll is cut short
 * when the new page renders. A URL with a hash scrolls to that element instead.
 *
 * Back/Forward (POP) returns to where that page was left. The browser's own restoration
 * runs before React has rendered the previous page, so positions are remembered here, in
 * memory only, per history entry (never in storage).
 */
const scrollPositions = new Map<string, number>();

function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  // Entries the browser creates itself (a full load, an anchor jump) all share the key
  // 'default', so the path and hash are part of the id.
  const entry = `${key}|${pathname}${hash}`;
  // Read, not a dependency: a filter or prefill that only REPLACEs the query string must not jump.
  const type = useNavigationType();
  const navType = useRef(type);
  navType.current = type;
  const entryKey = useRef(entry);
  const last = useRef({ pathname, hash });

  useEffect(() => {
    // The browser would otherwise restore against the old page and record a clamped position.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    // Recorded on scroll, and again just before a navigation can change the page: a click
    // (links and buttons that navigate) or Back/Forward. Capture phase, so this runs before
    // the router's own popstate listener re-renders the page.
    const remember = () => scrollPositions.set(entryKey.current, window.scrollY);
    window.addEventListener('scroll', remember, { passive: true });
    window.addEventListener('click', remember, { capture: true });
    window.addEventListener('popstate', remember, { capture: true });
    return () => {
      window.removeEventListener('scroll', remember);
      window.removeEventListener('click', remember, { capture: true });
      window.removeEventListener('popstate', remember, { capture: true });
    };
  }, []);

  useLayoutEffect(() => {
    entryKey.current = entry;
    const samePage = last.current.pathname === pathname;
    const sameHash = last.current.hash === hash;
    last.current = { pathname, hash };
    let timer = 0;
    let tries = 0;
    // Lazily loaded pages may not be tall enough (or have the target) straight away.
    const retry = (attempt: () => boolean) => {
      const run = () => {
        if (!attempt() && tries++ < 40) timer = window.setTimeout(run, 16);
      };
      run();
    };
    const toHash = (behavior: ScrollBehavior = 'instant') => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      el?.scrollIntoView({ behavior, block: 'start' });
      return Boolean(el);
    };
    if (navType.current === 'POP') {
      // An in-page anchor (a click, or Back over one): glide to that section, as the
      // section tabs always have, unless the reader prefers reduced motion.
      if (samePage && hash) {
        if (!sameHash) toHash(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
        return;
      }
      const saved = scrollPositions.get(entry);
      if (saved === undefined) return;
      retry(() => {
        window.scrollTo({ top: saved, left: 0, behavior: 'instant' });
        return Math.abs(window.scrollY - saved) < 2;
      });
    } else if (samePage && sameHash) {
      // Only the query string changed (a filter, or a calculator clearing its prefill): stay put.
      return;
    } else if (hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      retry(() => toHash());
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    return () => window.clearTimeout(timer);
  }, [pathname, hash, entry]);
  return null;
}

/** A short loading sweep under the header on every navigation, like a browser's own bar. */
function LoadSweep() {
  const { pathname } = useLocation();
  const first = useRef(pathname);
  if (pathname === first.current) return null;
  return <i key={pathname} className="loadbar" aria-hidden="true" />;
}


/** The routed page. Keyed by location so each navigation re-mounts it with the entry animation. */
function PageFrame({ children }: { children: ReactNode }) {
  // Keyed by path, not location key, so clearing a query string does not re-mount the page.
  const { pathname: key } = useLocation();
  // The first page is often on screen already, prerendered: only pages navigated to slide in.
  const first = useRef<string | null>(key);
  if (key !== first.current) first.current = null;
  useEffect(() => {
    if (typeof (document as Document & { startViewTransition?: unknown }).startViewTransition !== 'function') document.documentElement.classList.add('no-vt');
  }, []);
  return (
    <main id="main" key={key} className={`${first.current === null ? 'page-enter ' : ''}mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-8 sm:px-6 md:pb-12`}>
      {children}
    </main>
  );
}

/** The Undo offered after erasing all saved data; it outlives the reload of state from storage. */
function StorageUndo() {
  const { pendingUndo, clearUndo } = useStorageControl();
  if (!pendingUndo) return null;
  return (
    <UndoNotice
      key={pendingUndo.id}
      floating
      message={pendingUndo.message}
      onUndo={() => {
        clearUndo();
        pendingUndo.restore();
      }}
      onExpire={clearUndo}
    />
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  useDocumentHead();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-canvas">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <PageFrame>{children}</PageFrame>
      <Footer />
      <MobileNav />
      <StorageUndo />
    </div>
  );
}
