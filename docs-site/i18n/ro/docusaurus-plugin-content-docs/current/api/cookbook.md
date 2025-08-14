---
title: API — Rețetar (cookbook)
---

Rețete mici de tip copy‑paste pentru întrebări comune. Sumele sunt în RON dacă nu se precizează altfel.

Note

- Setați întotdeauna `years` și `account_category` în `AnalyticsFilterInput`.
- Pentru per‑capita, asigurați‑vă că aria aleasă are populație; altfel per‑capita poate fi 0.

### Top cheltuitori per capita (Analitice entități)

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

### Heatmap UAT (venituri per capita)

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

### Linii de execuție filtrate după prefix funcțional

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

### Linii agregate (compoziție pe coduri)

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

### Analiza bugetară a unei entități (REST helper — pe funcțional)

```bash
curl 'http://localhost:3000/ai/v1/entities/budget-analysis-by-functional?entityCui=RO123456&year=2024&functionalCode=65'
```

### Dataset‑uri statice — comparați după id‑uri

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


