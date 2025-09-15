import { createLazyFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Info } from 'lucide-react'
import { EntityHeader } from '@/components/entities/EntityHeader'
import { EntityReports } from '@/components/entities/EntityReports'
import { useMemo, useRef } from 'react'
import { ResponsivePopover } from '@/components/ui/ResponsivePopover'
import { Button } from '@/components/ui/button'
import { EntityReportControls } from '@/components/entities/EntityReportControls'
import { EntityReportLabel } from '@/components/entities/EntityReportLabel'
import type { ReportPeriodInput, TMonth, TQuarter } from '@/schemas/reporting'
import { getInitialFilterState, makeTrendPeriod } from '@/schemas/reporting'
import { useHotkeys } from 'react-hotkeys-hook'
import { useEntityViews } from '@/hooks/useEntityViews'
import { useRecentEntities } from '@/hooks/useRecentEntities'
import { TrendsView } from '@/components/entities/views/TrendsView'
import { lazy, Suspense } from 'react'
const EmployeesView = lazy(() => import('@/components/entities/views/EmployeesView').then(m => ({ default: m.EmployeesView })))
import { MapView } from '@/components/entities/views/MapView'
import { Overview } from '@/components/entities/views/Overview'
import { defaultYearRange } from '@/schemas/charts'
import { RankingView } from '@/components/entities/views/RankingView'
import { RelatedChartsView } from '@/components/entities/views/RelatedChartsView'
import { useEntityMapFilter } from '@/components/entities/hooks/useEntityMapFilter'
import { useEntityDetails } from '@/lib/hooks/useEntityDetails'
import { Analytics } from '@/lib/analytics'
import { Seo } from '@/lib/seo'
import { buildEntitySeo } from '@/lib/seo-entity'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Normalization } from '@/schemas/charts'
import { EntityRelationships } from '@/components/entities/EntityRelationships'

export const Route = createLazyFileRoute('/entities/$cui')({
  component: EntityDetailsPage,
})

