/**
 * DetailTable Component for Angajamente Bugetare
 *
 * Color-coded table showing budget chapters with commitments,
 * payments, and unpaid amounts. Rows are expandable to show
 * hierarchical drill-down: Chapter -> Subchapter -> Paragraph -> Economic.
 * Column headers are clickable for sorting.
 */

import { Fragment, useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowUpDown, ChevronRight, ChevronDown, Download, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Trans } from '@lingui/react/macro'
import { useAngajamenteAggregated } from '@/hooks/useAngajamenteData'
import { buildPaidAggregatedInputs, combineAngajamenteAggregatedNodes } from '@/lib/api/angajamente'
import type { AngajamenteFilterInput } from '@/schemas/angajamente'
import type { CategoryData } from './CategoryChart'
import { getClassificationName } from '@/lib/classifications'
import {
  getEconomicSubchapterName,
  getEconomicClassificationName,
} from '@/lib/economic-classifications'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'

export type Grouping = 'fn' | 'ec'
export type DetailLevel = 'chapter' | 'detailed'

type Props = {
  readonly data: CategoryData[]
  readonly currency?: 'RON' | 'EUR' | 'USD'
  readonly isLoading?: boolean
  readonly onDownload?: () => void
  readonly filter?: AngajamenteFilterInput
  readonly grouping: Grouping
  readonly detailLevel: DetailLevel
  readonly onGroupingChange?: (grouping: Grouping, detailLevel: DetailLevel) => void
}

type SubRowData = {
  readonly id: string
  readonly name: string
  readonly budget: number
  readonly committed: number
  readonly paid: number
}

type DrillLevel = 'subchapter' | 'paragraph' | 'economic'

const NEXT_LEVEL: Record<DrillLevel, DrillLevel | null> = {
  subchapter: 'paragraph',
  paragraph: 'economic',
  economic: null,
}

type SortColumn = 'name' | 'budget' | 'committed' | 'percent' | 'paid' | 'unpaid'
type SortDir = 'asc' | 'desc'

function getCodeAtDepth(code: string, depth: 2 | 4 | 6): string {
  const parts = code.replace(/[^0-9.]/g, '').split('.')
  if (depth === 2) return parts[0] ?? ''
  if (depth === 4) return parts.slice(0, 2).join('.')
  return parts.slice(0, 3).join('.')
}

const INDENT_CLASS: Record<number, string> = {
  1: 'pl-12',
  2: 'pl-16',
  3: 'pl-20',
  4: 'pl-24',
}

/**
 * Determine the number of dot-separated segments in a normalised code.
 * "20" → 1, "20.01" → 2, "20.01.04" → 3
 */
function codeSegmentCount(code: string): number {
  const norm = code.replace(/[^0-9.]/g, '')
  if (!norm) return 0
  return norm.split('.').length
}

/**
 * Pick the first drill level that is deeper than `parentCode`.
 * This avoids a wasted API round-trip when `detailLevel='detailed'`
 * causes the parent to already sit at depth 4 (= subchapter level).
 */
export function initialDrillLevel(parentCode: string): DrillLevel {
  const segments = codeSegmentCount(parentCode)
  // depth 6 codes have 3 segments — go straight to leaf
  if (segments >= 3) return 'economic'
  // depth 4 codes have 2 segments (e.g. "20.01") — skip subchapter (also depth 4)
  if (segments >= 2) return 'paragraph'
  return 'subchapter'
}

