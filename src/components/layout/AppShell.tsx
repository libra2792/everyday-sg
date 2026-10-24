import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAppState } from '@/state/AppState';
import { ThemeMenu, ThemeOptions } from '@/components/ThemePicker';

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/guides', label: 'Life Guides', icon: 'book-open' },
  { to: '/calculators', label: 'Calculators', icon: 'calculator' },
  { to: '/plan', label: 'My Plan', icon: 'list-checks' },
  { to: '/saved', label: 'Saved Items', icon: 'bookmark' },
];

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-md text-ink" aria-label="Everyday SG home">
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-sage-500 bg-stone-50" aria-hidden>
        <Icon name="check" size={16} className="text-ink" strokeWidth={2.5} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">Everyday SG</span>
        <span className="hidden text-[11.5px] text-ink-faint sm:block">Your guide to adulting in Singapore</span>
      </span>
    </Link>
  );
}

function Header() {
  const { saved } = useAppState();
  return (
    <header className="no-print sticky top-0 z-30 border-b border-stone-200 bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'bg-nav-active font-medium text-ink' : 'text-ink-muted hover:bg-stone-100 hover:text-ink'}`
                  }
                >
                  {item.label}
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
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => `flex flex-col items-center gap-1 px-1 py-2 text-[11px] ${isActive ? 'font-medium text-ink' : 'text-ink-faint'}`}>
              {({ isActive }) => (
                <>
                  <span className={`flex h-7 w-10 items-center justify-center rounded-full ${isActive ? 'bg-nav-active' : ''}`}>
                    <Icon name={item.icon} size={18} />
                  </span>
                  <span className="truncate">{item.label === 'Saved Items' ? 'Saved' : item.label === 'Life Guides' ? 'Guides' : item.label}</span>
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
            An independent, practical life-admin toolkit for adults living in Singapore. Not a government website and not affiliated with any agency. Guides and
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-canvas">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-8 sm:px-6 md:pb-12">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
