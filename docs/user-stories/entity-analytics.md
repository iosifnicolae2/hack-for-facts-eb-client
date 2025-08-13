### Title

As a researcher, I want to compare entities by aggregated values and explore detailed line items, so that I can identify patterns and drill down.

### Context

Route: `/entity-analytics` loader and lazy. Views: table (default), line-items. Shared filters with map mental model.

### Actors

- Researcher

### User Flow

1. Set filters (account category, normalization, year, prefixes, etc.).
2. Table view: sort, paginate, customize columns, export CSV.
3. Switch to line-items: fetch only when active; generate trend charts for top categories.

### Acceptance Criteria

- Given filters, when changed, then query keys update, data refetches/caches appropriately.
- Given export, when clicked, then CSV downloads with all pages.
- Given view switch, when line-items active, then only necessary data is loaded.

### Scenarios

- Given sorting by a column, when applied, then server sort uses mapped field names (e.g., county_name → county_code) and order persists in URL state.
- Given pagination changes, when next page selected, then `offset` is computed and query fetches that slice.
- Given clear filters, when clicked, then filter resets to defaults and data refetches.
- Given density/currency format toggles, when switched, then table re-renders and preferences persist.

### Error and Empty States

Clear error banner; empty table state; disabled export if no data.

### Analytics & Telemetry

Export event; filter hash captured.

### Accessibility

Table controls labeled and keyboard accessible.

### Performance

Stable keys, long stale/gc times; only active view queries enabled.

### Open Questions

- Additional chart types for analytics?

---

### Page structure and controls (What each control does and why)

Header and layout
- Title and subtitle: Orients the user to the purpose (compare aggregated values across entities) and the filter mental model shared with Map.
- Filter panel (left/inline on small screens): Central place for all criteria. Why: keep a single source of truth for the dataset feeding the table or line-items view.

View toggle
- Table vs Line Items: Selects between aggregated ranking (table) and detailed composition by entity (line items). Why: move from ranking to composition seamlessly.

Core filters
- Revenues/Expenses: `Venituri` (vn) vs `Cheltuieli` (ch). Why: focus on one side of the budget at a time.
- Normalization: `Total` vs `Per Capita`. Why: compare at scale or normalize by population for fairness.
- Years: select one or multiple years (commonly a single target year). Why: pin the reference period; multi-year could power future views.

Entity cohort filters
- Entities: multi-select entities by name/CUI. Why: restrict the cohort to specific institutions.
- UAT (localities) and County: geographic slices for local government comparisons.
- Entity Type: filter by administrative category (ministry, municipality, council, etc.). Labels are loaded lazily and cached.

Topical filters
- Functional Classification & Prefixes: focus by COFOG-like function groups (e.g., Education). Why: thematic analysis of spend/income.
- Economic Classification & Prefixes: focus by economic nature of revenue/spend (e.g., taxes, subsidies, goods/services).

Other filters
- Budget Sector: central vs local budget segments.
- Funding Source: filter by financing origin.
- Report Type: aggregated at principal authorizing officer or detailed line items (when relevant).
- Amount Range & Population Range: numeric windows to exclude outliers or focus on certain scales.

Actions
- Clear All (per section) and Clear filters top action: quickly reset to defaults.
- Export CSV (Table view): dumps current ranking with visible columns to a CSV file.

Table view (Ranking)
- Columns: entity name, county, population, per capita amount, total amount.
- Sorting: column menus to sort ascending/descending; mapping ensures server-side sorting by correct fields.
- Pagination: choose rows per page and navigate pages. Why: performance and progressive scanning of a large cohort.
- Preferences: density, currency format, column visibility/pinning/sizing/order persist under a stable key.

Line Items view (Composition)
- Displays the detailed composition for selected entities, following the same functional/economic groupings used on the Entity Details page.
- Encourages moving the top categories (90% rule) into a chart for trend analysis.

URL state (What changes when you interact)
- `view`: 'table' | 'line-items'
- `filter`: full AnalyticsFilter schema, including `account_category`, `normalization`, `years`, `functional/economic` group restrictions, entity types, etc.
- `sortBy`, `sortOrder`: ranking order state for the table.
- `page`, `pageSize`: pagination state.

Tips & tricks (Get the most insight)
- Prefer `Per Capita` to compare differently sized jurisdictions; switch to `Total` when scale matters.
- Start broad with all entities, then apply functional/economic prefixes to narrow down to your theme.
- Export CSV after sorting to preserve the rank order; use in spreadsheets for further breakdowns.
- Switch to `Line Items` to validate what’s behind top-ranked entities, then jump to Chart Builder to visualize trends.

Examples (Try these flows)
- “Top 25 municipalities by per-capita spending on Education in 2024”
  1) Set `Cheltuieli`, `Per Capita`, `Year=2024`; 2) Add functional prefix for Education; 3) Sort by `Per Capita` desc; 4) Export CSV.
- “Who has the largest absolute revenues in 2024?”
  1) Set `Venituri`, `Total`, `Year=2024`; 2) Sort by `Total Amount` desc; 3) Drill into line items for the top 3.

### References
- Key files: `src/routes/entity-analytics.tsx`, `entity-analytics.lazy.tsx`, `src/components/entity-analytics/*`, `src/hooks/useEntityAnalyticsFilter.ts`, `src/lib/api/entity-analytics.ts`

### References

- `src/routes/entity-analytics.tsx`, `entity-analytics.lazy.tsx`
- `src/components/entity-analytics/*`
- `src/hooks/useEntityAnalyticsFilter.ts`
- `src/lib/api/entity-analytics.ts`



