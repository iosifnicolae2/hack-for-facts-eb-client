---
id: errors-and-rate-limits
title: Errors and Rate Limits
---

**Who it's for**: Developers handling error responses and throughput limits.

**Outcomes**: Know how errors are shaped and how rate limiting works.

Errors

- GraphQL errors follow standard GraphQL error objects in the `errors` array. Resolver implementations throw descriptive errors for validation issues and generic messages for server failures.
- REST endpoints return JSON objects for errors with `{ ok: false, error, details? }`, or plain text for health checks.

Rate limiting

- The server enables rate limiting with a configurable window.
- Default limits are environment‑dependent; a special header key can unlock a higher limit (configured via environment variables).
- The rate limit key is based on the special API key header when present, else on client IP.

Security and production behavior

- GraphQL introspection is disabled in production.
- Depth limiting is enforced for GraphQL queries (default depth: 8).
- CORS restricts origins in production; configure allowed origins via env.

Performance notes

Best practices

- Prefer pagination and targeted filters to reduce payload sizes.
- Avoid deeply nested GraphQL queries; depth limits apply.
- Handle 429s by backing off and retrying after the window.

See also

- Authentication & Security: [authentication-and-security](./authentication-and-security.md)
- REST endpoints: [rest-endpoints](./rest-endpoints.md)
- Batched GraphQL queries are disabled.
- Prefer pagination and targeted filters to reduce payload sizes.


