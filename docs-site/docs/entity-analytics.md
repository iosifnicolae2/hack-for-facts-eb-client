---
id: entity-analytics
title: Entity Analytics – ranking and drill-down
---

- See: ../../docs/user-stories/entity-analytics.md
- Tutorial specs: tests/tutorial/entity-analytics.tutorial.spec.ts and tests/tutorial/entity-analytics.comprehensive.tutorial.spec.ts

**Who it's for**: Users ranking and comparing entities.

**Outcomes**: Build a ranked table, explore composition, and export CSV.

How to use it

1. Set Cheltuieli/Venituri and Total/Per Capita.
2. Select year; optionally filter by entity, UAT/county, type, functional/economic prefixes.
3. Table view: sort columns (e.g., Total Amount), adjust rows/page, and review the ranking.
4. Line Items view: open composition for entities matching the filters.

Tips

- Start broad, then narrow with prefixes; prefer Per Capita for fairness.
- Export CSV from the Table view (button visible when data present).

Screenshot placeholders

- [screenshot: filters panel with normalization and year]
- [screenshot: table sorted by per-capita]
- [screenshot: line items view]

Try it now

1) Open the ranking for Education (per‑capita expenses, 2024):
- Deep‑link: `/entity-analytics?account_category=ch&normalization=per_capita&years=2024&functional_prefixes=65`
2) Sort by Per Capita descending. 3) Export CSV.

Callouts

- Population semantics: non‑UAT and non‑admin_county_council entities may have `NULL` population, making per‑capita 0.

Open in app

- Entity Analytics prefiltered: `/entity-analytics?account_category=ch&normalization=per_capita&years=2024&functional_prefixes=65`

See also

- Analytics – UAT/County/Entity: [api-analytics-uat-county-entity](./api/analytics-uat-county-entity.md)
- Filters cheat‑sheet: [api-filters-pagination-sorting](./api/filters-pagination-sorting.md)
