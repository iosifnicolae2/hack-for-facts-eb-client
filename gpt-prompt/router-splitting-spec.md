# TanStack Router route/lazy splitting best practices

## Goals
- Keep data fetching and preloading in small route files (`beforeLoad`, `validateSearch`).
- Keep UI and heavy component code in `.lazy.tsx` files to minimize initial JS and enable intent preloading.
- Share React Query options between loader and components to hydrate from one cache.

## Recommended layout
- `src/routes/path.tsx` → `createFileRoute('/path')({ validateSearch, beforeLoad })`
- `src/routes/path.lazy.tsx` → `createLazyFileRoute('/path')({ component })`

## Hooks usage in lazy files
- Use path-literal APIs to avoid importing `Route` (prevents circular deps):
  - `useParams({ from: '/path' })`
  - `useSearch({ from: '/path' })`
  - `useNavigate({ from: '/path' })`

## Prefetch pattern
- Define query option builders once (e.g., `entityDetailsQueryOptions`, `geoJsonQueryOptions`, `heatmap...Options`).
- In `beforeLoad`, prefetch with identical keys/functions used by components:
  ```ts
  await queryClient.prefetchQuery(entityDetailsQueryOptions(cui, year, start, end))
  await queryClient.prefetchQuery(geoJsonQueryOptions(mapViewType))
  ```
- In components, call `useQuery` with the same options; data is instant from the cache.

## Link preloading
- Prefer `<Link preload="intent">` for nav items and view badges. Router triggers `beforeLoad` early, without loading heavy UI.

## Caching windows
- Use a shared helper for readability:
  ```ts
  const staleTime = convertDaysToMs(1)
  const gcTime = convertDaysToMs(3)
  ```
- Set `placeholderData: keepPreviousData` and disable focus/reconnect refetches for map/trends where UX should remain stable.

## Pros
- Smaller initial bundle, faster prefetch, clearer separation, scalable routes.

## Cons
- Two files per route to maintain.
- Must avoid importing `Route` in lazy files; use path strings instead.

## Checklist
- [ ] Route file has `validateSearch` and `beforeLoad` only
- [ ] Lazy file has component only
- [ ] Shared query options are used in both places
- [ ] Links use `preload="intent"`
- [ ] No circular imports