function ExpandedSubRows({
  parentCode,
  level,
  filter,
  currency,
  indentLevel,
  grouping,
}: {
  readonly parentCode: string
  readonly level: DrillLevel
  readonly filter: AngajamenteFilterInput
  readonly currency: 'RON' | 'EUR' | 'USD'
  readonly indentLevel: number
  readonly grouping: Grouping
}) {
  const [expandedSubRows, setExpandedSubRows] = useState<Set<string>>(new Set())

  const subFilter = useMemo<AngajamenteFilterInput>(
    () => grouping === 'fn'
      ? { ...filter, functional_prefixes: [parentCode] }
      : { ...filter, economic_prefixes: [parentCode] },
    [filter, parentCode, grouping]
  )

  const budgetInput = useMemo(
    () => ({ filter: subFilter, metric: 'CREDITE_BUGETARE_DEFINITIVE' as const, limit: 100 }),
    [subFilter]
  )
  const committedInput = useMemo(
    () => ({ filter: subFilter, metric: 'CREDITE_ANGAJAMENT' as const, limit: 100 }),
    [subFilter]
  )
  const { paidTreasury: paidTreasuryInput, paidNonTreasury: paidNonTreasuryInput } = useMemo(
    () => buildPaidAggregatedInputs({ filter: subFilter, limit: 100 }),
    [subFilter]
  )

  const { data: budgetData, isLoading: isBudgetLoading } = useAngajamenteAggregated(budgetInput)
  const { data: committedData, isLoading: isCommittedLoading } = useAngajamenteAggregated(committedInput)
  const { data: paidTreasuryData, isLoading: isPaidTreasuryLoading } = useAngajamenteAggregated(paidTreasuryInput)
  const { data: paidNonTreasuryData } = useAngajamenteAggregated(paidNonTreasuryInput)

  const isLoading = isBudgetLoading || isCommittedLoading || isPaidTreasuryLoading

  const subRows = useMemo<SubRowData[]>(() => {
    if (!budgetData || !committedData || !paidTreasuryData) return []

    const paidNodes = combineAngajamenteAggregatedNodes(
      paidTreasuryData.nodes,
      paidNonTreasuryData?.nodes ?? []
    )

    // Leaf level: show the opposite dimension
    if (level === 'economic') {
      if (grouping === 'fn') {
        // fn grouping leaf: show economic codes
        const sumByLeaf = (nodes: typeof budgetData.nodes) => {
          const map = new Map<string, { name: string; amount: number }>()
          for (const n of nodes) {
            const code = n.economic_code ?? 'unknown'
            const name = getEconomicClassificationName(code) ?? n.economic_name ?? n.functional_name
            const existing = map.get(code)
            if (existing) {
              existing.amount += n.amount
            } else {
              map.set(code, { name, amount: n.amount })
            }
          }
          return map
        }

        const budgetMap = sumByLeaf(budgetData.nodes)
        const committedMap = sumByLeaf(committedData.nodes)
        const paidMap = sumByLeaf(paidNodes)

        const allCodes = new Set([...budgetMap.keys(), ...committedMap.keys(), ...paidMap.keys()])
        return Array.from(allCodes).map((code) => ({
          id: code,
          name: budgetMap.get(code)?.name ?? committedMap.get(code)?.name ?? paidMap.get(code)?.name ?? code,
          budget: budgetMap.get(code)?.amount ?? 0,
          committed: committedMap.get(code)?.amount ?? 0,
          paid: paidMap.get(code)?.amount ?? 0,
        })).sort((a, b) => b.budget - a.budget)
      } else {
        // ec grouping leaf: show functional codes
        const sumByLeaf = (nodes: typeof budgetData.nodes) => {
          const map = new Map<string, { name: string; amount: number }>()
          for (const n of nodes) {
            const code = n.functional_code
            const name = getClassificationName(code) ?? n.functional_name
            const existing = map.get(code)
            if (existing) {
              existing.amount += n.amount
            } else {
              map.set(code, { name, amount: n.amount })
            }
          }
          return map
        }

        const budgetMap = sumByLeaf(budgetData.nodes)
        const committedMap = sumByLeaf(committedData.nodes)
        const paidMap = sumByLeaf(paidNodes)

        const allCodes = new Set([...budgetMap.keys(), ...committedMap.keys(), ...paidMap.keys()])
        return Array.from(allCodes).map((code) => ({
          id: code,
          name: budgetMap.get(code)?.name ?? committedMap.get(code)?.name ?? paidMap.get(code)?.name ?? code,
          budget: budgetMap.get(code)?.amount ?? 0,
          committed: committedMap.get(code)?.amount ?? 0,
          paid: paidMap.get(code)?.amount ?? 0,
        })).sort((a, b) => b.budget - a.budget)
      }
    }

    // Intermediate levels: drill into the same dimension hierarchy
    const depth = level === 'subchapter' ? 4 : 6
    const parentNorm = parentCode.replace(/[^0-9.]/g, '')

    if (grouping === 'fn') {
      // fn grouping: drill fn hierarchy
      const sumByFunctionalAtDepth = (nodes: typeof budgetData.nodes) => {
        const map = new Map<string, { name: string; amount: number }>()
        for (const n of nodes) {
          const groupCode = getCodeAtDepth(n.functional_code, depth as 4 | 6)
          if (!groupCode.startsWith(parentNorm) || groupCode === parentNorm) continue
          const existing = map.get(groupCode)
          if (existing) {
            existing.amount += n.amount
          } else {
            const name = getClassificationName(groupCode) ?? n.functional_name
            map.set(groupCode, { name, amount: n.amount })
          }
        }
        return map
      }

      const budgetMap = sumByFunctionalAtDepth(budgetData.nodes)
      const committedMap = sumByFunctionalAtDepth(committedData.nodes)
      const paidMap = sumByFunctionalAtDepth(paidNodes)

      const allCodes = new Set([...budgetMap.keys(), ...committedMap.keys(), ...paidMap.keys()])
      return Array.from(allCodes).map((code) => ({
        id: code,
        name: budgetMap.get(code)?.name ?? committedMap.get(code)?.name ?? paidMap.get(code)?.name ?? code,
        budget: budgetMap.get(code)?.amount ?? 0,
        committed: committedMap.get(code)?.amount ?? 0,
        paid: paidMap.get(code)?.amount ?? 0,
      })).sort((a, b) => b.budget - a.budget)
    } else {
      // ec grouping: drill ec hierarchy
      const sumByEconomicAtDepth = (nodes: typeof budgetData.nodes) => {
        const map = new Map<string, { name: string; amount: number }>()
        for (const n of nodes) {
          const rawCode = n.economic_code ?? ''
          const groupCode = getCodeAtDepth(rawCode, depth as 4 | 6)
          if (!groupCode.startsWith(parentNorm) || groupCode === parentNorm) continue
          const existing = map.get(groupCode)
          if (existing) {
            existing.amount += n.amount
          } else {
            const name = (depth === 4
              ? getEconomicSubchapterName(groupCode)
              : getEconomicClassificationName(groupCode))
              ?? n.economic_name ?? groupCode
            map.set(groupCode, { name, amount: n.amount })
          }
        }
        return map
      }

      const budgetMap = sumByEconomicAtDepth(budgetData.nodes)
      const committedMap = sumByEconomicAtDepth(committedData.nodes)
      const paidMap = sumByEconomicAtDepth(paidNodes)

      const allCodes = new Set([...budgetMap.keys(), ...committedMap.keys(), ...paidMap.keys()])
      return Array.from(allCodes).map((code) => ({
        id: code,
        name: budgetMap.get(code)?.name ?? committedMap.get(code)?.name ?? paidMap.get(code)?.name ?? code,
        budget: budgetMap.get(code)?.amount ?? 0,
        committed: committedMap.get(code)?.amount ?? 0,
        paid: paidMap.get(code)?.amount ?? 0,
      })).sort((a, b) => b.budget - a.budget)
    }
  }, [budgetData, committedData, paidTreasuryData, paidNonTreasuryData, level, parentCode, grouping])

  // If a functional level returns no rows but we have data, skip to next level
  const nextLevel = NEXT_LEVEL[level]
  const hasData = budgetData && committedData && paidTreasuryData
  const shouldSkip = hasData && subRows.length === 0 && level !== 'economic' && nextLevel

  const toggleSubRow = (id: string) => {
    setExpandedSubRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (isLoading) {
    return (
      <tr>
        <td colSpan={6} className="p-4 bg-slate-50/50">
          <div className={`flex items-center gap-2 text-sm text-slate-500 ${INDENT_CLASS[indentLevel] ?? 'pl-8'}`}>
            <Loader2 size={14} className="animate-spin" />
            <Trans>Loading details...</Trans>
          </div>
        </td>
      </tr>
    )
  }

  if (shouldSkip) {
    return (
      <ExpandedSubRows
        parentCode={parentCode}
        level={nextLevel}
        filter={filter}
        currency={currency}
        indentLevel={indentLevel}
        grouping={grouping}
      />
    )
  }

  if (subRows.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="p-4 bg-slate-50/50">
          <div className={`text-sm text-slate-400 ${INDENT_CLASS[indentLevel] ?? 'pl-8'}`}>
            <Trans>No breakdown available</Trans>
          </div>
        </td>
      </tr>
    )
  }

  const isExpandable = level !== 'economic' && nextLevel !== null

  return (
    <>
      {subRows.map((sub) => {
        const unpaid = sub.committed - sub.paid
        const executionPercent =
          sub.budget > 0 ? Math.round((sub.paid / sub.budget) * 100) : 0
        const isSubExpanded = expandedSubRows.has(sub.id)

        return (
          <Fragment key={`${parentCode}-${level}-${sub.id}`}>
            <tr
              className={`bg-slate-50/50 border-b border-slate-100/70 ${isExpandable ? 'cursor-pointer hover:bg-slate-100/50' : ''}`}
              onClick={isExpandable ? () => toggleSubRow(sub.id) : undefined}
            >
              <td className={`p-4 ${INDENT_CLASS[indentLevel] ?? 'pl-8'} text-slate-600 text-xs`}>
                <div className="flex items-center gap-1.5">
                  {isExpandable && (
                    isSubExpanded ? (
                      <ChevronDown size={12} className="text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight size={12} className="text-slate-400 shrink-0" />
                    )
                  )}
                  <span className="text-slate-400 mr-1">{
                    level === 'economic'
                      ? (grouping === 'fn' ? `ec:${sub.id}` : `fn:${sub.id}`)
                      : (grouping === 'fn' ? `fn:${sub.id}` : `ec:${sub.id}`)
                  }</span>
                  {sub.name}
                </div>
              </td>
              <td className="p-4 text-right text-slate-500 text-xs">
                {formatCurrency(sub.budget, 'compact', currency)}
              </td>
              <td className="p-4 text-right text-blue-500 text-xs font-medium">
                {formatCurrency(sub.committed, 'compact', currency)}
              </td>
              <td className="p-4 text-right">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    executionPercent > 90
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {executionPercent}%
                </span>
              </td>
              <td className="p-4 text-right text-emerald-500 text-xs font-medium">
                {formatCurrency(sub.paid, 'compact', currency)}
              </td>
              <td className="p-4 text-right text-amber-500 text-xs font-medium">
                <div className="flex items-center justify-end gap-1">
                  {unpaid > 0 && (
                    <AlertCircle size={10} className="text-amber-300" />
                  )}
                  {formatCurrency(unpaid, 'compact', currency)}
                </div>
              </td>
            </tr>
            {isSubExpanded && nextLevel && (
              <ExpandedSubRows
                parentCode={sub.id}
                level={nextLevel}
                filter={filter}
                currency={currency}
                indentLevel={indentLevel + 1}
                grouping={grouping}
              />
            )}
          </Fragment>
        )
      })}
    </>
  )
}

