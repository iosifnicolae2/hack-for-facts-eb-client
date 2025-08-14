---
id: api-getting-started
title: API – Getting Started
---

**Who it's for**: Developers who want to make a working request in seconds

**Outcomes**: Issue a minimal GraphQL query, understand required fields, explore more examples

Quickstart (copy‑paste)

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($f:AnalyticsFilterInput!){ entityAnalytics(filter:$f, limit:3){ nodes{ entity_cui entity_name total_amount per_capita_amount } pageInfo{ totalCount } } }",
  "variables": { "f": { "years": [2024], "account_category": "ch" } }
}'
```

Notes

- Required fields for analytics: `years` and `account_category` (`vn` revenues, `ch` expenses)
- Add `normalization: "per_capita"` to compare fairly across different sizes; otherwise totals are returned
- See more examples below or the Cookbook

Basics

Send GraphQL requests to `POST /graphql` with a JSON body containing a `query` string and optional `variables`.

Example: list entities

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($limit:Int,$offset:Int){ entities(limit:$limit, offset:$offset){ nodes{ cui name entity_type } pageInfo{ totalCount } } }",
  "variables": { "limit": 5, "offset": 0 }
}'
```

Example: entity analytics (per‑capita expenses)

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($f:AnalyticsFilterInput!){ entityAnalytics(filter:$f, limit:10){ nodes{ entity_cui entity_name per_capita_amount total_amount } pageInfo{ totalCount } } }",
  "variables": { "f": { "years": [2024], "account_category": "ch", "normalization": "per_capita" } }
}'
```

Example: heatmap data for UATs

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($f:AnalyticsFilterInput!){ heatmapUATData(filter:$f){ uat_code uat_name per_capita_amount } }",
  "variables": { "f": { "years": [2024], "account_category": "ch" } }
}'
```

REST helper: quick entity search

```bash
curl 'http://localhost:3000/ai/v1/entities/search?search=Sibiu&limit=5'
```

Notes

- GraphiQL is available in development at `/graphiql`.
- Introspection is disabled in production. Use this documentation or the MCP definition at `/mcp/v1/definition` to discover the schema.
- Batched GraphQL queries are disabled.

See also

- Queries and examples: [api-graphql-queries](./graphql-queries.md)
- Cookbook recipes: [api-cookbook](./cookbook.md)
- Analytics filter deep dive: [api-unified-filter-interface](./unified-filter-interface.md)


