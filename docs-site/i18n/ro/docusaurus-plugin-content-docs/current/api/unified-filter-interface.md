---
title: Filtru unificat — detalii (AnalyticsFilter)
---

Acest document explică filtrul unificat pentru analitice folosit în interogări și repository‑uri, maparea la SQL și comportamentul join/aggregare.

## Prezentare

- Obligatorii: `years: [Int!]!`, `account_category: AccountCategory!` (`vn` venituri, `ch` cheltuieli)
- Arie: interogări pentru linii de execuție, heatmap, analitice entități, linii agregate
- Praguri:
  - Per‑item (`item_min_amount`, `item_max_amount`) — WHERE
  - Agregate (`aggregate_min_amount`, `aggregate_max_amount`) — HAVING, respectă `normalization`
- Normalizare: `total | per_capita` determină măsura 

## Mapare câmp → SQL (selectiv)

- `years` → `eli.year = ANY($)`
- `account_category` → `eli.account_category = $`
- `functional_prefixes` → `eli.functional_code LIKE ANY($)` (index `varchar_pattern_ops`)
- `economic_prefixes` → `eli.economic_code LIKE ANY($)` (index `varchar_pattern_ops`)
- `reporting_years` → JOIN `Reports` și WHERE pe `reporting_year`
- `search` → `e.name ILIKE $` (sau trigram pentru relevanță)

## Comportament pe repository (selectiv)

- executionLineItemRepository — join‑uri la cerere; WHERE pe praguri; sortare pe coloane ELI
- entityAnalyticsRepository — grupare pe entitate; regulile de populație per‑capita; HAVING pe `amount`
- uat/judetAnalyticsRepository — grupare pe UAT/județ; per‑capita via populație; praguri HAVING
- aggregatedLineItemsRepository — grupare pe coduri; joinuri condiționale

## Indici & performanță

- Prefixe: `varchar_pattern_ops` fac `LIKE 'xx%'` indexabil
- Trigram (`pg_trgm`) pe denumiri și texte pentru potriviri fuzzy
- BRIN pentru serii de timp; indici pe coloane folosite frecvent în WHERE

## Valori invalide

- Lipsă `years` sau `account_category` → eroare
- `reporting_years` se aplică la `Reports`, nu la `eli.year` (folosiți ambele unde e cazul)


