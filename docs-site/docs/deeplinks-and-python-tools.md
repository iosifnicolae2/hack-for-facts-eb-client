---
id: deeplinks-and-python-tools
title: Deep‑links & shareable views — Beginner Guide
---

Share exactly what you see with a link. Transparenta.eu saves your current view (year, filters, map/table/chart, chart setup) in the URL, so others open the same page with the same settings. No setup or account needed.

### Quick Start
1) Open transparenta.eu
2) Search “Enter entity name or CUI...”
3) Pick “Reporting Year:” and adjust the view
4) Copy the page URL from your browser
5) Or, in Charts, click “Share Chart” → “Copy Link”
6) Send the link to anyone
7) They’ll open the same view

![IMG PLACEHOLDER — Deep‑links quickstart](./images/PLACEHOLDER-deeplinks-quickstart.png "Copy URL from Entity/Map/Entities; Copy Link from Charts")

### Guided Tour

#### Home and Search
- What you see
  - Cards: “Charts”, “Map”, “Entities”
  - Search input: “Enter entity name or CUI...”
- How to use
  1) Press ⌘/Ctrl+K or click the search box
  2) Type a few letters (e.g., “Sibiu”)
  3) Pick a result and press Enter
- Example
  - Open “Municipiul Sibiu”
- Media
  - [GIF PLACEHOLDER — Home search](./gifs/PLACEHOLDER-deeplinks-home-search.gif)

#### Entity page
- What you see
  - Header with “Reporting Year:”
  - Trend chart (Absolute vs YoY%)
  - Cheltuieli (Expenses) and Venituri (Revenues) columns
  - Analytics with Bar/Pie
  - Reports with download links
- How to use (sharable view)
  1) Set “Reporting Year:”
  2) Click a year on the trend to sync the page
  3) Search a topic inside Expenses/Revenues (e.g., “Învățământ”)
  4) Copy the browser URL
- Example
  - Share the entity view for 2024 with Expenses highlighted
- Media
  - ![IMG PLACEHOLDER — Entity deep‑link](./images/PLACEHOLDER-deeplinks-entity.png "Year, topic search, copy URL")

#### Spending + Filters
- What you see
  - Cheltuieli / Venituri
  - Per Capita / Total in analytics contexts
  - Year selector
  - Functional/Economic prefixes (via filters or searches in pages)
- How to use (sharable view)
  1) Choose Cheltuieli or Venituri
  2) Pick Per Capita for fair comparisons (or Total for scale)
  3) Set Year
  4) Add a Functional prefix (e.g., 65)
  5) Copy the URL
- Example
  - A link to “Expenses, Per Capita, 2024, Education”
- Media
  - ![IMG PLACEHOLDER — Filters shared](./images/PLACEHOLDER-deeplinks-filters.png "Side, normalization, year, prefixes")

#### Classifications (Functional/Economic)
- What you see
  - Functional = purpose (e.g., Education)
  - Economic = nature (e.g., salaries)
- How to use (sharable view)
  1) Prefer short prefixes for broad families (e.g., “65”)
  2) Add Economic if you need detail (e.g., “10.01”)
  3) Copy the URL to share the same topic
- Example
  - Share “Education (65) + Salaries (10.01)”
- Media
  - [GIF PLACEHOLDER — Add prefixes](./gifs/PLACEHOLDER-deeplinks-prefixes.gif)

#### Compare
- What you see
  - Map: “Filters”, “Legend”, “Data Table View”, “Chart”
  - Entities (Entity Analytics): ranking with “Export CSV”
  - Charts: multi‑series with “Share Chart”
- How to use (sharable view)
  1) Map: set side, normalization, year, prefix → copy URL
  2) Entities: apply filters → copy URL or “Export CSV”
  3) Charts: “Share Chart” → “Copy Link”
- Example
  - Share a Map link for “Education per capita in 2024”
- Media
  - ![IMG PLACEHOLDER — Compare deep‑links](./images/PLACEHOLDER-deeplinks-compare.png "Map/Entities/Charts shared views")

#### Export / Share
- What you see
  - Entities: “Export CSV”
  - Charts: “Share Chart” with “PNG”, “SVG”, “Copy Link”
