import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/lib/queryClient'
import { geoJsonQueryOptions } from '@/hooks/useGeoJson'
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData'
import type { MapFilters } from '@/schemas/map-filters'

type MapViewType = 'UAT' | 'Judet'
interface MapSearchParams {
  mapViewType?: MapViewType
  filters?: MapFilters
}

export const Route = createFileRoute('/map')({
  beforeLoad: async ({ search }) => {
    const s = (search as unknown) as MapSearchParams
    const viewType: MapViewType = s?.mapViewType ?? 'UAT'
    const filters: MapFilters = s?.filters ?? ({
      years: [],
      account_categories: ['ch'],
      normalization: 'per_capita',
    } as MapFilters)

    await queryClient.prefetchQuery(geoJsonQueryOptions(viewType))
    if (viewType === 'UAT') {
      await queryClient.prefetchQuery(heatmapUATQueryOptions(filters))
    } else {
      await queryClient.prefetchQuery(heatmapJudetQueryOptions(filters))
    }
  },
})


