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
  useAngajamenteByFunctional,
} from '@/hooks/useAngajamenteData'
import {
  StatCard,
  LinearBudgetFlow,
  CategoryChart,
  CommitmentInfoPanel,
  DetailTable,
  type CategoryData,
} from '@/components/angajamente'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'

type Props = {
  readonly entity: EntityDetailsData | null | undefined
  readonly currentYear: number
  readonly currency?: 'RON' | 'EUR' | 'USD'
}

export function AngajamenteView({
  entity,
  currentYear,
  currency = 'RON',
}: Props) {
  const cui = entity?.cui ?? ''

  // Fetch data
  const { data: summary, isLoading: isSummaryLoading } = useAngajamenteSummary(
    cui,
    currentYear,
    { enabled: !!cui }
  )

  const { data: functionalBreakdown, isLoading: isFunctionalLoading } =
    useAngajamenteByFunctional(cui, currentYear, { enabled: !!cui })

  // Transform functional breakdown to CategoryData format
  const categoryData = useMemo<CategoryData[]>(() => {
    if (!functionalBreakdown) return []
    return functionalBreakdown.map((fb) => ({
      id: fb.functionalCode,
      name: fb.functionalName,
      budget: fb.totalCredite,
      committed: fb.totalAngajamente,
      paid: fb.totalPlati,
    }))
  }, [functionalBreakdown])

  if (!entity) {
    return null
  }

  // Calculate derived values for display
  // TODO: Remove mock data after testing - use real API data
  const USE_MOCK_DATA = true // Set to false to use real API data

  const totalBudget = USE_MOCK_DATA
    ? 916_340_000 // 916.34 mil RON
    : (summary?.totalCrediteButetareDefinitive ?? 0)
  const committed = USE_MOCK_DATA
    ? 785_400_000 // 785.40 mil RON (85.7% of budget - leaves 14.3% Disponibil)
    : (summary?.totalCrediteAngajament ?? 0)
  const paid = USE_MOCK_DATA
    ? 490_780_000 // 490.78 mil RON (62.5% of committed - leaves 37.5% De Plată)
    : (summary?.totalPlati ?? 0)

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700 text-lg">
            <Trans>Financial Flow</Trans>
          </h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
            <Trans>Graphical View</Trans>
          </span>
        </div>
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
          isLoading={isFunctionalLoading}
        />
        <CommitmentInfoPanel />
      </div>

      {/* Level 4: Detailed Table */}
      <DetailTable
        data={categoryData}
        currency={currency}
        isLoading={isFunctionalLoading}
      />
    </div>
  )
}
