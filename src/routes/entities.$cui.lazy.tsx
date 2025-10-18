import { lazy, Suspense, useMemo, useRef, useCallback, memo, useState, useEffect } from 'react'
import { createLazyFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useHotkeys } from 'react-hotkeys-hook'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ResponsivePopover } from '@/components/ui/ResponsivePopover'
import { EntityHeader } from '@/components/entities/EntityHeader'
import { EntityReportControls } from '@/components/entities/EntityReportControls'
import { EntityReportLabel } from '@/components/entities/EntityReportLabel'
import { ViewLoading } from '@/components/ui/ViewLoading'
import { AlertTriangle, Info } from 'lucide-react'
import { EntityNotificationAnnouncement } from '@/features/notifications/components/EntityNotificationAnnouncement'

import type { GqlReportType, ReportPeriodInput, ReportPeriodType, TMonth, TQuarter } from '@/schemas/reporting'
import { getInitialFilterState, makeTrendPeriod } from '@/schemas/reporting'
import { AnalyticsFilterType, defaultYearRange, type Normalization } from '@/schemas/charts'

import { useEntityViews } from '@/hooks/useEntityViews'
import { useRecentEntities } from '@/hooks/useRecentEntities'
import { useEntityMapFilter } from '@/components/entities/hooks/useEntityMapFilter'
import { useEntityDetails } from '@/lib/hooks/useEntityDetails'

import { Analytics } from '@/lib/analytics'
import { Seo } from '@/lib/seo'
import { buildEntitySeo } from '@/lib/seo-entity'
import { Overview } from '@/components/entities/views/Overview'
import { EntityDetailsData } from '@/lib/api/entities'
import { usePersistedState } from '@/lib/hooks/usePersistedState'
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback'
import { queryClient } from '@/lib/queryClient'
import { entityDetailsQueryOptions } from '@/lib/hooks/useEntityDetails'
import { FloatingQuickNav } from '@/components/ui/FloatingQuickNav'

const TrendsView = lazy(() => import('@/components/entities/views/TrendsView').then(m => ({ default: m.TrendsView })))
const EmployeesView = lazy(() => import('@/components/entities/views/EmployeesView').then(m => ({ default: m.EmployeesView })))
const MapView = lazy(() => import('@/components/entities/views/MapView').then(m => ({ default: m.MapView })))
const RankingView = lazy(() => import('@/components/entities/views/RankingView').then(m => ({ default: m.RankingView })))
const RelatedChartsView = lazy(() => import('@/components/entities/views/RelatedChartsView').then(m => ({ default: m.RelatedChartsView })))
const EntityReports = lazy(() => import('@/components/entities/EntityReports'))
const EntityRelationships = lazy(() => import('@/components/entities/EntityRelationships').then(m => ({ default: m.EntityRelationships })))


export const Route = createLazyFileRoute('/entities/$cui')({
  component: EntityDetailsPage,
})


const { start: START_YEAR, end: END_YEAR } = defaultYearRange
const DEFAULT_PERIOD = 'YEAR'
const DEFAULT_MONTH = '01'
const DEFAULT_QUARTER = 'Q1'

