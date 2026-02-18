import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { gql } from '../graphql.js'
import {
  SearchResponseSchema,
  EntityDataResponseSchema,
  HeatmapResponseSchema,
  INCLUDE_SECTIONS,
  DEFAULT_INCLUDES,
  type EntityDataResponse,
  type IncludeSection,
} from '../schemas.js'
import {
  ENTITY_SEARCH_QUERY,
  ENTITY_DETAILS_QUERY,
  ENTITY_BASIC_QUERY,
  ENTITY_RELATIONSHIPS_QUERY,
  ENTITY_LINE_ITEMS_QUERY,
  ENTITY_REPORTS_QUERY,
  COMMITMENTS_SUMMARY_QUERY,
  COMMITMENTS_AGGREGATED_QUERY,
  COMMITMENTS_ANALYTICS_QUERY,
  COMMITMENT_VS_EXECUTION_QUERY,
  EXECUTION_ANALYTICS_QUERY,
  HEATMAP_UAT_DATA_QUERY,
  INS_OBSERVATIONS_QUERY,
} from '../queries.js'

type SearchResponse = z.infer<typeof SearchResponseSchema>

const app = new OpenAPIHono()

// ── Helpers ──

function buildReportPeriod(year: string, periodType: string) {
  return {
    type: periodType,
    selection: { interval: { start: year, end: year } },
  }
}

function buildTrendPeriod(year: string, periodType: string) {
  const y = parseInt(year, 10)
  if (periodType === 'QUARTER') {
    return { type: 'QUARTER', selection: { interval: { start: `${y}-Q1`, end: `${y}-Q4` } } }
  }
  if (periodType === 'MONTH') {
    return { type: 'MONTH', selection: { interval: { start: `${y}-01`, end: `${y}-12` } } }
  }
  return { type: 'YEAR', selection: { interval: { start: `${y - 10}`, end: `${y + 1}` } } }
}

function buildCommitmentsFilter(
  cui: string,
  reportPeriod: ReturnType<typeof buildReportPeriod>,
  opts: { reportType: string; normalization: string; currency: string; inflationAdjusted: boolean },
) {
  return {
    report_period: reportPeriod,
    report_type: opts.reportType,
    entity_cuis: [cui],
    normalization: opts.normalization,
    currency: opts.currency,
    inflation_adjusted: opts.inflationAdjusted,
    exclude_transfers: true,
  }
}

