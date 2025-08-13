### Title

As a developer, I want shared analytics utilities and deterministic data hooks, so that features remain consistent and performant.

### Context

Files: `analytics-utils`, `chart-calculation-utils`, `components/charts/hooks/useChartData`, aggregated charts conventions.

### Actors

- Developers, advanced users

### User Flow

N/A (technical behaviors): aggregation logic, color generation, unit handling, calculation evaluation.

### Acceptance Criteria

- Aggregated data uses `useAggregatedData`; year range shown in header and in-chart subtitle.
- Pie chart blocks on mixed units with warning.
- Calculation series evaluates recursively and detects cycles.

### Error and Empty States

Graceful failures with UI messages.

### Analytics & Telemetry

Optional dev metrics; not user-facing.

### Accessibility

N/A

### Performance

Memoized computations; cached label maps; request cancellation.

### Open Questions

- Future multi-axis support for mixed units?


