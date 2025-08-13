---
id: api-index
title: API – Overview
slug: /api
---

This section documents the Transparenta.eu Public Spending API. The platform exposes a GraphQL API for rich data access and a few REST endpoints for health checks, AI-friendly helpers, and machine-readable schema.

- Base URL: configure per deployment. Locally, the server runs on `http://localhost:3000` by default.
- GraphQL endpoint: `POST /graphql`
- GraphiQL (development only): `GET /graphiql`
- REST docs (development only): Swagger UI at `GET /docs`

**Who it's for**: Developers integrating or scripting the API.

**Outcomes**: Make a first request, navigate schema and examples, and discover helpers.

What’s available

- GraphQL: entities, reports, execution line items, classifications, analytics (heatmaps, entity analytics, totals/trends), datasets, and aggregated line items.
- REST: health probe, AI helpers for entity search and budget analysis, and MCP definition exposing the GraphQL SDL.

Key concepts

- Account categories: `vn` (revenues) and `ch` (expenses)
- Normalization: `total` or `per_capita` for aggregated analytics results
- Pagination: all list queries use `limit` and `offset` and return `pageInfo`
- Sorting: some queries accept `sort: { by, order }`

Next steps

- Getting started: basic requests and sample queries
- GraphQL schema and queries: full reference
- Filters, pagination, and sorting: input types and usage patterns
- REST endpoints: health, AI helpers, and MCP
- Errors and rate limits: response shapes, constraints, and limits

See also

- API Getting Started: [api-getting-started](./getting-started.md)
- Cookbook recipes: [api-cookbook](./cookbook.md)


