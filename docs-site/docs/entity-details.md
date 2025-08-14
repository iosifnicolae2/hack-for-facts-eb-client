---
id: entity-details
title: Entity Details — Beginner Guide
---

See a complete view of one institution. Pick the year, read KPIs, scan Expenses (Cheltuieli) and Revenues (Venituri), highlight topics, and open reports. No setup required.

### Quick Start
1) Open transparenta.eu
2) Search “Enter entity name or CUI...”
3) Open the entity page
4) Pick “Reporting Year:”
5) Toggle trend: Absolute or YoY%
6) Search “Învățământ” in Expenses
7) Open “Reports” to download files

<!-- ![IMG PLACEHOLDER — Entity quickstart](./images/PLACEHOLDER-entity-quickstart.png "Header, Year, KPIs, columns") -->

### Guided Tour

#### Home and Search
- What you see
  - Cards: “Charts”, “Map”, “Entities”.
  - Search: “Enter entity name or CUI...”.
- How to use
  1) Press ⌘/Ctrl+K or click the search box
  2) Type a few letters (e.g., “Sibiu”)
  3) Pick the correct result and press Enter
- Example
  - Open “Municipiul Sibiu”
- Media
  <!-- - [GIF PLACEHOLDER — Home search](./gifs/PLACEHOLDER-entity-home-search.gif) -->

#### Entity page
- What you see
  - Header with “Reporting Year:”
  - KPIs and a trend chart (Absolute vs YoY%)
  - Two columns: Cheltuieli (Expenses) and Venituri (Revenues)
  - Analytics with Bar/Pie toggles
  - Reports with download links
- How to use
  1) Change “Reporting Year:”
  2) Click a year on the chart to sync the page
  3) Search inside columns to highlight topics
  4) Switch Analytics to Bar or Pie
  5) Open “Reports” to download files
- Example
  - Year 2024. Search Expenses for “Învățământ”
- Media
  <!-- - ![IMG PLACEHOLDER — Entity page](./images/PLACEHOLDER-entity-page.png "Header, Year, KPIs, columns") -->
  <!-- - [GIF PLACEHOLDER — Year + trend](./gifs/PLACEHOLDER-entity-year.gif) -->

#### Spending + Filters
- What you see
  - Cheltuieli / Venituri
  - Trend toggle: Absolute / YoY%
  - Analytics (Bar/Pie) for quick composition
  - Column search to highlight topics
- How to use
  1) Choose Cheltuieli or Venituri
  2) Switch trend to see change rates
  3) Use column search (e.g., “Edu”)
  4) Use Bar/Pie for structure snapshots
- Example
  - Expenses + Bar, highlight “Învățământ”
- Media
  <!-- - ![IMG PLACEHOLDER — Spending filters](./images/PLACEHOLDER-entity-spending.png "Columns, trend, analytics") -->

#### Classifications (Functional/Economic)
- What you see
  - Functional = purpose (e.g., Education)
  - Economic = nature (e.g., salaries)
- How to use
  1) In columns, use search to find topics
  2) Prefer short terms first (e.g., “Edu”)
  3) Use Bar/Pie to view composition
- Example
  - Highlight Education, then switch to Bar
- Media
  <!-- - [GIF PLACEHOLDER — Column search](./gifs/PLACEHOLDER-entity-column-search.gif) -->

#### Compare
- What you see
  - “Map” for spatial patterns
  - “Entities” (Entity Analytics) for rankings
  - “Charts” to build comparisons over time
- How to use
  1) From the entity, open “Map” to see neighbors
  2) Open “Entities” to sort and export
  3) “Charts” → “Create chart” to compare cities
- Example
  - Compare two municipalities on Education per capita
- Media
  <!-- - ![IMG PLACEHOLDER — Compare](./images/PLACEHOLDER-entity-compare.png "Map + ranking + chart") -->

#### Export / Share
- What you see
  - “Entities” has “Export CSV”
  - “Charts” has “Share Chart” → “PNG”, “SVG”, “Copy Link”
