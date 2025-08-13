### Title

As a user, I want consistent, powerful filters across pages, so that I can target the data I need.

### Context

Filter components across charts, entity analytics, and map. Lazy-loaded label data via React Query and localStorage caches.

### Actors

- Users applying filters

### User Flow

1. Open filter UIs; search and select entities, types, prefixes, flags, years, etc.
2. See applied filters as tags; remove quickly.

### Acceptance Criteria

- Given infinite lists, when scrolling, then more options load seamlessly.
- Given label maps, when loaded, then UI updates names without reload.
- Given tags, when removed, then data refreshes.

### Scenarios

- Given entity type labels load lazily, when the query resolves, then UI displays labels instead of `id::<id>` placeholders.
- Given functional chapter maps are not cached, when first loaded, then they are persisted to localStorage and reused on next visit.
- Given multi-select infinite lists, when reaching end, then `hasNextPage` prevents further requests.

### Error and Empty States

Error display and retry; empty list with instructions.

### Analytics & Telemetry

Optional filter selection events.

### Accessibility

Inputs labeled; lists keyboard navigable.

### Performance

Stable query keys, infinite loading, debounced search.

### Open Questions

- Cross-page persistence of filter selections?

### References

- `src/components/filters/**`
- `src/hooks/filters/useFilterLabels.tsx`
- `src/lib/analytics-utils.ts`



