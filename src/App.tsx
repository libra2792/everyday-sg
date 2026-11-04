import { Suspense, lazy, type ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Guides } from './pages/Guides';
import { GuidePage } from './pages/GuidePage';
import { Calculators } from './pages/Calculators';
import { MyPlan } from './pages/MyPlan';
import { ProfilePage } from './pages/ProfilePage';
import { Saved } from './pages/Saved';
import { SearchPage } from './pages/SearchPage';
import { About } from './pages/About';
import { Creator } from './pages/Creator';
import { Feedback } from './pages/Feedback';
import { NotFound } from './pages/NotFound';
import { IntentHub } from './pages/IntentHub';

/**
 * A page whose code loads on demand, like React.lazy, that can also be loaded ahead of
 * time and then renders straight away. The browser loads the current page's code before
 * the first render, so the prerendered HTML is replaced without a "Loading…" in between.
 */
function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  let loaded: ComponentType | null = null;
  const preload = () =>
    load().then((m) => {
      loaded = m.default;
      return m;
    });
  const Lazy = lazy(preload);
  return Object.assign(
    function Page() {
      const Loaded = loaded ?? Lazy;
      return <Loaded />;
    },
    { preload },
  );
}

/** Calculators and tools, by path: each is its own chunk. */
const LAZY_PAGES: Record<string, ReturnType<typeof lazyPage>> = {
  '/calculators/budget': lazyPage(() => import('./pages/calculators/BudgetCalculator')),
  '/calculators/emergency-debt': lazyPage(() => import('./pages/calculators/EmergencyDebtCalculator')),
  '/calculators/housing': lazyPage(() => import('./pages/calculators/HousingCalculator')),
  '/calculators/baby': lazyPage(() => import('./pages/calculators/BabyCalculator')),
  '/calculators/retirement': lazyPage(() => import('./pages/calculators/RetirementCalculator')),
  '/calculators/insurance': lazyPage(() => import('./pages/calculators/InsuranceCalculator')),
  '/calculators/caregiving': lazyPage(() => import('./pages/calculators/CaregivingCalculator')),
  '/calculators/car': lazyPage(() => import('./pages/calculators/CarCalculator')),
  '/tools/tax-prep': lazyPage(() => import('./pages/tools/TaxPrepTool')),
  '/tools/annual-admin': lazyPage(() => import('./pages/tools/AnnualAdminTool')),
};

/** Load the code for the page at `pathname`, if it is loaded on demand. */
export function preloadPage(pathname: string): Promise<unknown> {
  const page = LAZY_PAGES[pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname];
  return page ? page.preload() : Promise.resolve();
}

function Loading() {
  return (
    <div className="py-24 text-center text-sm text-ink-faint" role="status" aria-live="polite">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start/:intentId" element={<IntentHub />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:guideId" element={<GuidePage />} />
          <Route path="/calculators" element={<Calculators />} />
          {Object.entries(LAZY_PAGES).map(([path, Page]) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
          <Route path="/plan" element={<MyPlan />} />
          <Route path="/plan/profile" element={<ProfilePage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
