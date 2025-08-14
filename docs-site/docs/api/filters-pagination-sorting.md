---
id: api-filters-pagination-sorting
title: Filters, Pagination, and Sorting
---

**Who it's for**: Developers building analytics queries confidently and efficiently

**Outcomes**: Pick the right filter fields, know WHERE vs HAVING, and avoid common pitfalls

Filters

- `EntityFilter`, `UATFilter`, `ReportFilter`, `FundingSourceFilterInput`, `BudgetSectorFilterInput`, `DatasetFilter` apply to their respective list queries.
- `AnalyticsFilterInput` is used by heatmaps, entity analytics, execution line items, and execution totals:
  - Required: `years`, `account_category`
  - Line‑item dimensions: `entity_cuis`, `functional_codes/prefixes`, `economic_codes/prefixes`, `funding_source_ids`, `budget_sector_ids`, `expense_types`, `program_codes`, `report_ids`, `report_type`, `reporting_years`
  - Geography: `county_codes`, `regions`, `uat_ids`, `entity_types`, `is_uat`, `search`
  - Population constraints: `min_population`, `max_population`
  - Aggregates: `normalization`, `aggregate_min_amount`, `aggregate_max_amount`
  - Per‑item thresholds: `item_min_amount`, `item_max_amount`

Cheat‑sheet (WHERE vs HAVING and performance tips)

| Field | Applies to | SQL placement | Notes |
| --- | --- | --- | --- |
| years | Analytics | WHERE on `eli.year` | Required |
| account_category | Analytics | WHERE on `eli.account_category` | Required (`vn` or `ch`) |
| functional_prefixes | Analytics | WHERE on `eli.functional_code LIKE ANY($)` | Uses `varchar_pattern_ops` index |
| economic_prefixes | Analytics | WHERE on `eli.economic_code LIKE ANY($)` | Uses `varchar_pattern_ops` index |
| item_min/max_amount | Analytics | WHERE on `eli.amount` | Per‑item threshold before grouping |
| aggregate_min/max_amount | Analytics | HAVING on aggregated `amount` | Respects `normalization` |
| reporting_years | Analytics | WHERE on `Reports.reporting_year` | Requires join to `Reports`; combine with `years` |
| search | Analytics | WHERE on `Entities.name ILIKE` | In repos, trigram used for ranking where applicable |

Callouts

- Always set `years` and `account_category` for analytics queries.
- Per‑capita: if population is `0` or `NULL`, per‑capita becomes `0` (see analytics pages for details).
 - Prefix filters use `varchar_pattern_ops` indexes (`LIKE 'xx%'` is indexable); text search uses trigram where available.

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

- See also: [API Cookbook](./cookbook.md) for copy‑paste recipes.


