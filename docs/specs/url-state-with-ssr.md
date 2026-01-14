# Plan: Unified Global Settings System (URL-First, Like Language)

## Goals

Create a unified system for global settings (currency, inflation_adjusted, future settings) that:

1. **URL-first for sharing**: `?currency=EUR&inflation_adjusted=true` works like `?lang=ro`
2. **SSR-compatible**: Server reads from URL, falls back to cookies
3. **No hydration flicker**: Client matches SSR during hydration
4. **User can change settings**: After hydration, user preferences work
5. **Well-encapsulated**: Single hook handles all complexity

## Critical Issues to Address

### Issue 1: Persistence Layer Mismatch
- **Problem**: Client writes localStorage, SSR reads cookies → flicker on refresh
- **Fix**: Write to COOKIE (SSR-readable), localStorage as optional backup

### Issue 2: TanStack Router Drops Params
- **Problem**: Params not in `validateSearch` are stripped on navigation
- **Fix**: Add global settings to root route's search schema

### Issue 3: Forced Overrides Create Contradictions
- **Problem**: `total_euro` forces EUR, but URL could say `?currency=USD` → syncing USD to storage is wrong
- **Fix**: Hook must know about forced overrides, skip sync when forced

### Issue 4: Post-Hydration Flip
- **Problem**: `useUserCurrency` returns default on first render, then updates → flip
- **Fix**: Initialize hooks with SSR values, use cookie-first reading

### Issue 5: URL Semantics Undefined
- **Decision**: URL override DOES update preference (Option A) - shared links set defaults

## Solution: Complete Priority Chain

```
EFFECTIVE VALUE (for rendering/fetching):
1. Forced override (route/domain constraint)  → total_euro forces EUR
2. URL query param                            → ?currency=EUR
3. Persisted preference (COOKIE-first)        → user's saved choice
4. Default                                    → RON / false

URL SEMANTICS:
- URL params persist to storage (shared link sets your preference)
- Forced overrides block URL→storage sync (don't persist contradictions)
```

## Implementation

### Step 0: Shared Parsing Module (DRY)

**File**: `src/lib/globalSettings/params.ts` (new file)

```typescript
import type { Currency } from '@/schemas/charts'

const VALID_CURRENCIES: readonly Currency[] = ['RON', 'EUR', 'USD']

export function parseCurrencyParam(value: unknown): Currency | undefined {
  if (typeof value === 'string' && VALID_CURRENCIES.includes(value as Currency)) {
    return value as Currency
  }
  return undefined
}

export function parseBooleanParam(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

export const DEFAULT_CURRENCY: Currency = 'RON'
export const DEFAULT_INFLATION_ADJUSTED = false
```

### Step 1: Add Global Settings to Root Route Schema

**File**: `src/routes/__root.tsx`

This is CRITICAL - without this, params are stripped on navigation.

**IMPORTANT**: Use `z.preprocess` for boolean parsing - query strings come as `"true"/"false"` strings.

```typescript
import { z } from 'zod'

// Helper for boolean query params (come as strings from URL)
const booleanFromString = z.preprocess(
  (val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    if (typeof val === 'boolean') return val
    return undefined
  },
  z.boolean().optional()
)

// Add to root route's validateSearch
const globalSearchSchema = z.object({
  currency: z.enum(['RON', 'EUR', 'USD']).optional(),
  inflation_adjusted: booleanFromString,
  // Keep existing params like lang
}).passthrough()  // Allow child routes to add their own params

export const Route = createRootRoute({
  validateSearch: globalSearchSchema,
  // ... rest of root route
})
```

### Step 2: Create `useGlobalSettings` Hook

**File**: `src/lib/hooks/useGlobalSettings.ts` (new file)

**CRITICAL FIX**: The hook must maintain persisted state in React that updates when cookies are written.
- `ssrSettings` is immutable (from loader) - only used for initial hydration
- We need React state seeded from SSR values that updates when user changes settings
- Without this, clearing URL params would fall back to stale SSR values

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import type { Currency } from '@/schemas/charts'
import { parseCurrencyParam, parseBooleanParam, DEFAULT_CURRENCY, DEFAULT_INFLATION_ADJUSTED } from '@/lib/globalSettings/params'
import { setPreferenceCookie, USER_CURRENCY_STORAGE_KEY, USER_INFLATION_ADJUSTED_STORAGE_KEY } from '@/lib/user-preferences'

