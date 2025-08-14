---
id: performance-and-routing
title: Performance & Routing — fast by default
---

The app is designed to feel instant. Pages pre‑load what you need, heavy pieces are loaded only when you open them, and links keep your context so you don’t lose your place. This page explains the user‑visible parts of those optimizations.

**Who it’s for**: Anyone who wants a smooth experience on desktop and mobile

**Outcomes**: Recognize loading states, keep context when navigating, recover if a page feels slow

### Quick Start
1) Use the Home search (⌘/Ctrl+K) to jump directly to an entity.
2) Navigate with in‑app links; your filters and year selections stay intact.
3) Charts and large tables show a short skeleton while they load.
4) On a slow network, switch to Total or shorten prefixes to load faster.
5) Share deep‑links so others open the same pre‑filtered view.

![IMG PLACEHOLDER — Performance quickstart](./images/PLACEHOLDER-performance-quickstart.png "Search, navigate, skeletons, deep‑links")

### Guided Tour

#### Fast navigation (keep context)
- What you see
  - In‑app links take you between Map, Entities, Entity pages, and Charts.
  - Your year, side, and topic choices carry over where it makes sense.
- How to use
  1) From Map, click a region to open its entity page.
  2) From Entities, sort and then export CSV without re‑setting filters.
  3) From a chart, use Back to return to your list of charts.
- Example
  - Open Map → click a city → its entity opens with your chosen year.
- Media
  - ![IMG PLACEHOLDER — Context preserved](./images/PLACEHOLDER-performance-context.png "Filters/year preserved while navigating")

#### Smart loading (skeletons and on‑demand)
- What you see
  - Brief placeholders while data loads (skeletons on charts/tables).
  - Pages become interactive quickly; heavy parts appear moments later.
- How to use
  1) Wait a moment for heavier views (charts or large tables).
  2) If your filter is very strict, broaden it to see results sooner.
- Example
  - The Entities ranking shows instantly; rows fill as they arrive.
- Media
  - [GIF PLACEHOLDER — Skeletons](./gifs/PLACEHOLDER-performance-skeletons.gif)

#### Mobile‑friendly routing
- What you see
  - On Map, filters and legend open as modals; pages avoid full reloads.
- How to use
  1) Tap Filters to adjust topic and year.
  2) Use the back gesture to return; your selections remain.
- Example
  - Switch between Map and entity without losing the chosen year.
- Media
  - ![IMG PLACEHOLDER — Mobile routing](./images/PLACEHOLDER-performance-mobile.png "Filters modal and back gesture")

#### Sharing and re‑opening views
- What you see
  - Deep‑links encode context in the URL; charts have “Share Chart”.
- How to use
  1) Copy the URL to share the same year and filters.
  2) For charts, click “Share Chart” → “Copy Link”.
- Example
  - Share “Education per capita in 2024” from Entities.
- Media
  - [GIF PLACEHOLDER — Deep‑link](./gifs/PLACEHOLDER-performance-deeplink.gif)

### Common Tasks (recipes)

#### Keep my filters while navigating
- Steps
  1) Set side, normalization, year, and prefixes.
  2) Follow in‑app links (Map → Entity, Entities → CSV, etc.).
- Expected result
  - Your selections remain; no need to re‑enter.
- Tip
  - If context resets, re‑apply from tags or filter panels.
- Link
  - [LINK PLACEHOLDER — Context walkthrough](#TODO-performance-context)

#### Make a slow page load faster
- Steps
  1) Switch to Total.
  2) Use a shorter Functional prefix (e.g., “65”).
  3) Change to a recent year with more complete data.
- Expected result
  - Results show sooner; refine after loading.
- Tip
  - Avoid combining many filters at once on slow networks.
- Link
  - [LINK PLACEHOLDER — Performance tips](#TODO-performance-tips)

#### Share a fast‑opening link
- Steps
  1) Configure your view (Per Capita, year, prefix).
  2) Copy the URL (or “Share Chart” → “Copy Link”).
- Expected result
  - Others open the same context with minimal loading.
- Tip
  - Prefer short prefixes for broader, faster results.
- Link
  - [LINK PLACEHOLDER — Shareable links](#TODO-performance-share)

### Understanding the Numbers & States
- Per Capita vs Total
  - Per Capita divides by population; if population is 0 or missing, per‑capita shows 0. Total shows raw amounts.
- Empty, loading, error
  - Loading shows skeletons; empty means no rows match; errors offer Retry.
- Topic families
  - Shorter prefixes include more items and usually load faster initially.

### Troubleshooting & FAQ
- A page stays on a skeleton too long
  - Check your connection; broaden filters; try Total.
- “No data” appears
  - Adjust year or remove a very narrow prefix.
- I lost my place after going back
  - Reopen the last page; most pages keep your selections.
- The app feels slower on mobile
  - Use Wi‑Fi; keep prefixes short; avoid multiple complex filters.

### Accessibility & Keyboard tips
- Focus search
  - Press ⌘/Ctrl+K from any page.
- Keyboard navigation
  - Tab and Arrow keys move through inputs and lists; Enter to select.
- Mobile ergonomics
  - Filters open as modals; large tap targets reduce errors.

### Privacy & Data
- Consent
  - Optional analytics/enhanced errors only with your opt‑in; performance features don’t require tracking.
- Data sources
  - Based on official budget execution data; loading depends on your filters.

### Glossary (short)
- Skeleton
  - A placeholder UI shown while content is loading.
- Deep‑link
  - A URL that reopens a view with your current context.
- Normalization
  - Per Capita vs Total display for analytics contexts.

### See also
- Global Search & Navigation: [global-search-and-navigation](./global-search-and-navigation.md)
- Deep‑links & shareable views: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)
- Error Handling & Telemetry: [error-and-telemetry](./error-and-telemetry.md)

### === SCREENSHOT & MEDIA CHECKLIST ===
- Navigation preserving context (Map → Entity)
- Skeletons on Entities/Charts loading
- Mobile Filters and back gesture
- Copy URL / Share Chart link

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm which pages preserve filters/year automatically on navigation.
- Any known slow queries we should steer beginners away from?
