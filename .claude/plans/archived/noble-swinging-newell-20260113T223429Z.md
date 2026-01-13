# Plan: Fix Entity Details Flickering on Page Load

## Problem Analysis

### Root Cause

The entity lifecycle page flickers on initial load (hard refresh) because:

1. **SSR prefetches entity data** in the loader (`entities.$cui.tsx:79`):
   ```typescript
   await queryClient.ensureQueryData(detailsOptions);
   ```

2. **Query key uses a hash of all parameters**, including `currency` and `inflation_adjusted`:
   ```typescript
   // useEntityDetails.ts:17-18
   const payloadString = JSON.stringify(params);
   const hash = generateHash(payloadString);
   return queryOptions({ queryKey: ['entityDetails', hash], ... });
   ```

3. **User preferences resolve differently on SSR vs client**:
   - **SSR**: `readUserCurrencyPreference()` reads from **cookies** via `getCookie()` from `@tanstack/react-start/server`
   - **Client**: `useUserCurrency()` uses `usePersistedState()` which reads from **localStorage** first
   - If localStorage has a value but cookie doesn't (or differs), the query key hash differs

4. **Query key mismatch causes cache miss**: Client generates hash Y, but SSR cached data with hash X

5. **EntityHeader shows skeleton when `!entity`** (`EntityHeader.tsx:52-53`)

### Evidence from HAR File

Multiple GraphQL calls to `api.transparenta.eu/graphql` - one from SSR, another from client hydration.

## Proposed Solution

### Strategy: Return SSR Params from Loader + Derive Placeholder from Rehydrated Cache

Instead of duplicating entity data in the loader response, return just the SSR params. The component can then derive the SSR entity from the rehydrated queryClient cache. This avoids payload duplication since `setupRouterSsrQueryIntegration` already handles query dehydration.

### Implementation Steps

#### Step 1: Return SSR params from loader

**File:** `src/routes/entities.$cui.tsx`

```typescript
// At end of loader, always return SSR params (even if undefined)
// This is a small payload - just the params used for SSR fetch
return {
  ssrParams: {
    cui: params.cui,
    normalization,
    currency,
    inflation_adjusted: inflationAdjusted,
    show_period_growth: showPeriodGrowth,
    reportPeriod,
    reportType,
    trendPeriod,
    mainCreditorCui,
  }
};
```

#### Step 2: Derive SSR entity from cache in lazy component

**File:** `src/routes/entities.$cui.lazy.tsx`

```typescript
// Inside EntityDetailsPage function (after queryClient line 97)
const loaderData = Route.useLoaderData();

// Derive SSR entity from rehydrated cache using SSR params
const ssrPlaceholder = useMemo(() => {
  if (!loaderData?.ssrParams) return undefined;
  const ssrQueryOptions = entityDetailsQueryOptions(loaderData.ssrParams);
  return queryClient.getQueryData<EntityDetailsData>(ssrQueryOptions.queryKey);
}, [loaderData?.ssrParams, queryClient]);

// Pass to useEntityDetails
const { data: entity, isLoading, isError, error } = useEntityDetails({
  cui,
  normalization,
  currency,
  inflation_adjusted: inflationAdjusted,
  show_period_growth: showPeriodGrowth,
  reportPeriod,
  reportType: reportTypeState,
  trendPeriod,
  mainCreditorCui: mainCreditorState,
}, {
  ssrPlaceholder,
});
```

#### Step 3: Update useEntityDetails with proper placeholderData function

**File:** `src/lib/hooks/useEntityDetails.ts`

```typescript
interface UseEntityDetailsOptions {
  ssrPlaceholder?: EntityDetailsData;
}

export function useEntityDetails(
  params: UseEntityDetailsProps & NormalizationOptions,
  options?: UseEntityDetailsOptions
) {
  const queryOpts = entityDetailsQueryOptions(params);

  return useQuery({
    ...queryOpts,
    // Use function to preserve keepPreviousData behavior
    // Priority: previous data > SSR placeholder > undefined
    placeholderData: (previousData) => previousData ?? options?.ssrPlaceholder,
  });
}
```

### Files to Modify

| File | Change |
|------|--------|
| `src/routes/entities.$cui.tsx` | Return `{ ssrParams }` from loader (small payload) |
| `src/routes/entities.$cui.lazy.tsx` | Derive SSR entity from queryClient cache using ssrParams |
| `src/lib/hooks/useEntityDetails.ts` | Use function for `placeholderData` to preserve `keepPreviousData` |

### Why This Works

1. **SSR prefetches data** → stored in QueryClient cache
2. **Loader returns SSR params** (small payload, not the full entity)
3. **`setupRouterSsrQueryIntegration` dehydrates/rehydrates cache** → no duplication
4. **Component derives SSR entity** from rehydrated cache using SSR query key
5. **`placeholderData: (prev) => prev ?? ssrPlaceholder`** → keeps `keepPreviousData` priority
6. **Background refetch** happens if client params differ, updating data without flicker

### Currency Mismatch Caveat

If SSR uses different currency than client, we briefly show SSR numbers before the background refetch completes. **Decision: Accept brief mismatch** - it's better than showing a skeleton flash.

## Verification Plan

1. **Manual Testing**:
   - Hard refresh entity page (Cmd+Shift+R / Ctrl+Shift+R)
   - Verify entity header shows immediately without skeleton flash
   - Verify entity name, CUI, and category badge appear instantly

2. **Test Scenarios**:
   - Clear localStorage, reload → should use cookie/default values
   - Set different currency in localStorage than cookie → should show SSR data first, then update
   - Navigate between entities → should use `keepPreviousData` during transition

3. **Network Verification**:
   - Open DevTools Network tab
   - Hard refresh and check GraphQL calls
   - Accept that two calls may happen (SSR + client with different params), but UI should not flicker

4. **Type Check**:
   - Run `yarn typecheck` to ensure no type errors introduced

## Complexity Assessment

- **Low complexity**: 3 files, ~20 lines changed total
- **Low risk**: Using TanStack Query's built-in `placeholderData` feature
- **No breaking changes**: Existing behavior preserved, just adding fallback data
