---
id: charts-create
title: Charts – create and configure flow
---

- See: ../../docs/user-stories/charts-create.md
- Tutorial specs: tests/tutorial/charts-detail.comprehensive.tutorial.spec.ts (creation step)

How to create a chart

1. Go to Charts → Create chart.
2. You are redirected to `/charts/$chartId?view=config`.
3. Add a series (e.g., line-items aggregated yearly) from the Series tab.
4. Pick entities and filters (Cheltuieli/Venituri, functional/economic prefixes, etc.).
5. Save to see the overview; reopen config to adjust chart options.

Tips

- Use calculation series for ratios and derived indicators.
- Prefer line/area for trends; bar/aggregated for composition.

Screenshot placeholders

- [screenshot: create chart CTA]
- [screenshot: redirect to /charts/$chartId?view=config]
