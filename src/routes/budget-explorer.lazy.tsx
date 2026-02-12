import { createLazyFileRoute, useNavigate, useSearch, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Trans } from '@lingui/react/macro'
import { useMemo, useEffect } from 'react'

import {
  AnalyticsFilterSchema,
  AnalyticsFilterType,
  createDefaultExecutionYearReportPeriod,
} from '@/schemas/charts'
import { convertDaysToMs, generateHash } from '@/lib/utils'
import { fetchAggregatedLineItems } from '@/lib/api/entity-analytics'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { BudgetExplorerHeader } from '@/components/budget-explorer/BudgetExplorerHeader'
import { BudgetTreemap } from '@/components/budget-explorer/BudgetTreemap'
import { BudgetCategoryList } from '@/components/budget-explorer/BudgetCategoryList'
import { BudgetLineItemsPreview } from '@/components/budget-explorer/BudgetLineItemsPreview'
import { useTreemapDrilldown } from '@/components/budget-explorer/useTreemapDrilldown'
import { SpendingBreakdown } from '@/components/budget-explorer/SpendingBreakdown'
import { RevenueBreakdown } from '@/components/budget-explorer/RevenueBreakdown'
import { FloatingQuickNav } from '@/components/ui/FloatingQuickNav'
import { ChartPreview } from '@/components/charts/components/chart-preview/ChartPreview'
import { Chart, ChartSchema, SeriesConfigurationSchema } from '@/schemas/charts'
import { BarChart2, ExternalLink } from 'lucide-react'
import { getSeriesColor } from '@/components/charts/components/chart-renderer/utils';
import { getClassificationName } from '@/lib/classifications'
import { getEconomicChapterName } from '@/lib/economic-classifications'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePeriodLabel } from '@/hooks/use-period-label'
import { useUserCurrency } from '@/lib/hooks/useUserCurrency'
import { useUserInflationAdjusted } from '@/lib/hooks/useUserInflationAdjusted'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { t } from '@lingui/core/macro'
import { getSiteUrl } from '@/config/env'
import { withDefaultExcludes } from '@/lib/filterUtils'
import type { ReportPeriodInput } from '@/schemas/reporting'
import { DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES, DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES } from '@/lib/analytics-defaults'
import { parseSearchParamJson } from '@/lib/router-search'
import { createValidationError } from '@/lib/errors/types'
// JSON-LD injected via Route.head

export const Route = createLazyFileRoute('/budget-explorer')({
  component: BudgetExplorerPage,
})

const PrimaryLevelEnum = z.enum(['fn', 'ec'])
const DepthEnum = z.enum(['chapter', 'subchapter', 'paragraph'])
const ViewEnum = z.enum(['overview', 'treemap', 'sankey', 'list'])

const baseDefaultFilter: AnalyticsFilterType = {
  report_period: createDefaultExecutionYearReportPeriod(),
  account_category: 'ch',
  report_type: 'Executie bugetara agregata la nivel de ordonator principal',
}
const defaultFilter: AnalyticsFilterType = withDefaultExcludes(baseDefaultFilter)
const defaultReportPeriod = createDefaultExecutionYearReportPeriod() as ReportPeriodInput
type BudgetExplorerFilter = Omit<AnalyticsFilterType, 'report_period'> & { report_period: ReportPeriodInput }
const defaultBudgetExplorerFilter: BudgetExplorerFilter = {
  ...defaultFilter,
  report_period: defaultReportPeriod,
}

function normalizeBudgetExplorerFilterInput(rawValue: unknown): unknown {
  const parsed = parseSearchParamJson(rawValue)

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return parsed

  const rawFilter = parsed as Record<string, unknown>
  const fixedFilter = { ...rawFilter }

  if (!('report_period' in fixedFilter) && 'report_periodfsd' in fixedFilter) {
    fixedFilter.report_period = fixedFilter.report_periodfsd
    delete fixedFilter.report_periodfsd
  }

  return fixedFilter
}

const BudgetExplorerFilterSchema = z.preprocess(
  normalizeBudgetExplorerFilterInput,
  AnalyticsFilterSchema,
).transform((filter): BudgetExplorerFilter => {
  return {
    ...defaultBudgetExplorerFilter,
    ...filter,
    report_period: (filter.report_period as ReportPeriodInput | undefined) ?? defaultBudgetExplorerFilter.report_period,
  }
})

