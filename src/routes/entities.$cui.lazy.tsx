import { createLazyFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Info } from 'lucide-react'
import { EntityHeader } from '@/components/entities/EntityHeader'
import { EntityReports } from '@/components/entities/EntityReports'
import { useState, useMemo, useRef } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useHotkeys } from 'react-hotkeys-hook'
import { useEntityViews } from '@/hooks/useEntityViews'
import { useRecentEntities } from '@/hooks/useRecentEntities'
import { TrendsView } from '@/components/entities/views/TrendsView'
import { MapView } from '@/components/entities/views/MapView'
import { Overview } from '@/components/entities/views/Overview'
import { defaultYearRange } from '@/schemas/charts'
import { RankingView } from '@/components/entities/views/RankingView'
import { useEntityMapFilter } from '@/components/entities/hooks/useEntityMapFilter'
import { useEntityDetails } from '@/lib/hooks/useEntityDetails'
import type { EntitySearchSchema } from '@/routes/entities.$cui'
import { Analytics } from '@/lib/analytics'
import { Seo } from '@/lib/seo'
import { buildEntitySeo } from '@/lib/seo-entity'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'

export const Route = createLazyFileRoute('/entities/$cui')({
  component: EntityDetailsPage,
})

function EntityDetailsPage() {
  const { cui } = useParams({ from: '/entities/$cui' })
  const search = useSearch({ from: '/entities/$cui' }) as EntitySearchSchema
  const navigate = useNavigate({ from: '/entities/$cui' })
  const yearSelectorRef = useRef<HTMLButtonElement>(null)

  useHotkeys('mod+;', () => {
    yearSelectorRef.current?.click()
  }, {
    enableOnFormTags: ['INPUT', 'TEXTAREA', 'SELECT'],
  })

  const START_YEAR = defaultYearRange.start
  const END_YEAR = defaultYearRange.end

  const [selectedYear, setSelectedYear] = useState<number>(search.year ?? END_YEAR)
  const [trendMode, setTrendMode] = useState<'absolute' | 'percent'>((search.trend as 'absolute' | 'percent') ?? 'absolute')

  const years = useMemo(() =>
    Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, idx) => END_YEAR - idx),
    [START_YEAR, END_YEAR]
  )

  const { data: entity, isLoading, isError, error } = useEntityDetails(
    cui,
    selectedYear,
    START_YEAR,
    END_YEAR
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
    setSelectedYear(year)
    navigate({
      search: (prev) => ({ ...prev, year }),
      replace: true,
    })
  }

  const handleTrendModeChange = (mode: 'absolute' | 'percent') => {
    setTrendMode(mode)
    navigate({
      search: (prev) => ({ ...prev, trend: mode }),
      replace: true,
    })
    Analytics.capture(Analytics.EVENTS.EntityViewOpened, {
      cui,
      view: search.view ?? 'overview',
      trend_mode: mode,
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

  const renderContent = () => {
    const activeView = search.view ?? 'overview'

    switch (activeView) {
      case 'overview':
        return <Overview
          entity={entity ?? undefined}
          isLoading={isLoading}
          selectedYear={selectedYear}
          trendMode={trendMode} years={years}
          search={search}
          onChartTrendModeChange={handleTrendModeChange}
          onYearChange={handleYearChange}
          onSearchChange={handleSearchChange}
          onAnalyticsChange={handleAnalyticsChange}
        />
      case 'reports':
        return <EntityReports reports={entity?.reports ?? null} isLoading={isLoading} />
      case 'expense-trends':
        return <TrendsView entity={entity ?? undefined} type="expense" isLoading={isLoading} currentYear={selectedYear} onYearClick={handleYearChange} initialExpenseSearch={search.expenseSearch} initialIncomeSearch={search.incomeSearch} onSearchChange={handleSearchChange} />
      case 'income-trends':
        return <TrendsView entity={entity ?? undefined} type="income" isLoading={isLoading} currentYear={selectedYear} onYearClick={handleYearChange} initialIncomeSearch={search.incomeSearch} initialExpenseSearch={search.expenseSearch} onSearchChange={handleSearchChange} />
      case 'map':
        return <MapView
          entity={entity ?? null}
          mapFilters={mapFilters}
          updateMapFilters={updateMapFilters}
          selectedYear={selectedYear}
          years={years}
          onYearChange={handleYearChange}
        />
      case 'ranking':
        return <RankingView />
      default:
        return <Overview
          entity={entity ?? undefined}
          isLoading={isLoading}
          selectedYear={selectedYear}
          trendMode={trendMode}
          years={years}
          search={search}
          onChartTrendModeChange={handleTrendModeChange}
          onYearChange={handleYearChange}
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
          className="md:sticky top-0 z-30"
          entity={entity ? { ...entity, is_uat: !!entity.is_uat } : undefined}
          isLoading={isLoading}
          views={views}
          activeView={search.view ?? 'overview'}
          yearSelector={
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:inline"><Trans>Reporting Year:</Trans></span>
              <Select value={selectedYear.toString()} onValueChange={(val) => handleYearChange(parseInt(val, 10))}>
                <SelectTrigger
                  ref={yearSelectorRef}
                  aria-label={t`Reporting year`}
                  className="h-7 sm:h-9 w-[4.5rem] sm:w-[5rem] px-2 border-none shadow-none font-bold text-sm sm:text-base"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />

        {renderContent()}
      </div>
    </div>
  )
}

