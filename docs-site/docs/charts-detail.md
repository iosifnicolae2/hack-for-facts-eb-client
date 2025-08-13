---
id: charts-detail
title: Chart Detail – build, configure, annotate, share
---
- See: ../../docs/user-stories/charts-detail.md
- Tutorial specs: tests/tutorial/charts.tutorial.spec.ts and tests/tutorial/charts-detail.comprehensive.tutorial.spec.ts

**Who it's for**: Users refining a specific chart.

**Outcomes**: Add/edit series, configure the visual, annotate, and share.

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

Try it now

1) From the library: `/charts` → open any chart.
2) Add a series: Aggregated yearly with Education (`fn:65`).
3) Toggle Per Capita; enable grid and legend.
4) Add an annotation with a short note.

Open in app

- Create a new chart: `/charts/new`

See also

- Charts library: [charts-list](./charts-list.md)
- Create new chart: [charts-create](./charts-create.md)
