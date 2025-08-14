---
title: How to compare two cities
---

Compare per‑capita Education spending for two municipalities and visualize the trend. You’ll use Map (to pick places and topic) and Charts (to build a shareable chart).

**Who it’s for**: Anyone wanting a fair city‑to‑city comparison

**Outcomes**: A link to a chart comparing two cities on the same topic and year(s)

### Try it now (deep‑links)
1) Open Map: https://transparenta.eu/map
2) Set Cheltuieli (Expenses) → Per Capita → Year = 2024
3) Add Functional prefix “65” (Education)
4) Click city A to open its entity
5) Open Charts → New: https://transparenta.eu/charts/new

### Steps
1) Configure the topic on Map
   - Choose Per Capita and Year 2024
   - Add Functional prefix “65” (Education)
   - Click city A to open the entity page
2) Create the chart
   - Open Charts → Create chart
   - Add an “Aggregated yearly” series for city A with Education (65), Per Capita
3) Add city B
   - Duplicate the series or add a new one for city B
   - Keep the same topic, normalization, and years
4) Pick a visual
   - Choose Line (for trends) or Area
   - Enable Legend for clarity
5) Share it
   - Click “Share Chart” → “Copy Link” and paste it

### Expected result
- A chart with two lines, one for each city, comparable on a per‑capita Education topic

### Tips
- Keep series labels clear, e.g., “Sibiu — Edu — Per Capita”.
- Use Annotations to mark notable events (policy changes, one‑offs).
- Avoid mixing Total and Per Capita in the same chart.

### Troubleshooting
- No data for one city: try a broader year range or Total.
- Lines overlap too much: switch to Area or separate charts.
- Copy Link not working: ensure the chart is visible, then try again.

### See also
- Charts — Create: ../charts-create.md
- Entity Analytics (ranking): ../entity-analytics.md
- Deep‑links & shareable views: ../deeplinks-and-python-tools.md

### === SCREENSHOT & MEDIA CHECKLIST ===
- Map filtered for Education (Per Capita, 2024)
- Chart with two city series (Line)
- Share Chart → Copy Link

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm default chart type ordering (Line/Bar/Area) for screenshots.