- How to use
  1) For tables (Entities), use “Export CSV” to attach data
  2) For charts, click “Share Chart” → “Copy Link”
  3) Paste into articles, posts, or chats
- Example
  - Include a chart link and a CSV in a report
- Media
  - [GIF PLACEHOLDER — Copy chart link](./gifs/PLACEHOLDER-deeplinks-copy-link.gif)
  - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-deeplinks-export-csv.gif)

### Common Tasks (recipes)

#### Share an entity view for a specific year
- Steps
  1) Open the entity page
  2) Select “Reporting Year:”
  3) (Optional) Search a topic in Expenses or Revenues
  4) Copy the URL
- Expected result
  - Others see the same entity, year, and highlights
- Tip
  - Click a year on the trend to sync sections
- Link
  - [LINK PLACEHOLDER — Share entity view](#TODO-deeplinks-entity)

#### Share a Map view for a topic
- Steps
  1) Open “Map”
  2) Choose Cheltuieli or Venituri
  3) Select Per Capita or Total
  4) Pick Year
  5) Add a Functional prefix (e.g., 65)
  6) Copy the URL
- Expected result
  - Others open the same heatmap view
- Tip
  - On mobile, use the “Filters” button and “Legend” modal
- Link
  - [LINK PLACEHOLDER — Share map view](#TODO-deeplinks-map)

#### Share a chart with two cities
- Steps
  1) Charts → “Create chart”
  2) Add two series for the two cities and topic
  3) “Share Chart” → “Copy Link”
- Expected result
  - Others open the same chart with both series
- Tip
  - Label series clearly before sharing
- Link
  - [LINK PLACEHOLDER — Share chart](#TODO-deeplinks-chart)

#### Download a CSV ranking to attach
- Steps
  1) Open “Entities”
  2) Set side, normalization, year, topic
  3) Click “Export CSV”
- Expected result
  - A CSV with your filtered ranking
- Tip
  - Sort by Per Capita for fairness
- Link
  - [LINK PLACEHOLDER — CSV ranking](#TODO-deeplinks-csv)

### Understanding the Numbers
- Per Capita vs Total
  - Per Capita divides by population; if 0/missing, value shows 0
- Totals vs sub‑totals
  - Totals sum items in scope; sub‑totals roll up families
- Functional vs Economic
  - Functional = purpose; Economic = nature (e.g., salaries)
- Links preserve context
  - Deep‑links keep your year and topic choices

### Troubleshooting & FAQ
- Link opens but looks empty
  - Switch to Total; try another year; loosen prefixes
- “Copy Link” didn’t work
  - Ensure the chart is visible; try again
- Map link opens a different area
  - Confirm the topic/year are available for that region
- CSV export disabled
  - Table has no rows; adjust filters

### Accessibility & Keyboard tips
- Focus search
  - Press ⌘/Ctrl+K from any page
- Entity Year selector
  - Press ⌘/Ctrl+; to open “Reporting Year:”
- Chart editing
  - ⌘/Ctrl+C/X/V copy/cut/paste series; ⌘/Ctrl+D duplicate
- Mobile Map
  - “Filters” and “Legend” open in modals

### Privacy & Data
- Sources
  - Based on official budget execution data
- Update cadence
  - New years appear when published
- Consent
  - Analytics and enhanced error reporting only with your consent

### Glossary (short)
- Deep‑link
  - A URL that reopens the same view with your settings
- Share Chart
  - Panel to “PNG”, “SVG”, or “Copy Link” for charts
- Per Capita / Total
  - Normalized by population / Raw totals
- Functional / Economic
  - Purpose codes / Economic nature codes

### === SCREENSHOT & MEDIA CHECKLIST ===
- Copy URL on Entity page (with “Reporting Year:”) 
- Map with “Filters” panel and “Legend” modal (mobile)
- Entities “Export CSV” visible
- Charts “Share Chart” with “Copy Link”
- A received deep‑link opening the same view

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm which pages fully encode state in the URL (Entity, Map, Entities, Charts)
- Any short‑link support planned for long chart links?
- Should we add a visible “Copy Link” on Entity/Map/Entities pages too?
