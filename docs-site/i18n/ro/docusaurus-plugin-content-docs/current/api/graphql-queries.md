---
title: GraphQL — Interogări și exemple
---

**Pentru cine**: Dezvoltatori care vor exemple GraphQL gata de folosit

**Rezultate**: Copiați/lipiți interogări pentru sarcini comune și adaptați rapid

Start rapid

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($f:AnalyticsFilterInput!){ entityAnalytics(filter:$f, limit:3){ nodes{ entity_cui entity_name total_amount per_capita_amount } pageInfo{ totalCount } } }",
  "variables": { "f": { "years": [2024], "account_category": "ch" } }
}'
```

Entități

```graphql
query ListEntities($limit:Int,$offset:Int,$filter:EntityFilter){
  entities(limit:$limit, offset:$offset, filter:$filter){
    nodes{ cui name entity_type uat_id }
    pageInfo{ totalCount hasNextPage }
  }
}
```

UAT‑uri

```graphql
query ListUATs($limit:Int,$offset:Int,$filter:UATFilter){
  uats(limit:$limit, offset:$offset, filter:$filter){
    nodes{ id uat_code name county_code population }
    pageInfo{ totalCount }
  }
}
```

Rapoarte și linii de execuție

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

Clasificări și surse de finanțare

```graphql
query Functional($search:String){
  functionalClassifications(filter:{search:$search}, limit:20){
    nodes{ functional_code functional_name }
    pageInfo{ totalCount }
  }
}
```

Analitice

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

Seturi de date și agregate

```graphql
query Datasets($filter:DatasetFilter){
  datasets(filter:$filter, limit:50){
    nodes{
      id
      name
      xAxis { name type unit }
      yAxis { name type unit }
      data { x y }
    }
    pageInfo{ totalCount }
  }
}
```

```graphql
query StaticAnalytics($ids:[ID!]!){
  staticChartAnalytics(seriesIds:$ids){
    seriesId
    xAxis { name type unit }
    yAxis { name type unit }
    data { x y }
  }
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

Note

- Folosiți `AnalyticsFilterInput` pentru a limita la ani, latura (`vn`/`ch`) și filtre dimensionale/geo opționale.
- Pentru per‑capita semnificativ, asigurați populație pentru aria aleasă.

Vezi și

- Schema & tipuri: [graphql-schema-and-types](./graphql-schema-and-types.md)
- Cookbook: [cookbook](./cookbook.md)

