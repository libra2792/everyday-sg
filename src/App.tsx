import { Suspense, lazy } from 'react';
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
import { NotFound } from './pages/NotFound';

const BudgetCalculator = lazy(() => import('./pages/calculators/BudgetCalculator'));
const EmergencyDebtCalculator = lazy(() => import('./pages/calculators/EmergencyDebtCalculator'));
const HousingCalculator = lazy(() => import('./pages/calculators/HousingCalculator'));
const BabyCalculator = lazy(() => import('./pages/calculators/BabyCalculator'));
const RetirementCalculator = lazy(() => import('./pages/calculators/RetirementCalculator'));
const InsuranceCalculator = lazy(() => import('./pages/calculators/InsuranceCalculator'));
const CaregivingCalculator = lazy(() => import('./pages/calculators/CaregivingCalculator'));
const CarCalculator = lazy(() => import('./pages/calculators/CarCalculator'));
const TaxPrepTool = lazy(() => import('./pages/tools/TaxPrepTool'));
const AnnualAdminTool = lazy(() => import('./pages/tools/AnnualAdminTool'));

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
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:guideId" element={<GuidePage />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/calculators/budget" element={<BudgetCalculator />} />
          <Route path="/calculators/emergency-debt" element={<EmergencyDebtCalculator />} />
          <Route path="/calculators/housing" element={<HousingCalculator />} />
          <Route path="/calculators/baby" element={<BabyCalculator />} />
          <Route path="/calculators/retirement" element={<RetirementCalculator />} />
          <Route path="/calculators/insurance" element={<InsuranceCalculator />} />
          <Route path="/calculators/caregiving" element={<CaregivingCalculator />} />
          <Route path="/calculators/car" element={<CarCalculator />} />
          <Route path="/tools/tax-prep" element={<TaxPrepTool />} />
          <Route path="/tools/annual-admin" element={<AnnualAdminTool />} />
          <Route path="/plan" element={<MyPlan />} />
          <Route path="/plan/profile" element={<ProfilePage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
