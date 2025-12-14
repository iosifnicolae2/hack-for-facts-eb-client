import { useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import { groupData } from './budget-transform'
import { formatCurrency, formatNumber, getNormalizationUnit } from '@/lib/utils'
import type { GroupedItem } from './budget-transform'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES, DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES } from '@/lib/analytics-defaults'
import type { Currency, Normalization } from '@/schemas/charts'

type AggregatedItem = {
  fn_c: string | null
  fn_n: string | null
  ec_c: string | null
  ec_n: string | null
  amount: number
}

type Props = {
  readonly aggregated: AggregatedItem[]
  readonly depth: 2 | 4 | 6
  readonly accountCategory?: 'ch' | 'vn'
  readonly normalization?: Normalization
  readonly currency?: Currency
  readonly showEconomic?: boolean
  readonly economicInfoText?: React.ReactNode
  readonly isLoading?: boolean
}

const CategoryItemSkeleton = () => (
    <div className="space-y-2.5">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex-shrink-0 text-right space-y-2">
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-3 w-24 ml-auto" />
        </div>
      </div>
      <Skeleton className="h-1.5 w-full" />
    </div>
  )
  
  const CategoryListSkeleton = () => (
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <CategoryItemSkeleton key={i} />
      ))}
    </div>
  )

const CategoryColumn = ({ title, items, baseTotal, codePrefix, normalization, currency }: { title: React.ReactNode, items: GroupedItem[], baseTotal: number, codePrefix: 'fn' | 'ec', normalization?: Normalization, currency?: Currency }) => {
    const unit = getNormalizationUnit({ normalization: (normalization ?? 'total') as any, currency: currency as any });
    const isPercent = unit.includes('%')
    const currencyCode: Currency = currency ?? (unit.includes('EUR') ? 'EUR' : unit.includes('USD') ? 'USD' : 'RON');
    // Denominator for progress bars uses the sum of absolute item totals
    const absTotal = useMemo(() => items.reduce((sum, it) => sum + Math.abs(it.total), 0), [items])

    return (
        <div>
            <h4 className="text-base font-semibold mb-4">{title}</h4>
            <ul className="space-y-6">
                {items.map((g) => {
                const isNegative = g.total < 0
                const pctBar = absTotal > 0 ? Math.min(100, Math.max(0, (Math.abs(g.total) / absTotal) * 100)) : 0
                const pctText = baseTotal !== 0 ? (g.total / baseTotal) * 100 : 0
                return (
                    <li key={g.code}>
                        <div className="flex justify-between items-start mb-2 gap-4">
                            <div className="flex-1 truncate">
                                <div className="flex items-baseline gap-2">
                                    <code className="text-xs font-mono text-muted-foreground">{codePrefix}:{g.code}</code>
                                    <span className="text-sm font-medium truncate">{g.name}</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <div className="font-semibold text-sm">
                                    {isPercent ? `${formatNumber(g.total, 'compact')}%` : formatCurrency(g.total, 'compact', currencyCode)} ({formatNumber(pctText)}%)
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    {isPercent ? `${formatNumber(g.total, 'standard')}%` : formatCurrency(g.total, 'standard', currencyCode)} {unit.includes('capita') && '/ capita'}
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700" aria-label={isNegative ? 'negative value' : 'positive value'}>
                            <div
                              className={`${isNegative ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-blue-400'} h-1.5 rounded-full`}
                              style={{width: `${pctBar}%`}}
                            />
                        </div>
                    </li>
                )
                })}
            </ul>
        </div>
    )
}

export function BudgetCategoryList({ aggregated, depth, accountCategory, normalization, currency, showEconomic = true, economicInfoText, isLoading }: Props) {
  const filteredAggregated = useMemo(() => {
    if (accountCategory === 'ch') {
      return aggregated.filter((item) => {
        const code = item.ec_c ?? ''
        return !DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES.some((prefix) => code.startsWith(prefix))
      })
    }
    if (accountCategory === 'vn') {
      return aggregated.filter((item) => {
        const code = item.fn_c ?? ''
        return !DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES.some((prefix) => code.startsWith(prefix))
      })
    }
    return aggregated
  }, [aggregated, accountCategory])

  const functional = useMemo(() => groupData(filteredAggregated as any, 'fn', depth), [filteredAggregated, depth]);
  const economic = useMemo(() => groupData(filteredAggregated as any, 'ec', depth), [filteredAggregated, depth]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-48 mb-4" />
          <CategoryListSkeleton />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-48 mb-4" />
          <CategoryListSkeleton />
        </div>
      </div>
    )
  }

  if (functional.items.length === 0 && economic.items.length === 0) {
      return <div className="text-center text-muted-foreground py-8"><Trans>No categories to display.</Trans></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      <CategoryColumn title={<Trans>Top Functional Categories</Trans>} items={functional.items} baseTotal={functional.baseTotal} codePrefix="fn" normalization={normalization} currency={currency} />
      {showEconomic ? (
        <CategoryColumn title={<Trans>Top Economic Categories</Trans>} items={economic.items} baseTotal={economic.baseTotal} codePrefix="ec" normalization={normalization} currency={currency} />
      ) : (
        <div>
          <h4 className="text-base font-semibold mb-4"><Trans>Top Economic Categories</Trans></h4>
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            {economicInfoText ?? <Trans>No economic breakdown is available for income.</Trans>}
          </div>
        </div>
      )}
    </div>
  )
}
