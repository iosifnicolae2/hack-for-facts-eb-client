import { Trans } from '@lingui/react/macro'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { yValueFormatter } from '@/components/charts/components/chart-renderer/utils'
import { getNormalizationUnit } from '@/lib/utils'
import { Info } from 'lucide-react'
import type { AggregatedNode } from './budget-transform'

type Props = {
  readonly nodes: readonly AggregatedNode[] | undefined
  readonly normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro'
}

const normalizeEc = (code?: string | null) => (code ?? '').replace(/[^0-9.]/g, '')

export function SpendingBreakdown({ nodes, normalization }: Props) {
  const unit = getNormalizationUnit(normalization ?? 'total')
  const currencyCode: 'RON' | 'EUR' = unit.includes('EUR') ? 'EUR' : 'RON'

  const totalSpending = (nodes ?? []).reduce((sum, n) => sum + (n.amount ?? 0), 0)
  
  const transfersEc51 = (nodes ?? []).reduce((sum, n) => {
    const ec = normalizeEc(n.ec_c)
    return ec.startsWith('51') ? sum + (n.amount ?? 0) : sum
  }, 0)

  const financialOps = (nodes ?? []).reduce((sum, n) => {
    const ec = normalizeEc(n.ec_c)
    return (ec.startsWith('80') || ec.startsWith('81')) ? sum + (n.amount ?? 0) : sum
  }, 0)

  const effectiveSpending = totalSpending - transfersEc51 - financialOps

  return (
    <Card className="shadow-sm border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold"><Trans>Effective Spending Calculation</Trans></h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          <Trans>Understanding the consolidated general budget spending</Trans>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calculation breakdown */}
        <div className="bg-muted/30 rounded-lg p-5 space-y-1 lg:px-[8rem] ">
          {/* Total spending */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                <Trans>Total Spending</Trans>
              </div>
              <div className="text-xs text-muted-foreground">
                <Trans>All budget expenditures</Trans>
              </div>
            </div>
            <div className="text-right min-w-[180px]">
              <div className="font-mono text-lg font-semibold text-foreground">
                {yValueFormatter(totalSpending, currencyCode, 'compact')}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {yValueFormatter(totalSpending, currencyCode, 'standard')}
                {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                <Trans>Transfers Between Institutions</Trans>
              </div>
              <div className="text-xs text-muted-foreground">
                <Trans>Internal budget movements</Trans> <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">ec:51</span>
              </div>
            </div>
            <div className="text-right min-w-[180px]">
              <div className="font-mono text-lg font-semibold text-foreground">
                {yValueFormatter(transfersEc51, currencyCode, 'compact')}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {yValueFormatter(transfersEc51, currencyCode, 'standard')}
                {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
              </div>
            </div>
          </div>

          {/* Minus sign */}
          <div className="flex items-center justify-center py-1">
            <div className="w-full border-t border-dashed border-border" />
            <span className="px-3 text-lg font-bold text-muted-foreground">−</span>
            <div className="w-full border-t border-dashed border-border" />
          </div>

          {/* Financial operations */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                <Trans>Financial Operations</Trans>
              </div>
              <div className="text-xs text-muted-foreground">
                <Trans>Loans and credit repayments</Trans> <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">ec:80+81</span>
              </div>
            </div>
            <div className="text-right min-w-[180px]">
              <div className="font-mono text-lg font-semibold text-foreground">
                {yValueFormatter(financialOps, currencyCode, 'compact')}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {yValueFormatter(financialOps, currencyCode, 'standard')}
                {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
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
          <div className="flex items-center justify-between gap-6 bg-primary/5 rounded-md p-3 -mx-1">
            <div className="flex-1">
              <div className="text-base font-semibold text-foreground">
                <Trans>Effective Spending</Trans>
              </div>
              <div className="text-xs text-muted-foreground">
                <Trans>Actual impact on budget</Trans>
              </div>
            </div>
            <div className="text-right min-w-[180px]">
              <div className="font-mono text-xl font-bold text-primary">
                {yValueFormatter(effectiveSpending, currencyCode, 'compact')}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {yValueFormatter(effectiveSpending, currencyCode, 'standard')}
                {unit.includes('capita') && <span className="ml-1 font-sans">/ capita</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="flex gap-2 text-xs text-muted-foreground bg-muted/20 rounded-md p-3">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            <Trans>Note: Financial operations (Titles 80+81) represent loans and credit repayments. These are financing flows, not regular budget expenses, and are excluded from effective spending.</Trans>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


