---
id: charts-detail
title: Chart Detail — Beginner Guide to build, configure, annotate, share
---

Build a clear chart, adjust its look, add notes, and share it. Chart settings and series live with your chart and can be shared with a link.

### Quick Start
1) Open transparenta.eu → “Charts”
2) Click “Create chart”
3) Add a series (topic, entity, year)
4) Pick chart type (Line, Bar, Area, or Aggregated types)
5) Toggle Legend, Tooltip, and Data Labels
6) Click “Share Chart” → “Copy Link”
7) Paste the link into your article or chat

<!-- ![IMG PLACEHOLDER — Chart Detail quickstart](./images/PLACEHOLDER-charts-detail-quickstart.png "Create, configure, share") -->

### Guided Tour

#### Home and Search
- What you see
  - Cards: “Charts”, “Map”, “Entities”
  - Search input: “Enter entity name or CUI...”
- How to use
  1) Start from “Charts” for a blank canvas
  2) Or search an entity first to grab filters later
- Example
  - Build a chart for two cities on Education
- Media
  <!-- - [GIF PLACEHOLDER — Open Charts](./gifs/PLACEHOLDER-charts-detail-open.gif) -->

#### Chart page (overview)
- What you see
  - Canvas (“chart-display-area”)
  - “Quick Configuration” with common settings
  - “Share Chart” with PNG, SVG, Copy Link
  - Menu: Duplicate, Delete, Copy Data, Bulk edit filters
- How to use
  1) Use “Quick Configuration” to change chart type
  2) Toggle Data Labels, Legend, Tooltip
  3) Enable Show Annotations and Show Diff when needed
  4) Use the menu to Duplicate or Bulk edit filters
- Example
  - Switch to Area; show Legend; enable Annotations
- Media
  <!-- - ![IMG PLACEHOLDER — Quick config](./images/PLACEHOLDER-charts-detail-config.png "Type, legend, labels, tooltip") -->

#### Series configuration
- What you see
  - Add series (e.g., line‑items aggregated yearly)
  - Filters for year, side (Cheltuieli/Venituri), and prefixes
  - Calculated, static, and custom series options
- How to use
  1) Add an “Aggregated yearly” series
  2) Choose entity(ies), year(s), and topic prefixes
  3) Optionally add a Calculation series for ratios
  4) Keep visible series under control
- Example
  - Two cities, Education (65), Per Capita
- Media
  <!-- - [GIF PLACEHOLDER — Add series](./gifs/PLACEHOLDER-charts-detail-series.gif) -->

#### Annotate your chart
- What you see
  - “Show Annotations” and “Edit Annotations” toggles
  - Annotation tools in the canvas (point, line, threshold, region)
- How to use
  1) Turn on “Show Annotations”
  2) Turn on “Edit Annotations”
  3) Add notes at key points for context
- Example
  - Mark a policy change date on the line
- Media
  <!-- - ![IMG PLACEHOLDER — Annotations](./images/PLACEHOLDER-charts-detail-annotations.png "Toggle and place notes") -->

#### Export / Share
- What you see
  - “Share Chart” card: “PNG”, “SVG”, “Copy Link”
- How to use
  1) Click “PNG” or “SVG” to export an image
  2) Click “Copy Link” to share the exact chart
  3) Ensure the chart is visible before exporting
- Example
  - Paste the link in a newsroom chat
- Media
  <!-- - [GIF PLACEHOLDER — Share Chart](./gifs/PLACEHOLDER-charts-detail-share.gif) -->

### Common Tasks (recipes)

#### Find spending for `{Entity, Year}`
- Steps
  1) Add an Aggregated yearly series
  2) Pick entity and “Reporting Year(s)”
  3) Choose Cheltuieli or Venituri
- Expected result
  - The series shows values for that entity and year
- Tip
  - Keep series names descriptive
- Link
  - LINK PLACEHOLDER — Aggregated series

#### Filter by code (topic)
- Steps
  1) In series, add Functional prefix (e.g., 65)
  2) Optionally add Economic prefix (e.g., 10.01)
  3) Choose Per Capita for fair comparisons
- Expected result
  - The chart focuses on the chosen topic
- Tip
  - Shorter prefixes give broader coverage
- Link
  - LINK PLACEHOLDER — Topic filters

#### Compare years or entities
- Steps
  1) Add a second series for another city or category
  2) Keep the same topic and normalization
  3) Pick Line or Area for trend
- Expected result
  - Easy visual comparison across series
- Tip
  - Avoid mixing units/normalizations
- Link
  - LINK PLACEHOLDER — Compare series

#### Download CSV (from ranking)
- Steps
  1) Open “Entities” for a ranking table
  2) Apply filters like in your chart
  3) Click “Export CSV”
- Expected result
  - A CSV file downloads for your scope
- Tip
  - Use the CSV in spreadsheets for extra analysis
- Link
  - LINK PLACEHOLDER — Entities ranking

### Understanding the Numbers
- Per Capita vs Total
  - Per Capita divides by population; if 0/missing, value shows 0
- Totals vs sub‑totals
  - Totals sum items in scope; sub‑totals roll up families
- Functional vs Economic
  - Functional = purpose; Economic = nature
- Units and mixed charts
  - Avoid pie if units differ; bar/treemap are safer

### Troubleshooting & FAQ
- “Copy Link” didn’t work
  - Ensure the chart is visible; try again
- Chart looks cluttered
  - Reduce visible series; use Bar or Treemap for composition
- Wrong topic captured
  - Re‑check prefixes and year ranges
- Image export failed
  - Try smaller dimensions; ensure the chart is fully visible

### Accessibility & Keyboard tips
- Keyboard
  - ⌘/Ctrl+C/X/V copy/cut/paste series; ⌘/Ctrl+D duplicate
- Focus
  - Use Tab/Shift+Tab to move through controls
- Annotations
  - Toggle “Show” and “Edit” to manage notes
- Bulk operations
  - Use “Bulk edit filters” for many series at once

### Privacy & Data
- Sources
  - Based on official budget execution data
- Update cadence
  - New years appear when published
- Consent
  - Analytics and enhanced error reporting only with consent

### See also
- Charts — Library: [charts-list](./charts-list.md)
- Charts — Create: [charts-create](./charts-create.md)
- Storage & Persistence — backup/restore: [storage-and-persistence](./storage-and-persistence.md)

### Glossary (short)
- Series
  - A line/bar in a chart with its own filters
- Aggregated yearly
  - A series type that groups values per year
- Share Chart
  - Export images or copy a link to this chart

### === SCREENSHOT & MEDIA CHECKLIST ===
- Quick Configuration and “Share Chart”
- Series add dialog and filters
- Annotations toggles and an example note
- Clean vs cluttered chart comparison

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm default chart type and labels (Line/Bar/Area)
- Any planned CSV export directly from chart detail?
- Should “Copy Link” appear outside the Share Card too?
