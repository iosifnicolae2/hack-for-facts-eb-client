/**
 * React Query hooks for Angajamente Bugetare data
 */

import { useQuery, queryOptions } from '@tanstack/react-query'
import {
  getAngajamenteData,
  getAngajamenteSummary,
  getAngajamentePipeline,
  getAngajamenteByFunctional,
} from '@/lib/api/angajamente'
import type { AngajamenteParams } from '@/schemas/angajamente'

/**
 * Query options for Angajamente summary
 */
export const angajamenteSummaryQueryOptions = (cui: string, year: number) =>
  queryOptions({
    queryKey: ['angajamenteSummary', cui, year],
    queryFn: () => getAngajamenteSummary(cui, year),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!cui && !!year,
  })

/**
 * Hook to fetch Angajamente summary for an entity
 */
export function useAngajamenteSummary(
  cui: string,
  year: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    ...angajamenteSummaryQueryOptions(cui, year),
    enabled: !!cui && !!year && (options?.enabled ?? true),
  })
}

/**
 * Query options for Angajamente line items
 */
export const angajamenteDataQueryOptions = (params: AngajamenteParams) =>
  queryOptions({
    queryKey: [
      'angajamenteData',
      params.cui,
      params.year,
      params.month,
      params.functionalCodePrefix,
      params.economicCodePrefix,
      params.fundingSource,
      params.page,
      params.pageSize,
    ],
    queryFn: () => getAngajamenteData(params),
    staleTime: 1000 * 60 * 5,
    enabled: !!params.cui && !!params.year,
  })

/**
 * Hook to fetch paginated Angajamente line items
 */
export function useAngajamenteData(
  params: AngajamenteParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    ...angajamenteDataQueryOptions(params),
    enabled: !!params.cui && !!params.year && (options?.enabled ?? true),
  })
}

/**
 * Hook to fetch pipeline stages for visualization
 */
export function useAngajamentePipeline(
  cui: string,
  year: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['angajamentePipeline', cui, year],
    queryFn: () => getAngajamentePipeline(cui, year),
    staleTime: 1000 * 60 * 5,
    enabled: !!cui && !!year && (options?.enabled ?? true),
  })
}

/**
 * Hook to fetch Angajamente grouped by functional classification
 */
export function useAngajamenteByFunctional(
  cui: string,
  year: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['angajamenteByFunctional', cui, year],
    queryFn: () => getAngajamenteByFunctional(cui, year),
    staleTime: 1000 * 60 * 5,
    enabled: !!cui && !!year && (options?.enabled ?? true),
  })
}
