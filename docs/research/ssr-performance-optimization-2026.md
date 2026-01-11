# TanStack Start SSR Performance Optimization (2026)

> Exported from Claude.ai research: https://claude.ai/chat/92459dae-37c0-40e9-bf5f-9f546eecbf0d

## Problem Summary

| Metric | SPA | SSR | Issue |
|--------|-----|-----|-------|
| Document TTFB | 32ms | 284ms | 9x slower |
| Document Size | 3.2 KB | 50.5 KB | 16x larger |
| DOMContentLoaded | 283ms | 407ms | 1.4x slower |
| Load Event | 396ms | 654ms | 1.7x slower |
| Vercel Cache | HIT | MISS | No caching |

**Root cause**: Missing Cache-Control headers. TanStack Start requires explicit cache configuration.

---

## Implementation Priority

| Priority | Optimization | Expected Impact | Effort |
|----------|-------------|-----------------|--------|
| **1** | Add Cache-Control headers to routes | **TTFB: 284ms → ~50ms** | Low |
| **2** | Use `ssr: 'data-only'` for non-SEO routes | **Document: 50KB → ~15KB** | Low |
| **3** | Enable automatic code-splitting | **DOMContentLoaded: -50-100ms** | Low |
| **4** | Defer non-critical data with `<Await>` | **Perceived load: -200ms** | Medium |
| **5** | Cache auth/i18n with QueryClient | **TTFB: -30-50ms** | Medium |
| **6** | Configure Nitro ISR route rules | **Background regeneration** | Medium |

---

## 1. SSR Caching (Biggest Win)

Add `headers()` function to routes:

```typescript
// routes/index.tsx
export const Route = createFileRoute('/')({
  ssr: true,
  headers: () => ({
    'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  }),
  component: Index,
})
```

**Recommended patterns by content type:**

| Content Type | Cache-Control Header |
|-------------|---------------------|
| Marketing/blog pages | `public, max-age=3600, stale-while-revalidate=604800` |
| Product listings | `public, max-age=60, s-maxage=300, stale-while-revalidate=3600` |
| Dynamic dashboard | `public, max-age=0, s-maxage=60, stale-while-revalidate=300` |
| User-specific data | `private, no-cache` |

---

## 2. Selective SSR (Reduce Document Size)

Three SSR modes available:

```typescript
// Full SSR (default) - SEO-critical pages
export const Route = createFileRoute('/seo-critical')({
  ssr: true,
})

// Data-only - loaders run server-side, component renders client-side
// Reduces HTML payload by 80%+
export const Route = createFileRoute('/dashboard')({
  ssr: 'data-only',
})

// Client-only - behaves like SPA
export const Route = createFileRoute('/interactive-editor')({
  ssr: false,
})
```

---

## 3. Streaming SSR

Enable streaming for progressive HTML delivery:

```typescript
// src/entry-server.tsx
import {
  createRequestHandler,
  defaultStreamHandler,
} from '@tanstack/react-router/ssr/server'

export async function render({ request }: { request: Request }) {
  const handler = createRequestHandler({ request, createRouter })
  return await handler(defaultStreamHandler)
}
```

Defer non-critical data:

```typescript
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const criticalData = await fetchCriticalData()     // Blocks render
    const analyticsPromise = fetchAnalytics()          // Streams later
    return { criticalData, deferredAnalytics: analyticsPromise }
  },
})

function PostComponent() {
  const { criticalData, deferredAnalytics } = Route.useLoaderData()

  return (
    <article>
      <MainContent data={criticalData} />
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Await promise={deferredAnalytics}>
          {(data) => <AnalyticsWidget data={data} />}
        </Await>
      </Suspense>
    </article>
  )
}
```

---

## 4. Route Loader Optimization

Cache auth/i18n with QueryClient:

```typescript
// routes/__root.tsx
export const Route = createRootRoute({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ['session'],
      queryFn: getSession,
      gcTime: 5 * 60 * 1000,  // Cache for 5 minutes
    })
    return { session }
  },
})
```

Cache i18n with infinite staleTime:

```typescript
beforeLoad: async ({ context }) => {
  const messages = await context.queryClient.ensureQueryData({
    queryKey: ['i18n', locale],
    queryFn: () => getI18nMessages({ locale }),
    staleTime: Infinity,  // Messages rarely change
    gcTime: 24 * 60 * 60 * 1000,
  })
  return { messages }
}
```

---

## 5. Vite Configuration

Enable automatic code-splitting:

```typescript
// vite.config.ts
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
    }),
    // ...
  ],
})
```

Nitro ISR route rules:

```typescript
nitro({
  compatibilityDate: '2025-07-15',
  vercel: {
    config: {
      bypassToken: process.env.VERCEL_BYPASS_TOKEN,
    },
  },
  routeRules: {
    '/products/**': {
      isr: {
        expiration: 3600,
        allowQuery: ['page', 'sort'],
      },
    },
  },
}),
```

---

## 6. Global Cache Middleware

Apply default caching to all routes:

```typescript
// src/middleware/vercelCache.ts
import { createMiddleware } from '@tanstack/react-start'

export const vercelCacheMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next()

  if (!result.response.headers.has('Cache-Control')) {
    result.response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    )
  }

  return result
})
```

---

## Trade-offs Summary

| Approach | TTFB | SEO | Complexity | Use When |
|----------|------|-----|------------|----------|
| Full SSR + caching | ✅ Best | ✅ Best | Low | Marketing, blog, SEO-critical |
| `ssr: 'data-only'` | ✅ Good | ⚠️ Moderate | Low | Dashboards, authenticated pages |
| `ssr: false` | ✅ Best | ❌ Poor | Low | Interactive editors, client-heavy |
| Streaming + deferred | ✅ Good | ✅ Good | Medium | Large pages with non-critical sections |
| ISR via Nitro | ✅ Excellent | ✅ Best | Medium | E-commerce, frequently updated content |

---

## Quick Start

**Step 1**: Add Cache-Control headers to `__root.tsx` and key routes → immediate 8-9x TTFB improvement

**Step 2**: Use `ssr: 'data-only'` for dashboard/authenticated routes → 60-80% document size reduction

**Step 3**: Enable `autoCodeSplitting` in router plugin → reduced initial JS
