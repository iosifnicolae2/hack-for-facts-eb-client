---
id: share-a-reproducible-chart
title: How to share a reproducible chart
---

Create a chart and share a link that opens the same view for anyone. The full chart configuration is encoded in the URL you share.

**Who it’s for**: Anyone who wants others to see exactly the same chart

**Outcomes**: A link that reopens the chart with all series and options intact

### Try it now (deep‑link)
1) Open Charts → New: https://transparenta.eu/charts/new
2) Click “Create chart” if prompted
3) Add one series and save
4) Click “Share Chart” → “Copy Link”

### Steps
1) Create the chart
   - Open Charts → Create chart
   - Add a “line‑items aggregated yearly” series
   - Choose entity(ies), year(s), side (Cheltuieli/Venituri), and topic prefixes
2) Configure options
   - Pick chart type (Line/Bar/Area or Aggregated types)
   - Toggle Legend/Tooltip and Data Labels
   - Keep visible series manageable
3) Save and verify
   - Ensure the chart renders as expected
4) Share
   - Click “Share Chart” → “Copy Link”
   - Paste the link in messages or articles

### Expected result
- Anyone opening the link sees the same chart with identical filters and series

### Tips
- Keep series count reasonable; use calculation/static datasets only when necessary.
- Label series clearly (city, topic, normalization) before sharing.
- Use Annotations to explain spikes and data sources.

### Troubleshooting
- Link opens but looks empty: broaden years, switch to Total, or verify prefixes.
- Copy Link didn’t work: ensure the chart is visible; try again.
- Too much clutter: hide extra series or split into multiple charts.

### See also
- Charts — Create: ../charts-create.md
- Compare two cities: ./compare-two-cities.md
- Deep‑links & shareable views: ../deeplinks-and-python-tools.md

### === SCREENSHOT & MEDIA CHECKLIST ===
- Chart detail with config (series list + options)
- Share Chart panel showing Copy Link / PNG / SVG
- URL bar showing the encoded chart param

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm if the “Copy Link” control appears only in the Share card or elsewhere too.
