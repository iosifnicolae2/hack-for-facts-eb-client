---
id: charts-create
title: Charts – create and configure flow
---

- See: ../../docs/user-stories/charts-create.md
- Tutorial specs: tests/tutorial/charts-detail.comprehensive.tutorial.spec.ts (creation step)

**Who it's for**: Users who want to build reproducible charts from entities and filters.

**Outcomes**: Create a chart, add series, configure options, and share a URL.

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

Try it now

1) Open: `/charts/new`
2) Add “line-items aggregated yearly” series with `years`, `account_category`, and one filter (e.g., `functional_prefixes=65`).
3) Save; you are redirected to `/charts/$chartId?view=config`.
4) Toggle chart type and legend; copy the URL (contains `chart` param).

Callouts

- For analytics series, always include `years` and `account_category`.
- Use per‑capita when comparing entities of different sizes.

See also

- Chart detail: [charts-detail](./charts-detail.md)
- Filters cheat‑sheet: [api-filters-pagination-sorting](./api/filters-pagination-sorting.md)

Open in app

- New chart: `/charts/new`
