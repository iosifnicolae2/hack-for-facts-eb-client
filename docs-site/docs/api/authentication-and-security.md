---
id: api-authentication-and-security
title: Authentication and Security
---

Authentication

- Read access requires no authentication by default. Endpoints are public for querying data.
- A special header can be configured by the server operator to grant higher rate limits (API‑key style). If enabled in your environment, request the header name and key from the administrator.

Transport and CORS

- In production, CORS is restricted to configured origins. If your frontend is blocked, ensure the server’s allowed origins include your domain.
- Use HTTPS in production environments.

GraphQL security

- Query depth limit: 8 levels to prevent complex queries.
- Introspection is disabled in production. Use this documentation or the MCP definition (`/mcp/v1/definition`) to discover the schema when introspection is off.
- Batched queries are disabled.

Data permissions

- All data exposed is public finance data intended for public use. No write endpoints are exposed.


