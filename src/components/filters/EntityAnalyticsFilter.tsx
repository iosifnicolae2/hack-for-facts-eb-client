import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EntityAnalyticsViewToggle } from './EntityAnalyticsViewToggle'
import { AccountCategoryRadioGroup } from './account-type-filter/AccountCategoryRadioGroup'
import { PopulationRadioGroup } from './account-type-filter/PopulationRadioGroup'
import { FilterListContainer } from './base-filter/FilterListContainer'
import { YearFilter } from './year-filter/YearFilter'
import { FunctionalClassificationList } from './functional-classification-filter'
import { EconomicClassificationList } from './economic-classification-filter'
import { FilterRangeContainer } from './base-filter/FilterRangeContainer'
import { AmountRangeFilter } from './amount-range-filter'
import { Calendar, ChartBar, Tags, SlidersHorizontal, MapPinned, Building2, EuroIcon, MapPin, XCircle, ArrowUpDown, Divide } from 'lucide-react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'
import type { OptionItem } from './base-filter/interfaces'
import { CountyList } from './county-filter/CountyList'
import { BudgetSectorList } from './budget-sector-filter/BudgetSectorFilter'
import { FundingSourceList } from './funding-source-filter/FundingSourceFilter'
import { UatList } from './uat-filter/UatList'
import { EntityTypeList } from './entity-type-filter/EntityTypeList'
import { EntityList } from './entity-filter/EntityList'
import { useEntityLabel, useUatLabel, useEconomicClassificationLabel, useFunctionalClassificationLabel, useBudgetSectorLabel, useFundingSourceLabel, useEntityTypeLabel } from '@/hooks/filters/useFilterLabels'
import { getUniqueCounties } from '@/lib/api/dataDiscovery'
import { Button } from '@/components/ui/button'
import { FilterPrefixContainer, PrefixFilter } from './prefix-filter'

