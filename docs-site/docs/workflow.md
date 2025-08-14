---
id: workflow
title: Workflow — from question to shareable insight
---

A clear path to go from a question to an answer you can share. This workflow uses Entity Analytics to spot outliers, Map to confirm patterns, Entity Details to investigate, and Charts to communicate.

**Who it’s for**: Beginners and practitioners who want a reliable method

**Outcomes**: A step‑by‑step, reproducible path you can repeat and share with links

### Quick Start (Try it now)
1) Open Entities (ranking): [Open in app](https://transparenta.eu/analytics)
2) Pick Cheltuieli (Expenses) → Per Capita → Year (e.g., 2024)
3) Add Functional prefix “65” (Education) and sort
4) Open Map to validate spatial patterns: [Open Map](https://transparenta.eu/map)
5) Open a city entity from the Map; read KPIs and trends
6) Build a chart to compare two cities: [Charts – New](https://transparenta.eu/charts/new)
7) Click Share Chart → Copy Link and paste it

<!-- ![IMG PLACEHOLDER — Workflow quickstart](./images/PLACEHOLDER-workflow-quickstart.png "Entities → Map → Entity → Chart → Share") -->

### Guided Tour

#### 1) Spot outliers in Entities (Entity Analytics)
- What you see
  - Ranking table with filters for side (Expenses/Revenues), normalization (Per Capita/Total), Year, and code prefixes.
- How to use
  1) Set Expenses, Per Capita, Year.
  2) Add Functional prefix “65”.
  3) Sort by the Per Capita column to find top/bottom values.
- Example
  - Top Education per‑capita spenders in 2024.
- Media
  <!-- - ![IMG PLACEHOLDER — Entities ranking](./images/PLACEHOLDER-workflow-entities.png "Filters + sortable table") -->

#### 2) Validate patterns on the Map
- What you see
  - Heatmap with Filters and Legend; switch to Data Table View or Chart.
- How to use
  1) Open Map; set the same side, normalization, year, and prefix.
  2) Inspect colors and ranges; use Legend for scale.
  3) Click a region to open its entity.
- Example
  - Counties with higher Education per‑capita spending cluster regionally.
- Media
  <!-- - ![IMG PLACEHOLDER — Map validation](./images/PLACEHOLDER-workflow-map.png "Heatmap + legend") -->

#### 3) Investigate on the Entity page
- What you see
  - “Reporting Year:”, KPIs, trend (Absolute vs YoY%), Expenses/Revenues columns, Analytics, Reports.
- How to use
  1) Pick Year and click a point on the trend to sync.
  2) Search “Învățământ” in Expenses to highlight rows.
  3) Switch Analytics to Bar/Pie for composition.
  4) Check Reports for source files.
- Example
  - See whether Education levels or growth rates explain the ranking.
- Media
  <!-- - ![IMG PLACEHOLDER — Entity deep‑dive](./images/PLACEHOLDER-workflow-entity.png "Year + trend + columns + analytics") -->

#### 4) Communicate with Charts (and share)
- What you see
  - A canvas with Quick Configuration and Share Chart.
- How to use
  1) Create a chart; add two “Aggregated yearly” series for two cities.
  2) Keep the same topic and normalization.
  3) Choose Line/Area; enable Legend and Labels as needed.
  4) Share Chart → Copy Link; export PNG/SVG if needed.
- Example
  - “Sibiu vs Cluj — Education per capita (2019–2024)”.
- Media
  <!-- - ![IMG PLACEHOLDER — Shareable chart](./images/PLACEHOLDER-workflow-chart.png "Series + type + share") -->

### Common Tasks (recipes)

#### Find top per‑capita spenders for a topic
- Steps
  1) Open Entities; set Expenses, Per Capita, Year.
  2) Add Functional prefix “65”.
  3) Sort by Per Capita.
- Expected result
  - A ranked list you can export as CSV.
- Tip
  - Use short prefixes for broader families.
- Link
  - [Find top spenders](./how-to/find-top-spenders.md)

#### Compare two cities over time
- Steps
  1) Open Charts → Create.
  2) Add two series with the same topic and normalization.
  3) Pick Line or Area.
- Expected result
  - Clear trends for both cities.
- Tip
  - Keep series names descriptive.
- Link
  - [Compare two cities](./how-to/compare-two-cities.md)

#### Share a reproducible view
- Steps
  1) Configure your filters in Entities or Map.
  2) Copy the URL (deep‑link).
  3) Or in Charts, Share Chart → Copy Link.
- Expected result
  - Others open the same filtered view.
- Tip
  - Prefer Per Capita for fairness when comparing places.
- Link
  - [Deep‑links & shareable views](./deeplinks-and-python-tools.md)

### Understanding the Numbers
- Per‑capita vs Total
  - Per Capita divides by population; if population is 0 or missing, per‑capita becomes 0.
- Totals and sub‑totals
  - Totals sum items in scope; sub‑totals roll up families of codes.
- Functional vs Economic
  - Functional = purpose; Economic = nature (e.g., salaries).

### Troubleshooting & FAQ
- Rankings look empty
  - Switch to Total; shorten prefixes; try another year.
- Map looks flat
  - Use Per Capita or a broader prefix.
- I can’t find an entity
  - Try fewer words; check spelling.
- Chart shows no data
  - Check years, side, and prefixes match your question.

### Accessibility & Keyboard tips
- Focus search
  - Press ⌘/Ctrl+K from any page.
- Entity Year selector
  - Press ⌘/Ctrl+; to open “Reporting Year:”.
- Charts editing
  - ⌘/Ctrl+C/X/V to copy/cut/paste series; ⌘/Ctrl+D duplicate.

### Privacy & Data
- Sources
  - Based on official budget execution data.
- Consent
  - Optional analytics/enhanced errors only with your opt‑in.

### Glossary (short)
- Entity
  - A public institution (e.g., city hall).
- Per Capita / Total
  - Normalized by population / raw totals.
- Functional / Economic
  - Purpose codes / Economic nature codes.

### See also
- Quickstart: [quickstart](./quickstart.md)
- Entity Analytics: [entity-analytics](./entity-analytics.md)
- Charts — Create: [charts-create](./charts-create.md)

### === SCREENSHOT & MEDIA CHECKLIST ===
- Entities ranking with filters and sorting
- Map with Filters and Legend; click region → entity
- Entity page with Year + trend + columns
- Chart with two series and Share panel

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm the default Entities sort column we should illustrate.
- Any other top “topics” besides Education we should showcase?
