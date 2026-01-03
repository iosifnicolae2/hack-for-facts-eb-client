# Deep Research: TanStack Start SSR Library Compatibility and Migration Guide

## Prompt

```
Please conduct deep research on: TanStack Start SSR Library Compatibility and Migration Guide

Context: I'm planning to migrate a React 19 + Vite application to TanStack Start (the full-stack framework from TanStack). I need to understand which of my current libraries work with TanStack Start's SSR capabilities and which ones need migration or special configuration.

Current Stack:
- React 19, Vite, TanStack Router, TanStack Query
- i18n: Lingui
- Auth: Clerk (@clerk/clerk-react)
- Analytics: PostHog (posthog-js)
- Error Tracking: Sentry (@sentry/react)
- Forms: react-hook-form
- Maps: Leaflet / React-Leaflet
- Charts: Recharts, Visx
- Validation: Zod

I need research on each library category:

1. **i18n (Lingui)**
   - Does Lingui work with TanStack Start SSR?
   - What configuration is needed for SSR hydration?
   - Are there better alternatives with native TanStack Start support? (react-i18next, Paraglide, typesafe-i18n)
   - How to handle locale detection on server vs client?

2. **Authentication (Clerk)**
   - Does @clerk/clerk-react work with TanStack Start SSR?
   - Is there a dedicated @clerk/tanstack-start package?
   - What are the recommended auth solutions for TanStack Start? (Better Auth, Lucia, Auth.js/NextAuth)
   - How to handle auth state during SSR?

3. **Analytics (PostHog)**
   - How to configure posthog-js for SSR?
   - Does it need special hydration handling or client-only loading?
   - Are there official TanStack Start examples?

4. **Error Tracking (Sentry)**
   - Does @sentry/react work with TanStack Start SSR?
   - Is there a different package needed for full-stack frameworks?
   - How to capture both server and client errors?

5. **Forms (react-hook-form)**
   - Any SSR considerations with TanStack Start?
   - Form state hydration issues?

6. **Maps (Leaflet/React-Leaflet)**
   - How to handle SSR with libraries requiring window/document?
   - Dynamic import patterns for TanStack Start?

7. **Charts (Recharts/Visx)**
   - SSR compatibility with TanStack Start?
   - Do they need client-only rendering?

8. **TanStack Query Integration**
   - Special configuration when used within TanStack Start vs standalone?
   - Prefetching and dehydration patterns?

Please provide:
1. Compatibility status for each library (works/needs config/doesn't work)
2. Required configuration or code changes
3. Recommended alternatives if migration is needed
4. Official documentation links and GitHub issues/discussions
5. Community best practices and example repositories
6. Focus on 2024-2025 information (TanStack Start is new)
```

## URL

https://claude.ai/chat/e8b3e8ed-47d8-4efe-b71c-b834bb9b38dd

## Results

# TanStack Start SSR library compatibility and migration guide

**Migrating a React 19 + Vite SPA to TanStack Start requires careful attention to SSR compatibility.** This comprehensive guide covers all eight library categories in your stack, providing compatibility status, required configurations, code examples, and recommended alternatives. The bottom line: most libraries work with proper configuration, but **Paraglide JS** should replace Lingui, **Clerk's beta TanStack Start package** or **Better Auth** handles authentication, and browser-only libraries like Leaflet need client-only rendering patterns.

---

## TanStack Start and Query integration fundamentals

TanStack Start reached **v1.0 Release Candidate** in late 2024, providing a full-stack React framework built on TanStack Router and Vite. Understanding its SSR architecture is essential before migrating any library.

The framework uses a **two-phase execution model**: loaders and `beforeLoad` hooks execute on the server during initial requests, then React hydrates the server-rendered HTML on the client. This creates specific requirements for data fetching and third-party integrations.

### TanStack Query SSR configuration

TanStack Query requires the `@tanstack/react-router-ssr-query` package for SSR integration. The critical configuration involves **creating QueryClient instances per-request on the server** while maintaining a singleton on the client:

```typescript
// router.tsx
import { routerWithQueryClient } from '@tanstack/react-router-ssr-query'
import { QueryClient } from '@tanstack/react-query'

export function createAppRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Critical: prevents double-fetch after SSR
      },
    },
  })

  return routerWithQueryClient(
    createRouter({ routeTree, context: { queryClient } }),
    queryClient
  )
}
```

Only `useSuspenseQuery` participates in SSR—regular `useQuery` calls execute client-side only. Prefetch data in route loaders using `queryClient.ensureQueryData()` for immediate availability during SSR.

---

## i18n: Lingui has issues, Paraglide is recommended

| Status | Recommendation |
|--------|----------------|
| ⚠️ Needs configuration / Has issues | **Migrate to Paraglide JS** |

### Lingui compatibility problems

Lingui has documented hydration issues with TanStack Start. **GitHub Issue #4279** reports severe problems when using localized `head()` meta titles: content renders twice, duplicate `<title>` tags appear, and no console errors indicate the problem. The library requires `@lingui/react/server` for SSR setup, but integration remains problematic.

### Paraglide JS: the recommended alternative

**Paraglide JS has official TanStack Start examples** maintained by the TanStack team, making it the clear choice for new migrations:

```typescript
// vite.config.ts
import { paraglideVitePlugin } from '@inlang/paraglide-js'

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      cookieName: 'PARAGLIDE_LOCALE',
      strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
    }),
    tanstackStart(),
  ],
})
```

```typescript
// src/server.ts - SSR middleware
import { paraglideMiddleware } from './paraglide/server.js'

export default {
  fetch(req: Request) {
    return paraglideMiddleware(req, ({ request }) => handler.fetch(request))
  },
}
```

Paraglide's compile-time approach eliminates runtime hydration issues, produces **~75% smaller bundles** (47KB vs 205KB), and provides full TypeScript support with compile-time type checking. The VS Code extension and CLI for machine translation streamline the developer experience.

### Locale detection pattern for SSR

The server-side detection priority should be: URL path parameter → cookie (user preference) → Accept-Language header → default locale. Cookies are essential because they're included in every request, ensuring server and client detect the same locale.

---

## Authentication: Clerk works but Better Auth may be superior

| Library | Status | Package |
|---------|--------|---------|
| Clerk | ✅ Works (beta) | `@clerk/tanstack-react-start` |
| Better Auth | ✅ Recommended | `better-auth` with `tanstackStartCookies()` |
| Lucia Auth | ❌ Deprecated | Migrate to oslo/arctic |

### Clerk TanStack Start integration

Clerk provides `@clerk/tanstack-react-start` (currently beta) with dedicated middleware and server functions:

```typescript
// src/start.ts
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => ({
  requestMiddleware: [clerkMiddleware()],
}))
```

```typescript
// Route protection pattern
import { auth } from '@clerk/tanstack-react-start/server'

const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw redirect({ to: '/sign-in' })
  return { userId }
})

export const Route = createFileRoute('/protected')({
  beforeLoad: async () => await authStateFn(),
})
```

Add `'@clerk/tanstack-react-start'` to `ssr.noExternal` in Vite config to prevent SSR context loss.

### Better Auth: the self-hosted alternative

For production applications requiring self-hosted auth, **Better Auth offers official TanStack Start support** with the `tanstackStartCookies()` plugin:

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  plugins: [tanstackStartCookies()] // Must be last plugin
})
```

Better Auth provides middleware-based route protection, session management, and database adapters—all production-ready.

---

## Analytics: PostHog requires client-only loading

| Status | Configuration Required |
|--------|----------------------|
| ⚠️ Needs configuration | Client-only initialization |

PostHog's `posthog-js` library uses browser-only APIs (window, document, cookies) and **must be initialized only on the client**. Use TanStack Start's `ClientOnly` component:

```typescript
// providers/posthog.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }) {
  useEffect(() => {
    posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      capture_pageview: 'history_change', // For SPA navigation
    })
  }, [])
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

