### Title

As a data explorer, I want an interactive heatmap with table and charts, so that I can visualize spending distribution by geography.

### Context

Routes: `/map` loader and lazy. Components: `InteractiveMap`, `MapFilter`, `MapLegend`, `HeatmapDataTable`, `UatDataCharts`.

### Actors

- Explorer

### User Flow

1. Choose UAT or County view; set filters.
2. Explore heatmap; click area to navigate to entity page with bridged filters.
3. Switch to table or chart subviews.

### Acceptance Criteria

- Given map view, when heatmap and geojson are ready, then features render with percentile-based styling.
- Given click on area, when entity exists, then navigate to `/entities/$cui` with mapped search params.
- Given mobile, when legend needed, then modal opens with legend.

### Scenarios

- Given normalization changes from per_capita to total, when applied, then heatmap color scaling recomputes using the relevant key.
- Given filters contain no data, when loaded, then show "No data available" in main area.
- Given table sorting and pagination, when changed, then the table view updates without affecting map state.

### Error and Empty States

Combined error handling; loading spinner messages by resource.

### Analytics & Telemetry

Optional events for map interactions.

### Accessibility

Controls and dialogs accessible; focus management on modals.

### Performance

Prefetch based on loader; memoized styling; avoid unnecessary refetches.

### Open Questions

- Add hover tooltips with richer content?

---

### Page structure and controls (What each control does and why)

Header and layout
- Filters panel (left on desktop; modal on mobile): Single source of truth for the dataset across views.
- Main area: switches between Map, Table, and Chart subviews of the same filtered dataset.

View toggle
- Map / Table / Chart radios: Choose the visualization layer. Why: Map for spatial insight, Table for ranking and sorting, Chart for quick distributions.

Map view selector
- UAT vs Județ: switch between municipality/town/commune vs county aggregation. Why: choose granularity appropriate to the question. What happens: prefetches correct GeoJSON and heatmap.

Budget side & normalization
- Venituri vs Cheltuieli: revenue vs spending.
- Total vs Per Capita: raw totals vs normalized by population (fairer cross-size comparisons).

Year(s)
- Year selector: choose target year(s); commonly a single year. What happens: refetches heatmap and table with the selected year.

Entity cohort filters
- UAT-uri & Județe: filter the cohort to specific localities/counties.
- Entities: restrict to specific institutions when relevant.

Topical filters
- Clasificare Funcțională + Prefix: thematic focus by functional chapter codes (e.g., Education).
- Clasificare Economică + Prefix: focus by economic nature (e.g., taxes, subsidies, goods/services).

Other filters
- Tip entitate (Entity Type), Sector bugetar (Budget Sector), Sursă de finanțare (Funding Source), Interval Valoare (Amount Range), Interval Populație (Population Range).

Quick nav
- Go to Entity Table / Go to Chart View: deep-links to other pages with current filters mapped appropriately (e.g., to Entity Analytics).

Map controls
- Zoom in/out, Toggle scroll zoom: navigate the map comfortably. Legend shows value range (percentile-based scaling). Clicking a region navigates to the entity page with year and compatible filters bridged.

URL/state
- The map page encodes its state in search params (view type, filters). Interactions update URL so views are shareable/bookmarkable.

Tips & tricks
- Use Per Capita for fairness across UATs; switch to Total for magnitude.
- Start with Map to spot outliers, then open Table for precise ranking and export; use Chart for distribution sanity checks.

### References

- `src/routes/map.tsx`, `map.lazy.tsx`
- `src/components/maps/*`
- `src/hooks/useMapFilter.ts`, `src/hooks/useHeatmapData.ts`, `src/hooks/useGeoJson.ts`