type SSRSettings = {
  currency: Currency           // Cookie-only value (NOT URL-mixed)
  inflationAdjusted: boolean   // Cookie-only value (NOT URL-mixed)
}

type ForcedOverrides = {
  currency?: Currency
  inflationAdjusted?: boolean
}

type SettingSource = 'forced' | 'url' | 'persisted'

/**
 * Unified global settings hook that handles:
 * - URL params (highest priority for sharing)
 * - SSR hydration (matches server render)
 * - Cookie persistence (survives refresh)
 * - Forced overrides (route constraints like total_euro → EUR)
 *
 * Key insight: We maintain React state for persisted values because:
 * 1. SSR loader returns cookie-only values (ssrSettings)
 * 2. This state seeds from SSR during hydration
 * 3. When user changes settings, we update BOTH cookie AND this state
 * 4. This ensures clearing URL falls back to current preference, not stale SSR
 */
export function useGlobalSettings(
  ssrSettings: SSRSettings,
  forcedOverrides?: ForcedOverrides
) {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const [isHydrated, setIsHydrated] = useState(false)

  // Persisted state - seeded from SSR, updated when cookies written
  // This is the "live" persisted preference that survives URL clears
  const [persistedCurrency, setPersistedCurrency] = useState<Currency>(ssrSettings.currency)
  const [persistedInflation, setPersistedInflation] = useState<boolean>(ssrSettings.inflationAdjusted)

  useEffect(() => { setIsHydrated(true) }, [])

  // Parse URL params
  const urlCurrency = parseCurrencyParam(search?.currency)
  const urlInflation = parseBooleanParam(search?.inflation_adjusted)

  // Resolve currency with full priority chain
  const { currency, currencySource } = useMemo(() => {
    // 1. Forced override (route constraint)
    if (forcedOverrides?.currency !== undefined) {
      return { currency: forcedOverrides.currency, currencySource: 'forced' as SettingSource }
    }
    // 2. URL param
    if (urlCurrency !== undefined) {
      return { currency: urlCurrency, currencySource: 'url' as SettingSource }
    }
    // 3. Persisted preference (React state, updated when cookie written)
    // During SSR/hydration: uses ssrSettings.currency (initial state value)
    // After user changes: uses updated persistedCurrency
    return { currency: persistedCurrency, currencySource: 'persisted' as SettingSource }
  }, [forcedOverrides?.currency, urlCurrency, persistedCurrency])

  // Resolve inflationAdjusted with full priority chain
  const { inflationAdjusted, inflationSource } = useMemo(() => {
    if (forcedOverrides?.inflationAdjusted !== undefined) {
      return { inflationAdjusted: forcedOverrides.inflationAdjusted, inflationSource: 'forced' as SettingSource }
    }
    if (urlInflation !== undefined) {
      return { inflationAdjusted: urlInflation, inflationSource: 'url' as SettingSource }
    }
    return { inflationAdjusted: persistedInflation, inflationSource: 'persisted' as SettingSource }
  }, [forcedOverrides?.inflationAdjusted, urlInflation, persistedInflation])

  // Sync URL → cookie + React state (only when NOT forced)
  useEffect(() => {
    if (!isHydrated) return

    // Only sync if value came from URL and is not being forced
    if (currencySource === 'url' && urlCurrency !== undefined) {
      setPreferenceCookie(USER_CURRENCY_STORAGE_KEY, urlCurrency)
      setPersistedCurrency(urlCurrency)  // Update React state too
    }
  }, [isHydrated, currencySource, urlCurrency])

  useEffect(() => {
    if (!isHydrated) return

    if (inflationSource === 'url' && urlInflation !== undefined) {
      setPreferenceCookie(USER_INFLATION_ADJUSTED_STORAGE_KEY, String(urlInflation))
      setPersistedInflation(urlInflation)  // Update React state too
    }
  }, [isHydrated, inflationSource, urlInflation])

  // Helper to write to BOTH cookie and React state
  const writeCurrencyPref = useCallback((value: Currency) => {
    setPreferenceCookie(USER_CURRENCY_STORAGE_KEY, value)
    setPersistedCurrency(value)
  }, [])

  const writeInflationPref = useCallback((value: boolean) => {
    setPreferenceCookie(USER_INFLATION_ADJUSTED_STORAGE_KEY, String(value))
    setPersistedInflation(value)
  }, [])

  // Setters: update cookie + React state + URL
  const setCurrency = useCallback((value: Currency) => {
    if (forcedOverrides?.currency !== undefined) {
      console.warn('Cannot change currency: forced by route')
      return
    }
    writeCurrencyPref(value)
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, currency: value }),
      replace: true,
      resetScroll: false,
    })
  }, [navigate, forcedOverrides?.currency, writeCurrencyPref])

  const setInflationAdjusted = useCallback((value: boolean) => {
    if (forcedOverrides?.inflationAdjusted !== undefined) {
      console.warn('Cannot change inflation_adjusted: forced by route')
      return
    }
    writeInflationPref(value)
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, inflation_adjusted: value }),
      replace: true,
      resetScroll: false,
    })
  }, [navigate, forcedOverrides?.inflationAdjusted, writeInflationPref])

  // Batch setter for atomic updates
  const setSettings = useCallback((updates: { currency?: Currency; inflationAdjusted?: boolean }) => {
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
      navigate({
        search: (prev: Record<string, unknown>) => ({ ...prev, ...searchUpdates }),
        replace: true,
        resetScroll: false,
      })
    }
  }, [navigate, forcedOverrides, writeCurrencyPref, writeInflationPref])

  return {
    currency,
    inflationAdjusted,
    setCurrency,
    setInflationAdjusted,
    setSettings,
    // Debugging/UI metadata
    source: {
      currency: currencySource,
      inflationAdjusted: inflationSource,
    },
    isForced: {
      currency: forcedOverrides?.currency !== undefined,
      inflationAdjusted: forcedOverrides?.inflationAdjusted !== undefined,
    },
  }
}
```

### Step 3: Update SSR Loader (URL-First + Return Cookie-Only Settings)

**File**: `src/routes/entities.$cui.tsx`

**CRITICAL FIX**: `ssrSettings` must contain ONLY cookie-derived values, not URL-mixed values.

Why? The hook uses `ssrSettings` to initialize React state for persisted preferences.
If we mix URL into `ssrSettings`, then:
1. User visits `?currency=EUR` (URL override)
2. SSR returns `ssrSettings.currency = EUR` (URL-mixed - WRONG)
3. User clears URL manually
4. Hook falls back to `persistedCurrency` which was seeded with EUR
5. But cookie still says RON → mismatch!

The fix: Return `persistedCurrency = cookieCurrency ?? DEFAULT` (cookie-only).

```typescript
import { parseCurrencyParam, parseBooleanParam, DEFAULT_CURRENCY, DEFAULT_INFLATION_ADJUSTED } from '@/lib/globalSettings/params'
import { readUserCurrencyPreference, readUserInflationAdjustedPreference } from '@/lib/user-preferences'

