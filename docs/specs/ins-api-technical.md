# INS Client API Spec: Technical Integration

## Scope

This spec covers how the client integrates with the INS Tempo domain in the backend GraphQL API. It documents the queries, inputs, and response shapes needed for dataset discovery, observation retrieval, UAT indicators, comparisons, and dashboard views.

## Transport

- **Endpoint**: `${VITE_API_URL}/graphql`
- **Method**: POST
- **Content-Type**: application/json
- **Payload**: `{ query, variables }`

## Common Conventions

- Pagination uses `limit` + `offset` with `pageInfo { totalCount, hasNextPage, hasPreviousPage }`.
- `PeriodDate` string formats:
  - Year: `YYYY` (e.g., `2024`)
  - Quarter: `YYYY-Qn` (e.g., `2024-Q1`)
  - Month: `YYYY-MM` (e.g., `2024-07`)
- `value` for INS observations is returned as **string** (Decimal on server). Treat as numeric in UI formatting.
- Missing/confidential values are exposed via `value_status` (e.g., `:` or `c`).

## Query Reference (INS)

### 1) Dataset Listing

```graphql
query InsDatasets($filter: InsDatasetFilterInput, $limit: Int, $offset: Int) {
  insDatasets(filter: $filter, limit: $limit, offset: $offset) {
    nodes {
      id
      code
      name_ro
      name_en
      definition_ro
      definition_en
      periodicity
      year_range
      dimension_count
      has_uat_data
      has_county_data
      has_siruta
      sync_status
      last_sync_at
      context_code
      context_name_ro
      context_name_en
      context_path
      metadata
    }
    pageInfo {
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
}
```

**Filter fields:**

- `search`: fuzzy match on code/name/definition
- `codes`: exact list
- `contextCode`
- `periodicity`: `ANNUAL | QUARTERLY | MONTHLY`
- `syncStatus`: `PENDING | SYNCING | SYNCED | FAILED | STALE`
- `hasUatData`: boolean

### 2) Dataset Detail + Dimensions

```graphql
query InsDataset($code: String!) {
  insDataset(code: $code) {
    code
    name_ro
    name_en
    periodicity
    year_range
    dimension_count
    has_uat_data
    has_county_data
    has_siruta
    dimensions {
      index
      type
      label_ro
      label_en
      classification_type { code name_ro is_hierarchical }
      option_count
      values(limit: 20, offset: 0, filter: { search: "" }) {
        nodes {
          nom_item_id
          dimension_type
          label_ro
          label_en
          parent_nom_item_id
          territory { code name_ro level siruta_code }
          time_period { iso_period periodicity year quarter month }
          classification_value { code name_ro type_code }
          unit { code symbol }
        }
        pageInfo { totalCount hasNextPage }
      }
    }
  }
}
```

**Notes:**

- Dimension value records map to canonical entities based on dimension type.
- `values` is paginated and supports `search`.

### 3) Observations

```graphql
query InsObservations($code: String!, $filter: InsObservationFilterInput) {
  insObservations(datasetCode: $code, limit: 100, offset: 0, filter: $filter) {
    nodes {
      dataset_code
      value
      value_status
      time_period { iso_period year quarter month periodicity }
      territory { code siruta_code level name_ro }
      unit { code symbol name_ro }
      classifications { type_code code name_ro }
      dimensions
    }
    pageInfo { totalCount hasNextPage hasPreviousPage }
  }
}
```

**Filter fields:**

- `territoryCodes`, `sirutaCodes`, `territoryLevels`
- `unitCodes`
- `classificationValueCodes`, `classificationTypeCodes`
- `periodicity`, `years`, `quarters`, `months`
- `period` (single `PeriodDate`)
- `periodRange` (`{ start, end }` with same periodicity)
- `hasValue` (true/false)

### 4) UAT Indicators (non-paginated)

```graphql
query InsUatIndicators($sirutaCode: String!, $datasetCodes: [String!]!, $period: PeriodDate) {
  insUatIndicators(sirutaCode: $sirutaCode, datasetCodes: $datasetCodes, period: $period) {
    dataset_code
    value
    time_period { iso_period }
    territory { code siruta_code name_ro }
    unit { code symbol }
    classifications { type_code code }
  }
}
```

