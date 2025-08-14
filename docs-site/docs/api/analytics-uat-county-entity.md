---
id: analytics-uat-county-entity
title: Analytics – UAT, County, Entity
---

This page explains how analytics are computed for UATs (local administrative units), Counties, and Entities, including filters, joins, measures, normalization, thresholds, population semantics, and performance considerations.

Related: see the unified filter details in [Unified Filter – Deep Dive](./unified-filter-interface.md).

### UAT analytics (heatmapUATData)

Purpose: aggregate execution amounts at the UAT level for a given scope, optionally normalize per capita.

How it works

- Scope and filters
  - Required: `years`, `account_category` (`vn` revenues, `ch` expenses).
  - Dimensional filters: `entity_cuis`, `functional_codes`/`functional_prefixes`, `economic_codes`/`economic_prefixes`, `funding_source_ids`, `budget_sector_ids`, `program_codes`, `report_ids`, `report_type`, `reporting_years`.
  - Geography: `county_codes`, `regions`, `uat_ids`.
  - Thresholds: `item_min_amount`/`item_max_amount` (WHERE) and `aggregate_min_amount`/`aggregate_max_amount` (HAVING). The aggregated thresholds respect `normalization`.
- Joins and grouping
  - From `ExecutionLineItems` join `Entities` then `UATs` on `entity_cui → cui → uat_code`.
  - Optional join to `Reports` when filtering by `reporting_years`/`report_type`.
  - Group by UAT identity columns; compute `SUM(amount)`.
- Measure and normalization
  - `total_amount = SUM(eli.amount)`
  - `per_capita_amount = total_amount / NULLIF(u.population, 0)`
  - Returned `amount = per_capita_amount` if `normalization = per_capita`, else `total_amount`.

Example query

```graphql
query($f: AnalyticsFilterInput!) {
  heatmapUATData(filter: $f) {
    uat_code uat_name population total_amount per_capita_amount
  }
}
```
```json
{
  "f": {
    "years": [2024],
    "account_category": "ch",
    "functional_prefixes": ["65"],
    "normalization": "per_capita",
    "min_population": 5000
  }
}
```

Notes

- Population is taken directly from `UATs.population`. If 0 or null, `per_capita_amount` returns 0.
- Prefix LIKE conditions are index-backed (`varchar_pattern_ops`).

Population rules at a glance

- UATs: per‑capita divides by `UATs.population`.
- Counties: per‑capita divides by the main administrative UAT (Bucharest special case: `siruta_code='179132'`).
 - Entities: if `is_uat=true` use its UAT’s population; if `entity_type='admin_county_council'` use county population; otherwise population may be `NULL`.
 - If population is 0 or `NULL`, `per_capita_amount` becomes 0. Prefer Total when population is unavailable.

### County analytics (heatmapJudetData)

Purpose: aggregate execution amounts at county level; normalize per capita by the county’s main administrative unit.

How it works

- Scope and filters: same unified filters as UAT analytics; geography relies on UATs associated to entities.
- County population and entity mapping
  - Special-case Bucharest: `county_code = 'B'` and `siruta_code = '179132'`.
  - Otherwise, use the UAT where `siruta_code = county_code` to represent the county.
  - This is used both to compute `county_population` and to resolve the `county_entity` in GraphQL.
- Measure and normalization
  - `total_amount = SUM(eli.amount)` per county.
  - `per_capita_amount = total_amount / county_population` (with special-case logic above).
  - Returned `amount` respects `normalization`.
- HAVING thresholds apply to either total or per-capita based on `normalization`.

Example query

```graphql
query($f: AnalyticsFilterInput!) {
  heatmapJudetData(filter: $f) {
    county_code county_name county_population total_amount per_capita_amount county_entity { cui name }
  }
}
```

Notes

- County population is derived as described; if unavailable, per-capita amounts fall back to 0.
- `county_entity` is resolved post-query from the computed county CUI.
 - Use `item_min_amount` to remove tiny items before grouping; use `aggregate_min_amount` after grouping (HAVING). HAVING respects `normalization`.

See also

- Filters cheat‑sheet: [api-filters-pagination-sorting](./filters-pagination-sorting.md)
- Cookbook: [api-cookbook](./cookbook.md)

### Entity analytics (entityAnalytics)

Purpose: aggregate execution amounts per entity with optional per-capita normalization; supports sorting and pagination.

How it works

- Scope and filters
  - Same unified filters, plus text search on entity name (ILIKE) if provided; `reporting_years` joins `Reports`.
- Population semantics
  - If `e.is_uat = TRUE`: use that UAT’s population.
  - If `e.entity_type = 'admin_county_council'`: use county population (same logic as county analytics, including the Bucharest special case).
  - Otherwise: population is `NULL` → `per_capita_amount = 0`; totals still computed.
- Measures and normalization
  - `total_amount = SUM(eli.amount)`
  - `per_capita_amount = total_amount / NULLIF(population, 0)`
  - `amount = per_capita_amount` if `normalization = per_capita`, else `total_amount`.
  - HAVING thresholds (`aggregate_min_amount`/`aggregate_max_amount`) are applied to `amount` after grouping.
- Grouping and order
  - Grouped by entity; supports ordering by `amount`, `total_amount`, `per_capita_amount`, `entity_name`, `population`, `county_name`, etc.

Example query

```graphql
query($f: AnalyticsFilterInput!) {
  entityAnalytics(filter: $f, sort: {by: "per_capita_amount", order: "DESC"}, limit: 20) {
    nodes { entity_cui entity_name county_name population total_amount per_capita_amount }
    pageInfo { totalCount }
  }
}
```

Best practices

- Always set both `years` and `account_category`.
- For per-capita comparisons, ensure population exists in the chosen scope; otherwise values become 0 and can bias sorting.
- Use `functional_prefixes`/`economic_prefixes` for topic families (index-backed LIKE) and combine `years` with `reporting_years` when needed.
- Use `item_min_amount` to remove tiny line items before aggregation; use `aggregate_min_amount` to filter out small aggregates post-aggregation.

Performance tips (from schema indexes)

- ExecutionLineItems: indexes on common filters (`report_id`, `funding_source_id`, `functional_code`, `economic_code`, `account_category`, `budget_sector_id`), composite year/entity, and BRIN on year.
- Prefix search: `functional_code` and `economic_code` have `varchar_pattern_ops` indexes.
- Trigram (`pg_trgm`): names for Entities/UATs, classification names, funding source description, report links.


