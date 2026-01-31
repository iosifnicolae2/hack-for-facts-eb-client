import { useMemo } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Accordion } from '@/components/ui/accordion'
import type { AggregatedNode } from './budget-transform'
import GroupedChapterAccordion from '@/components/entities/GroupedChapterAccordion'
import type { GroupedChapter } from '@/schemas/financial'
// Labels are handled by the grouping hook; keep imports minimal
import { Trans } from '@lingui/react/macro'
import type { AnalyticsFilterType } from '@/schemas/charts'
import { useFinancialData, MinimalExecutionLineItem } from '@/hooks/useFinancialData'
import { getClassificationName } from '@/lib/classifications'

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
  const title = useMemo(() => {
    if (!code) return ''
    const cleaned = normalize(code)
    const parts = cleaned.split('.')
    const isSixDigit = parts.length >= 3
    const isFourDigit = parts.length === 2
    // Prefer API names for 6-digit codes from filtered items
    if (isSixDigit) {
      const anyItem = filteredItems.find((li) => {
        const fn = normalize(li.functionalClassification?.functional_code)
        const ec = normalize(li.economicClassification?.economic_code)
        return primary === 'fn' ? fn === cleaned : ec === cleaned
      })
      const apiName = primary === 'fn' ? anyItem?.functionalClassification?.functional_name : anyItem?.economicClassification?.economic_name
      if (apiName && apiName.trim()) {
        return apiName
      }
    }
    // For 4-digit, ensure we show functional subchapter name (not chapter)
    if (isFourDigit && primary === 'fn') {
      const subchapterName = getClassificationName(cleaned)
      if (subchapterName && subchapterName.trim()) return subchapterName
    }
    // Fallback
    return `${primary === 'fn' ? 'Functional' : 'Economic'} ${code}`
  }, [code, filteredItems, primary])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">
            <Trans>Breakdown of the selected classification, including grouped chapters and totals.</Trans>
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <Trans>No detailed data available for this selection.</Trans>
            </p>
          ) : (
            <Accordion type="multiple" defaultValue={grouped.map((g) => g.prefix)} className="w-full">
              {grouped.map((chapter) => (
                <GroupedChapterAccordion
                  key={chapter.prefix}
                  ch={chapter}
                  baseTotal={totalAmount}
                  searchTerm={''}
                  normalization={filter.normalization}
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

