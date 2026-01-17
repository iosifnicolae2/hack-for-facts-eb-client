# Angajamente Bugetare UI Implementation Plan

## Overview

Implement UI for Angajamente Bugetare (Budget Commitments) with:
1. **Overview integration** - Compare with Executii Bugetare side-by-side
2. **Dedicated entity tab** - Full Angajamente view
3. **Mock API** - Simulated data for UI iteration

## MVP Visualizations
- KPI cards (credits, payments, arrears, utilization)
- Pipeline flow (Budget → Commitment → Receipt → Payment)
- Data table with drill-down

---

## Phase 1: Types & Mock Data

### 1.1 Create Types Schema
**File:** `src/schemas/angajamente.ts`

```typescript
export interface AngajamenteLineItem {
  key: string;
  date: string;
  functionalCode: string;
  functionalName?: string;
  economicCode?: string;
  economicName?: string;
  fundingSource?: string;
  fundingSourceDescription?: string;

  // Credits
  crediteAngajament: number;
  crediteButetare: number;
  crediteAngajamentInitiale: number;
  crediteButetareInitiale: number;
  crediteAngajamentDefinitive: number;
  crediteButetareDefinitive: number;
  crediteAngajamentDisponibile: number;
  crediteButetareDisponibile: number;

  // Execution
  receptiiTotale: number;
  platiTrezor: number;
  platiNonTrezor: number;
  receptiiNeplatite: number;

  // Monthly computed
  monthlyPlatiTrezor: number | null;
  monthlyReceptiiTotale: number | null;
  monthlyCrediteAngajament: number | null;

  anomaly?: 'YTD_ANOMALY' | 'MISSING_LINE_ITEM';
}

export interface AngajamenteSummary {
  totalCrediteAngajament: number;
  totalCrediteButetare: number;
  totalReceptii: number;
  totalPlati: number;
  totalArierate: number;  // receptiiNeplatite
  utilizationRate: number; // plati / crediteButetare * 100
}
```

### 1.2 Create Mock API
**File:** `src/lib/api/angajamente.ts`

- `getAngajamenteData(cui, year)` → Returns mock data
- `getAngajamenteSummary(cui, year)` → Returns aggregated summary
- Use realistic sample data from ANGAJAMENTE_BUGETARE_EXTRACTION.md

### 1.3 Create Query Hook
**File:** `src/hooks/useAngajamenteData.ts`

```typescript
export function useAngajamenteData(cui: string, year: number, enabled = true)
export function useAngajamenteSummary(cui: string, year: number, enabled = true)
```

---

## Phase 2: Components

### 2.1 KPI Cards Component
**File:** `src/components/angajamente/AngajamenteKPIs.tsx`

4 KPI cards in a grid:
- **Credite Bugetare** (blue) - Total budget credits
- **Angajamente Legale** (green) - Total commitments
- **Plati Efectuate** (amber) - Total payments
- **Arierate** (red) - Unpaid receipts with warning if > 0

Plus utilization rate indicator.

### 2.2 Pipeline Flow Component
**File:** `src/components/angajamente/CommitmentPipeline.tsx`

Visual flow showing:
```
[Credite Aprobate] → [Angajamente] → [Receptii] → [Plati]
     100%              85%            70%          65%
```

With:
- Progress bars between stages
- Percentage labels
- Color coding (green = healthy, yellow = caution, red = issues)

### 2.3 Breakdown Component
**File:** `src/components/angajamente/AngajamenteBreakdown.tsx`

Calculation display (adapt SpendingBreakdown pattern):
```
Credite Bugetare Definitive    1,000,000 RON
  − Plati Efectuate              650,000 RON
  ─────────────────────────────────────────
  = Disponibil                   350,000 RON

Receptii Totale                  700,000 RON
  − Plati Efectuate              650,000 RON
  ─────────────────────────────────────────
  = Arierate                      50,000 RON
```

### 2.4 Data Table Component
**File:** `src/components/angajamente/AngajamenteTable.tsx`

Columns:
- Functional/Economic classification (with drill-down)
- Credite Angajament
- Credite Bugetare
- Receptii
- Plati
- Arierate
- Utilizare %