```typescript
// __root.tsx
import { ClientOnly } from '@tanstack/react-router'

function RootComponent() {
  return (
    <ClientOnly fallback={null}>
      <PHProvider><Outlet /></PHProvider>
    </ClientOnly>
  )
}
```

For server-side analytics, use `posthog-node` as a separate package in server functions.

---

## Error tracking: Sentry has dedicated TanStack Start SDK

| Status | Package |
|--------|---------|
| ✅ Official support (alpha) | `@sentry/tanstackstart-react` |

**Sentry is an official TanStack Start partner** and provides a unified SDK for both client and server error capture:

```typescript
// Client configuration (src/router.tsx)
import * as Sentry from '@sentry/tanstackstart-react'

export const getRouter = () => {
  const router = createRouter()

  if (!router.isServer) {
    Sentry.init({
      dsn: 'YOUR_DSN',
      integrations: [
        Sentry.tanstackRouterBrowserTracingIntegration(router),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
    })
  }
  return router
}
```

```typescript
// Server configuration (instrument.server.mjs)
import * as Sentry from '@sentry/tanstackstart-react'

Sentry.init({
  dsn: 'YOUR_DSN',
  tracesSampleRate: 1.0,
})
```

```typescript
// Server entry (src/server.ts)
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'

export default createServerEntry(
  wrapFetchWithSentry({
    fetch(request) { return handler.fetch(request) },
  })
)
```

Use Sentry's Vite plugin for automatic source map uploads during builds.

---

## Forms: react-hook-form works with caveats

| Status | Alternative |
|--------|-------------|
| ⚠️ Works with configuration | Consider TanStack Form for new projects |

React-hook-form relies on DOM refs for initialization, which means values are injected client-side after hydration. This can cause **value flash** where form fields render empty on the server, then populate on the client.

### Essential configuration for SSR

Always set `defaultValue` explicitly on inputs to prevent hydration mismatches:

```typescript
<input
  defaultValue={flashData?.data.email}
  {...register('email', { required: true })}
/>
```

For progressive enhancement with TanStack Start server functions:

```typescript
// Server function with Zod validation
export const registerForm = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData')
    return data
  })
  .handler(async ({ data }) => {
    const result = FormSchema.safeParse(Object.fromEntries(data.entries()))
    // Handle validation...
  })

// Form component
<form
  method="POST"
  action={registerForm.url}  // Progressive enhancement
  onSubmit={handleSubmit(onSubmit)} // JS-enabled path
>
```

### TanStack Form: the SSR-first alternative

For new TanStack Start projects, **TanStack Form offers first-class SSR support** with `@tanstack/react-form-start`:

```typescript
import { createServerValidate } from '@tanstack/react-form-start'

const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: ({ value }) => {
    if (value.age < 12) return 'Must be at least 12'
  },
})
```

---

## Maps: Leaflet requires client-only rendering

| Status | Pattern Required |
|--------|------------------|
| ❌ No SSR support | `ClientOnly` + React.lazy |

**Leaflet makes direct DOM calls on import**, causing `window is not defined` errors during SSR. The solution combines TanStack Start's `ClientOnly` component with React.lazy for optimal code splitting:

```typescript
// components/LeafletMap.lazy.tsx
import React, { Suspense, lazy } from 'react'

const LazyLeafletMap = lazy(() => import('./LeafletMap'))

export function LeafletMapSSR({ center, zoom, markers }) {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse bg-gray-200" />}>
      <LazyLeafletMap center={center} zoom={zoom} markers={markers} />
    </Suspense>
  )
}
```

```typescript
// Usage in route
import { ClientOnly } from '@tanstack/react-router'

function MapPage() {
  return (
    <ClientOnly fallback={<MapSkeleton />}>
      <LeafletMapSSR center={[51.505, -0.09]} zoom={13} markers={[]} />
    </ClientOnly>
  )
}
```

