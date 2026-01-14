# Plan: Fix SSR Currency Mismatch on Entity Page

## Problem Summary

When a user sets their currency preference to EUR:
1. **SSR renders**: Currency label shows EUR (from user preference), but value is in RON (from SSR data)
2. **Client hydrates**: Fetches correct EUR data and shows correct values

This causes a visual flicker where the user sees incorrect values (RON values with EUR label) until client-side fetching completes.

## Root Cause Analysis

**SSR Phase** (`src/routes/entities.$cui.tsx:53-56`):
```typescript
const currency: Currency =
    normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro'
        ? 'EUR'
        : (currencyParam ?? DEFAULT_CURRENCY);  // Defaults to RON
```
- Uses `DEFAULT_CURRENCY` ('RON') when no URL param is present
- Does NOT read user's cookie-stored preference

**Client Phase** (`src/routes/entities.$cui.lazy.tsx:129-132`):
```typescript
const currency: 'RON' | 'EUR' | 'USD' =
    normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro'
      ? 'EUR'
      : (currencyParam ?? userCurrency)  // Reads from localStorage
```
- Uses `userCurrency` from localStorage (could be EUR)

**The Mismatch**:
- `EntityFinancialSummary` displays currency label from `normalizationOptions.currency` (client preference)
- But displays values from `entity.totalIncome/totalExpenses` (SSR-fetched RON data)

## Solution

Use the existing `readUserCurrencyPreference()` function in the SSR loader. This function already supports reading from cookies during SSR (see `src/lib/user-preferences.ts:58-64`).

## Implementation

### Step 1: Update SSR Loader to Read User Currency Preference

**File**: `src/routes/entities.$cui.tsx`

Change the currency resolution logic to:
```typescript
// Import the async preference reader
import { readUserCurrencyPreference, readUserInflationAdjustedPreference, DEFAULT_CURRENCY, DEFAULT_INFLATION_ADJUSTED } from '@/lib/user-preferences';

// In the loader, read user preferences from cookies
const userCurrencyPreference = await readUserCurrencyPreference();
const userInflationPreference = await readUserInflationAdjustedPreference();

const currency: Currency =
    normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro'
        ? 'EUR'
        : (currencyParam ?? userCurrencyPreference);

const inflationAdjusted =
    normalization === 'percent_gdp'
        ? false
        : (inflationAdjustedParam ?? userInflationPreference);
```

### Step 2: Update Import Statement

Remove redundant imports and use the new async functions:
```typescript
// Before
import { DEFAULT_CURRENCY, DEFAULT_INFLATION_ADJUSTED } from '@/lib/user-preferences';

// After
import { readUserCurrencyPreference, readUserInflationAdjustedPreference } from '@/lib/user-preferences';
```

## Files to Modify

1. `src/routes/entities.$cui.tsx` - SSR loader (lines ~15, ~53-60)

## Verification

1. Set currency to EUR in the app
2. Navigate away and back to an entity page
3. On initial SSR load, verify:
   - Currency label shows EUR
   - Values are correct EUR amounts (not RON values)
4. No flicker should occur on hydration (since SSR and client use same currency)

## Alternative Considered (Rejected)

**Option B**: Keep SSR using RON but ensure client also shows RON during placeholder phase.

Rejected because:
- Would still show wrong currency to users who prefer EUR
- More complex implementation (need to track "is using placeholder" state)
- The infrastructure for Option A already exists
