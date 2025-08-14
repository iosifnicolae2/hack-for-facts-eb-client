---
id: app-shell-and-navigation
title: App shell & navigation — Beginner Guide
---

Move fast with a consistent layout, clear navigation, and simple privacy controls. Use the Home search, sidebar links, and mobile menus to reach Entity pages, Map, Entity Analytics, and Charts. No setup required.

### Quick Start
1) Open transparenta.eu
2) Click the search box (“Enter entity name or CUI...”)
3) Open the entity page
4) Pick “Reporting Year:”
5) Switch Cheltuieli (Expenses) or Venituri (Revenues)
6) Use sidebar cards to open “Map”, “Entities”, or “Charts”
7) Copy or share when ready

![IMG PLACEHOLDER — App shell quickstart](./images/PLACEHOLDER-app-shell-quickstart.png "Home, search, sidebar, mobile menus")

### Guided Tour

#### Home and Search
- What you see
  - Cards: “Charts”, “Map”, “Entities”
  - Search input: “Enter entity name or CUI...”
- How to use
  1) Press ⌘/Ctrl+K or click the search input
  2) Type a few letters (e.g., “Sibiu”)
  3) Pick the correct result and press Enter
- Example
  - Open “Municipiul Sibiu”
- Media
  - [GIF PLACEHOLDER — Home search](./gifs/PLACEHOLDER-app-shell-home-search.gif)

#### Entity page
- What you see
  - Header with “Reporting Year:”
  - Trend chart (Absolute vs YoY%)
  - Two columns: Cheltuieli and Venituri
  - Reports with download links
- How to use
  1) Set “Reporting Year:”
  2) Click a year on the chart to sync
  3) Search inside columns to highlight topics
  4) Open Reports
- Example
  - Year 2024; search “Învățământ” in Expenses
- Media
  - ![IMG PLACEHOLDER — Entity page](./images/PLACEHOLDER-app-shell-entity.png "Header, Year, KPIs, columns")

#### Spending + Filters
- What you see
  - Cheltuieli / Venituri
  - Per Capita / Total in analytics contexts
  - Year selector
  - Functional/Economic prefixes
- How to use
  1) Choose Cheltuieli or Venituri
  2) Pick Per Capita or Total
  3) Set the Year
  4) Add prefixes to focus a topic
- Example
  - Per Capita + Functional 65 (Education)
- Media
  - ![IMG PLACEHOLDER — Filters](./images/PLACEHOLDER-app-shell-filters.png "Side, normalization, year, prefixes")

#### Classifications (Functional/Economic)
- What you see
  - Functional = purpose (e.g., Education)
  - Economic = nature (e.g., salaries)
- How to use
  1) Use Functional prefix “65” for Education
  2) Use dotted Economic prefix “10.01” for salaries
  3) Combine both when needed
- Example
  - “65” + “10.01” for salaries in Education
- Media
  - [GIF PLACEHOLDER — Add prefixes](./gifs/PLACEHOLDER-app-shell-prefixes.gif)

#### Compare
- What you see
  - “Map”: heatmap, “Filters”, “Legend”, “Data Table View”, “Chart”
  - “Entities” (Entity Analytics): ranking with “Export CSV”
  - “Charts”: multi‑series with “Share Chart”
- How to use
  1) Open “Map”; set Year and Per Capita
  2) Add a Functional prefix
  3) Click a region to open its entity
  4) Open “Entities” to rank and export
  5) “Charts” → “Create chart” → add series → Line/Area
- Example
  - Compare cities on Education per capita
- Media
  - ![IMG PLACEHOLDER — Compare](./images/PLACEHOLDER-app-shell-compare.png "Map + ranking + chart")

#### Export / Share
- What you see
  - “Entities”: “Export CSV”
  - “Charts”: “Share Chart” → “PNG”, “SVG”, “Copy Link”
- How to use
  1) Export a ranking from “Entities”
  2) Copy a chart link from “Share Chart”
  3) Paste into an article or chat
- Example
  - Download a 2024 Education ranking; share a chart link
