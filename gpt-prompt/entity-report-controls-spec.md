# Entity Report Controls – Spec

## Purpose
Interactive controls for the Entity page to select reporting period, report type, and main creditor. Outputs a normalized GraphQL-ready payload:

```ts
{
  report_period: ReportPeriodInput;
  report_type?: 'PRINCIPAL_AGGREGATED' | 'SECONDARY_AGGREGATED' | 'DETAILED';
  main_creditor_cui?: string;
}
```

## Requirements
- Period Type: YEAR | QUARTER | MONTH
  - Default: YEAR using last available year (from `defaultYearRange.end`).
  - When switching types, choose the last period inside the current scope:
    - YEAR → MONTH: last month of the selected year (YYYY-12)
    - YEAR → QUARTER: last quarter of the selected year (YYYY-10 anchor)
    - QUARTER → MONTH: end month of the quarter (03/06/09/12)
    - MONTH → QUARTER: quarter start anchor (01/04/07/10)
    - Any → YEAR: year anchor (YYYY-01)
- Period Selection:
  - YEAR: select a year
  - QUARTER: select year and quarter (1..4) – anchors: 01/04/07/10
  - MONTH: select year and month (01..12)
- Report Type: select one of the GraphQL enum values (mocked client-side for now):
  - PRINCIPAL_AGGREGATED
  - SECONDARY_AGGREGATED
  - DETAILED
- Main Creditor selection:
  - If entity has reports with `main_creditor`, show: All (default) + distinct creditors (up to two typical in data)

## Validation & Formatting
- Use `ISOYearMonth` as `YYYY-MM` (zero-padded months).
- QUARTER: only 01/04/07/10 anchors.
- YEAR: only 01 anchor.
- Internally keep a single `ISOYearMonth` state constrained to the current `ReportPeriodType`.
- Emit `ReportPeriodInput` as YEAR/QUARTER/MONTH with `selection.interval` where start=end to represent a single period.

## UI/UX
- Layout: 2 rows on desktop, stacked on mobile.
  - Row 1: Period Type + Period Selectors (contextual controls)
  - Row 2: Report Type + Main Creditor
- Controls: use shadcn UI `Select`. Keep labels concise.
- Immediate apply: fire `onChange` whenever a control changes.

## Integration
- Component: `EntityReportControls`
- Location: render near top of Entity Overview.
- Props:
```ts
type Props = {
  entity?: EntityDetailsData;
  defaultYear: number;
  onChange?: (payload: {
    report_period: ReportPeriodInput;
    report_type?: GqlReportType;
    main_creditor_cui?: string;
  }) => void;
}
```

## Helpers
- Implement in `src/schemas/reporting.ts`:
  - Types: `ISOYearMonth`, `ReportPeriodType`, `ReportPeriodInput`, `GqlReportType`.
  - Functions: `toYearAnchor`, `toQuarterAnchor`, `assertISOYearMonth`, `assertAnchored`, `deriveNextYmForType`.

## Out of Scope (Phase 1)
- Interval vs list selector (dates array).
- Wiring server calls end-to-end. Initial integration keeps UI state and exposes `onChange`.


