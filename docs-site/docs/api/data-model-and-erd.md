---
id: data-model-and-erd
title: Data Model & ERD – Core Tables and GraphQL Mapping
---

**Who it's for**: Developers needing to understand how GraphQL maps to DB tables

**Outcomes**: Know where each field lives in the schema and how entities relate

This page documents the core data model (tables and relationships) and maps GraphQL fields to database columns. It covers:

- UATs (administrative units)
- Entities (institutions)
- Reports (metadata for imported files)
- ExecutionLineItems (facts)
- Classifications (functional/economic)
- Funding sources and budget sectors

### Entity‑Relationship Diagram

```mermaid
erDiagram
  UATs {
    INT id PK
    VARCHAR uat_key
    VARCHAR uat_code UNIQUE
    VARCHAR siruta_code UNIQUE
    TEXT name
    VARCHAR county_code
    VARCHAR county_name
    VARCHAR region
    INT population
    TIMESTAMPTZ last_updated
  }

  Entities {
    VARCHAR cui PK
    TEXT name
    INT uat_id FK
    TEXT address
    VARCHAR entity_type
    BOOL is_main_creditor
    BOOL is_uat
    TIMESTAMPTZ last_updated
    VARCHAR main_creditor_1_cui
    VARCHAR main_creditor_2_cui
  }

  Reports {
    TEXT report_id PK
    VARCHAR entity_cui FK
    report_type report_type
    VARCHAR main_creditor_cui
    DATE report_date
    INT reporting_year
    VARCHAR reporting_period
    INT budget_sector_id FK
    TEXT file_source
    TIMESTAMPTZ import_timestamp
    TEXT[] download_links
  }

  ExecutionLineItems {
    BIGSERIAL line_item_id PK
    TEXT report_id FK
    report_type report_type
    VARCHAR entity_cui FK
    VARCHAR main_creditor_cui
    INT budget_sector_id FK
    INT funding_source_id FK
    VARCHAR functional_code FK
    VARCHAR economic_code FK NULL
    CHAR(2) account_category
    DECIMAL(18,2) amount
    VARCHAR program_code NULL
    expense_type expense_type NULL
    INT year
  }

  FunctionalClassifications {
    VARCHAR functional_code PK
    TEXT functional_name
  }

  EconomicClassifications {
    VARCHAR economic_code PK
    TEXT economic_name
  }

  FundingSources {
    INT source_id PK
    TEXT source_description
  }

  BudgetSectors {
    INT sector_id PK
    TEXT sector_description
  }

  UATs ||--o{ Entities : "uat_id"
  Entities ||--o{ Reports : "entity_cui"
  Entities ||--o{ ExecutionLineItems : "entity_cui"
  Reports ||--o{ ExecutionLineItems : "report_id"
  BudgetSectors ||--o{ Reports : "budget_sector_id"
  BudgetSectors ||--o{ ExecutionLineItems : "budget_sector_id"
  FundingSources ||--o{ ExecutionLineItems : "funding_source_id"
  FunctionalClassifications ||--o{ ExecutionLineItems : "functional_code"
  EconomicClassifications ||--o{ ExecutionLineItems : "economic_code"
```

Notes

- County‑level semantics: counties are modeled via specific UAT records (including a special Bucharest case) and used by analytics.
- Materialized views used by analytics:
  - `vw_BudgetSummary_ByEntityPeriod`: yearly/period totals per entity
  - `vw_Category_Aggregated_Metrics`: classification aggregates by year/period/funding/geography

### GraphQL → DB field mapping

#### UAT (GraphQL type: `UAT` → table `UATs`)

- `id` → `UATs.id`
- `uat_key` → `UATs.uat_key`
- `uat_code` → `UATs.uat_code`
- `siruta_code` → `UATs.siruta_code`
- `name` → `UATs.name`
- `county_code` → `UATs.county_code`
- `county_name` → `UATs.county_name`
- `region` → `UATs.region`
- `population` → `UATs.population`
- `last_updated` → `UATs.last_updated`
- `county_entity` → derived: resolved via `entityRepository.getCountyEntity(county_code)`

#### Entity (GraphQL type: `Entity` → table `Entities`)

