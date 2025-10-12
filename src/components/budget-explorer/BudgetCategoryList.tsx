import { useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import { groupData } from './budget-transform'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { GroupedItem } from './budget-transform'
import { useIsMobile } from '@/hooks/use-mobile'

type AggregatedItem = {
  fn_c: string | null
  fn_n: string | null
  ec_c: string | null
  ec_n: string | null
  amount: number
}

type Props = {
  aggregated: AggregatedItem[]
  depth: 2 | 4 | 6
}

const CategoryColumn = ({ title, items, baseTotal, codePrefix, isMobile }: { title: React.ReactNode, items: GroupedItem[], baseTotal: number, codePrefix: 'fn' | 'ec', isMobile: boolean }) => {
    return (
        <div>
            <h4 className="text-lg font-semibold mb-4">{title}</h4>
            <ul className="space-y-5">
                {items.map((g) => {
                const pct = baseTotal > 0 ? (g.total / baseTotal) * 100 : 0
                return (
                    <li key={g.code}>
                    {isMobile ? (
                        // Mobile layout: Stack vertically
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <code className="text-xs font-mono text-muted-foreground flex-shrink-0 mt-0.5">{codePrefix}:{g.code}</code>
                                <span className="text-sm font-medium flex-1">{g.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold">{formatCurrency(g.total, 'compact', 'RON')}</span>
                                <span className="text-muted-foreground">({formatNumber(pct)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div className="bg-gradient-to-r from-primary to-blue-400 h-2 rounded-full" style={{width: `${pct}%`}}></div>
                            </div>
                        </div>
                    ) : (
                        // Desktop layout: Side by side
                        <>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-baseline gap-2 truncate pr-4">
                                    <code className="text-xs font-mono text-muted-foreground">{codePrefix}:{g.code}</code>
                                    <span className="text-sm font-medium truncate">{g.name}</span>
                                </div>
                                <span className="text-sm font-medium whitespace-nowrap">{formatCurrency(g.total, 'compact', 'RON')} ({formatNumber(pct)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div className="bg-gradient-to-r from-primary to-blue-400 h-2 rounded-full" style={{width: `${pct}%`}}></div>
                            </div>
                        </>
                    )}
                    </li>
                )
                })}
            </ul>
        </div>
    )
}

export function BudgetCategoryList({ aggregated, depth }: Props) {
  const isMobile = useIsMobile()
  const functional = useMemo(() => groupData(aggregated as any, 'fn', depth), [aggregated, depth]);
  const economic = useMemo(() => groupData(aggregated as any, 'ec', depth), [aggregated, depth]);

  if (functional.items.length === 0 && economic.items.length === 0) {
      return <div className="text-center text-muted-foreground py-8"><Trans>No categories to display.</Trans></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      <CategoryColumn title={<Trans>Top Functional Categories</Trans>} items={functional.items} baseTotal={functional.baseTotal} codePrefix="fn" isMobile={isMobile} />
      <CategoryColumn title={<Trans>Top Economic Categories</Trans>} items={economic.items} baseTotal={economic.baseTotal} codePrefix="ec" isMobile={isMobile} />
    </div>
  )
}


