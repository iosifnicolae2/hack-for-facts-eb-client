---
id: api-getting-started
title: API – Getting Started
---

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
  "query": "query($f:AnalyticsFilterInput!){ entityAnalytics(filter:$f, limit:10){ nodes{ entity_cui entity_name per_capita_amount } pageInfo{ totalCount } } }",
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


