---
id: map
title: Map — Beginner Guide for spatial comparison
---

See public spending across Romania on a heatmap. Compare UATs and counties, switch to table or charts, and jump to entity pages. No setup required.

### Quick Start
1) Open transparenta.eu
2) Click “Map”
3) Choose UAT or Județ
4) Set Year and Per Capita or Total
5) Add a topic filter (Functional prefix)
6) Click a region to open its entity
7) Switch to “Data Table View” if needed

<!-- ![IMG PLACEHOLDER — Map quickstart](./images/PLACEHOLDER-map-quickstart.png "Open Map, set filters, click a region") -->

### Guided Tour

#### Home/Search
- What you see
  - Home cards: “Charts”, “Map”, “Entities”.
  - Search box: “Enter entity name or CUI...”.
- How to use
  1) Click “Map” to open the heatmap
  2) Or search an entity and open its page
- Example
  - Open “Map” to start broad
- Media
  <!-- - [GIF PLACEHOLDER — Open Map](./gifs/PLACEHOLDER-map-open.gif) -->

#### Entity page
- What you see
  - Header shows name and “Reporting Year:”.
  - Trend chart and two columns: Cheltuieli, Venituri.
  - Reports section with downloads.
- How to use
  1) On Map, click a region
  2) The entity page opens for that area
  3) Pick “Reporting Year:”
- Example
  - Click “Sibiu” on the map, open the entity
- Media
  <!-- - ![IMG PLACEHOLDER — Entity from map](./images/PLACEHOLDER-map-to-entity.png "Click region → entity") -->

#### Spending + Filters (on Map)
- What you see
  - Desktop: left filter panel
  - Mobile: floating “Filters” button (modal)
  - “Legend” modal on mobile; desktop legend shows “Interval Valori”
  - Views: “Map”, “Data Table View”, “Chart”
- How to use
  1) Choose UAT or Județ
  2) Pick Cheltuieli (Expenses) or Venituri (Revenues)
  3) Select Per Capita for fair comparisons or Total for size
  4) Set Year
  5) Add Functional prefix (e.g., 65)
  6) Switch to Table or Chart if helpful
- Example
  - UAT, Cheltuieli, Per Capita, Year 2024, Functional 65
- Media
  <!-- - ![IMG PLACEHOLDER — Filters](./images/PLACEHOLDER-map-filters.png "UAT/Județ, account side, normalization, year") -->
  <!-- - [GIF PLACEHOLDER — Legend on mobile](./gifs/PLACEHOLDER-map-legend.gif) -->

#### Classifications (Functional/Economic)
- What you see
  - Functional codes: what money is used for
  - Economic codes: the nature (e.g., salaries)
- How to use
  1) Add a Functional code prefix (e.g., “65”)
  2) Optionally add an Economic prefix (e.g., “10.01”)
  3) Keep prefixes short for broader families
- Example
  - “65” for Education
- Media
  <!-- - [GIF PLACEHOLDER — Add prefixes](./gifs/PLACEHOLDER-map-prefixes.gif) -->

#### Compare
- What you see
  - Heatmap with selectable regions
  - “Data Table View” to sort and page results
  - “Chart” view for quick distributions
- How to use
  1) Apply filters (side, normalization, year, prefixes)
  2) Inspect colors; use the Legend
  3) Switch to “Data Table View” and sort
  4) Open an entity for deep‑dive
- Example
  - Compare counties by Education per capita in 2024
- Media
  <!-- - ![IMG PLACEHOLDER — Map compare](./images/PLACEHOLDER-map-compare.png "Heatmap + table") -->

#### Export/Share
- What you see
  - Map includes Table and Chart views
  - Export CSV lives in “Entities” (Entity Analytics)
- How to use
  1) Switch to “Entities” for a full ranking
  2) Click “Export CSV” to download
  3) On charts, use “Share Chart” → “Copy Link”
