/**
 * React Query hooks for Angajamente Bugetare data
 *
 * All hooks are filter-based, using AngajamenteFilterInput.
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchAngajamenteSummary,
  fetchAngajamenteLineItems,
  fetchAngajamenteAggregated,
  fetchAngajamenteAnalytics,
  fetchCommitmentVsExecution,
} from '@/lib/api/angajamente'
import type {
  AngajamenteAggregatedInput,
  AngajamenteAnalyticsInput,
  CommitmentExecutionComparisonInput,
} from '@/lib/api/angajamente'
import type {
  AngajamenteFilterInput,
  AngajamenteSummaryResult,
  PipelineStage,
} from '@/schemas/angajamente'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes

type HookOptions = { enabled?: boolean }

/**
 * Fetch angajamente summary (union type: monthly/quarterly/annual)
 */
export function useAngajamenteSummary(
  filter: AngajamenteFilterInput,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['angajamenteSummary', filter],
    queryFn: () => fetchAngajamenteSummary(filter),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Fetch paginated angajamente line items
 */
export function useAngajamenteLineItems(
  filter: AngajamenteFilterInput,
  limit = 50,
  offset = 0,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['angajamenteLineItems', filter, limit, offset],
    queryFn: () => fetchAngajamenteLineItems(filter, limit, offset),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Fetch aggregated angajamente data by classification
 */
export function useAngajamenteAggregated(
  input: AngajamenteAggregatedInput,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['angajamenteAggregated', input],
    queryFn: () => fetchAngajamenteAggregated(input),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Derive pipeline stages from summary data (client-side computation)
 */
export function useAngajamentePipeline(
  filter: AngajamenteFilterInput,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['angajamenteSummary', filter],
    queryFn: () => fetchAngajamenteSummary(filter),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
    select: (data): PipelineStage[] => {
      const nodes = data.nodes
      if (nodes.length === 0) return []

      // Use the first node that has full budget data (quarterly/annual)
      const node = nodes[0]
      return computePipelineStages(node)
    },
  })
}

/**
 * Fetch analytics time-series data (multi-series)
 */
export function useAngajamenteAnalytics(
  inputs: AngajamenteAnalyticsInput[],
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['angajamenteAnalytics', inputs],
    queryFn: () => fetchAngajamenteAnalytics(inputs),
    staleTime: STALE_TIME,
    enabled: (options?.enabled ?? true) && inputs.length > 0,
  })
}

/**
 * Fetch commitment vs execution comparison
 */
export function useCommitmentVsExecution(
  input: CommitmentExecutionComparisonInput,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['commitmentVsExecution', input],
    queryFn: () => fetchCommitmentVsExecution(input),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

// ─────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────

function computePipelineStages(node: AngajamenteSummaryResult): PipelineStage[] {
  const getStatus = (percentage: number): 'healthy' | 'warning' | 'danger' => {
    if (percentage >= 90) return 'healthy'
    if (percentage >= 70) return 'warning'
    return 'danger'
  }

  let baseValue: number
  let receipts: number

  if (node.__typename === 'AngajamenteMonthlySummary') {
    // Monthly has limited fields; use credite_angajament as base
    baseValue = node.credite_angajament
    receipts = node.receptii_totale
  } else {
    baseValue = node.credite_bugetare_definitive
    receipts = node.receptii_totale
  }

  const pct = (v: number) => (baseValue > 0 ? Math.round((v / baseValue) * 100) : 0)

  return [
    {
      id: 'credits',
      label: 'Credite Bugetare',
      value: baseValue,
      percentage: 100,
      status: 'healthy',
    },
    {
      id: 'commitments',
      label: 'Angajamente',
      value: node.credite_angajament,
      percentage: pct(node.credite_angajament),
      status: getStatus(baseValue > 0 ? (node.credite_angajament / baseValue) * 100 : 0),
    },
    {
      id: 'receipts',
      label: 'Receptii',
      value: receipts,
      percentage: pct(receipts),
      status: getStatus(baseValue > 0 ? (receipts / baseValue) * 100 : 0),
    },
    {
      id: 'payments',
      label: 'Plati',
      value: node.total_plati,
      percentage: pct(node.total_plati),
      status: getStatus(baseValue > 0 ? (node.total_plati / baseValue) * 100 : 0),
    },
  ]
}