function EntityDetailsPage() {
  const { cui } = useParams({ from: '/entities/$cui' })
  const search = useSearch({ from: '/entities/$cui' })
  const navigate = useNavigate({ from: '/entities/$cui' })
  const yearSelectorRef = useRef<HTMLButtonElement>(null)
  const [userCurrency] = usePersistedState<'RON' | 'EUR'>('user-currency', 'RON')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useHotkeys('mod+;', () => yearSelectorRef.current?.click(), {
    enableOnFormTags: ['INPUT', 'TEXTAREA', 'SELECT'],
  })

  const selectedYear = search.year ?? END_YEAR
  const period = search.period ?? DEFAULT_PERIOD
  const month = search.month ?? DEFAULT_MONTH
  const quarter = search.quarter ?? DEFAULT_QUARTER
  const reportTypeState = search.report_type
  const mainCreditorState = search.main_creditor_cui
  const activeView = search.view ?? 'overview'
  const lineItemsTab = search.lineItemsTab as 'functional' | 'funding' | 'expenseType' | undefined
  const selectedFundingKey = search.selectedFundingKey as string | undefined
  const selectedExpenseTypeKey = search.selectedExpenseTypeKey as string | undefined
  const defaultUserNormalization = userCurrency === 'EUR' ? 'total_euro' : 'total'
  const normalization = search.normalization ?? defaultUserNormalization
  const treemapPrimary = search.treemapPrimary as 'fn' | 'ec' | undefined
  const accountCategory = search.accountCategory as 'ch' | 'vn' | undefined

  const reportPeriod = useMemo(() => getInitialFilterState(period, selectedYear, month, quarter), [period, selectedYear, month, quarter])
  const trendPeriod = useMemo(() => makeTrendPeriod(period, selectedYear, START_YEAR, END_YEAR), [period, selectedYear])
  const years = useMemo(() => Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, idx) => END_YEAR - idx), [])

  const { data: entity, isLoading, isError, error } = useEntityDetails({
    cui,
    normalization,
    reportPeriod,
    reportType: reportTypeState,
    trendPeriod,
    mainCreditorCui: mainCreditorState,
  })

  useRecentEntities(entity)
  const { mapFilters, updateMapFilters } = useEntityMapFilter({ year: selectedYear, userCurrency })
  const views = useEntityViews(entity)

  const debouncedPrefetch = useDebouncedCallback(
    (payload: { report_period: ReportPeriodInput; report_type?: GqlReportType; main_creditor_cui?: string; normalization?: Normalization }) => {
      const { report_period, report_type, normalization: norm } = payload;
      const startAnchor = report_period.selection.interval?.start || '' as string;
      const hoveredYear = Number(String(startAnchor).slice(0, 4)) || selectedYear;
      const nextTrend = makeTrendPeriod(report_period.type, hoveredYear, START_YEAR, END_YEAR);
      queryClient.prefetchQuery(
        entityDetailsQueryOptions(
          cui,
          norm ?? normalization,
          report_period,
          report_type,
          nextTrend,
          payload.main_creditor_cui ?? mainCreditorState,
        )
      );
    },
    100
  );

  const updateSearch = useCallback((newSearch: Record<string, any>) => {
    navigate({ search: (prev) => ({ ...prev, ...newSearch }), replace: true, resetScroll: false })
  }, [navigate])

  useEffect(() => {
    if (userCurrency === 'EUR' && normalization !== 'total_euro' && normalization !== 'per_capita_euro') {
      updateSearch({ normalization: 'total_euro' })
    } else if (userCurrency === 'RON' && normalization !== 'total' && normalization !== 'per_capita') {
      updateSearch({ normalization: 'total' })
    }
  }, [userCurrency, normalization, updateSearch])

  const handleYearChange = useCallback((year: number) => updateSearch({ year }), [updateSearch])

  const handleSearchChange = useCallback((type: 'expense' | 'income', value: string) => {
    updateSearch({ [`${type}Search`]: value || undefined })
  }, [updateSearch])

  const handleLineItemsTabChange = useCallback((tab: 'functional' | 'funding' | 'expenseType') => {
    updateSearch({ lineItemsTab: tab })
  }, [updateSearch])

  const handleSelectedFundingKeyChange = useCallback((key: string) => {
    updateSearch({ selectedFundingKey: key || undefined })
  }, [updateSearch])

  const handleSelectedExpenseTypeKeyChange = useCallback((key: string) => {
    updateSearch({ selectedExpenseTypeKey: key || undefined })
  }, [updateSearch])

  const handleAnalyticsChange = useCallback((key: 'analyticsChartType' | 'analyticsDataType', value: string) => {
    updateSearch({ [key]: value })
  }, [updateSearch])

  const handlePeriodItemSelect = useCallback((label: string) => {
    if (period === 'QUARTER') updateSearch({ quarter: label })
    else if (period === 'MONTH') updateSearch({ month: label })
  }, [period, updateSearch])

  const handleTreemapPrimaryChange = useCallback((primary: 'fn' | 'ec') => {
    updateSearch({ treemapPrimary: primary })
  }, [updateSearch])

  const handleAccountCategoryChange = useCallback((category: 'ch' | 'vn') => {
    updateSearch({ accountCategory: category })
  }, [updateSearch])

  const handleNormalizationChange = useCallback((norm: Normalization) => {
    updateSearch({ normalization: norm })
    Analytics.capture(Analytics.EVENTS.EntityViewOpened, { cui, view: activeView, normalization: norm })
  }, [updateSearch, cui, activeView])

  const updateReportPeriodInSearch = useCallback((patch: Record<string, any>) => {
    navigate({
      search: (prev) => {
        const nextState = { ...prev, ...patch }
        const nextPeriod = nextState.period

        return {
          ...nextState,
          month: nextPeriod === 'MONTH' ? nextState.month : undefined,
          quarter: nextPeriod === 'QUARTER' ? nextState.quarter : undefined,
          report_type: 'report_type' in patch ? patch.report_type : prev.report_type,
          main_creditor_cui: 'main_creditor_cui' in patch ? patch.main_creditor_cui : prev.main_creditor_cui,
        }
      },
      replace: true,
      resetScroll: false,
    })
  }, [navigate])

  const handleReportControlsChange = useCallback((payload: { report_period: ReportPeriodInput;[key: string]: any }) => {
    const { report_period, ...restPayload } = payload
    const patch: Record<string, any> = { period: report_period.type, ...restPayload }
    const intervalDate = report_period.selection.interval?.start

    if (intervalDate) {
      patch.year = Number(intervalDate.slice(0, 4))
      if (report_period.type === 'MONTH') patch.month = intervalDate.split('-')[1]
      if (report_period.type === 'QUARTER') patch.quarter = intervalDate.split('-')[1]
    }
    updateReportPeriodInSearch(patch)
  }, [updateReportPeriodInSearch])


  // Prepare filter input for FloatingQuickNav
  const filterInput: AnalyticsFilterType = useMemo(() => ({
    entity_cuis: [cui],
    report_period: reportPeriod,
    account_category: accountCategory ?? 'ch',
    normalization: normalization,
  }), [cui, reportPeriod, accountCategory, normalization])

  // Determine mapViewType based on entity type
  const mapViewType = useMemo<'UAT' | 'County'>(() => {
    if (entity?.entity_type === 'admin_county_council') return 'County'
    if (entity?.is_uat) return 'UAT'
    return 'UAT'
  }, [entity?.entity_type, entity?.is_uat])


  if (isError) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center items-center p-4">
        <Seo title={t`Entity ${cui} – Not found`} description={t`Error loading data for CUI ${cui}.`} noindex />
        <Alert variant="destructive" className="max-w-lg w-full">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle><Trans>Error Fetching Entity Details</Trans></AlertTitle>
          <AlertDescription>
            <Trans>There was a problem fetching the details for CUI: <strong>{cui}</strong>.</Trans>
            {error && <p className="mt-2 text-sm"><Trans>Details:</Trans> {error.message}</p>}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!entity && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center items-center p-4">
        <Seo title={t`Entity ${cui} – Not found`} description={t`No data found for CUI ${cui}.`} noindex />
        <Alert className="max-w-lg w-full">
          <Info className="h-5 w-5" />
          <AlertTitle><Trans>No Data Found</Trans></AlertTitle>
          <AlertDescription>
            <Trans>No entity details found for CUI: <strong>{cui}</strong>. It's possible this entity does not exist or has no associated data.</Trans>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { title: metaTitle, description: metaDescription } = buildEntitySeo(entity, cui, selectedYear)

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <Seo title={metaTitle} description={metaDescription} type="article" />
      <EntityNotificationAnnouncement />
      <FloatingQuickNav
        mapViewType={mapViewType}
        mapActive
        chartActive
        tableActive
        filterInput={filterInput}
      />
      <div className="container mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
        <EntityHeader
          entity={entity}
          isLoading={isLoading}
          views={views}
          activeView={activeView}
          yearSelector={
            <ResponsivePopover
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              trigger={
                <Button variant="outline" ref={yearSelectorRef} aria-label={t`Reporting period`} className="rounded-xl px-4 py-2 shadow-sm h-auto text-left">
                  <EntityReportLabel period={reportPeriod} reportType={reportTypeState ?? entity?.default_report_type} mainCreditorLabel={mainCreditorState} />
                </Button>
              }
              content={
                <EntityReportControls
                  entity={entity}
                  periodType={period}
                  year={selectedYear}
                  month={month as TMonth}
                  quarter={quarter as TQuarter}
                  reportType={reportTypeState ?? entity?.default_report_type}
                  mainCreditor={String(mainCreditorState)}
                  normalization={normalization}
                  onChange={handleReportControlsChange}
                  onPrefetch={debouncedPrefetch}
                />
              }
              className="p-4 w-md"
              align="end"
              mobileSide="bottom"
            />
          }
        />
        <MemoizedViewsContent
          cui={cui}
          entity={entity}
          isLoading={isLoading}
          activeView={activeView}
          selectedYear={selectedYear}
          normalization={normalization}
          years={years}
          period={period}
          reportPeriod={reportPeriod}
          trendPeriod={trendPeriod}
          reportTypeState={reportTypeState}
          mainCreditorCui={mainCreditorState}
          search={search}
          mapFilters={mapFilters}
          updateMapFilters={updateMapFilters}
          handleYearChange={handleYearChange}
          handleSearchChange={handleSearchChange}
          handleNormalizationChange={handleNormalizationChange}
          handlePeriodItemSelect={handlePeriodItemSelect}
          handleAnalyticsChange={handleAnalyticsChange}
          lineItemsTab={lineItemsTab ?? 'functional'}
          handleLineItemsTabChange={handleLineItemsTabChange}
          selectedFundingKey={selectedFundingKey ?? ''}
          selectedExpenseTypeKey={selectedExpenseTypeKey ?? ''}
          handleSelectedFundingKeyChange={handleSelectedFundingKeyChange}
          handleSelectedExpenseTypeKeyChange={handleSelectedExpenseTypeKeyChange}
          treemapPrimary={treemapPrimary}
          accountCategory={accountCategory}
          handleTreemapPrimaryChange={handleTreemapPrimaryChange}
          handleAccountCategoryChange={handleAccountCategoryChange}
        />
      </div>
    </div>
  )
}


