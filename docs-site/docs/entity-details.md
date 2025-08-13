---
id: entity-details
title: Entity Details – 360° view of an institution
---

import DocCardList from '@theme/DocCardList';

This page explains how to read an entity page and which controls matter most. It mirrors the user story and adds step‑by‑step tips for beginners.

- See: ../../docs/user-stories/entity-details.md
- Tutorial specs: tests/tutorial/entity-details.tutorial.spec.ts and tests/tutorial/entity-details.comprehensive.tutorial.spec.ts

**Who it's for**: Users inspecting a single institution in depth.

**Outcomes**: Read KPIs and trends, explore composition, and navigate to related views.

How to use it
1) Pick a reporting year in the header (updates all sections).
2) In Overview, read the KPIs, toggle the trend mode (Absolute vs YoY%), and click a year to sync the page.
3) Browse Expenses and Incomes with the accordions; use search to highlight topics (e.g., "Învățământ").
4) Use the composition chart (Income/Expenses + Bar/Pie) for a structural snapshot.
5) Open Reports to download official files.

Beginner checklist
- [screenshot: header with year selector]
- [screenshot: trends – absolute vs YoY%]
- [screenshot: expenses column search for "Învățământ"]
6) Switch to Expense/Income Trends to see category trajectories; Map view is available for UAT/county entities.

URL state
- view, year, trend, expenseSearch, incomeSearch, analyticsChartType, analyticsDataType.

Tips
- Share the view by copying the URL.
- Use search prefixes like `expenseSearch=fn:<prefix>`.

Advanced
- Map view is available for UAT/county entities. Click regions to navigate and preserve filters.
- Trends tabs preselect top functional groups for readability.

Try it now

1) Open any entity by CUI and year: `/entity/RO123456?year=2024`
2) Switch Trends to YoY% and search Expenses for `fn:65` to highlight Education.

Callouts

- Per‑capita KPIs use the entity’s population if `is_uat=true`; for county councils, county population logic applies; else it may be `NULL` (per‑capita shown as 0).

See also

- Map: [map](./map.md)
- Reports and Line Items (API): [api-graphql-queries](./api/graphql-queries.md)
