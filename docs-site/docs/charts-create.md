---
id: charts-create
title: Charts — Beginner Guide to create and configure
---

Create a shareable chart from your question. Add one or more series (with filters), choose the visual type, and share or export it.

### Quick Start
1) Open transparenta.eu → “Charts”
2) Click “Create chart”
3) Add a series (e.g., Aggregated yearly)
4) Choose entity(ies), Year(s), side (Cheltuieli/Venituri), and prefixes
5) Save to view the chart
6) Toggle chart type and Legend/Tooltip
7) “Share Chart” → “Copy Link”

<!-- ![IMG PLACEHOLDER — Charts create quickstart](./images/PLACEHOLDER-charts-create-quickstart.png "Create, add series, configure, share") -->

### Guided Tour

#### Home and Search
- What you see
  - Cards: “Charts”, “Map”, “Entities”
  - Search input: “Enter entity name or CUI...”
- How to use
  1) Click “Charts” to build from scratch
  2) Or search an entity to capture filters later
- Example
  - Build a chart to compare two cities
- Media
  <!-- - [GIF PLACEHOLDER — Open Charts](./gifs/PLACEHOLDER-charts-create-open.gif) -->

#### Create chart flow
- What you see
  - “Create chart” redirects to `/charts/$chartId?view=config`
  - Tabs or sections for Series and Chart options
- How to use
  1) Add “Aggregated yearly” series
  2) Choose entity(ies), “Reporting Year(s)”, side, and topic prefixes
  3) Save to go to overview; reopen config to adjust options
- Example
  - Two series: Sibiu vs Cluj, Education (65), Per Capita
- Media
  <!-- - ![IMG PLACEHOLDER — Series config](./images/PLACEHOLDER-charts-create-series.png "Add and configure series") -->

#### Configure chart
- What you see
  - Chart type: Line, Bar, Area, Aggregated types (Bar, Pie, Treemap, Sankey)
  - Display options: Data Labels, Legend, Tooltip, Annotations, Show Diff
  - Quick menu: Duplicate, Delete, Copy Data, Bulk edit filters
- How to use
  1) Pick a chart type for your question
  2) Toggle display options for clarity
  3) Use Bulk edit filters to change many series at once
- Example
  - Line chart, Legend on, Data Labels off
- Media
  <!-- - [GIF PLACEHOLDER — Configure chart](./gifs/PLACEHOLDER-charts-create-config.gif) -->

#### Export / Share
- What you see
  - “Share Chart” with “PNG”, “SVG”, “Copy Link”
- How to use
  1) Click “Copy Link” to share the exact view
  2) Export PNG/SVG for presentations
- Example
  - Share a chart link in your report
- Media
  <!-- - [GIF PLACEHOLDER — Share chart](./gifs/PLACEHOLDER-charts-create-share.gif) -->

### Common Tasks (recipes)

#### Find spending for `{Entity, Year}`
- Steps
  1) Add an “Aggregated yearly” series
  2) Select entity and “Reporting Year(s)”
  3) Choose Cheltuieli or Venituri
- Expected result
  - A time series appears in the chart
- Tip
  - Name the series clearly (e.g., “Sibiu — Edu (Per Capita)”) 
- Link
  - LINK PLACEHOLDER — Aggregated series

#### Filter by code (topic)
- Steps
  1) In series, add a Functional prefix (e.g., 65)
  2) Optionally add an Economic prefix (e.g., 10.01)
  3) Use Per Capita for fairness across cities
- Expected result
  - The chart focuses on your chosen topic
- Tip
  - Shorter prefixes provide broader coverage
- Link
  - LINK PLACEHOLDER — Topic filters

#### Compare years or cities
- Steps
  1) Add a second “Aggregated yearly” series
  2) Keep the same topic and normalization
  3) Choose Line or Area for trends
- Expected result
  - Clear visual comparison between series
- Tip
  - Avoid mixing Total and Per Capita
- Link
  - LINK PLACEHOLDER — Compare series

#### Download a CSV ranking (outside charts)
- Steps
  1) Open “Entities”
  2) Apply the same filters as your chart
  3) Click “Export CSV”
- Expected result
  - A CSV with your filtered ranking
- Tip
  - Use CSV to validate chart insights
- Link
  - LINK PLACEHOLDER — Entities ranking

### Understanding the Numbers
- Per Capita vs Total
  - Per Capita divides by population; if 0/missing, value shows 0
- Totals vs sub‑totals
  - Totals sum items in scope; sub‑totals roll up families
- Functional vs Economic
  - Functional = purpose; Economic = nature

### Troubleshooting & FAQ
- My chart looks cluttered
  - Hide extra series; use Bar/Treemap for composition
- “Copy Link” didn’t work
  - Ensure the chart is visible; try again
- The series shows no data
  - Check years, side, and prefix coverage
- Image export fails
  - Try PNG if SVG fails, or vice versa

### Accessibility & Keyboard tips
- Keyboard
  - ⌘/Ctrl+C/X/V copy/cut/paste series; ⌘/Ctrl+D duplicate
- Focus
  - Use Tab/Shift+Tab to move between controls
- Bulk operations
  - Use “Bulk edit filters” for many series

### Privacy & Data
- Sources
  - Based on official budget execution data
- Update cadence
  - New years appear when published
- Consent
  - Analytics and enhanced errors only with consent

### See also
- Charts — Library: [charts-list](./charts-list.md)
- Chart Detail — configure, annotate, share: [charts-detail](./charts-detail.md)
- Storage & Persistence — backup/restore: [storage-and-persistence](./storage-and-persistence.md)

### Glossary (short)
- Series
  - A line/bar with its own filters
- Aggregated yearly
  - Series that groups values per year
- Share Chart
  - Copy a link or export images for your chart

### === SCREENSHOT & MEDIA CHECKLIST ===
- “Create chart” → config view
- Series add dialog with filters
- Quick Configuration + Share Chart
- Clean vs cluttered chart comparison

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm default chart type label order (Line/Bar/Area)
- Any plan to export CSV directly from chart detail?
- Should we surface a “Copy Link” near the chart title too?
