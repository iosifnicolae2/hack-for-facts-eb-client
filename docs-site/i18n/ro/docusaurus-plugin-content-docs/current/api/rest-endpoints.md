---
title: REST — Health, helper‑e AI, MCP
---

Bază URL: `http://localhost:3000`

**Pentru cine**: Dezvoltatori care preferă helper‑e REST simple

**Rezultate**: Căutați entități, obțineți analize rapide și schema MCP

## Health

- `GET /healthz`
  - 200 OK: "OK"
  - 503 Service Unavailable dacă sonda DB eșuează

## Helper‑e AI (endpoint‑uri simplificate)

- `GET /ai/v1/entities/search`
  - Query: `search` (obligatoriu), `limit` (1–10), `offset` (>=0)
  - Răspuns: `{ ok, data: { items, pageInfo, link } }`

- `GET /ai/v1/economic-classifications`
  - Query: `search` (obligatoriu), `limit` (1–50), `offset`
  - Răspuns: `{ ok, data: { items, pageInfo } }`

- `GET /ai/v1/entities/details`
  - Query: `entityCui` sau `entitySearch`, `year` (obligatoriu)
  - Răspuns: totaluri pe un an și un deep‑link către client

- `GET /ai/v1/entities/budget-analysis`
  - Query: `cui` sau `search`, `year` (obligatoriu)
  - Răspuns: compoziție agregată pe arii funcționale

- `GET /ai/v1/entities/budget-analysis-by-functional`
  - Query: `entityCui`, `year` (obligatoriu), `functionalCode` (ex.: `65` sau `65.04.02`)
  - Răspuns: totaluri și compoziție + deep‑link pentru aria specifică

- `GET /ai/v1/entities/budget-analysis-by-economic`
  - Query: `entityCui`, `year` (obligatoriu), `economicCode` (ex.: `10.01`)
  - Răspuns: totaluri și distribuție funcțională pentru codul economic

## MCP definition

- `GET /mcp/v1/definition`
  - JSON cu descrierea API‑ului GraphQL, inclusiv SDL și note de utilizare

## OpenAPI docs

- Swagger UI în dezvoltare la `GET /docs`
- Serverul generează un document OpenAPI pentru rutele REST

## Note

- CORS este permisiv în non‑producție; în producție, originile sunt configurate via env.
- Rate limiting este activ; vezi Rate limits.

## Vezi și

- GraphQL — Începe rapid: [getting-started](./getting-started.md)
- Cookbook API: [cookbook](./cookbook.md)

