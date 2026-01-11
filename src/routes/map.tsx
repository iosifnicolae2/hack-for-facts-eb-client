import { createFileRoute } from '@tanstack/react-router'
import { geoJsonQueryOptions } from '@/hooks/useGeoJson'
import { heatmapJudetQueryOptions, heatmapUATQueryOptions } from '@/hooks/useHeatmapData'
import { MapStateSchema } from '@/schemas/map-filters'
import { AnalyticsFilterType } from '@/schemas/charts'
import { readUserCurrencyPreference, readUserInflationAdjustedPreference } from '@/lib/user-preferences'

type MapViewType = 'UAT' | 'County'

export const Route = createFileRoute('/map')({
  beforeLoad: async ({ context, search }) => {
    const { queryClient } = context
    // Parse and normalize search params using zod defaults to ensure valid filters
    const parsed = MapStateSchema.parse(search)
    const viewType: MapViewType = parsed.mapViewType
    const filters = parsed.filters

    const userCurrency = await readUserCurrencyPreference()
    const userInflationAdjusted = await readUserInflationAdjustedPreference()

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

    // GeoJSON uses relative URLs that don't work during SSR, prefetch only on client
    if (typeof window !== 'undefined') {
      queryClient.prefetchQuery(geoJsonQueryOptions(viewType))
    }
    if (viewType === 'UAT') {
      queryClient.prefetchQuery(heatmapUATQueryOptions(normalizedFilters))
    } else {
      queryClient.prefetchQuery(heatmapJudetQueryOptions(normalizedFilters))
    }
  },
})