**Notes:**

- Intended for a compact set of datasets (dashboard summary).
- Server caps results; client should display a warning if truncated.

### 5) Compare UATs (non-paginated)

```graphql
query InsCompare($sirutaCodes: [String!]!, $datasetCode: String!, $period: PeriodDate) {
  insCompare(sirutaCodes: $sirutaCodes, datasetCode: $datasetCode, period: $period) {
    dataset_code
    value
    time_period { iso_period }
    territory { siruta_code name_ro }
    classifications { type_code code }
  }
}
```

### 6) UAT Dashboard (grouped)

```graphql
query InsUatDashboard($sirutaCode: String!, $period: PeriodDate, $contextCode: String) {
  insUatDashboard(sirutaCode: $sirutaCode, period: $period, contextCode: $contextCode) {
    dataset { code name_ro has_uat_data }
    observations {
      dataset_code
      value
      time_period { iso_period }
      unit { code symbol }
      classifications { type_code code }
    }
    latestPeriod
  }
}
```

**Notes:**

- Grouped by dataset for efficient dashboard rendering.
- `latestPeriod` computed from returned observations.

## Error Handling

- GraphQL errors return `{ errors: [{ message }] }`.
- Client should surface a friendly message and log details in dev.
- For invalid period inputs, server returns `InvalidFilterError`.

## Client Caching Strategy

- TanStack Query keys should include full filters.
- `insDatasets` can have a longer `staleTime` (catalog is stable).
- `insObservations` should be cached by dataset + filters; allow refetch on filter change.

## Performance Tips

