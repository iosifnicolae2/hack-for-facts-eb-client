---
title: Analitice — UAT, Județ, Entitate
---

Această pagină explică modul de calcul pentru analitice la nivel de UAT, Județ și Entitate: filtre, join‑uri, măsuri, normalizare, praguri, semantica populației și aspecte de performanță.

### UAT (heatmapUATData)

- Scop: agregarea sumelor la nivel de UAT pentru o arie dată; opțional normalizare per capita.
- Filtre: `years` și `account_category` obligatorii (`vn`/`ch`); prefixe funcționale/economice, geografie (județe, regiuni, uat_ids), praguri per‑item și agregate.
- Grupare: după UAT; `SUM(amount)`; `per_capita_amount = total_amount / NULLIF(u.population, 0)`; `amount` respectă `normalization`.
- Notă: populația vine din `UATs.population`; dacă 0/NULL, per‑capita devine 0. LIKE pe prefixe este indexat (`varchar_pattern_ops`).

### Județ (heatmapJudetData)

- Scop: agregare pe județ; per capita prin unitatea administrativă principală.
- Populație județ: caz special București (`siruta_code='179132'`); altfel UAT unde `siruta_code = county_code`.
- Praguri HAVING se aplică pe măsura agregată în funcție de `normalization`.
- Sugestie: `item_min_amount` înainte de grupare; `aggregate_min_amount` după grupare (HAVING).

### Entități (entityAnalytics)

- Populație: dacă `is_uat=TRUE` → UAT‑ul său; dacă `entity_type='admin_county_council'` → populația județului; altfel `NULL` (per‑capita=0; totalurile rămân calculate).
- Măsuri: `total_amount = SUM(eli.amount)`; `per_capita_amount = total_amount / NULLIF(population, 0)`; `amount` respectă `normalization`.
- Ordonare: după `amount`, `total_amount`, `per_capita_amount`, `entity_name`, `population`, `county_name` etc.

### Bune practici

- Setați mereu `years` și `account_category`.
- Pentru per‑capita, asigurați populație în aria aleasă; altfel valorile devin 0 și pot denatura sortarea.
- Folosiți `functional_prefixes`/`economic_prefixes` (LIKE indexabil) și combinați `years` cu `reporting_years` la nevoie.


