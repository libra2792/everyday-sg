# Everyday SG — Your guide to adulting in Singapore

An independent, privacy-first life-admin toolkit for adults living in Singapore: plain-English guides, interactive calculators, persistent checklists and links to the agencies that run each process.

It is **not a government website**, is not affiliated with any agency, and cannot submit applications on anyone's behalf. Content is general information; calculators are estimates built from the user's own inputs.

## What's inside

| Area | Details |
| --- | --- |
| **Home** | Search, quick actions, life-stage selector, popular calculators, featured guides, personalised "Your next steps", "Due soon" tasks |
| **Life Guides** | 41 guides across 12 categories, each with: plain-English explanation, who/when, step sequence, documents, costs and decisions, mistakes and tips, eligibility notes, official links, related tools, and a checklist that persists |
| **Calculators** | Household budget · Emergency fund and debt repayment · Housing affordability and mortgage · Baby and childcare budget · Retirement projection · Insurance needs organiser · Caregiving and eldercare cost planner · Car ownership total cost |
| **Tools** | Annual tax preparation checklist (organiser + IRAS links; deliberately no tax-rate engine) · Annual life-admin checklist (8 sections) |
| **My Plan** | Optional profile (7 broad questions), ranked next steps, dated tasks, checklist progress, JSON export/import, printable summary, one-click reset |
| **Saved Items** | Bookmarked guides/calculators/tools and saved results snapshots |
| **About** | Privacy statement, verification policy, full list of official sources with how/when each was checked |
| **Appearance** | Four themes — Sage (default), Playful, Dark, Professional — switchable from the header, the footer or My Plan; saved locally, with Dark following the OS setting until a choice is made |

### Privacy model

- Everything the user enters (profile, checklist ticks, saved items, tasks, calculator inputs) is stored in `localStorage` under the `everydaysg:` prefix.
- Nothing is transmitted anywhere. There is no backend, no account, no analytics, no third-party scripts or fonts.
- Export/import produces a JSON bundle of those keys; "Reset all saved data" removes them.
- No NRIC, Singpass, bank, address or health data is requested.

### Information accuracy

- `src/data/sources.ts` is the registry of official links. Each entry records how it was checked (`content` = page read, `link` = confirmed to exist, `unchecked`) and the date. Pages render these labels verbatim; nothing displays a verification date that was not actually recorded.
- Guides carry `infoType` (`official` vs `general`) and an optional `reviewedOn` date. Guides without a review date are labelled as general guides to confirm with the agency.
- Amounts, caps, eligibility rules, tax rates and deadlines are intentionally **not** hard-coded. The tax tool is an organiser with links rather than an estimator because the current IRAS rate tables could not be verified from the official source during build.

## Tech stack

