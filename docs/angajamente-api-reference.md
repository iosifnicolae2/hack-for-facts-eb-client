# Angajamente Bugetare — GraphQL API Reference

## Technical Specification v1.0

---

## 1. Quick Start

### Minimal Example: Get Summary Data

```graphql
query AngajamenteSummary {
  angajamenteSummary(
    filter: {
      report_period: {
        type: QUARTER
        selection: { interval: { start: "2024-Q1", end: "2024-Q4" } }
      }
      report_type: PRINCIPAL_AGGREGATED
    }
    limit: 10
  ) {
    nodes {
      ... on AngajamenteQuarterlySummary {
        year
        quarter
        entity_cui
        entity_name
        credite_angajament
        plati_trezor
        total_plati
        execution_rate
        commitment_rate
      }
    }
    pageInfo {
      totalCount
      hasNextPage
    }
  }
}
```

---

## 2. Available Queries

| Query                   | Purpose                              | Required Filter Fields                                          |
| ----------------------- | ------------------------------------ | --------------------------------------------------------------- |
| `angajamenteSummary`    | Period-based summary with union type | `report_period`                                                 |
| `angajamenteLineItems`  | Individual line items                | `report_period`, `report_type` (recommended)                    |
| `angajamenteAnalytics`  | Time-series for charting             | `report_period`, `metric` per input                             |
| `angajamenteAggregated` | Aggregation by classification        | `report_period`, `metric`                                       |
| `commitmentVsExecution` | Compare commitments vs execution     | `report_period`, `report_type: PRINCIPAL_AGGREGATED` (required) |

---

## 3. Filter Reference: `AngajamenteFilterInput`

Every query requires a filter. Here is the complete field reference:

### 3.1 Required Fields

| Field           | Type                 | Description                       |
| --------------- | -------------------- | --------------------------------- |
| `report_period` | `ReportPeriodInput!` | Time period selection (see below) |

### 3.2 Report Period Input

```graphql
input ReportPeriodInput {
  type: PeriodType! # MONTH, QUARTER, or YEAR
  selection: PeriodSelectionInput!
}

input PeriodSelectionInput {
  interval: PeriodIntervalInput # Use interval OR dates, not both
  dates: [String!] # Explicit period dates
}

input PeriodIntervalInput {
  start: String! # e.g., "2024-Q1", "2024-01", "2024"
  end: String! # e.g., "2024-Q4", "2024-12", "2024"
}
```

**Date format by period type**:
| PeriodType | Format | Example |
|-----------|--------|---------|
| `MONTH` | `YYYY-MM` | `"2024-01"` |
| `QUARTER` | `YYYY-QN` | `"2024-Q1"` |
| `YEAR` | `YYYY` | `"2024"` |

### 3.3 Optional Filter Fields

| Field                  | Type                    | Default | Description                                                |
| ---------------------- | ----------------------- | ------- | ---------------------------------------------------------- |
| `report_type`          | `AngajamenteReportType` | —       | `DETAILED`, `PRINCIPAL_AGGREGATED`, `SECONDARY_AGGREGATED` |
| `entity_cuis`          | `[String!]`             | —       | Filter by entity CUI(s)                                    |
| `main_creditor_cui`    | `String`                | —       | Filter by parent entity CUI                                |
| `entity_types`         | `[String!]`             | —       | Filter by entity type                                      |
| `is_uat`               | `Boolean`               | —       | Filter UAT entities only                                   |
| `search`               | `String`                | —       | Text search on entity name                                 |
| `functional_codes`     | `[String!]`             | —       | Exact functional classification codes                      |
| `functional_prefixes`  | `[String!]`             | —       | Functional code prefix match (e.g., `"51"`)                |
| `economic_codes`       | `[String!]`             | —       | Exact economic classification codes                        |
| `economic_prefixes`    | `[String!]`             | —       | Economic code prefix match                                 |
| `funding_source_ids`   | `[ID!]`                 | —       | Funding source IDs                                         |
| `budget_sector_ids`    | `[ID!]`                 | —       | Budget sector IDs                                          |
| `county_codes`         | `[String!]`             | —       | County codes                                               |
| `regions`              | `[String!]`             | —       | Region names                                               |
| `uat_ids`              | `[ID!]`                 | —       | UAT (administrative unit) IDs                              |
| `min_population`       | `Int`                   | —       | Minimum entity population                                  |
| `max_population`       | `Int`                   | —       | Maximum entity population                                  |
| `aggregate_min_amount` | `Float`                 | —       | Minimum aggregate amount threshold                         |
| `aggregate_max_amount` | `Float`                 | —       | Maximum aggregate amount threshold                         |
| `item_min_amount`      | `Float`                 | —       | Minimum per-item amount threshold                          |
| `item_max_amount`      | `Float`                 | —       | Maximum per-item amount threshold                          |

### 3.4 Transform Fields

