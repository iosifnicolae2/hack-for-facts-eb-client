### Title

As a developer, I want route/data splitting and smart prefetching, so that pages feel instant and bundles stay lean.

### Context

TanStack Router loaders vs lazy components; React Query prefetch; intent preloading; caching windows.

### Actors

- Developers

### User Flow

N/A (technical behavior): beforeLoad prefetch, lazy render, shared query options.

### Acceptance Criteria

- Loaders prefetch with the same options used by components.
- Links use `preload="intent"` where beneficial.
- Stale/gc times are centralized and reasonable.

### Error and Empty States

N/A

### Analytics & Telemetry

N/A

### Accessibility

N/A

### Performance

Measure TTI improvements and cache hit rates.

### Open Questions

- Further server components adoption?


