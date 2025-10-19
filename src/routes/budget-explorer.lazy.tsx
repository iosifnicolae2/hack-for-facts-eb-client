import { createLazyFileRoute, useNavigate, useSearch, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Trans } from '@lingui/react/macro'
import { useMemo, useEffect } from 'react'

import { AnalyticsFilterSchema, AnalyticsFilterType } from '@/schemas/charts'
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
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { t } from '@lingui/core/macro'

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

// Removed ministries list (unused after simplifying charts)

const functionalMainChapters = ['68', '66', '65', '84', '51', '61', '70', '83', '60', '74', '55', '67'] as const
const economicMainChapters = [57, 10, 20, 51, 30, 55, 56, 61] as const
// Revenue-focused top functional categories (codes provided by product spec)
const revenueTopFunctionalChapters = ['21', '10', '42', '03', '14', '01', '33'] as const


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

  // Drawer/side panel removed to match unified behavior

  useEffect(() => {
    if (currency === 'EUR' && filter.normalization !== 'total_euro' && filter.normalization !== 'per_capita_euro') {
      handleFilterChange({ filter: { ...filter, normalization: 'total_euro' } })
    } else if (currency === 'RON' && filter.normalization !== 'total' && filter.normalization !== 'per_capita') {
      handleFilterChange({ filter: { ...filter, normalization: 'total' } })
    }
  }, [currency, filter.normalization])

  // Exclude non-direct spending items for spending view (account_category='ch')
  const excludeEcCodes = filter.account_category === 'ch' ? ['51', '80', '81'] : []

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
    rootDepth: depth === 'detail' ? 4 : 2,
    excludeEcCodes,
    onPrimaryChange: (p) => handleFilterChange({ treemapPrimary: p }),
  })

  // Keep label helpers for other components if needed
  const nodes = data?.nodes ?? []


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
    reset()
  }

  const handleNodeClick = (code: string | null) => {
    onNodeClick(code)
  }


  const currentDepthNumeric = useMemo(() => (depth === 'detail' ? 4 : 2) as 2 | 4 | 6, [depth])
  const periodLabel = usePeriodLabel(filter.report_period)
  const isRevenueView = filter.account_category === 'vn'

  return (
    <div className="px-4 lg:px-6 py-4">
      <FloatingQuickNav
        mapViewType="UAT"
        mapActive
        tableActive
        chartActive
        filterInput={filter}
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
                <Trans>Budget Distribution</Trans> - {periodLabel}
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
                        normalization: filter.normalization,
                        report_type: filter.report_type,
                      },
                      treemapPrimary: activePrimary,
                      treemapDepth: depth === 'detail' ? 'detail' : 'main',
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
                    onValueChange={(v: 'main' | 'detail') => { if (v) handleFilterChange({ depth: v }) }}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto justify-start sm:justify-end"
                  >
                    <ToggleGroupItem value="main" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-3 whitespace-nowrap">
                      <Trans>Main chapters</Trans>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="detail" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-3 whitespace-nowrap">
                      <Trans>Detailed categories</Trans>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {isLoading ? (
              <Skeleton className="w-full h-[600px]" />
            ) : error ? (
              <p className="text-sm text-red-500"><Trans>Failed to load data.</Trans></p>
            ) : (
              <BudgetTreemap
                data={treemapData}
                onNodeClick={handleNodeClick}
                onBreadcrumbClick={onBreadcrumbClick}
                path={breadcrumbs}
                primary={activePrimary}
                onViewDetails={undefined}
                showViewDetails={false}
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
              filter={filter}
            />
          </CardContent>
        </Card>
      </div>

      {/* Side panel removed for unified behavior */}
    </div>
  )
}
