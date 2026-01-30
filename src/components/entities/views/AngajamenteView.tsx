/**
 * Angajamente Bugetare View for Entity Detail Page
 *
 * Progressive disclosure design:
 * 1. KPI Summary (3 cards)
 * 2. Financial Flow Visualization
 * 3. Category Breakdown + Info Panel
 * 4. Detailed Table
 */

import { useMemo } from 'react'
import { EntityDetailsData } from '@/lib/api/entities'
import {
  useAngajamenteSummary,
  useAngajamenteAggregated,
} from '@/hooks/useAngajamenteData'
import {
  extractSummaryValues,
  buildAngajamenteFilter,
} from '@/lib/api/angajamente'
import type { AngajamenteFilterInput } from '@/schemas/angajamente'
import type { ReportPeriodInput, ReportPeriodType, GqlReportType, PeriodDate } from '@/schemas/reporting'
import { getQuarterForMonth } from '@/schemas/reporting'
import {
  StatCard,
  LinearBudgetFlow,
  CategoryChart,
  CommitmentInfoPanel,
  DetailTable,
  type CategoryData,
} from '@/components/angajamente'
import { t } from '@lingui/core/macro'
import { getClassificationName } from '@/lib/classifications'
import {
  getEconomicChapterName,
  getEconomicSubchapterName,
} from '@/lib/economic-classifications'
import type { Grouping, DetailLevel } from '@/components/angajamente/DetailTable'

type Props = {
  readonly entity: EntityDetailsData | null | undefined
  readonly currentYear: number
  readonly currency?: 'RON' | 'EUR' | 'USD'
  readonly reportPeriod: ReportPeriodInput
  readonly reportType?: GqlReportType
  readonly normalization?: string
  readonly inflationAdjusted?: boolean
  readonly angajamenteGrouping?: Grouping
  readonly angajamenteDetailLevel?: DetailLevel
  readonly onAngajamenteGroupingChange?: (grouping: Grouping, detailLevel: DetailLevel) => void
}

/**
 * Convert a MONTH-type report period to its containing QUARTER,
 * since angajamente data is natively quarterly.
 */
function toAngajamenteReportPeriod(reportPeriod: ReportPeriodInput): ReportPeriodInput {
  if (reportPeriod.type !== 'MONTH') return reportPeriod

  // Convert month interval to quarter interval
  const interval = reportPeriod.selection.interval
  if (interval) {
    const startMonth = parseInt(interval.start.split('-')[1] || '1', 10)
    const endMonth = parseInt(interval.end.split('-')[1] || '12', 10)
    const startYear = interval.start.split('-')[0]
    const endYear = interval.end.split('-')[0]
    const startQ = getQuarterForMonth(startMonth)
    const endQ = getQuarterForMonth(endMonth)
    return {
      type: 'QUARTER' as ReportPeriodType,
      selection: {
        interval: {
          start: `${startYear}-${startQ}` as PeriodDate,
          end: `${endYear}-${endQ}` as PeriodDate,
        },
      },
    }
  }

  // Fallback: just change type to QUARTER
  return { ...reportPeriod, type: 'QUARTER' as ReportPeriodType }
}

