import { Trans } from '@lingui/react/macro'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { yValueFormatter } from '@/components/charts/components/chart-renderer/utils'
import { getNormalizationUnit } from '@/lib/utils'
import { Info } from 'lucide-react'
import type { AggregatedNode } from './budget-transform'
import { Skeleton } from '@/components/ui/skeleton'
import type { Currency, Normalization } from '@/schemas/charts'

type Props = {
  readonly nodes: readonly AggregatedNode[] | undefined
  readonly normalization?: Normalization
  readonly currency?: Currency
  readonly periodLabel?: string
  readonly isLoading?: boolean
}

const normalizeEc = (code?: string | null) => (code ?? '').replace(/[^0-9.]/g, '')

export function SpendingBreakdown({ nodes, normalization, currency, periodLabel, isLoading }: Props) {
  const unit = getNormalizationUnit({ normalization: (normalization ?? 'total') as any, currency: currency as any })

  const totalSpending = (nodes ?? []).reduce((sum, n) => sum + (n.amount ?? 0), 0)

  const transfersEc51 = (nodes ?? []).reduce((sum, n) => {
    const ec = normalizeEc(n.ec_c)
    return ec.startsWith('51') ? sum + (n.amount ?? 0) : sum
  }, 0)

  const transfersEc55_01 = (nodes ?? []).reduce((sum, n) => {
    const ec = normalizeEc(n.ec_c)
    return ec.startsWith('55.01') ? sum + (n.amount ?? 0) : sum
  }, 0)

  const effectiveSpending = totalSpending - transfersEc51 - transfersEc55_01

  return (
    <Card className="shadow-sm border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">
            <Trans>Effective Spending Calculation</Trans>
            {periodLabel && <span className="font-bold ml-2">{periodLabel}</span>}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          <Trans>Understanding the consolidated general budget spending</Trans>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="bg-muted/30 rounded-lg p-3 md:p-5 space-y-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="w-full sm:w-auto space-y-1.5">
                    <Skeleton className="h-5 w-full sm:w-32" />
                    <Skeleton className="h-3 w-full sm:w-40" />
                </div>
            </div>
            <div className="flex items-center justify-center py-1">
                <div className="w-full border-t border-dashed border-border" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                </div>
                <div className="w-full sm:w-auto space-y-1.5">
                    <Skeleton className="h-5 w-full sm:w-32" />
                    <Skeleton className="h-3 w-full sm:w-40" />
                </div>
            </div>
            <div className="flex items-center justify-center py-1">
                <div className="w-full border-t border-dashed border-border" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="w-full sm:w-auto space-y-1.5">
                    <Skeleton className="h-5 w-full sm:w-32" />
                    <Skeleton className="h-3 w-full sm:w-40" />
                </div>
            </div>
        </div>
        ) : (
          <>
            {/* Calculation breakdown */}
            <div className="bg-muted/30 rounded-lg p-3 md:p-5 space-y-1 md:px-8">
              {/* Total spending */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    <Trans>Total Spending</Trans>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Trans>All budget expenditures</Trans>
                  </div>
                </div>
                  <div className="text-right w-full sm:w-auto">
                  <div className="font-mono text-base md:text-lg font-semibold text-foreground">
                    {yValueFormatter(totalSpending, unit, 'compact')}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {yValueFormatter(totalSpending, unit, 'standard')}
                  </div>
                </div>
              </div>

              {/* Minus sign */}
              <div className="flex items-center justify-center py-1">
                <div className="w-full border-t border-dashed border-border" />
                <span className="px-3 text-lg font-bold text-muted-foreground">−</span>
                <div className="w-full border-t border-dashed border-border" />
              </div>

              {/* Transfers */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    <Trans>Transfers Between Institutions</Trans>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Trans>Internal budget movements</Trans> <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">ec:51</span>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <div className="font-mono text-base md:text-lg font-semibold text-foreground">
                    {yValueFormatter(transfersEc51, unit, 'compact')}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {yValueFormatter(transfersEc51, unit, 'standard')}
                  </div>
                </div>
              </div>

              {/* Minus sign */}
              <div className="flex items-center justify-center py-1">
                <div className="w-full border-t border-dashed border-border" />
                <span className="px-3 text-lg font-bold text-muted-foreground">−</span>
                <div className="w-full border-t border-dashed border-border" />
              </div>

              {/* Internal transfers */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    <Trans>Internal Transfers</Trans>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Trans>Transfers within public administration</Trans> <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">ec:55.01</span>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <div className="font-mono text-base md:text-lg font-semibold text-foreground">
                    {yValueFormatter(transfersEc55_01, unit, 'compact')}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {yValueFormatter(transfersEc55_01, unit, 'standard')}
                  </div>
                </div>
              </div>

              {/* Equals sign */}
              <div className="flex items-center justify-center py-1">
                <div className="w-full border-t-2 border-primary/30" />
                <span className="px-3 text-lg font-bold text-primary">=</span>
                <div className="w-full border-t-2 border-primary/30" />
              </div>

              {/* Effective spending */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-primary/5 rounded-md p-3 -mx-1">
                <div className="flex-1">
                  <div className="text-base font-semibold text-foreground">
                    <Trans>Effective Spending</Trans>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Trans>Actual impact on budget</Trans>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <div className="font-mono text-lg md:text-xl font-bold text-primary">
                    {yValueFormatter(effectiveSpending, unit, 'compact')}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {yValueFormatter(effectiveSpending, unit, 'standard')}
                  </div>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="flex gap-2 text-xs text-muted-foreground bg-muted/20 rounded-md p-3">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <Trans>Note: Transfers between institutions (ec:51) and internal transfers (ec:55.01) are excluded from effective spending as they represent movements within the public administration rather than actual expenditures.</Trans>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