function createSafeGql(errors: { section: string; error: string }[]) {
  return async function safeGql<T>(section: string, query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      return await gql<T>(query, variables)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[${section}] GraphQL error:`, msg)
      errors.push({ section, error: msg })
      return null
    }
  }
}

function extractBasicInfo(entity: Record<string, unknown>) {
  return {
    cui: entity.cui,
    name: entity.name,
    address: entity.address ?? null,
    entity_type: entity.entity_type ?? null,
    is_uat: entity.is_uat ?? null,
    default_report_type: entity.default_report_type ?? null,
    uat: entity.uat ?? null,
    parents: entity.parents ?? [],
  }
}

// ── GET /search ──

const searchRoute = createRoute({
  method: 'get',
  path: '/search',
  operationId: 'searchEntities',
  tags: ['Search'],
  summary: 'Search for public entities by name, location, or type',
  description: 'Search for Romanian public entities and get their CUI identifiers. Use this first to find the CUI, then call GET /entities/{cui} for budget data. Supports free-text search, entity type filtering, and UAT filtering.',
  request: {
    query: z.object({
      search: z.string().optional().openapi({
        description: 'Free-text search on entity name (fuzzy matching).',
        example: 'Cluj',
      }),
      entity_type: z.string().optional().openapi({
        description: 'Filter by type: admin_county_council, admin_city_hall, admin_town_hall, admin_commune_hall, admin_municipality, edu_university, edu_school, health_hospital, justice_court, ministry, agency, authority, other.',
      }),
      is_uat: z.coerce.boolean().optional().openapi({
        description: 'If true, only UATs (municipalities/cities/communes). If false, only non-UAT entities.',
      }),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20).openapi({
        description: 'Maximum results (1-100). Default: 20.',
      }),
      offset: z.coerce.number().int().min(0).optional().default(0).openapi({
        description: 'Pagination offset. Default: 0.',
      }),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: SearchResponseSchema } },
      description: 'Matching entities with CUI identifiers.',
    },
  },
})

app.openapi(searchRoute, async (c) => {
  const q = c.req.valid('query')

  const filter: Record<string, unknown> = {}
  if (q.search) filter.search = q.search
  if (q.entity_type) filter.entity_type = q.entity_type
  if (q.is_uat !== undefined) filter.is_uat = q.is_uat

  const data = await gql<{ entities: SearchResponse }>(
    ENTITY_SEARCH_QUERY,
    { filter, limit: q.limit, offset: q.offset },
  )

  return c.json(data.entities, 200)
})

// ── GET /entities/{cui} ──

const entityDataRoute = createRoute({
  method: 'get',
  path: '/entities/{cui}',
  operationId: 'getEntityData',
  tags: ['Entity Data'],
  summary: 'Get comprehensive budget data for a public entity',
  description: `Returns all available budget data for a given entity. Use the **include** parameter to select specific sections.

**Available include sections:**
- \`details\` — Basic info (always returned)
- \`financials\` — Total income, expenses, balance
- \`trends\` — Historical trends (time series)
- \`line_items\` — Detailed execution line items
- \`reports\` — Official reports with download links
- \`relationships\` — Parent and child entities
- \`commitments_summary\` — Budget commitments overview
- \`commitments_aggregated\` — Commitments by classification
- \`commitments_analytics\` — Commitments time series
- \`commitment_vs_execution\` — Commitments vs execution comparison
- \`execution_analytics\` — Execution by functional category
- \`ins_observations\` — INS statistical data (requires ins_dataset_codes)
- \`funding_sources\` — Funding source references

**By default, all sections are fetched** (except ins_observations which needs ins_dataset_codes).
For heatmap data (per-capita spending across all UATs), use the dedicated GET /heatmap endpoint.`,
  request: {
    params: z.object({
      cui: z.string().openapi({
        description: 'CUI (Cod Unic de Identificare). Get this from /search.',
        example: '2845710',
      }),
    }),
    query: z.object({
      include: z.string().optional().openapi({
        description: `Comma-separated sections to include, or "all" for everything. Available values: all, ${INCLUDE_SECTIONS.join(', ')}. Default: all (except ins_observations and heatmap which need extra params).`,
        example: 'all',
      }),
      year: z.string().optional().openapi({
        description: 'Budget year (e.g. "2025"). Default: previous year.',
        example: '2025',
      }),
      period_type: z.enum(['YEAR', 'QUARTER', 'MONTH']).optional().default('YEAR').openapi({
        description: 'Period granularity. Default: YEAR.',
      }),
      report_type: z.enum([
        'PRINCIPAL_AGGREGATED',
        'SECONDARY_AGGREGATED',
        'DETAILED',
        'COMMITMENT_PRINCIPAL_AGGREGATED',
        'COMMITMENT_SECONDARY_AGGREGATED',
        'COMMITMENT_DETAILED',
      ]).optional().default('PRINCIPAL_AGGREGATED').openapi({
        description: 'Report type. Default: PRINCIPAL_AGGREGATED.',
      }),
      normalization: z.enum(['total', 'per_capita']).optional().default('total').openapi({
        description: '"total" = raw amounts. "per_capita" = per inhabitant.',
      }),
      currency: z.enum(['RON', 'EUR']).optional().default('RON').openapi({
        description: 'Currency. Default: RON.',
      }),
      inflation_adjusted: z.coerce.boolean().optional().default(false).openapi({
        description: 'Inflation-adjusted amounts. Default: false.',
      }),
      ins_dataset_codes: z.string().optional().openapi({
        description: 'Comma-separated INS dataset codes for ins_observations include. Example: POP107D,FOM104D',
        example: 'POP107D,FOM104D',
      }),
      commitments_metrics: z.string().optional().openapi({
        description: 'Comma-separated metrics for commitments_aggregated/analytics. Available: CREDITE_BUGETARE_DEFINITIVE, CREDITE_ANGAJAMENT, PLATI_TREZOR, PLATI_NON_TREZOR, RECEPTII_TOTALE.',
        example: 'CREDITE_BUGETARE_DEFINITIVE,CREDITE_ANGAJAMENT,PLATI_TREZOR',
      }),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EntityDataResponseSchema } },
      description: 'Entity data with requested sections. Failed sections are null with errors in _errors.',
    },
  },
})

