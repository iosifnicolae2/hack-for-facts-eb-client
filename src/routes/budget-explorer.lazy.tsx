import { createLazyFileRoute, useNavigate, useSearch, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Trans } from '@lingui/react/macro'
import { useMemo, useState, useEffect } from 'react'

import { AnalyticsFilterSchema, AnalyticsFilterType } from '@/schemas/charts'
import { convertDaysToMs, generateHash } from '@/lib/utils'
import { fetchAggregatedLineItems } from '@/lib/api/entity-analytics'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { BudgetExplorerHeader } from '@/components/budget-explorer/BudgetExplorerHeader'
import { BudgetTreemap } from '@/components/budget-explorer/BudgetTreemap'
import { BudgetCategoryList } from '@/components/budget-explorer/BudgetCategoryList'
import { BudgetDetailsDrawer } from '@/components/budget-explorer/BudgetDetailsDrawer'
import { BudgetLineItemsPreview } from '@/components/budget-explorer/BudgetLineItemsPreview'
import { buildTreemapDataV2, calculateExcludedItems } from '@/components/budget-explorer/budget-transform'
import { SpendingBreakdown } from '@/components/budget-explorer/SpendingBreakdown'
import { RevenueBreakdown } from '@/components/budget-explorer/RevenueBreakdown'
import { ChartPreview } from '@/components/charts/components/chart-preview/ChartPreview'
import { Chart, ChartSchema, SeriesConfigurationSchema } from '@/schemas/charts'
import { BarChart2 } from 'lucide-react'
import { getSeriesColor } from '@/components/charts/components/chart-renderer/utils';
import { getClassificationName } from '@/lib/classifications'
import { getEconomicChapterName, getEconomicClassificationName, getEconomicSubchapterName } from '@/lib/economic-classifications'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePeriodLabel } from '@/hooks/use-period-label'
import { useUserCurrency } from '@/lib/hooks/useUserCurrency'

export const Route = createLazyFileRoute('/budget-explorer')({
  component: BudgetExplorerPage,
})

const PrimaryLevelEnum = z.enum(['fn', 'ec'])
const DepthEnum = z.enum(['main', 'detail'])
const ViewEnum = z.enum(['overview', 'treemap', 'sankey', 'list'])

const defaultFilter: AnalyticsFilterType = {
  report_period: {
    type: 'YEAR',
    selection: { dates: [String(new Date().getFullYear())] },
  },
  account_category: 'ch',
  report_type: 'Executie bugetara agregata la nivel de ordonator principal',
}

const SearchSchema = z.object({
  view: ViewEnum.default('overview'),
  primary: PrimaryLevelEnum.default('fn'),
  depth: DepthEnum.default('main'),
  search: z.string().optional(),
  filter: AnalyticsFilterSchema.default(defaultFilter),
  treemapPrimary: PrimaryLevelEnum.optional(),
})

export type BudgetExplorerState = z.infer<typeof SearchSchema>

const ministries = [
  { name: 'MINISTERUL MUNCII SI SOLIDARITATII SOCIALE', cui: '4266669' },
  { name: 'MINISTERUL EDUCATIEI', cui: '13729380' },
  { name: 'MINISTERUL FINANTELOR - ACTIUNI GENERALE', cui: '8609468' },
  { name: 'MINISTERUL AGRICULTURII SI DEZVOLTARII RURALE', cui: '4221187' },
  { name: 'MINISTERUL APARARII NATIONALE', cui: '11424532' },
  { name: 'MINISTERUL TRANSPORTURILOR SI INFRASTRUCTURII', cui: '13633330' },
  { name: 'MINISTERUL SANATATII', cui: '4266456' },
  { name: 'MINISTERUL AFACERILOR INTERNE', cui: '4267095' },
  { name: 'MINISTERUL DEZVOLTARII LUCRARILOR PUBLICE SI ADMINISTRATIEI', cui: '26369185' },
  { name: 'MINISTERUL INVESTITIILOR SI PROIECTELOR EUROPENE', cui: '38918422' },
  { name: 'MINISTERUL MEDIULUI APELOR SI PADURILOR', cui: '16335444' },
  { name: 'MINISTERUL FINANTELOR', cui: '4221306' },
  { name: 'MINISTERUL JUSTITIEI', cui: '4265841' },
  { name: 'MINISTERUL ENERGIEI', cui: '43507695' },
  { name: 'MINISTERUL CERCETARII INOVARII SI DIGITALIZARII', cui: '43516588' },
  { name: 'MINISTERUL CULTURII', cui: '4192812' },
  { name: 'MINISTERUL AFACERILOR EXTERNE', cui: '4266863' },
  { name: 'MINISTERUL ECONOMIEI ANTREPRENORIATULUI SI TURISMULUI', cui: '24931499' },
  { name: 'MINISTERUL FAMILIEI TINERETULUI SI EGALITATII DE SANSE', cui: '45340622' },
]