- [Vite](https://vite.dev) 8 + [React](https://react.dev) 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4 (via `@tailwindcss/vite`), design tokens in `src/index.css`
- [React Router](https://reactrouter.com) 7 (browser router; Netlify SPA redirect configured)
- [lucide-react](https://lucide.dev) line icons
- [Fontsource](https://fontsource.org) self-hosted fonts (latin subsets)
- [Vitest](https://vitest.dev) + Testing Library + jsdom for tests
- No backend, database, API keys or paid services

## Project structure

```
everyday-sg/
├── index.html
├── netlify.toml                 # build command, publish dir, SPA redirect, headers
├── package.json
├── vite.config.ts               # React + Tailwind plugins, @ alias, Vitest config
├── tsconfig.json
├── public/                      # favicon, robots.txt
└── src/
    ├── main.tsx                 # entry: BrowserRouter + AppStateProvider
    ├── App.tsx                  # routes (calculators/tools are lazy-loaded)
    ├── index.css                # Tailwind theme tokens, base styles, print styles
    ├── app.test.tsx             # DOM smoke tests (pages, calculators, persistence)
    ├── components/
    │   ├── layout/AppShell.tsx  # header, mobile tab bar, footer, skip link
    │   ├── ui/                  # Button, Field (NumberField, SliderField, Select…), Panel, Misc, Icon
    │   ├── charts/Charts.tsx    # BarList, StackedBar, LineChart, ColumnChart (responsive SVG)
    │   ├── calculators/CalculatorShell.tsx
    │   ├── Checklist.tsx        # persistent checklist (grouped, essential/optional)
    │   ├── GuideCard.tsx, SaveButton.tsx, SearchBox.tsx, SourceNote.tsx
    ├── data/
    │   ├── types.ts             # Guide, Category, Source, CalculatorMeta…
    │   ├── categories.ts        # 12 categories + 5 life stages
    │   ├── calculators.ts       # calculator/tool registry (routes, tags)
    │   ├── checklists.ts        # tax-prep and annual-admin checklist content
    │   ├── sources.ts           # official link registry with verification status
    │   └── guides/              # one file per category + index.ts
    ├── lib/
    │   ├── finance.ts           # all calculation functions (pure, NaN-safe)
    │   ├── finance.test.ts      # unit tests (boundaries + realistic samples)
    │   ├── format.ts            # SGD / percentage / date formatting
    │   ├── storage.ts           # namespaced localStorage, export/import/reset
    │   ├── usePersistentState.ts
    │   ├── search.ts            # scored search with synonyms
    │   ├── recommend.ts         # profile → ranked recommendations
    │   └── dates.ts
    ├── state/AppState.tsx       # profile, checklist progress, saved items, tasks
    └── pages/                   # Home, Guides, GuidePage, Calculators, MyPlan, ProfilePage,
        ├── calculators/         #   Saved, SearchPage, About, NotFound
        └── tools/
```

### Themes

All colours, radii and fonts are CSS variables in `src/index.css`. The bare `:root` block is the Sage theme; `:root[data-theme="playful"]`, `[data-theme="dark"]` and `[data-theme="professional"]` override the same variables, and a `@theme inline` block maps them onto Tailwind's tokens (`bg-canvas`, `text-ink`, `border-stone-200`, `rounded-lg`…). To change a theme, edit its variables; to add one, copy a block, add its id to `THEMES` in `src/lib/theme.ts` and to the `valid` list in `index.html`. Fonts (Inter, Nunito, IBM Plex Sans/Serif) are self-hosted via Fontsource, so no third-party requests are made.

### Adding content

- **New guide:** add an object to the relevant file in `src/data/guides/` (follow the `Guide` type). It is automatically searchable, filterable, recommendable and gets a persistent checklist. Reference sources by id from `src/data/sources.ts`.
- **New source:** add to `SOURCES` with an honest `check`/`checkedOn`.
- **New calculator:** add the pure calculation to `src/lib/finance.ts` (+ tests), register metadata in `src/data/calculators.ts`, build the page with `CalculatorShell`, and add the lazy route in `src/App.tsx`.

## Local development

Requirements: Node.js 20.19+ (22 recommended) and npm.

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm test             # vitest run (unit + DOM smoke tests)
npm run typecheck    # tsc --noEmit
npm run build        # typecheck + production build to dist/
npm run preview      # serve dist/ locally (http://localhost:4173)
```

## Deploying to Netlify

Use your own GitHub and Netlify accounts; nothing in the project is tied to any account. `public/_redirects` and `netlify.toml` both carry the SPA redirect, so Git-based, CLI and drag-and-drop deploys all work.

### 1. Put the project on GitHub

```bash
cd everyday-sg
git init
git add .
git commit -m "Everyday SG — initial version"
# create an empty repository on GitHub, then:
git remote add origin https://github.com/<your-user>/everyday-sg.git
git branch -M main
git push -u origin main
```

### 2. Create the Netlify site

1. In Netlify, choose **Add new site → Import an existing project** and connect the GitHub repository.
2. Netlify reads `netlify.toml`, so the settings are pre-filled:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 22 (from `[build.environment]`)
3. Click **Deploy site**. The SPA redirect (`/* → /index.html 200`) and security headers are already in `netlify.toml`, so deep links such as `/calculators/housing` work after deployment.

### 3. Deploy without GitHub (optional)

Fastest path, no Git needed: run `npm run build`, open the Netlify dashboard → **Sites → Add new site → Deploy manually**, and drag the `dist` folder onto the page. Deep links keep working because `dist/_redirects` is included in the build.

Or from the terminal:

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

(Log in with the account you want when prompted; `netlify.toml` is honoured for redirects and headers.)

### Environment variables, secrets, backend

None are required. The site is entirely static and all user data stays in the browser.

## Testing

- `src/lib/finance.test.ts` — 35 tests covering mortgage/flat-rate maths against known values, budget totals, emergency fund, debt payoff (avalanche vs snowball, insufficient payments, zero-rate), housing splits, baby budget scaling, retirement projection (closed-form future value, growing annuity, funds-run-out detection), insurance need, caregiving shares and inflation, car cash-vs-economic cost — including zero/empty/negative/extreme inputs.
- `src/app.test.tsx` — renders every guide page, exercises each calculator through the DOM (typing into inputs and moving sliders), verifies checklist persistence across remounts, reset behaviour, profile saving and recommendations, search and 404.

## Known limitations (first version)

- Calculators are educational estimates. They do not model HDB/MAS loan rules, grants, lender approval, CPF LIFE payouts, tax rates or subsidy eligibility; they link to the official tools instead.
- The tax tool has no numerical tax estimator (the IRAS rate table could not be verified from the official page at build time); it organises documents and links to IRAS.
- Guides marked "General guide — not yet reviewed against official sources" should be reviewed against the linked agency pages before a public launch; 10 guides were reviewed against their sources on 24 Oct 2026.
- Data lives only in the current browser; cross-device sync requires the JSON export/import.
