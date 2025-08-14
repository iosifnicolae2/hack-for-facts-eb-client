---
id: api-graphql-schema-and-types
title: GraphQL – Schema and Types
---

**Who it's for**: Developers exploring the structure of the API.

**Outcomes**: Understand available objects, connections, and filter inputs.

Core scalar/object types

- `YearlyAmount { year: Int!, totalAmount: Float! }`
- `PageInfo { totalCount: Int!, hasNextPage: Boolean!, hasPreviousPage: Boolean! }`
- Sorting helpers: `SortDirection`, `SortOrder { by: String!, order: String! }`
- Enums: `AccountCategory (vn|ch)`, `Normalization (total|per_capita)`, `ExpenseType (dezvoltare|functionare)`

Domain types

- `UAT`, `Entity`, `Report`, `ExecutionLineItem`, `FundingSource`, `BudgetSector`
- Classifications: `FunctionalClassification`, `EconomicClassification`
- Analytics: `HeatmapUATDataPoint`, `HeatmapJudetDataPoint`, `EntityAnalyticsDataPoint`, `AggregatedLineItem`

Connections

- `EntityConnection`, `UATConnection`, `ReportConnection`, `ExecutionLineItemConnection`, `FundingSourceConnection`, `BudgetSectorConnection`, `DatasetConnection`, `AggregatedLineItemConnection`

Input types (filters)

- `EntityFilter`, `UATFilter`, `ReportFilter`, `FundingSourceFilterInput`, `BudgetSectorFilterInput`, `DatasetFilter`
- Analytics (unified) `AnalyticsFilterInput` with fields:
  - Required: `years: [Int!]!`, `account_category: AccountCategory!`
  - Optional dimensional filters: `entity_cuis`, `functional_codes`, `functional_prefixes`, `economic_codes`, `economic_prefixes`, `funding_source_ids`, `budget_sector_ids`, `expense_types`, `program_codes`, `report_ids`, `report_type`, `reporting_years`
  - Geography: `county_codes`, `regions`, `uat_ids`, `entity_types`, `is_uat`, `search`
  - Population: `min_population`, `max_population`
  - Aggregates: `normalization`, `aggregate_min_amount`, `aggregate_max_amount`
  - Per‑item thresholds: `item_min_amount`, `item_max_amount`

Schema roots

The `Query` root exposes the following fields (see the Queries page for usage):

- Entities and UATs: `entity`, `entities`, `uat`, `uats`
- Reports and line items: `report`, `reports`, `executionLineItem`, `executionLineItems`
- Classifications and funding: `functionalClassification(s)`, `economicClassification(s)`, `fundingSource(s)`, `budgetSector(s)`
- Analytics: `heatmapUATData`, `heatmapJudetData`, `executionAnalytics`, `entityAnalytics`
- Datasets: `datasets`, `staticChartAnalytics`
- Aggregates: `aggregatedLineItems`

Notes

- All amounts are in RON unless specified.
- Where `ID` is used, it is delivered as a string in GraphQL responses.
 - In production, introspection is disabled; see `/mcp/v1/definition` or this documentation.

See also

- Queries and examples: [api-graphql-queries](./graphql-queries.md)
- Filters cheat‑sheet: [api-filters-pagination-sorting](./filters-pagination-sorting.md)


