### Title

As a user, I want my charts and preferences to persist locally, so that my setup remains available between visits.

### Context

Charts localStorage schema and CRUD; categories/favorites; persisted table and UI preferences; copy/paste utilities.

### Actors

- Returning users

### User Flow

1. Create and edit charts; changes persist.
2. Manage categories/favorites.
3. Preferences (density, columns) persist per table.

### Acceptance Criteria

- Given edits, when page reloads, then state is restored.
- Given backup/restore, when used, then state round-trips losslessly.

### Error and Empty States

Storage quota errors show actionable messages.

### Analytics & Telemetry

Local-only operations; optional events.

### Accessibility

N/A

### Performance

Efficient serialization; throttled writes.

### Open Questions

- Encryption or server sync future?


