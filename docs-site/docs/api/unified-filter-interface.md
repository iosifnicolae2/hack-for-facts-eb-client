---
id: api-unified-filter-interface
title: Unified Filter – Deep Dive (AnalyticsFilter)
---

This document explains the unified analytics filter used across queries and repositories, how it maps to SQL, and how joins/aggregations behave. It consolidates information from:

- GraphQL: `AnalyticsFilterInput` in `hack-for-facts-eb-server/src/graphql/types/index.ts`
- Server types: `AnalyticsFilter` in `hack-for-facts-eb-server/src/types.ts`
- Repositories: `hack-for-facts-eb-server/src/db/repositories/*`
- Schema and indexes: `hack-for-facts-eb-server/src/db/schema.sql`

Overview

- Required fields: `years: [Int!]!`, `account_category: AccountCategory!` (`vn` for revenues, `ch` for expenses)
- Scope: the filter applies to queries returning execution line items, heatmaps, entity analytics, and aggregated line items
- Thresholds:
  - Per‑item thresholds (`item_min_amount`, `item_max_amount`) filter raw line items (WHERE)
  - Aggregated thresholds (`aggregate_min_amount`, `aggregate_max_amount`) filter on an aggregated measure (HAVING) and respect `normalization`
- Normalization: `normalization: total | per_capita` controls which measure is used by analytics queries

Field-to-SQL mapping

- Required
  - `years` → `eli.year = ANY($::int[])`
  - `account_category` → `eli.account_category = $`

- Line-item dimensions
  - `report_ids` → `eli.report_id = ANY($::text[])`
  - `report_type` → `eli.report_type = $`
  - `reporting_years` → join `Reports r` and `r.reporting_year = ANY($::int[])`
  - `entity_cuis` → `eli.entity_cui = ANY($::text[])`
  - `functional_codes` → `eli.functional_code = ANY($::text[])`
  - `functional_prefixes` → `eli.functional_code LIKE ANY($::text[])` (uses `varchar_pattern_ops` index)
  - `economic_codes` → `eli.economic_code = ANY($::text[])`
  - `economic_prefixes` → `eli.economic_code LIKE ANY($::text[])` (uses `varchar_pattern_ops` index)
  - `funding_source_ids` → `eli.funding_source_id = ANY($::int[])`
  - `budget_sector_ids` → `eli.budget_sector_id = ANY($::int[])`
  - `expense_types` → `eli.expense_type = ANY($::text[])`
  - `program_codes` → `eli.program_code = ANY($::text[])`

- Geography / entity scope
  - `entity_types` → join `Entities e` and `e.entity_type = ANY($::text[])`
  - `is_uat` → join `Entities e` and `e.is_uat = $`
  - `uat_ids` → join `Entities e` then `e.uat_id = ANY($::int[])` (some repos may join `UATs` as `u.id`)
  - `county_codes` → join `UATs u` and `u.county_code = ANY($::text[])`
  - `regions` → join `UATs u` and `u.region = ANY($::text[])`
  - `search` → entity-name filter; analytics repos use `e.name ILIKE $` (Entities repo uses trigram with relevance)

- Thresholds and transforms
  - `item_min_amount`, `item_max_amount` → `eli.amount >= / <= $` (WHERE)
  - `aggregate_min_amount`, `aggregate_max_amount` → HAVING on aggregated measure (see below)
  - `normalization` → determines measure used in analytics (`total_amount` vs `per_capita_amount`)

Join behavior per repository

- Execution line items (`executionLineItemRepository`)
  - Builds joins on demand depending on filters (Entities, Reports, UATs)
  - Returns raw rows; thresholds apply in WHERE; sorting on concrete ELI columns

- Entity analytics (`entityAnalyticsRepository`)
  - Groups by entity; joins `Entities e` and a lateral `UATs u` row for geo context
  - Per‑capita population rules:
    - If `e.is_uat = TRUE`, use `u.population`
    - If `e.entity_type = 'admin_county_council'`, use county population (special Bucharest case: `siruta_code='179132'`); otherwise population is NULL
  - Aggregated measure:
    - `total_amount = SUM(eli.amount)`
    - `per_capita_amount = total_amount / NULLIF(population, 0)`
    - `amount` equals one of the above based on `normalization`
  - HAVING: applies `aggregate_min_amount` / `aggregate_max_amount` to `amount`

- UAT heatmap (`uatAnalyticsRepository`)
  - Groups by `UATs u`, joins `Entities e` and optionally `Reports r`
  - Uses `SUM(eli.amount)` and divides by `u.population` for per‑capita
  - HAVING: optional thresholds on `SUM(eli.amount)` or per‑capita depending on `normalization`