const functionalMainChapters = ['68', '66', '65', '84', '51', '61', '70', '83', '60', '74', '55', '67'] as const
const economicMainChapters = [57, 10, 20, 51, 30, 55, 56, 61] as const
// Revenue-focused top functional categories (codes provided by product spec)
const revenueTopFunctionalChapters = ['21', '10', '42', '03', '14', '01', '33'] as const

const normalizeCode = (code?: string | null) => code?.replace(/[^0-9.]/g, '') ?? ''

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

function buildPathLabel(primary: 'fn' | 'ec', code: string) {
  const normalized = normalizeCode(code)
  if (primary === 'fn') {
    const fnName = getClassificationName(normalized)
    if (fnName) return fnName
    return `FN ${normalized}`
  }
  // economic label resolution by depth
  const parts = normalized.split('.')
  if (parts.length === 1) {
    const ecName = getEconomicChapterName(normalized)
    if (ecName) return ecName
  } else if (parts.length === 2) {
    const ecName = getEconomicSubchapterName(normalized)
    if (ecName) return ecName
  } else {
    const ecName = getEconomicClassificationName(normalized)
    if (ecName) return ecName
  }
  return `EC ${normalized}`
}

function BudgetExplorerPage() {
  const raw = useSearch({ from: '/budget-explorer' })
  const navigate = useNavigate({ from: '/budget-explorer' })
  const search = SearchSchema.parse(raw)
  const isMobile = useIsMobile()
  const [currency] = useUserCurrency()

  const { filter, primary, depth, treemapPrimary } = search
  const filterHash = generateHash(JSON.stringify(filter))

  // Use treemapPrimary from URL if available, otherwise fall back to primary
  const initialTreemapPrimary = treemapPrimary ?? primary

  const { data, isLoading, error } = useQuery({
    queryKey: ['budget-explorer', 'aggregatedLineItems', filterHash],
    queryFn: () =>
      fetchAggregatedLineItems({
        filter,
        limit: 20000,
      }),
    staleTime: convertDaysToMs(3),
    gcTime: convertDaysToMs(3),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  const [path, setPath] = useState<string[]>([])
  const [drawerCode, setDrawerCode] = useState<string | null>(null)
  const [drillPrimary, setDrillPrimary] = useState<'fn' | 'ec'>(initialTreemapPrimary)
  const [crossConstraint, setCrossConstraint] = useState<{ type: 'fn' | 'ec'; code: string } | null>(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState<{ code: string; label: string }[]>([])

  useEffect(() => {
    if (currency === 'EUR' && filter.normalization !== 'total_euro' && filter.normalization !== 'per_capita_euro') {
      handleFilterChange({ filter: { ...filter, normalization: 'total_euro' } })
    } else if (currency === 'RON' && filter.normalization !== 'total' && filter.normalization !== 'per_capita') {
      handleFilterChange({ filter: { ...filter, normalization: 'total' } })
    }
  }, [currency, filter.normalization])

  useEffect(() => {
    const effectivePrimary = treemapPrimary ?? primary
    setDrillPrimary(effectivePrimary)
    setPath([])
    setCrossConstraint(null)
    setBreadcrumbPath([])
  }, [primary, treemapPrimary])

  const appendBreadcrumb = (type: 'fn' | 'ec', code: string) => {
    const normalized = normalizeCode(code)
    const depth = normalized.split('.').length
    // Prefer API-provided names for 6-digit (depth=3) codes
    let label: string | undefined
    if (depth >= 3) {
      const match = nodes.find((n) => normalizeCode(type === 'fn' ? n.fn_c : n.ec_c) === normalized)
      const apiName = type === 'fn' ? match?.fn_n : match?.ec_n
      if (apiName && apiName.trim()) {
        label = apiName
      }
    }
    if (!label) {
      label = buildPathLabel(type, code)
    }
    const last = breadcrumbPath[breadcrumbPath.length - 1]
    if (last && last.code === code && last.label === label) return
    setBreadcrumbPath((prev) => [...prev, { code, label }])
  }

  const nodes = data?.nodes ?? []

  // Exclude non-direct spending items for spending view (account_category='ch')
  const excludeEcCodes = filter.account_category === 'ch' ? ['51', '80', '81'] : []

  const treemap = useMemo(() => {
    const rootDepth: 2 | 4 | 6 = depth === 'detail' ? 4 : 2
    return buildTreemapDataV2({
      data: nodes,
      primary: drillPrimary,
      path,
      constraint: crossConstraint ?? undefined,
      rootDepth,
      excludeEcCodes,
    })
  }, [nodes, drillPrimary, path, crossConstraint, depth, excludeEcCodes])

  // Calculate excluded items for the current layer dynamically
  const excludedItemsSummary = useMemo(() => {
    if (excludeEcCodes.length === 0) return undefined
    return calculateExcludedItems(nodes, excludeEcCodes, {
      path,
      constraint: crossConstraint ?? undefined,
      primary: drillPrimary,
    })
  }, [nodes, excludeEcCodes, path, crossConstraint, drillPrimary])

  const ministryChart: Chart = useMemo(() => {
    const series = ministries.map((ministry, index) => {
      const seriesFilter = {
        ...filter,
        entity_cuis: [ministry.cui],
        report_type: 'Executie bugetara agregata la nivel de ordonator principal',
      }
      const seriesId = generateHash(JSON.stringify(seriesFilter))

      return SeriesConfigurationSchema.parse({
        id: seriesId,
        type: 'line-items-aggregated-yearly',
        label: ministry.name,
        filter: seriesFilter,
        config: {
          color: getSeriesColor(index),
        },
      })
    })

    const chartId = generateHash(JSON.stringify({ title: 'Ministry Spending Comparison', filter }))
    return ChartSchema.parse({
      id: chartId,
      title: 'Ministry Spending Comparison',
      config: {
        chartType: 'treemap-aggr',
        showTooltip: !isMobile,
      },
      series,
    })
  }, [filter, isMobile])

  const functionalChart: Chart = useMemo(() => {
    const series = functionalMainChapters.map((code, index) => {
      const seriesFilter = buildSeriesFilter(filter, { functional_prefixes: [code] })
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

    const chartId = generateHash(JSON.stringify({ title: 'Functional Categories Comparison', filter }))
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
  }, [filter, isMobile])

  const economicChart: Chart = useMemo(() => {
    const series = economicMainChapters.map((ecCode, index) => {
      const seriesFilter = buildSeriesFilter(filter, { economic_prefixes: [ecCode.toString()] })
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

    const chartId = generateHash(JSON.stringify({ title: 'Economic Categories Comparison', filter }))
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
  }, [filter, isMobile])

  // Revenue: Top Functional Categories comparison
  const revenueChart: Chart = useMemo(() => {
    const series = revenueTopFunctionalChapters.map((code, index) => {
      const seriesFilter = buildSeriesFilter(filter, { functional_prefixes: [code] })
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

    const chartId = generateHash(JSON.stringify({ title: 'Top Functional Categories (Revenue)', filter }))
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
  }, [filter, isMobile])

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

    navigate({
      search: (prev) => ({
        ...(prev as BudgetExplorerState),
        ...restPartial,
        primary: nextPrimary,
        filter: nextFilter,
        treemapPrimary: nextTreemapPrimary,
      }),
      replace: true,
      resetScroll: false,
    })
    setPath([])
    setDrawerCode(null)
    setDrillPrimary(nextTreemapPrimary ?? nextPrimary)
    setCrossConstraint(null)
    setBreadcrumbPath([])
  }

  const handleNodeClick = (code: string | null) => {
    // If we've already completed both primary flows up to 6-digit, ignore further clicks
    const totalSixDigitSteps = breadcrumbPath.reduce((acc, item) => acc + (item.code && item.code.split('.').length === 3 ? 1 : 0), 0)
    if (totalSixDigitSteps >= 2) {
      return
    }

    // Reset to root
    if (!code) {
      setPath([])
      setCrossConstraint(null)
      setDrillPrimary(primary)
      setBreadcrumbPath([])
      return
    }

    const normalizedCode = normalizeCode(code)

    // Ignore clicks that would not advance (duplicate of last step)
    const lastPathCode = path[path.length - 1]
    if (lastPathCode && lastPathCode === normalizedCode) return
    if (normalizedCode.startsWith('00')) return

    const selectedDepth = normalizedCode ? normalizedCode.split('.').length : 0 // 1->2d, 2->4d, 3->6d

    const hasNextInCurrent = (nextPath: string[]) => {
      const next = buildTreemapDataV2({
        data: nodes,
        primary: drillPrimary,
        path: nextPath,
        constraint: crossConstraint ?? undefined,
      })
      return next.length > 0
    }

    // If we are already pivoting, keep drilling within current primary
    if (crossConstraint) {
      // In pivot stage: allow drill down within current primary up to 6-digits
      if (selectedDepth < 3) {
        const nextPath = [...path, normalizedCode]
        if (!hasNextInCurrent(nextPath)) return
        appendBreadcrumb(drillPrimary, normalizedCode)
        setPath(nextPath)
        return
      }
      // End of path
      return
    }

    // Not in pivot stage yet: drill 2->4->6 within the same primary; pivot only at 6
    if (selectedDepth < 3) {
      setDrawerCode(null)
      const nextPath = [...path, normalizedCode]
      if (!hasNextInCurrent(nextPath)) return
      appendBreadcrumb(drillPrimary, normalizedCode)
      setPath(nextPath)
      return
    }

    // Pivot at 6-digit to the opposite primary constrained by this code
    // First, record the final step in the first primary
    appendBreadcrumb(drillPrimary, normalizedCode)
    const opposite = drillPrimary === 'fn' ? 'ec' : 'fn'
    const oppositeRoot = buildTreemapDataV2({
      data: nodes,
      primary: opposite,
      path: [],
      constraint: { type: drillPrimary, code: normalizedCode },
      rootDepth: 2,
    })
    if (oppositeRoot.length > 0) {
      setCrossConstraint({ type: drillPrimary, code: normalizedCode })
      setDrillPrimary(opposite)
      setPath([]) // start fresh for the opposite primary levels (2 -> 4 -> 6)
      setDrawerCode(null)
    }
  }

  const clearDrill = () => {
    setPath([])
    setDrawerCode(null)
    setDrillPrimary(primary)
    setCrossConstraint(null)
    setBreadcrumbPath([])
  }

  const currentDrillCode = path.length > 0 ? path[path.length - 1] : null

  const currentDepthNumeric = useMemo(() => (depth === 'detail' ? 4 : 2) as 2 | 4 | 6, [depth])
  const periodLabel = usePeriodLabel(filter.report_period)

  return (
    <div className="px-4 lg:px-6 py-4">
      <div className="w-full max-w-[1200px] mx-auto space-y-6 lg:space-y-8">
        <BudgetExplorerHeader
          state={search}
          onChange={handleFilterChange}
        />

        <Card className="shadow-sm">
          <CardHeader>
            <h3 className="text-base sm:text-lg font-semibold"><Trans>Budget Distribution</Trans> - {periodLabel}</h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[600px]" />
            ) : error ? (
              <p className="text-sm text-red-500"><Trans>Failed to load data.</Trans></p>
            ) : (
              <BudgetTreemap
                data={treemap}
                onNodeClick={handleNodeClick}
                onBreadcrumbClick={(code, index) => {
                  // Back to root when clicking main
                  if (!code) {
                    clearDrill()
                    return
                  }

                  const normalized = normalizeCode(code)
                  const clickedIndex = typeof index === 'number' ? index : breadcrumbPath.findIndex((c) => c.code === normalized)
                  const clickedDepth = normalized.split('.').length

                  if (!crossConstraint) {
                    // Pre-pivot: trim current path and breadcrumbs
                    const idxInPath = path.indexOf(normalized)
                    let newPath = idxInPath !== -1 ? path.slice(0, idxInPath + 1) : [normalized]
                    // Avoid ending at 6-digit (would show no data); go to parent
                    if (clickedDepth >= 3) {
                      newPath = idxInPath > 0 ? path.slice(0, idxInPath) : [normalized.split('.').slice(0, 2).join('.')]
                    }
                    setPath(newPath)
                    if (clickedIndex !== -1) setBreadcrumbPath(breadcrumbPath.slice(0, clickedDepth >= 3 ? clickedIndex : clickedIndex + 1))
                    setDrillPrimary(primary)
                    return
                  }

                  // With pivot: split by the 6-digit code used for pivot
                  const pivotCode = normalizeCode(crossConstraint.code)
                  const pivotIndex = breadcrumbPath.findIndex((c) => c.code === pivotCode)

                  if (pivotIndex === -1 || clickedIndex <= pivotIndex) {
                    // Move back into first primary (pre-pivot)
                    let newPathCodes = breadcrumbPath.slice(0, clickedIndex + 1).map((c) => normalizeCode(c.code))
                    // If clicked the 6-digit pivot itself, step to its parent instead
                    if (clickedIndex === pivotIndex || clickedDepth >= 3) {
                      newPathCodes = breadcrumbPath.slice(0, Math.max(pivotIndex, clickedIndex)).map((c) => normalizeCode(c.code))
                    }
                    setPath(newPathCodes)
                    setDrillPrimary(crossConstraint.type)
                    setCrossConstraint(null)
                    setBreadcrumbPath(breadcrumbPath.slice(0, clickedIndex === pivotIndex || clickedDepth >= 3 ? Math.max(pivotIndex, clickedIndex) : clickedIndex + 1))
                    return
                  }

                  // Move within second primary (post-pivot)
                  let secondPath = breadcrumbPath.slice(pivotIndex + 1, clickedIndex + 1).map((c) => normalizeCode(c.code))
                  // Avoid ending at 6-digit; go one level up within second primary
                  if (clickedDepth >= 3) {
                    secondPath = breadcrumbPath.slice(pivotIndex + 1, clickedIndex).map((c) => normalizeCode(c.code))
                  }
                  setPath(secondPath)
                  setBreadcrumbPath(breadcrumbPath.slice(0, clickedDepth >= 3 ? clickedIndex : clickedIndex + 1))
                }}
                path={breadcrumbPath}
                primary={drillPrimary}
                onViewDetails={() => setDrawerCode(currentDrillCode)}
                showViewDetails={!!currentDrillCode && !crossConstraint}
                normalization={filter.normalization}
                excludedItemsSummary={excludedItemsSummary}
              />
            )}
          </CardContent>
        </Card>

        {/* Breakdowns: show spending or revenue based on active filter */}
        {filter.account_category === 'ch' && (
          <SpendingBreakdown nodes={nodes as any} normalization={filter.normalization} periodLabel={periodLabel} isLoading={isLoading} />
        )}
        {filter.account_category === 'vn' && (
          <RevenueBreakdown nodes={nodes as any} normalization={filter.normalization} periodLabel={periodLabel} isLoading={isLoading} />
        )}

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold"><Trans>Top Categories</Trans></h3>
              <Button asChild variant="outline" size="sm">
                <Link to="/entity-analytics" search={{ view: 'line-items', filter }}>
                  <Trans>See advanced view</Trans>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BudgetCategoryList
              aggregated={nodes as any}
              depth={currentDepthNumeric}
              normalization={filter.normalization}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {filter.account_category === 'ch' && (
          <>
            <Card className="shadow-sm">
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

            <Card className="shadow-sm">
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
          <Card className="shadow-sm">
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
          <CardHeader>
            <div className="flex items-center justify-end">
              <Button asChild variant="outline" size="sm">
                <Link to={'/charts/$chartId'} params={{ chartId: ministryChart.id }} search={{ chart: ministryChart, view: 'overview' }}>
                  <BarChart2 className="w-4 h-4 mr-2" />
                  <Trans>Open in Chart Builder</Trans>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ChartPreview chart={ministryChart} height={600} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <BudgetLineItemsPreview
              data={data}
              groupBy={drillPrimary}
              isLoading={isLoading}
              filter={filter}
            />
          </CardContent>
        </Card>
      </div>

      <BudgetDetailsDrawer
        open={!!drawerCode}
        onOpenChange={(open) => { if (!open) setDrawerCode(null) }}
        code={drawerCode}
        primary={drillPrimary}
        nodes={nodes}
        filter={filter}
      />
    </div>
  )
}
