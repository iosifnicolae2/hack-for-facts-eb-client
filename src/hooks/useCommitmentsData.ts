/**
 * React Query hooks for Commitments Bugetare data
 *
 * All hooks are filter-based, using CommitmentsFilterInput.
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchCommitmentsSummary,
  fetchCommitmentsLineItems,
  fetchCommitmentsAggregated,
  fetchCommitmentsAggregatedAll,
  fetchCommitmentsAnalytics,
  fetchCommitmentVsExecution,
} from '@/lib/api/commitments'
import type {
  CommitmentsAggregatedInput,
  CommitmentsAnalyticsInput,
  CommitmentExecutionComparisonInput,
} from '@/lib/api/commitments'
import type {
  CommitmentsFilterInput,
  CommitmentsSummaryResult,
  PipelineStage,
} from '@/schemas/commitments'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes

type HookOptions = { enabled?: boolean }

/**
 * Fetch commitments summary (union type: monthly/quarterly/annual)
 */
export function useCommitmentsSummary(
  filter: CommitmentsFilterInput,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['commitmentsSummary', filter],
    queryFn: () => fetchCommitmentsSummary(filter),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Fetch paginated commitments line items
 */
export function useCommitmentsLineItems(
  filter: CommitmentsFilterInput,
  limit = 50,
  offset = 0,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['commitmentsLineItems', filter, limit, offset],
    queryFn: () => fetchCommitmentsLineItems(filter, limit, offset),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Fetch aggregated commitments data by classification
 */
export function useCommitmentsAggregated(
  input: CommitmentsAggregatedInput,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['commitmentsAggregated', input],
    queryFn: () => fetchCommitmentsAggregated(input),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

type AggregatedAllOptions = HookOptions & {
  pageSize?: number
  maxPages?: number
  maxItems?: number
}

/**
 * Fetch all paginated aggregated nodes (client-side pagination).
 * Use when downstream UI needs totals to reconcile (e.g. drilldowns).
 */
export function useCommitmentsAggregatedAll(
  input: CommitmentsAggregatedInput,
  options?: AggregatedAllOptions
) {
  const pageSize = options?.pageSize ?? 500
  const maxPages = options?.maxPages ?? 25
  const maxItems = options?.maxItems ?? 10_000

  return useQuery({
    queryKey: ['commitmentsAggregatedAll', input, pageSize, maxPages, maxItems],
    queryFn: () => fetchCommitmentsAggregatedAll({ input, pageSize, maxPages, maxItems }),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

/**
 * Derive pipeline stages from summary data (client-side computation)
 */
export function useCommitmentsPipeline(
  filter: CommitmentsFilterInput,
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['commitmentsSummary', filter],
    queryFn: () => fetchCommitmentsSummary(filter),
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
export function useCommitmentsAnalytics(
  inputs: CommitmentsAnalyticsInput[],
  options?: HookOptions
) {
  return useQuery({
    queryKey: ['commitmentsAnalytics', inputs],
    queryFn: () => fetchCommitmentsAnalytics(inputs),
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

function computePipelineStages(node: CommitmentsSummaryResult): PipelineStage[] {
  const getStatus = (percentage: number): 'healthy' | 'warning' | 'danger' => {
    if (percentage >= 90) return 'healthy'
    if (percentage >= 70) return 'warning'
    return 'danger'
  }

  let baseValue: number
  let receipts: number

  if (node.__typename === 'CommitmentsMonthlySummary') {
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
