# Important: Provide a direct, complete answer.

<!--
@web-flow begin
kind: prompt
id: prompt-20260131083543342
timestamp: "2026-01-31T08:35:43.342Z"
schema: web-flow/research/v1
version: 1
-->
Important: Provide a direct, complete answer. Do not ask clarifying questions.

Please conduct deep research on: **TanStack Router URL search param encoding mismatch causing SSR redirect loops (spaces as + vs %20)**

## The Problem

When using TanStack Router with SSR (e.g., on Vercel), there is a URL encoding mismatch that causes infinite 307 redirect loops:

1. **TanStack Router** uses `URLSearchParams` internally, which encodes:
   - Spaces → `+`
   - Encodes `! ' ( ) ~` characters

2. **Browsers and Vercel** use `encodeURIComponent` conventions:
   - Spaces → `%20`
   - Leaves `! ' ( ) ~` unescaped

3. **The result**: When search params contain human-readable strings (like entity names, filter labels), the server renders a URL with `+` for spaces, but the browser/Vercel expects `%20`. This mismatch triggers a 307 redirect, which re-encodes differently, causing a loop.

## Current Workaround

We're currently post-processing the URL after TanStack Router serializes it, replacing `+` with `%20` and decoding the unnecessarily-encoded characters. The TanStack Router docs suggest custom search param serialization as the approach: https://tanstack.com/router/v1/docs/framework/react/guide/custom-search-param-serialization

## Research Questions

1. **Has TanStack Router (v1.x or v2.x, latest versions in 2025-2026) added a built-in option to control URL encoding behavior?** Check:
   - GitHub issues and PRs on tanstack/router related to URL encoding, `+` vs `%20`, SSR redirects
   - The `stringifySearchWith` and `parseSearchWith` APIs
   - Any `encodeSearchParams` or `searchParamEncoding` option
   - Release notes from 2025-2026 for any encoding-related changes

2. **What is the recommended approach in the TanStack Router ecosystem?** Check:
   - Official docs for custom search param serialization (latest version)
   - Community solutions on GitHub discussions, Discord, Stack Overflow
   - Any middleware or plugin approach

3. **How do other frameworks handle this?** Check:
   - Next.js App Router — how does it handle search param encoding in SSR?
   - Remix/React Router v7 — any encoding normalization?
   - Nuxt/Vue Router — same problem?
   - SvelteKit — approach to search param encoding

4. **What are the definitive solutions?** Options to research:
   - Custom `stringifySearch` / `parseSearch` functions in TanStack Router
   - Server-side middleware that normalizes URLs before TanStack Router sees them
   - Vercel-specific configuration (e.g., redirect rules, middleware)
   - Using `encodeURIComponent` + manual serialization instead of `URLSearchParams`
   - Monkey-patching or wrapping `URLSearchParams`

5. **Web standards perspective**:
   - What does the URL spec (WHATWG) say about `+` vs `%20` in query strings?
   - Is `URLSearchParams` behavior (using `+`) actually spec-compliant?
   - Should the fix be on the router side or the server side?

6. **SSR-specific considerations**:
   - How to ensure server-rendered HTML contains the same URL the browser will navigate to
   - Hydration mismatch issues related to URL encoding differences
   - Vercel Edge Runtime vs Node.js runtime differences in URL handling

## Constraints
- We use TanStack Router (check latest stable version as of January 2026)
- Deployed on Vercel
- React 19 with SSR/streaming
- Need a solution that works for all search params, not just specific ones
- Solution should not break existing deep links or bookmarks

## Output Format
Please provide:
1. **Current state of TanStack Router** — Has this been fixed upstream? What version?
2. **Best solution as of 2026** — The cleanest, most maintainable approach
3. **Code examples** — Working implementation with TypeScript
4. **Fallback solutions** — If no upstream fix exists, ranked alternatives
5. **Links** to relevant GitHub issues, PRs, docs, and discussions
<!-- @web-flow end id=prompt-20260131083543342 -->

<!--
@web-flow begin
kind: response
status: completed
provider: chatgpt
url: "https://chatgpt.com/c/697dbf57-4020-838b-a787-10f5aee07fbc"
id: response-20260131101215004-chatgpt
prompt_id: prompt-20260131083543342
timestamp: "2026-01-31T10:12:15.004Z"
schema: web-flow/research/v1
version: 1
-->
## 1) Current state of TanStack Router (as of Jan 31, 2026)

### Latest stable versions