- Media
  - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-app-shell-export-csv.gif)
  - [GIF PLACEHOLDER — Copy Link](./gifs/PLACEHOLDER-app-shell-copy-link.gif)

### Common Tasks (recipes)

#### Find spending for {Entity, Year}
- Steps
  1) Search the entity
  2) Select “Reporting Year:”
  3) Choose Cheltuieli or Venituri
- Expected result
  - KPIs and lists update for that year
- Tip
  - Click a chart year to sync sections
- Link
  - [LINK PLACEHOLDER — Entity flow](#TODO-app-shell-entity-year)

#### Filter by code (topic)
- Steps
  1) Open “Entities”, “Map”, or a chart
  2) Add Functional prefix (e.g., 65)
  3) Optionally add Economic prefix (e.g., 10.01)
  4) Use Per Capita for fairness
- Expected result
  - Results focus on the topic family
- Tip
  - Shorter prefixes give broader coverage
- Link
  - [LINK PLACEHOLDER — Topic filters](#TODO-app-shell-topic)

#### Compare years for one entity
- Steps
  1) Open the entity page
  2) Switch trend: Absolute vs YoY%
  3) Click different years on the chart
- Expected result
  - See level and change over time
- Tip
  - Use Charts for multi‑series comparisons
- Link
  - [LINK PLACEHOLDER — Trend walkthrough](#TODO-app-shell-trend)

#### Download a CSV ranking
- Steps
  1) Open “Entities”
  2) Set side, normalization, year, prefixes
  3) Click “Export CSV”
- Expected result
  - A CSV file downloads
- Tip
  - Sort by Per Capita for fair rankings
- Link
  - [LINK PLACEHOLDER — Entities ranking](#TODO-app-shell-csv)

### Understanding the Numbers
- Totals vs sub‑totals
  - Totals sum items in scope; sub‑totals roll up families
- Per Capita vs Total
  - Per Capita divides by population; if 0/missing, value shows 0
- Functional vs Economic
  - Functional = purpose; Economic = nature (e.g., salaries)

### Troubleshooting & FAQ
- I’m lost
  - Use Home cards or browser Back
- Search returns nothing
  - Try fewer words; check spelling
- Map looks flat
  - Use Per Capita; try a broader prefix
- Export is disabled
  - The table has no rows; broaden filters

### Accessibility & Keyboard tips
- Focus search
  - Press ⌘/Ctrl+K
- Entity Year selector
  - Press ⌘/Ctrl+; to open “Reporting Year:”
- Charts editing
  - ⌘/Ctrl+C/X/V copy/cut/paste series; ⌘/Ctrl+D duplicate
- Mobile
  - On Map, “Filters” and “Legend” open as modals
- Navigation
  - Sidebar links on desktop; menus or FAB on mobile

### Privacy & Data
- Cookie banner
  - “Cookie settings” → “Essential only” or “Accept all”
- Consent
  - Analytics and enhanced errors only if you opt‑in
- Sources
  - Based on official budget execution data
- Updates
  - New years appear when published

### See also
- Global Search & Navigation: [global-search-and-navigation](./global-search-and-navigation.md)
- Filters system: [filters-system](./filters-system.md)
- Deep‑links & shareable views: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)

### Glossary (short)
- Cheltuieli / Venituri
  - Expenses / Revenues
- Per Capita / Total
  - Normalized by population / Raw totals
- Functional / Economic
  - Purpose codes / Economic nature codes
- Reporting Year
  - The year used for all values on a page

### === SCREENSHOT & MEDIA CHECKLIST ===
- Home with cards and search
- Sidebar and mobile navigation
- Entity header with “Reporting Year:”
- Map “Filters” and “Legend” (mobile + desktop)
- Entities “Export CSV”
- Charts “Share Chart” with “Copy Link”
- Cookie settings banner

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Is ⌘/Ctrl+K available on all pages, or Home focus only?
- Confirm mobile FAB/menus for navigation across pages
- Any planned quick links (e.g., “Open in Map”) from the entity header?
