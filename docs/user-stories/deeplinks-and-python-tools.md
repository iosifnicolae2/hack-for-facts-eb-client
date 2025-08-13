### Title

As a power user, I want to deep-link charts/entities and generate links programmatically, so that I can share reproducible views.

### Context

Python helpers: `gpt-prompt/generate.py`, `src/routes/charts/$chartId/generate.py`. URL chart JSON schema; entity URL parameters.

### Actors

- Power users
- Integrators

### User Flow

1. Generate URLs with entity CUIs, filters, titles, year ranges.
2. Open links to hydrate chart state or navigate to entities with prefilled searches.

### Acceptance Criteria

- Given generated chart URL, when opened, then chart state is validated and saved to local storage.
- Given generated entity URL, when opened, then entity page opens with search parameters applied.

### Error and Empty States

Invalid JSON or parameters produce safe errors and guidance.

### Analytics & Telemetry

Optional capture of link-open events.

### Accessibility

N/A

### Performance

URL size considerations; compact JSON where possible.

### Open Questions

- Long URL handling or short-link service?


