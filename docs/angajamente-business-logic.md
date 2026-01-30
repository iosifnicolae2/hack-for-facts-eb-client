# Angajamente Bugetare — Business Logic Specification

## Document v1.0

---

## 1. What is Angajamente Bugetare?

**Angajamente Bugetare** (Budget Commitments) is the Romanian public accounting system that tracks the full lifecycle of public spending — from when money is authorized to when it is actually paid out of the treasury.

Every public institution in Romania that receives budget funds must report angajamente data. This data is published through the Romanian Ministry of Finance (MFP) reporting system and tracks how allocated funds flow through four stages before becoming actual payments.

### 1.1 Why It Matters

Budget execution data (Executie Bugetara) tells you **how much was spent**. Angajamente data tells you **the full story**: how much was authorized, how much was committed, how much was received (goods/services delivered), how much was actually paid, and crucially — how much remains unpaid (arrears).

This makes angajamente data essential for:

- **Transparency**: Citizens can see whether institutions spend within authorized limits
- **Arrears detection**: Unpaid receipts (receptii neplatite) indicate potential arrears
- **Efficiency analysis**: Comparing commitment rates and execution rates across institutions
- **Budget discipline**: Tracking whether initial vs. definitive allocations diverge significantly

---

## 2. The 4-Stage Pipeline