* `@tanstack/react-router` is still on **v1.x** (latest published is in the **1.157.x** line). ([npm][1])
* The TanStack/router monorepo release tags also show **v1.157.17** around **Jan 30, 2026**. ([GitHub][2])
  No evidence of a stable **v2.x** npm line as of this date (npm + releases are still 1.x). ([npm][1])

### Why you’re seeing `+` for spaces (and extra escaping)

TanStack Router’s internal query-string helper (`qss`) is implemented using **`URLSearchParams`** for both encoding and decoding (in router-core). That means when it serializes, it inherits the **application/x-www-form-urlencoded** behavior: spaces become `+`, and certain characters (notably `! ' ( ) ~`) are percent-encoded. ([app.unpkg.com][3])

This is not an accident: TanStack switched search parsing to use `URLSearchParams` to fix a bug in the previous `qss` behavior around `+`. ([GitHub][4])

### Is `URLSearchParams` “wrong” here?

From a standards perspective:

* `URLSearchParams` uses the **application/x-www-form-urlencoded** encode set, which is explicitly **different** from the encoding you get from a “URL query component” mindset (e.g. `encodeURIComponent`). ([url.spec.whatwg.org][5])
* MDN explicitly warns about the mismatch: `URL.search` uses `%20` for spaces and encodes *fewer* characters, while `URLSearchParams` uses `+` for spaces and encodes *more* characters; even “same values” can serialize differently. ([MDN Web Docs][6])

So `URLSearchParams` behavior is spec-compliant; the real issue is **canonicalization + SSR**.

### SSR redirect loops are a known failure mode in TanStack Router

TanStack Router SSR can enter infinite redirect loops when the framework compares the “requested URL” vs a “rebuilt URL” and they differ only by encoding details. There are recent examples of this class of bug in the router itself (even though they’re about **path** params rather than **search** params). ([GitHub][7])

This matches your described failure mode: the server renders/redirects to a canonical form, the platform normalizes differently, and you bounce forever.

### Vercel’s role: normalization differences can exist

There are longstanding reports where **`+` is interpreted/normalized as space** in deployments and effectively becomes `%20` (or is treated as such), differing from local behavior. ([GitHub][8])
That’s enough to create a **permanent mismatch** if your SSR canonicalization insists on the opposite encoding.

---

## 2) Best solution as of 2026 (cleanest + most maintainable)

### Recommendation

**Override TanStack Router’s `stringifySearch` (and optionally `parseSearch`) to enforce an encodeURIComponent-style canonical encoding**:

* Canonical output uses:

  * spaces as **`%20`** (never `+`)
  * leaves **`! ' ( ) ~`** unescaped (i.e., undoes URLSearchParams’ extra escaping)
* Parsing remains tolerant:

  * accept both `%20` and `+` inputs (so existing links/bookmarks keep working)

This aligns with TanStack Router’s intended extension mechanism: **custom search serialization via `parseSearch` / `stringifySearch`**. ([TanStack][9])

### Why this is the best fit for your constraints

* **Works for all search params** because it operates at the router serialization boundary (single chokepoint).
* **Doesn’t break deep links** because parsing still accepts old encoding (`+`).
* **Avoids SSR loops** because server and client agree on a single canonical encoding.
* **No monkey-patching** and no reliance on Vercel quirks.

---

## 3) Code examples (TypeScript)

### A. Drop-in router config fix (wrap the default TanStack behavior)

This keeps TanStack’s JSON-first semantics (and any edge cases they handle) but normalizes the final query string into encodeURIComponent-style output.

```ts
// router.ts
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router'
// import { routeTree } from './routeTree.gen'

// 1) Start from TanStack's default helpers
const baseParseSearch = parseSearchWith(JSON.parse)
const baseStringifySearch = stringifySearchWith(JSON.stringify)

// 2) Normalize URLSearchParams-style encoding into encodeURIComponent-style encoding
export function normalizeQueryEncoding(search: string): string {
  if (!search) return search

  const hasLeadingQ = search.startsWith('?')
  const qs = hasLeadingQ ? search.slice(1) : search

  // URLSearchParams => encodeURIComponent differences:
  // - spaces: +   -> %20
  // - extra escapes: %21 %27 %28 %29 %7E -> ! ' ( ) ~
  const normalized = qs
    .replace(/\+/g, '%20')
    .replace(/%21/gi, '!')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%7E/gi, '~')

  return (hasLeadingQ ? '?' : '') + normalized
}

// 3) Plug into router options
export const router = createRouter({
  routeTree: undefined as any, // replace with your routeTree
  parseSearch: (searchStr) => baseParseSearch(searchStr),
  stringifySearch: (searchObj) => normalizeQueryEncoding(baseStringifySearch(searchObj)),
})
```

