/**
 * Angajamente Bugetare GraphQL API
 *
 * Real API functions replacing the mock data layer.
 * Follows the pattern from src/lib/api/entity-analytics.ts.
 */

import { graphqlRequest } from './graphql'
import type {
  AngajamenteFilterInput,
  AngajamenteSummaryResult,
  AngajamenteLineItem,
  AngajamenteAggregatedItem,
  AngajamenteAnalyticsSeries,
  AngajamenteMetric,
  CommitmentExecutionComparison,
  Connection,
} from '@/schemas/angajamente'
import type { ReportPeriodInput } from '@/schemas/reporting'

// ─────────────────────────────────────────────────────────────────
// GraphQL Queries
// ─────────────────────────────────────────────────────────────────

const ANGAJAMENTE_SUMMARY_QUERY = /* GraphQL */ `
  query AngajamenteSummary($filter: AngajamenteFilterInput!, $limit: Int, $offset: Int) {
    angajamenteSummary(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        __typename
        ... on AngajamenteMonthlySummary {
          year
          month
          entity_cui
          entity_name
          report_type
          credite_angajament
          plati_trezor
          plati_non_trezor
          receptii_totale
          receptii_neplatite_change
          total_plati
        }
        ... on AngajamenteQuarterlySummary {
          year
          quarter
          entity_cui
          entity_name
          report_type
          credite_angajament
          limita_credit_angajament
          credite_bugetare
          credite_angajament_initiale
          credite_bugetare_initiale
          credite_angajament_definitive
          credite_bugetare_definitive
          credite_angajament_disponibile
          credite_bugetare_disponibile
          receptii_totale
          plati_trezor
          plati_non_trezor
          receptii_neplatite
          total_plati
          execution_rate
          commitment_rate
        }
        ... on AngajamenteAnnualSummary {
          year
          entity_cui
          entity_name
          report_type
          credite_angajament
          limita_credit_angajament
          credite_bugetare
          credite_angajament_initiale
          credite_bugetare_initiale
          credite_angajament_definitive
          credite_bugetare_definitive
          credite_angajament_disponibile
          credite_bugetare_disponibile
          receptii_totale
          plati_trezor
          plati_non_trezor
          receptii_neplatite
          total_plati
          execution_rate
          commitment_rate
        }
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const ANGAJAMENTE_LINE_ITEMS_QUERY = /* GraphQL */ `
  query AngajamenteLineItems($filter: AngajamenteFilterInput!, $limit: Int, $offset: Int) {
    angajamenteLineItems(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        id
        year
        month
        report_type
        entity_cui
        entity_name
        budget_sector_id
        budget_sector_name
        funding_source_id
        funding_source_name
        functional_code
        functional_name
        economic_code
        economic_name
        credite_angajament
        limita_credit_angajament
        credite_bugetare
        credite_angajament_initiale
        credite_bugetare_initiale
        credite_angajament_definitive
        credite_bugetare_definitive
        credite_angajament_disponibile
        credite_bugetare_disponibile
        receptii_totale
        plati_trezor
        plati_non_trezor
        receptii_neplatite
        monthly_plati_trezor
        monthly_plati_non_trezor
        monthly_receptii_totale
        monthly_receptii_neplatite_change
        monthly_credite_angajament
        is_quarterly
        quarter
        is_yearly
        anomaly
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const ANGAJAMENTE_AGGREGATED_QUERY = /* GraphQL */ `
  query AngajamenteAggregated($input: AngajamenteAggregatedInput!) {
    angajamenteAggregated(input: $input) {
      nodes {
        functional_code
        functional_name
        economic_code
        economic_name
        amount
        count
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const ANGAJAMENTE_ANALYTICS_QUERY = /* GraphQL */ `
  query AngajamenteAnalytics($inputs: [AngajamenteAnalyticsInput!]!) {
    angajamenteAnalytics(inputs: $inputs) {
      seriesId
      metric
      xAxis { name type unit }
      yAxis { name type unit }
      data { x y growth_percent }
    }
  }
`

const COMMITMENT_VS_EXECUTION_QUERY = /* GraphQL */ `
  query CommitmentVsExecution($input: CommitmentExecutionComparisonInput!) {
    commitmentVsExecution(input: $input) {
      frequency
      data {
        period
        commitment_value
        execution_value
        difference
        difference_percent
        commitment_growth_percent
        execution_growth_percent
        difference_growth_percent
      }
      total_commitment
      total_execution
      total_difference
      overall_difference_percent
      matched_count
      unmatched_commitment_count
      unmatched_execution_count
    }
  }
`

// ─────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────

export async function fetchAngajamenteSummary(
  filter: AngajamenteFilterInput,
  limit = 50,
  offset = 0
): Promise<Connection<AngajamenteSummaryResult>> {
  const data = await graphqlRequest<{
    angajamenteSummary: Connection<AngajamenteSummaryResult>
  }>(ANGAJAMENTE_SUMMARY_QUERY, { filter, limit, offset })
  return data.angajamenteSummary
}

export async function fetchAngajamenteLineItems(
  filter: AngajamenteFilterInput,
  limit = 50,
  offset = 0
): Promise<Connection<AngajamenteLineItem>> {
  const data = await graphqlRequest<{
    angajamenteLineItems: Connection<AngajamenteLineItem>
  }>(ANGAJAMENTE_LINE_ITEMS_QUERY, { filter, limit, offset })
  return data.angajamenteLineItems
}

export interface AngajamenteAggregatedInput {
  filter: AngajamenteFilterInput
  metric: AngajamenteMetric
  limit?: number
  offset?: number
}

export async function fetchAngajamenteAggregated(
  input: AngajamenteAggregatedInput
): Promise<Connection<AngajamenteAggregatedItem>> {
  const data = await graphqlRequest<{
    angajamenteAggregated: Connection<AngajamenteAggregatedItem>
  }>(ANGAJAMENTE_AGGREGATED_QUERY, { input })
  return data.angajamenteAggregated
}

export interface AngajamenteAnalyticsInput {
  filter: AngajamenteFilterInput
  metric: AngajamenteMetric
  seriesId?: string
}

export async function fetchAngajamenteAnalytics(
  inputs: AngajamenteAnalyticsInput[]
): Promise<AngajamenteAnalyticsSeries[]> {
  const data = await graphqlRequest<{
    angajamenteAnalytics: AngajamenteAnalyticsSeries[]
  }>(ANGAJAMENTE_ANALYTICS_QUERY, { inputs })
  return data.angajamenteAnalytics
}

export interface CommitmentExecutionComparisonInput {
  filter: AngajamenteFilterInput
  angajamente_metric?: AngajamenteMetric
}

export async function fetchCommitmentVsExecution(
  input: CommitmentExecutionComparisonInput
): Promise<CommitmentExecutionComparison> {
  const data = await graphqlRequest<{
    commitmentVsExecution: CommitmentExecutionComparison
  }>(COMMITMENT_VS_EXECUTION_QUERY, { input })
  return data.commitmentVsExecution
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Build an AngajamenteFilterInput from entity page params.
 */
export function buildAngajamenteFilter(params: {
  reportPeriod: ReportPeriodInput
  reportType?: string
  cui?: string
  normalization?: string
  currency?: string
  inflationAdjusted?: boolean
  excludeTransfers?: boolean
}): AngajamenteFilterInput {
  return {
    report_period: params.reportPeriod,
    report_type: (params.reportType as AngajamenteFilterInput['report_type']) ?? 'PRINCIPAL_AGGREGATED',
    entity_cuis: params.cui ? [params.cui] : undefined,
    normalization: params.normalization as AngajamenteFilterInput['normalization'],
    currency: params.currency as AngajamenteFilterInput['currency'],
    inflation_adjusted: params.inflationAdjusted,
    exclude_transfers: params.excludeTransfers ?? true,
  }
}

/**
 * Extract summary values from union-typed summary nodes.
 * Returns the totals from the first node (or zeros).
 */
export function extractSummaryValues(nodes: AngajamenteSummaryResult[]): {
  totalBudget: number
  committed: number
  paid: number
  receipts: number
  arrears: number
} {
  if (nodes.length === 0) {
    return { totalBudget: 0, committed: 0, paid: 0, receipts: 0, arrears: 0 }
  }

  // Aggregate across all nodes
  let totalBudget = 0
  let committed = 0
  let paid = 0
  let receipts = 0
  let arrears = 0

  for (const node of nodes) {
    paid += node.total_plati
    receipts += node.receptii_totale

    if (node.__typename === 'AngajamenteMonthlySummary') {
      // Monthly summaries don't have definitive credits
      totalBudget += node.credite_angajament
      committed += node.credite_angajament
    } else {
      totalBudget += node.credite_bugetare_definitive
      committed += node.credite_angajament_definitive
      arrears += node.receptii_neplatite
    }
  }

  return { totalBudget, committed, paid, receipts, arrears }
}
