---
title: Filtre, paginare și sortare
---

**Pentru cine**: Dezvoltatori care construiesc interogări de analitice corecte și eficiente

**Rezultate**: Alegeți câmpurile potrivite, înțelegeți WHERE vs HAVING și evitați capcanele frecvente

## Filtre

- Tipuri generale: `EntityFilter`, `UATFilter`, `ReportFilter`, `FundingSourceFilterInput`, `BudgetSectorFilterInput`, `DatasetFilter` pentru interogările lor specifice.
- Analitice (unificat) `AnalyticsFilterInput` (pentru heatmap, analitice entități, linii de execuție, agregate):
  - Obligatorii: `years`, `account_category` (`vn` venituri, `ch` cheltuieli)
  - Dimensiuni: `entity_cuis`, `functional_codes`/`functional_prefixes`, `economic_codes`/`economic_prefixes`, `funding_source_ids`, `budget_sector_ids`, `expense_types`, `program_codes`, `report_ids`, `report_type`, `reporting_years`
  - Geografie: `county_codes`, `regions`, `uat_ids`, `entity_types`, `is_uat`, `search`
  - Populație: `min_population`, `max_population`
  - Agregate: `normalization`, `aggregate_min_amount`, `aggregate_max_amount`
  - Praguri pe item: `item_min_amount`, `item_max_amount`

## Tabel sinoptic (WHERE vs HAVING și performanță)

- `years` → WHERE pe `eli.year` (obligatoriu)
- `account_category` → WHERE pe `eli.account_category` (obligatoriu, `vn`/`ch`)
- `functional_prefixes` → WHERE pe `eli.functional_code LIKE 'xx%'` (index `varchar_pattern_ops`)
- `economic_prefixes` → WHERE pe `eli.economic_code LIKE 'xx%'` (index `varchar_pattern_ops`)
- `item_min_amount`/`item_max_amount` → WHERE pe `eli.amount` (înainte de grupare)
- `aggregate_min_amount`/`aggregate_max_amount` → HAVING pe măsura agregată; respectă `normalization`
- `reporting_years` → necesită JOIN la `Reports`; se combină cu `years`
- `search` → WHERE pe denumiri (ILIKE; trigram acolo unde este disponibil)

## Atenționări

- Setați întotdeauna `years` și `account_category` pentru interogările de analitice.
- Per‑capita: dacă `population` este `0` sau `NULL`, valoarea per‑capita devine `0`.
- Prefixele folosesc indici `varchar_pattern_ops` (LIKE `'xx%'` e indexabil); textul liber folosește trigram pentru relevanță.

## Paginare

- Toate conexiunile acceptă `limit` și `offset` și returnează `pageInfo` cu `totalCount`, `hasNextPage`, `hasPreviousPage`.

## Sortare

- Unele interogări acceptă `sort: { by: String!, order: String! }` (`ASC`/`DESC`).

## Bune practici

- Țineți `limit` rezonabil (20–100) și creșteți `offset` pentru pagina următoare.
- Pentru per‑capita, asigurați existența populației în aria aleasă.
- Filtrați țintit pentru payloaduri mici și timp de răspuns mai bun.

## Vezi și

- Filtru unificat — detalii: [unified-filter-interface](./unified-filter-interface.md)
- Cookbook API: [cookbook](./cookbook.md)