- Example
  - Export a county ranking for a story
- Media
  <!-- - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-export-csv.gif) -->
  <!-- - [GIF PLACEHOLDER — Copy chart link](./gifs/PLACEHOLDER-copy-link.gif) -->

### Common Tasks (recipes)

#### Find spending for `{Entity, Year}`
- Steps
  1) On Map, click the region
  2) On the entity page, set “Reporting Year:”
  3) Choose Cheltuieli or Venituri
- Expected result
  - The page updates for that year
- Tip
  - Click a year on the trend to sync sections
- Link
  <!-- - [LINK PLACEHOLDER — Entity from map](#TODO-map-to-entity) -->

#### Filter by code (topic)
- Steps
  1) Open Map
  2) Add a Functional prefix (e.g., 65)
  3) Optionally add an Economic prefix
  4) Pick Per Capita for fairness
- Expected result
  - Map, table, and chart follow your topic
- Tip
  - Use short prefixes for broader coverage
- Link
  <!-- - [LINK PLACEHOLDER — Prefix filters](#TODO-map-prefixes) -->

#### Compare years for one area
- Steps
  1) Filter the Map for your topic
  2) Click a region to open the entity
  3) Change “Reporting Year:” and review trends
- Expected result
  - You see levels and changes across years
- Tip
  - Use charts to visualize multi‑year lines
- Link
  - LINK PLACEHOLDER — Year comparison

#### Download a CSV
- Steps
  1) Open “Entities”
  2) Set Cheltuieli, Per Capita, Year
  3) Add Functional prefix (optional)
  4) Click “Export CSV”
- Expected result
  - A CSV file downloads
- Tip
  - Sort by Per Capita for fair rankings
- Link
  - LINK PLACEHOLDER — Entities ranking

### Understanding the Numbers
- Per Capita vs Total
  - Per Capita divides by population. If population is 0 or missing, value shows 0.
- Colors and Legend
  - Darker means higher values for your current filters.
- Functional vs Economic
  - Functional = purpose. Economic = nature (e.g., salaries).
- Totals and sub‑totals
  - Sub‑totals roll up families of codes.

### Troubleshooting & FAQ
- “Error loading data”
  - Check connection. Try again. Adjust filters.
- “Map data not available”
  - Switch to UAT/Județ or pick another year.
- “No data available for the map”
  - Broaden filters or remove narrow prefixes.
- Map looks flat
  - Switch to Per Capita or a higher‑level prefix.
- Table is empty
  - Use a broader topic or different year.

### Accessibility & Keyboard tips
- Mobile
  - Tap the floating “Filters” button. “Legend” opens from the help icon.
- Desktop
  - Filter panel is on the left. Legend shows on the map.
- Keyboard
  - Use Tab and Arrow keys to navigate inputs and lists.

### Privacy & Data
- Sources
  - Based on official budget execution data.
- Updates
  - New years appear when published.
- Consent
  - Analytics and enhanced error reporting run only with your consent.

### See also
- Entity Analytics — rankings and CSV export: [entity-analytics](./entity-analytics.md)
- Entity Details — investigate one institution: [entity-details](./entity-details.md)
- Deep‑links & shareable views: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)

### Glossary
- UAT
  - Local administrative unit (city/town/commune).
- Județ
  - County.
- Cheltuieli / Venituri
  - Expenses / Revenues.
- Functional / Economic
  - Purpose codes / Economic nature codes.
- Per Capita / Total
  - Normalized by population / Raw totals.

### === SCREENSHOT & MEDIA CHECKLIST ===
- Map with filter panel (desktop)
- Mobile “Filters” modal and “Legend” modal
- “Data Table View” with sorting and paging
- “Chart” view for distributions
- Click region → entity page

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm desktop legend title (“Interval Valori”) vs mobile “Legend”.
- Are Map table columns and sorts fixed or configurable?
- Any maximum page size or export options planned for Map?
