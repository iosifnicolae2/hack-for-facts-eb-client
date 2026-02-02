# INS Client UI Spec: Design + User Journey

## Goal
Deliver a focused INS (Tempo) exploration experience that lets users:
- Discover datasets quickly.
- Understand dataset structure (dimensions, periodicity, coverage).
- Retrieve observations with minimal friction.
- Compare UATs and surface local indicators.

The experience should feel consistent with the existing app (sidebar nav, filter panels, chart/table dual views, URL-state).

## Target Users
- Journalists looking for local indicators (UAT-level) to support stories.
- Public officials benchmarking their locality vs peers.
- Researchers exploring national/regional trends.

## Entry Points
- **Sidebar nav**: new top-level entry "INS Tempo" (or under "Research")
- **UAT page tab**: "INS Stats" (loads dashboard for the active UAT)
- **Search**: global search can direct to a dataset page when a code/name matches

## Primary Journeys

### 1) Dataset Discovery
1. User opens **INS Tempo**.
2. Sees a catalog list with search + filters.
3. Filters by:
   - Search (code/name)
   - Context (domain hierarchy)
   - Periodicity
   - "Has UAT data" toggle
4. Clicks a dataset card to open **Dataset Detail**.

Success criteria: user identifies a relevant dataset in <30 seconds.

### 2) Dataset Detail + Observation Explorer
1. User lands on dataset detail page.
2. Sees key metadata: names, definitions, periodicity, year range, flags (UAT/county/SIRUTA).
3. Dimension chips show type + sample values (territory/time/classification/unit).
4. User sets filters using a dimension-aware filter panel.
5. Observations render as **table + chart**:
   - Table: sortable, supports copy, value status badges.
   - Chart: time series when temporal dimension is present; bar/stacked when categorical.

Success criteria: user can retrieve a clean time series or distribution with 2-3 interactions.

### 3) UAT Dashboard (Local Indicators)
1. User navigates to a UAT (entity page) or direct dashboard route.
2. Dashboard loads grouped datasets with latest values.
3. User optionally changes period or context to refine.
4. Each dataset row expands to reveal full observations for that dataset.

Success criteria: local users see a clear snapshot of their locality with minimal configuration.

### 4) Compare UATs
1. User selects a dataset and 2+ UATs.
2. Result renders a comparison table + chart (same period).
3. Optional: rank / highlight outliers.

Success criteria: user can explain differences between localities.

## IA / Screen Layouts

### INS Catalog
- Left: filter panel
- Right: dataset list
- Dataset card:
  - Code, RO/EN name
  - Periodicity
  - Year range
  - Flags: UAT/County/SIRUTA

### Dataset Detail
- Header: dataset code + name, period range, periodicity chips
- Metadata accordion (definitions/methodology if available)
- Dimension summary row (type + sample values)
- Explorer section:
  - Filters (dimension-aware)
  - Results: table + chart

### UAT Dashboard
- Sticky header: UAT name + period selector
- Grouped list of datasets:
  - Dataset name + latest period + value
  - Expandable observations list

### Compare UATs
- Selector row: dataset + UATs + period
- Chart + table views

## Components (Reuse First)
- Filters: use existing filter panels (MapFilter style) where possible.
- Tables: existing data table styles.
- Charts: reuse chart renderer (time series, bar, stacked).
- Badges: status (missing/confidential values), flags (UAT/County/SIRUTA).

## Data States
- **Loading**: skeleton list + chart placeholder.
- **Empty**: “No data for current filters” with reset action.
- **Partial**: show warning when API limits truncate results (UAT dashboard cap).
- **Invalid period**: inline validation with allowed formats (YYYY, YYYY-Qn, YYYY-MM).

## Accessibility + i18n
- All labels and units must be translatable (Lingui).
- Tables must include screen-reader labels for columns.
- Status indicators must not rely only on color.

## Analytics (optional)
Track key events:
- dataset_opened
- observation_query
- uat_dashboard_loaded
- uat_compare_executed

## Non-goals (Phase 1)
- Uploading custom datasets.
- Complex derived indicators or formulas on the client.
- Bulk export beyond CSV.
