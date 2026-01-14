# Plan: Fix SSR Currency Handling with Client-Side Switching

## Problem Summary

We have three use cases that must all work:

1. **SSR Rendering**: Show correct currency label matching SSR-fetched data
2. **Client Hydration**: No flicker between SSR HTML and hydrated state
3. **Currency Switching**: User can change currency and see updated data

## Current State (After Previous Fixes)

✅ **SSR loader** (`entities.$cui.tsx`): Reads currency from cookies, fetches correct data
✅ **SSR label** (`entities.$cui.lazy.tsx`): Uses `ssrParams.currency` for label during hydration
❌ **Currency switching**: BROKEN - `ssrParams.currency` always takes precedence over `userCurrency`

## Root Cause

Current code in `entities.$cui.lazy.tsx:133`:
```typescript
: (currencyParam ?? loaderData?.ssrParams?.currency ?? userCurrency)
```

`ssrParams.currency` is always set (from loader), so `userCurrency` is never used. User can't change currency.

## Solution: Track Hydration State

Use `ssrParams.currency` only during SSR/initial hydration. After hydration completes, switch to `userCurrency` to allow user changes.

```
Timeline:
─────────────────────────────────────────────────────────────────────
SSR render     │ Hydration      │ After useEffect  │ User changes
               │ (first render) │                  │ currency
─────────────────────────────────────────────────────────────────────
ssrParams.currency ────────────►│ userCurrency ───────────────────►
isHydrated=false                │ isHydrated=true
```

## Implementation

### Step 1: Create Hydration-Aware Hook

**File**: `src/lib/hooks/useHydratedValue.ts` (new file)

```typescript
import { useState, useEffect } from 'react'

/**
 * Returns ssrValue during SSR/hydration, then switches to clientValue.
 * Ensures SSR HTML matches initial client render, then allows client updates.
 */
export function useHydratedValue<T>(
  clientValue: T,
  ssrValue: T | undefined
): T {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // During SSR/hydration: use SSR value to match rendered HTML
  // After hydration: use client value to allow changes
  if (!isHydrated && ssrValue !== undefined) {
    return ssrValue
  }
  return clientValue
}
```

### Step 2: Update Entity Page to Use Hook

**File**: `src/routes/entities.$cui.lazy.tsx`

```typescript
// Add import
import { useHydratedValue } from '@/lib/hooks/useHydratedValue'

// Replace currency/inflationAdjusted logic with:
const currency: 'RON' | 'EUR' | 'USD' =
  normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro'
    ? 'EUR'
    : (currencyParam ?? useHydratedValue(userCurrency, loaderData?.ssrParams?.currency))

const inflationAdjusted =
  normalization === 'percent_gdp'
    ? false
    : (inflationAdjustedParam ?? useHydratedValue(userInflationAdjusted, loaderData?.ssrParams?.inflation_adjusted))
```

**Note**: Can't call hooks conditionally. Need to restructure slightly:

```typescript
// Call hooks unconditionally at top level
const hydratedCurrency = useHydratedValue(userCurrency, loaderData?.ssrParams?.currency)
const hydratedInflation = useHydratedValue(userInflationAdjusted, loaderData?.ssrParams?.inflation_adjusted)

// Then use in derived values
const currency: 'RON' | 'EUR' | 'USD' =
  normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro'
    ? 'EUR'
    : (currencyParam ?? hydratedCurrency)

const inflationAdjusted =
  normalization === 'percent_gdp'
    ? false
    : (inflationAdjustedParam ?? hydratedInflation)
```

## Files to Modify

1. `src/lib/hooks/useHydratedValue.ts` - **NEW** reusable hook
2. `src/routes/entities.$cui.lazy.tsx` - Use the new hook (~lines 100-137)

## Data Flow After Fix

```
SSR Phase:
  loader reads cookie → fetches EUR data → ssrParams.currency = 'EUR'

Hydration (isHydrated=false):
  hydratedCurrency = ssrParams.currency = 'EUR' ✓ (matches SSR data)

After Hydration (isHydrated=true):
  hydratedCurrency = userCurrency = 'EUR' ✓ (from localStorage)

User Changes Currency to RON:
  userCurrency updates → 'RON'
  hydratedCurrency = userCurrency = 'RON' ✓
  useEntityDetails fetches RON data ✓
```

## Verification

1. **SSR Rendering**: Set currency to EUR, hard refresh → should show EUR label + EUR values
2. **No Hydration Flicker**: Same as above, no flash of wrong currency
3. **Currency Switching**: Click to change currency to RON → data refetches, shows RON values
4. **Navigation**: Navigate away and back → should preserve currency preference

## Why This Approach

| Approach | SSR | Hydration | User Changes |
|----------|-----|-----------|--------------|
| Always use `userCurrency` | ❌ RON default | ✓ | ✓ |
| Always use `ssrParams.currency` | ✓ | ✓ | ❌ |
| **Hydration-aware switching** | ✓ | ✓ | ✓ |

The hook is:
- **Simple**: Just tracks one boolean state
- **Reusable**: Can use for inflation_adjusted and any future SSR-synced preferences
- **Well-encapsulated**: Logic is in one place, easy to test
