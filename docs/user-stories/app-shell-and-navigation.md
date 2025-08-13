### Title

As a visitor, I want a consistent application shell with navigation and theming, so that I can explore features easily.

### Context

Routes/components: `src/routes/__root.tsx`, `AppSidebar`, `SidebarInset`, `ThemeProvider`, `HotkeysProvider`, `Toaster`, `CookieConsentBanner`, `MobileSidebarFab`, `Seo`, `JsonLd`, `FloatingEntitySearch`, `Analytics` pageview.

### Actors

- Visitor
- Returning user

### User Flow

1. App loads with global providers and sidebar layout.
2. User toggles theme, navigates via sidebar, or opens floating search (hotkey `mod+k`).
3. Global toasts and cookie banner surface as needed.

### Acceptance Criteria

- Given first visit, when the app loads, then cookie banner is visible and analytics is disabled until consent.
- Given any route change, when pageview occurs, then analytics hook is invoked if consented.
- Given keyboard shortcut `mod+k`, when pressed, then entity search dialog opens.

### Scenarios

- Given the sidebar is present, when the viewport width is small, then the `MobileSidebarFab` shows a FAB that opens navigation.
- Given theme preference exists in storage, when app loads, then `ThemeProvider` applies stored theme; else default to light.
- Given a global toast is triggered, when it appears, then it renders via `Toaster` with correct variant and is dismissible.
- Given a JSON-LD site schema, when the root renders, then `<JsonLd />` is present with `SearchAction` metadata.

### Error and Empty States

Global error context surfaces route/component errors with friendly messaging.

### Analytics & Telemetry

Pageview event on route changes; no tracking without consent.

### Accessibility

Keyboard navigation via sidebar and modal focus trapping works.

### Performance

Root renders lightweight shell; heavy views are lazy-loaded.

### Open Questions

- Should sidebar state persist across sessions?

### References

- `src/routes/__root.tsx`
- `src/components/sidebar/app-sidebar.tsx`
- `src/components/sidebar/mobile-sidebar-fab.tsx`
- `src/components/privacy/CookieConsentBanner.tsx`
- `src/lib/analytics.ts`, `src/lib/seo.tsx`



