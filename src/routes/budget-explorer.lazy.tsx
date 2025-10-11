import { createLazyFileRoute, useNavigate, useSearch, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Trans } from '@lingui/react/macro'
import { useMemo, useState, useCallback, useEffect } from 'react'

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
import { buildTreemapData, AggregatedNode } from '@/components/budget-explorer/budget-transform'
import { ChartPreview } from '@/components/charts/components/chart-preview/ChartPreview'
import { Chart, ChartSchema, SeriesConfigurationSchema } from '@/schemas/charts'
import { BarChart2 } from 'lucide-react'
import { getSeriesColor } from '@/components/charts/components/chart-renderer/utils';
import { getClassificationName } from '@/lib/classifications'

const CategoryListSkeleton = () => (
  <div className="space-y-5">
    {[...Array(5)].map((_, i) => (
      <div key={i}>
        <div className="flex justify-between items-center mb-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    ))}
  </div>
);

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
  report_type: 'Executie bugetara agregata la nivel de ordonator principal'
}

const SearchSchema = z.object({
  view: ViewEnum.default('overview'),
  primary: PrimaryLevelEnum.default('fn'),
  depth: DepthEnum.default('main'),
  search: z.string().optional(),
  filter: AnalyticsFilterSchema.default(defaultFilter),
})

export type BudgetExplorerState = z.infer<typeof SearchSchema>

type DepthKey = BudgetExplorerState['depth']

type DrillPath = { code: string; label: string }[]

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
const economicMainChapters = [
  { code: '10', name: 'Taxa pe valoarea adaugata' },
  { code: '20', name: 'Contributii de asigurari' },
  { code: '30', name: 'Venituri din proprietate' },
  { code: '55', name: 'Tranzactii privind datoria publica si imprumuturi' },
  { code: '56', name: 'Transferuri cu caracter general intre diferite nivele ale administratiei' },
  { code: '57', name: 'Cheltuieli de personal' },
  { code: '61', name: 'Ordine publica si siguranta nationala' },
] as const

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
  const name = getClassificationName(normalized)
  if (name) return name
  return `${primary === 'fn' ? 'FN' : 'EC'} ${normalized}`
}

function BudgetExplorerPage() {
  const raw = useSearch({ from: '/budget-explorer' })
  const navigate = useNavigate({ from: '/budget-explorer' })
  const search = SearchSchema.parse(raw)

  const { filter, primary, depth } = search
  const filterHash = generateHash(JSON.stringify(filter))

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

  const [path, setPath] = useState<DrillPath>([])
  const [drawerCode, setDrawerCode] = useState<string | null>(null)
  const [drillPrimary, setDrillPrimary] = useState<'fn' | 'ec'>(primary)
  const [functionalFilterCode, setFunctionalFilterCode] = useState<string | null>(null)

  // Reset drill state when primary changes from URL
  useEffect(() => {
    setDrillPrimary(primary)
    setPath([])
    setFunctionalFilterCode(null)
  }, [primary])

  const nodes = (data?.nodes ?? []) as AggregatedNode[]

  const depthMap: Record<DepthKey, 2 | 4 | 6> = { main: 2, detail: 4 }

  const baseDepth = depthMap[depth]
  const currentDrillCode = path.length > 0 ? path[path.length - 1].code : null
  const drillDepth = (currentDrillCode ? Math.min(baseDepth + 2, 6) : baseDepth) as 2 | 4 | 6

  // When showing economic breakdown of a functional category, filter nodes
  const displayNodes = useMemo(() => {
    const isEconomicBreakdown = drillPrimary === 'ec' && functionalFilterCode
    if (!isEconomicBreakdown) return nodes

    const normalizedFnFilter = normalizeCode(functionalFilterCode)
    return nodes.filter(node =>
      normalizeCode(node.fn_c).startsWith(normalizedFnFilter)
    )
  }, [nodes, drillPrimary, functionalFilterCode])

  const treemap = useMemo(() => {
    const isEconomicBreakdown = drillPrimary === 'ec' && functionalFilterCode
    return buildTreemapData(displayNodes, {
      primary: drillPrimary,
      depth: drillDepth,
      // Don't apply drill prefix in economic breakdown mode
      drillPrefix: isEconomicBreakdown ? undefined : currentDrillCode ?? undefined,
    })
  }, [displayNodes, drillPrimary, drillDepth, currentDrillCode, functionalFilterCode])

  const ministryChart: Chart = useMemo(() => {
    const series = ministries.map((ministry, index) => SeriesConfigurationSchema.parse({
      type: 'line-items-aggregated-yearly',
      label: ministry.name,
      filter: {
        ...filter,
        entity_cuis: [ministry.cui],
        report_type: 'Executie bugetara agregata la nivel de ordonator principal',
      },
      config: {
        color: getSeriesColor(index),
      }
    }));

    return ChartSchema.parse({
      title: 'Ministry Spending Comparison',
      config: {
        chartType: 'treemap-aggr',
        showTooltip: true,
      },
      series,
    });
  }, [filter]);

  const functionalChart: Chart = useMemo(() => {
    const series = functionalMainChapters.map((code, index) => SeriesConfigurationSchema.parse({
      type: 'line-items-aggregated-yearly',
      label: getClassificationName(code) ?? `FN ${code}`,
      filter: buildSeriesFilter(filter, { functional_prefixes: [code] }),
      config: { color: getSeriesColor(index) },
    }))

    return ChartSchema.parse({
      title: 'Functional Categories Comparison',
      config: {
        chartType: 'area',
        showLegend: true,
        showTooltip: true,
      },
      series,
    })
  }, [filter])

  const economicChart: Chart = useMemo(() => {
    const series = economicMainChapters.map((item, index) => SeriesConfigurationSchema.parse({
      type: 'line-items-aggregated-yearly',
      label: item.name,
      filter: buildSeriesFilter(filter, { economic_prefixes: [item.code] }),
      config: { color: getSeriesColor(index) },
    }))

    return ChartSchema.parse({
      title: 'Economic Categories Comparison',
      config: {
        chartType: 'area',
        showLegend: true,
        showTooltip: true,
      },
      series,
    })
  }, [filter])

  const handleFilterChange = (partial: Partial<BudgetExplorerState>) => {
    navigate({
      search: (prev) => ({
        ...(prev as BudgetExplorerState),
        ...partial,
        filter: { ...defaultFilter, ...(prev as BudgetExplorerState).filter, ...(partial as BudgetExplorerState).filter },
      }),
      replace: true,
    })
    setPath([])
    setDrawerCode(null)
    setDrillPrimary(partial.primary ?? primary)
    setFunctionalFilterCode(null)
  }

  const hasChildren = useCallback((code: string, checkPrimary: 'fn' | 'ec') => {
    const normalizedSelected = normalizeCode(code)
    if (!normalizedSelected) return false
    return nodes.some((node) => {
      const candidate = normalizeCode(checkPrimary === 'fn' ? node.fn_c : node.ec_c)
      if (!candidate || !candidate.startsWith(normalizedSelected)) return false
      return candidate.length > normalizedSelected.length
    })
  }, [nodes])

  const handleNodeClick = (code: string | null) => {
    // Reset to root
    if (!code) {
      clearDrill()
      return
    }

    const canDrillDown = hasChildren(code, drillPrimary)
    const isInFunctionalView = drillPrimary === 'fn' && primary === 'fn'
    const notYetInEconomicBreakdown = !functionalFilterCode

    if (canDrillDown) {
      // Drill down into children
      setDrawerCode(null)
      setPath((prev) => {
        const normalized = normalizeCode(code)
        const existingIndex = prev.findIndex((item) => normalizeCode(item.code) === normalized)
        // If clicking an item in path, go back to that level
        if (existingIndex >= 0) {
          return prev.slice(0, existingIndex + 1)
        }
        // Otherwise add to path
        return [...prev, { code, label: buildPathLabel(drillPrimary, code) }]
      })
    } else if (isInFunctionalView && notYetInEconomicBreakdown) {
      // Switch to economic breakdown for this functional category
      setFunctionalFilterCode(code)
      setDrillPrimary('ec')
      setPath((prev) => [...prev, { code: 'economic', label: 'Economic breakdown' }])
    } else {
      // Leaf node - open details drawer
      setDrawerCode(code)
    }
  }

  const clearDrill = () => {
    setPath([])
    setDrawerCode(null)
    setDrillPrimary(primary)
    setFunctionalFilterCode(null)
  }

  const currentDepthNumeric = depthMap[depth]

  return (
    <div className="flex flex-col gap-4 p-4">
      <BudgetExplorerHeader
        state={search}
        onChange={handleFilterChange}
        onClearDrill={clearDrill}
        hasDrill={path.length > 0}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-12 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold"><Trans>How is the money distributed?</Trans></h3>
            <div className="flex gap-2">
              {currentDrillCode && !functionalFilterCode && (
                <Button variant="outline" size="sm" onClick={() => setDrawerCode(currentDrillCode)}>
                  <Trans>View Details</Trans>
                </Button>
              )}
              {path.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearDrill}>
                  <Trans>Back to main view</Trans>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[420px]" />
            ) : error ? (
              <p className="text-sm text-red-500"><Trans>Failed to load data.</Trans></p>
            ) : (
              <BudgetTreemap data={treemap} onNodeClick={handleNodeClick} path={path} />
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-12 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold"><Trans>Top categories</Trans></h3>
              <Button asChild variant="outline" size="sm">
                <Link to="/entity-analytics" search={{ view: 'line-items', filter }}>
                  <Trans>See advanced view</Trans>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <CategoryListSkeleton />
                <CategoryListSkeleton />
              </div>
            ) : <BudgetCategoryList aggregated={nodes} depth={currentDepthNumeric} />}
          </CardContent>
        </Card>

        <Card className="xl:col-span-12 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold"><Trans>Functional categories comparison</Trans></h3>
              <Button asChild variant="outline" size="sm">
                <Link to={'/charts/$chartId'} params={{ chartId: functionalChart.id }} search={{ chart: functionalChart, view: 'overview' }}>
                  <BarChart2 className="w-4 h-4 mr-2" />
                  <Trans>Open in Chart Builder</Trans>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ChartPreview chart={functionalChart} height={400} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-12 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold"><Trans>Economic categories comparison</Trans></h3>
              <Button asChild variant="outline" size="sm">
                <Link to={'/charts/$chartId'} params={{ chartId: economicChart.id }} search={{ chart: economicChart, view: 'overview' }}>
                  <BarChart2 className="w-4 h-4 mr-2" />
                  <Trans>Open in Chart Builder</Trans>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ChartPreview chart={economicChart} height={400} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-12 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold"><Trans>Ministries Comparison</Trans></h3>
              <Button asChild variant="outline" size="sm">
                <Link to={'/charts/$chartId'} params={{ chartId: ministryChart.id }} search={{ chart: ministryChart, view: 'overview' }}>
                  <BarChart2 className="w-4 h-4 mr-2" />
                  <Trans>Open in Chart Builder</Trans>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ChartPreview chart={ministryChart} height={400} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-12 shadow-sm">
          <CardContent className="pt-6">
            <BudgetLineItemsPreview
              data={data}
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
        primary={primary}
        nodes={nodes}
      />
    </div>
  )
}


