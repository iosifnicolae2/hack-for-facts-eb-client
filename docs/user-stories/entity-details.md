### Title

As an analyst, I want a 360° entity page with summary, trends, line items, reports, and map, so that I can understand finances in context.

### Context

Routes: `/entities/$cui` loader and lazy; hooks `useEntityDetails`, `useEntityViews`. Views: overview, reports, income/expense trends, map, ranking.

### Actors

- Analyst
- Citizen

### User Flow

1. Arrive via search or deep-link; year defaults to latest.
2. Use view switcher and year selector; search expense/income line items.
3. Explore trends and analytics; open reports; switch to map where applicable.

### Acceptance Criteria

- Given no data, when loaded, then show not-found or error with guidance.
- Given overview, when selecting year or trend mode, then content updates and URL syncs.
- Given trends views, when loaded, then top functional groups are precomputed and charted.
- Given map-capable entity, when map view selected, then geojson/heatmap are prefetched and interactions navigate correctly.

### Scenarios

- Given I type in the expense search, when I pause, then the list filters and URL `expenseSearch` updates; same for `incomeSearch`.
- Given I click a year on the trends chart, when selected, then the page `year` updates and other sections refresh.
- Given an entity has no reports, when viewing reports, then show an empty state with guidance.
- Given entity is county council or specific CUI, when map view loads, then `mapViewType` is set to 'Judet'; else 'UAT'.

### Error and Empty States

Skeletons for loading; friendly empty states on missing sections.

### Analytics & Telemetry

Capture view changes and trend mode; respect consent.

### Accessibility

Sticky header controls; keyboard operable accordions; labels for search.

### Performance

BeforeLoad prefetch; memoized years; caching windows.

### Open Questions

- Default view per entity type?

---

### Page structure and controls (What each button does and why it matters)

Header area
- Entity title and identity: The big heading links back to the canonical entity URL. Use it to reset the `view` and return to `overview` quickly.
- Open on Wikipedia: Convenience link to search the entity on the web for context.
- UAT and County chips: Navigate to parent county entity where applicable.
- Reporting Year selector: Changes the effective year for all components on the page. Why: align all KPIs, trends, lists, and charts to the same reference year. What happens: updates the `year` URL param and triggers refetch/re-render.
- View switcher badges: Switch among `overview`, `expense-trends`, `income-trends`, `map`, and `reports`. Why: jump between macro/micro views. What happens: updates `view` URL param and prefetches data for smoother transitions.
- Entități finanțate: Opens relationships list of financed entities (when available). Why: explore the local network of institutions.

Controls reference (Overview)
- KPIs: Cheltuieli totale, Venituri totale, Venituri − Cheltuieli for the selected year. Why: quick fiscal snapshot.
- Trends mode combobox (Valori Absolute ↔ Diferență % YoY): Switches trend interpretation. Why: absolute shows volume; YoY reveals change velocity. What happens: updates `trend` in URL; chart re-renders.
- Click a year on the chart: Syncs the page to that year. Why: drill into a specific year. What happens: sets `year` and refreshes dependent components.
- Expenses column (accordion): Functional → sub-functional → economic groupings with per-group totals. Why: structural understanding. Actions: expand/collapse; click-through highlights; totals reflect the selected year.
- Incomes column (accordion): Same structure as expenses for revenues.
- Search inputs (each column): Filter items by name (romanian labels). Why: quickly locate topics. What happens: updates `expenseSearch` or `incomeSearch` in URL (supports prefix syntaxes like functional codes); highlights matches.
- Analytics (composition chart):
  - Data toggle (Income/Expenses): Choose data side for composition.
  - Chart type (Bar/Pie): Choose visualization for main categories.
  - Year selector (Categorii principale {year}): Analyze composition for a specific year independently if needed.
  Why: Understand category mix within a year. What happens: updates `analyticsDataType`/`analyticsChartType` and internal year; chart re-renders.

Tabs / Views
1) Overview
   - Audience: anyone needing a quick but accurate yearly picture and its composition.
   - Actions: adjust year; toggle trends; search and expand line items; scan composition in chart; open reports.
   - Tips: click the year in the area chart to sync; use search terms like “Învățământ” or “Sanatate” to jump.

2) Expense Trends
   - What you see: A multi-series chart of top functional categories over time for Expenses.
   - Why: reveal category-level trajectories (e.g., growth/decline of “Transporturi”).
   - Actions: select year on the chart to sync; optional search fields to focus on categories.
   - Behind the scenes: the app preselects the top groups for the chosen side (ch) to keep the chart readable.

3) Income Trends
   - What you see: A multi-series chart of top functional categories over time for Incomes.
   - Why: how a city or ministry’s incomes are composed and evolving (e.g., Taxe pe proprietate, Subvenții, TVA shares).
   - Actions: same interactions as Expense Trends.

4) Map
   - Available for UAT/County-type entities. Shows a mini-analytics map context for the geographic role.
   - Why: put the entity in its territorial context and quickly navigate to neighbors/parent regions.
   - Actions: adjusts to the reporting year; click-through navigates to other entities, preserving relevant filters.

5) Reports
   - An accordion with official “Execuție bugetară” reports by year.
   - Why: auditability and source verification; export to Excel/PDF/XML.
   - Actions: expand the year; click the desired format; opens in a new tab.

Relationships
- Entități finanțate / Finanțatori (when present):
  - Why: understand oversight and funding relationships across institutions.
  - Actions: open the list to navigate to related pages.

URL state (What changes when you click things)
- `view`: which tab is active (`overview`, `expense-trends`, `income-trends`, `map`, `reports`).
- `year`: the reporting year reflected across the page.
- `trend`: `absolute` or `percent` for the overview trends chart.
- `expenseSearch` / `incomeSearch`: string filters for the two columns.
- `analyticsChartType` / `analyticsDataType`: bar vs pie; expense vs income in the composition chart.

Tips & tricks (Maximize insight)
- Start in Overview for the target year to anchor the conversation with totals and balance.
- Toggle YoY% to catch inflection points; then use the composition chart to see what moved the needle.
- Use search to quickly isolate chapters like Education (“Învățământ”) or Healthcare (“Sănătate”).
- Jump to Expense/Income Trends for multi-year patterns of the top categories—this reveals structural shifts.
- Open Reports to save source documents for citations and cross-checking.

Examples (Try these flows)
- “Are expenses rising faster than incomes?”
  1) Overview → toggle to YoY%; 2) Click the latest year; 3) Scan balance and top expense categories.
- “What funds the city?”
  1) Overview → Analytics → Income + Bar; 2) Switch years to compare; 3) Use search in Incomes to find specific categories.
- “Did Education spending grow post-2021?”
  1) Expense Trends → inspect chapter series over 2016–2024; 2) Click year markers to align Overview.

### References

- `src/routes/entities.$cui.tsx`, `entities.$cui.lazy.tsx`
- `src/components/entities/*`
- `src/lib/hooks/useEntityDetails.ts`
- `src/hooks/useEntityViews.tsx`