- `cui` → `Entities.cui`
- `name` → `Entities.name`
- `entity_type` → `Entities.entity_type`
- `uat_id` → `Entities.uat_id`
- `is_uat` → `Entities.is_uat`
- `is_main_creditor` → `Entities.is_main_creditor`
- `address` → `Entities.address`
- `last_updated` → `Entities.last_updated`
- `uat` → join by `Entities.uat_id = UATs.id`
- `children` → rows in `Entities` where `main_creditor_1_cui = parent.cui` OR `main_creditor_2_cui = parent.cui`
- `parents` → reverse relationship (see resolver logic)
- `reports` → rows in `Reports` where `entity_cui = Entities.cui`
- `executionLineItems` → rows in `ExecutionLineItems` where `entity_cui = Entities.cui` (with additional filters)
- `totalIncome(year)` / `totalExpenses(year)` / `budgetBalance(year)` → computed from `vw_BudgetSummary_ByEntityPeriod`
- `incomeTrend(startYear,endYear)` / `expenseTrend(...)` / `balanceTrend(...)` → computed from `vw_BudgetSummary_ByEntityPeriod`

#### Report (GraphQL type: `Report` → table `Reports`)

- `report_id` → `Reports.report_id`
- `entity_cui` → `Reports.entity_cui`
- `report_type` → `Reports.report_type`
- `report_date` → `Reports.report_date`
- `reporting_year` → `Reports.reporting_year`
- `reporting_period` → `Reports.reporting_period`
- `download_links` → `Reports.download_links`
- `main_creditor` → join by `Reports.main_creditor_cui = Entities.cui`
- `import_timestamp` → `Reports.import_timestamp`
- `entity` → join by `Reports.entity_cui = Entities.cui`
- `executionLineItems(...)` → rows in `ExecutionLineItems` filtered by `report_id` and optional code/category filters

#### ExecutionLineItem (GraphQL type: `ExecutionLineItem` → table `ExecutionLineItems`)

- `line_item_id` → `ExecutionLineItems.line_item_id`
- `report_id` → `ExecutionLineItems.report_id`
- `entity_cui` → `ExecutionLineItems.entity_cui`
- `funding_source_id` → `ExecutionLineItems.funding_source_id`
- `functional_code` → `ExecutionLineItems.functional_code`
- `economic_code` → `ExecutionLineItems.economic_code`
- `account_category` → `ExecutionLineItems.account_category` (`vn` or `ch`)
- `amount` → `ExecutionLineItems.amount`
- `program_code` → `ExecutionLineItems.program_code`
- `year` → `ExecutionLineItems.year`
- `report` → join by `ExecutionLineItems.report_id = Reports.report_id`
- `entity` → join by `ExecutionLineItems.entity_cui = Entities.cui`
- `fundingSource` → join by `ExecutionLineItems.funding_source_id = FundingSources.source_id`
- `budgetSector` → join by `ExecutionLineItems.budget_sector_id = BudgetSectors.sector_id`
- `functionalClassification` → join by `ExecutionLineItems.functional_code = FunctionalClassifications.functional_code`
- `economicClassification` → left join by `ExecutionLineItems.economic_code = EconomicClassifications.economic_code`

#### Classifications

- `FunctionalClassification` → `FunctionalClassifications(functional_code, functional_name)`
- `EconomicClassification` → `EconomicClassifications(economic_code, economic_name)`

#### Funding sources and budget sectors

- `FundingSource` → `FundingSources(source_id, source_description)`
- `BudgetSector` → `BudgetSectors(sector_id, sector_description)`

### Materialized views used by analytics

- `vw_BudgetSummary_ByEntityPeriod`
  - Columns: `reporting_year`, `reporting_period`, `entity_cui`, `entity_name`, `entity_type`, `uat_code`, `uat_name`, `county_name`, `uat_region`, `total_income`, `total_expense`, `budget_balance`, `report_count`
  - Used for entity totals and trends (income/expense/balance)

- `vw_Category_Aggregated_Metrics`
  - Columns: `reporting_year`, `reporting_period`, `account_category`, `functional_code/name`, `economic_code/name`, `funding_source_id/description`, `county_code/name`, `uat_region`, and aggregates (`total_amount`, `contributing_entities_count`, `avg_amount`, `min_amount`, `max_amount`)
  - Used for category aggregates and analytics

### Key constraints and integrity

- Foreign keys connect facts to dimensions (see ERD edges). Deletions are restricted for most dimensions; `Reports → ExecutionLineItems` uses `ON DELETE CASCADE` to keep facts aligned with report lifecycle.
- Checks enforce domain constraints: `account_category IN ('vn','ch')`, `year` range, `economic_code` required for `ch` items, etc.


### See also

- GraphQL schema & types: [api-graphql-schema-and-types](./graphql-schema-and-types.md)
- GraphQL queries & examples: [api-graphql-queries](./graphql-queries.md)
- Unified filter deep dive (SQL mappings): [api-unified-filter-interface](./unified-filter-interface.md)


