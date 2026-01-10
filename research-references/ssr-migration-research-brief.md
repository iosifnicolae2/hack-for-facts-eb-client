# SSR Migration Research Brief: TanStack Start + Vercel

**Date:** January 2026
**Scope:** SSR-related failures, library-specific pitfalls, and recommended fixes for TanStack Start migration

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [TanStack Start SSR Lifecycle](#2-tanstack-start-ssr-lifecycle)
3. [React Query SSR Integration](#3-react-query-ssr-integration)
4. [Lingui i18n SSR Integration](#4-lingui-i18n-ssr-integration)
5. [Clerk Authentication SSR](#5-clerk-authentication-ssr)
6. [Client-Only Libraries SSR Strategies](#6-client-only-libraries-ssr-strategies)
7. [Vercel Deployment Configuration](#7-vercel-deployment-configuration)
8. [Self-Hosting Strategy (Kubernetes + CDN)](#8-self-hosting-strategy-kubernetes--cdn)
9. [File-by-File Risk Assessment](#9-file-by-file-risk-assessment)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Executive Summary

### Critical Issues Identified

| Issue | Root Cause | Priority |
|-------|-----------|----------|
| i18n hydration mismatch | Locale not resolved identically on server/client | **P0** |
| Pending prefetch requests | Incorrect `beforeLoad`/`loader` lifecycle usage | **P0** |
| Client-only library crashes | `window` access during SSR | **P1** |
| Auth token unavailable in SSR | `window.Clerk` dependency | **P1** |
| Vercel function timeouts | Unbounded data fetching | **P2** |

### Key Architectural Changes Required

1. **Centralize locale resolution** in `beforeLoad` with SSR-safe detection
2. **Use `setupRouterSsrQueryIntegration`** for automatic React Query dehydration/hydration
3. **Implement `ClientOnly` boundaries** for all browser-dependent libraries
4. **Switch to Clerk TanStack Start SDK** with cookie-based auth
5. **Configure Fluid Compute** on Vercel for extended timeouts

---

## 2. TanStack Start SSR Lifecycle

### Where `beforeLoad` and `loader` Run

| Phase | `beforeLoad` | `loader` | Component |
|-------|-------------|----------|-----------|
| Initial SSR Request | Server | Server | Server |
| Client Hydration | - | - | Client |
| Subsequent Navigation | Client | Client | Client |

**Sources:** [TanStack Start Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr), [Data Loading Guide](https://tanstack.com/router/v1/docs/framework/react/guide/data-loading)

### SSR Mode Options

```typescript
export const Route = createFileRoute('/example')({
  ssr: true,        // Default: full SSR
  ssr: false,       // Client-only rendering
  ssr: 'data-only', // Loaders run on server, component renders on client
})
```

### `beforeLoad` vs `loader` Decision Matrix

| Use Case | Use `beforeLoad` | Use `loader` |
|----------|-----------------|--------------|
| Auth checks & redirects | ✅ | ❌ |
| Building route context | ✅ | ❌ |
| i18n locale activation | ✅ | ❌ |
| Data prefetching | ❌ | ✅ |
| API calls | ❌ | ✅ |
| Analytics initialization | ❌ (use component `useEffect`) | ❌ |

**Key Insight:** `beforeLoad` runs serially (parent → child), and if it throws, children don't load. Use it as middleware/guard, not for data fetching.

### Lifecycle Order

```
1. beforeLoad (parent)
2. beforeLoad (child)
3. loader (all routes in parallel)
4. component render
```

---

## 3. React Query SSR Integration

### Recommended Setup with `setupRouterSsrQueryIntegration`

**Install:**
```bash
npm install @tanstack/react-router-ssr-query
```

**Router Configuration (`src/router.tsx`):**

```typescript
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  // CRITICAL: Create fresh QueryClient per SSR request
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // Prevent immediate refetch after hydration
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    // Delegate caching to React Query
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // wrapQueryClient: false, // If you wrap QueryClientProvider yourself
  })

  return router
}
```

**Source:** [TanStack Query Integration](https://tanstack.com/router/v1/docs/integrations/query)

### Route Pattern: Loader Prefetch + useSuspenseQuery

```typescript
// src/routes/entities.$cui.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { entityQueryOptions } from '@/lib/api/entities'

export const Route = createFileRoute('/entities/$cui')({
  beforeLoad: async ({ params }) => {
    // Validate CUI format, redirect if invalid
    if (!isValidCUI(params.cui)) {
      throw redirect({ to: '/' })
    }
  },
  loader: async ({ context, params }) => {
    // Prefetch query - blocks SSR until resolved
    await context.queryClient.ensureQueryData(entityQueryOptions(params.cui))
  },
  component: EntityPage,
})

function EntityPage() {
  const { cui } = Route.useParams()
  // Read from cache - no loading state needed
  const { data } = useSuspenseQuery(entityQueryOptions(cui))
  return <EntityView data={data} />
}
```

### Streaming vs Blocking

| Behavior | Code Pattern | Use Case |
|----------|-------------|----------|
| **Block SSR** | `await context.queryClient.ensureQueryData(...)` | Critical data for first paint |
| **Stream** | `context.queryClient.prefetchQuery(...)` (no await) | Secondary data, analytics |

### Hydration Best Practices

1. **Fresh QueryClient per request** on server (avoid shared singleton)
2. **Set `staleTime > 0`** to prevent immediate refetch after hydration
3. **Use `useSuspenseQuery`** for SSR-critical data
4. **Use `useQuery`** for client-only data (doesn't run on server)

---

## 4. Lingui i18n SSR Integration

### Current Issue: Hydration Mismatch

The current implementation in `__root.tsx` calls `dynamicActivate(locale)` in `beforeLoad`, but locale detection uses `localStorage` and URL params which may differ between server and client.

**Source:** [TanStack Router Issue #4279](https://github.com/TanStack/router/issues/4279)

### Root Cause Analysis

```typescript
// PROBLEM: getUserLocale() accesses window.localStorage on server
export function getUserLocale(): Locale {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    // ...
  }
  const savedLocale = typeof window !== 'undefined'
    ? window.localStorage.getItem('user-locale')
    : null;
  return savedLocale || 'ro';
}
```

On SSR, `window` is undefined, so locale defaults to `'ro'`. On client, if user has `'en'` in localStorage, hydration mismatch occurs.

### Recommended Fix: Server-Safe Locale Resolution

**1. Create SSR-safe locale resolver:**

```typescript
// src/lib/i18n.tsx
export const DEFAULT_LOCALE = 'ro' as const;
export type SupportedLocale = 'ro' | 'en';

/**
 * Resolve locale from request context (SSR-safe)
 * Priority: URL ?lang param > URL path segment > cookie > default
 */
export function resolveLocaleFromRequest(
  pathname: string,
  searchParams?: URLSearchParams,
  cookies?: Record<string, string>
): SupportedLocale {
  // 1. Check URL search param
  const langParam = searchParams?.get('lang');
  if (langParam === 'ro' || langParam === 'en') return langParam;

  // 2. Check URL path segment
  const pathLocale = pathname.split('/')[1];
  if (pathLocale === 'ro' || pathLocale === 'en') return pathLocale;

  // 3. Check cookie (available on both server and client)
  const cookieLocale = cookies?.['user-locale'];
  if (cookieLocale === 'ro' || cookieLocale === 'en') return cookieLocale;

  return DEFAULT_LOCALE;
}
```

**2. Update `__root.tsx` to use request headers:**

```typescript
// src/routes/__root.tsx
export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location, context }) => {
    // Use location from router (available on both server and client)
    const searchParams = new URLSearchParams(location.searchStr);
    const locale = resolveLocaleFromRequest(
      location.pathname,
      searchParams,
      context.cookies // Pass cookies from server context
    );
    await dynamicActivate(locale);
    return { locale };
  },
})
```

**3. Pass cookies in router context from server:**

```typescript
// src/start.ts or SSR entry
const router = getRouter();
router.update({
  context: {
    ...router.options.context,
    cookies: parseCookies(request.headers.get('cookie')),
  },
});
```

### Lingui Vite Plugin Configuration

```typescript
// vite.config.ts
import { lingui } from '@lingui/vite-plugin';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
  ],
});
```

**Source:** [Lingui Vite Plugin](https://lingui.dev/ref/vite-plugin)

---

## 5. Clerk Authentication SSR

### Current Issue

```typescript
// src/lib/api/graphql.ts - PROBLEM
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  // window.Clerk not available during SSR
  return window.Clerk?.session?.getToken() ?? null;
}
```

### Recommended: Clerk TanStack Start SDK (Beta)

**Note:** The SDK is in beta. Evaluate stability before production use.

**Source:** [Clerk TanStack Start Quickstart](https://clerk.com/docs/quickstarts/tanstack-react-start)

**1. Install:**
```bash
npm install @clerk/tanstack-react-start
```

**2. Environment Variables:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**3. Middleware Setup (`src/start.ts`):**

```typescript
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export default createStart({
  requestMiddleware: [clerkMiddleware()],
})
```

**4. SSR Handler (`src/ssr.tsx`):**

```typescript
import { createClerkHandler } from '@clerk/tanstack-react-start/server'
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'

export default createClerkHandler(
  createStartHandler({ getRouter })(defaultStreamHandler)
)
```

**5. Protected Route Pattern:**

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { userId } = await auth()
    if (!userId) {
      throw redirect({ to: '/sign-in' })
    }
    return { userId }
  },
})
```

### Alternative: Cookie-Based Auth for GraphQL

If staying with current auth setup, modify GraphQL client to use cookies:

```typescript
// src/lib/api/graphql.ts
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(getApiBaseUrl() + '/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Let browser send cookies automatically
    },
    credentials: 'include', // Send cookies with request
    body: JSON.stringify({ query, variables }),
  })
  // ...
}
```

Server must be configured to:
1. Set HTTP-only session cookie on login
2. Validate cookie on each request
3. Support CORS with credentials

---

## 6. Client-Only Libraries SSR Strategies

### Strategy Matrix

| Library | SSR Strategy | Implementation |
|---------|-------------|----------------|
| **Leaflet** | `ssr: false` on route or `ClientOnly` | Dynamic import |
| **Recharts** | `ClientOnly` wrapper | Conditional render |
| **Framer Motion** | `LazyMotion` + client check | Works with SSR |
| **PostHog** | Provider bypass on server | `isBrowser` check |
| **Sentry** | Separate init files | Browser vs server entry |
| **react-hotkeys-hook** | `ClientOnly` or `useEffect` | Hook runs client-only |

### Universal ClientOnly Component

```typescript
// src/components/ClientOnly.tsx
import { useState, useEffect, type ReactNode } from 'react'

type ClientOnlyProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return fallback
  return children
}
```

### Leaflet Implementation

**Option A: Route-level SSR disable**

```typescript
// src/routes/map.tsx
export const Route = createFileRoute('/map')({
  ssr: false, // Entire route renders client-only
  component: MapPage,
})
```

**Option B: ClientOnly wrapper**

```typescript
// src/routes/map.lazy.tsx
import { ClientOnly } from '@/components/ClientOnly'
import { Skeleton } from '@/components/ui/skeleton'

const LeafletMap = lazy(() => import('@/components/maps/LeafletMap'))

function MapPage() {
  return (
    <ClientOnly fallback={<Skeleton className="h-[600px] w-full" />}>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <LeafletMap />
      </Suspense>
    </ClientOnly>
  )
}
```

**Source:** [React Leaflet SSR](https://janmueller.dev/blog/react-leaflet/)

### Recharts Implementation

```typescript
// src/components/entities/EntityFinancialTrends.tsx
import { ClientOnly } from '@/components/ClientOnly'
import { Skeleton } from '@/components/ui/skeleton'

export function EntityFinancialTrends({ data }: Props) {
  return (
    <ClientOnly fallback={<Skeleton className="h-[300px]" />}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {/* ... */}
        </LineChart>
      </ResponsiveContainer>
    </ClientOnly>
  )
}
```

**Additional:** Add to Vite config if transformation errors occur:

```typescript
// vite.config.ts
export default defineConfig({
  ssr: {
    noExternal: ['recharts'], // Transform recharts for SSR
  },
})
```

**Source:** [Recharts SSR Issue #3656](https://github.com/recharts/recharts/issues/3656)

### Framer Motion Implementation

Framer Motion supports SSR but requires care:

```typescript
// src/components/entities/views/ChartCard.tsx
import { LazyMotion, domAnimation, m } from 'framer-motion'

export function ChartCard({ children }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
```

**For complex animations**, delay until after hydration:

```typescript
function AnimatedComponent() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <motion.div
      initial={false} // Don't animate on SSR
      animate={isHydrated ? { scale: 1 } : false}
    >
      {/* ... */}
    </motion.div>
  )
}
```

**Source:** [Framer Motion LazyMotion](https://www.framer.com/motion/lazy-motion/)

### PostHog Implementation (Current Code is Good)

Your current `SSRSafePostHogProvider` pattern is correct:

```typescript
// src/components/app/app-shell.tsx - CORRECT
const isBrowser = typeof window !== 'undefined';

function SSRSafePostHogProvider({ children }: { readonly children: ReactNode }) {
  if (!isBrowser) {
    return <>{children}</>;
  }
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

**Additional consideration:** For React Router V7/Remix mode, add to Vite config:

```typescript
// vite.config.ts
export default defineConfig({
  ssr: {
    external: ['posthog-js', '@posthog/react'],
  },
})
```

**Source:** [PostHog React Docs](https://posthog.com/docs/libraries/react)

### Sentry Implementation

**1. Separate entry files:**

```typescript
// src/sentry.client.ts
import * as Sentry from '@sentry/react'

export function initSentry(router: Router) {
  if (typeof window === 'undefined') return

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
  })
}
```

```typescript
// src/sentry.server.ts (if needed for server errors)
import * as Sentry from '@sentry/node'

export function initServerSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}
```

**2. Conditional import:**

```typescript
// src/lib/sentry.ts
export async function initSentry(router: Router) {
  if (typeof window !== 'undefined') {
    const { initSentry: initClientSentry } = await import('./sentry.client')
    initClientSentry(router)
  }
}
```

### react-hotkeys-hook Implementation

```typescript
// src/components/entities/FloatingEntitySearch.tsx
import { ClientOnly } from '@/components/ClientOnly'

function FloatingEntitySearchInner() {
  // Hooks only run on client
  useHotkeys('mod+k', () => setOpen(true))
  // ...
}

export function FloatingEntitySearch() {
  return (
    <ClientOnly>
      <FloatingEntitySearchInner />
    </ClientOnly>
  )
}
```

Or use `useEffect` for registration:

```typescript
function FloatingEntitySearch() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only register hotkeys after mount
  useHotkeys('mod+k', () => setOpen(true), { enabled: isClient })
}
```

---

## 7. Vercel Deployment Configuration

### TanStack Start + Nitro on Vercel

**Source:** [TanStack Start on Vercel](https://vercel.com/docs/frameworks/full-stack/tanstack-start), [Nitro Vercel Provider](https://nitro.build/deploy/providers/vercel)

### Recommended `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import nitro from '@tanstack/react-start/nitro'
import { lingui } from '@lingui/vite-plugin'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
    nitro({
      // DO NOT use preset: 'bun' on Vercel
      // Vercel auto-detects and configures
    }),
  ],
  ssr: {
    noExternal: ['recharts'], // Libraries needing transformation
    external: ['posthog-js', '@posthog/react'], // Libraries to exclude from SSR bundle
  },
})
```

### `vercel.json` Configuration

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": ".output",
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Fluid Compute (Recommended)

Vercel's Fluid Compute provides:
- Up to 60s on Hobby, 800s on Pro (vs 10s/60s traditional)
- Automatic concurrency optimization
- Reduced cold starts

**Enable:** It's enabled by default for TanStack Start apps on Vercel.

**Source:** [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)

### Timeout Prevention Strategies

1. **Set reasonable `staleTime`** on queries to avoid waterfall refetches
2. **Stream non-critical data** instead of blocking
3. **Use ISR** for semi-static pages:

```typescript
// In route definition
export const Route = createFileRoute('/static-page')({
  // Revalidate every 60 seconds
  headers: () => ({
    'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
  }),
})
```

### Known Issues & Workarounds

**Issue:** Nitro Bun preset fails on Vercel

**Solution:** Don't use `preset: 'bun'`. Instead:
```json
// vercel.json (if using Bun runtime)
{
  "bunVersion": "1.x"
}
```

**Source:** [Nitro Issue #3806](https://github.com/nitrojs/nitro/issues/3806)

---

## 8. Self-Hosting Strategy (Kubernetes + CDN)

### Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    CDN      │────▶│  SSR Pods   │────▶│   API/DB    │
│ (Cloudflare)│     │ (K8s Node)  │     │  (Backend)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│Static Assets│     │ Redis Cache │
│   (S3/R2)   │     │  (Session)  │
└─────────────┘     └─────────────┘
```

### Kubernetes Configuration

**Deployment (`k8s/deployment.yaml`):**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: transparenta-ssr
spec:
  replicas: 3
  selector:
    matchLabels:
      app: transparenta-ssr
  template:
    metadata:
      labels:
        app: transparenta-ssr
    spec:
      containers:
        - name: app
          image: transparenta/ssr:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1100m"  # Optimal for Node.js GC
          env:
            - name: NODE_ENV
              value: "production"
            - name: VITE_API_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: api-url
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

**Key insight:** Allocate ~1100m CPU per pod for optimal Node.js performance without GC interference.

**Source:** [SSR Applications at Scale](https://medium.com/its-tinkoff/ssr-applications-at-scale-d57892719024)

### Multi-Tier Caching Strategy

```
Tier 1: CDN Edge (Cloudflare/CloudFront)
├── Static assets: max-age=31536000, immutable
├── HTML pages: s-maxage=60, stale-while-revalidate=600
└── API responses: private, no-cache (or short TTL)

Tier 2: Application Cache (Redis)
├── Session data
├── Rendered HTML fragments
└── GraphQL response cache

Tier 3: Query Cache (React Query)
├── In-memory per request (SSR)
└── Persisted client-side
```

### CDN Configuration (Cloudflare Example)

```javascript
// Cloudflare Worker or Page Rule
addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Static assets - long cache
  if (url.pathname.startsWith('/assets/')) {
    return fetch(event.request, {
      cf: { cacheTtl: 31536000 }
    })
  }

  // SSR pages - short cache with SWR
  return fetch(event.request, {
    cf: {
      cacheTtl: 60,
      cacheEverything: true,
    }
  })
})
```

### Environment Abstraction for Dual Deployment

```typescript
// src/config/hosting.ts
export const hostingConfig = {
  isVercel: !!process.env.VERCEL,
  isKubernetes: !!process.env.KUBERNETES_SERVICE_HOST,

  get cacheBackend() {
    if (this.isVercel) return 'vercel-kv' // or Upstash Redis
    if (this.isKubernetes) return 'redis'
    return 'memory'
  },

  get staticAssetPrefix() {
    if (process.env.CDN_URL) return process.env.CDN_URL
    return ''
  },
}
```

### Dockerfile for Self-Hosting

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Health Check Endpoints

Add to your app for K8s probes:

```typescript
// src/routes/api/health.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const Route = createAPIFileRoute('/api/health')({
  GET: async () => {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
})
```

---

## 9. File-by-File Risk Assessment

### Critical SSR Risks

| File | Risk | Issue | Fix Priority |
|------|------|-------|--------------|
| `src/routes/__root.tsx` | **HIGH** | Locale resolution may differ server/client | P0 |
| `src/lib/utils.ts` (`getUserLocale`) | **HIGH** | Accesses `window.localStorage` | P0 |
| `src/lib/api/graphql.ts` | **HIGH** | Uses `window.Clerk` for auth token | P1 |
| `src/components/app/app-shell.tsx` | **MEDIUM** | Multiple client-only providers | P1 |
| `src/routes/map.lazy.tsx` | **HIGH** | Leaflet requires browser APIs | P1 |

### Medium SSR Risks

| File | Risk | Issue | Fix Priority |
|------|------|-------|--------------|
| `src/routes/entities.$cui.tsx` | **MEDIUM** | `beforeLoad` may block SSR too long | P2 |
| `src/components/entities/EntityFinancialTrends.tsx` | **MEDIUM** | Recharts needs client boundary | P2 |
| `src/components/entities/views/ChartCard.tsx` | **LOW** | Framer Motion may cause flash | P3 |
| `src/hooks/useWindowSize.tsx` | **MEDIUM** | Accesses `window.innerWidth` | P2 |
| `src/components/ui/ResponsivePopover.tsx` | **LOW** | May access window | P3 |

### Lower Priority

| File | Risk | Issue | Fix Priority |
|------|------|-------|--------------|
| `src/components/entities/FloatingEntitySearch.tsx` | **LOW** | Hotkeys need client | P3 |
| `src/lib/sentry.ts` | **LOW** | Browser integration | P3 |
| `vite.config.ts` | **MEDIUM** | May need `ssr.noExternal` tweaks | P2 |
| `vercel.json` | **LOW** | Needs review for headers/caching | P3 |

---

## 10. Implementation Checklist

### Phase 1: Critical Fixes (Week 1)

- [ ] **Fix locale hydration mismatch**
  - [ ] Create `resolveLocaleFromRequest()` in `src/lib/i18n.tsx`
  - [ ] Update `__root.tsx` to pass cookies from server context
  - [ ] Set locale cookie on language change (not just localStorage)
  - [ ] Test: SSR output matches client hydration for all locale scenarios

- [ ] **Implement React Query SSR integration**
  - [ ] Install `@tanstack/react-router-ssr-query`
  - [ ] Update `src/router.tsx` with `setupRouterSsrQueryIntegration`
  - [ ] Ensure fresh `QueryClient` per SSR request
  - [ ] Set `staleTime: 30000` default
  - [ ] Update entity route to use `ensureQueryData` + `useSuspenseQuery`

### Phase 2: Client-Only Boundaries (Week 2)

- [ ] **Create ClientOnly component**
  - [ ] Add `src/components/ClientOnly.tsx`
  - [ ] Add Storybook story for documentation

- [ ] **Wrap client-only libraries**
  - [ ] Leaflet in `map.lazy.tsx` → `ClientOnly` or `ssr: false`
  - [ ] Recharts in financial trends → `ClientOnly`
  - [ ] Hotkeys in FloatingEntitySearch → `ClientOnly`
  - [ ] useWindowSize → Add SSR fallback

- [ ] **Update Vite config**
  - [ ] Add `ssr.noExternal: ['recharts']` if needed
  - [ ] Add `ssr.external: ['posthog-js', '@posthog/react']`

### Phase 3: Auth SSR Integration (Week 3)

- [ ] **Evaluate Clerk TanStack Start SDK**
  - [ ] Test in development environment
  - [ ] If stable: Migrate to SDK
  - [ ] If unstable: Implement cookie-based fallback

- [ ] **Update GraphQL client for SSR**
  - [ ] Add `credentials: 'include'` for cookie auth
  - [ ] Remove `window.Clerk` dependency
  - [ ] Test authenticated routes in SSR

### Phase 4: Vercel Optimization (Week 4)

- [ ] **Review Vercel configuration**
  - [ ] Verify Nitro preset (no `preset: 'bun'`)
  - [ ] Add caching headers in `vercel.json`
  - [ ] Configure `maxDuration` for API functions

- [ ] **Test SSR performance**
  - [ ] Measure TTFB for key routes
  - [ ] Identify and stream non-critical data
  - [ ] Add ISR for semi-static pages if beneficial

### Phase 5: Self-Hosting Preparation (Future)

- [ ] Create Dockerfile for SSR app
- [ ] Create Kubernetes manifests
- [ ] Set up Redis for shared session/cache
- [ ] Configure CDN (Cloudflare) rules
- [ ] Test deployment in staging environment

---

## References

### Official Documentation

- [TanStack Start Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)
- [TanStack Router Data Loading](https://tanstack.com/router/v1/docs/framework/react/guide/data-loading)
- [TanStack Query SSR Integration](https://tanstack.com/router/v1/docs/integrations/query)
- [TanStack Query Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Clerk TanStack Start Quickstart](https://clerk.com/docs/quickstarts/tanstack-react-start)
- [Vercel TanStack Start](https://vercel.com/docs/frameworks/full-stack/tanstack-start)
- [Nitro Vercel Provider](https://nitro.build/deploy/providers/vercel)
- [Lingui Vite Plugin](https://lingui.dev/ref/vite-plugin)
- [PostHog React Docs](https://posthog.com/docs/libraries/react)
- [Framer Motion LazyMotion](https://www.framer.com/motion/lazy-motion/)

### Community Resources

- [TanStack Router Issue #4279 - Lingui Hydration](https://github.com/TanStack/router/issues/4279)
- [Recharts SSR Issue #3656](https://github.com/recharts/recharts/issues/3656)
- [Nitro Vercel Issue #3806](https://github.com/nitrojs/nitro/issues/3806)
- [React Leaflet SSR Guide](https://janmueller.dev/blog/react-leaflet/)
- [SSR Applications at Scale](https://medium.com/its-tinkoff/ssr-applications-at-scale-d57892719024)

### Related Blog Posts

- [Using window in React SSR](https://stephencook.dev/blog/using-window-in-react-ssr)
- [CDN Caching for Self-Hosted Next.js](https://focusreactive.com/configure-cdn-caching-for-self-hosted-next-js-websites/)
- [Vercel Fluid Compute](https://vercel.com/blog/vercel-functions-are-now-faster-with-fluid-compute)