- How to use
  1) For rankings, open “Entities” → “Export CSV”
  2) In a chart, use “Share Chart” → “Copy Link”
- Example
  - Download a CSV for your topic and year
- Media
  <!-- - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-entity-export-csv.gif) -->
  <!-- - [GIF PLACEHOLDER — Copy Link](./gifs/PLACEHOLDER-entity-copy-link.gif) -->

### See also
- Entity Analytics (ranking): [entity-analytics](./entity-analytics.md)
- Map — spatial comparison: [map](./map.md)
- Deep‑links & shareable views: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)

### Common Tasks (recipes)

#### Find spending for `{Entity, Year}`
- Steps
  1) Search and open the entity
  2) Select “Reporting Year:”
  3) Choose Cheltuieli or Venituri
- Expected result
  - KPIs, lists, and analytics reflect that year
- Tip
  - Click a year on the chart to sync
- Link
  - LINK PLACEHOLDER — Entity flow

#### Filter by topic (simple)
- Steps
  1) In Expenses, use the search field
  2) Type a short term (e.g., “Edu”)
  3) Switch Analytics to Bar to see composition
- Expected result
  - Rows with the term are highlighted; structure is clear
- Tip
  - Start general, then refine
- Link
  - LINK PLACEHOLDER — Topic search

#### Compare years for one entity
- Steps
  1) Switch trend: Absolute vs YoY%
  2) Click different years on the trend chart
  3) Observe changes in KPIs and lists
- Expected result
  - You see level and change over time
- Tip
  - Use Charts for multi‑series comparisons
- Link
  - LINK PLACEHOLDER — Trend walkthrough

#### Download a CSV ranking
- Steps
  1) Open “Entities”
  2) Set Cheltuieli, Per Capita, Year
  3) Add a Functional prefix (optional)
  4) Click “Export CSV”
- Expected result
  - A CSV file downloads
- Tip
  - Sort by Per Capita for fair comparisons
- Link
  - LINK PLACEHOLDER — Entities ranking

### Understanding the Numbers
- Totals vs sub‑totals
  - Totals sum items in scope; sub‑totals roll up families
- Per Capita vs Total
  - Per Capita divides by population. If population is 0 or missing, value shows 0
- Functional vs Economic
  - Functional = purpose; Economic = nature (e.g., salaries)
- VAT (TVA) and subsidies (Subvenții)
  - Use Economic views to explore these topics

### Troubleshooting & FAQ
- “No Data Found”
  - The entity has no data for the selection. Try another entity
- “Error Fetching Entity Details”
  - Check connection; try again; try a different year
- I can’t find a topic
  - Use shorter search terms (e.g., “Edu”)
- Values look too small
  - Switch to Total, or try another year

### Accessibility & Keyboard tips
- Focus search
  - Press ⌘/Ctrl+K on Home
- Year selector
  - Press ⌘/Ctrl+; to open “Reporting Year:”
- Keyboard navigation
  - Use Tab and Arrow keys for inputs and lists
- Mobile
  - Some controls move into menus or accordions

### Privacy & Data
- Sources
  - Based on official budget execution data
- Update cadence
  - New years appear when published; older years are stable
- Consent
  - Analytics and enhanced errors run only with your consent

### Glossary (short)
- Cheltuieli / Venituri
  - Expenses / Revenues
- Per Capita / Total
  - Normalized by population / Raw totals
- Functional / Economic
  - Purpose codes / Economic nature codes
- Reporting Year
  - The year used for all values on the page

### === SCREENSHOT & MEDIA CHECKLIST ===
- Header with “Reporting Year:” and KPIs
- Trend chart (Absolute vs YoY%)
- Expenses column with topic search
- Analytics (Bar/Pie) view
- Reports list with download links

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm exact English/RO labels shown together on the entity page
- Should we add a visible “Open in Map” from the entity header?
- Any planned export from the entity page itself?
