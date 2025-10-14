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
}

export function EntityAnalyticsTreemap({ filter, data, isLoading }: EntityAnalyticsTreemapProps) {
  const [depth, setDepth] = useState<'main' | 'detail'>('main')

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

  const {
    primary,
    activePrimary,
    setPrimary,
    treemapData,
    breadcrumbs,
    onNodeClick,
    onBreadcrumbClick,
    reset,
  } = useTreemapDrilldown({
    nodes: aggregatedNodes,
    initialPrimary: 'fn',
    rootDepth: depth === 'main' ? 2 : 4,
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
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h3 className="text-base sm:text-lg font-semibold">
            <Trans>Budget Distribution</Trans> - {periodLabel}
          </h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground"><Trans>Grouping</Trans></Label>
              <ToggleGroup
                type="single"
                value={primary}
                onValueChange={(value: 'fn' | 'ec') => {
                  if (value) setPrimary(value)
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="fn" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4">
                  <Trans>Functional</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ec"
                  disabled={isRevenueView}
                  className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4"
                >
                  <Trans>Economic</Trans>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground"><Trans>Detail level</Trans></Label>
              <ToggleGroup
                type="single"
                value={depth}
                onValueChange={(v: 'main' | 'detail') => {
                  if (v) setDepth(v)
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="main" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4">
                  <Trans>Main chapters</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem value="detail" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4">
                  <Trans>Detailed categories</Trans>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[600px]" />
        ) : (
          <BudgetTreemap
            data={treemapData}
            primary={activePrimary}
            onNodeClick={onNodeClick}
            onBreadcrumbClick={onBreadcrumbClick}
            path={breadcrumbs}
            normalization={filter.normalization}
          />
        )}
      </CardContent>
    </Card>
  )
}
