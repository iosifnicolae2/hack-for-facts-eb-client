---
id: global-search-and-navigation
title: Global Search & Navigation — Beginner Guide
---

Find what you need fast. Use the Home search, keyboard shortcuts, and clear page links to move between Entity pages, Map, Entity Analytics, and Charts. No setup required.

**Who it’s for**: Anyone who wants to move quickly through the app

**Outcomes**: Open the right page faster, keep context, and share links confidently

### Quick Start
1) Open transparenta.eu
2) Press ⌘/Ctrl+K to focus search
3) Type “Enter entity name or CUI...”
4) Pick a result and press Enter
5) On the entity page, choose “Reporting Year:”
6) Switch Cheltuieli (Expenses) or Venituri (Revenues)
7) Use sidebar cards to open “Map”, “Entities”, or “Charts”

![IMG PLACEHOLDER — Quick Start](./images/PLACEHOLDER-global-search-quickstart.png "Home, search, entity, navigate")

### Guided Tour

#### Home and Search
- What you see
  - Cards: “Charts”, “Map”, “Entities”.
  - Search input: “Enter entity name or CUI...”.
- How to use
  1) Press ⌘/Ctrl+K or click the search input
  2) Type a few letters (e.g., “Sibiu”)
  3) Pick the correct result and press Enter
- Example
  - Search “Sibiu”, open “Municipiul Sibiu”
- Media
  - [GIF PLACEHOLDER — Home search](./gifs/PLACEHOLDER-global-search-home.gif)

#### Entity page
- What you see
  - Header with “Reporting Year:”
  - Trend chart (Absolute vs YoY%)
  - Two columns: Cheltuieli and Venituri
  - Reports with download links
- How to use
  1) Change “Reporting Year:”
  2) Click a year on the trend to sync sections
  3) Search in columns to highlight topics
  4) Use the navigation or browser Back to return
- Example
  - Year 2024, search “Învățământ” in Expenses
- Media
  - ![IMG PLACEHOLDER — Entity page](./images/PLACEHOLDER-global-search-entity.png "Header, Year, KPIs, columns")

#### Spending + Filters
- What you see
  - Cheltuieli / Venituri
  - Per Capita / Total in analytics contexts
  - Filters support Functional and Economic prefixes
- How to use
  1) Choose Cheltuieli or Venituri
  2) Pick Per Capita for fair comparisons
  3) Add a Functional prefix (e.g., 65)
  4) Optionally add an Economic prefix (e.g., 10.01)
- Example
  - Per Capita, Year 2024, Functional 65 (Education)
- Media
  - ![IMG PLACEHOLDER — Filters](./images/PLACEHOLDER-global-search-filters.png "Account side, normalization, codes")

#### Classifications (Functional/Economic)
- What you see
  - Functional = purpose (e.g., Education)
  - Economic = nature (e.g., salaries)
- How to use
  1) Use a code prefix for families (e.g., “65”)
  2) Use dotted economic prefixes for detail (e.g., “10.01”)
  3) Combine both to narrow the topic
- Example
  - “65” + “10.01” to focus salaries in Education
- Media
  - [GIF PLACEHOLDER — Add prefixes](./gifs/PLACEHOLDER-global-search-prefixes.gif)

#### Compare
- What you see
  - “Map”: heatmap with “Filters”, “Legend”, “Data Table View”, “Chart”
  - “Entities” (Entity Analytics): ranking table with “Export CSV”
  - “Charts”: time‑series comparisons with “Share Chart”
- How to use
  1) Open “Map”; set Year and Per Capita
  2) Add a Functional prefix (optional)
  3) Click a region to open its entity
  4) Open “Entities” to rank and sort
  5) “Charts” → “Create chart” → add two series → Line
- Example
  - Compare two cities on per‑capita Education
- Media
  - ![IMG PLACEHOLDER — Compare](./images/PLACEHOLDER-global-search-compare.png "Map + ranking + chart")

#### Export / Share
- What you see
  - “Entities”: “Export CSV”
  - “Charts”: “Share Chart” with “PNG”, “SVG”, “Copy Link”
- How to use
  1) In “Entities”, click “Export CSV”
  2) In a chart, open “Share Chart”
  3) Click “Copy Link” and paste it
