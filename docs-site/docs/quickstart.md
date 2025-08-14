---
id: quickstart
title: Quickstart — from question to answer
---

A beginner‑friendly tour of Transparenta.eu. Learn to search an entity, see spending, apply topic filters, compare places, and share or download results. No setup required.

### Quick Start
1) Open transparenta.eu
2) In the search box, type an entity name or CUI
3) Open the entity page
4) Pick “Reporting Year:”
5) Switch Expenses (Cheltuieli) or Revenues (Venituri)
6) Add a Functional code prefix (e.g., 65 for Education)
7) Export CSV or copy a chart link

![IMG PLACEHOLDER — Quick Start](./images/PLACEHOLDER-quickstart.png "Home, search, entity, filters, share")

### Guided Tour

#### Home and Search
- What you see
  - A clean Home with cards for Charts, Map, and Entities.
  - A search input: “Enter entity name or CUI...”.
- How to use
  1) Type a few letters of a city or institution
  2) Pick a result from the dropdown
  3) Press Enter to open the entity page
- Example
  - Type “Sibiu”. Open “Municipiul Sibiu”.
- Media
  - [GIF PLACEHOLDER — Search and open entity](./gifs/PLACEHOLDER-home-search.gif)

#### Entity page
- What you see
  - Header with entity name and “Reporting Year:”.
  - KPIs and trend chart: toggle Absolute vs YoY%.
  - Two columns: Cheltuieli (Expenses) and Venituri (Revenues).
  - Analytics section with Bar/Pie toggles.
  - Reports view with download links.
- How to use
  1) Choose the Year from the header.
  2) Click a year on the trend to sync the page.
  3) Use column search to highlight topics.
  4) Switch the Analytics chart type (Bar/Pie).
  5) Open Reports to download files.
- Example
  - Set Year=2024, search Expenses for “Învățământ” (Education).
- Media
  - ![IMG PLACEHOLDER — Entity page](./images/PLACEHOLDER-entity.png "Header, Year, KPIs, columns")
  - [GIF PLACEHOLDER — Trend and column search](./gifs/PLACEHOLDER-entity-trend-search.gif)

#### Spending + Filters
- What you see
  - Clear toggles for Expenses (Cheltuieli) or Revenues (Venituri).
  - Per Capita vs Total appears in analytics contexts.
  - Topic filters by code families (Functional/Economic).
- How to use
  1) Pick Expenses or Revenues.
  2) Set Per Capita for fair comparisons or Total for magnitudes.
  3) Add a Functional prefix (e.g., 65 for Education).
  4) Optionally add an Economic prefix.
  5) Review the table or chart for the filtered scope.
- Example
  - Expenses, Per Capita, Year=2024, Functional prefix=65 (Education).
- Media
  - ![IMG PLACEHOLDER — Filters](./images/PLACEHOLDER-filters.png "Account type, normalization, codes")

#### Classifications (Functional/Economic)
- What you see
  - Functional codes describe what money is used for.
  - Economic codes describe the economic nature.
- How to use
  1) Choose a code prefix to focus a family (e.g., “65”).
  2) Use dotted economic prefixes for detail (e.g., “10.01”).
  3) Combine both to focus the topic.
- Example
  - Functional “65” + Economic “10.01”.
- Media
  - [GIF PLACEHOLDER — Add prefixes](./gifs/PLACEHOLDER-prefixes.gif)

#### Compare
- What you see
  - Map for spatial comparisons.
  乇  Entities for sortable rankings.
  - Charts to build visual comparisons over time.
- How to use
  1) Start in Map: set Expenses/Venituri, Per Capita/Total, and Year.
  2) Click a region to open its entity.
  3) Open Entity Analytics to rank entities; sort columns.
  4) Build a chart (Charts → Create) with two series for two cities.
  5) Choose Line or Area to see trends.
- Example
  - Compare two municipalities on Education per capita in 2024.
- Media
  - ![IMG PLACEHOLDER — Compare](./images/PLACEHOLDER-compare.png "Map + Analytics + Chart")

#### Export / Share
- What you see
  - On Entity Analytics: Export CSV button (“Export CSV”).
  - On charts: “Share Chart” with “Copy Link” and image exports.
