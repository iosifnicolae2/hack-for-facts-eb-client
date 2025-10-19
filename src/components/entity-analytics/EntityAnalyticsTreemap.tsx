import { useMemo, useState, useEffect } from 'react'
import { Trans } from '@lingui/react/macro'
import { usePeriodLabel } from '@/hooks/use-period-label'
import type { AnalyticsFilterType } from '@/schemas/charts'
import { useTreemapDrilldown } from '@/components/budget-explorer/useTreemapDrilldown'
import type { AggregatedNode } from '@/components/budget-explorer/budget-transform'
import { BudgetTreemap } from '@/components/budget-explorer/BudgetTreemap'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import type { AggregatedLineItemConnection } from '@/schemas/entity-analytics'

interface EntityAnalyticsTreemapProps {
  filter: AnalyticsFilterType
  data?: AggregatedLineItemConnection
  isLoading?: boolean
  initialPrimary?: 'fn' | 'ec'
  initialDepth?: 'main' | 'detail'
  onPrimaryChange?: (primary: 'fn' | 'ec') => void
  onDepthChange?: (depth: 'main' | 'detail') => void
}

export function EntityAnalyticsTreemap({
  filter,
  data,
  isLoading,
  initialPrimary = 'fn',
  initialDepth = 'main',
  onPrimaryChange,
  onDepthChange,
}: EntityAnalyticsTreemapProps) {
  const [depth, setDepth] = useState<'main' | 'detail'>(initialDepth)

  const handleDepthChange = (newDepth: 'main' | 'detail') => {
    setDepth(newDepth)
    onDepthChange?.(newDepth)
  }

  const aggregatedNodes = useMemo<AggregatedNode[]>(() => {
    if (!data?.nodes) return []
    return data.nodes.map((n) => ({
      fn_c: n.fn_c,
      fn_n: n.fn_n,
      ec_c: n.ec_c,
      ec_n: n.ec_n,
      amount: n.amount,
      count: n.count,
    }))
  }, [data])

  // Exclude non-direct spending items for spending view (account_category='ch')
  const excludeEcCodes = filter.account_category === 'ch' ? ['51', '80', '81'] : []

  const {
    primary,
    activePrimary,
    setPrimary,
    treemapData,
    breadcrumbs,
    excludedItemsSummary,
    onNodeClick,
    onBreadcrumbClick,
    reset,
  } = useTreemapDrilldown({
    nodes: aggregatedNodes,
    initialPrimary,
    rootDepth: depth === 'main' ? 2 : 4,
    excludeEcCodes,
    onPrimaryChange,
  })

  useEffect(() => {
    reset()
    if (filter.account_category === 'vn') {
      setPrimary('fn')
    }
  }, [filter.account_category, depth, reset, setPrimary])

  const isRevenueView = filter.account_category === 'vn'
  const periodLabel = usePeriodLabel(filter.report_period)

  return (
    <Card>
      <CardHeader className="p-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-base sm:text-lg font-semibold">
            <Trans>Budget Distribution</Trans> - {periodLabel}
          </h3>
          <div className="flex flex-col gap-3 lg:flex-row items-start lg:gap-4 lg:flex-wrap">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground"><Trans>Grouping</Trans></Label>
              <ToggleGroup
                type="single"
                value={primary}
                onValueChange={(value: 'fn' | 'ec') => {
                  if (value) setPrimary(value)
                }}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto justify-start sm:justify-end"
              >
                <ToggleGroupItem value="fn" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4 whitespace-nowrap">
                  <Trans>Functional</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ec"
                  disabled={isRevenueView}
                  className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4 whitespace-nowrap"
                >
                  <Trans>Economic</Trans>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground"><Trans>Detail level</Trans></Label>
              <ToggleGroup
                type="single"
                value={depth}
                onValueChange={(v: 'main' | 'detail') => {
                  if (v) handleDepthChange(v)
                }}
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
      <CardContent className="-mx-4 sm:mx-0 px-4 sm:px-0">
        {isLoading ? (
          <div className="w-full space-y-2">
            <div className="relative h-[600px] w-full -mx-4 sm:mx-0 px-4 sm:px-0">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
        ) : (
          <BudgetTreemap
            data={treemapData}
            primary={activePrimary}
            onNodeClick={onNodeClick}
            onBreadcrumbClick={onBreadcrumbClick}
            path={breadcrumbs}
            normalization={filter.normalization}
            excludedItemsSummary={excludedItemsSummary}
            chartFilterInput={filter}
          />
        )}
      </CardContent>
    </Card>
  )
}
