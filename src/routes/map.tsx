import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/lib/queryClient'
import { geoJsonQueryOptions } from '@/hooks/useGeoJson'
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData'
import { MapStateSchema } from '@/schemas/map-filters'
import { AnalyticsFilterType } from '@/schemas/charts'

type MapViewType = 'UAT' | 'County'

export const Route = createFileRoute('/map')({
  beforeLoad: ({ search }) => {
    // Parse and normalize search params using zod defaults to ensure valid filters
    const parsed = MapStateSchema.parse(search)
    const viewType: MapViewType = parsed.mapViewType
    const filters = parsed.filters

    // Ensure required filter fields are populated for prefetch
    const normalizedFilters: AnalyticsFilterType = {
      ...filters,
      account_category: filters.account_category ?? 'ch',
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