| Field                | Type            | Default | Description                                                           |
| -------------------- | --------------- | ------- | --------------------------------------------------------------------- |
| `normalization`      | `Normalization` | `total` | `total`, `total_euro`, `per_capita`, `per_capita_euro`, `percent_gdp` |
| `currency`           | `Currency`      | `RON`   | `RON`, `EUR`, `USD`                                                   |
| `inflation_adjusted` | `Boolean`       | `false` | Adjust for inflation using CPI data                                   |
| `show_period_growth` | `Boolean`       | `false` | Include growth_percent in analytics/comparison data                   |

### 3.5 Exclusion Fields

| Field               | Type                      | Default | Description                          |
| ------------------- | ------------------------- | ------- | ------------------------------------ |
| `exclude_transfers` | `Boolean`                 | `true`  | Exclude inter-governmental transfers |
| `exclude`           | `AngajamenteExcludeInput` | —       | Explicit exclusions (see below)      |

```graphql
input AngajamenteExcludeInput {
  report_ids: [ID!]
  entity_cuis: [String!]
  main_creditor_cui: String
  functional_codes: [String!]
  functional_prefixes: [String!]
  economic_codes: [String!]
  economic_prefixes: [String!]
  funding_source_ids: [ID!]
  budget_sector_ids: [ID!]
  county_codes: [String!]
  regions: [String!]
  uat_ids: [ID!]
  entity_types: [String!]
}
```

---

## 4. Query: `angajamenteSummary`

### Signature

```graphql
angajamenteSummary(
  filter: AngajamenteFilterInput!
  limit: Int = 50
  offset: Int = 0
): AngajamenteSummaryConnection!
```

### Union Type Handling

The result `nodes` are a **union type** (`AngajamenteSummaryResult`). You MUST use `__typename` and inline fragments:

```graphql
query SummaryQuarterly($filter: AngajamenteFilterInput!) {
  angajamenteSummary(filter: $filter, limit: 50) {
    nodes {
      __typename
      ... on AngajamenteMonthlySummary {
        year
        month
        entity_cui
        entity_name
        report_type
        credite_angajament
        plati_trezor
        plati_non_trezor
        receptii_totale
        receptii_neplatite_change
        total_plati
      }
      ... on AngajamenteQuarterlySummary {
        year
        quarter
        entity_cui
        entity_name
        report_type
        credite_angajament
        limita_credit_angajament
        credite_bugetare
        credite_angajament_initiale
        credite_bugetare_initiale
        credite_angajament_definitive
        credite_bugetare_definitive
        credite_angajament_disponibile
        credite_bugetare_disponibile
        receptii_totale
        plati_trezor
        plati_non_trezor
        receptii_neplatite
        total_plati
        execution_rate
        commitment_rate
      }
      ... on AngajamenteAnnualSummary {
        year
        entity_cui
        entity_name
        report_type
        credite_angajament
        limita_credit_angajament
        credite_bugetare
        credite_angajament_initiale
        credite_bugetare_initiale
        credite_angajament_definitive
        credite_bugetare_definitive
        credite_angajament_disponibile
        credite_bugetare_disponibile
        receptii_totale
        plati_trezor
        plati_non_trezor
        receptii_neplatite
        total_plati
        execution_rate
        commitment_rate
      }
    }
    pageInfo {
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### Variables

```json
{
  "filter": {
    "report_period": {
      "type": "QUARTER",
      "selection": {
        "interval": { "start": "2024-Q1", "end": "2024-Q4" }
      }
    },
    "report_type": "PRINCIPAL_AGGREGATED",
    "entity_cuis": ["4316422"]
  }
}
```

### Response Type by Period

| Period Type | Response Type                 | Key Fields                                |
| ----------- | ----------------------------- | ----------------------------------------- |
| `MONTH`     | `AngajamenteMonthlySummary`   | `year`, `month`, 5 metrics, `total_plati` |
| `QUARTER`   | `AngajamenteQuarterlySummary` | `year`, `quarter`, 13 metrics, rates      |
| `YEAR`      | `AngajamenteAnnualSummary`    | `year`, 13 metrics, rates                 |

---

## 5. Query: `angajamenteLineItems`

### Signature

```graphql
angajamenteLineItems(
  filter: AngajamenteFilterInput!
  limit: Int = 50
  offset: Int = 0
): AngajamenteLineItemConnection!
```

### Example

```graphql
query LineItems($filter: AngajamenteFilterInput!) {
  angajamenteLineItems(filter: $filter, limit: 20, offset: 0) {
    nodes {
      id
      year
      month
      report_type
      entity_cui
      entity_name
      budget_sector_id
      budget_sector_name
      funding_source_id
      funding_source_name
      functional_code
      functional_name
      economic_code
      economic_name

      # YTD metrics
      credite_angajament
      limita_credit_angajament
      credite_bugetare
      credite_angajament_initiale
      credite_bugetare_initiale
      credite_angajament_definitive
      credite_bugetare_definitive
      credite_angajament_disponibile
      credite_bugetare_disponibile
      receptii_totale
      plati_trezor
      plati_non_trezor
      receptii_neplatite

      # Monthly deltas
      monthly_plati_trezor
      monthly_plati_non_trezor
      monthly_receptii_totale
      monthly_receptii_neplatite_change
      monthly_credite_angajament

      # Period flags
      is_quarterly
      quarter
      is_yearly

      # Data quality
      anomaly
    }
    pageInfo {
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### Variables

```json
{
  "filter": {
    "report_period": {
      "type": "QUARTER",
      "selection": {
        "interval": { "start": "2024-Q1", "end": "2024-Q4" }
      }
    },
    "report_type": "PRINCIPAL_AGGREGATED",
    "entity_cuis": ["4316422"],
    "functional_prefixes": ["51"]
  }
}
```

### Key Notes

- **`report_type` is strongly recommended** — Without it, results may include mixed report types
- **`anomaly`** can be `"YTD_ANOMALY"`, `"MISSING_LINE_ITEM"`, or `null`
- **`is_quarterly`** and **`is_yearly`** flags indicate whether this row represents a quarterly/yearly snapshot
- Monthly delta fields (`monthly_*`) show the change from the previous month

---

## 6. Query: `angajamenteAnalytics`

### Signature

```graphql
angajamenteAnalytics(
  inputs: [AngajamenteAnalyticsInput!]!
): [AngajamenteAnalyticsSeries!]!
```

### Input Type

```graphql
input AngajamenteAnalyticsInput {
  filter: AngajamenteFilterInput!
  metric: AngajamenteMetric!
  seriesId: String # Optional custom series identifier
}
```

### Example: Single Series

```graphql
query PaymentsTrend {
  angajamenteAnalytics(
    inputs: [
      {
        filter: {
          report_period: {
            type: QUARTER
            selection: { interval: { start: "2020-Q1", end: "2024-Q4" } }
          }
          report_type: PRINCIPAL_AGGREGATED
          entity_cuis: ["4316422"]
        }
        metric: PLATI_TREZOR
        seriesId: "payments"
      }
    ]
  ) {
    seriesId
    metric
    xAxis {
      name
      type
      unit
    }
    yAxis {
      name
      type
      unit
    }
    data {
      x
      y
      growth_percent
    }
  }
}
```

### Example: Multi-Series Comparison

```graphql
query CommitmentsVsPayments {
  angajamenteAnalytics(
    inputs: [
      {
        filter: {
          report_period: {
            type: QUARTER
            selection: { interval: { start: "2022-Q1", end: "2024-Q4" } }
          }
          report_type: PRINCIPAL_AGGREGATED
          entity_cuis: ["4316422"]
        }
        metric: CREDITE_ANGAJAMENT
        seriesId: "commitments"
      }
      {
        filter: {
          report_period: {
            type: QUARTER
            selection: { interval: { start: "2022-Q1", end: "2024-Q4" } }
          }
          report_type: PRINCIPAL_AGGREGATED
          entity_cuis: ["4316422"]
        }
        metric: PLATI_TREZOR
        seriesId: "payments"
      }
    ]
  ) {
    seriesId
    metric
    data {
      x
      y
      growth_percent
    }
  }
}
```

### Response Shape

```typescript
interface AngajamenteAnalyticsSeries {
  seriesId: string; // Custom ID or auto-generated
  metric: AngajamenteMetric;
  xAxis: { name: string; type: string; unit: string };
  yAxis: { name: string; type: string; unit: string };
  data: {
    x: string; // Period label (e.g., "2024-Q1", "2024-03")
    y: number; // Metric value
    growth_percent: number | null; // Only present when show_period_growth: true
  }[];
}
```

### Key Notes

- **Multiple inputs** can have **different filters** — useful for comparing entities side-by-side
- **`seriesId`** defaults to metric name if not provided; use custom IDs when sending multiple series with the same metric
- **`growth_percent`** is only populated when the filter includes `show_period_growth: true`
- Validate metric availability against period type (see Section 11)

---

## 7. Query: `angajamenteAggregated`

### Signature

```graphql
angajamenteAggregated(
  input: AngajamenteAggregatedInput!
): AngajamenteAggregatedConnection!
```

### Input Type

```graphql
input AngajamenteAggregatedInput {
  filter: AngajamenteFilterInput!
  metric: AngajamenteMetric!
  limit: Int = 50
  offset: Int = 0
}
```

### Example

```graphql
query TopFunctionalAreas {
  angajamenteAggregated(
    input: {
      filter: {
        report_period: {
          type: YEAR
          selection: { interval: { start: "2024", end: "2024" } }
        }
        report_type: PRINCIPAL_AGGREGATED
        entity_cuis: ["4316422"]
      }
      metric: PLATI_TREZOR
      limit: 20
    }
  ) {
    nodes {
      functional_code
      functional_name
      economic_code
      economic_name
      amount
      count
    }
    pageInfo {
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### Response Shape

```typescript
interface AngajamenteAggregatedItem {
  functional_code: string; // e.g., "51.01.03"
  functional_name: string; // e.g., "Autoritati executive"
  economic_code: string | null;
  economic_name: string | null;
  amount: number; // Aggregated metric value
  count: number; // Number of line items aggregated
}
```

### Key Notes

- Groups by `functional_code` + `economic_code`
- Use for pie charts, treemaps, or bar charts showing spending by classification
- The `count` field tells you how many underlying line items were aggregated
- Pagination applies to the aggregated groups, not individual line items

---

## 8. Query: `commitmentVsExecution`

### Signature

```graphql
commitmentVsExecution(
  input: CommitmentExecutionComparisonInput!
): CommitmentExecutionComparison!
```

### Input Type

```graphql
input CommitmentExecutionComparisonInput {
  filter: AngajamenteFilterInput!
  angajamente_metric: AngajamenteMetric = PLATI_TREZOR
}
```

### Example

```graphql
query CompareCommitmentExecution {
  commitmentVsExecution(
    input: {
      filter: {
        report_period: {
          type: QUARTER
          selection: { interval: { start: "2022-Q1", end: "2024-Q4" } }
        }
        report_type: PRINCIPAL_AGGREGATED
        entity_cuis: ["4316422"]
      }
      angajamente_metric: PLATI_TREZOR
    }
  ) {
    frequency
    data {
      period
      commitment_value
      execution_value
      difference
      difference_percent
      commitment_growth_percent
      execution_growth_percent
      difference_growth_percent
    }
    total_commitment
    total_execution
    total_difference
    overall_difference_percent
    matched_count
    unmatched_commitment_count
    unmatched_execution_count
  }
}
```

### Response Shape

```typescript
interface CommitmentExecutionComparison {
  frequency: "MONTH" | "QUARTER" | "YEAR";
  data: {
    period: string; // e.g., "2024-Q1"
    commitment_value: number;
    execution_value: number;
    difference: number; // commitment - execution
    difference_percent: number | null;
    commitment_growth_percent: number | null; // Only with show_period_growth
    execution_growth_percent: number | null;
    difference_growth_percent: number | null;
  }[];
  total_commitment: number;
  total_execution: number;
  total_difference: number;
  overall_difference_percent: number | null;
  matched_count: number;
  unmatched_commitment_count: number;
  unmatched_execution_count: number;
}
```

### Critical Requirements

1. **`report_type: PRINCIPAL_AGGREGATED` is required** — The query matches angajamente reports to execution reports by report type. Without this, the join fails or produces incorrect results.
2. **Use QUARTER or YEAR granularity** — Monthly comparison produces many unmatched periods because angajamente data is natively quarterly.
3. **Performance**: This is the slowest query (10-45 seconds). Use narrow filters.

---

## 9. Enums Reference

### AngajamenteReportType

```graphql
enum AngajamenteReportType {
  DETAILED
  PRINCIPAL_AGGREGATED
  SECONDARY_AGGREGATED
}
```

### AngajamenteMetric

```graphql
enum AngajamenteMetric {
  # All periods (MONTH, QUARTER, YEAR)
  CREDITE_ANGAJAMENT
  PLATI_TREZOR
  PLATI_NON_TREZOR
  RECEPTII_TOTALE
  RECEPTII_NEPLATITE_CHANGE

  # QUARTER and YEAR only
  LIMITA_CREDIT_ANGAJAMENT
  CREDITE_BUGETARE
  CREDITE_ANGAJAMENT_INITIALE
  CREDITE_BUGETARE_INITIALE
  CREDITE_ANGAJAMENT_DEFINITIVE
  CREDITE_BUGETARE_DEFINITIVE
  CREDITE_ANGAJAMENT_DISPONIBILE
  CREDITE_BUGETARE_DISPONIBILE
  RECEPTII_NEPLATITE
}
```

### PeriodType (shared)

```graphql
enum PeriodType {
  MONTH
  QUARTER
  YEAR
}
```

### Normalization (shared)

```graphql
enum Normalization {
  total
  total_euro
  per_capita
  per_capita_euro
  percent_gdp
}
```

### Currency (shared)

```graphql
enum Currency {
  RON
  EUR
  USD
}
```

### AnomalyType (shared, defined in execution-analytics)

```graphql
enum AnomalyType {
  YTD_ANOMALY
  MISSING_LINE_ITEM
}
```

---

## 10. TypeScript Types for the Client

These types match the GraphQL schema and should replace the current mock types in `src/schemas/angajamente.ts`:

```typescript
// ─────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────

export type AngajamenteReportType =
  | "DETAILED"
  | "PRINCIPAL_AGGREGATED"
  | "SECONDARY_AGGREGATED";

export type AngajamenteMetric =
  | "CREDITE_ANGAJAMENT"
  | "PLATI_TREZOR"
  | "PLATI_NON_TREZOR"
  | "RECEPTII_TOTALE"
  | "RECEPTII_NEPLATITE_CHANGE"
  | "LIMITA_CREDIT_ANGAJAMENT"
  | "CREDITE_BUGETARE"
  | "CREDITE_ANGAJAMENT_INITIALE"
  | "CREDITE_BUGETARE_INITIALE"
  | "CREDITE_ANGAJAMENT_DEFINITIVE"
  | "CREDITE_BUGETARE_DEFINITIVE"
  | "CREDITE_ANGAJAMENT_DISPONIBILE"
  | "CREDITE_BUGETARE_DISPONIBILE"
  | "RECEPTII_NEPLATITE";

export type PeriodType = "MONTH" | "QUARTER" | "YEAR";
export type Normalization =
  | "total"
  | "total_euro"
  | "per_capita"
  | "per_capita_euro"
  | "percent_gdp";
export type Currency = "RON" | "EUR" | "USD";
export type AnomalyType = "YTD_ANOMALY" | "MISSING_LINE_ITEM";

// ─────────────────────────────────────────────────────────────────
// Filter Inputs
// ─────────────────────────────────────────────────────────────────

export interface ReportPeriodInput {
  type: PeriodType;
  selection: {
    interval?: { start: string; end: string };
    dates?: string[];
  };
}

export interface AngajamenteExcludeInput {
  report_ids?: string[];
  entity_cuis?: string[];
  main_creditor_cui?: string;
  functional_codes?: string[];
  functional_prefixes?: string[];
  economic_codes?: string[];
  economic_prefixes?: string[];
  funding_source_ids?: string[];
  budget_sector_ids?: string[];
  county_codes?: string[];
  regions?: string[];
  uat_ids?: string[];
  entity_types?: string[];
}

export interface AngajamenteFilterInput {
  report_period: ReportPeriodInput;
  report_type?: AngajamenteReportType;

  entity_cuis?: string[];
  main_creditor_cui?: string;
  entity_types?: string[];
  is_uat?: boolean;
  search?: string;

  functional_codes?: string[];
  functional_prefixes?: string[];
  economic_codes?: string[];
  economic_prefixes?: string[];

  funding_source_ids?: string[];
  budget_sector_ids?: string[];

  county_codes?: string[];
  regions?: string[];
  uat_ids?: string[];

  min_population?: number;
  max_population?: number;

  aggregate_min_amount?: number;
  aggregate_max_amount?: number;
  item_min_amount?: number;
  item_max_amount?: number;

  normalization?: Normalization;
  currency?: Currency;
  inflation_adjusted?: boolean;
  show_period_growth?: boolean;

  exclude?: AngajamenteExcludeInput;
  exclude_transfers?: boolean; // defaults to true on server
}

// ─────────────────────────────────────────────────────────────────
// Summary Types (Union)
// ─────────────────────────────────────────────────────────────────

export interface AngajamenteMonthlySummary {
  __typename: "AngajamenteMonthlySummary";
  year: number;
  month: number;
  entity_cui: string;
  entity_name: string;
  main_creditor_cui: string | null;
  report_type: AngajamenteReportType;
  credite_angajament: number;
  plati_trezor: number;
  plati_non_trezor: number;
  receptii_totale: number;
  receptii_neplatite_change: number;
  total_plati: number;
}

export interface AngajamenteQuarterlySummary {
  __typename: "AngajamenteQuarterlySummary";
  year: number;
  quarter: number;
  entity_cui: string;
  entity_name: string;
  main_creditor_cui: string | null;
  report_type: AngajamenteReportType;
  credite_angajament: number;
  limita_credit_angajament: number;
  credite_bugetare: number;
  credite_angajament_initiale: number;
  credite_bugetare_initiale: number;
  credite_angajament_definitive: number;
  credite_bugetare_definitive: number;
  credite_angajament_disponibile: number;
  credite_bugetare_disponibile: number;
  receptii_totale: number;
  plati_trezor: number;
  plati_non_trezor: number;
  receptii_neplatite: number;
  total_plati: number;
  execution_rate: number | null;
  commitment_rate: number | null;
}

export interface AngajamenteAnnualSummary {
  __typename: "AngajamenteAnnualSummary";
  year: number;
  entity_cui: string;
  entity_name: string;
  main_creditor_cui: string | null;
  report_type: AngajamenteReportType;
  credite_angajament: number;
  limita_credit_angajament: number;
  credite_bugetare: number;
  credite_angajament_initiale: number;
  credite_bugetare_initiale: number;
  credite_angajament_definitive: number;
  credite_bugetare_definitive: number;
  credite_angajament_disponibile: number;
  credite_bugetare_disponibile: number;
  receptii_totale: number;
  plati_trezor: number;
  plati_non_trezor: number;
  receptii_neplatite: number;
  total_plati: number;
  execution_rate: number | null;
  commitment_rate: number | null;
}

export type AngajamenteSummaryResult =
  | AngajamenteMonthlySummary
  | AngajamenteQuarterlySummary
  | AngajamenteAnnualSummary;

// ─────────────────────────────────────────────────────────────────
// Line Items
// ─────────────────────────────────────────────────────────────────

export interface AngajamenteLineItem {
  id: string;
  year: number;
  month: number;
  report_type: AngajamenteReportType;

  entity_cui: string;
  entity_name: string;
  main_creditor_cui: string | null;

  budget_sector_id: number;
  budget_sector_name: string;
  funding_source_id: number;
  funding_source_name: string;
  functional_code: string;
  functional_name: string;
  economic_code: string | null;
  economic_name: string | null;

  // YTD metrics
  credite_angajament: number;
  limita_credit_angajament: number;
  credite_bugetare: number;
  credite_angajament_initiale: number;
  credite_bugetare_initiale: number;
  credite_angajament_definitive: number;
  credite_bugetare_definitive: number;
  credite_angajament_disponibile: number;
  credite_bugetare_disponibile: number;
  receptii_totale: number;
  plati_trezor: number;
  plati_non_trezor: number;
  receptii_neplatite: number;

  // Monthly deltas
  monthly_plati_trezor: number;
  monthly_plati_non_trezor: number;
  monthly_receptii_totale: number;
  monthly_receptii_neplatite_change: number;
  monthly_credite_angajament: number;

  // Period flags
  is_quarterly: boolean;
  quarter: number | null;
  is_yearly: boolean;

  // Data quality
  anomaly: AnomalyType | null;
}

// ─────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────

export interface AngajamenteAnalyticsDataPoint {
  x: string;
  y: number;
  growth_percent: number | null;
}

export interface Axis {
  name: string;
  type: string;
  unit: string;
}

export interface AngajamenteAnalyticsSeries {
  seriesId: string;
  metric: AngajamenteMetric;
  xAxis: Axis;
  yAxis: Axis;
  data: AngajamenteAnalyticsDataPoint[];
}

// ─────────────────────────────────────────────────────────────────
// Aggregated
// ─────────────────────────────────────────────────────────────────

export interface AngajamenteAggregatedItem {
  functional_code: string;
  functional_name: string;
  economic_code: string | null;
  economic_name: string | null;
  amount: number;
  count: number;
}

// ─────────────────────────────────────────────────────────────────
// Commitment vs Execution
// ─────────────────────────────────────────────────────────────────

export interface CommitmentExecutionDataPoint {
  period: string;
  commitment_value: number;
  execution_value: number;
  difference: number;
  difference_percent: number | null;
  commitment_growth_percent: number | null;
  execution_growth_percent: number | null;
  difference_growth_percent: number | null;
}

export interface CommitmentExecutionComparison {
  frequency: PeriodType;
  data: CommitmentExecutionDataPoint[];
  total_commitment: number;
  total_execution: number;
  total_difference: number;
  overall_difference_percent: number | null;
  matched_count: number;
  unmatched_commitment_count: number;
  unmatched_execution_count: number;
}

// ─────────────────────────────────────────────────────────────────
// Pagination (shared)
// ─────────────────────────────────────────────────────────────────

export interface PageInfo {
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Connection<T> {
  nodes: T[];
  pageInfo: PageInfo;
}
```

---

## 11. Metric Availability Matrix

Before requesting a metric, validate it against the period type. Requesting an unavailable metric for a period type will return empty or zero data.

| Metric                           | `MONTH` | `QUARTER` | `YEAR` |
| -------------------------------- | :-----: | :-------: | :----: |
| `CREDITE_ANGAJAMENT`             |   Yes   |    Yes    |  Yes   |
| `PLATI_TREZOR`                   |   Yes   |    Yes    |  Yes   |
| `PLATI_NON_TREZOR`               |   Yes   |    Yes    |  Yes   |
| `RECEPTII_TOTALE`                |   Yes   |    Yes    |  Yes   |
| `RECEPTII_NEPLATITE_CHANGE`      |   Yes   |  **No**   | **No** |
| `LIMITA_CREDIT_ANGAJAMENT`       | **No**  |    Yes    |  Yes   |
| `CREDITE_BUGETARE`               | **No**  |    Yes    |  Yes   |
| `CREDITE_ANGAJAMENT_INITIALE`    | **No**  |    Yes    |  Yes   |
| `CREDITE_BUGETARE_INITIALE`      | **No**  |    Yes    |  Yes   |
| `CREDITE_ANGAJAMENT_DEFINITIVE`  | **No**  |    Yes    |  Yes   |
| `CREDITE_BUGETARE_DEFINITIVE`    | **No**  |    Yes    |  Yes   |
| `CREDITE_ANGAJAMENT_DISPONIBILE` | **No**  |    Yes    |  Yes   |
| `CREDITE_BUGETARE_DISPONIBILE`   | **No**  |    Yes    |  Yes   |
| `RECEPTII_NEPLATITE`             | **No**  |    Yes    |  Yes   |

**Client-side validation helper**:

```typescript
const MONTHLY_METRICS: ReadonlySet<AngajamenteMetric> = new Set([
  "CREDITE_ANGAJAMENT",
  "PLATI_TREZOR",
  "PLATI_NON_TREZOR",
  "RECEPTII_TOTALE",
  "RECEPTII_NEPLATITE_CHANGE",
]);

export function isMetricAvailableForPeriod(
  metric: AngajamenteMetric,
  periodType: PeriodType,
): boolean {
  if (periodType === "MONTH") {
    return MONTHLY_METRICS.has(metric);
  }
  // QUARTER and YEAR support all metrics except RECEPTII_NEPLATITE_CHANGE
  return metric !== "RECEPTII_NEPLATITE_CHANGE";
}
```

---

## 12. Normalization & Currency Combinations

### Valid Combinations

| Normalization     | Currency  | inflation_adjusted | Description                    |
| ----------------- | --------- | ------------------ | ------------------------------ |
| `total`           | `RON`     | `false`            | Raw values (default)           |
| `total`           | `RON`     | `true`             | Inflation-adjusted RON         |
| `total`           | `EUR`     | `false`            | Converted to EUR               |
| `total`           | `USD`     | `false`            | Converted to USD               |
| `total_euro`      | (ignored) | `false`            | Shorthand for total + EUR      |
| `per_capita`      | `RON`     | `false`            | Per-capita in RON              |
| `per_capita`      | `RON`     | `true`             | Per-capita inflation-adjusted  |
| `per_capita_euro` | (ignored) | `false`            | Shorthand for per_capita + EUR |
| `percent_gdp`     | (ignored) | `false`            | As percentage of GDP           |

### Notes

- When using `total_euro` or `per_capita_euro` normalization, the `currency` field is ignored (EUR is implicit)
- `percent_gdp` always returns values as percentages (0-100 scale), currency is irrelevant
- `inflation_adjusted` uses CPI data to normalize to a base year — combines with any normalization mode
- `show_period_growth` adds `growth_percent` to each data point (analytics and commitmentVsExecution)

---

## 13. Error Handling

### Expected Error Types

| Error Type        | When                                                   | HTTP Status         | Action                              |
| ----------------- | ------------------------------------------------------ | ------------------- | ----------------------------------- |
| `ValidationError` | Invalid filter (e.g., metric not available for period) | 200 (GraphQL error) | Show user-friendly message          |
| `DatabaseError`   | Query failed                                           | 200 (GraphQL error) | Retry with exponential backoff      |
| `TimeoutError`    | Query exceeded timeout                                 | 200 (GraphQL error) | Narrow filters, reduce limit, retry |

### GraphQL Error Format

```json
{
  "data": null,
  "errors": [
    {
      "message": "[DatabaseError] Angajamente summary query failed",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["angajamenteSummary"]
    }
  ]
}
```

### Client-Side Error Handling Pattern

```typescript
async function fetchAngajamenteSummary(filter: AngajamenteFilterInput) {
  const result = await graphqlRequest<{
    angajamenteSummary: Connection<AngajamenteSummaryResult>;
  }>(ANGAJAMENTE_SUMMARY_QUERY, { filter });

  // graphqlRequest already handles HTTP errors
  // GraphQL errors are thrown as Error with message
  return result.angajamenteSummary;
}
```

---

## 14. Performance Considerations

### Query Performance Tiers

| Tier   | Queries                                        | Typical Time | Notes                                         |
| ------ | ---------------------------------------------- | ------------ | --------------------------------------------- |
| Fast   | `angajamenteSummary`, `angajamenteAggregated`  | 1-5s         | Use for dashboard loads                       |
| Medium | `angajamenteLineItems`, `angajamenteAnalytics` | 2-10s        | Show loading state                            |
| Slow   | `commitmentVsExecution`                        | 10-45s       | Show progress indicator, consider prefetching |

### Performance Tips

1. **Always specify `report_type`** — Filters narrow the query significantly
2. **Use QUARTER over MONTH** — Quarterly is native granularity, much faster
3. **Limit entity scope** — Use `entity_cuis` filter when possible
4. **Paginate aggressively** — Default 50, max 1000; start with smaller limits
5. **Avoid wide date ranges on commitmentVsExecution** — This query joins two large tables
6. **Use `staleTime` in React Query** — Budget data changes infrequently; 5-10 minutes is safe

### Recommended Limits

| Query                   | Recommended Limit | Max Limit |
| ----------------------- | ----------------- | --------- |
| `angajamenteSummary`    | 50                | 1000      |
| `angajamenteLineItems`  | 20-50             | 1000      |
| `angajamenteAggregated` | 20-50             | 1000      |

---

## 15. Migration Guide: Mock to Real API

### Overview of Changes

The current client uses mock data with a fundamentally different data model. Here's what needs to change:

### 15.1 Schema Types (`src/schemas/angajamente.ts`)

| Current Mock Type            | Replace With                                                                                  | Key Differences                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AngajamenteLineItem`        | `AngajamenteLineItem` (Section 10)                                                            | New: `id` field, `budget_sector_*`, `funding_source_*` fields; snake*case naming; `monthly*\*` deltas are always numbers (not nullable)                 |
| `AngajamenteSummary`         | Union: `AngajamenteMonthlySummary \| AngajamenteQuarterlySummary \| AngajamenteAnnualSummary` | Completely different structure; no `utilizationRate`/`commitmentRate` in monthly; rates are `execution_rate`/`commitment_rate` on quarterly/annual only |
| `PipelineStage`              | No direct equivalent                                                                          | Compute client-side from summary data                                                                                                                   |
| `FunctionalBreakdown`        | `AngajamenteAggregatedItem`                                                                   | Simpler: just `functional_code`, `functional_name`, `amount`, `count`; no nested items                                                                  |
| `AngajamentePaginatedResult` | `Connection<T>`                                                                               | Standard GraphQL pagination (`nodes` + `pageInfo`); no `currentPage`/`totalPages`/`pageSize`                                                            |
| `AngajamenteParams`          | `AngajamenteFilterInput`                                                                      | Filter-based (period interval, not single year/month); much richer filtering                                                                            |

### 15.2 API Functions (`src/lib/api/angajamente.ts`)

| Current Function                        | Replace With                          | Notes                                          |
| --------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| `getAngajamenteData(params)`            | GraphQL `angajamenteLineItems` query  | Use `graphqlRequest<T>()`, cursor pagination   |
| `getAngajamenteSummary(cui, year)`      | GraphQL `angajamenteSummary` query    | Returns union type; handle `__typename`        |
| `getAngajamentePipeline(cui, year)`     | Compute client-side from summary      | No server endpoint; derive from summary fields |
| `getAngajamenteByFunctional(cui, year)` | GraphQL `angajamenteAggregated` query | Set metric to desired field                    |

### 15.3 Hooks (`src/hooks/useAngajamenteData.ts`)

All hooks need rewriting to use GraphQL queries. Follow the pattern in `src/lib/api/entity-analytics.ts`:

| Current Hook                            | New Hook Pattern                                 | Query Keys                                        |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `useAngajamenteSummary(cui, year)`      | `useAngajamenteSummary(filter)`                  | `['angajamenteSummary', filter]`                  |
| `useAngajamenteData(params)`            | `useAngajamenteLineItems(filter, limit, offset)` | `['angajamenteLineItems', filter, limit, offset]` |
| `useAngajamentePipeline(cui, year)`     | Derive from `useAngajamenteSummary`              | Use `select` option to compute pipeline stages    |
| `useAngajamenteByFunctional(cui, year)` | `useAngajamenteAggregated(input)`                | `['angajamenteAggregated', input]`                |

### 15.4 New Hooks to Add

| Hook                              | Purpose                         | Query                   |
| --------------------------------- | ------------------------------- | ----------------------- |
| `useAngajamenteAnalytics(inputs)` | Time-series chart data          | `angajamenteAnalytics`  |
| `useCommitmentVsExecution(input)` | Commitment/execution comparison | `commitmentVsExecution` |

### 15.5 Key Naming Changes

The mock uses **camelCase** field names; the real API uses **snake_case**:

| Mock Field           | API Field              |
| -------------------- | ---------------------- |
| `crediteAngajament`  | `credite_angajament`   |
| `crediteButetare`    | `credite_bugetare`     |
| `platiTrezor`        | `plati_trezor`         |
| `receptiiTotale`     | `receptii_totale`      |
| `receptiiNeplatite`  | `receptii_neplatite`   |
| `functionalCode`     | `functional_code`      |
| `economicCode`       | `economic_code`        |
| `monthlyPlatiTrezor` | `monthly_plati_trezor` |

> **Note**: Also fix the typo: mock uses `crediteButetare` (typo) → API uses `credite_bugetare` (correct).

### 15.6 Pipeline Stage Computation (Client-Side)

Since there's no server endpoint for pipeline stages, compute them from quarterly/annual summary:

```typescript
function computePipelineStages(
  summary: AngajamenteQuarterlySummary,
): PipelineStage[] {
  const baseValue = summary.credite_bugetare_definitive;
  const pct = (v: number) => (baseValue > 0 ? (v / baseValue) * 100 : 0);
  const status = (p: number) =>
    p >= 90 ? "healthy" : p >= 70 ? "warning" : "danger";

  return [
    {
      id: "credits",
      label: "Credite Bugetare",
      value: summary.credite_bugetare_definitive,
      percentage: 100,
      status: "healthy",
    },
    {
      id: "commitments",
      label: "Angajamente",
      value: summary.credite_angajament,
      percentage: Math.round(pct(summary.credite_angajament)),
      status: status(pct(summary.credite_angajament)),
    },
    {
      id: "receipts",
      label: "Receptii",
      value: summary.receptii_totale,
      percentage: Math.round(pct(summary.receptii_totale)),
      status: status(pct(summary.receptii_totale)),
    },
    {
      id: "payments",
      label: "Plati",
      value: summary.total_plati,
      percentage: Math.round(pct(summary.total_plati)),
      status: status(pct(summary.total_plati)),
    },
  ];
}
```