function SortIcon({ column, sortCol, sortDir }: {
  readonly column: SortColumn
  readonly sortCol: SortColumn
  readonly sortDir: SortDir
}) {
  if (sortCol !== column) {
    return <ArrowUpDown size={12} className="text-slate-300 ml-1 inline-block" />
  }
  return (
    <span className="ml-1 text-slate-600 inline-block">
      {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
    </span>
  )
}

export function DetailTable({
  data,
  currency = 'RON',
  isLoading = false,
  onDownload,
  filter,
  grouping,
  detailLevel,
  onGroupingChange,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortCol, setSortCol] = useState<SortColumn>('budget')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const totals = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        budget: acc.budget + item.budget,
        committed: acc.committed + item.committed,
        paid: acc.paid + item.paid,
      }),
      { budget: 0, committed: 0, paid: 0 }
    )
  }, [data])

  const totalUnpaid = totals.committed - totals.paid
  const totalExecutionPercent = totals.budget > 0 ? Math.round((totals.paid / totals.budget) * 100) : 0

  // Reset expanded rows when grouping or detail level changes
  useEffect(() => {
    setExpandedRows(new Set())
  }, [grouping, detailLevel])

  const toggleSort = (col: SortColumn) => {
    if (sortCol !== col) {
      setSortCol(col)
      setSortDir('desc')
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    }
  }

  const sortedData = useMemo(() => {
    const getValue = (item: CategoryData): number | string => {
      switch (sortCol) {
        case 'name': return item.name
        case 'budget': return item.budget
        case 'committed': return item.committed
        case 'percent': return item.budget > 0 ? item.paid / item.budget : 0
        case 'paid': return item.paid
        case 'unpaid': return item.committed - item.paid
      }
    }
    return [...data].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      const cmp = typeof va === 'string'
        ? va.localeCompare(vb as string)
        : (va as number) - (vb as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortCol, sortDir])

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            <Trans>Table Detail</Trans>
          </h3>
        </div>
        <div className="p-8 text-center text-slate-400">
          <Trans>No data available</Trans>
        </div>
      </div>
    )
  }

  const canExpand = !!filter

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800 shrink-0">
          <Trans>Table Detail</Trans>
        </h3>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap"><Trans>Grouping</Trans></Label>
            <ToggleGroup
              type="single"
              value={grouping}
              onValueChange={(v: string) => { if (v) onGroupingChange?.(v as Grouping, detailLevel) }}
              size="sm"
            >
              <ToggleGroupItem value="fn"><Trans>Functional</Trans></ToggleGroupItem>
              <ToggleGroupItem value="ec"><Trans>Economic</Trans></ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap"><Trans>Detail Level</Trans></Label>
            <ToggleGroup
              type="single"
              value={detailLevel}
              onValueChange={(v: string) => { if (v) onGroupingChange?.(grouping, v as DetailLevel) }}
              size="sm"
            >
              <ToggleGroupItem value="chapter"><Trans>Main Chapters</Trans></ToggleGroupItem>
              <ToggleGroupItem value="detailed"><Trans>Detailed Categories</Trans></ToggleGroupItem>
            </ToggleGroup>
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700 transition-colors ml-1"
            >
              <Download size={14} />
              <Trans>Download Excel</Trans>
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th
                className="p-4 font-semibold border-b border-slate-200 cursor-pointer select-none hover:text-slate-700"
                onClick={() => toggleSort('name')}
              >
                <Trans>Budget Chapter</Trans>
                <SortIcon column="name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th
                className="p-4 font-semibold border-b border-slate-200 text-right cursor-pointer select-none hover:text-slate-700"
                onClick={() => toggleSort('budget')}
              >
                <Trans>Budget Credits</Trans>
                <SortIcon column="budget" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th
                className="p-4 font-semibold border-b border-slate-200 text-right text-blue-700 cursor-pointer select-none hover:text-blue-800"
                onClick={() => toggleSort('committed')}
              >
                <Trans>Legal commitments</Trans>
                <SortIcon column="committed" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th
                className="p-4 font-semibold border-b border-slate-200 text-right cursor-pointer select-none hover:text-slate-700"
                onClick={() => toggleSort('percent')}
              >
                <Trans>Execution %</Trans>
                <SortIcon column="percent" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th
                className="p-4 font-semibold border-b border-slate-200 text-right text-emerald-700 cursor-pointer select-none hover:text-emerald-800"
                onClick={() => toggleSort('paid')}
              >
                <Trans>Payments Made</Trans>
                <SortIcon column="paid" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th
                className="p-4 font-semibold border-b border-slate-200 text-right text-amber-600 cursor-pointer select-none hover:text-amber-700"
                onClick={() => toggleSort('unpaid')}
              >
                <Trans>To Pay</Trans>
                <SortIcon column="unpaid" sortCol={sortCol} sortDir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {sortedData.map((item, idx) => {
              const unpaid = item.committed - item.paid
              const executionPercent =
                item.budget > 0
                  ? Math.round((item.paid / item.budget) * 100)
                  : 0
              const isExpanded = expandedRows.has(item.id)

              return (
                <Fragment key={item.id}>
                  <tr
                    className={`transition-colors ${
                      canExpand ? 'cursor-pointer' : ''
                    } ${
                      isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'
                    } ${
                      idx !== sortedData.length - 1 || isExpanded ? 'border-b border-slate-100' : ''
                    }`}
                    onClick={canExpand ? () => toggleRow(item.id) : undefined}
                  >
                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        {canExpand && (
                          isExpanded ? (
                            <ChevronDown size={16} className="text-slate-400 shrink-0" />
                          ) : (
                            <ChevronRight size={16} className="text-slate-400 shrink-0" />
                          )
                        )}
                        {item.name}
                      </div>
                    </td>
                    <td className="p-4 text-right text-slate-600">
                      {formatCurrency(item.budget, 'compact', currency)}
                    </td>
                    <td className="p-4 text-right font-semibold text-blue-600">
                      {formatCurrency(item.committed, 'compact', currency)}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          executionPercent > 90
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {executionPercent}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(item.paid, 'compact', currency)}
                    </td>
                    <td className="p-4 text-right font-medium text-amber-600">
                      <div className="flex items-center justify-end gap-1">
                        {unpaid > 0 && (
                          <AlertCircle size={12} className="text-amber-400" />
                        )}
                        {formatCurrency(unpaid, 'compact', currency)}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && filter && (
                    <ExpandedSubRows
                      parentCode={item.id}
                      level={initialDrillLevel(item.id)}
                      filter={filter}
                      currency={currency}
                      indentLevel={1}
                      grouping={grouping}
                    />
                  )}
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr
              className="bg-slate-50 border-t border-slate-200 text-sm"
              data-testid="detail-table-total-row"
            >
              <td className="p-4 font-semibold text-slate-700">
                <Trans>Total</Trans>
              </td>
              <td className="p-4 text-right font-semibold text-slate-700" data-testid="detail-table-total-budget">
                {formatCurrency(totals.budget, 'compact', currency)}
              </td>
              <td className="p-4 text-right font-semibold text-blue-700" data-testid="detail-table-total-committed">
                {formatCurrency(totals.committed, 'compact', currency)}
              </td>
              <td className="p-4 text-right" data-testid="detail-table-total-execution-percent">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {totalExecutionPercent}%
                </span>
              </td>
              <td className="p-4 text-right font-semibold text-emerald-700" data-testid="detail-table-total-paid">
                {formatCurrency(totals.paid, 'compact', currency)}
              </td>
              <td className="p-4 text-right font-semibold text-amber-700" data-testid="detail-table-total-unpaid">
                <div className="flex items-center justify-end gap-1">
                  {totalUnpaid > 0 && (
                    <AlertCircle size={12} className="text-amber-500" />
                  )}
                  {formatCurrency(totalUnpaid, 'compact', currency)}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
