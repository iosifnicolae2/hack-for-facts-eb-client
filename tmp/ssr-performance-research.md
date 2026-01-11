# TanStack Start SSR Performance Optimization Research (2026)

## Context

I have a React 19 application using TanStack Start (v1.145+) with Nitro on Vercel. The SSR version is significantly slower than the previous SPA:

| Metric | SPA | SSR | Issue |
|--------|-----|-----|-------|
| Document TTFB | 32ms | 284ms | 9x slower |
| Document Size | 3.2 KB | 50.5 KB | 16x larger |
| DOMContentLoaded | 283ms | 407ms | 1.4x slower |
| Load Event | 396ms | 654ms | 1.7x slower |
| Vercel Cache | HIT | MISS | No caching |

**Goal**: Match SPA performance (~400ms Load, ~280ms DOMContentLoaded)

## Tech Stack (2026 versions)
- TanStack Start v1.145+ with TanStack Router v1.144+
- React 19.2
- Nitro 3.x with Vercel preset
- Vite 7.3
- Deployed on Vercel

## Research Questions

### 1. TanStack Start Caching & ISR on Vercel (2026)

- How do you configure SSR page caching with TanStack Start in 2026?
- What Cache-Control headers should be set for SSR routes?
- Does TanStack Start support Vercel ISR (Incremental Static Regeneration)? How?
- Can you use stale-while-revalidate patterns with TanStack Start?
- How do you implement per-route vs global caching strategies?
- What is the recommended Nitro preset configuration for optimal Vercel caching?

### 2. SSR Streaming with TanStack Start (2026)

- Does TanStack Start support React 19 streaming SSR (renderToPipeableStream)?
- How do you configure Suspense boundaries for progressive HTML delivery?
- What is the current state of streaming support with Nitro on Vercel?
- Are there any TanStack Start-specific APIs for streaming?
- How do you handle head/meta tags with streaming SSR?

### 3. Bundle & Hydration Optimization (2026)

- What are the recommended patterns for lazy hydration with TanStack Start?
- How do you defer non-critical scripts (analytics, error tracking) in TanStack Start?
- Does TanStack Start support partial hydration or islands architecture?
- What is the best way to code-split provider trees (Auth, Analytics, Theme)?
- How do you use React.lazy with SSR in TanStack Start without hydration mismatches?

### 4. Route Loader & beforeLoad Optimization

- What is the performance impact of beforeLoad hooks on SSR?
- Should cookie reading happen in middleware vs beforeLoad?
- How do you cache i18n activation results across requests?
- Can you mark routes as static vs dynamic for different caching strategies?
- What are the best practices for minimizing server-side work in route loaders?

### 5. Vercel-Specific Optimizations (2026)

- What Vercel configuration optimizes TanStack Start SSR performance?
- How do you configure Edge Functions vs Serverless Functions for SSR?
- What are the recommended vercel.json settings for SSR apps?
- How do you enable Vercel Edge Caching for SSR pages?
- Are there any Vercel-specific headers or configurations for TanStack Start?

## Expected Output

Please provide:
1. Specific code examples for each optimization
2. Configuration snippets (vite.config.ts, vercel.json, route files)
3. Trade-offs and when to use each approach
4. Links to official 2026 documentation
5. A recommended implementation order based on impact vs effort

Focus on the latest 2026 documentation and APIs. Avoid deprecated patterns from 2024-2025.
