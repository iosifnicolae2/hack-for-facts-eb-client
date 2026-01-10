# Introduction
We are migrating a large React/Vite app to TanStack Start (TanStack Router + SSR). We need a focused research brief that identifies SSR-related failures and library-specific SSR pitfalls in our codebase, then proposes fixes with references to official docs and known best practices. The app is deployed on Vercel today, with a possible future move to Kubernetes plus CDN and performance optimizations. The immediate goal is to stabilize SSR and Vercel.

# Problem Description
We are seeing SSR and local-dev issues that likely stem from a mix of data prefetching, client-only libraries, and SSR/hydration ordering:

1) SSR + i18n hydration mismatches
   - We dynamically load Lingui catalogs and activate locales on the client. The first load sometimes renders in the wrong locale until refresh. We need to verify the correct SSR integration path for Lingui + TanStack Start so the initial SSR output and hydration use the same locale and catalogs.

2) TanStack Start routing lifecycle and prefetching
   - The entity route uses `beforeLoad` to prefetch queries and do additional work. Hover preloads can trigger data requests and leave them pending in dev. We need the correct SSR+Start pattern for `beforeLoad` vs `loader` vs React Query integration (with `setupRouterSsrQueryIntegration`) so that prefetching does not cause hanging or hydration inconsistencies.

3) Client-only libraries and SSR safety
   - We use libraries that are often client-only (Clerk auth, PostHog, Sentry, Leaflet, Recharts, Framer Motion, hotkeys). We need a clear SSR strategy for each library (conditional usage, dynamic imports, `ClientOnly` boundaries, `ssr.noExternal` in Vite) and explicit guidance on where to place those boundaries to avoid hydration crashes or window access during SSR.

4) Data fetching, auth, and SSR tokens
   - GraphQL requests rely on a Clerk token obtained from `window.Clerk`. During SSR this is not available, and even on the client the token can be missing early. We need guidance on SSR-safe auth handling and how to pass tokens or fall back to cookie-based auth on the server. We also want to avoid SSR re-fetch loops or pending requests.

5) Vercel SSR stability and deployment configuration
   - The project uses Nitro with the Vercel preset. We need to verify the correct configuration for TanStack Start SSR on Vercel (runtime, routing, caching, headers, and build output). We also need to understand the constraints (timeouts, edge vs node runtimes) and how they interact with SSR data fetching.

6) Future self-hosting (Kubernetes + CDN)
   - After Vercel is stable, we want to evaluate a self-hosted SSR setup: Node runtime, caching strategy (CDN + server cache), asset optimization, and API routing. Identify changes needed to support both Vercel and self-hosted deployments without code divergence.

# Code References
Use these files as anchors for targeted research and recommendations:

- SSR entry, router, and app shell
  - `src/client.tsx`
  - `src/start.ts`
  - `src/router.tsx`
  - `src/router-context.ts`
  - `src/routes/__root.tsx`
  - `src/components/app/app-shell.tsx`

- Entity route SSR and prefetch
  - `src/routes/entities.$cui.tsx`
  - `src/routes/entities.$cui.lazy.tsx`
  - `src/components/entities/validation.ts`
  - `src/lib/hooks/useEntityDetails.ts`
  - `src/lib/api/entities.ts`

- i18n / locale handling
  - `src/lib/i18n.tsx`
  - `src/components/theme/language-toggle.tsx`
  - `src/lib/utils.ts` (getUserLocale)
  - `lingui.config.ts`

- Auth and token handling
  - `src/lib/auth/index.tsx`
  - `src/lib/api/graphql.ts`

- Client-only or SSR-sensitive libraries
  - `src/routes/map.lazy.tsx` (Leaflet)
  - `src/components/entities/EntityFinancialTrends.tsx` (Recharts)
  - `src/components/entities/views/ChartCard.tsx` (Framer Motion)
  - `src/hooks/useWindowSize.tsx`
  - `src/components/ui/ResponsivePopover.tsx`
  - `src/components/entities/hooks/useHeaderSize.ts`
  - `src/components/entities/FloatingEntitySearch.tsx` (hotkeys)

- API base URL, proxy, and hosting configuration
  - `src/config/env.ts`
  - `vite.config.ts`
  - `vercel.json`

- Notifications and other API clients
  - `src/features/notifications/api/notifications.ts`
  - `src/features/learning/api/progress.ts`
  - `src/lib/api/shortLinks.ts`

Please produce:
1) A list of SSR risks and root causes mapped to the files above.
2) The correct SSR integration guidance for each major library (TanStack Start/Router, React Query, Lingui, Clerk, PostHog, Sentry, Leaflet, Recharts, Framer Motion, hotkeys).
3) Vercel-specific fixes (build, runtime, routing, caching) and how they align with TanStack Start.
4) A self-hosting outline (Kubernetes + CDN) that does not break Vercel compatibility.