- Prefer server-side filtering (use `period`, `periodRange`, `territoryCodes`), avoid wide ranges.
- Use `hasUatData` to reduce catalog size when building local dashboards.
- Avoid fetching dimension values for all dimensions at once; lazy-load per dimension.

  ---
  Entity Page INS Data: Analysis & Recommendations

  How the Data Links

  Budget DB                          INS DB
  ─────────                          ──────
  Entities.uat_id ──→ UATs.id
                      UATs.siruta_code ──→ territories.siruta_code (LAU level)
                      UATs.county_code ──→ territories.code (NUTS3 level)

  For UAT entities (is_uat=true, types: admin_municipality, admin_town_hall, admin_commune_hall):
  - Use UATs.siruta_code → INS territories.siruta_code at LAU level
  - Filter datasets with has_uat_data = true (85 datasets, 70 had data for Cluj-Napoca)

  For county councils (entity_type = 'admin_county_council'):
  - Use UATs.county_code → need to find matching INS territory at NUTS3 level
  - Filter datasets with has_county_data = true
  - County councils manage county-wide services, so county-level aggregates are more relevant
  - Counties are identified by siruta_code = county_code (or Bucharest special case 179132)

  Available UAT-Level Datasets (70 for Cluj-Napoca, grouped by relevance)

  Tier 1 — Core Indicators (most relevant to budget/governance context):
  ┌──────────────┬─────────┬───────────────────────────────────────┬────────┬────────────────────────────────────┐
  │    Domain    │  Code   │                 Name                  │  Unit  │            Why relevant            │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Population   │ POP107D │ Populația după domiciliu (by age/sex) │ pers.  │ Foundation for per-capita analysis │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Population   │ POP108C │ Populația la 1 iulie (school age)     │ pers.  │ Education budget context           │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Demography   │ POP201D │ Născuți vii                           │ pers.  │ Growth indicator                   │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Demography   │ POP206D │ Decedați                              │ pers.  │ Natural balance                    │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Employment   │ FOM104D │ Nr. mediu salariați                   │ pers.  │ Economic base, tax revenue proxy   │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Unemployment │ SOM101E │ Șomeri înregistrați (by sex)          │ pers.  │ Social spending context            │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Unemployment │ SOM101F │ Rata șomajului                        │ %      │ Direct comparison metric           │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Housing      │ LOC101B │ Locuințe existente (by ownership)     │ nr.    │ Infrastructure indicator           │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Housing      │ LOC104B │ Locuințe terminate (by funding)       │ nr.    │ Development activity               │
  ├──────────────┼─────────┼───────────────────────────────────────┼────────┼────────────────────────────────────┤
  │ Construction │ LOC108B │ Autorizații de construire             │ nr./m² │ Development permits                │
  └──────────────┴─────────┴───────────────────────────────────────┴────────┴────────────────────────────────────┘
  Tier 2 — Infrastructure & Utilities (directly managed by local gov):
  ┌──────────────┬─────────┬────────────────────────────────┬────────┬────────────────────────┐
  │    Domain    │  Code   │              Name              │  Unit  │      Why relevant      │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Urban        │ GOS102A │ Suprafața intravilană          │ ha     │ City size              │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Green spaces │ GOS103A │ Spații verzi                   │ ha     │ Quality of life        │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Roads        │ GOS104A │ Lungimea străzilor             │ km     │ Infrastructure         │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Roads        │ GOS105A │ Străzi modernizate             │ km     │ Infrastructure quality │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Water        │ GOS106B │ Rețea distribuție apă potabilă │ km     │ Utilities              │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Water        │ GOS108A │ Cantitate apă distribuită      │ mii m³ │ Consumption            │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Heating      │ GOS109A │ Energie termică distribuită    │ Gcal   │ Utilities              │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Sewage       │ GOS110A │ Conducte canalizare            │ km     │ Infrastructure         │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Gas          │ GOS116A │ Conducte distribuție gaze      │ km     │ Utilities              │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Gas          │ GOS118A │ Gaze naturale distribuite      │ mii m³ │ Energy                 │
  ├──────────────┼─────────┼────────────────────────────────┼────────┼────────────────────────┤
  │ Transport    │ GOS112B │ Vehicule transport public      │ nr.    │ Mobility               │
  └──────────────┴─────────┴────────────────────────────────┴────────┴────────────────────────┘
  Tier 3 — Education (large local budget item):
  ┌───────────┬─────────┬──────────────────────────────────┬───────┐
  │  Domain   │  Code   │               Name               │ Unit  │
  ├───────────┼─────────┼──────────────────────────────────┼───────┤
  │ Education │ SCL101C │ Unități de învățământ (by level) │ nr.   │
  ├───────────┼─────────┼──────────────────────────────────┼───────┤
  │ Education │ SCL103D │ Populația școlară (by level)     │ pers. │
  ├───────────┼─────────┼──────────────────────────────────┼───────┤
  │ Education │ SCL104D │ Personal didactic (by level)     │ pers. │
  ├───────────┼─────────┼──────────────────────────────────┼───────┤
  │ Education │ SCL105B │ Săli de clasă                    │ nr.   │
  ├───────────┼─────────┼──────────────────────────────────┼───────┤
  │ Education │ SCL112B │ PC-uri/echipamente IT            │ nr.   │
  └───────────┴─────────┴──────────────────────────────────┴───────┘
  Tier 4 — Health & Social:
  ┌─────────┬─────────┬──────────────────────────────────────┬───────┐
  │ Domain  │  Code   │                 Name                 │ Unit  │
  ├─────────┼─────────┼──────────────────────────────────────┼───────┤
  │ Health  │ SAN101B │ Unități sanitare (by type/ownership) │ nr.   │
  ├─────────┼─────────┼──────────────────────────────────────┼───────┤
  │ Health  │ SAN102C │ Paturi în unități sanitare           │ nr.   │
  ├─────────┼─────────┼──────────────────────────────────────┼───────┤
  │ Health  │ SAN104B │ Personal medico-sanitar              │ pers. │
  ├─────────┼─────────┼──────────────────────────────────────┼───────┤
  │ Justice │ JUS105C │ Persoane condamnate în penitenciare  │ pers. │
  └─────────┴─────────┴──────────────────────────────────────┴───────┘
  Tier 5 — Culture & Tourism:
  ┌─────────┬─────────┬─────────────────────────────┬───────┐
  │ Domain  │  Code   │            Name             │ Unit  │
  ├─────────┼─────────┼─────────────────────────────┼───────┤
  │ Culture │ ART101B │ Biblioteci                  │ nr.   │
  ├─────────┼─────────┼─────────────────────────────┼───────┤
  │ Culture │ ART106A │ Volume în biblioteci        │ nr.   │
  ├─────────┼─────────┼─────────────────────────────┼───────┤
  │ Culture │ ART107A │ Cititori activi             │ pers. │
  ├─────────┼─────────┼─────────────────────────────┼───────┤
  │ Culture │ ART113A │ Vizitatori muzee            │ pers. │
  ├─────────┼─────────┼─────────────────────────────┼───────┤
  │ Tourism │ TUR101C │ Structuri primire turistică │ nr.   │
  ├─────────┼─────────┼─────────────────────────────┼───────┤
  │ Tourism │ TUR104E │ Sosiri turiști              │ pers. │
  ├─────────┼─────────┼─────────────────────────────┼───────┤
  │ Tourism │ TUR105E │ Înnoptări                   │ nr.   │
  └─────────┴─────────┴─────────────────────────────┴───────┘
  Tier 6 — Agriculture (mostly rural, less relevant for municipalities):
  ┌─────────────┬─────────────────────────────────────────────┬───────────────────────────────────────────────────────┐
  │   Domain    │                    Codes                    │                     Name pattern                      │
  ├─────────────┼─────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Agriculture │ AGR101B, AGR108B, AGR109B, AGR112B, AGR115B │ Fond funciar, suprafețe cultivate, producție agricolă │
  ├─────────────┼─────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Prices      │ PPA101A                                     │ Prețuri produse agricole                              │
  └─────────────┴─────────────────────────────────────────────┴───────────────────────────────────────────────────────┘
  County Council vs. Primărie: Key Differences
  ┌─────────────────────┬───────────────────────────┬──────────────────────────────────────────────────────────────────────┐
  │       Aspect        │      Primărie (UAT)       │                      Consiliu Județean (County)                      │
  ├─────────────────────┼───────────────────────────┼──────────────────────────────────────────────────────────────────────┤
  │ INS territory level │ LAU (locality)            │ NUTS3 (county)                                                       │
  ├─────────────────────┼───────────────────────────┼──────────────────────────────────────────────────────────────────────┤
  │ Siruta linking      │ UATs.siruta_code directly │ Need county-level territory (siruta=county_code)                     │
  ├─────────────────────┼───────────────────────────┼──────────────────────────────────────────────────────────────────────┤
  │ Flag filter         │ has_uat_data = true       │ has_county_data = true                                               │
  ├─────────────────────┼───────────────────────────┼──────────────────────────────────────────────────────────────────────┤
  │ Population          │ UAT population            │ County aggregate population                                          │
  ├─────────────────────┼───────────────────────────┼──────────────────────────────────────────────────────────────────────┤
  │ Relevant domains    │ All tiers above           │ Less urban infra (GOS*), more county-wide (health, education, roads) │
  ├─────────────────────┼───────────────────────────┼──────────────────────────────────────────────────────────────────────┤
  │ Agriculture         │ Low relevance for cities  │ Higher relevance (county manages rural areas too)                    │
  └─────────────────────┴───────────────────────────┴──────────────────────────────────────────────────────────────────────┘
  Recommendation: What to Show on Entity Page

  For a UAT entity page (municipality/town/commune):

  1. Summary card with Tier 1 headline numbers: population, avg employees, unemployment rate, housing stock
  2. Infrastructure section with Tier 2 data (water, roads, green spaces, gas, transport)
  3. Education section with Tier 3 (schools, students, teachers)
  4. Health section with Tier 4 (hospitals, beds, medical staff)
  5. Culture & Tourism with Tier 5 (only for cities that have data)
  6. Agriculture only for communes/rural towns

  For a county council entity page:
  - Same structure but using county-level (NUTS3) data from has_county_data datasets
  - Emphasize county-wide aggregates rather than single-locality data
  - Include agriculture prominently (county councils manage rural development)

  Implementation approach:
  - The existing insUatDashboard query already handles UAT entities well
  - For county councils, you need a similar query that filters by NUTS3 territory instead of LAU siruta
  - Consider adding a contextCode filter to group by domain (the INS contexts table provides domain categorization like "Demography", "Economy", etc.) so the UI can show sections
  - The client should use entity.entity_type to decide which INS query to call and which tier ordering to apply
