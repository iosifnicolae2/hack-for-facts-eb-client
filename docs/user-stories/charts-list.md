### Title

As a chart user, I want to browse, search, organize, and manage my saved charts, so that I can quickly find and share them.

### Context

Route: `/charts`. Components: list, search, sorting, favorites, categories (`ChartCategories`), backup/restore, toasts.

### Actors

- Returning user with saved charts

### User Flow

1. List loads from localStorage with counts and filters.
2. User searches with text and hashtags, sorts list, toggles favorites.
3. User assigns categories, filters by category, and manages categories.
4. User backs up or restores charts.

### Acceptance Criteria

- Given charts exist, when I search by text or `#tag`, then results filter accordingly.
- Given a chart, when I toggle favorite, then it updates and persists.
- Given categories, when I assign/remove, then list reflects changes and persists.
- Given backup, when I export/import, then charts are saved/loaded and toasts confirm.

### Error and Empty States

No charts shows helpful getting-started state. Backup/restore failures show toasts.

### Analytics & Telemetry

Basic interactions (favorite, backup) optionally captured.

### Accessibility

Search input labeled; list items navigable; controls keyboard-accessible.

### Performance

Local filtering and memoized sorting; no network.

### Open Questions

- Category limits? Tag rename flows?

---

### Page structure and controls (What each control does and why)

Header and summary
- Title, description, and counts: Orient users and show total/favorites count.
- Backup/Restore buttons: Export/import locally saved charts. Why: portability across devices. What happens: prompts file dialog; shows toasts on success/failure.
- Create chart: Navigates to `/charts/new` which generates a new id and opens configuration.

Search and sorting
- Search input: Filters by title and description; supports hashtag categories (`#tag`) for category-based filtering. Why: quickly find a chart in large libraries.
- Sorting select: `Newest`, `Oldest`, `A–Z`, `Z–A`, `Favorites first`. Why: different retrieval strategies.

Tabs and categories
- Tabs: `All`, `Favorites`, and one per category. Why: focused browsing. What happens: list narrows to category or favorites.
- Category management (via `ChartCategories`): Add/rename categories and assign charts to them from card menus.

Chart cards
- Basic actions: open chart, toggle favorite, tag into categories, delete to trash (soft delete). Why: organize and curate library.
- Keyboard navigation: cards and actions are accessible; favorites and tag menus indicate state.

Empty state
- If no charts exist, shows a clear CTA to create the first chart.

Persistence
- Library, categories, and favorites are saved to localStorage and update in real time across tabs (storage events).

URL/state
- This page relies mostly on local UI state (search/sort), with no complex URL encoding.

Tips & tricks
- Use `#tag` in search to filter by category slugs quickly.
- Keep a small set of meaningful categories (e.g., `education`, `health`, `map-prototypes`) and combine with text search.
- Backup before clearing browser storage; restore on a new device to keep your work.

Examples
- “Find my Education charts from March”: type `education 2025-03` if your titles/descriptions follow a convention.
- “Focus only favorites and newest”: switch to Favorites tab and choose Newest.

### References
- `src/routes/charts/index.lazy.tsx`
- `src/components/charts/components/chart-list/*`
- `src/components/charts/chartsStore.ts`


