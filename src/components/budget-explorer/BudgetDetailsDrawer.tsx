import { useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Accordion } from '@/components/ui/accordion'
import type { AggregatedNode } from './budget-transform'
import GroupedChapterAccordion from '@/components/entities/GroupedChapterAccordion'
import type { GroupedChapter } from '@/schemas/financial'
import { Trans } from '@lingui/react/macro'

export type DrillGroup = GroupedChapter

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  code: string | null
  primary: 'fn' | 'ec'
  nodes: AggregatedNode[]
}

const normalize = (value?: string | null) => value?.replace(/[^0-9.]/g, '') ?? ''

const buildGroupedChapters = (items: AggregatedNode[], primary: 'fn' | 'ec', selectedCode: string): GroupedChapter[] => {
  const normalizedSelected = normalize(selectedCode)
  if (!normalizedSelected) return []
  const chapterMap = new Map<string, GroupedChapter>()

  for (const item of items) {
    const fnCode = normalize(item.fn_c)
    const ecCode = normalize(item.ec_c)
    const fnName = item.fn_n ?? fnCode
    const ecName = item.ec_n ?? ecCode

    if (primary === 'fn') {
      if (!fnCode.startsWith(normalizedSelected)) continue
      const chapterKey = fnCode.split('.')[0] ?? fnCode
      if (!chapterMap.has(chapterKey)) {
        chapterMap.set(chapterKey, {
          prefix: chapterKey,
          description: fnName,
          totalAmount: 0,
          functionals: [],
          subchapters: [],
        })
      }
      const chapter = chapterMap.get(chapterKey)!
      chapter.totalAmount += item.amount ?? 0

      const functionalEntry = chapter.functionals.find((f) => f.code === fnCode)
      if (functionalEntry) {
        functionalEntry.totalAmount += item.amount ?? 0
        functionalEntry.economics.push({
          code: ecCode,
          name: ecName,
          amount: item.amount ?? 0,
        })
      } else {
        chapter.functionals.push({
          code: fnCode,
          name: fnName,
          totalAmount: item.amount ?? 0,
          economics: [
            {
              code: ecCode,
              name: ecName,
              amount: item.amount ?? 0,
            },
          ],
        })
      }
    } else {
      if (!ecCode.startsWith(normalizedSelected)) continue
      const chapterKey = ecCode.split('.')[0] ?? ecCode
      if (!chapterMap.has(chapterKey)) {
        chapterMap.set(chapterKey, {
          prefix: chapterKey,
          description: ecName,
          totalAmount: 0,
          functionals: [],
          subchapters: [],
        })
      }
      const chapter = chapterMap.get(chapterKey)!
      chapter.totalAmount += item.amount ?? 0

      const economicEntry = chapter.functionals.find((f) => f.code === ecCode)
      if (economicEntry) {
        economicEntry.totalAmount += item.amount ?? 0
        economicEntry.economics.push({
          code: fnCode,
          name: fnName,
          amount: item.amount ?? 0,
        })
      } else {
        chapter.functionals.push({
          code: ecCode,
          name: ecName,
          totalAmount: item.amount ?? 0,
          economics: [
            {
              code: fnCode,
              name: fnName,
              amount: item.amount ?? 0,
            },
          ],
        })
      }
    }
  }

  return Array.from(chapterMap.values()).sort((a, b) => b.totalAmount - a.totalAmount)
}

export function BudgetDetailsDrawer({ open, onOpenChange, code, primary, nodes }: Props) {
  const grouped = useMemo(() => {
    if (!code) return []
    return buildGroupedChapters(nodes, primary, code)
  }, [code, nodes, primary])

  const totalAmount = grouped.reduce((sum, chapter) => sum + chapter.totalAmount, 0)
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
                />
              ))}
            </Accordion>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}


