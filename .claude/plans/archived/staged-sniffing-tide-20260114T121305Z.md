# Plan: Post-Implementation Improvements for Global Settings

## Context

The unified global settings system (`useGlobalSettings`) has been implemented. This plan addresses issues identified in the implementation review.

## Issues to Address

### Issue 1: Duplicated Forced Override Logic

**Severity**: Medium (maintainability)

**Problem**: Forced override computation is duplicated in:
- `src/routes/entities.$cui.tsx:56-68` (loader)
- `src/routes/entities.$cui.lazy.tsx:126-132` (client)

**Fix**: Extract to single shared helper that returns both normalization and forced overrides.

### Issue 2: Potential Stale Search State

**Severity**: Low (rare race condition)

**Problem**: `useGlobalSettings` reads `router.state.location.search` directly when updating URL.

**Fix**: Use TanStack Router's functional `search` updater: `search: (prev) => ({ ...prev, currency: value })`.

### Issue 3: Prefetch Returns Undefined ssrSettings

**Severity**: Low (edge case)

**Problem**: When `shouldPrefetchData` is false (DEV + prefetch), loader returns `ssrSettings: undefined`, causing client to fall back to defaults.

**Fix**: Read cookies even during prefetch skip to return valid `ssrSettings`.

## Implementation Plan

### Step 1: Create Unified Settings Resolution Helper

**File**: `src/lib/globalSettings/params.ts`

Add types and single helper that returns both normalization and forced overrides:

```typescript
import type { Normalization, Currency } from '@/schemas/charts'

// Extended normalization type that includes legacy euro variants
export type NormalizationInput = Normalization | 'total_euro' | 'per_capita_euro'

export type ForcedOverrides = {
  currency?: Currency
  inflationAdjusted?: boolean
}

export type ResolvedSettings = {
  normalization: Normalization
  forcedOverrides: ForcedOverrides
}

/**
 * Resolves normalization and computes forced overrides in one pass.
 * Prevents drift between loader and client by centralizing logic.
 */
export function resolveNormalizationSettings(normalizationRaw: NormalizationInput): ResolvedSettings {
  // Normalize legacy euro variants
  const normalization: Normalization =
    normalizationRaw === 'total_euro' ? 'total'
    : normalizationRaw === 'per_capita_euro' ? 'per_capita'
    : normalizationRaw

  // Compute forced overrides based on raw input
  const forcedOverrides: ForcedOverrides = {
    currency: (normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro')
      ? 'EUR'
      : undefined,
    inflationAdjusted: normalization === 'percent_gdp' ? false : undefined,
  }

  return { normalization, forcedOverrides }
}
```

### Step 2: Update Loader to Use Helper

**File**: `src/routes/entities.$cui.tsx`

Replace duplicated logic:

```typescript
import { resolveNormalizationSettings } from '@/lib/globalSettings/params'

// In loader:
const normalizationRaw = (search?.normalization as NormalizationInput) ?? 'total'
const { normalization, forcedOverrides: { currency: forcedCurrency, inflationAdjusted: forcedInflation } } =
  resolveNormalizationSettings(normalizationRaw)
```

Also fix prefetch to return valid ssrSettings:

```typescript
if (!shouldPrefetchData) {
  // Still read cookies so ssrSettings isn't undefined
  const cookieCurrency = await readUserCurrencyPreference()
  const cookieInflation = await readUserInflationAdjustedPreference()
  return {
    ssrParams: undefined,
    ssrSettings: {
      currency: cookieCurrency ?? DEFAULT_CURRENCY,
      inflationAdjusted: cookieInflation ?? DEFAULT_INFLATION_ADJUSTED,
    },
    forcedOverrides: undefined,
  }
}
```

### Step 3: Update Client Component to Use Helper

**File**: `src/routes/entities.$cui.lazy.tsx`

Replace inline computation:

```typescript
import { resolveNormalizationSettings, type NormalizationInput } from '@/lib/globalSettings/params'

const normalizationRaw = (search.normalization as NormalizationInput) ?? 'total'
const { normalization, forcedOverrides } = useMemo(
  () => resolveNormalizationSettings(normalizationRaw),
  [normalizationRaw]
)
```

### Step 4: Fix Search State Updates in Hook

**File**: `src/lib/hooks/useGlobalSettings.ts`

Use functional search updater for atomic updates:

```typescript
const setCurrency = useCallback(
  (value: Currency) => {
    if (forcedOverrides?.currency !== undefined) {
      console.warn('Cannot change currency: forced by route')
      return
    }
    writeCurrencyPref(value)
    router.navigate({
      to: '.',
      search: (prev) => ({ ...prev, currency: value }),
      replace: true,
      resetScroll: false,
    })
  },
  [router, forcedOverrides?.currency, writeCurrencyPref]
)

const setInflationAdjusted = useCallback(
  (value: boolean) => {
    if (forcedOverrides?.inflationAdjusted !== undefined) {
      console.warn('Cannot change inflation_adjusted: forced by route')
      return
    }
    writeInflationPref(value)
    router.navigate({
      to: '.',
      search: (prev) => ({ ...prev, inflation_adjusted: value }),
      replace: true,
      resetScroll: false,
    })
  },
  [router, forcedOverrides?.inflationAdjusted, writeInflationPref]
)

const setSettings = useCallback(
  (updates: { currency?: Currency; inflationAdjusted?: boolean }) => {
    const searchUpdates: Record<string, unknown> = {}

    if (updates.currency !== undefined && forcedOverrides?.currency === undefined) {
      writeCurrencyPref(updates.currency)
      searchUpdates.currency = updates.currency
    }
    if (updates.inflationAdjusted !== undefined && forcedOverrides?.inflationAdjusted === undefined) {
      writeInflationPref(updates.inflationAdjusted)
      searchUpdates.inflation_adjusted = updates.inflationAdjusted
    }

    if (Object.keys(searchUpdates).length > 0) {
      router.navigate({
        to: '.',
        search: (prev) => ({ ...prev, ...searchUpdates }),
        replace: true,
        resetScroll: false,
      })
    }
  },
  [router, forcedOverrides, writeCurrencyPref, writeInflationPref]
)
```

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/globalSettings/params.ts` | Add `resolveNormalizationSettings` helper with proper types |
| `src/routes/entities.$cui.tsx` | Use helper, fix prefetch to return valid ssrSettings |
| `src/routes/entities.$cui.lazy.tsx` | Use helper instead of inline logic |
| `src/lib/hooks/useGlobalSettings.ts` | Use functional search updater `(prev) => ({ ...prev, ... })` |

## Verification

1. **Type check**: `yarn typecheck` passes
2. **Manual test**:
   - Change currency on entity page → URL updates
   - Navigate away and back → preference preserved
   - `total_euro` normalization → currency forced to EUR
   - Hover over entity link (prefetch) then navigate → correct preferences shown
3. **No behavior change**: All existing functionality works as before
