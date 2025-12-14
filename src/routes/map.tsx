import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/lib/queryClient'
import { geoJsonQueryOptions } from '@/hooks/useGeoJson'
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData'
import { MapStateSchema } from '@/schemas/map-filters'
import { AnalyticsFilterType } from '@/schemas/charts'
import { getPersistedState } from '@/lib/hooks/usePersistedState'

type MapViewType = 'UAT' | 'County'

export const Route = createFileRoute('/map')({
  beforeLoad: ({ search }) => {
    // Parse and normalize search params using zod defaults to ensure valid filters
    const parsed = MapStateSchema.parse(search)
    const viewType: MapViewType = parsed.mapViewType
    const filters = parsed.filters

    const userCurrency = getPersistedState<'RON' | 'EUR' | 'USD'>('user-currency', 'RON')
    const userInflationAdjusted = getPersistedState<boolean>('user-inflation-adjusted', false)

    const normalizationRaw = filters.normalization ?? 'total'
    const normalization = (() => {
      if (normalizationRaw === 'total_euro') return 'total'
      if (normalizationRaw === 'per_capita_euro') return 'per_capita'
      return normalizationRaw
    })()
    const currency =
      normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro'
        ? 'EUR'
        : (filters.currency ?? userCurrency)
    const inflationAdjusted =
      normalization === 'percent_gdp'
        ? false
        : (filters.inflation_adjusted ?? userInflationAdjusted)

    // Ensure required filter fields are populated for prefetch
    const normalizedFilters: AnalyticsFilterType = {
      ...filters,
      account_category: filters.account_category ?? 'ch',
      normalization,
      currency,
      inflation_adjusted: inflationAdjusted,
    }

    queryClient.prefetchQuery(geoJsonQueryOptions(viewType))
    if (viewType === 'UAT') {
      queryClient.prefetchQuery(heatmapUATQueryOptions(normalizedFilters))
    } else {
      queryClient.prefetchQuery(heatmapJudetQueryOptions(normalizedFilters))
    }
  },
})

