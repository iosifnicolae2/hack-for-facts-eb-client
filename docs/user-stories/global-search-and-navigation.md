### Title

As a user, I want a fast global entity search and clear navigation, so that I can jump between entities and features quickly.

### Context

Components: `FloatingEntitySearch`, `EntitySearchInput`, `AppSidebar`, `MobileSidebarFab`.

### Actors

- All users

### User Flow

1. Trigger floating search via FAB or `mod+k`.
2. Type and select a result to navigate.
3. Use sidebar to navigate primary sections.

### Acceptance Criteria

- Given keyboard shortcut, when pressed, then search opens with focus.
- Given a selection, when chosen, then navigate to entity page.
- Given mobile, when FAB tapped, then search opens.

### Error and Empty States

Search results empty state and retry guidance.

### Analytics & Telemetry

Optional capture of searches and navigation targets.

### Accessibility

Modal focus trap; ARIA labels.

### Performance

Debounced queries; cached recent results.

### Open Questions

- Persist recent searches across sessions?


