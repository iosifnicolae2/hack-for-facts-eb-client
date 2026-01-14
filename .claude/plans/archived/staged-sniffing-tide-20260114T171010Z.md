# Plan: Fix Client-Side Navigation Currency Bug

## Problem

When navigating to an entity page via client-side navigation (not SSR), the app:
1. Fetches data with DEFAULT_CURRENCY (RON) instead of user's saved preference
2. Then syncs preference to URL and fetches again with correct currency
3. This causes a double-fetch and brief display of wrong currency data

Prefetch is also affected - uses default currency, then retries with user preference.

## Root Cause Analysis

In `useGlobalSettings.ts`, the state initialization uses hardcoded defaults:

```typescript
// Lines 65-66 - THE BUG
const [persistedCurrency, setPersistedCurrency] = useState<Currency>(DEFAULT_CURRENCY)
const [persistedInflation, setPersistedInflation] = useState<boolean>(DEFAULT_INFLATION_ADJUSTED)
```

The currency resolution logic (lines 132-149) falls back to `persistedCurrency` when no URL param exists:
```typescript
// 3. Persisted preference
return {
  currency: persistedCurrency,  // Returns DEFAULT_CURRENCY initially!
  currencySource: 'persisted',
}
```

The user's actual preference is only read in an effect (lines 83-129) which runs after the first render, causing the race condition.

### Sequence on Client Navigation

```
Client Navigation to /entities/123 (no URL currency param)
├── Component mounts
│   └── useGlobalSettings called
│       ├── persistedCurrency = useState(DEFAULT_CURRENCY) → 'RON'
│       ├── urlCurrency = undefined
│       ├── currency = persistedCurrency → 'RON' ❌
│       └── useEntityDetails fetches with currency='RON' ❌ (WRONG)
├── Effect runs after mount
│   ├── Reads cookie → 'EUR' (user's preference)
│   ├── setPersistedCurrency('EUR')
│   └── router.navigate({ currency: 'EUR' })
├── Re-render from URL change
│   ├── urlCurrency = 'EUR'
│   └── useEntityDetails refetches with 'EUR' ✓ (CORRECT, but double fetch)
```

## Solution

Initialize state with a function that synchronously reads from cookie/localStorage. This is safe because `readClientCurrencyPreference()` returns `null` during SSR (checks `typeof window === 'undefined'`).

### Implementation

**File:** `src/lib/hooks/useGlobalSettings.ts`

**Change lines 65-66 from:**
```typescript
const [persistedCurrency, setPersistedCurrency] = useState<Currency>(DEFAULT_CURRENCY)
const [persistedInflation, setPersistedInflation] = useState<boolean>(DEFAULT_INFLATION_ADJUSTED)
```

**To:**
```typescript
// Initialize from client preferences if available (safe: returns null during SSR)
const [persistedCurrency, setPersistedCurrency] = useState<Currency>(() =>
  readClientCurrencyPreference() ?? DEFAULT_CURRENCY
)
const [persistedInflation, setPersistedInflation] = useState<boolean>(() =>
  readClientInflationAdjustedPreference() ?? DEFAULT_INFLATION_ADJUSTED
)
```

### Why This Works

1. **During SSR**: `readClientCurrencyPreference()` returns `null` (no `window`), so uses `DEFAULT_CURRENCY`
2. **During client navigation**: Synchronously reads user preference from cookie/localStorage
3. **No hydration mismatch**: SSR still uses default, client uses preference from first render
4. **Effect still needed**: The effect syncs URL ↔ preference, but now the initial render is correct

### Simplified Effect

The effect at lines 83-129 can also be simplified since we no longer need to update `persistedCurrency` on mount - it's already correct. The effect now only needs to:
1. Sync preference to URL if different (for sharing links)
2. Update state if user changes preference via URL

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/hooks/useGlobalSettings.ts` | Initialize state with lazy function that reads client preferences |

## Verification

1. **Type check**: `yarn typecheck` passes
2. **Manual test**:
   - Set preference to EUR in cookie
   - Navigate to entity via client-side Link (not full page reload)
   - Verify only ONE fetch happens (check Network tab)
   - Verify data loads in EUR immediately
3. **Prefetch test**:
   - Hover over entity link
   - Verify prefetch uses correct currency
   - Navigate and verify no additional fetch needed
4. **SSR test**:
   - Full page reload on entity page
   - Verify SSR uses default (for CDN cacheability)
   - Verify client syncs preference to URL correctly
