---
id: charts-detail
title: Chart Detail – build, configure, annotate, share
---
- See: ../../docs/user-stories/charts-detail.md
- Tutorial specs: tests/tutorial/charts.tutorial.spec.ts and tests/tutorial/charts-detail.comprehensive.tutorial.spec.ts

How to use it

1. From list, open a chart or create a new one.
2. Overview shows the canvas; use buttons to open Chart/Series/Annotation configuration.
3. Add series and set filters; use calculation for ratios; add static/custom series when relevant.
4. Toggle grid/legend/tooltip; set year range for aggregated charts.
5. Save and copy the URL to share; chart state is encoded in the `chart` query param.

Tips

- Keep visible series manageable; annotate spikes and policy changes.
- Pie charts warn on mixed units; prefer bar/treemap for composition if units differ.

Screenshot placeholders

- [screenshot: charts overview with canvas and actions]
- [screenshot: series config – add aggregated yearly]
- [screenshot: annotation editor]
