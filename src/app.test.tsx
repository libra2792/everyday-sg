// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AppStateProvider } from './state/AppState';
import { GUIDES } from './data/guides';
import { CALCULATORS } from './data/calculators';
import { SOURCES } from './data/sources';
import { CATEGORIES } from './data/categories';
import { CREATOR } from './data/creator';
import { BENCHMARKS, type Benchmark } from './data/benchmarks';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.scrollTo = vi.fn();
});

describe('content integrity', () => {
  it('every guide has unique ids, a checklist, valid category, sources and related links', () => {
    const ids = new Set<string>();
    const categoryIds = new Set(CATEGORIES.map((c) => c.id));
    const sourceIds = new Set(SOURCES.map((s) => s.id));
    const calcIds = new Set(CALCULATORS.map((c) => c.id));
    const guideIds = new Set(GUIDES.map((g) => g.id));
    for (const g of GUIDES) {
      expect(ids.has(g.id), `duplicate guide id ${g.id}`).toBe(false);
      ids.add(g.id);
      expect(categoryIds.has(g.categoryId)).toBe(true);
      expect(g.checklist.length).toBeGreaterThan(2);
      expect(new Set(g.checklist.map((c) => c.id)).size).toBe(g.checklist.length);
      for (const s of g.officialLinks) expect(sourceIds.has(s), `${g.id} references unknown source ${s}`).toBe(true);
      for (const c of g.relatedCalculators) expect(calcIds.has(c), `${g.id} references unknown calculator ${c}`).toBe(true);
      for (const r of g.relatedGuides) expect(guideIds.has(r), `${g.id} references unknown guide ${r}`).toBe(true);
      expect(g.steps.length).toBeGreaterThan(2);
      expect(g.keyPoints.length).toBeGreaterThan(1);
      expect(g.icon).toBeTruthy();
    }
    expect(GUIDES.length).toBeGreaterThanOrEqual(36);
    // every category has at least two guides
    for (const c of CATEGORIES) expect(GUIDES.filter((g) => g.categoryId === c.id).length).toBeGreaterThanOrEqual(2);
  });

  it('every source uses https and a checked date only when actually checked', () => {
    for (const s of SOURCES) {
      expect(s.url.startsWith('https://')).toBe(true);
      if (s.check === 'unchecked') expect(s.checkedOn).toBeUndefined();
      else expect(s.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('pages render', () => {
  it('renders the home page with search, quick actions and sections', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: /adulting in singapore/i })).toBeTruthy();
    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.getByRole('link', { name: /plan my finances/i })).toBeTruthy();
    expect(screen.getByText(/your next steps/i)).toBeTruthy();
    expect(screen.getByText(/popular calculators/i)).toBeTruthy();
  });

  it('renders the guide library, filters by category and opens a guide', async () => {
    renderAt('/guides?category=housing');
    expect(await screen.findByText(/guides in housing/i)).toBeTruthy();
    const link = screen.getAllByRole('link', { name: /bto or resale hdb flat/i })[0];
    fireEvent.click(link);
    expect(await screen.findByRole('heading', { level: 1, name: /bto or resale hdb flat/i })).toBeTruthy();
    expect(screen.getAllByText(/official next steps/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/your checklist/i).length).toBeGreaterThan(0);
  });

  it('guide page: quick check answers change the verdict, a related guide opens with a trail bar, and a calculator opens pre-filled', async () => {
    renderAt('/guides/home-affordability-and-loans');
    expect(screen.getByRole('heading', { level: 2, name: /your situation/i })).toBeTruthy();
    expect(screen.getByText(/waiting for your numbers/i)).toBeTruthy();
    const income = screen.getByLabelText(/gross monthly household income/i) as HTMLInputElement;
    fireEvent.focus(income);
    fireEvent.change(income, { target: { value: '9000' } });
    fireEvent.change(screen.getByLabelText(/cash you can commit/i), { target: { value: '60000' } });
    fireEvent.change(screen.getByLabelText(/cpf oa you can commit/i), { target: { value: '90000' } });
    expect(await screen.findByText(/comfortable up to about S\$600k/i)).toBeTruthy();
    expect(screen.getByText(/drawn from your answers above/i)).toBeTruthy();
    // keep reading → another guide, with the trail bar
    const keepReading = screen.getByRole('heading', { level: 2, name: /keep reading/i }).closest('section')!;
    fireEvent.click(within(keepReading).getByRole('link', { name: /bto or resale hdb flat/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /bto or resale hdb flat/i })).toBeTruthy();
    expect(screen.getByText(/new page/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /back to what home can you afford/i })).toBeTruthy();
    // run the numbers → calculator, pre-filled from the quick check
    fireEvent.click(screen.getByRole('button', { name: /back to what home can you afford/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /what home can you afford/i })).toBeTruthy();
    const doNext = screen.getByText(/do next/i).parentElement!;
    fireEvent.click(within(doNext).getByRole('link', { name: /housing affordability and mortgage/i }));
    expect(await screen.findByRole('heading', { level: 1, name: /housing affordability and mortgage/i })).toBeTruthy();
    expect(await screen.findByText(/filled in from your answers in the guide/i)).toBeTruthy();
    await waitFor(() => expect((screen.getByLabelText(/^Estimated property price$/i) as HTMLInputElement).value).toBe('600000'));
    expect(screen.getByText(/you are now in a/i)).toBeTruthy();
  });

  it('renders every guide page without crashing', () => {
    for (const g of GUIDES) {
      cleanup();
      renderAt(`/guides/${g.id}`);
      expect(screen.getByRole('heading', { level: 1, name: g.title })).toBeTruthy();
    }
  });

  it('shows search results and a 404', async () => {
    renderAt('/search?q=lpa');
    expect(await screen.findByText(/results? for “lpa”/i)).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /lasting power of attorney/i }).length).toBeGreaterThan(0);
    cleanup();
    renderAt('/does-not-exist');
    expect(screen.getByText(/that page does not exist/i)).toBeTruthy();
  });

  it('renders the about, saved, plan and calculators index pages', () => {
    renderAt('/about');
    expect(screen.getByRole('heading', { level: 1, name: /about everyday sg/i })).toBeTruthy();
    cleanup();
    renderAt('/saved');
    expect(screen.getByText(/nothing saved yet/i)).toBeTruthy();
    cleanup();
    renderAt('/plan');
    expect(screen.getByText(/no profile yet/i)).toBeTruthy();
    cleanup();
    renderAt('/calculators');
    expect(screen.getByRole('heading', { level: 1, name: /calculators and tools/i })).toBeTruthy();
  });

  it('renders the creator page with its story sections and photos', () => {
    renderAt('/creator');
    expect(screen.getByRole('heading', { level: 1, name: /figuring this out too/i })).toBeTruthy();
    for (const section of CREATOR.sections) {
      expect(screen.getByRole('heading', { level: 2, name: section.title })).toBeTruthy();
    }
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(1 + CREATOR.sections.reduce((n, s) => n + (s.photos?.length ?? 0), 0));
    for (const img of images) expect((img as HTMLImageElement).alt.length).toBeGreaterThan(10);
    expect(screen.getAllByRole('link', { name: /about page/i }).length).toBeGreaterThan(0);
    for (const s of CREATOR.socials) {
      const links = screen.getAllByRole('link', { name: new RegExp(s.label, 'i') }) as HTMLAnchorElement[];
      expect(links.length).toBeGreaterThan(0);
      expect(links.every((l) => l.href === s.url && l.target === '_blank' && /noopener/.test(l.rel))).toBe(true);
    }
  });
});

