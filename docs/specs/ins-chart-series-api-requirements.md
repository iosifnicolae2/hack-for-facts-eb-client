# INS Chart Series API Requirements (GraphQL-first)

## 1. Purpose

Define backend requirements for a future INS chart analytics API that is fully compatible with the client `AnalyticsSeries` contract used by chart series (`line-items`, `static`, `custom`, calculations).

This document assumes the current client implementation uses existing INS GraphQL queries and client-side mapping, and proposes a future server-side contract that can replace that mapping without chart schema changes.

## 2. Current State Contract (Implemented)

### 2.1 Available GraphQL operations

- `insDatasets(filter, limit, offset)`
- `insDataset(code)`
- `insObservations(datasetCode, filter, limit, offset)`
- `insUatIndicators(...)`
- `insCompare(...)`
- `insUatDashboard(...)`

### 2.2 Current constraints relevant to charts

- Observation values are returned as `String` and must be parsed client-side.
- `insObservations` can return multiple rows for the same period because of dimension combinations.
- Classification filtering requires client-side refinement for strict `AND by type` semantics.
- Pagination must be handled client-side for complete chart series.
- Unit consistency is not guaranteed by API; clients must guard against mixed units.
- Time ordering is not guaranteed to match chart rendering expectations without explicit sorting.

### 2.3 Current client-side workarounds

- Reduce observations per period (`sum|average|first`) on client.
- Apply strict classification filtering by `classificationSelections` map.
- Enforce single-unit series; warn and drop invalid mixed-unit output.
- Enforce single periodicity per calculated chart composition.

## 3. Data Model Mapping Requirements

The future API must be grounded in existing INS schema:

- `matrices`
- `matrix_dimensions`
- `matrix_nom_items`
- `statistics`
- `statistic_classifications`
- `time_periods`
- `territories`
- `classification_types`
- `classification_values`
- `units_of_measure`

### 3.1 Required exposure guarantees

1. Deterministic dimension metadata.
- Source: `matrix_dimensions`, `classification_types`.
- Must expose stable `dimension index`, `type`, `classification type code`, labels.

2. Deterministic dimension value identity.
- Source: `matrix_nom_items` + canonical tables.
- Must expose stable value code per dimension option (`territory.code`, `territory.siruta_code`, `classification_values.code`, `units_of_measure.code`, `time_periods.iso_period`).

3. Deterministic time identity.
- Source: `time_periods`.
- Must expose `iso_period`, `periodicity`, and sortable keys (`year`, `quarter`, `month`).

4. Deterministic value + unit.
- Source: `statistics.value`, `units_of_measure`.
- Must provide parsed numeric value or explicit parse-safe string + conversion contract.

5. Deterministic classification expansion.
- Source: `statistic_classifications`, `classification_values`, `classification_types`.
- Must support strict filtering semantics documented below.

## 4. Proposed Future GraphQL Contract

## 4.1 New query

```graphql
insChartAnalytics(inputs: [InsChartSeriesInput!]!): [AnalyticsSeries!]!
```

### 4.2 Input shape

```graphql
input InsChartSeriesInput {
  seriesId: ID!
  datasetCode: String!
  periodicity: InsPeriodicity
  periodRange: InsPeriodRangeInput

  territoryCodes: [String!]
  sirutaCodes: [String!]
  unitCodes: [String!]

  # AND between entries; OR inside each codes array
  classificationSelections: [InsClassificationSelectionInput!]

  hasValue: Boolean = true
  aggregation: InsAggregationMode = SUM
}

input InsClassificationSelectionInput {
  typeCode: String!
  codes: [String!]!
}

enum InsAggregationMode {
  SUM
  AVERAGE
  FIRST
}
```

### 4.3 Output shape

Return existing shared chart contract:

```graphql
type AnalyticsSeries {
  seriesId: String!
  xAxis: Axis!
  yAxis: Axis!
  data: [AnalyticsSeriesPoint!]!
}
```

No contract changes in client chart renderer are required.

## 5. Behavioral Requirements

### 5.1 Periodicity and period ordering

1. A single output series must have one periodicity only.
2. Output points must be strictly ordered ascending by period.
3. `xAxis.unit` must be one of `year|quarter|month` (normalized lowercase).

### 5.2 Classification semantics

1. `classificationSelections` applies `AND` across `typeCode` entries.
2. Within each `typeCode`, `codes` applies `OR`.
3. Filtering behavior must be equivalent to client strict semantics.

### 5.3 Aggregation semantics

When multiple observations map to same period:

- `SUM`: arithmetic sum of all matching values.
- `AVERAGE`: arithmetic mean of matching values.
- `FIRST`: first deterministic row by stable ordering rule:
  - `time_period` ascending
  - `territory.code` ascending
  - `unit.code` ascending
  - classification tuple ascending

### 5.4 Unit consistency

1. If result has mixed units after filtering, API must either:
- reject with domain error `MIXED_UNITS`, or
- include warnings metadata and return empty data points.
2. Preferred: explicit error for predictable client handling.

## 6. Error and Warning Model

### 6.1 Required error codes

- `INVALID_PERIOD_RANGE`
- `PERIODICITY_MISMATCH`
- `MIXED_UNITS`
- `DATASET_NOT_FOUND`
- `DIMENSION_FILTER_INVALID`
- `LIMIT_EXCEEDED`

### 6.2 Optional warnings payload

If the API supports partial/non-fatal issues:

```graphql
type AnalyticsWarning {
  code: String!
  message: String!
  seriesId: String!
  details: JSON
}
```

Warnings should include dropped points count, null/invalid values count, and periodicity auto-selection details.

## 7. Non-Functional Requirements

### 7.1 Performance

- P95 latency target per `seriesId` input:
  - <= 300ms for <= 5k raw rows.
  - <= 1000ms for <= 50k raw rows.

### 7.2 Pagination policy

`insChartAnalytics` should be non-paginated at output level (already aggregated).
Raw-row pagination remains internal implementation detail.

### 7.3 Limits

- Max `inputs` batch size: 50.
- Max period span defaults:
  - annual: 100 years
  - quarterly: 200 quarters
  - monthly: 600 months

### 7.4 Caching

Cache key must include full normalized filter payload and reducer mode.

## 8. Backward Compatibility and Migration

1. Keep existing INS GraphQL operations unchanged.
2. Introduce `insChartAnalytics` as additive API.
3. Client migration path:
- current mapper layer in client remains adapter boundary.
- switch adapter implementation from `insObservations` composition to `insChartAnalytics` when ready.
- chart schema (`ins-series`) and renderer contracts remain unchanged.

## 9. Acceptance Criteria (Backend Readiness)

Backend is ready for client migration when all conditions hold:

1. Conformance to `AnalyticsSeries` output for annual/quarterly/monthly datasets.
2. Deterministic ordering validated for all periodicities.
3. Aggregation modes (`SUM|AVERAGE|FIRST`) match reference vectors.
4. Classification semantics (`AND by type, OR within type`) match reference vectors.
5. Mixed-unit behavior is deterministic and explicitly documented.
6. Batch query with multiple `seriesId`s is stable and isolated by series.

## 10. Reference Test Vectors

Use these as contract tests:

1. Annual series, same period duplicates, `SUM`.
2. Annual series, same period duplicates, `AVERAGE`.
3. Monthly series with sparse periods and constants in downstream calculations.
4. Quarterly series multi-year ordering.
5. Classification selections requiring `AND` across two type codes.
6. Mixed-unit dataset slice returning deterministic error.

