---
title: GraphQL — Schema și tipuri
---

**Pentru cine**: Dezvoltatori care explorează structura API‑ului

**Rezultate**: Înțelegeți obiectele disponibile, conexiunile și input‑urile de filtrare

Tipuri de bază

- `YearlyAmount { year: Int!, totalAmount: Float! }`
- `PageInfo { totalCount: Int!, hasNextPage: Boolean!, hasPreviousPage: Boolean! }`
- Sortare: `SortDirection`, `SortOrder { by: String!, order: String! }`
- Enumuri: `AccountCategory (vn|ch)`, `Normalization (total|per_capita)`, `ExpenseType (dezvoltare|functionare)`

Tipuri domeniu

- `UAT`, `Entity`, `Report`, `ExecutionLineItem`, `FundingSource`, `BudgetSector`
- Clasificări: `FunctionalClassification`, `EconomicClassification`
- Analitice: `HeatmapUATDataPoint`, `HeatmapJudetDataPoint`, `EntityAnalyticsDataPoint`, `AggregatedLineItem`

Conexiuni

- `EntityConnection`, `UATConnection`, `ReportConnection`, `ExecutionLineItemConnection`, `FundingSourceConnection`, `BudgetSectorConnection`, `DatasetConnection`, `AggregatedLineItemConnection`

Input‑uri (filtre)

- `EntityFilter`, `UATFilter`, `ReportFilter`, `FundingSourceFilterInput`, `BudgetSectorFilterInput`, `DatasetFilter`
- `AnalyticsFilterInput` (unificat):
  - Obligatorii: `years`, `account_category`
  - Opționale (dimensiuni): `entity_cuis`, `functional_codes`/`functional_prefixes`, `economic_codes`/`economic_prefixes`, `funding_source_ids`, `budget_sector_ids`, `expense_types`, `program_codes`, `report_ids`, `report_type`, `reporting_years`
  - Geografie: `county_codes`, `regions`, `uat_ids`, `entity_types`, `is_uat`, `search`
  - Populație: `min_population`, `max_population`
  - Agregate: `normalization`, `aggregate_min_amount`, `aggregate_max_amount`
  - Praguri pe item: `item_min_amount`, `item_max_amount`

Rădăcina Query (selectiv)

- Entități și UAT‑uri: `entity`, `entities`, `uat`, `uats`
- Rapoarte și linii: `report`, `reports`, `executionLineItem(s)`
- Clasificări: `functionalClassification(s)`, `economicClassification(s)`
- Analitice: `heatmapUATData`, `heatmapJudetData`, `executionAnalytics`, `entityAnalytics`
- Dataset‑uri: `datasets`, `staticChartAnalytics`
- Agregate: `aggregatedLineItems`

Note

- Sumele sunt în RON dacă nu e specificat altfel.
- În producție, introspecția este dezactivată; folosiți `/mcp/v1/definition` sau această documentație.

Vezi și

- Interogări & exemple: [graphql-queries](./graphql-queries.md)
- Filtre/paginare/sortare: [filters-pagination-sorting](./filters-pagination-sorting.md)