- Example
  - Download a 2024 Education ranking
- Media
  - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-global-search-export-csv.gif)
  - [GIF PLACEHOLDER — Copy Link](./gifs/PLACEHOLDER-global-search-copy-link.gif)

### Common Tasks (recipes)

#### Find spending for {Entity, Year}
- Steps
  1) Press ⌘/Ctrl+K, search, open the entity
  2) Select “Reporting Year:”
  3) Choose Cheltuieli or Venituri
- Expected result
  - KPIs and lists for that year
- Tip
  - Click a year on the trend to sync
- Link
  - [LINK PLACEHOLDER — Entity flow](#TODO-global-search-entity-year)

#### Filter by code (topic)
- Steps
  1) Open “Entities” or a chart
  2) Add Functional prefix (e.g., 65)
  3) Optionally add Economic prefix (e.g., 10.01)
  4) Use Per Capita for fairness
- Expected result
  - Results focus on the chosen topic
- Tip
  - Prefer prefixes for speed and clarity
- Link
  - [LINK PLACEHOLDER — Topic filters](#TODO-global-search-topic-filters)

#### Compare years for one entity
- Steps
  1) Open the entity
  2) Switch trend: Absolute vs YoY%
  3) Click different years on the chart
- Expected result
  - See level and change over time
- Tip
  - Use a chart for multi‑series views
- Link
  - [LINK PLACEHOLDER — Trend walkthrough](#TODO-global-search-trend)

#### Download a CSV ranking
- Steps
  1) Open “Entities”
  2) Set Cheltuieli, Per Capita, Year
  3) Add Functional prefix (optional)
  4) Click “Export CSV”
- Expected result
  - A CSV file downloads
- Tip
  - Sort by Per Capita for fair comparisons
- Link
  - [LINK PLACEHOLDER — Entities ranking](#TODO-global-search-entities-ranking)

### Understanding the Numbers
- Totals vs sub‑totals
  - Totals sum your scope; sub‑totals roll up families
- Per Capita vs Total
  - Per Capita divides by population; if 0/missing, value shows 0
- Functional vs Economic
  - Functional = purpose; Economic = nature (e.g., salaries)
- VAT (TVA) and subsidies (Subvenții)
  - Use Economic codes to explore these

### Troubleshooting & FAQ
- Search returns no results
  - Try fewer words. Check spelling. Use a distinct term
- I’m lost in navigation
  - Use the Home cards or browser Back
- My table is empty
  - Switch to Total. Remove filters. Change year
- Export is disabled
  - The table has no rows. Broaden filters

### Accessibility & Keyboard tips
- Focus search
  - Press ⌘/Ctrl+K on any page
- Entity Year
  - Press ⌘/Ctrl+; to open “Reporting Year:”
- Charts editing
  - ⌘/Ctrl+C/X/V copy/cut/paste series; ⌘/Ctrl+D duplicate
- Mobile
  - On Map, “Filters” and “Legend” open as modals

### Privacy & Data
- Sources
  - Based on official budget execution data
- Update cadence
  - New years appear when published
- Consent
  - Analytics and enhanced errors run only with your consent

### See also
- App shell & navigation: [app-shell-and-navigation](./app-shell-and-navigation.md)
- Global filters: [filters-system](./filters-system.md)
- Deep‑links & shareable views: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)

### Glossary
- Entity
  - A public institution (e.g., city hall)
- Cheltuieli / Venituri
  - Expenses / Revenues
- Per Capita / Total
  - Normalized by population / Raw totals
- Functional / Economic classification
  - Purpose codes / Economic nature codes
- UAT / Județ
  - Local administrative unit / County

### === SCREENSHOT & MEDIA CHECKLIST ===
- Home search and results dropdown
- Entity header with “Reporting Year:”
- Trend chart (Absolute vs YoY%)
- Map “Filters” and “Legend” (mobile and desktop)
- Entities “Export CSV”
- Charts “Share Chart” with “Copy Link”

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Is a global search dialog available on all pages, or Home‑only focus?
- Confirm English/RO label combinations where visible
- Any CSV export row limits we should mention?