interface ViewsContentProps {
  cui: string;
  entity: EntityDetailsData | null | undefined;
  isLoading: boolean;
  activeView: string;
  selectedYear: number;
  normalization: Normalization;
  years: number[];
  period: ReportPeriodType;
  reportPeriod: ReportPeriodInput;
  trendPeriod: ReportPeriodInput;
  reportTypeState?: GqlReportType;
  mainCreditorCui?: string;
  search: { expenseSearch?: string, incomeSearch?: string, [key: string]: any };
  mapFilters: AnalyticsFilterType;
  updateMapFilters: (update: Partial<AnalyticsFilterType>) => void;
  handleYearChange: (year: number) => void;
  handleSearchChange: (type: 'expense' | 'income', value: string) => void;
  handleNormalizationChange: (norm: Normalization) => void;
  handlePeriodItemSelect: (label: string) => void;
  handleAnalyticsChange: (key: 'analyticsChartType' | 'analyticsDataType', value: string) => void;
  lineItemsTab: 'functional' | 'funding' | 'expenseType';
  handleLineItemsTabChange: (tab: 'functional' | 'funding' | 'expenseType') => void;
  selectedFundingKey?: string;
  selectedExpenseTypeKey?: string;
  handleSelectedFundingKeyChange: (key: string) => void;
  handleSelectedExpenseTypeKeyChange: (key: string) => void;
  treemapPrimary?: 'fn' | 'ec';
  accountCategory?: 'ch' | 'vn';
  handleTreemapPrimaryChange: (primary: 'fn' | 'ec') => void;
  handleAccountCategoryChange: (category: 'ch' | 'vn') => void;
}

