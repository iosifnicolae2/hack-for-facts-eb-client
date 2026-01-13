# Plan: Implement Vercel CDN Caching Headers for Entity Pages

## Summary

Add `Vercel-CDN-Cache-Control` headers and increase `stale-while-revalidate` times to reduce SSR TTFB for entity pages.

## Current State

Both entity routes already have cache headers, but they're missing the Vercel-specific header and have a shorter stale-while-revalidate window:

| Route | Current Headers |
|-------|-----------------|
| `entities.$cui.tsx` | `public, max-age=0, s-maxage=300, stale-while-revalidate=3600` |
| `entity-analytics.tsx` | `public, max-age=0, s-maxage=300, stale-while-revalidate=3600` |

## Proposed Changes

### Files to Modify

1. **`src/routes/entities.$cui.tsx`** (lines 22-25)
2. **`src/routes/entity-analytics.tsx`** (lines 44-47)

### New Headers Configuration

```typescript
headers: () => ({
  // Browser: don't cache; CDN: cache 5 min; allow serving stale while revalidating
  "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  // Vercel-specific header for explicit CDN control
  "Vercel-CDN-Cache-Control": "max-age=300, stale-while-revalidate=86400",
}),
```

### Changes Explained

| Setting | Current | Proposed | Reason |
|---------|---------|----------|--------|
| `stale-while-revalidate` | 3600 (1h) | 86400 (24h) | Allow serving stale content longer while background refresh happens |
| `Vercel-CDN-Cache-Control` | Not set | Added | Explicit Vercel CDN control, higher priority than Cache-Control |

## Implementation Steps

1. Update `src/routes/entities.$cui.tsx` headers function
2. Update `src/routes/entity-analytics.tsx` headers function
3. Run `yarn typecheck` to verify no type errors
4. Deploy and verify via Vercel dashboard that CDN cache is being used

## Verification

After deployment:
1. Check Vercel Analytics for reduced "processing" phase time
2. Verify `x-vercel-cache` response header shows `HIT` on repeat requests
3. Monitor 5-minute average latency alert for improvement

## Considerations

- **URL-based caching**: Vercel caches based on full URL including query params, so different filter combinations will have separate cache entries
- **User preferences**: The loader reads user preferences (currency, inflation adjusted) from cookies. **Decision: Ignore cookie variance** - most users use defaults, and URL params override cookies anyway. Users with custom preferences may briefly see default content until client-side hydration.
- **No Set-Cookie on these routes**: These are public pages without auth-dependent content rendering
