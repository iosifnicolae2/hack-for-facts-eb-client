---
id: entity-details
title: Entity Details – 360° view of an institution
---

import DocCardList from '@theme/DocCardList';

This page mirrors the user story and adds quick references to interactive tutorials.

- See: ../../docs/user-stories/entity-details.md
- Tutorial specs: tests/tutorial/entity-details.tutorial.spec.ts and tests/tutorial/entity-details.comprehensive.tutorial.spec.ts

How to use it
1) Pick a reporting year in the header (updates all sections).
2) In Overview, read the KPIs, toggle the trend mode (Absolute vs YoY%), and click a year to sync the page.
3) Browse Expenses and Incomes with the accordions; use search to highlight topics (e.g., \"Învățământ\").
4) Use the composition chart (Income/Expenses + Bar/Pie) for a structural snapshot.
5) Open Reports to download official files.
6) Switch to Expense/Income Trends to see category trajectories; Map view is available for UAT/county entities.

URL state
- view, year, trend, expenseSearch, incomeSearch, analyticsChartType, analyticsDataType.

Tips
- Share the view by copying the URL.
- Use search prefixes like `expenseSearch=fn:<prefix>`.
