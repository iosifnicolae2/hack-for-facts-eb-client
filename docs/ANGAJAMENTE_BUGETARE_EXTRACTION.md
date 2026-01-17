# Angajamente Bugetare (Budget Commitments) Extraction Module

## Table of Contents

1. [Overview](#1-overview)
2. [Data Structure](#2-data-structure)
3. [XML Parsing Strategy](#3-xml-parsing-strategy)
4. [NIVEL-Based Data Selection](#4-nivel-based-data-selection)
5. [Data Extraction Process](#5-data-extraction-process)
6. [Validation Strategy](#6-validation-strategy)
7. [Monthly Difference Computation](#7-monthly-difference-computation)
8. [Anomaly Detection](#8-anomaly-detection)
9. [Output Format](#9-output-format)
10. [Exported Functions](#10-exported-functions)
11. [Usage](#11-usage)
12. [Integration Guide](#12-integration-guide)

---

## 1. Overview

The Angajamente Bugetare extraction module (`src/extract/angajamente-bugetare.ts`) processes XML documents containing budget commitment reports from ANAF. These reports track budget allocations, commitments, and payments for Romanian public entities.

### 1.1 Report Type

| Constant | Value |
|----------|-------|
| `ANGAJAMENTE_BUGETARE_REPORT_TYPE` | "Executie – Angajamente bugetare" |

### 1.2 Key Differences from Budget Execution Reports

| Aspect | Budget Execution | Budget Commitments |
|--------|------------------|-------------------|
| Report Type | "Executie bugetara..." | "Executie – Angajamente bugetare" |
| Data Focus | Income/Expenses (vn/ch) | Credits, Commitments, Payments |
| Line Item Type | `type: "vn" \| "ch"` | No type field (all are commitments) |
| Key Fields | `ytdAmount`, `monthlyAmount` | `platiTrezor`, `receptiiTotale`, `crediteAngajament`, etc. |
| NIVEL Structure | Single format detection | NIVEL=0,1,2 hierarchy |

### 1.3 Key Concepts

| Term | Description |
|------|-------------|
| **Credite Angajament** | Commitment credits - authorized spending limits |
| **Credite Bugetare** | Budget credits - actual budget allocations |
| **Plati Trezor** | Treasury payments - payments made through treasury |
| **Receptii Totale** | Total receipts - goods/services received |
| **NIVEL** | Hierarchy level in XML (0=summary, 1=aggregated, 2=by program) |
| **PROGRAM_BUGETAR** | Budget program code (only in NIVEL=2) |

---

## 2. Data Structure

### 2.1 AngajamenteLineItem Interface

**File:** `src/interfaces.ts:180-209`

```typescript
interface AngajamenteLineItem {
  // Identification
  key: string;                    // Composite key for matching across months
  date: string;                   // Report date
  functionalCode: string;         // Functional classification (e.g., "51.01.03")
  economicCode?: string;          // Economic classification (e.g., "10.01.01")
  fundingSource?: string;         // Funding source (e.g., "A")

  // YTD Budget Fields
  crediteAngajament: number;           // Commitment credits
  limitaCreditAngajament: number;      // Commitment credit limit
  crediteButetare: number;             // Budget credits
  crediteAngajamentInitiale: number;   // Initial commitment credits
  crediteButetareInitiale: number;     // Initial budget credits
  crediteAngajamentDefinitive: number; // Final commitment credits
  crediteButetareDefinitive: number;   // Final budget credits
  crediteAngajamentDisponibile: number; // Available commitment credits
  crediteButetareDisponibile: number;  // Available budget credits
  
  // YTD Payment/Receipt Fields
  receptiiTotale: number;         // Total receipts
  platiTrezor: number;            // Treasury payments
  platiNonTrezor: number;         // Non-treasury payments
  receptiiNeplatite: number;      // Unpaid receipts

  // Computed Monthly Values
  monthlyPlatiTrezor: number | null;
  monthlyReceptiiTotale: number | null;
  monthlyCrediteAngajament: number | null;

  // Data Quality
  anomaly?: 'YTD_ANOMALY' | 'MISSING_LINE_ITEM';
}
```

### 2.2 ParsedAngajamenteData Interface

**File:** `src/extract/angajamente-bugetare.ts:117-134`

```typescript
interface ParsedAngajamenteData {
  cui: string;                    // Entity CUI
  entityName?: string;            // Entity name
  sectorType?: string;            // Budget sector description
  reportingDate: string;          // Report date (e.g., "31-JAN-2025")
  year: string;                   // 4-digit year
  month: string;                  // 2-digit month
  budgetSector: string;           // Budget sector code
  filePath: string;               // Source file path
  xmlHash: string;                // SHA-256 of XML content
  reportState: string;            // P_STARE - "Final" or other
  lineItems: AngajamenteLineItem[];
  nameLookups: {
    functional: Record<string, string>;
    economic: Record<string, string>;
    fundingSource: Record<string, string>;
  };
}
```

---

## 3. XML Parsing Strategy

### 3.1 Parser Configuration

**File:** `src/extract/angajamente-bugetare.ts:12-21`

```typescript
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: true,
  numberParseOptions: {
    hex: false,
    leadingZeros: false,
  },
});
```

### 3.2 Sample XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DATA_DS>
  <!-- Header -->
  <P_ZI>31-JAN-2025</P_ZI>           <!-- Report date -->
  <P_SECB>02</P_SECB>                <!-- Budget sector -->
  <P_BUGIP>3337729</P_BUGIP>         <!-- Entity CUI (fallback) -->
  <P_STARE>Final</P_STARE>           <!-- Report state -->
  
  <!-- Entity Info -->
  <G_5>
    <COD_FISCAL>3337729</COD_FISCAL>  <!-- Primary CUI source -->
    <NUME>COMUNA BOTESTI</NUME>
  </G_5>
  
  <!-- Sector Type -->
  <G_6>
    <TIP_SECTOR>Bugetul local (administratie locala)</TIP_SECTOR>
  </G_6>
  
  <!-- NIVEL=0: Summary/Header -->
  <G_4>
    <NIVEL>0</NIVEL>
    <G_10><G_11>...</G_11></G_10>
  </G_4>
  
  <!-- NIVEL=1: Aggregated Data (USE THIS) -->
  <G_4>
    <NIVEL>1</NIVEL>
    <G_10>
      <G_11>
        <SURSA_SURSADEN>A-Integral de la buget</SURSA_SURSADEN>
        <DENUMIRE_INDICATOR_FUNCTIONAL>Autoritati executive</DENUMIRE_INDICATOR_FUNCTIONAL>
        <COD_FUNCTIONAL>510103</COD_FUNCTIONAL>
        <DENUMIRE_INDICATOR_ECONOMIC>Salarii de baza</DENUMIRE_INDICATOR_ECONOMIC>
        <COD_ECONOMIC>100101</COD_ECONOMIC>
        <CREDITEANGAJAMENT>1124450</CREDITEANGAJAMENT>
        <LIMITACREDITANGAJAMENT>1124450</LIMITACREDITANGAJAMENT>
        <CREDITEBUGETARE>1124450</CREDITEBUGETARE>
        <CREDITEANGAJAMENTINITIALE>0</CREDITEANGAJAMENTINITIALE>
        <CREDITEBUGETAREINITIALE>0</CREDITEBUGETAREINITIALE>
        <CREDITEANGAJAMENTDEFINITIVE>110000</CREDITEANGAJAMENTDEFINITIVE>
        <CREDITEBUGETAREDEFINITIVE>110000</CREDITEBUGETAREDEFINITIVE>
        <CREDITEANGAJAMENTDISPONIBILE>1014450</CREDITEANGAJAMENTDISPONIBILE>
        <CREDITEBUGETAREDISPONIBILE>1014450</CREDITEBUGETAREDISPONIBILE>
        <RECEPTIITOTALE>110000</RECEPTIITOTALE>
        <PLATITREZOR>102313</PLATITREZOR>
        <PLATINONTREZOR>0</PLATINONTREZOR>
        <RECEPTIINEPLATITE>7687</RECEPTIINEPLATITE>
      </G_11>
      <!-- More G_11 items... -->
    </G_10>
  </G_4>
  
  <!-- NIVEL=2: Same data broken down by PROGRAM_BUGETAR (SKIP) -->
  <G_4>
    <NIVEL>2</NIVEL>
    <!-- Duplicate data with PROGRAM_BUGETAR breakdown -->
  </G_4>
</DATA_DS>
```

---

## 4. NIVEL-Based Data Selection

### 4.1 NIVEL Hierarchy

| NIVEL | Description | Use |
|-------|-------------|-----|
| 0 | Summary/Header | Skip - contains totals only |
| 1 | Aggregated data | **USE** - no program breakdown |
| 2 | Program breakdown | Skip - same data as NIVEL=1 but split by PROGRAM_BUGETAR |

### 4.2 Selection Logic

**File:** `src/extract/angajamente-bugetare.ts:248-271`

```typescript
// Find G_4 with NIVEL=1 only
const g4Array = Array.isArray(data.G_4) ? data.G_4 : (data.G_4 ? [data.G_4] : []);
const nivel1Group = g4Array.find((g: any) => g.NIVEL === 1 && g.G_10?.G_11);

// Handle empty reports
if (!nivel1Group) {
  console.warn(`No G_4 with NIVEL=1 found - treating as empty report`);
  return { ...baseData, lineItems: [] };
}
```

### 4.3 Subtotal Filtering

NIVEL=1 contains both detail rows and subtotal rows. Subtotals are identified by:
- Missing or zero `COD_FUNCTIONAL`
- Missing or zero `COD_ECONOMIC`
- Descriptions like "510103 TOTAL pentru sursa de finantare: A-Integral de la buget"

**Filter Logic:** `src/extract/angajamente-bugetare.ts:265-269`

```typescript
const items = rawItems.filter((item: any) => {
  const hasValidFunctionalCode = item.COD_FUNCTIONAL && Number(item.COD_FUNCTIONAL) !== 0;
  const hasValidEconomicCode = item.COD_ECONOMIC && Number(item.COD_ECONOMIC) !== 0;
  return hasValidFunctionalCode && hasValidEconomicCode;
});
```

---

## 5. Data Extraction Process

### 5.1 Process Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  INPUT: XML File Path                                                       │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Parse XML                                                          │
│  - Read file content                                                        │
│  - Compute SHA-256 hash                                                     │
│  - Parse with fast-xml-parser                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Extract Header Info                                                │
│  - P_ZI → reportingDate, year, month                                        │
│  - P_SECB → budgetSector                                                    │
│  - P_STARE → reportState                                                    │
│  - G_5.COD_FISCAL or P_BUGIP → cui                                          │
│  - G_5.NUME → entityName                                                    │
│  - G_6.TIP_SECTOR → sectorType                                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Check Report State                                                 │
│  - Skip if P_STARE !== "Final"                                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Select NIVEL=1 Data                                                │
│  - Find G_4 where NIVEL === 1                                               │
│  - Return empty if not found (empty report)                                 │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Extract Line Items                                                 │
│  - Filter out subtotal rows (no valid codes)                                │
│  - Parse classification codes (510103 → 51.01.03)                           │
│  - Parse funding source (A-Integral de la buget → A)                        │
│  - Extract all numeric fields                                               │
│  - Build name lookups                                                       │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Validate                                                           │
│  - Count items via regex (independent of parser)                            │
│  - Sum key fields via regex                                                 │
│  - Compare with parsed values                                               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OUTPUT: ParsedAngajamenteData                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 CUI Extraction with Fallback

**File:** `src/extract/angajamente-bugetare.ts:239-243`

```typescript
// Primary: G_5.COD_FISCAL
// Fallback 1: P_BUGIP
// Fallback 2: P_CUI
const cui = String(data.G_5?.COD_FISCAL || data.P_BUGIP || data.P_CUI || "");
if (!cui) {
  throw new Error(`No CUI found in ${filePath}`);
}
```

### 5.3 Classification Code Parsing

**File:** `src/extract/angajamente-bugetare.ts:179-184`

```typescript
function parseClassificationCode(code: string | number | undefined): string {
  if (!code || Number(code) === 0) {
    return "";
  }
  // "510103" → "51.01.03"
  return String(code).match(/.{1,2}/g)?.join(".") || String(code);
}
```

### 5.4 Funding Source Parsing

```typescript
// Input: "A-Integral de la buget"
const fundingSourceRaw = item.SURSA_SURSADEN || "";
const fundingSourceParts = fundingSourceRaw.split("-");
const fundingSource = fundingSourceParts[0]?.trim();           // "A"
const fundingSourceDescription = fundingSourceParts.slice(1).join("-").trim(); // "Integral de la buget"
```

### 5.5 Line Item Key Construction

**File:** `src/extract/angajamente-bugetare.ts:193-205`

```typescript
function buildLineItemKey(
  functionalCode: string,
  economicCode: string | undefined,
  fundingSource: string | undefined,
  budgetSectorId: number
): string {
  return [
    functionalCode || "",
    economicCode || "",
    fundingSource || "",
    budgetSectorId,
  ].join("|");
}
// Example: "51.01.03|10.01.01|A|2"
```

---

## 6. Validation Strategy

### 6.1 Two-Level Validation

**File:** `src/extract/angajamente-bugetare.ts:355-406`

The validation uses regex extraction independent of the XML parser to verify correctness.

### 6.2 Level 1: Item Count Validation

```typescript
function countLineItemsInNivel1(content: string): number {
  // Find NIVEL=1 section only
  const nivel1Start = content.indexOf("<NIVEL>1</NIVEL>");
  const nivel1End = content.indexOf("</G_4>", nivel1Start);
  const nivel1Section = content.substring(nivel1Start, nivel1End);

  // Count G_11 items with valid codes
  const g11Regex = /<G_11>([\s\S]*?)<\/G_11>/g;
  let count = 0;
  while ((match = g11Regex.exec(nivel1Section)) !== null) {
    const block = match[1];
    const hasFunctional = /<COD_FUNCTIONAL>[1-9][0-9]*<\/COD_FUNCTIONAL>/.test(block);
    const hasEconomic = /<COD_ECONOMIC>[1-9][0-9]*<\/COD_ECONOMIC>/.test(block);
    if (hasFunctional && hasEconomic) count++;
  }
  return count;
}
```

### 6.3 Level 2: Sum Validation

```typescript
const fieldsToValidate = [
  { tag: "PLATITREZOR", field: "platiTrezor" },
  { tag: "RECEPTIITOTALE", field: "receptiiTotale" },
  { tag: "CREDITEANGAJAMENT", field: "crediteAngajament" },
];

for (const { tag, field } of fieldsToValidate) {
  const regexSum = extractAllValuesInNivel1(xmlContent, tag).reduce((a, b) => a + b, 0);
  const parsedSum = parsed.lineItems.reduce((sum, li) => sum + li[field], 0);
  
  if (Math.abs(regexSum - parsedSum) > 1) { // 1 unit tolerance
    // Error or warning based on strictMode
  }
}
```

### 6.4 Strict Mode

```typescript
validateParsedData(xmlContent, parsed, strictMode = false);
// strictMode = true: throws errors on mismatch
// strictMode = false: logs warnings only (default)
```

---

## 7. Monthly Difference Computation

### 7.1 Algorithm

**File:** `src/extract/angajamente-bugetare.ts:384-482`

Since XML reports contain Year-To-Date (YTD) values, monthly amounts are computed as:

```
Monthly Value = Current Month YTD - Previous Month YTD
```

### 7.2 Implementation

```typescript
function recomputeMonthlyDiffsForYear(yearData: Record<string, AngajamenteReport[]>): void {
  // Group by budget sector
  const reportsByGroup = groupBySector(yearData);
  
  for (const group of reportsByGroup) {
    // Sort months chronologically
    const entries = group.sort((a, b) => a.month.localeCompare(b.month));
    
    // Track previous month values
    let prevPlatiTrezorMap = new Map<string, number>();
    let prevReceptiiTotaleMap = new Map<string, number>();
    let prevCrediteAngajamentMap = new Map<string, number>();
    
    for (const { report } of entries) {
      for (const li of report.lineItems) {
        const key = li.key;
        
        // Compute monthly differences
        const prevPlati = prevPlatiTrezorMap.get(key) || 0;
        li.monthlyPlatiTrezor = Number((li.platiTrezor - prevPlati).toFixed(2));
        
        // Similar for other fields...
        
        // Update maps for next month
        prevPlatiTrezorMap.set(key, li.platiTrezor);
      }
      
      // Handle missing line items from previous month
      handleMissingLineItems(report, prevLineItemsMap);
    }
  }
}
```

### 7.3 Monthly Fields Computed

| Field | Source YTD Field |
|-------|------------------|
| `monthlyPlatiTrezor` | `platiTrezor` |
| `monthlyReceptiiTotale` | `receptiiTotale` |
| `monthlyCrediteAngajament` | `crediteAngajament` |

---

## 8. Anomaly Detection

### 8.1 YTD Anomaly

Detected when a positive YTD value has a negative monthly change (or vice versa):

```typescript
const anomalyDetected = 
  (li.platiTrezor > 0 && li.monthlyPlatiTrezor < 0) ||
  (li.receptiiTotale > 0 && li.monthlyReceptiiTotale < 0);

if (anomalyDetected) {
  li.anomaly = "YTD_ANOMALY";
}
```

**Cause:** Usually indicates data corrections, reclassifications, or reporting errors.

### 8.2 Missing Line Item

When a line item exists in month N but disappears in month N+1:

```typescript
// Create compensating entry
const newLi: AngajamenteLineItem = {
  key: missingKey,
  date: report.reportInfo.date,
  functionalCode: prevLi.functionalCode,
  economicCode: prevLi.economicCode,
  fundingSource: prevLi.fundingSource,
  // All YTD values = 0
  platiTrezor: 0,
  receptiiTotale: 0,
  crediteAngajament: 0,
  // ... other fields = 0
  
  // Monthly = negative of previous YTD (to compensate)
  monthlyPlatiTrezor: -prevLi.platiTrezor,
  monthlyReceptiiTotale: -prevLi.receptiiTotale,
  monthlyCrediteAngajament: -prevLi.crediteAngajament,
  
  anomaly: "MISSING_LINE_ITEM",
};
report.lineItems.push(newLi);
```

**Purpose:** Ensures cumulative monthly totals equal the final YTD total.

---

## 9. Output Format

### 9.1 Entity Store Structure

```typescript
interface AngajamenteEntityStore {
  version: 1;
  cui: string;
  entityName?: string;
  angajamenteBugetareData: AngajamenteReportHistory;
  nameLookups: {
    functional: Record<string, string>;
    economic: Record<string, string>;
    fundingSource: Record<string, string>;
  };
}

type AngajamenteReportHistory = Record<YearId, Record<MonthId, AngajamenteReport[]>>;
```

### 9.2 AngajamenteReport Structure

```typescript
interface AngajamenteReport {
  reportInfo: {
    id: string;           // SHA-256 hash
    date: string;         // Report date
    year: number;
    period: string;       // "Luna 01", "Luna 02", etc.
    documentLinks: string[];
  };
  fileInfo: {
    source: string;       // File path
    xmlHash: string;      // SHA-256 of XML content
    parsedAt: string;     // ISO timestamp
    formatId: string;     // "angajamente-v1"
  };
  summary: {
    budgetSectorId: number;
    sectorType?: string;
    mainCreditor: string;
  };
  lineItems: AngajamenteLineItem[];
}
```

### 9.3 Sample Output

```json
{
  "version": 1,
  "cui": "3337729",
  "entityName": "COMUNA BOTESTI",
  "angajamenteBugetareData": {
    "2025": {
      "01": [{
        "reportInfo": {
          "id": "7598c60a9654cee18cee93ee874253d6013124ab3986fcc1c711d5a741d6c11a",
          "date": "31-JAN-2025",
          "year": 2025,
          "period": "Luna 01"
        },
        "summary": {
          "budgetSectorId": 2,
          "sectorType": "Bugetul local (administratie locala)",
          "mainCreditor": "3337729"
        },
        "lineItems": [{
          "key": "51.01.03|10.01.01|A|2",
          "functionalCode": "51.01.03",
          "economicCode": "10.01.01",
          "fundingSource": "A",
          "crediteAngajament": 1124450,
          "platiTrezor": 102313,
          "receptiiTotale": 110000,
          "monthlyPlatiTrezor": 102313,
          "monthlyReceptiiTotale": 110000,
          "monthlyCrediteAngajament": 1124450
        }]
      }]
    }
  },
  "nameLookups": {
    "functional": {
      "51.01.03": "Autoritati executive"
    },
    "economic": {
      "10.01.01": "Salarii de baza"
    },
    "fundingSource": {
      "A": "Integral de la buget"
    }
  }
}
```

---

## 10. Exported Functions

### 10.1 Main Parsing Function

```typescript
export function parseAngajamenteBugetare(
  xmlContent: string, 
  filePath: string
): ParsedAngajamenteData;
```

### 10.2 Validation Function

```typescript
export function validateParsedData(
  xmlContent: string, 
  parsed: ParsedAngajamenteData, 
  strictMode?: boolean
): void;
```

### 10.3 Monthly Difference Computation

```typescript
export function recomputeMonthlyDiffsForYear(
  yearData: Record<string, AngajamenteReport[]>
): void;
```

### 10.4 Utility Functions

```typescript
export function buildLineItemKey(
  functionalCode: string,
  economicCode: string | undefined,
  fundingSource: string | undefined,
  budgetSectorId: number
): string;

export function getReportId(
  cui: string, 
  reportingDate: string, 
  budgetSector: string
): string;
```

### 10.5 Exported Types

```typescript
export interface ParsedAngajamenteData { ... }
```

---

## 11. Usage

### 11.1 Standalone Testing

```bash
# Place XML files in src/extract/tmp/
# Run the script
npx ts-node src/extract/angajamente-bugetare.ts

# Output: src/extract/tmp/angajamente-entity-store.json
```

### 11.2 Programmatic Usage

```typescript
import { 
  parseAngajamenteBugetare, 
  validateParsedData,
  recomputeMonthlyDiffsForYear 
} from './angajamente-bugetare';

// Parse XML file
const xmlContent = await fs.readFile(xmlPath, 'utf8');
const parsed = parseAngajamenteBugetare(xmlContent, xmlPath);

// Validate (optional)
validateParsedData(xmlContent, parsed, true); // strict mode

// Process...
```

---

## 12. Integration Guide

### 12.1 Integration with Main Extraction Flow

To integrate with `src/extract/index.ts`:

#### Step 1: Import Functions

```typescript
import { 
  parseAngajamenteBugetare, 
  validateParsedData,
  recomputeMonthlyDiffsForYear,
  getReportId,
  buildLineItemKey
} from './angajamente-bugetare';
import { ANGAJAMENTE_BUGETARE_REPORT_TYPE } from '../constants';
```

#### Step 2: Add to EntityStore Initialization

```typescript
const existing = (await readJsonSafe<EntityStore>(storePath)) || {
  version: 1 as const,
  cui,
  entityName: normalized.entityName,
  mainCreditData: {},
  detailedCreditData: {},
  secondaryCreditData: {},
  angajamenteBugetareData: {},  // ADD THIS
  nameLookups: {...}
};
```

#### Step 3: Add Report Type Mapping

```typescript
const targetHistoryKey = {
  [AGGREGATED_MAIN_REPORT_TYPE]: "mainCreditData",
  [AGGREGATED_SECONDARY_REPORT_TYPE]: "secondaryCreditData",
  [DETAIL_REPORT_TYPE]: "detailedCreditData",
  [ANGAJAMENTE_BUGETARE_REPORT_TYPE]: "angajamenteBugetareData",  // ADD THIS
}[report.reportType];
```

#### Step 4: Add Processing Logic

```typescript
if (report.reportType === ANGAJAMENTE_BUGETARE_REPORT_TYPE) {
  const parsed = parseAngajamenteBugetare(xmlContent, xmlPath);
  
  if (parsed.reportState !== "Final" || parsed.lineItems.length === 0) {
    continue; // Skip non-final or empty
  }
  
  validateParsedData(xmlContent, parsed);
  
  // Build AngajamenteReport and add to store...
}
```

### 12.2 Validation Checklist

| Check | Expected Result |
|-------|-----------------|
| Item count matches | Parsed count = Regex count |
| PLATITREZOR sum matches | Diff < 1 |
| RECEPTIITOTALE sum matches | Diff < 1 |
| CREDITEANGAJAMENT sum matches | Diff < 1 |
| Monthly cumulative = YTD | Jan + Feb + Mar = Mar YTD |
| Report IDs unique | No duplicates |
| Report IDs deterministic | Same input = Same ID |

---

## Appendix A: XML Field Reference

| XML Element | TypeScript Field | Description |
|-------------|------------------|-------------|
| `P_ZI` | `reportingDate` | Report date |
| `P_SECB` | `budgetSector` | Budget sector code |
| `P_STARE` | `reportState` | Report state (Final, etc.) |
| `P_BUGIP` | `cui` (fallback) | Entity CUI |
| `G_5.COD_FISCAL` | `cui` | Entity CUI (primary) |
| `G_5.NUME` | `entityName` | Entity name |
| `G_6.TIP_SECTOR` | `sectorType` | Sector description |
| `SURSA_SURSADEN` | `fundingSource` + lookup | Funding source |
| `COD_FUNCTIONAL` | `functionalCode` | Functional classification |
| `COD_ECONOMIC` | `economicCode` | Economic classification |
| `DENUMIRE_INDICATOR_FUNCTIONAL` | nameLookups.functional | Functional name |
| `DENUMIRE_INDICATOR_ECONOMIC` | nameLookups.economic | Economic name |
| `CREDITEANGAJAMENT` | `crediteAngajament` | Commitment credits |
| `LIMITACREDITANGAJAMENT` | `limitaCreditAngajament` | Commitment limit |
| `CREDITEBUGETARE` | `crediteButetare` | Budget credits |
| `PLATITREZOR` | `platiTrezor` | Treasury payments |
| `PLATINONTREZOR` | `platiNonTrezor` | Non-treasury payments |
| `RECEPTIITOTALE` | `receptiiTotale` | Total receipts |
| `RECEPTIINEPLATITE` | `receptiiNeplatite` | Unpaid receipts |

---

## Appendix B: Verification Commands

```bash
# Run extraction
npx ts-node src/extract/angajamente-bugetare.ts

# Check output
cat src/extract/tmp/angajamente-entity-store.json | jq '.angajamenteBugetareData["2025"]'

# Count anomalies
grep -c "MISSING_LINE_ITEM" src/extract/tmp/angajamente-entity-store.json
grep -c "YTD_ANOMALY" src/extract/tmp/angajamente-entity-store.json

# Verify totals via regex
grep -o "<PLATITREZOR>[^<]*</PLATITREZOR>" src/extract/tmp/*.xml | head -20
```

---

**Version:** 1.0  
**Last Updated:** December 2024  
**File:** `src/extract/angajamente-bugetare.ts`
