## Lazy-loading static JSON assets with React Query and dynamic imports

### Goal
- Reduce initial bundle size and improve TTI by deferring large static JSON assets into split chunks.
- Add query- and storage-backed caching to avoid repeated parsing and network costs.
- Maintain backward compatibility where synchronous helpers existed.

### Assets affected
- `src/assets/entity-categories.json`
- `src/assets/functional-classificatinos-general.json`

### Key decisions
- **Dynamic imports inside React Query**: Load JSON via `import()` wrapped by `useQuery` so Vite splits them into separate chunks.
- **Stable query keys + infinity staleTime**: Use deterministic keys and `staleTime: Infinity` for deterministic, non-changing datasets.
- **Local caching for computed maps**: Persist expensive computed maps in `localStorage` to survive reloads.
- **Backward-compatible sync helpers**: Keep existing synchronous getters returning an empty `Map` until async load happens; prefer new hooks in UI.
- **No direct static JSON imports**: Components should consume hooks or helper functions, not import JSON files directly.

### Implementation overview

#### Entity categories (labels)
- File: `src/hooks/filters/useFilterLabels.tsx`
  - `fetchEntityCategories`: dynamically imports `@/assets/entity-categories.json` and returns `categories`.
  - `useEntityTypeLabel`: React Query wrapper that exposes a `LabelStore`-compatible interface with `map` for id→label.
  - `useEntityTypeOptions`: Returns `OptionItem<string>[]` derived from the loaded categories, suitable for list UIs.

- Consumers migrated:
  - `src/components/filters/entity-type-filter/EntityTypeList.tsx`
    - Uses `useEntityTypeOptions()` instead of a static JSON import; preserves Fuse search behavior.
  - `src/components/entities/EntityInfo.tsx`
    - Uses `useEntityTypeLabel().map(entity.entity_type)` for the badge instead of importing JSON.

#### Functional classification tree (analytics)
- File: `src/lib/analytics-utils.ts`
  - `fetchFunctionalTree`: dynamically imports `@/assets/functional-classificatinos-general.json`.
  - `ensureChapterMap` (async): lazy-builds a `Map<string,string>` chapter map from the tree; caches to `localStorage` (`functional-chapter-map-cache-v1`).
  - `ensureIncomeSubchapterMap` (async): lazy-builds the `(NN.MM) → name` map; caches to `localStorage` (`functional-income-subchapter-map-cache-v1`).
  - `getChapterMap` and `getIncomeSubchapterMap` (sync): return the in-memory or cached `Map`, or an empty `Map` until hydrated.
  - `useChapterMap` and `useIncomeSubchapterMap`: React Query hooks to drive UI reactivity and streaming.
  - Other exports unchanged: `getTopFunctionalGroupCodes`, `processDataForAnalyticsChart`.

- Consumer updates:
  - `src/hooks/useFinancialData.ts`
    - Removed static JSON import.
    - Uses `useChapterMap()` and `useIncomeSubchapterMap()`; grouping functions accept these maps.
    - Income grouping uses `chapterMap` for chapter labels and `incomeSubchapterMap` for `NN.MM` labels.

#### GeoJSON (already lazy)
- File: `src/hooks/useGeoJson.ts`
  - Already fetched via `useQuery` with `fetch()` and `Cache-Control` headers. No change required; included here for consistency with the pattern.

### API reference (new/changed)

#### `src/hooks/filters/useFilterLabels.tsx`
- `useEntityTypeLabel(): LabelStore`
  - `map(id) → string`: returns the label for the given entity type id or a fallback `id::<id>`.
- `useEntityTypeOptions(): { options: OptionItem<string>[] }`

#### `src/lib/analytics-utils.ts`
- Async loaders (not for direct UI use):
  - `ensureChapterMap(): Promise<Map<string,string>>`
  - `ensureIncomeSubchapterMap(): Promise<Map<string,string>>`
- Synchronous fallbacks (non-reactive):
  - `getChapterMap(): Map<string,string>`
  - `getIncomeSubchapterMap(): Map<string,string>`
- React hooks (preferred in UI):
  - `useChapterMap(): UseQueryResult<Map<string,string>>`
  - `useIncomeSubchapterMap(): UseQueryResult<Map<string,string>>`

### Usage examples

```tsx
// Labels for entity type
import { useEntityTypeLabel } from '@/hooks/filters/useFilterLabels';

const EntityTypeBadge = ({ typeId }: { typeId: string }) => {
  const entityTypeLabel = useEntityTypeLabel();
  return <span>{entityTypeLabel.map(typeId)}</span>;
};
```

```tsx
// Functional chapter labels in a component
import { useChapterMap } from '@/lib/analytics-utils';

const ChapterName = ({ prefix }: { prefix: string }) => {
  const { data: chapterMap = new Map() } = useChapterMap();
  return <span>{chapterMap.get(prefix) ?? `Capitol ${prefix}`}</span>;
};
```

### Migration guidance
- DO NOT `import ... from '@/assets/*.json'` from UI components.
- For new UI that needs entity category labels, use `useEntityTypeLabel` or `useEntityTypeOptions`.
- For analytics labels, prefer `useChapterMap` and `useIncomeSubchapterMap` to ensure the UI updates when data arrives.
- If a non-reactive context must use a sync getter, be aware `getChapterMap()`/`getIncomeSubchapterMap()` may initially be empty until the lazy load runs. Prefer hooks where possible.

### Files touched in this migration
- `src/hooks/filters/useFilterLabels.tsx`
- `src/components/filters/entity-type-filter/EntityTypeList.tsx`
- `src/components/entities/EntityInfo.tsx`
- `src/lib/analytics-utils.ts`
- `src/hooks/useFinancialData.ts`
- (No change) `src/hooks/useGeoJson.ts`

### Reasoning and benefits
- Shrinks initial page chunk by removing large static JSON from the default bundle.
- Ensures one-time computation and persistence of expensive maps, reducing CPU on subsequent visits.
- Keeps API surface friendly for UI via hooks, while preserving compatibility for legacy synchronous usages.


