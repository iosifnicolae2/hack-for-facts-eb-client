# Plan: Fix Transfer Codes for Income/Revenue Calculations

## Summary

Update the hardcoded economic classification (EC) and functional (FN) codes used for filtering budget totals to match the official Romanian Local Budget execution methodology (Legea 273/2006, OMFP 1917/2005).

## Changes Required

### New Default Exclusion Constants

**Before:**
```typescript
export const DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES = ['51', '55.01'] as const;
export const DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES = ['42', '43', '47', '36.05'] as const;
```

**After:**
```typescript
export const DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES = ['51.01', '51.02'] as const;
export const DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES = ['36.02.05', '37.02.03', '37.02.04', '47.02.04'] as const;
```

### Rationale

**Revenues — EXCLUDE from total:**

| Code | Reason |
|------|--------|
| `36.02.05` | Internal flow, inter-budget |
| `37.02.03` | Vărsăminte din secțiunea de funcționare (internal movements) |
| `37.02.04` | Vărsăminte din secțiunea de dezvoltare (internal movements) |
| `47.02.04` | Sums pending distribution (clearing accounts) |

**Revenues — INCLUDE (no longer excluded):**

| Code | Reason |
|------|--------|
| `42` | Subsidies are real revenue sources |
| `43` | Subsidies from other admins are real revenue |

**Expenses — EXCLUDE from total:**

| Code | Reason |
|------|--------|
| `51.01` | Transfers to subordinate public institutions* |
| `51.02` | Capital transfers to subordinate institutions* |

**Expenses — INCLUDE (no longer excluded):**

| Code | Reason |
|------|--------|
| `55.01` | Transfers to external/private entities are real expenses |

### Important Note on 51.01/51.02

⚠️ **Legal nuance:** Exclusion of 51.01/51.02 is correct **only for transfers whose counterparty is inside the consolidated perimeter** (OPC + included subordinates). Transfers to entities *outside* the perimeter are real outflows and should be included.

**Current limitation:** Without counterparty information in the data, we exclude all 51.01/51.02 codes. This may need refinement when counterparty data becomes available.

---

## Files to Modify

### 1. Central Constants File
**`src/lib/analytics-defaults.ts`**
- Update both constants with new values

### 2. Files with Inline Hardcoded Codes (replace with imports)

| File | Lines | Current Hardcoded Values |
|------|-------|--------------------------|
| `src/routes/budget-explorer.lazy.tsx` | ~258-260 | `['51', '55.01']`, `['42', '43', '47', '36.05']` |
| `src/components/entities/views/TrendsView.tsx` | ~184-186 | `['51', '55.01']`, `['42', '43', '47', '36.05']` |
| `src/components/entities/views/Overview.tsx` | ~209-211 | `['51', '55.01']`, `['42', '43', '47', '36.05']` |
| `src/components/entity-analytics/EntityAnalyticsTreemap.tsx` | ~57-59 | `['51', '55.01']`, `['42', '43', '47', '36.05']` |

### 3. Breakdown Components (display calculations)

**`src/components/budget-explorer/SpendingBreakdown.tsx`** (lines 25-35)

Current logic subtracts BOTH `51` and `55.01`:
```typescript
const transfersEc51 = ... // ec.startsWith('51')
const transfersEc55_01 = ... // ec.startsWith('55.01')
const effectiveSpending = totalSpending - transfersEc51 - transfersEc55_01
```

**Changes:**
1. Keep `51` but split into `51.01` and `51.02` for accuracy
2. Remove `55.01` from the calculation entirely
3. Update UI to reflect new logic

**`src/components/budget-explorer/RevenueBreakdown.tsx`** (lines 34-57, 87)

Current inter-budget deductions include 04, 11, 42, 43, 47, 36.05.

**Changes:**
1. Remove `42`, `43` from deductions (subsidies are real revenue)
2. Change `36.05` → `36.02.05` (more specific)
3. Change `47` → `47.02.04` (more specific)
4. Add `37.02.03` and `37.02.04` (internal movements between sections)
5. Keep `04` and `11` for display only (shares from income tax and VAT)
6. Update the display rows array to match new codes

---

## Implementation Steps

### Step 1: Update Central Constants
**File:** `src/lib/analytics-defaults.ts`

```typescript
// Before
export const DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES = ['51', '55.01'] as const;
export const DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES = ['42', '43', '47', '36.05'] as const;

// After
export const DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES = ['51.01', '51.02'] as const;
export const DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES = ['36.02.05', '37.02.03', '37.02.04', '47.02.04'] as const;
```

### Step 2: Refactor Files with Inline Hardcoded Values

**Pattern to replace in all 4 files:**
```typescript
// Before (inline)
const excludeEcCodes = filter.account_category === 'ch' ? ['51', '55.01'] : []
const excludeFnCodes = filter.account_category === 'vn' ? ['42', '43', '47', '36.05'] : []

// After (import from constants)
import { DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES, DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES } from '@/lib/analytics-defaults'

const excludeEcCodes = filter.account_category === 'ch' ? [...DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES] : []
const excludeFnCodes = filter.account_category === 'vn' ? [...DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES] : []
```

Files:
- `src/routes/budget-explorer.lazy.tsx` (lines ~258-260)
- `src/components/entities/views/TrendsView.tsx` (lines ~184-186)
- `src/components/entities/views/Overview.tsx` (lines ~209-211)
- `src/components/entity-analytics/EntityAnalyticsTreemap.tsx` (lines ~57-59)

