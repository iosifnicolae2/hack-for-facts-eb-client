# Client Normalization Spec (Decisions)

This file documents the client-side decisions for budget normalization (mode, currency, inflation, and growth) and how they are exposed in the UI and URLs.

## Terminology

- **Normalization mode**: how values are scaled (`total`, `per_capita`, `percent_gdp`).
- **Currency**: output currency for monetary modes (`RON`, `EUR`, `USD`).
- **Inflation adjustment**: constant 2024 prices (`inflation_adjusted: true|false`).
- **Period growth**: period-over-period change (`show_period_growth: true|false`).

## Server Semantics (Baseline)

- `normalization: percent_gdp` is an exclusive mode:
  - Currency is ignored.
  - Inflation adjustment is ignored.
  - Output unit is a percentage of GDP.
- If `show_period_growth: true`, output is a percentage change from the previous period.

## Global vs Local Controls (UI)

### Global (Side Panel)

- **Currency is a global setting** (applies across pages by default).
  - Persisted key: `user-currency`.
- **Prices (Nominal vs Real) is a global setting** (applies across pages by default).
  - `Nominal` → `inflation_adjusted: false`
  - `Real (2024)` → `inflation_adjusted: true`
  - Persisted key: `user-inflation-adjusted`.
- These global settings are intended to live in the side panel alongside other global preferences.

### Per-Page

- **Normalization mode remains per-page/context**.
  - The UI keeps the existing “Normalization” control, with the addition of `% of GDP`.
- **Period growth remains per-page**, because it is meaningful only for trend/time-series contexts.
  - Each page that renders trend charts should provide an explicit toggle for growth.

### Chart Editor Exception

- The chart editor can provide more granular currency control per-chart/series.
  - The rest of the application uses the global currency by default.

## Entity Page UX (Current Implementation)

### Controls

- **Entity report controls** show:
  - Period selection (year/quarter/month).
  - Report type.
  - Main creditor.
  - **Normalization mode** (`total`, `per_capita` when allowed, `percent_gdp`).
- **Entity report controls do not show currency or inflation.**
- **Growth toggle** is available where trend charts are shown (per-page), not in the report controls.

### Effective Options

- Currency comes from `user-currency`.
- Inflation adjustment comes from `user-inflation-adjusted`.
- The client forces `inflation_adjusted = false` when `normalization = percent_gdp`.

## URL / Share Link Behavior

### Entity Page

- URLs may contain legacy/override parameters:
  - `currency`
  - `inflation_adjusted`
  - legacy normalization values: `total_euro`, `per_capita_euro`
- Entity page behavior:
  - If `currency` exists in the URL, it is migrated into the global setting (`user-currency`) and removed from the URL.
  - If `inflation_adjusted` exists in the URL, it is migrated into the global setting (`user-inflation-adjusted`) and removed from the URL.
  - If legacy euro normalization exists:
    - `total_euro` → `normalization=total` + global `user-currency=EUR`
    - `per_capita_euro` → `normalization=per_capita` + global `user-currency=EUR`
    - The legacy value is replaced in the URL.

This keeps shared links functional while converging on the “currency/inflation are global” model.

## Implementation Notes (Where Things Live)

- Global currency hook: `src/lib/hooks/useUserCurrency.ts`
- Global inflation hook: `src/lib/hooks/useUserInflationAdjusted.ts`
- Entity URL schema (still accepts legacy params for migration): `src/components/entities/validation.ts`