function ViewsContent(props: ViewsContentProps) {
  const {
    cui, entity, activeView, selectedYear, normalization, years, period, reportPeriod, trendPeriod,
    reportTypeState, search, mapFilters, updateMapFilters, handleYearChange, mainCreditorCui,
    handleSearchChange, handleNormalizationChange, handlePeriodItemSelect, handleAnalyticsChange,
    lineItemsTab, handleLineItemsTabChange,
    selectedFundingKey, selectedExpenseTypeKey, handleSelectedFundingKeyChange, handleSelectedExpenseTypeKeyChange,
    isLoading, treemapPrimary, accountCategory, handleTreemapPrimaryChange, handleAccountCategoryChange,
  } = props;

  const trendsViewProps = {
    entity,
    isLoading: isLoading,
    currentYear: selectedYear,
    onYearClick: handleYearChange,
    initialExpenseSearch: search.expenseSearch,
    initialIncomeSearch: search.incomeSearch,
    onSearchChange: handleSearchChange,
    normalization,
    onNormalizationChange: handleNormalizationChange,
    reportPeriod,
    trendPeriod,
    reportType: reportTypeState ?? entity?.default_report_type,
    onSelectPeriod: handlePeriodItemSelect,
    years,
    lineItemsTab: lineItemsTab ?? 'functional',
    onLineItemsTabChange: handleLineItemsTabChange,
    selectedFundingKey: selectedFundingKey ?? '',
    selectedExpenseTypeKey: selectedExpenseTypeKey ?? '',
    onSelectedFundingKeyChange: handleSelectedFundingKeyChange,
    onSelectedExpenseTypeKeyChange: handleSelectedExpenseTypeKeyChange,
  }

  return (
    <Suspense fallback={<ViewLoading />}>
      {(() => {
        switch (activeView) {
          case 'reports': return <EntityReports cui={cui} initialType={reportTypeState ?? entity?.default_report_type} />
          case 'expense-trends': return <TrendsView {...trendsViewProps} type="expense" treemapPrimary={treemapPrimary} onTreemapPrimaryChange={handleTreemapPrimaryChange} />
          case 'income-trends': return <TrendsView {...trendsViewProps} type="income" treemapPrimary={treemapPrimary} onTreemapPrimaryChange={handleTreemapPrimaryChange} />
          case 'map': return <MapView entity={entity} mapFilters={mapFilters} updateMapFilters={updateMapFilters} period={reportPeriod} />
          case 'employees': return <EmployeesView entity={entity} />
          case 'ranking': return <RankingView />
          case 'related-charts': return <RelatedChartsView entity={entity} normalization={normalization} />
          case 'relationships': return <EntityRelationships cui={cui} />
          default: return <Overview cui={cui} entity={entity} isLoading={isLoading} selectedYear={selectedYear} normalization={normalization} years={years} periodType={period} reportPeriod={reportPeriod} reportType={reportTypeState} mainCreditorCui={mainCreditorCui} search={search} onChartNormalizationChange={handleNormalizationChange} onYearChange={handleYearChange} onPeriodItemSelect={handlePeriodItemSelect} onSearchChange={handleSearchChange} onAnalyticsChange={handleAnalyticsChange} onLineItemsTabChange={handleLineItemsTabChange} onSelectedFundingKeyChange={handleSelectedFundingKeyChange} onSelectedExpenseTypeKeyChange={handleSelectedExpenseTypeKeyChange} treemapPrimary={treemapPrimary} accountCategory={accountCategory} onTreemapPrimaryChange={handleTreemapPrimaryChange} onAccountCategoryChange={handleAccountCategoryChange} />
        }
      })()}
    </Suspense>
  )
}

const MemoizedViewsContent = memo(ViewsContent);