### Step 3: Update SpendingBreakdown Component
**File:** `src/components/budget-explorer/SpendingBreakdown.tsx`

1. **Update the 51 calculation to be more specific:**
   ```typescript
   // Change from ec.startsWith('51') to:
   const transfersEc51_01 = (nodes ?? []).reduce((sum, n) => {
     const ec = normalizeEc(n.ec_c)
     return ec.startsWith('51.01') ? sum + (n.amount ?? 0) : sum
   }, 0)

   const transfersEc51_02 = (nodes ?? []).reduce((sum, n) => {
     const ec = normalizeEc(n.ec_c)
     return ec.startsWith('51.02') ? sum + (n.amount ?? 0) : sum
   }, 0)
   ```

2. **Remove 55.01 calculation entirely** (lines 30-33)

3. **Update effectiveSpending calculation:**
   ```typescript
   const effectiveSpending = totalSpending - transfersEc51_01 - transfersEc51_02
   ```

4. **Update UI:**
   - Remove the "Internal Transfers (ec:55.01)" section (lines ~149-167)
   - Update labels to show ec:51.01 and ec:51.02 separately, or combine as "ec:51.01 + 51.02"

### Step 4: Update RevenueBreakdown Component
**File:** `src/components/budget-explorer/RevenueBreakdown.tsx`

1. **Update calculations with specific codes:**
   ```typescript
   // Keep for display (not deducted from "effective revenue")
   const sharesFromIncomeTax = sumByFnPrefix('04')
   const sharesFromVAT = sumByFnPrefix('11')
   const financialOps40 = sumByFnPrefix('40')
   const financialOps41 = sumByFnPrefix('41')

   // NEW - codes to EXCLUDE from total
   const institutionalRemittances36_02_05 = sumByFnPrefix('36.02.05')
   const internalMovements37_02_03 = sumByFnPrefix('37.02.03')
   const internalMovements37_02_04 = sumByFnPrefix('37.02.04')
   const pendingDistribution47_02_04 = sumByFnPrefix('47.02.04')

   // REMOVE these (no longer excluded)
   // const subsidies42 = sumByFnPrefix('42')
   // const subsidiesFromOtherAdm43 = sumByFnPrefix('43')
   ```

2. **Update interBudgetTransfers calculation:**
   ```typescript
   // Before
   const interBudgetTransfers = sharesFromIncomeTax + sharesFromVAT + subsidies42 + subsidiesFromOtherAdm43 + pendingDistribution47 + institutionalRemittances3605

   // After - only deduct specific codes per methodology
   const interBudgetTransfers = sharesFromIncomeTax + sharesFromVAT +
     institutionalRemittances36_02_05 +
     internalMovements37_02_03 +
     internalMovements37_02_04 +
     pendingDistribution47_02_04
   ```

3. **Update interBudgetRows display array:**
   - Remove rows for `42`, `43`
   - Change `36.05` → `36.02.05`
   - Change `47` → `47.02.04`
   - Add rows for `37.02.03` and `37.02.04`

### Step 5: Verify No Other Hardcoded Values Remain
Run grep to ensure consistency:
```bash
rg "'51'|'55.01'|'42'|'43'|'47'|'36.05'" --type ts
```

---

## Verification

### 1. Type Check
```bash
yarn typecheck
```
Ensure no type errors are introduced.

### 2. Visual Verification
- Navigate to Budget Explorer (`/budget-explorer`)
- Select an entity (e.g., a known UAT like Corbeanca)
- Switch between "Expenses" and "Income" views
- Verify the treemap totals match expected values

### 3. Breakdown Components
- Check that `SpendingBreakdown`:
  - No longer shows "Internal Transfers (ec:55.01)" row
  - Shows ec:51.01 and ec:51.02 (or combined) as exclusions
- Check that `RevenueBreakdown`:
  - Shows 36.02.05, 37.02.03, 37.02.04, 47.02.04 as deductions
  - Does NOT show 42, 43 as deductions
  - Still shows 04, 11 for display (shares from income tax and VAT)

### 4. Compare with ANAF PDF
For a known UAT:
- Download official ANAF budget execution PDF
- Compare "Total Venituri" with platform's income total
- Compare "Total Cheltuieli" with platform's expense total
- Verify the discrepancy is reduced

---

## Files Summary (7 files)

| File | Change Type |
|------|-------------|
| `src/lib/analytics-defaults.ts` | Update constants (single source of truth) |
| `src/routes/budget-explorer.lazy.tsx` | Replace inline → import constants |
| `src/components/entities/views/TrendsView.tsx` | Replace inline → import constants |
| `src/components/entities/views/Overview.tsx` | Replace inline → import constants |
| `src/components/entity-analytics/EntityAnalyticsTreemap.tsx` | Replace inline → import constants |
| `src/components/budget-explorer/SpendingBreakdown.tsx` | Update to 51.01/51.02, remove 55.01, update UI |
| `src/components/budget-explorer/RevenueBreakdown.tsx` | Update to specific codes, remove 42/43, update UI |

---

## Expected Outcome

After implementation:
- **Revenues** will include subsidies (42, 43) → higher totals matching ANAF
- **Expenses** will include transfers to private entities (55.01.*) → higher totals matching ANAF
- Only true inter-budget flows will be excluded:
  - **Income:** 36.02.05, 37.02.03, 37.02.04, 47.02.04
  - **Expenses:** 51.01, 51.02 (transfers to subordinate public institutions)
