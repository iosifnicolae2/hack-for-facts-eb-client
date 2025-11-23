import { defaultYearRange, type AnalyticsFilterType } from '@/schemas/charts'
import { DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES, DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES } from './analytics-defaults'
import type { ReportPeriodInput, PeriodDate } from '@/schemas/reporting'
import { toReportGqlType } from '@/schemas/reporting'

function buildReportPeriodFromYears(years?: readonly number[] | number[]): ReportPeriodInput {
  const start = Array.isArray(years) && years.length > 0 ? Math.min(...years) : defaultYearRange.start
  const end = Array.isArray(years) && years.length > 0 ? Math.max(...years) : defaultYearRange.end
  return {
    type: 'YEAR',
    selection: { interval: { start: `${start}` as PeriodDate, end: `${end}` as PeriodDate } },
  }
}

export function ensureReportPeriod(filter: AnalyticsFilterType, fallback?: { period?: ReportPeriodInput }): ReportPeriodInput {
  if (filter.report_period) return filter.report_period as ReportPeriodInput
  if (fallback?.period) return fallback.period
  return buildReportPeriodFromYears()
}

export function withDefaultExcludes(filter: AnalyticsFilterType): AnalyticsFilterType {
  const accountCategory = (filter.account_category ?? 'ch') as 'ch' | 'vn'
  const exclude = { ...(filter.exclude ?? {}) }

  if (accountCategory === 'ch') {
    const economicPrefixes = new Set<string>([
      ...DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES,
      ...(exclude.economic_prefixes ?? []),
    ])
    exclude.economic_prefixes = Array.from(economicPrefixes)
  } else if (accountCategory === 'vn') {
    const functionalPrefixes = new Set<string>([
      ...DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES,
      ...(exclude.functional_prefixes ?? []),
    ])
    exclude.functional_prefixes = Array.from(functionalPrefixes)
  }

  const hasExcludeValues = Object.values(exclude).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined
  })

  return {
    ...filter,
    account_category: accountCategory,
    exclude: hasExcludeValues ? exclude : undefined,
  }
}

export function normalizeAnalyticsFilter(filter: AnalyticsFilterType, fallback?: { period?: ReportPeriodInput }): AnalyticsFilterType {
  const accountCategory = (filter.account_category ?? 'ch') as 'ch' | 'vn'
  const normalized: AnalyticsFilterType = {
    ...filter,
    account_category: accountCategory,
    report_period: ensureReportPeriod(filter, fallback),
  }
  return normalized
}

// Prepare a filter object for GraphQL server variables
export function prepareFilterForServer(filter: AnalyticsFilterType, fallback?: { period?: ReportPeriodInput }): AnalyticsFilterType {
  const normalized = normalizeAnalyticsFilter(filter, fallback)
  // Allowlist of fields accepted by AnalyticsFilterInput on the server
  const allowedKeys = new Set<keyof AnalyticsFilterType | string>([
    'account_category',
    'report_period',
    'report_type',
    'report_ids',
    'main_creditor_cui',
    'entity_cuis',
    'functional_codes',
    'functional_prefixes',
    'economic_codes',
    'economic_prefixes',
    'funding_source_ids',
    'budget_sector_ids',
    'expense_types',
    'program_codes',
    'county_codes',
    'regions',
    'uat_ids',
    'entity_types',
    'is_uat',
    'search',
    'min_population',
    'max_population',
    'normalization',
    'aggregate_min_amount',
    'aggregate_max_amount',
    'item_min_amount',
    'item_max_amount',
  ])

  const serverFilter: any = {}

  for (const [k, v] of Object.entries(normalized)) {
    if (allowedKeys.has(k)) (serverFilter as any)[k] = v
  }
  // Pass through nested exclude filters if present
  if (normalized.exclude) {
    serverFilter.exclude = normalized.exclude
  }
  if (serverFilter.report_type) {
    // Map human-readable report type to GraphQL enum variant
    try {
      serverFilter.report_type = toReportGqlType(String(serverFilter.report_type))
    } catch {
      // leave as-is if mapping fails
    }
  }
  return serverFilter as AnalyticsFilterType
}