describe('checklist persistence', () => {
  it('keeps ticks across remounts', async () => {
    renderAt('/guides/emergency-fund');
    const box = (await screen.findAllByRole('checkbox'))[0] as HTMLInputElement;
    expect(box.checked).toBe(false);
    fireEvent.click(box);
    expect(box.checked).toBe(true);
    cleanup();
    renderAt('/guides/emergency-fund');
    const again = (await screen.findAllByRole('checkbox'))[0] as HTMLInputElement;
    expect(again.checked).toBe(true);
    expect(window.localStorage.getItem('everydaysg:checklists')).toContain('emergency-fund');
  });
});

describe('calculators recompute from inputs', () => {
  async function setNumber(label: RegExp | string, value: number) {
    const input = (await screen.findByLabelText(label)) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: String(value) } });
    fireEvent.blur(input);
    return input;
  }

  it('budget: surplus and savings rate update, categories can be added and removed', async () => {
    renderAt('/calculators/budget');
    await setNumber(/^Monthly take-home income$/i, 5000);
    await setNumber(/^Housing \(rent, mortgage, conservancy\) amount$/i, 1500);
    await setNumber(/^Savings and investments amount$/i, 1000);
    const results = screen.getByRole('complementary', { name: /results/i });
    await waitFor(() => expect(within(results).getByText(/monthly surplus/i)).toBeTruthy());
    expect(within(results).getAllByText('$2,500').length).toBeGreaterThan(0);
    expect(within(results).getByText('20%')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /add category/i }));
    expect(screen.getAllByDisplayValue(/new category/i).length).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: /remove new category/i }));
    expect(screen.queryByDisplayValue(/new category/i)).toBeNull();
  });

  it('emergency fund and debt: computes target and payoff, slider and number stay in sync', async () => {
    renderAt('/calculators/emergency-debt');
    await setNumber(/^Essential monthly expenses$/i, 2000);
    const results = screen.getByRole('complementary', { name: /results/i });
    await waitFor(() => expect(within(results).getAllByText('$12,000').length).toBeGreaterThan(0));
    const slider = screen.getByRole('slider', { name: /desired coverage slider/i }) as HTMLInputElement;
    expect(slider.value).toBe('6');
    fireEvent.change(slider, { target: { value: '3' } });
    await waitFor(() => expect(within(results).getAllByText('$6,000').length).toBeGreaterThan(0));
    expect((screen.getByLabelText(/^Desired coverage$/i) as HTMLInputElement).value).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: /add a debt/i }));
    await setNumber(/debt 1 balance/i, 3000);
    await setNumber(/debt 1 interest rate/i, 24);
    await setNumber(/debt 1 minimum payment/i, 150);
    await waitFor(() => expect(within(results).getByText(/paid off in/i)).toBeTruthy());
    expect(within(results).queryByText(/not within 100 years/i)).toBeNull();
  });

  it('housing: monthly payment responds to price and rate', async () => {
    renderAt('/calculators/housing');
    await setNumber(/^Estimated property price$/i, 400000);
    const dp = screen.getByRole('slider', { name: /down payment slider/i });
    fireEvent.change(dp, { target: { value: '25' } });
    await setNumber(/^Loan interest rate$/i, 3);
    await setNumber(/^Loan tenure$/i, 25);
    const results = screen.getByRole('complementary', { name: /results/i });
    // 300,000 at 3% over 25 years = 1,422.63
    await waitFor(() => expect(within(results).getAllByText('$1,423').length).toBeGreaterThan(0));
    await setNumber(/^Loan interest rate$/i, 4);
    await waitFor(() => expect(within(results).getAllByText('$1,584').length).toBeGreaterThan(0));
  });

  it('baby: scenario selection changes the monthly total', async () => {
    renderAt('/calculators/baby');
    await setNumber(/^Monthly infant costs$/i, 500);
    await setNumber(/infant care centre monthly fee/i, 1500);
    await setNumber(/infant care centre subsidy estimate/i, 300);
    const results = screen.getByRole('complementary', { name: /results/i });
    await waitFor(() => expect(within(results).getAllByText('$500').length).toBeGreaterThan(0));
    const radios = screen.getAllByRole('radio', { name: /use/i });
    fireEvent.click(radios[1]);
    await waitFor(() => expect(within(results).getAllByText('$1,700').length).toBeGreaterThan(0));
  });

  it('retirement: projected savings change with contributions and show a shortfall', async () => {
    renderAt('/calculators/retirement');
    await setNumber(/^Current age$/i, 40);
    await setNumber(/^Intended retirement age$/i, 65);
    await setNumber(/^Monthly contributions$/i, 500);
    await setNumber(/^Expected monthly retirement spending \(today's dollars\)$/i, 3000);
    const results = screen.getByRole('complementary', { name: /results/i });
    await waitFor(() => expect(within(results).getByText(/shortfall at retirement/i)).toBeTruthy());
    const before = within(results).getByText(/projected savings at retirement/i).nextElementSibling?.textContent;
    await setNumber(/^Monthly contributions$/i, 1500);
    await waitFor(() => expect(within(results).getByText(/projected savings at retirement/i).nextElementSibling?.textContent).not.toBe(before));
  });

  it('insurance: need and gap update', async () => {
    renderAt('/calculators/insurance');
    await setNumber(/^Annual household living expenses$/i, 50000);
    await setNumber(/^Years of income replacement wanted$/i, 10);
    await setNumber(/^Existing life coverage$/i, 200000);
    const results = screen.getByRole('complementary', { name: /results/i });
    await waitFor(() => expect(within(results).getAllByText('$500,000').length).toBeGreaterThan(0));
    expect(within(results).getAllByText('$300,000').length).toBeGreaterThan(0);
  });

  it('caregiving: contributions and shortfall update', async () => {
    renderAt('/calculators/caregiving');
    await setNumber(/^Helper \(salary, levy, insurance, food\)$/i, 1000);
    await setNumber(/^Medical and medication$/i, 200);
    await setNumber(/^Me share$/i, 50);
    await setNumber(/^Sibling share$/i, 25);
    const results = screen.getByRole('complementary', { name: /results/i });
    await waitFor(() => expect(within(results).getAllByText('$1,200').length).toBeGreaterThan(0));
    expect(within(results).getAllByText('$300').length).toBeGreaterThan(0); // shortfall or sibling share
  });

  it('car: cash outflow and economic cost update with running costs', async () => {
    renderAt('/calculators/car');
    await setNumber(/^Fuel or charging \(per month\)$/i, 300);
    await setNumber(/^Parking \(per month\)$/i, 200);
    const results = screen.getByRole('complementary', { name: /results/i });
    await waitFor(() => expect(within(results).queryByText(/add running costs/i)).toBeNull());
    expect(within(results).getByText(/economic cost of ownership/i)).toBeTruthy();
    await setNumber(/^Alternative transport budget \(per month\)$/i, 400);
    await waitFor(() => expect(within(results).getByText(/car costs more by/i)).toBeTruthy());
  });

  it('tools: tax prep and annual admin render with persistent checklists', async () => {
    renderAt('/tools/tax-prep');
    expect(await screen.findByRole('heading', { level: 1, name: /tax preparation/i })).toBeTruthy();
    const boxes = screen.getAllByRole('checkbox');
    fireEvent.click(boxes[0]);
    expect((boxes[0] as HTMLInputElement).checked).toBe(true);
    cleanup();
    renderAt('/tools/annual-admin');
    expect(await screen.findByRole('heading', { level: 1, name: /annual life-admin/i })).toBeTruthy();
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(20);
  });

  it('benchmarks: every statistic cites a checked source, and "Use" fills the field', async () => {
    for (const [id, b] of Object.entries(BENCHMARKS as Record<string, Benchmark>)) {
      expect(b.text.length, id).toBeGreaterThan(20);
      if (b.kind === 'statistic') {
        expect(b.sourceId, id).toBeTruthy();
        expect(b.checkedOn, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(SOURCES.some((s) => s.id === b.sourceId && s.check !== 'unchecked'), id).toBe(true);
      }
      if (b.sourceId) expect(SOURCES.some((s) => s.id === b.sourceId), id).toBe(true);
    }
    renderAt('/calculators/budget');
    const use = await screen.findByRole('button', { name: /^Use S\$3,950$/ });
    fireEvent.click(use);
    const income = screen.getByLabelText(/^Monthly take-home income$/i) as HTMLInputElement;
    expect(income.value).toBe('3950');
    expect(screen.getByRole('button', { name: /S\$3,950 applied/i })).toBeTruthy();
    expect(screen.getAllByText(/official figure/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/planning guide/i).length).toBeGreaterThan(0);
  });

  it('reset clears saved inputs', async () => {
    renderAt('/calculators/insurance');
    await setNumber(/^Annual household living expenses$/i, 50000);
    await waitFor(() => expect(window.localStorage.getItem('everydaysg:calc:insurance')).toContain('50000'));
    fireEvent.click(screen.getByRole('button', { name: /reset inputs/i }));
    await waitFor(() => expect(window.localStorage.getItem('everydaysg:calc:insurance')).toBeNull());
  });
});

describe('appearance', () => {
  it('switches theme from the header menu and persists it', async () => {
    renderAt('/guides');
    fireEvent.click(screen.getByRole('button', { name: /appearance:/i }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Professional' }));
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('professional'));
    expect(window.localStorage.getItem('everydaysg:theme')).toBe('"professional"');
    cleanup();
    renderAt('/');
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('professional'));
    fireEvent.click(screen.getAllByRole('radio', { name: /sage/i })[0]);
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBeNull());
  });
});

describe('profile and recommendations', () => {
  it('saves a profile and surfaces personalised next steps', async () => {
    renderAt('/plan/profile');
    fireEvent.click(screen.getByLabelText(/prepare for a baby/i));
    fireEvent.click(screen.getByLabelText(/planning to buy/i));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
    });
    expect(await screen.findByText(/suggested next steps/i)).toBeTruthy();
    expect(screen.getAllByText(/preparing for a baby/i).length).toBeGreaterThan(0);
    expect(window.localStorage.getItem('everydaysg:profile')).toContain('baby');
  });
});
