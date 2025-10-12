import { useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Accordion } from '@/components/ui/accordion'
import type { AggregatedNode } from './budget-transform'
import GroupedChapterAccordion from '@/components/entities/GroupedChapterAccordion'
import type { GroupedChapter } from '@/schemas/financial'
// Labels are handled by the grouping hook; keep imports minimal
import { Trans } from '@lingui/react/macro'
import type { AnalyticsFilterType } from '@/schemas/charts'
import { useFinancialData, MinimalExecutionLineItem } from '@/hooks/useFinancialData'

export type DrillGroup = GroupedChapter

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  code: string | null
  primary: 'fn' | 'ec'
  nodes: AggregatedNode[]
  filter: AnalyticsFilterType
}

const normalize = (value?: string | null) => value?.replace(/[^0-9.]/g, '') ?? ''

// helper removed; no longer needed

// We reuse the consolidated grouping logic from useFinancialData by filtering
// the line items to the selected group and then delegating to the hook.

export function BudgetDetailsDrawer({ open, onOpenChange, code, primary, nodes, filter }: Props) {
  const items: MinimalExecutionLineItem[] = useMemo(() => {
    return nodes.map((n) => ({
      account_category: filter.account_category,
      amount: n.amount ?? 0,
      economicClassification: { economic_code: n.ec_c ?? '', economic_name: n.ec_n ?? '' },
      functionalClassification: { functional_code: n.fn_c ?? '', functional_name: n.fn_n ?? '' },
    }))
  }, [nodes, filter.account_category])

  const filteredItems = useMemo(() => {
    if (!code) return [] as MinimalExecutionLineItem[]
    const selected = normalize(code)
    if (!selected) return [] as MinimalExecutionLineItem[]
    return items.filter((li) => {
      const fn = normalize(li.functionalClassification?.functional_code)
      const ec = normalize(li.economicClassification?.economic_code)
      return primary === 'fn' ? fn.startsWith(selected) : ec.startsWith(selected)
    })
  }, [items, code, primary])

  const total = useMemo(() => filteredItems.reduce((s, it) => s + (it.amount || 0), 0), [filteredItems])

  const { filteredExpenseGroups, expenseBase, filteredIncomeGroups, incomeBase } = useFinancialData(
    filteredItems,
    filter.account_category === 'vn' ? total : null,
    filter.account_category === 'ch' ? total : null,
    '',
    '',
    { computeEconomic: false },
  )

  const grouped = filter.account_category === 'vn' ? filteredIncomeGroups : filteredExpenseGroups
  const totalAmount = filter.account_category === 'vn' ? incomeBase : expenseBase
  const title = code ? `${primary === 'fn' ? 'Functional' : 'Economic'} ${code}` : ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <Trans>No detailed data available for this selection.</Trans>
            </p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {grouped.map((chapter) => (
                <GroupedChapterAccordion
                  key={chapter.prefix}
                  ch={chapter}
                  baseTotal={totalAmount}
                  searchTerm={''}
                  normalization={undefined}
                  codePrefixForSubchapters={primary}
                />
              ))}
            </Accordion>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}


