---
id: api-graphql-queries
title: GraphQL – Queries and Examples
---

Entities

```graphql
query ListEntities($limit:Int,$offset:Int,$filter:EntityFilter){
  entities(limit:$limit, offset:$offset, filter:$filter){
    nodes{ cui name entity_type uat_id }
    pageInfo{ totalCount hasNextPage }
  }
}
```

UATs

```graphql
query ListUATs($limit:Int,$offset:Int,$filter:UATFilter){
  uats(limit:$limit, offset:$offset, filter:$filter){
    nodes{ id uat_code name county_code population }
    pageInfo{ totalCount }
  }
}
```

Reports and execution line items

```graphql
query EntityReports($cui:ID!, $year:Int){
  entity(cui:$cui){
    name
    reports(limit:10, year:$year, sort:{by:"report_date", order:"DESC"}){
      nodes{ report_id reporting_year reporting_period }
      pageInfo{ totalCount }
    }
  }
}
```

```graphql
query LineItems($f:AnalyticsFilterInput!, $sort:SortOrder){
  executionLineItems(filter:$f, sort:$sort, limit:50){
    nodes{ line_item_id entity_cui functional_code economic_code account_category amount year }
    pageInfo{ totalCount }
  }
}
```

Classifications and funding sources

```graphql
query Functional($search:String){
  functionalClassifications(filter:{search:$search}, limit:20){
    nodes{ functional_code functional_name }
    pageInfo{ totalCount }
  }
}
```

Analytics

```graphql
query HeatmapUAT($f:AnalyticsFilterInput!){
  heatmapUATData(filter:$f){ uat_code uat_name per_capita_amount total_amount }
}
```

```graphql
query EntityAnalytics($f:AnalyticsFilterInput!){
  entityAnalytics(filter:$f, limit:50){
    nodes{ entity_cui entity_name per_capita_amount total_amount }
    pageInfo{ totalCount }
  }
}
```

```graphql
query ExecutionAnalytics($inputs:[AnalyticsInput!]!){
  executionAnalytics(inputs:$inputs){ seriesId unit totalAmount yearlyTrend{ year totalAmount } }
}
```

Datasets and aggregates

```graphql
query Datasets($filter:DatasetFilter){
  datasets(filter:$filter, limit:50){ nodes{ id name unit } pageInfo{ totalCount } }
}
```

```graphql
query StaticAnalytics($ids:[ID!]!){
  staticChartAnalytics(datasetIds:$ids){ datasetId unit yearlyTrend{ year totalAmount } }
}
```

```graphql
query AggregatedLineItems($f:AnalyticsFilterInput!){
  aggregatedLineItems(filter:$f, limit:50){
    nodes{ functional_code functional_name economic_code economic_name amount count }
    pageInfo{ totalCount }
  }
}
```

Notes

- Use `AnalyticsFilterInput` to scope by year(s), account category (`vn` or `ch`), and optional dimensional or geographic filters.
- For meaningful per‑capita values, ensure population is available for the selected geography.