- How to use
  1) In Entity Analytics, click “Export CSV.”
  2) In a chart, open “Share Chart,” then “Copy Link.”
  3) Paste the link in a message or report.
- Example
  - Download top per-capita spenders for Education and attach to a story.
- Media
  - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-export-csv.gif)
  - [GIF PLACEHOLDER — Share chart link](./gifs/PLACEHOLDER-share-chart.gif)

### Common Tasks (recipes)

#### Find spending for an Entity and Year
- Steps
  1) Search and open the entity page.
  2) Select the Year in the header.
  3) Choose Expenses (Cheltuieli) or Revenues (Venituri).
- Expected result
  - KPIs, trend, and lists update to the chosen year.
- Tip
  - Click a year on the trend chart to sync details.
- Link
  - [LINK PLACEHOLDER — Entity page flow](#TODO-entity-flow)

#### Filter by code (topic)
- Steps
  1) Go to Entity Analytics or a chart config.
  2) Add a Functional prefix (e.g., 65).
  3) Optionally add an Economic prefix (e.g., 10.01).
  4) Set Per Capita for fair comparisons.
- Expected result
  - Table or chart focuses on the chosen code families.
- Tip
  - Prefix searches are fast and precise.
- Link
  - [LINK PLACEHOLDER — Codes guide](#TODO-codes-guide)

#### Compare years for one entity
- Steps
  1) Open the entity page.
  2) In the trend chart, switch Absolute vs YoY%.
  3) Click different years to explore changes.
- Expected result
  - You see level and rate-of-change views across years.
- Tip
  - Use charts for multi‑series comparisons over time.
- Link
  - [LINK PLACEHOLDER — Trend walkthrough](#TODO-trend)

#### Download a CSV ranking
- Steps
  1) Open Entity Analytics.
  2) Choose Expenses (Cheltuieli), Per Capita, Year.
  3) Add a Functional prefix (e.g., 65).
  4) Click “Export CSV.”
- Expected result
  - A CSV file with the current ranking is downloaded.
- Tip
  - Sort by Per Capita to see fair comparisons first.
- Link
  - [LINK PLACEHOLDER — Entity Analytics](#TODO-entity-analytics)

### Understanding the Numbers
- Totals vs sub‑totals
  - Totals sum category line items for the chosen scope.
  - Sub‑totals roll up families (e.g., a functional chapter).
- Per Capita vs Total
  - Per Capita divides by population. If population is 0 or missing, the per‑capita value shows 0.
- Functional vs Economic
  - Functional = what money is used for (e.g., Education).
  - Economic = nature of spending (e.g., salaries).
- VAT (TVA) and subsidies (Subvenții)
  - These appear in economic categories. Use economic codes to focus on them.

### Troubleshooting & FAQ
- I can’t find an entity
  - Try fewer words. Check spelling. Try a nearby place
- No or small values
  - Switch to Total. Remove filters. Try another year
- Export is disabled
  - The table is empty. Add or broaden filters
- Map shows little variation
  - Use Per Capita. Try a higher‑level code prefix

### Accessibility & Keyboard tips
- Search
  - Press ⌘/Ctrl+K to focus the search input
- Charts
  - Use ⌘/Ctrl+C/X/V to copy/cut/paste series
  - Use ⌘/Ctrl+D to duplicate a series
- Mobile
  - On Map, “Filters” and “Legend” open in modals

### Privacy & Data
- Sources
  - Based on official budget execution data
- Update cadence
  - New years appear when officially published
- Consent
  - Analytics and enhanced errors run only with your consent

### Glossary
- Entity
  - A public institution (e.g., city hall, county council)
- Cheltuieli / Venituri
  - Expenses / Revenues
- Per Capita / Total
  - Normalized by population / Raw totals
- Functional / Economic
  - Purpose codes / Economic nature codes
- UAT / Județ
  - Local administrative unit / County

### === SCREENSHOT & MEDIA CHECKLIST ===
- Home search and dropdown
- Entity header with “Reporting Year:” and KPIs
- Trend chart with Absolute vs YoY%
- Filters with a Functional prefix
- Map with “Filters” and “Legend”
- Entities page with “Export CSV”
- Chart “Share Chart” with “Copy Link”

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm the exact English labels for Cheltuieli/Venituri where visible
- Confirm that all entities expose Reports every year
- Any limits on CSV export size we should note?
