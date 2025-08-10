import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountCategoryRadioGroup } from './account-type-filter/AccountCategoryRadioGroup'
import { PopulationRadioGroup } from './account-type-filter/PopulationRadioGroup'
import { FilterListContainer } from './base-filter/FilterListContainer'
import { YearFilter } from './year-filter/YearFilter'
import { FunctionalClassificationList } from './functional-classification-filter'
import { EconomicClassificationList } from './economic-classification-filter'
import { FilterRangeContainer } from './base-filter/FilterRangeContainer'
import { AmountRangeFilter } from './amount-range-filter'
import { Calendar, ChartBar, Tags, SlidersHorizontal, MapPinned, Building2, EuroIcon, MapPin, XCircle, ArrowUpDown, Divide, Globe } from 'lucide-react'
import { useMemo } from 'react'
import { useEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'
import type { OptionItem } from './base-filter/interfaces'
import { CountyList } from './county-filter/CountyList'
import { BudgetSectorList } from './budget-sector-filter/BudgetSectorFilter'
import { FundingSourceList } from './funding-source-filter/FundingSourceFilter'
import { UatList } from './uat-filter/UatList'
import { EntityTypeList } from './entity-type-filter/EntityTypeList'
import { EntityList } from './entity-filter/EntityList'
import { useEntityLabel, useUatLabel, useEconomicClassificationLabel, useFunctionalClassificationLabel, useBudgetSectorLabel, useFundingSourceLabel, useEntityTypeLabel } from '@/hooks/filters/useFilterLabels'
import { Button } from '@/components/ui/button'
import { FilterPrefixContainer, PrefixFilter } from './prefix-filter'
import { FilterRadioContainer } from './base-filter/FilterRadioContainer'
import { FilterContainer } from './base-filter/FilterContainer'
import { ReportTypeFilter } from './report-type-filter'
import { IsUatFilter } from './flags-filter'

export function EntityAnalyticsFilter() {
  const { filter, setFilter, resetFilter } = useEntityAnalyticsFilter()

  // Label stores (cache + API-backed)
  const entityLabelsStore = useEntityLabel((filter.entity_cuis ?? []) as string[])
  const uatLabelsStore = useUatLabel((filter.uat_ids ?? []).map((id) => String(id)))
  const economicLabelsStore = useEconomicClassificationLabel(filter.economic_codes ?? [])
  const functionalLabelsStore = useFunctionalClassificationLabel(filter.functional_codes ?? [])
  const budgetSectorLabelsStore = useBudgetSectorLabel(filter.budget_sector_ids ?? [])
  const fundingSourceLabelsStore = useFundingSourceLabel(filter.funding_source_ids ?? [])
  const entityTypeLabelsStore = useEntityTypeLabel()

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
    () => (filter.county_codes ?? []).map((c) => ({ id: c, label: String(c) })),
    [filter.county_codes],
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
  const updateMinAmount = (minAmount: string | undefined) => setFilter({ item_min_amount: minAmount ? Number(minAmount) : undefined })
  const updateMaxAmount = (maxAmount: string | undefined) => setFilter({ item_max_amount: maxAmount ? Number(maxAmount) : undefined })
  const updateMinPopulation = (min: string | undefined) => setFilter({ min_population: min ? Number(min) : undefined })
  const updateMaxPopulation = (max: string | undefined) => setFilter({ max_population: max ? Number(max) : undefined })
  const setReportType = (value: string | undefined) => setFilter({ report_types: value ? [value] : undefined })
  const setIsUat = (value: boolean | undefined) => setFilter({ is_uat: value })

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
    (filter.item_min_amount !== undefined ? 1 : 0) +
    (filter.item_max_amount !== undefined ? 1 : 0) +
    (filter.min_population !== undefined ? 1 : 0) +
    (filter.max_population !== undefined ? 1 : 0) +
    ((filter.report_types?.length ?? 0) > 0 ? 1 : 0) +
    (filter.is_uat !== undefined ? 1 : 0) +
    (filter.functional_prefixes?.length ?? 0) +
    (filter.economic_prefixes?.length ?? 0)

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

        <FilterRadioContainer
          title="Report Type"
          icon={<ArrowUpDown className="w-4 h-4" />}
          selectedOption={(filter.report_types && filter.report_types[0]) ? { id: filter.report_types[0], label: filter.report_types[0] } : null}
          onClear={() => setReportType(undefined)}
        >
          <ReportTypeFilter reportType={filter.report_types?.[0]} setReportType={setReportType} />
        </FilterRadioContainer>

        <FilterContainer
          title="Is UAT"
          icon={<ArrowUpDown className="w-4 h-4" />}
          selectedOptions={filter.is_uat === undefined ? [] : [{ id: 'isUat', label: filter.is_uat ? 'UAT: Da' : 'UAT: Nu' }]}
          onClearOption={() => setIsUat(undefined)}
          onClearAll={() => setIsUat(undefined)}
        >
          <IsUatFilter isUat={filter.is_uat} setIsUat={setIsUat} />
        </FilterContainer>

        <FilterRangeContainer
          title="Amount Range"
          icon={<SlidersHorizontal className="w-4 h-4" />}
          unit="RON"
          rangeComponent={AmountRangeFilter}
          minValue={filter.item_min_amount}
          onMinValueChange={updateMinAmount}
          maxValue={filter.item_max_amount}
          onMaxValueChange={updateMaxAmount}
        />

        <FilterRangeContainer
          title="Population Range"
          icon={<Globe className="w-4 h-4" />}
          unit="people"
          rangeComponent={AmountRangeFilter}
          minValue={filter.min_population}
          onMinValueChange={updateMinPopulation}
          maxValue={filter.max_population}
          onMaxValueChange={updateMaxPopulation}
          maxValueAllowed={100_000_000}
        />
      </CardContent>
    </Card>
  )
}


