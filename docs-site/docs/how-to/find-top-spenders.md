---
id: find-top-spenders
title: How to find top spenders (ranking)
---

Identify the highest per‑capita spenders for a topic in a given year. You’ll use Entity Analytics to rank entities, then export the results.

**Who it’s for**: Reporters, analysts, and citizens comparing places fairly

**Outcomes**: A ranked table and a CSV you can reuse

### Try it now (deep‑link)
1) Open Entities (Entity Analytics): https://transparenta.eu/analytics
2) Choose Cheltuieli (Expenses) → Per Capita → Year = 2024
3) Add Functional prefix “65” (Education)
4) Click the Per Capita column to sort (DESC)
5) Click Export CSV

### Steps
1) Open the ranking
   - Entities → the table shows all entities for the current scope
2) Set a fair comparison
   - Choose Per Capita and pick the Year (e.g., 2024)
3) Focus the topic
   - Add Functional prefix “65” (Education) or your topic of interest
4) Sort and read
   - Click the Per Capita column to sort descending
5) Export
   - Click Export CSV to download the ranking

### Expected result
- A CSV and on‑screen ranking of top per‑capita spenders for your topic and year

### Tips
- Per Capita is fair for different‑size cities; use Total for scale questions.
- Shorter prefixes (e.g., “65”) include a broader family; refine later.
- Filter by county or entity type to compare similar cohorts.

### Troubleshooting
- Export is disabled: the table has no rows → broaden filters or remove a too‑narrow prefix.
- Results look odd: ensure Per Capita vs Total matches your intent.
- No rows: clear filters, re‑apply Year and topic.

### See also
- Entity Analytics — Beginner Guide: ../entity-analytics.md
- Use functional/economic prefixes: ./use-prefix-filters.md
- Deep‑links & shareable views: ../deeplinks-and-python-tools.md

### === SCREENSHOT & MEDIA CHECKLIST ===
- Entity Analytics filtered for a topic (Per Capita, 2024)
- Sorted by Per Capita (DESC)
- Export CSV action

### === OPEN QUESTIONS FOR MAINTAINERS ===
- Confirm default sort column we should show by default in screenshots.