Alternatively, disable SSR for the entire route with `ssr: false` if maps dominate the page content.

---

## Charts: Recharts needs client-only, Visx is more compatible

| Library | SSR Support | Recommendation |
|---------|-------------|----------------|
| Recharts | ❌ Client-only | Wrap with `ClientOnly` |
| Visx | ⚠️ Partial | Pass explicit dimensions |
| Nivo | ✅ Full | Consider for SSR-critical apps |

### Recharts configuration

Recharts uses `useLayoutEffect` internally and requires client-only rendering:

```typescript
import { ClientOnly } from '@tanstack/react-router'

function DashboardPage() {
  const data = useLoaderData() // Data fetched server-side

  return (
    <ClientOnly fallback={<ChartSkeleton />}>
      <SalesChart data={data.chartData} />
    </ClientOnly>
  )
}
```

Use `ssr: 'data-only'` on chart-heavy routes to fetch data server-side while rendering charts client-side.

### Visx SSR considerations

Visx renders pure SVG elements, making it more SSR-compatible. However, avoid `ParentSize` from `@visx/responsive` during SSR—pass explicit width and height dimensions instead to prevent hydration mismatches.

### SSR-compatible alternatives

**Nivo** offers built-in SSR support and works out of the box. **Apache ECharts** can render SVG on the server and hydrate on the client, making it excellent for data-heavy dashboards.

---

## Migration checklist and compatibility summary

| Library | Status | Action Required |
|---------|--------|-----------------|
| TanStack Query | ✅ Works | Use `@tanstack/react-router-ssr-query`, set staleTime > 0 |
| Lingui | ⚠️ Has issues | **Migrate to Paraglide JS** |
| Clerk | ✅ Beta support | Use `@clerk/tanstack-react-start`, add to `ssr.noExternal` |
| PostHog | ⚠️ Needs config | Wrap with `ClientOnly`, use `useEffect` for init |
| Sentry | ✅ Official SDK | Use `@sentry/tanstackstart-react` (alpha) |
| react-hook-form | ⚠️ Works | Set `defaultValue` explicitly, consider TanStack Form |
| Leaflet | ❌ No SSR | Use `ClientOnly` + React.lazy |
| Recharts | ❌ No SSR | Use `ClientOnly`, consider `ssr: 'data-only'` routes |
| Visx | ⚠️ Partial | Pass explicit dimensions, avoid responsive containers |
| Zod | ✅ Works | Share schemas between client and server validation |

---

## Essential documentation and resources

- **TanStack Start SSR Guide**: https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
- **TanStack Query SSR**: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
- **Paraglide + TanStack Start Example**: https://github.com/TanStack/router/tree/main/examples/react/start-i18n-paraglide
- **Clerk TanStack Start Quickstart**: https://clerk.com/docs/quickstarts/tanstack-react-start
- **Better Auth TanStack Integration**: https://better-auth.com/docs/integrations/tanstack
- **Sentry TanStack Start SDK**: https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/
- **TanStack Form SSR Guide**: https://tanstack.com/form/v1/docs/framework/react/guides/ssr

## Conclusion

Migrating to TanStack Start requires addressing SSR compatibility across your entire stack. The most significant changes involve **replacing Lingui with Paraglide JS** for internationalization and configuring **client-only rendering patterns** for browser-dependent libraries like Leaflet and Recharts. Authentication benefits from Clerk's dedicated SDK or Better Auth's production-ready integration. Sentry's official partnership with TanStack provides seamless error tracking, while PostHog needs straightforward client-only wrapping. The key insight: TanStack Start's `ClientOnly` component, `ssr: false` route option, and `ssr: 'data-only'` mode provide flexible tools for handling any SSR incompatibility.


## Links

https://github.com/lingui/js-lingui/tree/main/examples/tanstack-start/src