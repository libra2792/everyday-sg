import type { GuideExtras } from '../types';
import { guide, num, official, sgd, tool } from '@/lib/quick';

export const TRANSPORT_EXTRAS: Record<string, GuideExtras> = {
  'car-ownership-costs': {
    quick: {
      intro: 'Depreciation, not fuel, is the biggest cost of a car here. Four numbers show the true monthly figure.',
      fields: [
        { id: 'price', label: 'Price including COE', type: 'money', benchmark: 'coePrice' },
        { id: 'years', label: 'Years you will keep it', type: 'number', suffix: 'years', default: 5, min: 1, max: 10, benchmark: 'ownershipYears' },
        { id: 'resale', label: 'Expected resale at the end', type: 'money', help: 'Cars commonly lose 50 to 60% of their price over five years; the PARF rebate and remaining COE support the value.' },
        { id: 'running', label: 'Running costs per month', type: 'money', help: 'Fuel, parking, ERP, insurance and road tax spread monthly, servicing. S$700 to 1,000 is common.' },
      ],
      evaluate: (a) => {
        const price = num(a.price);
        const years = Math.max(1, Math.round(num(a.years) || 5));
        const resale = Math.min(num(a.resale), price);
        const running = num(a.running);
        const dep = (price - resale) / (years * 12);
        const total = dep + running;
        const why: string[] = [];
        if (price === 0) why.push('Enter the price including COE.');
        else {
          why.push(`Depreciation: ${sgd(price - resale)} over ${years} years is ${sgd(dep)} a month before any loan interest.`);
          why.push(`With ${sgd(running)} of running costs, the car costs about ${sgd(total)} a month, ${sgd(total * 12)} a year, ${sgd(total * 12 * years)} over ${years} years.`);
          why.push('A loan adds interest on top; at 2.8% flat over five years on 70% of the price that is roughly another ' + sgd((price * 0.7 * 0.028 * 5) / 60) + ' a month.');
        }
        return {
          label: 'Pointer',
          verdict: price === 0 ? 'Waiting for your numbers' : `About ${sgd(total)} a month`,
          stats: price > 0 ? [{ label: 'Depreciation', value: `${sgd(dep)}/mo` }, { label: `Over ${years} years`, value: sgd(total * 12 * years) }] : undefined,
          why,
          next: [
            tool('car', price > 0 ? 'Opens with your price, years and resale; add the loan and each running cost.' : 'Build the full cost with loan, fuel, parking and insurance.', price > 0 ? { price, years, resale } : undefined),
            guide('car-vs-public-transport', 'Put it beside the alternative.'),
            official('onemotoring-ongoing', 'Road tax, insurance and other ongoing costs.'),
          ],
          fine: 'Depreciation uses your resale estimate; the market and the PARF rebate decide the real figure. Loan interest excluded here.',
          figure:
            price > 0
              ? {
                  type: 'stack',
                  title: 'What the car costs each month',
                  unit: 'sgd',
                  segments: [
                    { label: 'Depreciation', value: dep },
                    { label: 'Running costs', value: running },
                  ],
                  marker: { value: 300, label: 'public transport S$300' },
                  caption: 'Depreciation is usually the larger block; the dashed line is a typical public transport budget for comparison.',
                  aria: `Monthly car cost: depreciation ${sgd(dep)}, running ${sgd(running)}.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'stack',
      title: 'What a car costs each month (illustration: S$170,000 car, S$75,000 resale after 5 years, S$900 running)',
      unit: 'sgd',
      segments: [
        { label: 'Depreciation', value: 1583 },
        { label: 'Running costs', value: 900 },
      ],
      marker: { value: 300, label: 'public transport S$300' },
      caption: 'Enter your own price, years and resale above. The Category A COE alone closed at S$132,004 on 21 Oct 2026.',
      aria: 'Illustrative monthly car cost of about S$2,500 against a S$300 public transport marker.',
    },
  },

  'car-vs-public-transport': {
    quick: {
      intro: 'Put the two monthly figures side by side, then decide what the difference is buying you.',
      fields: [
        { id: 'car', label: 'Car, all-in per month', type: 'money', help: 'Depreciation, loan interest, fuel, parking, ERP, insurance, road tax, servicing. The car calculator gives this figure.' },
        { id: 'pt', label: 'Public transport and ride-hailing per month', type: 'money', benchmark: 'alternativeTransport' },
        { id: 'trips', label: 'Trips a week that really need a car', type: 'number', suffix: 'trips', default: 2, min: 0, max: 30 },
        { id: 'hire', label: 'Cost of a taxi or rental for those trips', type: 'money', help: 'Per month, if you did them without owning a car.' },
      ],
      evaluate: (a) => {
        const car = num(a.car);
        const pt = num(a.pt);
        const hire = num(a.hire);
        const alt = pt + hire;
        const diff = car - alt;
        const why: string[] = [];
        if (car === 0 || pt === 0) why.push('Enter both monthly figures; the car calculator gives the car one.');
        else {
          why.push(`Car ${sgd(car)} against ${sgd(alt)} for public transport plus the trips that need a car: ${diff > 0 ? `${sgd(diff)} a month, ${sgd(diff * 12)} a year, for the convenience` : 'the car is not more expensive on these numbers'}.`);
          if (diff > 0) why.push(`Over five years that difference is ${sgd(diff * 60)}: a renovation, a year of childcare, or a large part of a down payment.`);
          why.push('Time matters too: count the hours a car saves each week and price them honestly; for some commutes the car wins on that alone.');
        }
        return {
          label: 'Pointer',
          verdict: car === 0 || pt === 0 ? 'Waiting for your numbers' : diff > 0 ? `${sgd(diff)} a month for the car` : 'The car is not dearer here',
          stats: car > 0 && pt > 0 ? [{ label: 'Difference per year', value: sgd(Math.max(0, diff) * 12) }, { label: 'Over 5 years', value: sgd(Math.max(0, diff) * 60) }] : undefined,
          why,
          next: [tool('car', alt > 0 ? 'Opens with your alternative budget for the comparison.' : 'Build the car figure from each cost.', alt > 0 ? { alt } : undefined), guide('car-ownership-costs', 'Where the car figure comes from.'), official('lta-fares', 'Public transport fares and concessions.')],
          fine: 'Your own figures; the car calculator separates cash outflow from economic cost if you want the fuller picture.',
          figure:
            car > 0 && pt > 0
              ? {
                  type: 'band',
                  max: Math.ceil((Math.max(car, alt) * 1.15) / 500) * 500,
                  unit: 'sgd',
                  bars: [
                    { label: 'Car, all-in', value: car, strong: true },
                    { label: 'Public transport plus taxis for car-only trips', value: alt },
                  ],
                  caption: 'The two monthly figures. The gap is what owning a car costs over the alternative.',
                  aria: `Car ${sgd(car)} a month against ${sgd(alt)} for the alternative.`,
                }
              : undefined,
        };
      },
    },
    figure: {
      type: 'compare',
      options: ['Own a car', 'Public transport + taxis'],
      rows: [
        { label: 'Monthly cost', a: 1, b: 3, note: 'Typically S$1,500 to 2,500 against S$150 to 400' },
        { label: 'Door-to-door convenience', a: 3, b: 1 },
        { label: 'Flexibility (late nights, children, bulky loads)', a: 3, b: 2 },
        { label: 'Time predictability', a: 2, b: 2, note: 'Traffic against waiting' },
        { label: 'Admin and hassle', a: 1, b: 3, note: 'Loan, insurance, parking, servicing' },
      ],
      caption: 'What each option gives more of. Enter your own monthly figures above to put the first row in dollars.',
      aria: 'Comparison of owning a car and using public transport on cost, convenience, flexibility, predictability and hassle.',
    },
  },
};