// In loader:
loader: async ({ context, params, location, preload }) => {
  const { queryClient } = context
  const search = entitySearchSchema.parse(location.search)

  // 1. Parse URL params (for data fetching, NOT for ssrSettings)
  const urlCurrency = parseCurrencyParam(search?.currency)
  const urlInflation = parseBooleanParam(search?.inflation_adjusted)

  // 2. Read cookies (SSR-readable persistence) - THIS is what ssrSettings uses
  const cookieCurrency = await readUserCurrencyPreference()
  const cookieInflation = await readUserInflationAdjustedPreference()

  // 3. Persisted settings: cookie-only (NOT URL-mixed)
  // This seeds the hook's React state and must match what's actually persisted
  const persistedCurrency = cookieCurrency ?? DEFAULT_CURRENCY
  const persistedInflation = cookieInflation ?? DEFAULT_INFLATION_ADJUSTED

  // 4. Apply forced overrides (route-specific constraints)
  const normalizationRaw = search?.normalization ?? 'total'
  const normalization = normalizationRaw === 'total_euro' ? 'total'
    : normalizationRaw === 'per_capita_euro' ? 'per_capita'
    : normalizationRaw

  // Forced: total_euro/per_capita_euro → EUR
  const forcedCurrency = (normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro')
    ? 'EUR' as const
    : undefined

  // Forced: percent_gdp → inflationAdjusted=false
  const forcedInflation = normalization === 'percent_gdp' ? false : undefined

  // 5. Effective values for data fetching: Forced > URL > Persisted
  const effectiveCurrency = forcedCurrency ?? urlCurrency ?? persistedCurrency
  const effectiveInflation = forcedInflation ?? urlInflation ?? persistedInflation

  // ... fetch data with effectiveCurrency and effectiveInflation ...

  // 6. Return settings for client hydration
  return {
    ssrSettings: {
      // COOKIE-ONLY values - seeds hook's React state for persisted prefs
      currency: persistedCurrency,
      inflationAdjusted: persistedInflation,
    },
    forcedOverrides: {
      currency: forcedCurrency,
      inflationAdjusted: forcedInflation,
    },
    // ... other loader data
  }
}
```

**Key insight**: Separate concerns:
- `ssrSettings`: What's actually persisted (cookie-only) - seeds React state
- `forcedOverrides`: Route constraints that override everything
- Data fetching uses: `forced ?? url ?? persisted` (computed in loader)
- Hook computes effective value using same priority chain

### Step 4: Update Client Component

**File**: `src/routes/entities.$cui.lazy.tsx`

```typescript
import { useGlobalSettings } from '@/lib/hooks/useGlobalSettings'

function EntityDetailsPage() {
  const loaderData = Route.useLoaderData()
  const search = useSearch({ from: '/entities/$cui' })

  // Compute forced overrides (same logic as loader)
  const normalizationRaw = search.normalization ?? 'total'
  const normalization = normalizationRaw === 'total_euro' ? 'total'
    : normalizationRaw === 'per_capita_euro' ? 'per_capita'
    : normalizationRaw

  const forcedOverrides = useMemo(() => ({
    currency: (normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro')
      ? 'EUR' as const
      : undefined,
    inflationAdjusted: normalization === 'percent_gdp' ? false : undefined,
  }), [normalizationRaw, normalization])

  // Use unified hook with SSR settings + forced overrides
  const {
    currency,
    inflationAdjusted,
    setCurrency,
    setInflationAdjusted,
    setSettings,
    source,
    isForced,
  } = useGlobalSettings(loaderData.ssrSettings, forcedOverrides)

  // currency and inflationAdjusted are now fully resolved
  // - Includes forced overrides
  // - No need for separate handling

  // Use in data fetching
  const { data: entity } = useEntityDetails({
    cui,
    normalization,
    currency,  // Already includes forced override if applicable
    inflation_adjusted: inflationAdjusted,
    // ...
  })

  // Optional: Show UI indicator when forced
  // {isForced.currency && <Badge>Currency locked to EUR</Badge>}

  // ...
}
```

### Step 5: Remove Old URL Consumption Logic

**File**: `src/routes/entities.$cui.lazy.tsx`

Delete the entire `useEffect` block (lines ~214-234) that consumed URL params:

```typescript
// DELETE THIS ENTIRE BLOCK - now handled by useGlobalSettings
useEffect(() => {
  if (currencyParam) {
    setUserCurrency(currencyParam)
    updateSearch({ currency: undefined })
    return
  }
  // ... rest of the effect
}, [...])
```

### Step 6: Clean Up Unused Imports

**File**: `src/routes/entities.$cui.lazy.tsx`

```typescript
// Remove these imports (now handled by useGlobalSettings):
// - import { useUserCurrency } from '@/lib/hooks/useUserCurrency'
// - import { useUserInflationAdjusted } from '@/lib/hooks/useUserInflationAdjusted'
// - import { useHydratedValue } from '@/lib/hooks/useHydratedValue'
```

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/globalSettings/params.ts` | **NEW** | Shared parsing (DRY) |
| `src/routes/__root.tsx` | **UPDATE** | Add global search schema |
| `src/lib/hooks/useGlobalSettings.ts` | **NEW** | Unified settings hook |
| `src/routes/entities.$cui.tsx` | **UPDATE** | URL-first loader, return ssrSettings |
| `src/routes/entities.$cui.lazy.tsx` | **UPDATE** | Use new hook, remove old logic |
| `src/lib/hooks/useHydratedValue.ts` | **DELETE** | Absorbed into useGlobalSettings |

## Data Flow: Complete Resolution Chain

**Key Principles**:
1. Forced overrides trump everything (route constraints)
2. URL is shareable state (highest user-controlled priority)
3. Cookie is SSR-readable persistence (survives refresh)
4. URL→cookie sync only when NOT forced (no contradictions)

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESOLUTION PRIORITY                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Forced override (route constraint)                          │
│  2. URL param (?currency=EUR)                                   │
│  3. Cookie (SSR-readable persistence)                           │
│  4. Default                                                     │
├─────────────────────────────────────────────────────────────────┤
│  WRITE: Cookie (persistence) + URL (live state) simultaneously  │
│  SYNC:  URL→Cookie only when source='url' AND not forced        │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario 1: Shared Link `?currency=EUR`
```
1. SSR: URL=EUR > cookie → uses EUR, fetches EUR data
2. Client hydration: ssrSettings.currency=EUR → renders EUR
3. After hydration: source='url', not forced → syncs EUR to cookie
4. Result: EUR shown, cookie updated, URL shareable ✓
```

### Scenario 2: User Changes Currency via UI
```
1. setCurrency('RON') called
2. Writes cookie: RON (persistence)
3. Updates URL: ?currency=RON (live state)
4. Result: RON shown, URL shareable ✓
```

### Scenario 3: User Clears URL (types clean URL)
```
1. User previously set EUR via UI (wrote to cookie + React state)
2. URL: no currency param (user manually cleared it)
3. Hook falls back to persistedCurrency React state: EUR
4. Result: EUR shown ✓ (matches what user previously set)

NOTE: This works because we maintain React state for persisted values.
If we used ssrSettings directly, it would be stale (from initial page load).
```

### Scenario 4: Hard Refresh Without URL Param
```
1. URL: no currency param
2. SSR reads cookie: RON
3. Returns ssrSettings.currency=RON
4. Client hydrates with RON
5. Result: RON shown, NO FLICKER ✓
```

### Scenario 5: Forced Override (total_euro view)
```
1. URL has ?currency=USD (from previous page)
2. Route forces currency=EUR (total_euro)
3. forcedOverrides.currency=EUR
4. Effective currency: EUR (forced wins)
5. URL→cookie sync SKIPPED (source='forced')
6. Result: EUR shown, USD NOT persisted ✓
```

### Scenario 6: Navigate Between Routes
```
1. On page A: ?currency=EUR in URL
2. Navigate to page B
3. Root schema includes currency → param preserved
4. Result: EUR still in URL ✓
```

### Scenario 7: User Changes Setting Then Clears URL (Critical Fix Demo)
```
This scenario demonstrates why we need React state for persisted values:

Initial state: cookie=RON, no URL param

1. User visits page → shows RON (from ssrSettings, seeded from cookie)
2. User clicks EUR toggle:
   - setCurrency('EUR') writes cookie=EUR
   - setCurrency('EUR') updates persistedCurrency React state=EUR
   - URL updated to ?currency=EUR
3. User manually clears URL (types clean URL in address bar)
4. Hook resolves: forced=none, url=none → falls back to persistedCurrency
5. persistedCurrency = EUR (updated in step 2)
6. Result: EUR shown ✓

WITHOUT React state fix (bug):
- Step 5 would use ssrSettings.currency = RON (stale from page load)
- Result: RON shown ✗ (wrong - user changed to EUR!)
```

## Behavior Summary

| Action | URL | Cookie | Forced | Result | Sync |
|--------|-----|--------|--------|--------|------|
| Visit `?currency=EUR` | EUR | (any) | - | EUR | URL→cookie |
| User clicks RON | →RON | →RON | - | RON | Both updated |
| User clears URL | - | EUR | - | EUR | No sync |
| Fresh visit | - | - | - | Default | No sync |
| SSR with `?currency=EUR` | EUR | (any) | - | EUR | Cookie read only |
| Route forces EUR | USD | (any) | EUR | EUR | **No sync** |
| Leave forced route | USD | USD | - | USD | Normal |

**Key**: When `Forced` column has value, URL→cookie sync is blocked to prevent contradictory persistence.

## Verification Checklist

### Basic Functionality
1. **Sharing**: Visit `?currency=EUR` → shows EUR, URL stays, can be shared
2. **SSR**: Hard refresh with `?currency=EUR` → SSR renders EUR correctly
3. **Hydration**: No flicker between SSR and client (inspect Network, disable JS)
4. **UI Changes**: Change currency via toggle → URL updates to `?currency=RON`
5. **Persistence**: Clear URL manually, refresh → uses saved preference
6. **Default**: Fresh visit (clear cookies, no URL) → shows default RON

### Critical SSR Test (catches cookie sync issues)
7. **Hard refresh without URL after setting change**:
   - Change currency to EUR via UI
   - Navigate to URL WITHOUT `?currency=...`
   - Hard refresh (Ctrl+Shift+R)
   - **Expected**: SSR renders EUR (from cookie), no client correction/flicker

### Forced Override Test (catches persistence bugs)
8. **Forced route + existing URL params**:
   - Visit page with `?currency=USD` in URL
   - Navigate to route that forces EUR (e.g., total_euro normalization)
   - **Expected**:
     - Page shows EUR (forced)
     - Cookie is NOT updated to USD (no contradictory persistence)
     - Leaving forced route → shows USD (from URL) or previous preference

### Navigation Test (catches router schema issues)
9. **Cross-route navigation preserves params**:
   - Set `?currency=EUR` on entity page
   - Navigate to another route (e.g., budget explorer)
   - Navigate back
   - **Expected**: `?currency=EUR` still in URL

### Edge Cases
10. **Conflicting URL and forced**: URL says USD, route forces EUR → shows EUR, no sync
11. **Rapid changes**: Toggle currency multiple times quickly → stable final state
12. **Invalid URL param**: `?currency=INVALID` → falls back to cookie/default
# Meeting Summary

## Overview
Discussion about a transparency platform for public budget data in Romania, featuring feedback from journalist Georgiana on its utility and potential improvements.

## Key Discussion Points

### Platform Features Discussed
- Platform displays budget executions aggregated monthly and annually from official documents
- Data is broken down into functional and economic spending categories
- Integration with SICAP (public procurement platform) for contract information
- Interactive charts and filtering capabilities for detailed analysis
- Alert system for monitoring specific budget items

### Journalist Use Case (Georgiana)
- Georgiana researched Ministry of Environment spending, looking for monthly/quarterly expenditure lists
- Found local governments (Oradea municipality and county) publish monthly spending lists showing payments to companies
- Attempted to track travel expenses but found information gaps - found flight tickets in SICAP but not accommodation costs
- Uses combination of public data sources, Freedom of Information requests (Law 544), and SICAP searches
- Finds aggregated budget execution data useful for contextualizing stories without manual historical analysis

### Data Sources & Technical Details
- Budget execution data from Ministry of Finance (mandatory reporting by 15th of following month)
- ANAF verification mechanism through treasury
- Public procurement data from SICAP
- Plans to integrate investment tracking data from Ministry of European Funds
- Working with Rada from sica.ai to integrate platforms
- Exploring AI-powered PDF and video content extraction for local council meetings

### Identified Gaps & Challenges
- Difficult to extract program-specific spending reliably
- No standardized formula for consolidated spending calculations
- Platform needs better UX and tutorials for filter usage
- Challenge tracking individual expense items (travel, accommodation, per diem)
- Institutions sometimes withhold information despite legal obligations

## Action Items

- **Claudiu**: Create video and text-based tutorials explaining filter functionality
- **Claudiu**: Continue work on integrating public procurement data with Rada from sica.ai
- **Claudiu**: Explore extracting program-specific spending data from budget executions
- **Claudiu**: Add investment data from Ministry of European Funds platform through scraping
- **Claudiu**: Improve UX to make platform more intuitive
- **Claudiu**: Work with Funky Citizens to create educational content
- **Claudiu**: Reach out to local press through Georgiana's contact at PressHub WhatsApp group
- **Team**: Keep Georgiana updated via email on platform developments
- **Team**: Consider creating journalist-specific content and guides with expert input

## Platform Promotion Opportunity
Georgiana suggested promoting platform to local journalists through PressHub's WhatsApp group, which connects multiple local newspapers. She offered to provide contact information.