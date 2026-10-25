import { useMemo } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { carOwnershipCost, type CarInputs } from '@/lib/finance';
import { sgd, sgdCents } from '@/lib/format';
import { BENCHMARKS } from '@/data/benchmarks';
import { CalculatorShell, InputGroup, ResultsPanel } from '@/components/calculators/CalculatorShell';
import { Segmented, SliderField } from '@/components/ui/Field';
import { DefinitionList, Stat, StatGrid } from '@/components/ui/Panel';
import { BarList, ColumnChart } from '@/components/charts/Charts';
import { Note } from '@/components/ui/Misc';

const DEFAULTS: CarInputs = {
  purchasePrice: 150000,
  initialPayment: 60000,
  otherUpfrontCosts: 0,
  loanInterestPct: 2.8,
  loanTenureYears: 5,
  loanType: 'flat',
  resaleValueAtEnd: 50000,
  insuranceAnnual: 0,
  roadTaxAnnual: 0,
  fuelMonthly: 0,
  parkingMonthly: 0,
  erpAndTollsMonthly: 0,
  maintenanceAnnual: 0,
  annualMileageKm: 12000,
  ownershipYears: 5,
  alternativeTransportMonthly: 0,
};

export default function CarCalculator() {
  const [state, setState, reset] = usePersistentState<CarInputs>('calc:car', DEFAULTS);
  const r = useMemo(() => carOwnershipCost(state), [state]);
  const set = <K extends keyof CarInputs>(key: K) => (v: CarInputs[K]) => setState((s) => ({ ...s, [key]: v }));
  const months = Math.round(state.ownershipYears * 12);

  return (
    <CalculatorShell
      id="car"
      onReset={reset}
      sourceIds={['onemotoring', 'onemotoring-upfront', 'onemotoring-coe', 'onemotoring-coe-results', 'onemotoring-ongoing', 'onemotoring-road-tax', 'lta-fares']}
      relatedGuides={['car-ownership-costs', 'car-vs-public-transport', 'build-a-budget']}
      headline={[
        { label: 'Economic cost / month', value: sgd(r.economicCostMonthly) },
        { label: 'Cash outflow / month', value: sgd(r.cashOutflowMonthly) },
      ]}
      snapshot={[
        { label: 'Upfront cash', value: sgd(r.upfrontCash) },
        { label: 'Monthly cash outflow', value: sgd(r.cashOutflowMonthly) },
        { label: 'Economic cost per month', value: sgd(r.economicCostMonthly) },
        { label: `Total over ${state.ownershipYears} years (economic)`, value: sgd(r.economicCost) },
        { label: 'Cost per km', value: r.costPerKm === null ? '—' : sgdCents(r.costPerKm) },
      ]}
      caveat="Two different numbers are shown on purpose. Cash outflow is what leaves your account (loan instalments, which repay the car, plus running costs). Economic cost is what the car truly costs you (depreciation plus interest plus running costs). Loan principal and depreciation are never added together, which would double-count the car."
      assumptions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Flat-rate loans charge interest on the original principal for the whole tenure (common for car loans in Singapore). Reducing-balance loans amortise like a mortgage.</li>
          <li>Depreciation = purchase price − your estimated resale value at the end of the ownership period. Rebates on deregistration should be reflected in that estimate.</li>
          <li>Running costs are held flat; insurance, fuel and parking prices change, and COE prices affect resale value.</li>
          <li>If the loan is longer than the ownership period, only the instalments and interest within the period are counted; the remaining balance is assumed to be settled from the sale.</li>
          <li>The alternative-transport budget is your own estimate, including taxis and ride-hailing when needed.</li>
        </ul>
      }
      methodology={
        <ul className="list-disc space-y-1 pl-5">
          <li>Loan = price − initial payment. Flat-rate instalment = (loan + loan × rate × years) ÷ months; reducing-balance uses the standard amortisation formula.</li>
          <li>Running monthly = (insurance + road tax + maintenance) ÷ 12 + fuel + parking + ERP and tolls.</li>
          <li>Total cash outflow = initial payment + other upfront costs + instalments within the period + running monthly × months.</li>
          <li>Economic cost = depreciation + loan interest within the period + other upfront costs + running monthly × months. Cost per km = economic cost ÷ (annual km × years).</li>
        </ul>
      }
      results={
        <ResultsPanel>
          <div>
            <div className="mb-3 text-[12px] font-medium uppercase tracking-wider text-sage-700">Cash outflow</div>
            <StatGrid>
              <Stat label="Upfront cash" value={sgd(r.upfrontCash)} hint={`${sgd(state.initialPayment)} initial + ${sgd(state.otherUpfrontCosts)} other`} />
              <Stat label="Monthly (while the loan runs)" value={sgd(r.cashOutflowMonthly)} hint={`${sgd(r.loanMonthly)} instalment + ${sgd(r.runningMonthly)} running`} />
              <Stat label="Year-one cash cost" value={sgd(r.cashOutflowAnnualYear1)} />
              <Stat label={`Total cash over ${state.ownershipYears} years`} value={sgd(r.totalCashOutflow)} className="col-span-2 sm:col-span-3" hint={r.loanExtendsBeyondOwnership ? 'Loan outlasts the ownership period; remaining balance settled from the sale' : undefined} />
            </StatGrid>
          </div>
          <div className="border-t border-stone-200 pt-5">
            <div className="mb-3 text-[12px] font-medium uppercase tracking-wider text-sage-700">Economic cost of ownership</div>
            <StatGrid>
              <Stat label="Per month" value={sgd(r.economicCostMonthly)} size="lg" />
              <Stat label="Per year" value={sgd(r.economicCostAnnual)} />
              <Stat label="Per km" value={r.costPerKm === null ? '—' : sgdCents(r.costPerKm)} hint={r.costPerKm === null ? 'Enter annual mileage' : undefined} />
              <Stat label={`Total over ${state.ownershipYears} years`} value={sgd(r.economicCost)} hint={`${sgd(r.depreciation)} depreciation + ${sgd(r.economicCost - r.depreciation - r.runningMonthly * months - state.otherUpfrontCosts)} interest + running costs`} className="col-span-2 sm:col-span-3" />
            </StatGrid>
          </div>
          {state.alternativeTransportMonthly > 0 && (
            <div className="border-t border-stone-200 pt-5">
              <div className="mb-3 text-[12px] font-medium uppercase tracking-wider text-sage-700">Versus your alternative</div>
              <StatGrid>
                <Stat label="Alternative transport over the period" value={sgd(r.alternativeTotal)} hint={`${sgd(state.alternativeTransportMonthly)} per month`} />
                <Stat label={r.differenceVsAlternative > 0 ? 'Car costs more by' : 'Car costs less by'} value={sgd(Math.abs(r.differenceVsAlternative))} tone={r.differenceVsAlternative > 0 ? 'caution' : 'positive'} />
              </StatGrid>
            </div>
          )}
          {r.runningMonthly === 0 && <Note>Add running costs (insurance, road tax, fuel, parking, servicing) for a realistic picture; they are usually the second-largest cost after depreciation.</Note>}
        </ResultsPanel>
      }
    >
      <InputGroup title="Purchase and financing">
        <SliderField label="Purchase price (including COE and duties)" benchmark={BENCHMARKS.coePrice} prefix="S$" min={10000} max={500000} step={1000} value={state.purchasePrice} onChange={set('purchasePrice')} />
        <SliderField label="Initial payment" benchmark={BENCHMARKS.carDownPayment} benchmarkValue={state.purchasePrice > 0 ? Math.round((state.purchasePrice * 0.3) / 1000) * 1000 : undefined} prefix="S$" min={0} max={Math.max(10000, state.purchasePrice)} step={1000} value={state.initialPayment} onChange={set('initialPayment')} help={`Loan amount: ${sgd(r.loanAmount)}. Minimum down payments and maximum tenures for car loans are regulated; check with your lender.`} />
        <SliderField label="Other upfront costs" prefix="S$" min={0} max={30000} step={100} value={state.otherUpfrontCosts} onChange={set('otherUpfrontCosts')} help="Registration, first insurance, accessories, in-vehicle unit." />
        <Segmented
          label="Loan type"
          value={state.loanType}
          onChange={(v) => set('loanType')(v)}
          options={[
            { value: 'flat', label: 'Flat rate (typical for car loans)' },
            { value: 'reducing', label: 'Reducing balance' },
          ]}
        />
        <SliderField label="Loan interest rate" benchmark={BENCHMARKS.carLoanRate} suffix="% p.a." min={0} max={8} step={0.05} value={state.loanInterestPct} onChange={set('loanInterestPct')} format={(n) => `${n.toFixed(2)}% p.a.`} />
        <SliderField label="Loan tenure" benchmark={BENCHMARKS.carLoanTenure} suffix="years" min={1} max={7} step={1} value={state.loanTenureYears} onChange={set('loanTenureYears')} allowAboveMax={false} help={r.loanAmount > 0 ? `${sgd(r.loanMonthly)} per month · ${sgd(r.totalLoanInterest)} total interest over ${r.loanMonths} months` : 'No loan at this initial payment'} />
      </InputGroup>

      <InputGroup title="Ownership and resale">
        <SliderField label="Ownership period" benchmark={BENCHMARKS.ownershipYears} suffix="years" min={1} max={10} step={1} value={state.ownershipYears} onChange={set('ownershipYears')} allowAboveMax={false} />
        <SliderField label="Estimated resale value at the end" benchmark={BENCHMARKS.carResale} benchmarkValue={state.purchasePrice > 0 ? Math.round((state.purchasePrice * 0.45) / 1000) * 1000 : undefined} prefix="S$" min={0} max={Math.max(10000, state.purchasePrice)} step={1000} value={state.resaleValueAtEnd} onChange={set('resaleValueAtEnd')} help={`Depreciation: ${sgd(r.depreciation)} over the period (${sgd(months > 0 ? r.depreciation / months : 0)} per month). Include expected COE or PARF rebates in the resale estimate.`} />
        <SliderField label="Expected annual mileage" benchmark={BENCHMARKS.mileage} suffix="km" min={0} max={40000} step={500} value={state.annualMileageKm} onChange={set('annualMileageKm')} />
      </InputGroup>

      <InputGroup title="Running costs">
        <SliderField label="Insurance (per year)" benchmark={BENCHMARKS.carInsurance} prefix="S$" min={0} max={8000} step={50} value={state.insuranceAnnual} onChange={set('insuranceAnnual')} />
        <SliderField label="Road tax (per year)" benchmark={BENCHMARKS.roadTax} prefix="S$" min={0} max={5000} step={10} value={state.roadTaxAnnual} onChange={set('roadTaxAnnual')} help="Depends on engine capacity or power; see OneMotoring." />
        <SliderField label="Fuel or charging (per month)" benchmark={BENCHMARKS.fuel} prefix="S$" min={0} max={1500} step={10} value={state.fuelMonthly} onChange={set('fuelMonthly')} />
        <SliderField label="Parking (per month)" benchmark={BENCHMARKS.parking} prefix="S$" min={0} max={1500} step={10} value={state.parkingMonthly} onChange={set('parkingMonthly')} help="Season parking at home and work, plus casual parking." />
        <SliderField label="ERP and road-related charges (per month)" benchmark={BENCHMARKS.erp} prefix="S$" min={0} max={500} step={5} value={state.erpAndTollsMonthly} onChange={set('erpAndTollsMonthly')} />
        <SliderField label="Maintenance, servicing and tyres (per year)" benchmark={BENCHMARKS.maintenance} prefix="S$" min={0} max={6000} step={50} value={state.maintenanceAnnual} onChange={set('maintenanceAnnual')} />
      </InputGroup>

      <InputGroup title="Compare with an alternative" description="Your realistic monthly budget for public transport, ride-hailing, car-sharing and taxis.">
        <SliderField label="Alternative transport budget (per month)" benchmark={BENCHMARKS.alternativeTransport} prefix="S$" min={0} max={3000} step={10} value={state.alternativeTransportMonthly} onChange={set('alternativeTransportMonthly')} />
        <ColumnChart
          ariaLabel="Monthly economic cost of the car compared with the alternative budget"
          items={[
            { label: 'Car (economic)', value: r.economicCostMonthly, highlight: true },
            { label: 'Car (cash, while loan runs)', value: r.cashOutflowMonthly },
            { label: 'Alternative', value: state.alternativeTransportMonthly },
          ]}
        />
      </InputGroup>

      <InputGroup title="Where the economic cost goes" description={`Over ${state.ownershipYears} years.`}>
        <BarList
          ariaLabel="Economic cost components"
          items={[
            { label: 'Depreciation', value: r.depreciation },
            { label: 'Loan interest (within period)', value: Math.max(0, r.economicCost - r.depreciation - r.runningMonthly * months - state.otherUpfrontCosts) },
            { label: 'Insurance, road tax, maintenance', value: ((state.insuranceAnnual + state.roadTaxAnnual + state.maintenanceAnnual) / 12) * months },
            { label: 'Fuel, parking, ERP', value: (state.fuelMonthly + state.parkingMonthly + state.erpAndTollsMonthly) * months },
            { label: 'Other upfront costs', value: state.otherUpfrontCosts },
          ]}
        />
        <DefinitionList dense rows={[{ label: 'Economic cost over the period', value: sgd(r.economicCost), emphasis: true }, { label: 'Total cash outflow over the period', value: sgd(r.totalCashOutflow) }, { label: 'Difference (cash includes loan principal; economic includes depreciation)', value: sgd(r.totalCashOutflow - r.economicCost) }]} />
      </InputGroup>
    </CalculatorShell>
  );
}
