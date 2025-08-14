---
id: cookbook
title: API – Cookbook (copy‑paste recipes)
---

This page provides small, copy‑pasteable recipes for common questions. Unless stated, all amounts are in RON.

Notes

- Always set both `years` and `account_category` in `AnalyticsFilterInput`.
- For per‑capita comparisons, ensure population exists for your scope; otherwise per‑capita may be 0.

### Top per‑capita spenders (Entity Analytics)

GraphQL

```graphql
query($f: AnalyticsFilterInput!) {
  entityAnalytics(
    filter: $f
    sort: { by: "per_capita_amount", order: "DESC" }
    limit: 10
  ) {
    nodes {
      entity_cui
      entity_name
      county_name
      population
      per_capita_amount
      total_amount
    }
    pageInfo { totalCount }
  }
}
```

```json
{
  "f": {
    "years": [2024],
    "account_category": "ch",
    "functional_prefixes": ["65"],
    "normalization": "per_capita"
  }
}
```

curl

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
    "query":"query($f:AnalyticsFilterInput!){ entityAnalytics(filter:$f, sort:{by:\"per_capita_amount\",order:\"DESC\"}, limit:10){ nodes{ entity_cui entity_name county_name per_capita_amount } pageInfo{ totalCount } } }",
    "variables": { "f": { "years": [2024], "account_category": "ch", "functional_prefixes":["65"], "normalization": "per_capita" } }
  }'
```

### UAT heatmap (per‑capita revenues)

GraphQL

```graphql
query($f: AnalyticsFilterInput!) {
  heatmapUATData(filter: $f) {
    uat_code
    uat_name
    population
    per_capita_amount
    total_amount
  }
}
```

```json
{
  "f": {
    "years": [2024],
    "account_category": "vn",
    "normalization": "per_capita",
    "min_population": 10000
  }
}
```

### Line items filtered by functional prefix

```graphql
query($f: AnalyticsFilterInput!) {
  executionLineItems(filter: $f, sort: { by: "amount", order: "DESC" }, limit: 50) {
    nodes {
      line_item_id
      entity_cui
      functional_code
      economic_code
      account_category
      amount
      year
    }
    pageInfo { totalCount }
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

### Aggregated line items (composition by codes)

```graphql
query($f: AnalyticsFilterInput!) {
  aggregatedLineItems(filter: $f, limit: 50) {
    nodes {
      functional_code functional_name
      economic_code economic_name
      amount
      count
    }
    pageInfo { totalCount }
  }
}
```

```json
{
  "f": {
    "years": [2024],
    "account_category": "ch",
    "functional_prefixes": ["65"],
    "aggregate_min_amount": 100000
  }
}
```

### Entity budget analysis (REST helper – by functional)

```bash
curl 'http://localhost:3000/ai/v1/entities/budget-analysis-by-functional?entityCui=RO123456&year=2024&functionalCode=65'
```

Returns a grouped composition for the selected functional code, with deep‑link hints.

### Static datasets – compare by dataset ids

```graphql
query($ids:[ID!]!) {
  staticChartAnalytics(datasetIds: $ids) {
    datasetId
    unit
    yearlyTrend { year totalAmount }
  }
}
```

```json
{ "ids": ["gdppc", "cpi"] }
```

See also

- GraphQL queries: [graphql-queries](./graphql-queries.md)
- Unified filter deep dive: [unified-filter-interface](./unified-filter-interface.md)
- Filters cheat‑sheet: [filters-pagination-sorting](./filters-pagination-sorting.md)