**Why this works**

* TanStack still does its normal encode/decode & JSON-first behavior. ([TanStack][10])
* You only normalize the final encoding to match `%20`/encodeURIComponent expectations.

### B. Minimal unit tests to prevent regressions

```ts
import { describe, expect, test } from 'vitest'
import { normalizeQueryEncoding } from './router'

describe('normalizeQueryEncoding', () => {
  test('replaces + with %20', () => {
    expect(normalizeQueryEncoding('?q=hello+world')).toBe('?q=hello%20world')
  })

  test('does not touch encoded + (%2B)', () => {
    expect(normalizeQueryEncoding('?q=C%2B%2B')).toBe('?q=C%2B%2B')
  })

  test('unescapes ! \' ( ) ~ when URLSearchParams encoded them', () => {
    expect(normalizeQueryEncoding('?x=%21%27%28%29%7E')).toBe("?x=!'()~")
  })

  test('idempotent', () => {
    const once = normalizeQueryEncoding('?q=hello+world&x=%7E')
    const twice = normalizeQueryEncoding(once)
    expect(twice).toBe(once)
  })
})
```

Idempotence matters because canonicalization loops are frequently caused by “serialize → parse → serialize” producing different strings. ([MDN Web Docs][6])

---

## 4) Fallback solutions (ranked)

### 1) Router-level canonicalization (recommended)

**What you implement above**: override `stringifySearch` (and keep `parseSearch` tolerant).
Most maintainable; stays inside TanStack’s official extension points. ([TanStack][9])

### 2) Edge/server middleware canonicalization (use when you cannot change router config everywhere)

Add middleware that **redirects** `+` → `%20` and normalizes `%21/%27/%28/%29/%7E` → literal characters.

This is effective if:

* you need to canonicalize *all* inbound requests (including non-router URLs),
* you want a single canonical URL for SEO/share links.

But be careful:

* If middleware canonicalizes one way and the router canonicalizes the other way, you can still loop.
* Middleware must be **idempotent** and must compute canonical form from the raw request string.

### 3) Replace TanStack search serialization entirely (higher risk)

Use `parseSearch`/`stringifySearch` but switch to a library like `query-string` / `qs` (or your own RFC3986 encoder) so the router never uses `URLSearchParams` behavior.

Pros: clean `%20` behavior by construction.
Cons: easiest way to break:

* existing encoded links,
* TanStack’s JSON-first type behavior,
* idempotence (which can reintroduce SSR redirects). ([TanStack][10])

### 4) Encode search params into a transport-safe format (base64 / compressed)

This is explicitly supported in TanStack’s custom search serialization guidance. ([TanStack][10])
Pros: avoids “pretty string encoding” problems entirely.
Cons: loses human readability; longer URLs; still must be idempotent.

### 5) Monkey-patch `URLSearchParams` or wrap it globally (not recommended)

High blast radius, can break dependencies and browser/platform expectations.

---

## 5) How other frameworks handle it (practical comparison)

### Next.js App Router

`useSearchParams` returns a read-only `URLSearchParams`. ([Next.js][11])
So if you build URLs via `URLSearchParams`, you can still end up with `+`-style encoding; however Next typically doesn’t force a router-level SSR canonical redirect purely for encoding differences in the same way a “compare & redirect to rebuilt URL” implementation does.

### Remix / React Router

Both expose and manipulate query params via `URLSearchParams`:

* Remix `useSearchParams` returns “the current URL’s searchParams”. ([v2.remix.run][12])
* React Router `useSearchParams` returns a tuple with the current `URLSearchParams`. ([reactrouter.com][13])
  React Router also has `createSearchParams`, which is explicitly a `URLSearchParams` wrapper. ([reactrouter.com][14])

Net: you’ll see the same encoding behaviors if you rely on `URLSearchParams`, but SSR redirect loops are usually avoided because canonicalization policies differ.

### SvelteKit

Docs state `url.searchParams` is `URLSearchParams`. ([svelte.dev][15])

### Vue Router / Nuxt

Vue Router has historically treated `+` literally in query decoding (i.e., not as space), as discussed in vue-router issue threads. ([GitHub][16])
Nuxt’s route/query behavior is layered on vue-router. ([Nuxt][17])
There are also modern Nuxt reports about `+` handling in params in ways that can cause server interpretation issues (because servers often treat `+` as space). ([GitHub][18])