app.openapi(entityDataRoute, async (c) => {
  const { cui } = c.req.valid('param')
  const q = c.req.valid('query')

  const defaultYear = String(new Date().getFullYear() - 1)
  const year = q.year ?? defaultYear
  const periodType = q.period_type ?? 'YEAR'
  const reportType = q.report_type ?? 'PRINCIPAL_AGGREGATED'
  const normalization = q.normalization ?? 'total'
  const currency = q.currency ?? 'RON'
  const inflationAdjusted = q.inflation_adjusted ?? false

  const rawInclude = q.include?.trim()
  const includes = new Set<IncludeSection>(
    !rawInclude || rawInclude === 'all'
      ? [...INCLUDE_SECTIONS]
      : (rawInclude.split(',').map((s) => s.trim()).filter((s) => INCLUDE_SECTIONS.includes(s as IncludeSection)) as IncludeSection[]),
  )
  includes.add('details')

  const reportPeriod = buildReportPeriod(year, periodType)
  const trendPeriod = buildTrendPeriod(year, periodType)
  const commitmentMetrics = q.commitments_metrics
    ? q.commitments_metrics.split(',').map((s) => s.trim()).filter(Boolean)
    : ['CREDITE_BUGETARE_DEFINITIVE', 'CREDITE_ANGAJAMENT', 'PLATI_TREZOR']
  const needsFinancials = includes.has('financials') || includes.has('trends')

  const errors: { section: string; error: string }[] = []
  const safe = createSafeGql(errors)
  const response: Record<string, unknown> = {}

  // ── 1. Entity details + financials + trends (combined query) ──
  if (needsFinancials) {
    const data = await safe<{ entity: Record<string, unknown> | null }>(
      'details+financials+trends',
      ENTITY_DETAILS_QUERY,
      { cui, reportPeriod, trendPeriod, reportType, normalization, currency, inflation_adjusted: inflationAdjusted },
    )

    if (!data?.entity) {
      const basicData = await safe<{ entity: Record<string, unknown> | null }>('details', ENTITY_BASIC_QUERY, { cui })
      if (!basicData?.entity) {
        return c.json({ error: `Entity with CUI ${cui} not found`, _errors: errors } as unknown as EntityDataResponse, 404 as unknown as 200)
      }
      Object.assign(response, extractBasicInfo(basicData.entity))
    } else {
      Object.assign(response, extractBasicInfo(data.entity))
      if (includes.has('financials')) {
        response.financials = {
          total_income: data.entity.totalIncome ?? null,
          total_expenses: data.entity.totalExpenses ?? null,
          budget_balance: data.entity.budgetBalance ?? null,
          period: { type: periodType, year },
          normalization,
          currency,
        }
      }
      if (includes.has('trends')) {
        response.trends = {
          income: data.entity.incomeTrend ?? null,
          expenses: data.entity.expenseTrend ?? null,
          balance: data.entity.balanceTrend ?? null,
        }
      }
    }
  } else {
    const data = await safe<{ entity: Record<string, unknown> | null }>('details', ENTITY_BASIC_QUERY, { cui })
    if (!data?.entity) {
      return c.json({ error: `Entity with CUI ${cui} not found`, _errors: errors } as unknown as EntityDataResponse, 404 as unknown as 200)
    }
    Object.assign(response, extractBasicInfo(data.entity))
  }

  // ── Parallel fetches ──
  const promises: Promise<void>[] = []
  const sharedOpts = { reportType, normalization, currency, inflationAdjusted }

  if (includes.has('relationships')) {
    promises.push(
      safe<{ entity: { children?: Record<string, unknown>[]; parents?: Record<string, unknown>[] } | null }>(
        'relationships', ENTITY_RELATIONSHIPS_QUERY, { cui },
      ).then((data) => {
        response.children = data?.entity?.children ?? []
      }),
    )
  }

  if (includes.has('line_items') || includes.has('funding_sources')) {
    promises.push(
      safe<{
        entity: {
          executionLineItemsCh?: { nodes: Record<string, unknown>[] } | null
          executionLineItemsVn?: { nodes: Record<string, unknown>[] } | null
        } | null
        fundingSources?: { nodes: Record<string, unknown>[] } | null
      }>('line_items', ENTITY_LINE_ITEMS_QUERY, {
        cui, reportPeriod, reportType, normalization, currency, inflation_adjusted: inflationAdjusted,
      }).then((data) => {
        if (includes.has('line_items')) {
          response.line_items = {
            expenses: data?.entity?.executionLineItemsCh?.nodes ?? [],
            income: data?.entity?.executionLineItemsVn?.nodes ?? [],
          }
        }
        if (includes.has('funding_sources')) {
          response.funding_sources = data?.fundingSources?.nodes ?? []
        }
      }),
    )
  }

  if (includes.has('reports')) {
    promises.push(
      safe<{ entity: { reports: { nodes: Record<string, unknown>[]; pageInfo: Record<string, unknown> } } | null }>(
        'reports', ENTITY_REPORTS_QUERY, { cui, limit: 50, offset: 0, type: reportType, sort: { by: 'report_date', order: 'DESC' } },
      ).then((data) => {
        response.reports = data?.entity?.reports ?? { nodes: [], pageInfo: { totalCount: 0, hasNextPage: false, hasPreviousPage: false } }
      }),
    )
  }

  if (includes.has('commitments_summary')) {
    const filter = buildCommitmentsFilter(cui, reportPeriod, sharedOpts)
    promises.push(
      safe<{ commitmentsSummary: { nodes: Record<string, unknown>[]; pageInfo: Record<string, unknown> } }>(
        'commitments_summary', COMMITMENTS_SUMMARY_QUERY, { filter, limit: 50, offset: 0 },
      ).then((data) => {
        response.commitments_summary = data?.commitmentsSummary ?? null
      }),
    )
  }

  if (includes.has('commitments_aggregated')) {
    const filter = buildCommitmentsFilter(cui, reportPeriod, sharedOpts)
    const aggPromises = commitmentMetrics.map((metric) =>
      safe<{ commitmentsAggregated: { nodes: Record<string, unknown>[]; pageInfo: Record<string, unknown> } }>(
        `commitments_aggregated:${metric}`, COMMITMENTS_AGGREGATED_QUERY,
        { input: { filter, metric, limit: 500, offset: 0 } },
      ).then((data) => ({
        metric,
        result: data?.commitmentsAggregated ?? { nodes: [], pageInfo: { totalCount: 0, hasNextPage: false, hasPreviousPage: false } },
      })),
    )
    promises.push(
      Promise.all(aggPromises).then((results) => {
        const aggregated: Record<string, unknown> = {}
        for (const { metric, result } of results) aggregated[metric] = result
        response.commitments_aggregated = aggregated
      }),
    )
  }

  if (includes.has('commitments_analytics')) {
    const filter = buildCommitmentsFilter(cui, buildTrendPeriod(year, periodType), sharedOpts)
    const inputs = commitmentMetrics.map((metric) => ({
      filter, metric, seriesId: metric.toLowerCase(),
    }))
    promises.push(
      safe<{ commitmentsAnalytics: Record<string, unknown>[] }>(
        'commitments_analytics', COMMITMENTS_ANALYTICS_QUERY, { inputs },
      ).then((data) => {
        response.commitments_analytics = data?.commitmentsAnalytics ?? null
      }),
    )
  }

  if (includes.has('commitment_vs_execution')) {
    const filter = buildCommitmentsFilter(cui, reportPeriod, sharedOpts)
    promises.push(
      safe<{ commitmentVsExecution: Record<string, unknown> }>(
        'commitment_vs_execution', COMMITMENT_VS_EXECUTION_QUERY, { input: { filter } },
      ).then((data) => {
        response.commitment_vs_execution = data?.commitmentVsExecution ?? null
      }),
    )
  }

  if (includes.has('execution_analytics')) {
    const prefixes = ['51', '54', '61', '65', '66', '67', '68', '70', '74', '84']
    const inputs = prefixes.map((prefix) => ({
      seriesId: `${prefix}-${cui}-expense`,
      filter: {
        entity_cuis: [cui],
        functional_prefixes: [prefix],
        account_category: 'ch',
        report_type: reportType,
        normalization, currency,
        inflation_adjusted: inflationAdjusted,
        show_period_growth: false,
        report_period: buildTrendPeriod(year, periodType),
        exclude: { economic_prefixes: ['51.01', '51.02'] },
      },
    }))
    promises.push(
      safe<{ executionAnalytics: Record<string, unknown>[] }>(
        'execution_analytics', EXECUTION_ANALYTICS_QUERY, { inputs },
      ).then((data) => {
        response.execution_analytics = data?.executionAnalytics ?? null
      }),
    )
  }

  if (includes.has('ins_observations') && q.ins_dataset_codes) {
    const datasetCodes = q.ins_dataset_codes.split(',').map((s) => s.trim()).filter(Boolean)
    const sirutaCode = (response as Record<string, { siruta_code?: number }>).uat?.siruta_code

    if (sirutaCode && datasetCodes.length > 0) {
      const insFilter = { sirutaCodes: [String(sirutaCode)], territoryLevels: ['LAU'] }
      const insPromises = datasetCodes.map((code) =>
        safe<{ insObservations: { nodes: Record<string, unknown>[]; pageInfo: Record<string, unknown> } }>(
          `ins_observations:${code}`, INS_OBSERVATIONS_QUERY,
          { datasetCode: code, filter: insFilter, limit: 200, offset: 0 },
        ).then((data) => ({
          code,
          result: data?.insObservations ?? { nodes: [], pageInfo: { totalCount: 0, hasNextPage: false, hasPreviousPage: false } },
        })),
      )
      promises.push(
        Promise.all(insPromises).then((results) => {
          const observations: Record<string, unknown> = {}
          for (const { code, result } of results) observations[code] = result
          response.ins_observations = observations
        }),
      )
    }
  }

  await Promise.all(promises)

  if (errors.length > 0) {
    response._errors = errors
  }

  return c.json(response as EntityDataResponse, 200)
})

