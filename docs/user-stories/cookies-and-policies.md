### Title

As a privacy-conscious user, I want to control analytics and error reporting, and review policies, so that I can make informed choices.

### Context

Routes: `/cookies`, `/cookie-policy`, `/privacy`, `/terms`. Components: consent switches, accept/decline, timestamps, links.

### Actors

- All users

### User Flow

1. Open Cookie Settings; toggle analytics/sentry; accept all or essential only; save.
2. Read policies; navigate between policy pages.

### Acceptance Criteria

- Given no prior consent, when app loads, then banner appears and essential-only is active.
- Given toggles, when changed, then consent is persisted and applied immediately.
- Given policy pages, when opened, then titles/descriptions reflect SEO.

### Error and Empty States

If localStorage unavailable, show notice and disable non-essential features.

### Analytics & Telemetry

Consent changes may be logged locally; third-party tools respect consent state.

### Accessibility

Switches labeled; links navigable; policy content readable.

### Performance

Static content; minimal JS.

### Open Questions

- Regional consent requirements (e.g., additional categories)?