Public spending in Romania follows a strict pipeline. Each stage is a prerequisite for the next:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   CREDITS    │───▶│ COMMITMENTS  │───▶│  RECEIPTS    │───▶│  PAYMENTS    │
│  (Credite    │    │ (Angajamente)│    │ (Receptii)   │    │  (Plati)     │
│   Bugetare)  │    │              │    │              │    │              │
│              │    │  Authority   │    │ Goods/svc    │    │  Treasury    │
│  Allocation  │    │  to spend    │    │ delivered    │    │  disbursement│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       100%              ~98%               ~92%                ~90%
```

### Stage 1: Credits (Credite Bugetare)

**What**: The maximum amount an institution is authorized to spend in a budget period.

**Key fields**:
| Field | Meaning |
|-------|---------|
| `credite_bugetare_initiale` | Initial allocation at start of year |
| `credite_bugetare_definitive` | Final allocation after rectifications |
| `credite_bugetare` | Current approved budget credits (YTD) |
| `credite_bugetare_disponibile` | Remaining available budget credits |

**Business rule**: `credite_bugetare_disponibile = credite_bugetare - credite_angajament`

### Stage 2: Commitments (Angajamente / Credite de Angajament)

**What**: Legal obligations entered into by the institution (contracts, employment agreements, purchase orders).

**Key fields**:
| Field | Meaning |
|-------|---------|
| `credite_angajament_initiale` | Initial commitment authority |
| `credite_angajament_definitive` | Final commitment authority after rectifications |
| `credite_angajament` | Total commitments made (YTD) |
| `credite_angajament_disponibile` | Remaining commitment authority |
| `limita_credit_angajament` | Maximum commitment limit for the period |

**Business rule**: Commitments cannot exceed `limita_credit_angajament`.

### Stage 3: Receipts (Receptii)

**What**: Goods or services that have been delivered and accepted by the institution.

**Key fields**:
| Field | Meaning |
|-------|---------|
| `receptii_totale` | Total value of goods/services received (YTD) |
| `receptii_neplatite` | Receipts not yet paid = potential arrears |
| `receptii_neplatite_change` | Monthly change in unpaid receipts |

**Business rule**: `receptii_neplatite = receptii_totale - total_plati` (approximately)

### Stage 4: Payments (Plati)

**What**: Actual money disbursed from the treasury.

**Key fields**:
| Field | Meaning |
|-------|---------|
| `plati_trezor` | Payments through the treasury system |
| `plati_non_trezor` | Payments outside the treasury (rare) |
| `total_plati` | `plati_trezor + plati_non_trezor` |

### Pipeline Health Indicators

A healthy pipeline shows:

- **Credits → Commitments**: ~95-100% (institutions use most of their authority)
- **Commitments → Receipts**: ~85-95% (most committed goods are delivered)
- **Receipts → Payments**: ~95-100% (delivered goods are promptly paid)

Anomalies:

- **Low commitment rate** (<80%): Institution may have capacity/planning issues
- **High receipts vs. low payments**: Growing arrears (a serious red flag)
- **Credits significantly > Commitments**: Over-allocation or poor planning

---

## 3. Metrics Reference

The API exposes **14 metrics** through the `AngajamenteMetric` enum. They are grouped by pipeline stage and by period availability.

### 3.1 Metrics Available at ALL Period Types (MONTH, QUARTER, YEAR)

These metrics are derived from monthly reporting and are available at any granularity:

| Metric                      | Romanian Name               | Description                       | Pipeline Stage |
| --------------------------- | --------------------------- | --------------------------------- | -------------- |
| `CREDITE_ANGAJAMENT`        | Credite de angajament       | Total commitment credits used YTD | Commitments    |
| `PLATI_TREZOR`              | Plati prin trezorerie       | Treasury payments made            | Payments       |
| `PLATI_NON_TREZOR`          | Plati non-trezorerie        | Non-treasury payments (rare)      | Payments       |
| `RECEPTII_TOTALE`           | Receptii totale             | Total goods/services received     | Receipts       |
| `RECEPTII_NEPLATITE_CHANGE` | Variatie receptii neplatite | Monthly change in unpaid receipts | Receipts       |

### 3.2 Metrics Available ONLY for QUARTER and YEAR

These metrics come from quarterly/annual reporting and are NOT available at monthly granularity:

| Metric                           | Romanian Name                   | Description                      | Pipeline Stage |
| -------------------------------- | ------------------------------- | -------------------------------- | -------------- |
| `LIMITA_CREDIT_ANGAJAMENT`       | Limita creditului de angajament | Maximum commitment limit         | Credits        |
| `CREDITE_BUGETARE`               | Credite bugetare                | Approved budget credits          | Credits        |
| `CREDITE_ANGAJAMENT_INITIALE`    | Credite angajament initiale     | Initial commitment authority     | Commitments    |
| `CREDITE_BUGETARE_INITIALE`      | Credite bugetare initiale       | Initial budget credits           | Credits        |
| `CREDITE_ANGAJAMENT_DEFINITIVE`  | Credite angajament definitive   | Final commitment authority       | Commitments    |
| `CREDITE_BUGETARE_DEFINITIVE`    | Credite bugetare definitive     | Final budget credits             | Credits        |
| `CREDITE_ANGAJAMENT_DISPONIBILE` | Credite angajament disponibile  | Remaining commitment room        | Commitments    |
| `CREDITE_BUGETARE_DISPONIBILE`   | Credite bugetare disponibile    | Remaining budget room            | Credits        |
| `RECEPTII_NEPLATITE`             | Receptii neplatite (sold)       | Absolute unpaid receipts balance | Receipts       |

### 3.3 Special Metric: RECEPTII_NEPLATITE vs. RECEPTII_NEPLATITE_CHANGE

These two metrics are related but distinct:

- **`RECEPTII_NEPLATITE`** (QUARTER/YEAR only): The absolute balance of unpaid receipts at the end of the period. This is a stock value — it tells you "how much is owed right now."
- **`RECEPTII_NEPLATITE_CHANGE`** (MONTH available): The monthly delta — how much the unpaid balance increased or decreased this month. This is a flow value.

When analyzing arrears trends, use `RECEPTII_NEPLATITE_CHANGE` at monthly granularity, or `RECEPTII_NEPLATITE` at quarterly/yearly granularity.

---

## 4. Report Types

Romanian budget reporting produces three levels of aggregation:

| Report Type              | GraphQL Enum           | Description                              | Use Case                                                      |
| ------------------------ | ---------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Principal Aggregated** | `PRINCIPAL_AGGREGATED` | Aggregated at top-level budget authority | Default for most queries. Best for city/county-level analysis |
| **Secondary Aggregated** | `SECONDARY_AGGREGATED` | Aggregated at secondary budget authority | When analyzing sub-institutions                               |
| **Detailed**             | `DETAILED`             | Line-item detail by classification       | Deepest drill-down by functional/economic code                |

### When to Use Each

- **Dashboard views, summary cards, pipeline**: Use `PRINCIPAL_AGGREGATED`
- **Drill-down by functional classification**: Use `DETAILED`
- **Comparing sub-institutions under a parent**: Use `SECONDARY_AGGREGATED`
- **commitmentVsExecution comparison**: REQUIRES `PRINCIPAL_AGGREGATED` (maps to execution reports at same level)

> **Important**: The `commitmentVsExecution` query and `angajamenteLineItems` query require `report_type` to be set. Omitting it may produce empty or incorrect results.

---

## 5. Period Granularity

### 5.1 How Period Selection Works

Every query requires a `report_period` with:

- **type**: `MONTH`, `QUARTER`, or `YEAR`
- **selection**: Either an interval (start/end) or explicit dates

**Format examples**:
| Period Type | Date Format | Example |
|------------|-------------|---------|
| MONTH | `YYYY-MM` | `2024-01`, `2024-12` |
| QUARTER | `YYYY-QN` | `2024-Q1`, `2024-Q4` |
| YEAR | `YYYY` | `2024`, `2023` |

### 5.2 Granularity Constraints

The underlying data is fundamentally **quarterly**. Monthly data is available only for a subset of metrics (the 5 monthly metrics listed above). This means:

- **Monthly queries**: Return only 5 metrics + monthly deltas. Fields like `credite_bugetare`, `execution_rate`, etc. are NOT available.
- **Quarterly queries**: Return all 13 metrics + computed rates. This is the native granularity.
- **Yearly queries**: Return all 13 metrics + computed rates. Data is aggregated from quarterly reports.

### 5.3 Metric Availability Matrix

| Metric                         | MONTH | QUARTER | YEAR |
| ------------------------------ | :---: | :-----: | :--: |
| CREDITE_ANGAJAMENT             |  Yes  |   Yes   | Yes  |
| PLATI_TREZOR                   |  Yes  |   Yes   | Yes  |
| PLATI_NON_TREZOR               |  Yes  |   Yes   | Yes  |
| RECEPTII_TOTALE                |  Yes  |   Yes   | Yes  |
| RECEPTII_NEPLATITE_CHANGE      |  Yes  |   No    |  No  |
| LIMITA_CREDIT_ANGAJAMENT       |  No   |   Yes   | Yes  |
| CREDITE_BUGETARE               |  No   |   Yes   | Yes  |
| CREDITE_ANGAJAMENT_INITIALE    |  No   |   Yes   | Yes  |
| CREDITE_BUGETARE_INITIALE      |  No   |   Yes   | Yes  |
| CREDITE_ANGAJAMENT_DEFINITIVE  |  No   |   Yes   | Yes  |
| CREDITE_BUGETARE_DEFINITIVE    |  No   |   Yes   | Yes  |
| CREDITE_ANGAJAMENT_DISPONIBILE |  No   |   Yes   | Yes  |
| CREDITE_BUGETARE_DISPONIBILE   |  No   |   Yes   | Yes  |
| RECEPTII_NEPLATITE             |  No   |   Yes   | Yes  |

---

## 6. Normalization, Currency & Inflation

### 6.1 Normalization Modes

All monetary values can be normalized to enable cross-entity comparison:

| Mode           | GraphQL Value | Description                    | When to Use                                  |
| -------------- | ------------- | ------------------------------ | -------------------------------------------- |
| **Total**      | `total`       | Raw absolute values            | Default. Comparing a single entity over time |
| **Per Capita** | `per_capita`  | Divided by entity's population | Comparing entities of different sizes        |
| **% of GDP**   | `percent_gdp` | As percentage of national GDP  | Macro-level analysis                         |

Also available via combined normalization+currency:

- `total_euro` = total amounts converted to EUR
- `per_capita_euro` = per-capita amounts in EUR

### 6.2 Currency Conversion

| Currency | Description                               |
| -------- | ----------------------------------------- |
| `RON`    | Romanian Leu (default)                    |
| `EUR`    | Euro (converted using NBR exchange rates) |
| `USD`    | US Dollar                                 |

Currency conversion uses period-appropriate exchange rates from the National Bank of Romania (BNR).

### 6.3 Inflation Adjustment

When `inflation_adjusted: true`, values are adjusted to a base year using CPI data. This enables real (constant-price) comparisons across years.

### 6.4 Period Growth

When `show_period_growth: true`, each data point includes a `growth_percent` field showing the percentage change from the previous period. This applies to analytics and commitmentVsExecution queries.

---

## 7. Transfer Exclusion

### What Are Transfers?

In Romanian public finance, money flows between budget levels (e.g., state budget → local budgets). These inter-governmental transfers appear as both income and expense, which can inflate totals if counted on both sides.

### How `exclude_transfers` Works

- **Default: `true`** — Transfers are excluded from totals to avoid double-counting
- **Set to `false`** — Include transfers (useful when analyzing a single entity's complete cash flow)

Transfer exclusion is implemented at the database level using classification code filtering.

---

## 8. Commitment vs. Execution Comparison

The `commitmentVsExecution` query joins angajamente data with execution (Executie Bugetara) data to reveal discrepancies.

### 8.1 What It Shows

For each time period, it compares:

- **Commitment value**: Amount from angajamente reports (default metric: `PLATI_TREZOR`)
- **Execution value**: Amount from execution reports (matched metric: approved credits/actual spending)
- **Difference**: `commitment_value - execution_value`
- **Difference percent**: `(difference / execution_value) * 100`

### 8.2 How to Interpret

| Scenario                          | Meaning                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `difference ≈ 0`                  | Both reporting systems agree (healthy)                      |
| `difference > 0`                  | Commitments exceed execution (possible reporting lag)       |
| `difference < 0`                  | Execution exceeds commitments (possible data quality issue) |
| High `unmatched_commitment_count` | Periods exist in angajamente but not in execution           |
| High `unmatched_execution_count`  | Periods exist in execution but not in angajamente           |

### 8.3 Computed Rates

Available in quarterly and annual summaries:

- **`execution_rate`**: `(plati_trezor / credite_bugetare) * 100` — What percentage of the budget was actually spent
- **`commitment_rate`**: `(credite_angajament / credite_bugetare) * 100` — What percentage of the budget was committed

Healthy ranges:

- `execution_rate` 85-100%: Good budget execution
- `execution_rate` < 70%: Poor absorption / planning issues
- `commitment_rate` > 100%: Over-commitment (red flag)
- `commitment_rate` < 80%: Under-utilization

### 8.4 Data Alignment Caveat

Angajamente data is fundamentally **quarterly** while execution data is **monthly**. When comparing at monthly granularity:

- Many periods will appear as "unmatched" because angajamente doesn't have monthly-level data for most metrics
- **Recommended**: Use QUARTER or YEAR granularity for commitmentVsExecution queries to get meaningful comparisons

---

## 9. Anomalies

Line items may be flagged with anomaly types indicating data quality issues:

### YTD_ANOMALY

**What**: Year-to-date values decreased compared to the previous month, which should not happen for cumulative metrics.

**Example**: If `plati_trezor` (YTD payments) was 1,000,000 in March but 950,000 in April, this is flagged as `YTD_ANOMALY`.

**Cause**: Usually accounting corrections or report resubmissions. The negative monthly delta values are the indicator.

**Impact on analysis**: These rows are still included in totals but should be visually flagged in the UI to alert users that the data may reflect corrections.

### MISSING_LINE_ITEM

**What**: A line item that existed in a previous period but is absent in the current period.

**Example**: An entity reported functional code `51.01.03` in January through March but it disappeared in April.

**Cause**: Classification restructuring, entity reorganization, or reporting error.

**Impact on analysis**: Creates gaps in time series. The UI should indicate discontinuities.

---

## 10. Data Constraints & Known Limitations

### 10.1 Performance

| Query                   | Typical Response Time | Recommendation                                                              |
| ----------------------- | --------------------- | --------------------------------------------------------------------------- |
| `angajamenteSummary`    | 1-5 seconds           | Limit to 50 rows; use filters                                               |
| `angajamenteLineItems`  | 2-10 seconds          | Always set `report_type`; paginate                                          |
| `angajamenteAnalytics`  | 2-8 seconds           | Limit series count; use quarterly                                           |
| `angajamenteAggregated` | 1-5 seconds           | Reasonable with limits                                                      |
| `commitmentVsExecution` | 10-45 seconds         | Use QUARTER/YEAR, not MONTH; always set `report_type: PRINCIPAL_AGGREGATED` |

### 10.2 Data Availability

- **Coverage**: From ~2019 onwards (varies by entity)
- **Reporting lag**: Data is typically available 1-2 months after the reporting period
- **Not all entities report**: Smaller entities may not submit angajamente reports
- **Quarterly snapshots**: Full financial picture (all 14 metrics) only at quarter boundaries

### 10.3 Maximum Pagination

- Default limit: 50
- Maximum limit: 1,000
- For large result sets, always paginate rather than requesting all data at once
