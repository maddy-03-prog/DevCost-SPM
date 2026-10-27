# DevCost Project Guide

## Stack

React, Vite, TypeScript, Tailwind CSS, React Router, Recharts, Framer Motion,
lucide-react, jsPDF, Zustand, and Vitest.

## Folder structure

- `src/components/` — reusable UI, charts, and layout
- `src/pages/` — application pages
- `src/lib/estimation/` — typed estimation formulas and formatters
- `src/store/` — shared persisted project state
- `src/hooks/` — reusable React hooks
- `src/data/` — constants and estimation driver tables
- `src/test/` — test setup and shared test utilities

## Rules

- All formulas are pure typed functions in `src/lib/estimation` with Vitest tests.
- Never put math inside components.
- Run build, lint and tests after every phase.