- County heatmap (`judetAnalyticsRepository`)
  - Groups by county; population is computed via an expression selecting the county’s main administrative UAT
  - Special case for Bucharest: `county_code='B' AND siruta_code='179132'`
  - HAVING: thresholds applied to `SUM(eli.amount)` or per‑capita

- Aggregated line items (`aggregatedLineItemsRepository`)
  - Groups by `functional_code/name` and `economic_code/name`
  - Conditionally joins `Reports`, `Entities`, and a lateral `UATs` row for geo filters

- Category analytics view (`categoryAnalyticsRepository`)
  - Reads from `vw_Category_Aggregated_Metrics` (materialized view), grouped by classification
  - Supports functional/economic filters, funding source, geography

Aggregated vs per‑item thresholds

- Per‑item thresholds: applied in WHERE before grouping; remove individual line items below/above the threshold
- Aggregated thresholds: applied in HAVING after grouping; keep groups where the aggregated measure is within the bounds

Indexing and performance (from schema.sql)

- Prefix searches: `functional_code` and `economic_code` use `varchar_pattern_ops` indexes (`LIKE 'xx%'` patterns are indexable)
- Trigram (`pg_trgm`) indexes on names and text fields: `Entities(name)`, `FunctionalClassifications(functional_name)`, `EconomicClassifications(economic_name)`, `FundingSources(source_description)`, `UATs(name, county_name)`, and `Reports(download_links)`
- Common filters: indexes on `eli` columns (`report_id`, `funding_source_id`, `functional_code`, `economic_code`, `account_category`, `budget_sector_id`, etc.)
- BRIN indexes for time series: `ExecutionLineItems(year)`, `Reports(report_date)`

Validation and invariants

- Missing `years` or empty array → error in repositories (e.g., heatmap and analytics repos)
- Missing `account_category` for analytics repos → error (`"ch" | "vn"` required)
- `reporting_years` applies to joined `Reports` table, not the raw `eli.year` (use both when needed)

Examples

Entity analytics (per‑capita expenses for 2024, filter by county and education prefix)

```graphql
query($f: AnalyticsFilterInput!){
  entityAnalytics(filter:$f, limit:20, sort:{by:"per_capita_amount", order:"DESC"}){
    nodes{ entity_cui entity_name county_name per_capita_amount }
    pageInfo{ totalCount }
  }
}
```

```json
{
  "f": {
    "years": [2024],
    "account_category": "ch",
    "functional_prefixes": ["65"],
    "county_codes": ["SB", "BV", "B"],
    "normalization": "per_capita",
    "item_min_amount": 1000,
    "aggregate_min_amount": 100000
  }
}
```

UAT heatmap (revenues per‑capita, with population bounds)

```graphql
query($f: AnalyticsFilterInput!){
  heatmapUATData(filter:$f){ uat_code uat_name per_capita_amount }
}
```

```json
{
  "f": {
    "years": [2024],
    "account_category": "vn",
    "min_population": 10000,
    "max_population": 1000000,
    "normalization": "per_capita"
  }
}
```

Aggregated line items (expenses for a code prefix)

```graphql
query($f: AnalyticsFilterInput!){
  aggregatedLineItems(filter:$f, limit:50){
    nodes{ functional_code functional_name economic_code economic_name amount count }
    pageInfo{ totalCount }
  }
}
```

```json
{
  "f": {
    "years": [2024],
    "account_category": "ch",
    "functional_prefixes": ["84"],
    "item_min_amount": 1000
  }
}
```

Repository quick reference

- `executionLineItemRepository`: raw line items; joins on demand; WHERE thresholds only
- `entityAnalyticsRepository`: entity‑level aggregates; per‑capita semantics; HAVING thresholds
- `uatAnalyticsRepository`: UAT‑level aggregates; per‑capita via `u.population`; HAVING thresholds
- `judetAnalyticsRepository`: county aggregates; per‑capita via county population expression; HAVING thresholds
- `aggregatedLineItemsRepository`: classification aggregates; lateral `UATs` join for geo filters
- `categoryAnalyticsRepository`: materialized view aggregates by classification

Tips

- Combine `years` with `reporting_years` to constrain both raw items and report metadata
- Use `functional_prefixes`/`economic_prefixes` for families of codes; they are index‑friendly
- Prefer `normalization: per_capita` when comparing different size geographies; ensure population exists


