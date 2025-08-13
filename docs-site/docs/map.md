---
id: map
title: Map – spatial comparison and navigation
---

- See: ../../docs/user-stories/map.md
- Tutorial specs: tests/tutorial/map.tutorial.spec.ts and tests/tutorial/map.comprehensive.tutorial.spec.ts

**Who it's for**: Users comparing geographies.

**Outcomes**: Understand values on the map, switch to table/charts, and deep‑link to entities.

How to use it

1. Choose UAT or Județ aggregation.
2. Pick Venituri (revenues) or Cheltuieli (spending) and Total vs Per Capita.
3. Ensure the desired year is selected ("Selected (1)" shows 2024/… tag).
4. Map view: inspect heatmap, legend shows value range. Click a region to open that entity.
5. Table view: sort columns and page through the cohort; export from Entity Analytics if you need CSV.
6. Chart view: quick distribution charts for the current filters.

Tips

- Prefer Per Capita for cross-size fairness; use Total for magnitude questions.
- Switch to Entity Analytics for richer ranking and CSV export.

Screenshot placeholders

- [screenshot: map with legend]
- [screenshot: filters panel – normalization and year]

Try it now

1) Open the Map filtered for Education (per‑capita expenses, 2024):
- Deep‑link: `/map?account_category=ch&normalization=per_capita&years=2024&functional_prefixes=65`
2) Click a region to jump to that entity’s page; the year is preserved.

Open in app

- Map prefiltered: `/map?account_category=ch&normalization=per_capita&years=2024&functional_prefixes=65`

Callouts

- Per‑capita becomes 0 when the population of a UAT is 0 or missing.

See also

- Entity Analytics: [entity-analytics](./entity-analytics.md)
- Filters cheat‑sheet: [api-filters-pagination-sorting](./api/filters-pagination-sorting.md)
