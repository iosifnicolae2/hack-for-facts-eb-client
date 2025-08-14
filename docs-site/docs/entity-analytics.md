---
id: entity-analytics
title: Entity Analytics — Beginner Guide
---

Rank institutions by spending or revenue. Filter by topic, sort columns, switch views, and download a CSV. No setup required.

### Quick Start
1) Open transparenta.eu
2) Click “Entities” (Entity Analytics)
3) Choose Cheltuieli (Expenses) or Venituri (Revenues)
4) Select Per Capita or Total
5) Pick Year
6) Add a Functional prefix (e.g., 65)
7) Click “Export CSV”

<!-- ![IMG PLACEHOLDER — Entity Analytics quickstart](./images/PLACEHOLDER-entity-analytics-quickstart.png "Open Entities, set filters, export CSV") -->

### Guided Tour

#### Home and Search
- What you see
  - Home cards: “Charts”, “Map”, “Entities”.
  - Search input: “Enter entity name or CUI...”.
- How to use
  1) Click “Entities” to open the ranking
  2) Or search an entity first for context
- Example
  - Open “Entities” to rank all city halls
- Media
  <!-- - [GIF PLACEHOLDER — Open Entities](./gifs/PLACEHOLDER-entity-analytics-open.gif) -->

#### Entity Analytics page
- What you see
  - Filters panel (account side, normalization, year, prefixes)
  - “Clear filters” button
  - Table with sortable columns (e.g., Per Capita, Total Amount)
  - Top bar actions: “View”, “Export CSV”
- How to use
  1) Set Cheltuieli or Venituri
  2) Choose Per Capita or Total
  3) Pick Year
  4) Add Functional prefix (e.g., 65) or Economic prefix
  5) Click column headers to sort
  6) Click “Export CSV” when rows are present
- Example
  - Expenses, Per Capita, Year 2024, Functional 65; sort by Per Capita
- Media
  <!-- - ![IMG PLACEHOLDER — Ranking table](./images/PLACEHOLDER-entity-analytics-table.png "Filters, table, actions") -->
  <!-- - [GIF PLACEHOLDER — Sort and export](./gifs/PLACEHOLDER-entity-analytics-sort-export.gif) -->

#### Spending + Filters
- What you see
  - Cheltuieli / Venituri
  - Per Capita / Total
  - Year selection
  - Functional/Economic prefixes
  - “Clear filters”
- How to use
  1) Pick side (Cheltuieli or Venituri)
  2) Choose Per Capita for fair comparisons
  3) Select Year
  4) Add prefixes (Functional 65, Economic 10.01)
  5) Click “Clear filters” to reset
- Example
  - Expenses, Per Capita, 2024, Functional 65
- Media
  <!-- - ![IMG PLACEHOLDER — Filters panel](./images/PLACEHOLDER-entity-analytics-filters.png "Side, normalization, year, prefixes") -->

#### Classifications (Functional/Economic)
- What you see
  - Functional = purpose (e.g., Education)
  - Economic = nature (e.g., salaries)
- How to use
  1) Use a code prefix to select a family (e.g., “65”)
  2) Use dotted economic prefixes for detail (e.g., “10.01”)
  3) Combine both to narrow the topic
- Example
  - Functional “65” + Economic “10.01”
- Media
  <!-- - [GIF PLACEHOLDER — Add prefixes](./gifs/PLACEHOLDER-entity-analytics-prefixes.gif) -->

#### Compare
- What you see
  - Table view for ranking
  - Line Items view for composition
  - “View” menu (Density, Currency, Columns)
- How to use
  1) Sort by Per Capita or Total Amount
  2) Switch to Line Items to see composition
  3) Use “View” to set Density (Comfortable/Compact)
  4) Choose Currency (Standard/Compact/Both)
  5) Toggle Columns (Entity, County, Population, Per Capita, Total Amount)
- Example
  - Compact density + Both currency formats + Per Capita sort
