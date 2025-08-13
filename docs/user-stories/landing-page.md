### Title

As a visitor, I want to quickly find an entity or jump into key features from the homepage, so that I can start exploring immediately.

### Context

Routes/components: `/` (`index.lazy.tsx`), `EntitySearchInput`, `QuickEntityAccess`, `PageCard`, animated title, persisted animation state.

### Actors

- Visitor

### User Flow

1. Page loads with title animation (first time) and search input focused on desktop.
2. User types entity name or CUI; sees results and navigates.
3. Alternatively, user clicks a PageCard to go to Charts, Map, or Entity Analytics.

### Acceptance Criteria

- Given desktop viewport, when page loads, then search input auto-focuses unless mobile.
- Given a valid entity query, when user selects a result, then navigates to `/entities/$cui`.
- Given a card click, when pressed, then navigates to the target route.

### Scenarios

- Given I start typing, when the input is debounced, then results update and selection can be made via keyboard.
- Given I have prior recent entities, when I open the page, then `QuickEntityAccess` shows shortcuts.
- Given the title animation has completed previously, when I revisit, then the static title shows immediately (persisted state key `landing-title-animation-complete`).

### Error and Empty States

Search shows no-results state and guidance.

### Analytics & Telemetry

Optional capture of card clicks and query execution (respecting consent).

### Accessibility

Keyboard navigation through search results; cards have accessible names.

### Performance

Page is static except for search; assets optimized.

### Open Questions

- Should recent entities appear on landing?

### References

- `src/routes/index.lazy.tsx`
- `src/components/entities/EntitySearch/index.tsx`
- `src/components/entities/QuickEntityAccess.tsx`
- `src/components/landing/PageCard.tsx`



