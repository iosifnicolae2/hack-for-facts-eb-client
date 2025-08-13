---
id: api-filters-pagination-sorting
title: Filters, Pagination, and Sorting
---

Filters

- `EntityFilter`, `UATFilter`, `ReportFilter`, `FundingSourceFilterInput`, `BudgetSectorFilterInput`, `DatasetFilter` apply to their respective list queries.
- `AnalyticsFilterInput` is used by heatmaps, entity analytics, execution line items, and execution totals:
  - Required: `years`, `account_category`
  - Line‑item dimensions: `entity_cuis`, `functional_codes/prefixes`, `economic_codes/prefixes`, `funding_source_ids`, `budget_sector_ids`, `expense_types`, `program_codes`, `report_ids`, `report_type`, `reporting_years`
  - Geography: `county_codes`, `regions`, `uat_ids`, `entity_types`, `is_uat`, `search`
  - Population constraints: `min_population`, `max_population`
  - Aggregates: `normalization`, `aggregate_min_amount`, `aggregate_max_amount`
  - Per‑item thresholds: `item_min_amount`, `item_max_amount`

Pagination

- All list/connection queries accept `limit` and `offset` and return `pageInfo`:
  - `totalCount`: total number of matching items
  - `hasNextPage`: more items after `offset + limit`
  - `hasPreviousPage`: `offset > 0`

Sorting

- Some queries accept `sort: { by: String!, order: String! }` (e.g., `reports`, `executionLineItems`).
- `order` should be `ASC` or `DESC`.

Best practices

- Keep `limit` reasonable (e.g., 20–100) and increase `offset` for pagination.
- When using per‑capita analytics, ensure the chosen scope includes population.

Related

- See [Unified Filter – Deep Dive](./unified-filter-interface.md) for SQL mappings, join behavior, and population/per‑capita semantics.