// ── GET /heatmap ──

const heatmapRoute = createRoute({
  method: 'get',
  path: '/heatmap',
  operationId: 'getHeatmapData',
  tags: ['Heatmap'],
  summary: 'Get per-capita spending data for all UATs in Romania',
  description: `Returns per-capita spending data for all UATs (municipalities, cities, communes) across Romania.
This is a global dataset — it does not depend on a specific entity CUI.

Useful for building maps, rankings, or comparisons of municipal spending.`,
  request: {
    query: z.object({
      year: z.string().optional().openapi({
        description: 'Budget year (e.g. "2025"). Default: previous year.',
        example: '2025',
      }),
      report_type: z.enum([
        'PRINCIPAL_AGGREGATED',
        'SECONDARY_AGGREGATED',
        'DETAILED',
      ]).optional().default('PRINCIPAL_AGGREGATED').openapi({
        description: 'Report type. Default: PRINCIPAL_AGGREGATED.',
      }),
      currency: z.enum(['RON', 'EUR']).optional().default('RON').openapi({
        description: 'Currency. Default: RON.',
      }),
      inflation_adjusted: z.coerce.boolean().optional().default(false).openapi({
        description: 'Inflation-adjusted amounts. Default: false.',
      }),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: HeatmapResponseSchema } },
      description: 'Per-capita spending data for all UATs.',
    },
  },
})

app.openapi(heatmapRoute, async (c) => {
  const q = c.req.valid('query')

  const defaultYear = String(new Date().getFullYear() - 1)
  const year = q.year ?? defaultYear
  const reportType = q.report_type ?? 'PRINCIPAL_AGGREGATED'
  const currency = q.currency ?? 'RON'
  const inflationAdjusted = q.inflation_adjusted ?? false

  const reportPeriod = buildReportPeriod(year, 'YEAR')

  const data = await gql<{ heatmapUATData: Record<string, unknown>[] }>(
    HEATMAP_UAT_DATA_QUERY,
    {
      filter: {
        report_period: reportPeriod,
        account_category: 'ch',
        normalization: 'per_capita',
        currency,
        inflation_adjusted: inflationAdjusted,
        report_type: reportType,
        show_period_growth: false,
        exclude: { economic_prefixes: ['51.01', '51.02'] },
      },
    },
  )

  return c.json({ data: data.heatmapUATData }, 200)
})

export default app