const SearchSchema = z.object({
  view: ViewEnum.default('overview').describe('View type: overview | treemap | sankey | list.'),
  primary: PrimaryLevelEnum.default('fn').describe('Primary grouping: fn (functional) or ec (economic).'),
  depth: DepthEnum.default('chapter').describe('Detail level: chapter (chapters) or subchapter (subcategories).'),
  search: z.string().optional().describe('Text search within categories.'),
  filter: z.preprocess((value) => (value === undefined ? defaultFilter : value), BudgetExplorerFilterSchema).describe(
    'Budget filter including report_period, account_category, normalization, report_type.',
  ),
  treemapPrimary: PrimaryLevelEnum.optional().describe('Explicit treemap grouping override: fn | ec.'),
  treemapPath: z.coerce.string().optional().describe('Treemap drilldown breadcrumb codes, comma-separated.'),
  year: z.coerce.number().optional().describe('Shorthand for setting report year (overrides filter.report_period).'),
})

export type BudgetExplorerState = z.infer<typeof SearchSchema>

// Removed ministries list (unused after simplifying charts)

const functionalMainChapters = ['68', '66', '65', '84', '51', '61', '70', '83', '60', '74', '55', '67'] as const
const economicMainChapters = [57, 10, 20, 51, 30, 55, 56, 61] as const
// Revenue-focused top functional categories (codes provided by product spec)
const revenueTopFunctionalChapters = ['21', '10', '42', '03', '14', '01', '33'] as const


// JSON-LD is injected within the component render (accepted by crawlers)

function computeTemporalCoverage(period: BudgetExplorerState['filter']['report_period']): string | undefined {
  if (!period || !period.selection) return undefined
  const { type, selection } = period
  if (type === 'YEAR' && 'dates' in selection && Array.isArray(selection.dates) && selection.dates.length) {
    const years = selection.dates.map((d) => d.slice(0, 4)).sort()
    if (years.length === 1) return years[0]
    return `${years[0]}/${years[years.length - 1]}`
  }
  if ('interval' in selection && selection.interval?.start && selection.interval?.end) {
    return `${selection.interval.start}/${selection.interval.end}`
  }
  return undefined
}

export function head({ search }: { search: BudgetExplorerState }) {
  const site = getSiteUrl()
  const canonical = `${site}/budget-explorer`
  const period = search.filter?.report_period
  const temporalCoverage = computeTemporalCoverage(period)
  const title = 'Budget Explorer – Transparenta.eu'
  const description = 'Explore Romania public finance by category and year. Switch between overview, treemap, sankey and list; filter by spending or revenue.'

  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Romanian Public Budget – Explorer',
    description,
    url: canonical,
    temporalCoverage: temporalCoverage ?? undefined,
    spatialCoverage: { '@type': 'Place', name: 'Romania' },
    publisher: { '@type': 'Organization', '@id': `${site}#organization`, name: 'Transparenta.eu', url: site },
    keywords: ['budget', 'Romania', 'public finance', 'transparency', 'spending', 'revenue'],
    isBasedOn: 'https://mfinante.gov.ro',
  }

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:url', content: canonical },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'canonical', content: canonical },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify(dataset) },
    ],
  }
}


function buildSeriesFilter(base: AnalyticsFilterType, overrides: Partial<AnalyticsFilterType>) {
  return {
    ...base,
    functional_codes: undefined,
    functional_prefixes: undefined,
    economic_codes: undefined,
    economic_prefixes: undefined,
    report_type: 'Executie bugetara agregata la nivel de ordonator principal',
    ...overrides,
    report_period: undefined,
  } as AnalyticsFilterType
}

