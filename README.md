# DevCost: Software Development Cost Estimator

DevCost is a responsive, local-first project estimation workspace built for a Software Project Management course. Compare effort models, inspect assumptions, plan a budget, and explore how project changes affect delivery.

## Setup

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`). Useful validation commands:

```bash
npm run build
npm run lint
npm test
```

There is no backend. The active project, settings, and saved scenarios persist in browser local storage. Use **Reports → Project JSON** to make a portable backup.

## Features

- Overview with the Iron Triangle, technique cards, Cone of Uncertainty, and live project summary.
- LOC, Function Point, and productivity-based effort calculators, including the 14 GSC ratings and language LOC conversion.
- Basic and Intermediate COCOMO with all 15 cost drivers, EAF, phase distribution, and staffing profile.
- Editable labor and non-labor budget, contingency/overhead/tax, currency formatting, and cash-flow charts.
- Five-method comparison with an effort range, variance insight, normalized chart, and qualitative method-fit radar.
- What-if sliders, impact deltas, driver sensitivity, and up to four saved scenarios.
- Executive report with module results, assumptions, risk notes, chart images in PDF, CSV export, JSON import/export, and print layout.
- Light, dark, and system themes; six accent presets and a custom color; compact/comfortable density; Indian/international number grouping.
- One-click QuickBite online food-delivery demo project.

## Formulas and modeling assumptions

All calculation logic is implemented as pure typed functions in `src/lib/estimation/` and covered with Vitest.

- **Basic COCOMO:** effort = `a × KLOC^b`; development time = `c × effort^d`; average people = `effort / time`.
  - Organic: `a=2.4, b=1.05, c=2.5, d=0.38`
  - Semi-detached: `a=3.0, b=1.12, c=2.5, d=0.35`
  - Embedded: `a=3.6, b=1.20, c=2.5, d=0.32`
- **Intermediate COCOMO:** effort = `a × KLOC^b × EAF`; EAF is the product of the 15 selected cost-driver multipliers. Intermediate coefficients and driver values are in `src/lib/estimation/cocomo.ts` and `src/data/drivers.ts`.
- **Function Points:** UFP is the weighted count total; VAF = `0.65 + 0.01 × ΣGSC`; AFP = `UFP × VAF`; effort = `AFP / FP productivity`. LOC conversion is Java 53, Python 35, JavaScript 47, C 128, C++ 55, and C# 54 LOC/FP.
- **PERT:** expected effort = `(O + 4M + P) / 6`; standard deviation = `(P − O) / 6`.
- **Effort conversions:** a person-month is 160 hours. LOC effort is total LOC divided by LOC/person-month; unit productivity converts unit-hours into person-months.
- **Budget:** personnel is headcount × monthly salary × allocation × months. Monthly cloud costs are multiplied by project duration. Overhead applies to direct cost; contingency applies to direct cost plus overhead; optional tax applies after contingency.
- **Phase distribution:** this teaching build uses a documented Boehm-inspired four-phase allocation (Plans & Requirements / Design / Coding / Integration & Test): Organic `6/40/38/16%`, Semi-detached `8/42/34/16%`, Embedded `10/43/32/15%`. Design combines product and detailed design effort. These values are illustrative phase shares, not a calibrated schedule baseline.
- **Staffing profile:** a normalized Rayleigh-style curve spreads effort across the estimated COCOMO duration. It is an indicative planning shape, not a hiring plan.
- **Comparison and scenarios:** method cost uses the shared average monthly salary; team-based duration and cash-flow charts are planning approximations and should be reviewed against real delivery constraints.

## Folder structure

```text
src/
  components/ui/       Reusable accessible form, card, modal, table, and chart components
  data/                COCOMO driver and method-fit data
  hooks/               Shared number formatting hook
  lib/estimation/      Pure formulas, report calculations, and Vitest tests
  pages/               Overview and seven estimation/report/settings modules
  store/               Persisted shared project and settings state
  test/                Vitest setup
```

## Screenshots

_Screenshots placeholder — add Overview, COCOMO, Budget, and Reports screenshots here._