Net: ecosystems differ—some treat query strings closer to “pure URL encoding” (`%20`), others inherit form-encoding semantics (`+`). Your problem occurs when a server/router tries to **canonicalize** and two different layers disagree.

---

## Web standards conclusion (what to align to)

* `URLSearchParams` using `+` for spaces and encoding `! ' ( ) ~` is consistent with the URL Standard’s **application/x-www-form-urlencoded** encoding model. ([url.spec.whatwg.org][5])
* MDN explicitly warns that `URL.search` vs `URLSearchParams` can serialize the “same values” differently (`%20` vs `+`, and different character sets). ([MDN Web Docs][6])

So the “fix” is not about “correctness”; it’s about **choosing one canonical representation** that matches your hosting/runtime reality and making SSR + client hydration share it.

For Vercel SSR in particular, given reports of `+`/space normalization differences in deployments, making TanStack Router canonicalize to `%20` (encodeURIComponent-style) is the most robust approach. ([GitHub][8])

---

## References (issues / PRs / docs you should track)

* TanStack Router `@tanstack/react-router` latest version (1.157.x). ([npm][1])
* TanStack/router release tags around 1.157.17 (Jan 2026). ([GitHub][2])
* Router-core `qss` implemented with `URLSearchParams` (encode/decode). ([app.unpkg.com][3])
* WHATWG URL Standard: form-encoding percent-encode set includes `! ' ( ) ~`. ([url.spec.whatwg.org][5])
* MDN: `URL.search` vs `URLSearchParams` differences (`%20` vs `+`, etc). ([MDN Web Docs][6])
* TanStack docs: custom search param serialization (`parseSearch` / `stringifySearch`). ([TanStack][10])
* TanStack PR: switch/fix around parsing `+` using `URLSearchParams` (#3894). ([GitHub][4])
* TanStack SSR redirect-loop class examples (path encoding mismatch). ([GitHub][7])
* Vercel/Next report: `+` becomes `%20` behavior differences on Vercel. ([GitHub][8])

[1]: https://www.npmjs.com/package/%40tanstack/react-router "https://www.npmjs.com/package/%40tanstack/react-router"
[2]: https://github.com/TanStack/router/releases "https://github.com/TanStack/router/releases"
[3]: https://app.unpkg.com/%40tanstack/router-core%401.147.1/files/dist/esm/qss.js.map "https://app.unpkg.com/%40tanstack/router-core%401.147.1/files/dist/esm/qss.js.map"
[4]: https://github.com/TanStack/router/pull/3894 "https://github.com/TanStack/router/pull/3894"
[5]: https://url.spec.whatwg.org/ "https://url.spec.whatwg.org/"
[6]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams?utm_source=chatgpt.com "URLSearchParams - Web APIs | MDN"
[7]: https://github.com/TanStack/router/issues/6519 "https://github.com/TanStack/router/issues/6519"
[8]: https://github.com/vercel/next.js/issues/54702 "https://github.com/vercel/next.js/issues/54702"
[9]: https://tanstack.com/router/latest/docs/framework/react/api/router/RouterOptionsType "https://tanstack.com/router/latest/docs/framework/react/api/router/RouterOptionsType"
[10]: https://tanstack.com/router/v1/docs/framework/react/guide/custom-search-param-serialization?utm_source=chatgpt.com "Custom Search Param Serialization"
[11]: https://nextjs.org/docs/app/api-reference/functions/use-search-params?utm_source=chatgpt.com "Functions: useSearchParams"
[12]: https://v2.remix.run/docs/hooks/use-search-params/?utm_source=chatgpt.com "useSearchParams"
[13]: https://reactrouter.com/api/hooks/useSearchParams?utm_source=chatgpt.com "useSearchParams"
[14]: https://reactrouter.com/api/utils/createSearchParams?utm_source=chatgpt.com "createSearchParams"
[15]: https://svelte.dev/docs/kit/web-standards?utm_source=chatgpt.com "Web standards • SvelteKit Docs"
[16]: https://github.com/vuejs/router/issues/561?utm_source=chatgpt.com "Plus signs in query parameter not decoded to space #561"
[17]: https://nuxt.com/docs/api/composables/use-route?utm_source=chatgpt.com "useRoute · Nuxt Composables v4"
[18]: https://github.com/nuxt/nuxt/issues/32629?utm_source=chatgpt.com "Vue Router params encoding doesn't encode '+' character ..."

<!-- @web-flow end id=response-20260131101215004-chatgpt -->