function BudgetExplorerPage() {
  const raw = useSearch({ from: '/budget-explorer' })
  const navigate = useNavigate({ from: '/budget-explorer' })
  const parsedSearch = SearchSchema.safeParse(raw)
  if (!parsedSearch.success) {
    const hints = parsedSearch.error.issues
      .map((issue) => {
        const path = issue.path.length ? issue.path.join('.') : 'search'
        return `${path}: ${issue.message}`
      })
      .join('; ')

    throw createValidationError('invalid-search-params', `Invalid URL parameters: ${hints}`)
  }

  const search = parsedSearch.data
  const isMobile = useIsMobile()
  const [userCurrency, setUserCurrency] = useUserCurrency()
  const [userInflationAdjusted, setUserInflationAdjusted] = useUserInflationAdjusted()

	  const { primary, depth, treemapPrimary, treemapPath, year } = search

  // Apply year shorthand: if year is provided in URL, override filter.report_period
  const filter = useMemo(() => {
    if (year && Number.isFinite(year)) {
      return {
        ...search.filter,
        report_period: {
          type: 'YEAR' as const,
          selection: { dates: [String(year)] },
        },
      }
    }
    return search.filter
  }, [search.filter, year])
	  const effectiveNormalization = useMemo(() => {
	    const rawNormalization = filter.normalization ?? 'total'
	    let normalized = rawNormalization
	    if (rawNormalization === 'total_euro') {
	      normalized = 'total'
	    } else if (rawNormalization === 'per_capita_euro') {
	      normalized = 'per_capita'
	    }
	    return normalized
	  }, [filter.normalization])

  const effectiveCurrency = useMemo(() => {
    const rawNormalization = filter.normalization
    if (rawNormalization === 'total_euro' || rawNormalization === 'per_capita_euro') return 'EUR'
    return filter.currency ?? userCurrency
  }, [filter.currency, filter.normalization, userCurrency])

  const effectiveInflationAdjusted = useMemo(() => {
    if (effectiveNormalization === 'percent_gdp') return false
    return Boolean(filter.inflation_adjusted ?? userInflationAdjusted)
  }, [effectiveNormalization, filter.inflation_adjusted, userInflationAdjusted])

  const effectiveFilter: AnalyticsFilterType = useMemo(() => ({
    ...filter,
    normalization: effectiveNormalization,
    currency: effectiveCurrency,
    inflation_adjusted: effectiveInflationAdjusted,
  }), [effectiveCurrency, effectiveInflationAdjusted, effectiveNormalization, filter])

  const filterHash = generateHash(JSON.stringify(effectiveFilter))

  // Use treemapPrimary from URL if available, otherwise fall back to primary
  const initialTreemapPrimary = treemapPrimary ?? primary

  const { data, isLoading, error } = useQuery({
    queryKey: ['budget-explorer', 'aggregatedLineItems', filterHash],
    queryFn: () =>
      fetchAggregatedLineItems({
        filter: effectiveFilter,
        limit: 150000,
      }),
    staleTime: convertDaysToMs(3),
    gcTime: convertDaysToMs(3),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  // Drawer/side panel removed to match unified behavior

  useEffect(() => {
    const urlCurrency = filter.currency
    const urlInflationAdjusted = filter.inflation_adjusted
    const normalizationRaw = filter.normalization

    const nextFilterPatch: Partial<AnalyticsFilterType> = {}
    let shouldPatchFilter = false

    if (urlCurrency !== undefined) {
      if (urlCurrency !== userCurrency) setUserCurrency(urlCurrency)
      nextFilterPatch.currency = undefined
      shouldPatchFilter = true
    }

    if (urlInflationAdjusted !== undefined) {
      if (Boolean(urlInflationAdjusted) !== Boolean(userInflationAdjusted)) {
        setUserInflationAdjusted(Boolean(urlInflationAdjusted))
      }
      nextFilterPatch.inflation_adjusted = undefined
      shouldPatchFilter = true
    }

    if (normalizationRaw === 'total_euro' || normalizationRaw === 'per_capita_euro') {
      if (userCurrency !== 'EUR') setUserCurrency('EUR')
      nextFilterPatch.normalization = normalizationRaw === 'total_euro' ? 'total' : 'per_capita'
      shouldPatchFilter = true
    }

	    if (shouldPatchFilter) handleFilterChange({ filter: nextFilterPatch as BudgetExplorerState['filter'] })
	  }, [
    filter.currency,
    filter.inflation_adjusted,
    filter.normalization,
    userCurrency,
    userInflationAdjusted,
    setUserCurrency,
    setUserInflationAdjusted,
  ])

  // Exclude non-direct spending items for spending view (account_category='ch')
  const excludeEcCodes = filter.account_category === 'ch' ? [...DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES] : []
  // Exclude transfer codes for income view (account_category='vn')
  const excludeFnCodes = filter.account_category === 'vn' ? [...DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES] : []

  // Unified drilldown state using shared hook
  const {
    primary: treemapUiPrimary,
    setPrimary: setTreemapUiPrimary,
    activePrimary,
    breadcrumbs,
    treemapData,
    excludedItemsSummary,
    onNodeClick,
    onBreadcrumbClick,
    reset,
  } = useTreemapDrilldown({
    nodes: data?.nodes ?? [],
    initialPrimary: initialTreemapPrimary,
    rootDepth: depth === 'paragraph' ? 6 : depth === 'subchapter' ? 4 : 2,
    excludeEcCodes,
    excludeFnCodes,
    initialPath: (treemapPath ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    onPrimaryChange: (p) => handleFilterChange({ treemapPrimary: p }),
    onPathChange: (codes) => {
      const next = codes.join(',') || undefined
      navigate({
        replace: true,
        resetScroll: false,
        search: (prev) => ({
          ...(prev as unknown as BudgetExplorerState),
          treemapPath: next,
        }),
      })
    },
  })

  // Keep label helpers for other components if needed
  const nodes = data?.nodes ?? []


  const functionalChart: Chart = useMemo(() => {
    const series = functionalMainChapters.map((code, index) => {
      const seriesFilter = buildSeriesFilter(effectiveFilter, { functional_prefixes: [code] })
      const seriesId = generateHash(JSON.stringify(seriesFilter))
      return SeriesConfigurationSchema.parse({
        id: seriesId,
        type: 'line-items-aggregated-yearly',
        label: getClassificationName(code) ?? `fn:${code}`,
        filter: seriesFilter,
        config: {
          color: getSeriesColor(index),
          showDataLabels: index === 0,
        },
      })
    })

    const chartId = generateHash(JSON.stringify({ title: 'Functional Categories Comparison', filter: effectiveFilter }))
    return ChartSchema.parse({
      id: chartId,
      title: 'Functional Categories Comparison',
      config: {
        chartType: 'area',
        showLegend: !isMobile,
        showTooltip: !isMobile,
      },
      series,
    })
  }, [effectiveFilter, isMobile])

  const economicChart: Chart = useMemo(() => {
    const series = economicMainChapters.map((ecCode, index) => {
      const seriesFilter = buildSeriesFilter(effectiveFilter, { economic_prefixes: [ecCode.toString()] })
      const seriesId = generateHash(JSON.stringify(seriesFilter))
      return SeriesConfigurationSchema.parse({
        id: seriesId,
        type: 'line-items-aggregated-yearly',
        label: getEconomicChapterName(ecCode.toString()) ?? ecCode.toString(),
        filter: seriesFilter,
        config: {
          color: getSeriesColor(index),
          showDataLabels: index === 0,
        },
      })
    })

    const chartId = generateHash(JSON.stringify({ title: 'Economic Categories Comparison', filter: effectiveFilter }))
    return ChartSchema.parse({
      id: chartId,
      title: 'Economic Categories Comparison',
      config: {
        chartType: 'area',
        showLegend: !isMobile,
        showTooltip: !isMobile,
      },
      series,
    })
  }, [effectiveFilter, isMobile])

  // Revenue: Top Functional Categories comparison
  const revenueChart: Chart = useMemo(() => {
    const series = revenueTopFunctionalChapters.map((code, index) => {
      const seriesFilter = buildSeriesFilter(effectiveFilter, { functional_prefixes: [code] })
      const seriesId = generateHash(JSON.stringify(seriesFilter))
      return SeriesConfigurationSchema.parse({
        id: seriesId,
        type: 'line-items-aggregated-yearly',
        label: getClassificationName(code) ?? `fn:${code}`,
        filter: seriesFilter,
        config: {
          color: getSeriesColor(index),
          showDataLabels: index === 0,
        },
      })
    })

    const chartId = generateHash(JSON.stringify({ title: 'Top Functional Categories (Revenue)', filter: effectiveFilter }))
    return ChartSchema.parse({
      id: chartId,
      title: 'Top Functional Categories',
      config: {
        chartType: 'area',
        showLegend: !isMobile,
        showTooltip: !isMobile,
      },
      series,
    })
  }, [effectiveFilter, isMobile])

  const handleFilterChange = (partial: Partial<BudgetExplorerState>) => {
    const { filter: partialFilter, primary: partialPrimary, treemapPrimary: partialTreemapPrimary, ...restPartial } = partial
    const nextFilter = {
      ...defaultFilter,
      ...filter,
      ...(partialFilter ?? {}),
    }
    let nextPrimary: BudgetExplorerState['primary'] = partialPrimary ?? primary
    let nextTreemapPrimary: BudgetExplorerState['primary'] | undefined = partialTreemapPrimary ?? treemapPrimary
    if (nextFilter.account_category === 'vn') {
      nextPrimary = 'fn'
      nextTreemapPrimary = 'fn'
    }

    // Decide whether the treemap path should be cleared
    let shouldClearPath = false
    if (partialPrimary !== undefined && partialPrimary !== primary) shouldClearPath = true
    if (partialTreemapPrimary !== undefined && partialTreemapPrimary !== treemapPrimary) shouldClearPath = true
    if (partialFilter?.account_category !== undefined && partialFilter.account_category !== filter.account_category) shouldClearPath = true
    if (partial.depth !== undefined && partial.depth !== depth) shouldClearPath = true

    navigate({
      search: (prev) => ({
        ...(prev as unknown as BudgetExplorerState),
        ...restPartial,
        primary: nextPrimary,
        filter: nextFilter,
        treemapPrimary: nextTreemapPrimary,
        treemapPath: shouldClearPath ? undefined : (prev as unknown as BudgetExplorerState).treemapPath,
      }),
      replace: true,
      resetScroll: false,
    })
    if (shouldClearPath) reset()
  }

  const handleNodeClick = (code: string | null) => {
    onNodeClick(code)
  }


  const currentDepthNumeric = useMemo(() => (depth === 'paragraph' ? 6 : depth === 'subchapter' ? 4 : 2) as 2 | 4 | 6, [depth])
  const periodLabel = usePeriodLabel(filter.report_period)
  const isRevenueView = filter.account_category === 'vn'

  return (
    <div className="px-4 lg:px-6 py-4">
      {/* Head and JSON-LD handled by Route.head */}
      <FloatingQuickNav
        mapViewType="UAT"
        mapActive
        tableActive
        chartActive
        filterInput={effectiveFilter}
      />
      <div className="w-full max-w-[1200px] mx-auto space-y-6 lg:space-y-8">
        <BudgetExplorerHeader
          state={search}
          onChange={handleFilterChange}
        />

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
              <h3 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
                <span className="text-wrap">
                  <Trans>Budget Distribution</Trans> {periodLabel}
                </span>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={t`Open in entity analytics`}
                >
                  <Link
                    to="/entity-analytics"
                    search={{
                      view: 'line-items',
                      sortOrder: 'desc',
                      page: 1,
                      pageSize: 25,
                      filter: {
                        report_period: filter.report_period,
                        account_category: filter.account_category,
                        normalization: effectiveFilter.normalization,
                        report_type: filter.report_type,
                      },
                      treemapPrimary: activePrimary,
                      treemapDepth: depth === 'chapter' ? 'chapter' : 'subchapter',
                    }}
                    preload="intent"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </h3>
              <div className="flex flex-col gap-3 lg:flex-row items-start lg:gap-4 lg:flex-wrap">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground"><Trans>Grouping</Trans></Label>
                  <ToggleGroup
                    type="single"
                    value={treemapUiPrimary}
                    onValueChange={(v: 'fn' | 'ec') => { if (v) setTreemapUiPrimary(v) }}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-start sm:justify-end"
                  >
                    <ToggleGroupItem value="fn" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4 whitespace-nowrap">
                      <Trans>Functional</Trans>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="ec" disabled={isRevenueView} className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4 whitespace-nowrap">
                      <Trans>Economic</Trans>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground"><Trans>Detail level</Trans></Label>
                  <ToggleGroup
                    type="single"
                    value={depth}
                    onValueChange={(v: 'chapter' | 'subchapter' | 'paragraph') => { if (v) handleFilterChange({ depth: v }) }}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-start sm:justify-end"
                  >
                    <ToggleGroupItem value="chapter" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-3 whitespace-nowrap">
                      <Trans>Main chapters</Trans>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="subchapter" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-3 whitespace-nowrap">
                      <Trans>Detailed categories</Trans>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {isLoading && <Skeleton className="w-full h-[600px]" />}
            {!isLoading && error && (
              <p className="text-sm text-red-500"><Trans>Failed to load data.</Trans></p>
            )}
            {!isLoading && !error && (
              <BudgetTreemap
                data={treemapData}
                onNodeClick={handleNodeClick}
                onBreadcrumbClick={onBreadcrumbClick}
                path={breadcrumbs}
                primary={activePrimary}
                normalization={effectiveFilter.normalization}
                currency={effectiveFilter.currency}
                excludedItemsSummary={excludedItemsSummary}
              />
            )}
          </CardContent>
        </Card>

        {/* Breakdowns: show spending or revenue based on active filter */}
        {filter.account_category === 'ch' && (
          <SpendingBreakdown nodes={nodes} normalization={effectiveFilter.normalization} currency={effectiveFilter.currency} periodLabel={periodLabel} isLoading={isLoading} />
        )}
        {filter.account_category === 'vn' && (
          <RevenueBreakdown nodes={nodes} normalization={effectiveFilter.normalization} currency={effectiveFilter.currency} periodLabel={periodLabel} isLoading={isLoading} />
        )}

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold"><Trans>Top Categories</Trans></h3>
              <Button asChild variant="outline" size="sm">
                <Link to="/entity-analytics" search={{ view: 'line-items', filter: { ...filter, currency: undefined, inflation_adjusted: undefined } }}>
                  <Trans>See advanced view</Trans>
                </Link>
              </Button>
            </div>
          </CardHeader>
        <CardContent>
          <BudgetCategoryList
              aggregated={nodes}
              depth={currentDepthNumeric}
              accountCategory={filter.account_category}
              normalization={effectiveFilter.normalization}
              currency={effectiveFilter.currency}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* TODO: fix chart glitch on scroll and improve ux with useful info */}
        {filter.account_category === 'ch' && (
          <>
            <Card className="shadow-sm hidden">
              <CardHeader>
                <div className="flex items-center justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link to={'/charts/$chartId'} params={{ chartId: functionalChart.id }} search={{ chart: functionalChart, view: 'overview' }}>
                      <BarChart2 className="w-4 h-4 mr-2" />
                      <Trans>Open in Chart Builder</Trans>
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ChartPreview chart={functionalChart} height={400} margins={{ left: 50 }} />
              </CardContent>
            </Card>

            <Card className="shadow-sm hidden">
              <CardHeader>
                <div className="flex items-center justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link to={'/charts/$chartId'} params={{ chartId: economicChart.id }} search={{ chart: economicChart, view: 'overview' }}>
                      <BarChart2 className="w-4 h-4 mr-2" />
                      <Trans>Open in Chart Builder</Trans>
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ChartPreview chart={economicChart} height={400} margins={{ left: 50 }} />
              </CardContent>
            </Card>
          </>
        )}

        {filter.account_category === 'vn' && (
          <Card className="shadow-sm hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold"><Trans>Top Functional Categories</Trans></h3>
                <Button asChild variant="outline" size="sm">
                  <Link to={'/charts/$chartId'} params={{ chartId: revenueChart.id }} search={{ chart: revenueChart, view: 'overview' }}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    <Trans>Open in Chart Builder</Trans>
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartPreview chart={revenueChart} height={400} margins={{ left: 50 }} />
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <BudgetLineItemsPreview
              data={data}
              groupBy={activePrimary}
              isLoading={isLoading}
              filter={effectiveFilter}
            />
          </CardContent>
        </Card>
      </div>

      {/* Side panel removed for unified behavior */}
    </div>
  )
}
