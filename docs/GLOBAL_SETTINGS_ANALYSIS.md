# Global Settings System - Technical Analysis

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [State Sources](#state-sources)
4. [Data Flow Analysis](#data-flow-analysis)
5. [Expected Behavior](#expected-behavior)
6. [Current Problems](#current-problems)
7. [Root Cause Analysis](#root-cause-analysis)
8. [Proposed Solution](#proposed-solution)

---

## System Overview

The global settings system manages two user preferences across the application:
- **Currency**: RON (default), EUR, USD
- **Inflation Adjusted**: boolean (default: false)

### Key Requirements
1. **CDN Cacheability**: SSR must use URL params only (same URL = same cache entry)
2. **User Preferences**: Persist settings in cookies/localStorage for return visits
3. **Shareability**: URLs should contain settings for link sharing
4. **Forced Overrides**: Some normalization modes force specific settings (e.g., `total_euro` → EUR)

### Implementation Status (PR1)

The entities page follows a "persist-only + single navigate" model:
- URL remains the session source of truth (`forced overrides` > `URL params` > `persisted preferences`)
- Opening a shared link does not rewrite the user's stored preferences
- Preferences persist only on explicit user change (no automatic URL → cookie sync)
- Forced normalization omits implied params, and leaving forced restores persisted prefs

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER REQUEST                                    │
│                     /entities/123?currency=EUR                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROUTE LOADER (entities.$cui.tsx)                     │
│                                                                              │
│  1. Parse URL params:                                                        │
│     urlCurrency = parseCurrencyParam(search?.currency)  // EUR               │
│                                                                              │
│  2. Resolve normalization → forcedOverrides:                                 │
│     resolveNormalizationSettings(normalizationRaw)                           │
│                                                                              │
│  3. Compute effective currency (Priority Chain):                             │
│     forcedCurrency ?? urlCurrency ?? clientCurrency ?? DEFAULT_CURRENCY      │
│                                                                              │
│  4. Fetch data with computed currency                                        │
│                                                                              │
│  5. Return: { ssrParams, ssrSettings, forcedOverrides }                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT (entities.$cui.lazy.tsx)                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    useGlobalSettings(ssrSettings, forcedOverrides)      ││
│  │                                                                         ││
│  │  State:                                                                 ││
│  │  ├── persistedCurrency (from cookie/localStorage or DEFAULT)           ││
│  │  ├── persistedInflation                                                 ││
│  │  ├── displayCurrency (lags until data loads)                           ││
│  │  ├── isHydrated (false → true after mount)                             ││
│  │  └── hasSyncedPrefs (tracks if sync effect ran)                        ││
│  │                                                                         ││
│  │  Resolution (Priority Chain):                                           ││
│  │  1. forcedOverrides?.currency                                           ││
│  │  2. urlCurrency (from useSearch)                                        ││
│  │  3. persistedCurrency (from state)                                      ││
│  │                                                                         ││
│  │  Returns:                                                               ││
│  │  ├── currency (for data fetching)                                       ││
│  │  ├── displayCurrency (for UI)                                           ││
│  │  ├── persistSettings (updates cookie/state only)                        ││
│  │  └── confirmSettingsApplied (syncs display)                             ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Data Fetching:                                                              │
│  useEntityDetails({ currency, ... })  // uses hook's currency                │
│                                                                              │
│  UI Display:                                                                 │
│  <Overview normalizationOptions={{ currency: displayCurrency, ... }} />      │
│                                                                              │
│  User Changes Currency:                                                      │
│  handleNormalizationChange → persistSettings(...) + updateSearch(...)        │
│  ↑ One navigation; persistence only when user changed fields                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## State Sources

### 1. URL Search Params (Primary Source of Truth)
```typescript
// Parsed in both loader and hook
const urlCurrency = parseCurrencyParam(search?.currency)
const urlInflation = parseBooleanParam(search?.inflation_adjusted)
```

### 2. Cookies/LocalStorage (Persisted User Preference)
```typescript
// user-preferences.ts
export function readClientCurrencyPreference(): Currency | null {
  if (typeof window === 'undefined') return null  // SSR safe
  const localValue = normalizeCurrency(localStorage.getItem(USER_CURRENCY_STORAGE_KEY))
  if (localValue) return localValue
  return normalizeCurrency(readCookieValue(USER_CURRENCY_STORAGE_KEY))
}
```

### 3. React State (In-Memory)
```typescript
// useGlobalSettings.ts
const [persistedCurrency, setPersistedCurrency] = useState<Currency>(() =>
  readClientCurrencyPreference() ?? DEFAULT_CURRENCY
)
```

### 4. Forced Overrides (Route Constraints)
```typescript
// params.ts
export function resolveNormalizationSettings(normalizationRaw): ResolvedSettings {
  const forcedOverrides = {
    currency: (normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro')
      ? 'EUR' : undefined,
    inflationAdjusted: normalization === 'percent_gdp' ? false : undefined,
  }
  return { normalization, forcedOverrides }
}
```

---

## Data Flow Analysis

### Scenario 1: SSR (Full Page Load)

```
URL: /entities/123 (no currency param)
User Cookie: currency=EUR

1. LOADER (Server Side)
   ├── urlCurrency = undefined
   ├── isClient = false (no window)
   ├── clientCurrency = null (not read on server)
   ├── currency = DEFAULT_CURRENCY = 'RON'
   ├── FETCH DATA WITH RON ✓
   └── ssrSettings = { currency: 'RON' }

2. COMPONENT (Client Hydration)
   ├── useGlobalSettings({ currency: 'RON' }, undefined)
   │   ├── persistedCurrency = readClientCurrencyPreference() ?? DEFAULT → 'EUR' (from cookie)
   │   ├── urlCurrency = undefined
   │   ├── RESOLUTION: forcedOverrides?.currency ?? urlCurrency ?? persistedCurrency
   │   │               undefined           ?? undefined  ?? 'EUR' = 'EUR'
   │   ├── currency = 'EUR' (for fetching)
   │   └── displayCurrency = 'RON' (from ssrSettings, lags)
   │
   ├── useEntityDetails({ currency: 'EUR' })  ← REFETCH TRIGGERED!
   │
   └── SYNC EFFECT:
       ├── clientCurrency = 'EUR'
       ├── urlCurrency = undefined
       ├── loaderUsedClientPref = ssrSettings.currency === clientCurrency → 'RON' === 'EUR' → false
       ├── Condition: urlCurrency === undefined && !loaderUsedClientPref → TRUE
       └── router.navigate({ currency: 'EUR' })  ← URL UPDATED

RESULT: Double fetch (RON then EUR), but correct final state
```

### Scenario 2: Client Navigation (With URL Param)

```
URL: /entities/123?currency=EUR
User Cookie: currency=RON

1. LOADER (Client Side)
   ├── urlCurrency = 'EUR'
   ├── isClient = true
   ├── clientCurrency = 'RON' (from cookie)
   ├── currency = forcedCurrency ?? urlCurrency ?? clientCurrency ?? DEFAULT
   │            = undefined ?? 'EUR' ?? 'RON' ?? 'RON' = 'EUR' ✓
   ├── FETCH DATA WITH EUR ✓
   └── ssrSettings = { currency: 'EUR' }

2. COMPONENT
   ├── useGlobalSettings({ currency: 'EUR' }, undefined)
   │   ├── persistedCurrency = 'RON' (from cookie via lazy init)
   │   ├── urlCurrency = 'EUR'
   │   ├── RESOLUTION: forcedOverrides?.currency ?? urlCurrency ?? persistedCurrency
   │   │               undefined           ?? 'EUR'     ?? 'RON' = 'EUR' ✓
   │   └── currency = 'EUR'
   │
   └── SYNC EFFECT:
       ├── clientCurrency = 'RON'
       ├── urlCurrency = 'EUR'
       ├── Condition: urlCurrency === undefined → FALSE
       └── NO URL UPDATE (respects explicit URL param) ✓

RESULT: Single fetch with EUR, correct behavior
```

### Scenario 3: User Changes Currency (THE BUG)

```
Current URL: /entities/123?currency=EUR
User clicks to change currency to RON

1. handleNormalizationChange({ currency: 'RON', ... })
   └── updateSearch({ currency: 'RON' })
       └── navigate({ search: { ...prev, currency: 'RON' }})

2. URL CHANGES: /entities/123?currency=RON

3. COMPONENT RE-RENDERS
   ├── useGlobalSettings (DOES NOT UPDATE INTERNAL STATE!)
   │   ├── persistedCurrency = 'EUR' (STALE! still from initial cookie read)
   │   ├── urlCurrency = 'RON' (fresh from URL)
   │   ├── RESOLUTION: forcedOverrides?.currency ?? urlCurrency ?? persistedCurrency
   │   │               undefined           ?? 'RON'     ?? 'EUR' = 'RON' ✓
   │   └── currency = 'RON' (CORRECT because URL takes priority)
   │
   └── useEntityDetails({ currency: 'RON' })  ← SHOULD REFETCH

4. BUT: Cookie NOT updated! persistedCurrency state NOT updated!
   ├── User's preference not saved
   └── Next visit will use old EUR from cookie

PROBLEM: handleNormalizationChange bypasses useGlobalSettings.setCurrency
         which would update both cookie AND React state
```

---

## Expected Behavior

### Priority Chain (Highest to Lowest)
1. **Forced Override**: Route constraint (e.g., `total_euro` forces EUR)
2. **URL Parameter**: Explicit in URL (shareable, bookmarkable)
3. **User Preference**: From cookie/localStorage
4. **Default**: RON, inflation_adjusted=false

### User Actions

| Action | Expected Result |
|--------|-----------------|
| Visit `/entities/123` (no params) | Use user's saved preference or default |
| Visit `/entities/123?currency=EUR` | Use EUR (URL takes priority) |
| Change currency in UI | Update URL, save to cookie, refetch data |
| Share link with `?currency=EUR` | Recipient sees EUR regardless of their preference |

---

## Current Problems

The failure modes addressed by PR1:

1. **URL overwriting preferences**: automatic URL → cookie sync could overwrite a user's stored settings when opening a shared link.
2. **Preferences overwriting explicit URLs**: hydration sync could incorrectly override a URL that explicitly sets `currency`/`inflation_adjusted`.
3. **Double navigation**: persisting settings via a function that also navigates, then calling `updateSearch`, can trigger two navigations for one UI action.
4. **Forced-mode transitions**: forced currency/inflation values should not be persisted as the user's preference and should not linger in the URL.

---

## Root Cause Analysis

The core issue is mixing three concerns that have different "side effect" expectations:

1. **Session state vs. persisted preference**: URL params describe the current session/view, while cookies/localStorage describe long-lived user defaults. Automatically syncing URL → cookie makes "opening a link" mutate preferences.
2. **Implicit vs. explicit URL**: hydration sync should only fill in missing params; it must not override explicit `currency`/`inflation_adjusted` supplied by a shareable URL.
3. **Forced overrides**: forced values (e.g., EUR modes or `percent_gdp` forcing inflation off) should not be persisted as the user's preference and should not linger in the URL once the user leaves the forced mode.

---

## Proposed Solution

### PR1: One Navigation Per User Action (Implemented)

1) **Separate persistence from navigation**
- `useGlobalSettings.persistSettings(patch)` updates cookie/localStorage + in-memory state, without navigating.
- The entities page uses a single `updateSearch(patch)` call per user action to update the URL.

2) **Persist only on explicit user change**
- Do not sync URL → cookie automatically.
- Only sync persisted prefs → URL when the URL params are absent (one-time on mount), preserving shared links.

3) **Handle forced normalization cleanly**
- Compute forced overrides from the *target* normalization.
- Persist only fields that the user actually changed and are not forced by the target normalization.
- Omit forced params from the URL patch; when leaving a forced mode, restore persisted prefs into the URL.

---

## Recommendation

Use the PR1 pattern for routes that need SSR cacheability + shareable URLs:
- Treat URL params as the session source of truth.
- Persist preferences only on explicit user intent (no URL → cookie syncing).
- For forced modes, omit implied params and restore persisted prefs when leaving forced normalization.