Features:
- Sorting by any column
- Expand rows for details
- Anomaly highlighting (YTD_ANOMALY, MISSING_LINE_ITEM)

### 2.5 Comparison Card Component
**File:** `src/components/angajamente/ExecutionVsCommitmentCard.tsx`

Side-by-side comparison for Overview:
```
┌─────────────────────┬─────────────────────┐
│   Executii Bugetare │ Angajamente Bugetare│
├─────────────────────┼─────────────────────┤
│ Cheltuieli: X RON   │ Plati Trezor: Y RON │
│ Venituri: X RON     │ Arierate: Y RON     │
│                     │ Utilizare: Z%       │
└─────────────────────┴─────────────────────┘
```

---

## Phase 3: Entity Integration

### 3.1 Add Angajamente Tab
**File:** `src/hooks/useEntityViews.tsx`

Add new view:
```typescript
views.push({
  id: 'angajamente',
  label: t`Angajamente`,
  icon: <FileCheck2 className="w-4 h-4" />
});
```

### 3.2 Create Angajamente View
**File:** `src/components/entities/views/AngajamenteView.tsx`

Layout:
```
┌─────────────────────────────────────────────┐
│ [KPI Cards - 4 across]                      │
├─────────────────────────────────────────────┤
│ [Pipeline Flow Visualization]               │
├─────────────────────────────────────────────┤
│ [Breakdown Calculations]                    │
├─────────────────────────────────────────────┤
│ [Data Table with filters]                   │
└─────────────────────────────────────────────┘
```

### 3.3 Register in Route
**File:** `src/routes/entities.$cui.lazy.tsx`

- Add lazy import
- Add case in ViewsContent switch

### 3.4 Update Overview
**File:** `src/components/entities/views/Overview.tsx`

Add ExecutionVsCommitmentCard after the financial summary section.

---

## Phase 4: i18n

### Labels to translate (Romanian/English):
- Angajamente Bugetare / Budget Commitments
- Credite Angajament / Commitment Credits
- Credite Bugetare / Budget Credits
- Plati Trezor / Treasury Payments
- Receptii Totale / Total Receipts
- Arierate / Arrears
- Grad Utilizare / Utilization Rate
- Disponibil / Available

Run `yarn i18n:extract` after adding Lingui macros.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/schemas/angajamente.ts` | Type definitions |
| `src/lib/api/angajamente.ts` | Mock API with sample data |
| `src/hooks/useAngajamenteData.ts` | Query hooks |
| `src/components/angajamente/AngajamenteKPIs.tsx` | KPI cards grid |
| `src/components/angajamente/CommitmentPipeline.tsx` | Visual flow |
| `src/components/angajamente/AngajamenteBreakdown.tsx` | Calculation display |
| `src/components/angajamente/AngajamenteTable.tsx` | Data table |
| `src/components/angajamente/ExecutionVsCommitmentCard.tsx` | Comparison card |
| `src/components/angajamente/index.ts` | Barrel export |
| `src/components/entities/views/AngajamenteView.tsx` | Entity tab view |

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useEntityViews.tsx` | Add angajamente view |
| `src/routes/entities.$cui.lazy.tsx` | Add route case |
| `src/components/entities/views/Overview.tsx` | Add comparison card |

---

## Verification Steps

1. Run `yarn dev` and navigate to any entity page
2. Verify "Angajamente" tab appears in navigation
3. Click tab - verify KPIs, pipeline, breakdown, and table render
4. Check Overview - verify comparison card shows
5. Run `yarn typecheck` - no type errors
6. Run `yarn i18n:extract` - translations extracted
7. Test responsive layout on mobile viewport

---

## Implementation Order

1. **Types & Mock Data** (Phase 1) - Foundation
2. **KPI Cards** (2.1) - Quick visual win
3. **Pipeline Flow** (2.2) - Core visualization
4. **Breakdown** (2.3) - Calculation clarity
5. **Entity Tab** (3.1-3.3) - Integration point
6. **Data Table** (2.4) - Detailed view
7. **Overview Comparison** (2.5, 3.4) - Side-by-side
8. **i18n** (Phase 4) - Finalize translations
