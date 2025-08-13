### Title

As a chart author, I want to configure series, options, and annotations, and view the rendered chart, so that I can analyze and share insights.

### Context

Route: `/charts/$chartId`. File-route validates and stores chart state; lazy-route renders overview and config dialogs.

### Actors

- Chart author
- Viewer of a shared chart

### User Flow

1. Enter via deep-link or from list; state hydrated from URL/localStorage.
2. Overview shows chart; user opens config dialog(s) to edit chart/series/annotations.
3. Apply filters per series; preview chart; export or share; save persists.

### Acceptance Criteria

- Given chart JSON in URL, when opened, then state is validated and saved.
- Given series edit, when saved, then chart re-renders with merged data (dynamic/static).
- Given aggregated charts, when multiple units exist (pie), then warning appears instead of chart.
- Given annotations are enabled, when present, then render on chart and export.

### Scenarios

- Given I add a calculation series with nested formulas, when I save, then the evaluation runs recursively and cycle detection prevents circular references.
- Given multiple static series share a `datasetId`, when fetched, then data is merged across series instances correctly.
- Given aggregated charts with `yearRange` in config, when rendered, then `ChartTitle` shows subtitle matching formatted range.
- Given the user toggles chart options (grid, legend, tooltip), when applied, then the overview reflects changes immediately.
- Given I copy/paste chart config or annotations, when performed, then the content is transferred via clipboard hooks.
- Given I open series filters for entity selection, when I search, then infinite list loads and selection adds `entity_cuis`.

### Error and Empty States

Invalid chart schema shows friendly error; no series shows add-series CTA.

### Analytics & Telemetry

Optional events for saves/exports; respect consent.

### Accessibility

Dialogs and menus keyboard accessible; color contrast; tooltip ARIA.

### Performance

React Query caching; route/lazy splitting; cancel stale requests; deterministic query keys.

### Open Questions

- Versioning of chart state for future migrations?

---

### Page structure and controls (What each control does and why)

Entry and state
- Chart state comes from the `chart` query param (deep-link) or localStorage if you created it locally. Why: reproducible, shareable charts.
- On route enter, the state is validated and saved into localStorage for persistence.

Overview view
- Chart canvas: renders the selected visualization with legend, grid, tooltips, and in-chart titles. Why: communicate the story clearly.
- Quick actions: open config (chart options), open series config, open annotations, export or share (as URL or image if available).
- Diff toggle (when present): compare changes between series versions.

Configuration dialogs
1) Chart Config
   - Options: chart type (bar/line/area or aggregated), year range subtitle, show/hide grid, legend, tooltip, annotations.
   - Why: tailor readability and context for your audience.

2) Series Config
   - Add series: choose between `line-items-aggregated-yearly`, `aggregated-series-calculation`, `static-series`, `custom-series-data`, `custom-series-value`.
   - Filter editors: select entities, account category (vn/ch), functional/economic prefixes, entity types, report type.
   - Calculation builder: build formulas recursively; cycle detection prevents circular references; units align per year.
   - Static datasets: select backend datasets by id; values merged into per-series data.
   - Why: construct comparisons, ratios, and derived metrics from authoritative data.

3) Annotation Config
   - Add/edit annotations; toggle visibility; attach to points/ranges; style and text editing.
   - Why: preserve narrative and highlight critical moments.

Aggregated charts rules
- Year range subtitle appears in header and in-canvas when `-aggr` types are used.
- Pie chart warns when mixing multiple units; bar chart uses the first series’ unit for labels.

Sharing
- Deep-link: full chart JSON in the URL; anyone can open and get the exact chart.
- Library integration: saved to localStorage; appears in `/charts` list; can be favorited and categorized.

Tips & tricks
- Use annotations to explain spikes; include data source and caveats.
- Prefer line/area for trends; bar for category comparison; treemap/pie for composition.
- Keep the number of visible series manageable; consider aggregated-series-calculation to compress insights.

Examples
- “Education spend ratio to total spend”: add `line-items-aggregated-yearly` for Education prefix and a calculation series dividing by total Expenses.
- “Compare 5 cities’ income trends”: add one series per city (Income), select `line` or `area`, and set a common year range.

### References
- `src/routes/charts/$chartId/route.tsx`, `index.lazy.tsx`
- `src/components/charts/components/views/*`
- `src/components/charts/hooks/useChartData.ts`
- `src/lib/chart-calculation-utils.ts`, `src/lib/chart-filter-utils.ts`, `src/lib/chart-generation-utils.ts`

### References

- `src/routes/charts/$chartId/route.tsx`, `index.lazy.tsx`
- `src/components/charts/components/views/*`
- `src/components/charts/hooks/useChartData.ts`
- `src/components/charts/components/chart-renderer/*`
- `src/lib/chart-calculation-utils.ts`, `src/lib/chart-filter-utils.ts`, `src/lib/chart-generation-utils.ts`



