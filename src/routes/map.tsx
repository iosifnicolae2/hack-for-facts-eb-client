import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/lib/queryClient'
import { geoJsonQueryOptions } from '@/hooks/useGeoJson'
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData'
import { mapStateSchema, type MapFilters } from '@/schemas/map-filters'
import { defaultYearRange } from '@/schemas/charts'

type MapViewType = 'UAT' | 'Judet'

export const Route = createFileRoute('/map')({
  beforeLoad: ({ search }) => {
    // Parse and normalize search params using zod defaults to ensure valid filters
    const parsed = mapStateSchema.parse(search)
    const viewType: MapViewType = parsed.mapViewType
    const filters = parsed.filters

    // Ensure required filter fields are populated for prefetch
    const normalizedFilters: MapFilters = {
      ...filters,
      years: filters.years && filters.years.length > 0 ? filters.years : [defaultYearRange.end],
      account_categories:
        filters.account_categories && filters.account_categories.length > 0
          ? filters.account_categories
          : (['ch'] as ('ch' | 'vn')[]),
      normalization: filters.normalization ?? 'per_capita',
    }

    queryClient.prefetchQuery(geoJsonQueryOptions(viewType))
    if (viewType === 'UAT') {
      queryClient.prefetchQuery(heatmapUATQueryOptions(normalizedFilters))
    } else {
      queryClient.prefetchQuery(heatmapJudetQueryOptions(normalizedFilters))
    }
  },
})


