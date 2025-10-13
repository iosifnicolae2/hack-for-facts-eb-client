import { useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import { groupData } from './budget-transform'
import { formatCurrency, formatNumber, getNormalizationUnit } from '@/lib/utils'
import type { GroupedItem } from './budget-transform'

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
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro'
}

const CategoryColumn = ({ title, items, baseTotal, codePrefix, normalization }: { title: React.ReactNode, items: GroupedItem[], baseTotal: number, codePrefix: 'fn' | 'ec', normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro' }) => {
    const unit = getNormalizationUnit(normalization ?? 'total');
    const currencyCode = unit.includes('EUR') ? 'EUR' : 'RON';
    return (
        <div>
            <h4 className="text-base font-semibold mb-4">{title}</h4>
            <ul className="space-y-6">
                {items.map((g) => {
                const pct = baseTotal > 0 ? (g.total / baseTotal) * 100 : 0
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
                                    {formatCurrency(g.total, 'compact', currencyCode)} ({formatNumber(pct)}%)
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    {formatCurrency(g.total, 'standard', currencyCode)} {unit.includes('capita') && '/ capita'}
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                            <div className="bg-gradient-to-r from-primary to-blue-400 h-1.5 rounded-full" style={{width: `${pct}%`}}></div>
                        </div>
                    </li>
                )
                })}
            </ul>
        </div>
    )
}

export function BudgetCategoryList({ aggregated, depth, normalization }: Props) {
  const functional = useMemo(() => groupData(aggregated as any, 'fn', depth), [aggregated, depth]);
  const economic = useMemo(() => groupData(aggregated as any, 'ec', depth), [aggregated, depth]);

  if (functional.items.length === 0 && economic.items.length === 0) {
      return <div className="text-center text-muted-foreground py-8"><Trans>No categories to display.</Trans></div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      <CategoryColumn title={<Trans>Top Functional Categories</Trans>} items={functional.items} baseTotal={functional.baseTotal} codePrefix="fn" normalization={normalization} />
      <CategoryColumn title={<Trans>Top Economic Categories</Trans>} items={economic.items} baseTotal={economic.baseTotal} codePrefix="ec" normalization={normalization} />
    </div>
  )
}