export function EntityAnalyticsFilter() {
  const { filter, setFilter, view, setView, resetFilter } = useEntityAnalyticsFilter()

  // Label stores (cache + API-backed)
  const entityLabelsStore = useEntityLabel((filter.entity_cuis ?? []) as string[])
  const uatLabelsStore = useUatLabel((filter.uat_ids ?? []).map((id) => String(id)))
  const economicLabelsStore = useEconomicClassificationLabel(filter.economic_codes ?? [])
  const functionalLabelsStore = useFunctionalClassificationLabel(filter.functional_codes ?? [])
  const budgetSectorLabelsStore = useBudgetSectorLabel(filter.budget_sector_ids ?? [])
  const fundingSourceLabelsStore = useFundingSourceLabel(filter.funding_source_ids ?? [])
  const entityTypeLabelsStore = useEntityTypeLabel()

  const { data: counties = [] } = useQuery({
    queryKey: ['counties'],
    queryFn: getUniqueCounties,
    staleTime: 1000 * 60 * 60 * 24,
  })
  const countyLabelMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(counties.map((c) => [c.code, `${c.name} (${c.code})`] as const)),
    [counties],
  )

  // Selected options builders
  const selectedYearOptions = useMemo<OptionItem<number>[]>(() => (filter.years ?? []).map((y) => ({ id: y, label: String(y) })), [filter.years])
  const selectedUatOptions = useMemo<OptionItem<string | number>[]>(
    () => (filter.uat_ids ?? []).map((id) => ({ id, label: uatLabelsStore.map(String(id)) })),
    [filter.uat_ids, uatLabelsStore],
  )
  const selectedEntityOptions = useMemo<OptionItem<string>[]>(
    () => (filter.entity_cuis ?? []).map((cui) => ({ id: cui, label: entityLabelsStore.map(cui) })),
    [filter.entity_cuis, entityLabelsStore],
  )
  const selectedCountyOptions = useMemo<OptionItem<string>[]>(
    () => (filter.county_codes ?? (filter.county_code ? [filter.county_code] : [])).map((c) => ({ id: c, label: countyLabelMap[c] ?? String(c) })),
    [filter.county_codes, filter.county_code, countyLabelMap],
  )
  const selectedEntityTypeOptions = useMemo<OptionItem<string>[]>(
    () => (filter.entity_types ?? []).map((id) => ({ id, label: entityTypeLabelsStore.map(id) })),
    [filter.entity_types, entityTypeLabelsStore],
  )
  const selectedFunctionalOptions = useMemo<OptionItem<string>[]>(
    () => (filter.functional_codes ?? []).map((code) => ({ id: code, label: functionalLabelsStore.map(code) })),
    [filter.functional_codes, functionalLabelsStore],
  )
  const selectedEconomicOptions = useMemo<OptionItem<string>[]>(
    () => (filter.economic_codes ?? []).map((code) => ({ id: code, label: economicLabelsStore.map(code) })),
    [filter.economic_codes, economicLabelsStore],
  )
  const selectedBudgetSectorOptions = useMemo<OptionItem<string | number>[]>(
    () => (filter.budget_sector_ids ?? []).map((id) => ({ id, label: budgetSectorLabelsStore.map(id) })),
    [filter.budget_sector_ids, budgetSectorLabelsStore],
  )
  const selectedFundingSourceOptions = useMemo<OptionItem<string | number>[]>(
    () => (filter.funding_source_ids ?? []).map((id) => ({ id, label: fundingSourceLabelsStore.map(id) })),
    [filter.funding_source_ids, fundingSourceLabelsStore],
  )

  // Updaters following LineItemsFilter behavior
  const updateYearOptions = (years: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[])) => {
    const next = typeof years === 'function' ? years(selectedYearOptions) : years
    setFilter({ years: next.map((y) => Number(y.id)) })
  }
  const updateUatOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedUatOptions) : updater
    uatLabelsStore.add(next.map(({ id, label }) => ({ id, label })))
    setFilter({ uat_ids: next.map((o) => String(o.id)) })
  }
  const updateEntityOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedEntityOptions) : updater
    entityLabelsStore.add(next.map(({ id, label }) => ({ id, label })))
    setFilter({ entity_cuis: next.map((o) => String(o.id)) })
  }
  const updateCountyOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedCountyOptions) : updater
    setFilter({ county_codes: next.map((o) => String(o.id)) })
  }
  const updateEntityTypeOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedEntityTypeOptions) : updater
    setFilter({ entity_types: next.map((o) => String(o.id)) })
  }
  const updateFunctionalOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedFunctionalOptions) : updater
    functionalLabelsStore.add(next.map(({ id, label }) => ({ id, label })))
    setFilter({ functional_codes: next.map((o) => String(o.id)) })
  }
  const updateEconomicOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedEconomicOptions) : updater
    economicLabelsStore.add(next.map(({ id, label }) => ({ id, label })))
    setFilter({ economic_codes: next.map((o) => String(o.id)) })
  }
  const updateFunctionalPrefixes = (value: string[] | undefined) => setFilter({ functional_prefixes: value && value.length > 0 ? value : undefined })
  const updateEconomicPrefixes = (value: string[] | undefined) => setFilter({ economic_prefixes: value && value.length > 0 ? value : undefined })
  const updateBudgetSectorOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedBudgetSectorOptions) : updater
    budgetSectorLabelsStore.add(next.map(({ id, label }) => ({ id, label })))
    setFilter({ budget_sector_ids: next.map((o) => String(o.id)) })
  }
  const updateFundingSourceOptions = (
    updater: OptionItem<string | number>[] | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const next = typeof updater === 'function' ? updater(selectedFundingSourceOptions) : updater
    fundingSourceLabelsStore.add(next.map(({ id, label }) => ({ id, label })))
    setFilter({ funding_source_ids: next.map((o) => String(o.id)) })
  }

  const updateAccountCategory = (accountCategory: 'ch' | 'vn') => setFilter({ account_category: accountCategory })
  const updateNormalization = (normalization: 'total' | 'per_capita') => setFilter({ normalization })
  const updateMinAmount = (minAmount: string | undefined) => setFilter({ min_amount: minAmount ? Number(minAmount) : undefined })
  const updateMaxAmount = (maxAmount: string | undefined) => setFilter({ max_amount: maxAmount ? Number(maxAmount) : undefined })

  // Count selected filters similar to LineItemsFilter
  const totalSelectedFilters =
    (filter.years?.length ?? 0) +
    [
      selectedEntityOptions,
      selectedUatOptions,
      selectedCountyOptions,
      selectedEntityTypeOptions,
      selectedFunctionalOptions,
      selectedEconomicOptions,
      selectedBudgetSectorOptions,
      selectedFundingSourceOptions,
    ].reduce((count, options) => count + options.length, 0) +
    (filter.min_amount !== undefined ? 1 : 0) +
    (filter.max_amount !== undefined ? 1 : 0)

  return (
    <Card className="flex flex-col w-full min-h-full overflow-y-auto shadow-lg">
      <CardHeader className="py-4 px-6 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          {totalSelectedFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilter} className="text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              Clear filters ({totalSelectedFilters})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-0 space-y-1">
        <div className="p-3 border-b">
          <h4 className="mb-2 text-sm font-medium flex items-center">
            <ChartBar className="w-4 h-4 mr-2" />
            Data View
          </h4>
          <EntityAnalyticsViewToggle value={view} onChange={setView} />
        </div>

        <div className="p-3 border-b">
          <h4 className="mb-2 text-sm font-medium flex items-center">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Revenues/Expenses
          </h4>
          <AccountCategoryRadioGroup value={filter.account_category} onChange={updateAccountCategory} />
        </div>

        <div className="p-3 border-b">
          <h4 className="mb-2 text-sm font-medium flex items-center">
            <Divide className="w-4 h-4 mr-2" />
            Normalization
          </h4>
          <PopulationRadioGroup value={filter.normalization ?? 'per_capita'} onChange={updateNormalization} />
        </div>

        <FilterListContainer
          title="Year"
          icon={<Calendar className="w-4 h-4" />}
          listComponent={YearFilter}
          selected={selectedYearOptions}
          setSelected={updateYearOptions}
        />

        <FilterListContainer
          title="Entities"
          icon={<Building2 className="w-4 h-4" />}
          listComponent={EntityList}
          selected={selectedEntityOptions}
          setSelected={updateEntityOptions}
        />

        <FilterListContainer
          title="UAT"
          icon={<MapPin className="w-4 h-4" />}
          listComponent={UatList}
          selected={selectedUatOptions}
          setSelected={updateUatOptions}
        />

        <FilterListContainer
          title="County"
          icon={<MapPinned className="w-4 h-4" />}
          listComponent={CountyList}
          selected={selectedCountyOptions}
          setSelected={updateCountyOptions}
        />

        <FilterListContainer
          title="Entity Type"
          icon={<ChartBar className="w-4 h-4" />}
          listComponent={EntityTypeList}
          selected={selectedEntityTypeOptions}
          setSelected={updateEntityTypeOptions}
        />

        <FilterListContainer
          title="Functional Classification"
          icon={<ChartBar className="w-4 h-4" />}
          listComponent={FunctionalClassificationList}
          selected={selectedFunctionalOptions}
          setSelected={updateFunctionalOptions}
        />

        <FilterPrefixContainer
          title="Functional Prefixes"
          icon={<ChartBar className="w-4 h-4" />}
          prefixComponent={PrefixFilter}
          value={filter.functional_prefixes}
          onValueChange={updateFunctionalPrefixes}
        />

        <FilterListContainer
          title="Economic Classification"
          icon={<Tags className="w-4 h-4" />}
          listComponent={EconomicClassificationList}
          selected={selectedEconomicOptions}
          setSelected={updateEconomicOptions}
        />

        <FilterPrefixContainer
          title="Economic Prefixes"
          icon={<Tags className="w-4 h-4" />}
          prefixComponent={PrefixFilter}
          value={filter.economic_prefixes}
          onValueChange={updateEconomicPrefixes}
        />

        <FilterListContainer
          title="Budget Sector"
          icon={<Building2 className="w-4 h-4" />}
          listComponent={BudgetSectorList}
          selected={selectedBudgetSectorOptions}
          setSelected={updateBudgetSectorOptions}
        />

        <FilterListContainer
          title="Funding Source"
          icon={<EuroIcon className="w-4 h-4" />}
          listComponent={FundingSourceList}
          selected={selectedFundingSourceOptions}
          setSelected={updateFundingSourceOptions}
        />

        <FilterRangeContainer
          title="Amount Range"
          icon={<SlidersHorizontal className="w-4 h-4" />}
          unit="RON"
          rangeComponent={AmountRangeFilter}
          minValue={filter.min_amount}
          onMinValueChange={updateMinAmount}
          maxValue={filter.max_amount}
          onMaxValueChange={updateMaxAmount}
        />
      </CardContent>
    </Card>
  )
}