export function AngajamenteView({
  entity,
  currency = 'RON',
  reportPeriod,
  reportType,
  normalization,
  inflationAdjusted,
  angajamenteGrouping,
  angajamenteDetailLevel,
  onAngajamenteGroupingChange,
}: Props) {
  const cui = entity?.cui ?? ''
  const grouping: Grouping = angajamenteGrouping ?? 'fn'
  const detailLevel: DetailLevel = angajamenteDetailLevel ?? 'chapter'

  // Auto-convert MONTH → QUARTER for angajamente data
  const angajamenteReportPeriod = useMemo(
    () => toAngajamenteReportPeriod(reportPeriod),
    [reportPeriod]
  )

  // Build the filter for all angajamente queries
  const filter = useMemo<AngajamenteFilterInput>(
    () =>
      buildAngajamenteFilter({
        reportPeriod: angajamenteReportPeriod,
        reportType: reportType ?? 'PRINCIPAL_AGGREGATED',
        cui,
        normalization,
        currency,
        inflationAdjusted,
        excludeTransfers: true,
      }),
    [angajamenteReportPeriod, reportType, cui, normalization, currency, inflationAdjusted]
  )

  // Fetch summary data
  const { data: summaryData, isLoading: isSummaryLoading } = useAngajamenteSummary(
    filter,
    { enabled: !!cui }
  )

  // Fetch 3 parallel aggregated queries for the category chart
  // TODO: Consider a single aggregated query with multiple metrics when the API supports it
  const budgetAggInput = useMemo(
    () => ({ filter, metric: 'CREDITE_BUGETARE_DEFINITIVE' as const, limit: 20 }),
    [filter]
  )
  const committedAggInput = useMemo(
    () => ({ filter, metric: 'CREDITE_ANGAJAMENT' as const, limit: 20 }),
    [filter]
  )
  const paidAggInput = useMemo(
    () => ({ filter, metric: 'PLATI_TREZOR' as const, limit: 20 }),
    [filter]
  )

  const { data: budgetAgg, isLoading: isBudgetAggLoading } = useAngajamenteAggregated(
    budgetAggInput,
    { enabled: !!cui }
  )
  const { data: committedAgg, isLoading: isCommittedAggLoading } = useAngajamenteAggregated(
    committedAggInput,
    { enabled: !!cui }
  )
  const { data: paidAgg, isLoading: isPaidAggLoading } = useAngajamenteAggregated(
    paidAggInput,
    { enabled: !!cui }
  )

  const isCategoryLoading = isBudgetAggLoading || isCommittedAggLoading || isPaidAggLoading

  // Extract summary values from union type
  const summaryValues = useMemo(
    () => extractSummaryValues(summaryData?.nodes ?? []),
    [summaryData]
  )
  const { totalBudget, committed, paid } = summaryValues

  // Join the 3 aggregated queries into CategoryData[]
  // The API returns rows grouped by (functional_code, economic_code), so we
  // must sum amounts per group code before joining across metrics.
  // Grouping dimension (fn/ec) and detail level (chapter/detailed) are controlled
  // by the DetailTable toggle controls.
  const getCodeAtDepth = (code: string, depth: 2 | 4): string => {
    const parts = code.replace(/[^0-9.]/g, '').split('.')
    if (depth === 2) return parts[0] ?? ''
    return parts.slice(0, 2).join('.')
  }

  const categoryData = useMemo<CategoryData[]>(() => {
    if (!budgetAgg || !committedAgg || !paidAgg) return []

    const isFn = grouping === 'fn'
    const depth: 2 | 4 = detailLevel === 'chapter' ? 2 : 4

    const getGroupCode = (n: { functional_code: string; economic_code: string | null }) => {
      const raw = isFn ? n.functional_code : (n.economic_code ?? '')
      return getCodeAtDepth(raw, depth)
    }

    const resolveName = (code: string) => {
      if (isFn) return getClassificationName(code)
      if (depth === 2) return getEconomicChapterName(code)
      return getEconomicSubchapterName(code)
    }

    const sumByGroup = (nodes: typeof budgetAgg.nodes) => {
      const map = new Map<string, { name: string; amount: number }>()
      for (const n of nodes) {
        const code = getGroupCode(n)
        if (!code) continue
        const existing = map.get(code)
        if (existing) {
          existing.amount += n.amount
        } else {
          const fallbackName = isFn ? n.functional_name : (n.economic_name ?? code)
          map.set(code, { name: resolveName(code) ?? fallbackName, amount: n.amount })
        }
      }
      return map
    }

    const budgetMap = sumByGroup(budgetAgg.nodes)
    const committedMap = sumByGroup(committedAgg.nodes)
    const paidMap = sumByGroup(paidAgg.nodes)

    const allCodes = new Set([...budgetMap.keys(), ...committedMap.keys(), ...paidMap.keys()])
    return Array.from(allCodes).map((code) => ({
      id: code,
      name: budgetMap.get(code)?.name ?? committedMap.get(code)?.name ?? paidMap.get(code)?.name ?? code,
      budget: budgetMap.get(code)?.amount ?? 0,
      committed: committedMap.get(code)?.amount ?? 0,
      paid: paidMap.get(code)?.amount ?? 0,
    }))
  }, [budgetAgg, committedAgg, paidAgg, grouping, detailLevel])

  if (!entity) {
    return null
  }

  // Calculate percentages
  const commitmentPercent =
    totalBudget > 0 ? ((committed / totalBudget) * 100).toFixed(1) : '0'
  const paymentPercent =
    committed > 0 ? ((paid / committed) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      {/* Level 1: KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={t`Total Allocated Budget`}
          value={totalBudget}
          subtitle={t`Final Budget Credits`}
          variant="budget"
          icon="up"
          currency={currency}
          isLoading={isSummaryLoading}
        />
        <StatCard
          title={t`Legal Commitments`}
          value={committed}
          subtitle={`${commitmentPercent}% ${t`of budget contracted`}`}
          variant="committed"
          icon="scale"
          currency={currency}
          isLoading={isSummaryLoading}
        />
        <StatCard
          title={t`Payments Made`}
          value={paid}
          subtitle={`${paymentPercent}% ${t`of commitments paid`}`}
          variant="paid"
          icon="down"
          currency={currency}
          isLoading={isSummaryLoading}
        />
      </div>

      {/* Level 2: Financial Flow Visualization */}
      <section>
        <LinearBudgetFlow
          totalBudget={totalBudget}
          committed={committed}
          paid={paid}
          currency={currency}
          isLoading={isSummaryLoading}
        />
      </section>

      {/* Level 3: Category Breakdown + Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart
          data={categoryData}
          currency={currency}
          isLoading={isCategoryLoading}
        />
        <CommitmentInfoPanel />
      </div>

      {/* Level 4: Detailed Table */}
      <DetailTable
        data={categoryData}
        currency={currency}
        isLoading={isCategoryLoading}
        filter={filter}
        grouping={grouping}
        detailLevel={detailLevel}
        onGroupingChange={onAngajamenteGroupingChange}
      />
    </div>
  )
}
