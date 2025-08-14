---
id: api-rest-endpoints
title: REST – Health, AI Helpers, MCP
---

Base URL: `http://localhost:3000`

**Who it's for**: Developers who prefer simple REST helpers.

**Outcomes**: Quickly search entities, get analyses, and fetch schema info.

Health

- `GET /healthz`
  - 200 OK: `"OK"`
  - 503 Service Unavailable if DB probe fails

AI helpers (simplified endpoints for agents and quick integrations)

- `GET /ai/v1/entities/search`
  - Query: `search` (required), `limit` (1–10), `offset` (>=0)
  - Returns: `{ ok, data: { items, pageInfo, link } }`

- `GET /ai/v1/economic-classifications`
  - Query: `search` (required), `limit` (1–50), `offset`
  - Returns: `{ ok, data: { items, pageInfo } }`

- `GET /ai/v1/entities/details`
  - Query: `entityCui` or `entitySearch`, `year` (required)
  - Returns: one‑year totals and a deep link to the client app

- `GET /ai/v1/entities/budget-analysis`
  - Query: `cui` or `search`, `year` (required)
  - Returns: grouped income/expense overview by functional area

- `GET /ai/v1/entities/budget-analysis-by-functional`
  - Query: `entityCui`, `year` (required), `functionalCode` (chapter like `65` or full like `65.04.02`)
  - Returns: totals and composition, plus a deep link to the specific area

- `GET /ai/v1/entities/budget-analysis-by-economic`
  - Query: `entityCui`, `year` (required), `economicCode` (e.g., `10.01` or `10.01.01`)
  - Returns: totals and functional distribution for that economic code

MCP definition

- `GET /mcp/v1/definition`
  - Returns a JSON description of the GraphQL API, including the SDL and usage notes

OpenAPI docs

- Swagger UI is mounted in development at `GET /docs`
- The server generates an OpenAPI document for REST routes (health and AI endpoints)

Notes

- CORS is permissive in non‑production; in production, allowed origins are configured via environment variables.
- Rate limiting is enabled; see Rate limits for details.

See also

- GraphQL Getting Started: [api-getting-started](./getting-started.md)
- API Cookbook: [api-cookbook](./cookbook.md)
 - Errors & Rate Limits: [api-errors-and-rate-limits](./errors-and-rate-limits.md)