function EntityDetailsPage() {
  const { cui } = useParams({ from: '/entities/$cui' })
  const search = useSearch({ from: '/entities/$cui' })
  const navigate = useNavigate({ from: '/entities/$cui' })
  const yearSelectorRef = useRef<HTMLButtonElement>(null)


  useHotkeys('mod+;', () => {
    yearSelectorRef.current?.click()
  }, {
    enableOnFormTags: ['INPUT', 'TEXTAREA', 'SELECT'],
  })

  const START_YEAR = defaultYearRange.start
  const END_YEAR = defaultYearRange.end

  // Derive all state from URL search params for a single source of truth.
  const selectedYear = search.year ?? END_YEAR
  const normalization = search.normalization ?? 'total'
  const reportTypeState = search.report_type
  const mainCreditorState = (search.main_creditor_cui as 'ALL' | string | undefined) ?? 'ALL'

  // Build current report period input from URL state
  const reportPeriod = getInitialFilterState(search.period ?? 'YEAR', selectedYear, search.month ?? '12', search.quarter ?? 'Q4')

  const years = useMemo(() =>
    Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, idx) => END_YEAR - idx),
    [START_YEAR, END_YEAR]
  )

  const trendPeriod = makeTrendPeriod(search.period ?? 'YEAR', selectedYear, START_YEAR, END_YEAR)

  const { data: entity, isLoading, isError, error } = useEntityDetails(
    cui,
    normalization,
    reportPeriod,
    reportTypeState ?? undefined,
    trendPeriod
  )

  useRecentEntities(entity)
  const { mapFilters, updateMapFilters } = useEntityMapFilter({ year: selectedYear })
  const views = useEntityViews(entity)

  const handleSearchChange = (type: 'expense' | 'income', value: string) => {
    const key = type + 'Search'
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value || undefined,
      }),
      replace: true,
    })
  }

  const handleAnalyticsChange = (
    key: 'analyticsChartType' | 'analyticsDataType',
    value: 'bar' | 'pie' | 'income' | 'expense'
  ) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value,
      }),
      replace: true,
    })
  }

  const handleYearChange = (year: number) => {
    navigate({
      search: (prev) => ({ ...prev, year }),
      replace: true,
    })
  }

  // Update URL search for report/period controls with partial options
  const updateReportPeriodInSearch = (patch: {
    period?: ReportPeriodInput['type']
    year?: number
    month?: string
    quarter?: string
    report_type?: 'PRINCIPAL_AGGREGATED' | 'SECONDARY_AGGREGATED' | 'DETAILED'
    main_creditor_cui?: 'ALL' | string
  }) => {
    navigate({
      search: (prev) => {
        const nextPeriod = patch.period ?? (prev.period ?? 'YEAR')
        const nextYear = patch.year ?? (prev.year ?? END_YEAR)
        const nextMonth = patch.month ?? (prev.month ?? '12')
        const nextQuarter = patch.quarter ?? (prev.quarter ?? 'Q4')

        const nextReportType = Object.prototype.hasOwnProperty.call(patch, 'report_type') ? patch.report_type : prev.report_type
        const nextMainCreditor = Object.prototype.hasOwnProperty.call(patch, 'main_creditor_cui') ? patch.main_creditor_cui : prev.main_creditor_cui

        return {
          ...prev,
          period: nextPeriod,
          year: nextYear,
          month: nextPeriod === 'MONTH' ? nextMonth : undefined,
          quarter: nextPeriod === 'QUARTER' ? nextQuarter : undefined,
          report_type: nextReportType ?? undefined,
          main_creditor_cui: nextMainCreditor ?? undefined,
        }
      },
      replace: true,
    })
  }

  const handleReportControlsChange = (payload: { report_period: ReportPeriodInput; report_type?: 'PRINCIPAL_AGGREGATED' | 'SECONDARY_AGGREGATED' | 'DETAILED'; main_creditor_cui?: 'ALL' | string }) => {
    const ym = payload.report_period.selection.interval?.start
    const type = payload.report_period.type

    const patch: {
      period?: ReportPeriodInput['type']
      year?: number
      month?: string
      quarter?: string
      report_type?: 'PRINCIPAL_AGGREGATED' | 'SECONDARY_AGGREGATED' | 'DETAILED'
      main_creditor_cui?: 'ALL' | string
    } = {
      period: type,
    }

    if (ym) {
      const y = Number(ym.slice(0, 4))
      if (!Number.isNaN(y)) patch.year = y
      if (type === 'MONTH') patch.month = ym.split('-')[1]
      if (type === 'QUARTER') patch.quarter = ym.split('-')[1]
    }

    if (payload.report_type) patch.report_type = payload.report_type
    if (payload.main_creditor_cui) patch.main_creditor_cui = payload.main_creditor_cui

    updateReportPeriodInSearch(patch)
  }

  const handleNormalizationChange = (norm: Normalization) => {
    navigate({
      search: (prev) => ({
        ...prev,
        normalization: norm,
      }),
      replace: true,
    })
    Analytics.capture(Analytics.EVENTS.EntityViewOpened, {
      cui,
      view: search.view ?? 'overview',
      normalization: norm,
    })
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
        <Seo title={t`Entity ${cui} – Not found`} description={t`No data found for CUI ${cui}.`} noindex />
        <Alert variant="destructive" className="max-w-lg w-full bg-red-50 dark:bg-red-900 border-red-500 dark:border-red-700">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-700 dark:text-red-300"><Trans>Error Fetching Entity Details</Trans></AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">
            <Trans>There was a problem fetching the details for CUI: <strong>{cui}</strong>.</Trans>
            {error && <p className="mt-2 text-sm"><Trans>Details:</Trans> {error.message}</p>}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isLoading && !entity) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
        <Seo title={t`Entity ${cui} – Not found`} description={t`No data found for CUI ${cui}.`} noindex />
        <Alert className="max-w-lg w-full bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-700">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300"><Trans>No Data Found</Trans></AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-400">
            <Trans>No entity details found for CUI: <strong>{cui}</strong>. It's possible this entity does not exist or has no associated data.</Trans>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handlePeriodItemSelect = (label: string) => {
    const period = (search.period ?? 'YEAR') as 'YEAR' | 'QUARTER' | 'MONTH'
    if (period === 'QUARTER') {
      updateReportPeriodInSearch({ quarter: label })
    } else if (period === 'MONTH') {
      updateReportPeriodInSearch({ month: label })
    }
  }

  const renderContent = () => {
    const activeView = search.view ?? 'overview'

    switch (activeView) {
      case 'reports':
        return <EntityReports reports={entity?.reports ?? null} isLoading={isLoading} />
      case 'expense-trends':
        return <TrendsView entity={entity ?? undefined} type="expense" isLoading={isLoading} currentYear={selectedYear} onYearClick={handleYearChange} initialExpenseSearch={search.expenseSearch} initialIncomeSearch={search.incomeSearch} onSearchChange={handleSearchChange} normalization={normalization} onNormalizationChange={handleNormalizationChange} />
      case 'income-trends':
        return <TrendsView entity={entity ?? undefined} type="income" isLoading={isLoading} currentYear={selectedYear} onYearClick={handleYearChange} initialIncomeSearch={search.incomeSearch} initialExpenseSearch={search.expenseSearch} onSearchChange={handleSearchChange} normalization={normalization} onNormalizationChange={handleNormalizationChange} />
      case 'map':
        return <MapView
          entity={entity ?? null}
          mapFilters={mapFilters}
          updateMapFilters={updateMapFilters}
          selectedYear={selectedYear}
          years={years}
          onYearChange={handleYearChange}
        />
      case 'employees':
        return (
          <Suspense fallback={<></>}>
            <EmployeesView entity={entity ?? null} />
          </Suspense>
        )
      case 'ranking':
        return <RankingView />
      case 'related-charts':
        return <RelatedChartsView entity={entity ?? undefined} normalization={normalization} />
      case 'relationships':
        return <EntityRelationships parents={entity?.parents ?? []} children={entity?.children ?? []} />
      case 'overview':
      default:
        return <Overview
          entity={entity ?? undefined}
          isLoading={isLoading}
          selectedYear={selectedYear}
          normalization={normalization}
          years={years}
          periodType={search.period ?? 'YEAR'}
          search={search}
          onChartNormalizationChange={handleNormalizationChange}
          onYearChange={handleYearChange}
          onPeriodItemSelect={handlePeriodItemSelect}
          onSearchChange={handleSearchChange}
          onAnalyticsChange={handleAnalyticsChange}
        />
    }
  }

  const { title: metaTitle, description: metaDescription } = buildEntitySeo(entity ?? null, cui, selectedYear)

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Seo title={metaTitle} description={metaDescription} type="article" />
      <div className="container mx-auto max-w-7xl space-y-8">
        <EntityHeader
          className="max-w-xl sm:max-w-none"
          entity={entity ? { ...entity, is_uat: !!entity.is_uat } : undefined}
          isLoading={isLoading}
          views={views}
          activeView={search.view ?? 'overview'}
          yearSelector={
            <ResponsivePopover
              trigger={
                <Button
                  variant="outline"
                  ref={yearSelectorRef}
                  aria-label={t`Reporting`}
                  className="rounded-xl border border-slate-300/80 dark:border-slate-800/70 mt-0 mb-auto bg-white/70 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:bg-white/30 px-4 py-2 shadow-sm h-auto min-h-[28px] sm:min-h-[36px] max-w-[85vw] md:max-w-[36rem] text-left"
                >
                  <EntityReportLabel
                    period={reportPeriod}
                    reportType={reportTypeState ?? entity?.default_report_type}
                    mainCreditorLabel={mainCreditorState} />
                </Button>
              }
              content={
                <EntityReportControls
                  entity={entity ?? undefined}
                  periodType={search.period ?? 'YEAR'}
                  year={selectedYear}
                  month={(search.month ?? '12') as TMonth}
                  quarter={(search.quarter ?? 'Q4') as TQuarter}
                  reportType={reportTypeState ?? entity?.default_report_type}
                  mainCreditor={mainCreditorState ?? 'ALL'}
                  onChange={handleReportControlsChange}
                />
              }
              className="p-4 w-md"
              align="end"
              mobileSide="bottom"
              breakpoint={640}
            />
          }
        />

        {renderContent()}
      </div>
    </div>
  )
}