- Media
  <!-- - ![IMG PLACEHOLDER — View menu](./images/PLACEHOLDER-entity-analytics-view.png "Density, Currency, Columns") -->

#### Export / Share
- What you see
  - “Export CSV” button
  - Disabled when there are no rows
- How to use
  1) Apply filters until rows appear
  2) Click “Export CSV”
  3) Use the file in spreadsheets or reports
- Example
  - Download the 2024 Education per‑capita ranking
- Media
  <!-- - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-entity-analytics-export-csv.gif) -->

### See also
- Entity Details — deep‑dive a single institution: [entity-details](./entity-details.md)
- Map — spatial patterns: [map](./map.md)
- Filters system: [filters-system](./filters-system.md)

### Common Tasks (recipes)

#### Find spending for `{Entity, Year}`
- Steps
  1) Open “Entities”
  2) Set Cheltuieli or Venituri
  3) Pick Year
  4) Add an entity filter (optional)
- Expected result
  - The table focuses on your selection
- Tip
  - Use Per Capita for fairness
- Link
  - LINK PLACEHOLDER — Entity/year ranking

#### Filter by code (topic)
- Steps
  1) Open “Entities”
  2) Add Functional prefix (e.g., 65)
  3) Add Economic prefix (optional, e.g., 10.01)
  4) Sort by Per Capita
- Expected result
  - Ranking shows your chosen topic
- Tip
  - Shorter prefixes give broader coverage
- Link
  - LINK PLACEHOLDER — Topic filters

#### Compare years for one entity
- Steps
  1) Open the entity page (from table)
  2) Switch trend: Absolute vs YoY%
  3) Click different years on the chart
- Expected result
  - You see levels and changes over time
- Tip
  - Use Charts to compare multiple entities
- Link
  - LINK PLACEHOLDER — Trend walkthrough

#### Download CSV
- Steps
  1) Open “Entities”
  2) Set side, normalization, year, prefixes
  3) Click “Export CSV”
- Expected result
  - A CSV file downloads
- Tip
  - Sort by Per Capita for fair comparisons
- Link
  - LINK PLACEHOLDER — CSV export

### Understanding the Numbers
- Per Capita vs Total
  - Per Capita divides by population. If population is 0 or missing, value shows 0.
- Totals vs sub‑totals
  - Totals sum items in scope; sub‑totals roll up families.
- Functional vs Economic
  - Functional = purpose; Economic = nature (e.g., salaries).
- County and UAT cases
  - County councils use county population. UAT entities use their UAT population.

### Troubleshooting & FAQ
- “Error loading analytics”
  - Retry; widen filters; change year
- Export disabled
  - Table empty. Adjust filters or try a broader prefix
- Rankings look odd
  - Confirm Per Capita/Total is correct for your use case
- No rows after filtering
  - Click “Clear filters” and start again

### Accessibility & Keyboard tips
- Keyboard
  - Use Tab and Arrow keys to navigate inputs, columns, and menus
- Table
  - Sort by clicking column headers
- Menus
  - “View” menu provides Density, Currency, and Columns
- Mobile
  - Filters may use drawers or stacked layouts

### Privacy & Data
- Sources
  - Based on official budget execution data
- Update cadence
  - New years appear when published
- Consent
  - Analytics and enhanced error reporting only with consent (see Cookies)

### Glossary (short)
- Cheltuieli / Venituri
  - Expenses / Revenues
- Per Capita / Total
  - Normalized by population / Raw totals
- Functional / Economic
  - Purpose codes / Economic nature codes
- Entity Analytics
  - Page that ranks entities by filtered amounts

### === SCREENSHOT & MEDIA CHECKLIST ===
- Filters panel with side, normalization, year, prefixes
- Table sorted by Per Capita
- “View” menu (Density, Currency, Columns)
- “Export CSV” enabled and disabled states
- Line Items view

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm where the Line Items view is toggled in the current UI
- Confirm default columns and labels for the table
- Any row limits or batching to mention for CSV export?
