### Title

As a maintainer, I want useful error surfaces and optional telemetry, so that I can improve reliability without compromising privacy.

### Context

ErrorContext, Toaster, consent-gated analytics (PostHog) and Sentry.

### Actors

- Maintainers
- Users encountering errors

### User Flow

1. Errors are caught and displayed with context.
2. Telemetry only runs when consented; minimal otherwise.

### Acceptance Criteria

- Given consent disabled, when errors occur, then no enhanced context is sent.
- Given consent enabled, when events/errors occur, then sanitized context is captured.

### Error and Empty States

N/A

### Analytics & Telemetry

Event names and props defined; opt-in only.

### Accessibility

Alerts are readable and announced.

### Performance

Telemetry libraries loaded conditionally.

### Open Questions

- Additional redaction for PII?


