---
id: filters-system
title: Filters System — Beginner Guide to common patterns
---

Filters help you focus on a topic, time, place, and scale across pages (Map, Entities, Entity pages, Charts). This guide shows the shared patterns and tips so you can get results fast and consistently.

**Who it’s for**: Anyone filtering budgets by topic, year, and geography

**Outcomes**: Apply the same filters across pages; avoid empty states; share reproducible links

### Quick Start (Try it now)
1) Open Entity Analytics (ranking): [Open in app](https://transparenta.eu/analytics)
2) Choose Cheltuieli (Expenses)
3) Pick Per Capita and set Year (e.g., 2024)
4) Add Functional prefix “65” (Education)
5) Export CSV, or switch to Charts to visualize: [Charts – New](https://transparenta.eu/charts/new)

<!-- ![IMG PLACEHOLDER — Filters quickstart](./images/PLACEHOLDER-filters-quickstart.png "Side, normalization, year, topic") -->

### Guided Tour

#### Core controls used across pages
- What you see
  - Account side: Cheltuieli (Expenses) / Venituri (Revenues)
  - Normalization: Per Capita / Total (analytics contexts)
  - Time: Year selector
  - Topic: Functional and Economic code prefixes
  - Geography: UAT vs Județ, or an entity list
- How to use
  1) Set account side and normalization first.
  2) Choose Year.
  3) Add a Functional prefix (e.g., 65 for Education).
  4) Optionally add an Economic prefix (e.g., 10.01 for salaries).
- Example
  - Expenses, Per Capita, 2024, Functional 65.
- Media
  <!-- - ![IMG PLACEHOLDER — Shared filters](./images/PLACEHOLDER-filters-shared.png "Common controls across pages") -->

#### Functional vs Economic prefixes
- What you see
  - Functional = purpose (e.g., Education).
  - Economic = nature (e.g., salaries, goods & services).
- How to use
  1) Prefer short prefixes (e.g., “65”) to include a code family.
  2) Add dotted economic prefixes for detail (e.g., “10.01”).
  3) Combine both to narrow the topic.
- Example
  - 65 + 10.01 for salaries in Education.
- Media
  <!-- - [GIF PLACEHOLDER — Enter prefixes](./gifs/PLACEHOLDER-filters-prefixes.gif) -->

#### Geography and entities
- What you see
  - Map: UAT or Județ with a Filters panel; Entities: a ranking list.
- How to use
  1) On Map, toggle UAT/Județ and pick Year + Per Capita.
  2) Click a region to open the entity page.
  3) In Entities, sort columns and export CSV.
- Example
  - UAT, Per Capita, 2024, Functional 65 → Export CSV.
- Media
  <!-- - ![IMG PLACEHOLDER — Geo filters](./images/PLACEHOLDER-filters-geo.png "Map/Entities geography controls") -->

#### Clearing and sharing
- What you see
  - Clear buttons, tags, and URL updates as you filter.
- How to use
  1) Remove tags to broaden results.
  2) Copy the page URL (deep‑link encodes your current filters).
  3) In charts, use “Share Chart” → “Copy Link”.
- Example
  - Share a link for “Education per capita in 2024”.
- Media
  <!-- - [GIF PLACEHOLDER — Clear & share](./gifs/PLACEHOLDER-filters-clear-share.gif) -->

### Common Tasks (recipes)

#### Filter by Functional prefix (topic)
- Steps
  1) Open Entities (ranking) or Map: [Open Entities](https://transparenta.eu/analytics)
  2) Add Functional prefix “65”.
  3) Set Per Capita and Year.
- Expected result
  - Results focus on Education spending.
- Tip
  - Shorter prefix = broader family; start broad, then refine.
- Link
  - LINK PLACEHOLDER — Topic filtering flow

#### Add an Economic prefix for detail
- Steps
  1) Keep Functional 65.
  2) Add Economic “10.01”.
  3) Review the list or chart.
- Expected result
  - You see salaries within Education.
- Tip
  - Combining both prefixes narrows results quickly.
- Link
  - LINK PLACEHOLDER — Combined prefixes

#### Limit to a geography
- Steps
  1) On Map, switch to Județ or UAT.
  2) Apply your topic and year.
  3) Click a region to open its entity.
- Expected result
  - You focus on a level and drill into entities.
- Tip
  - Use Entities (ranking) for CSV exports.
- Link
  - LINK PLACEHOLDER — Geography walkthrough

#### Build a chart from a filtered view
- Steps
  1) After exploring Map/Entities, open Charts → Create: [Charts – New](https://transparenta.eu/charts/new)
  2) Add a series with the same topic and year.
  3) Share the chart link.
- Expected result
  - A reproducible chart matching your filters.
- Tip
  - Name series clearly (city, topic, normalization).
- Link
  - LINK PLACEHOLDER — Chart series setup

### Understanding the Numbers
- Per Capita vs Total
  - Per Capita divides by population; if population is 0 or missing, per‑capita shows 0.
- Totals vs sub‑totals
  - Totals sum scoped items; sub‑totals roll up families.
- Topic families
  - Code prefixes represent families (e.g., Education = 65).

### Troubleshooting & FAQ
- No results after filtering
  - Shorten prefixes; switch to Total; try another year.
- Export disabled
  - The table is empty. Broaden filters first.
- Map looks flat
  - Use Per Capita or a higher‑level prefix.
- I can’t find a code
  - Try a shorter prefix or search for a related term.

### Accessibility & Keyboard tips
- Focus search
  - Press ⌘/Ctrl+K.
- Lists
  - Use Tab/Arrow keys; Enter to apply.
- Mobile
  - Map filters open in a modal; legend is accessible.

### Privacy & Data
- Sources
  - Based on official budget execution data.
- Consent
  - Analytics and enhanced errors only with your opt‑in; filtering works either way.

### Glossary (short)
- Cheltuieli / Venituri
  - Expenses / Revenues.
- Per Capita / Total
  - Normalized by population / Raw totals.
- Functional / Economic
  - Purpose codes / Economic nature codes.
- UAT / Județ
  - Local administrative unit / County.

### See also
- Global Search & Navigation: [global-search-and-navigation](./global-search-and-navigation.md)
- Data & Analytics — Beginner Guide: [data-and-analytics-utilities](./data-and-analytics-utilities.md)
- Filters cheat‑sheet (API): [filters-pagination-sorting](./api/filters-pagination-sorting.md)
- Unified filter deep dive (API): [unified-filter-interface](./api/unified-filter-interface.md)
 - Deep‑links & shareable views: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)

### === SCREENSHOT & MEDIA CHECKLIST ===
- Shared filters (side, normalization, year, prefixes)
- Map Filters panel (desktop) and modal (mobile)
- Entities with tags and Export CSV
- Clear filters + URL deep‑link sharing

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm exact labels for filters across pages (EN/RO pairs).
- Any limits for prefix length or combined filters we should mention?
