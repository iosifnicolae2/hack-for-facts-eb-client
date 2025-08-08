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
import { Calendar, ChartBar, Tags, SlidersHorizontal, MapPinned, Building2, EuroIcon, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { useEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'
import type { OptionItem } from './base-filter/interfaces'
import { CountyList } from './county-filter/CountyList'
import { BudgetSectorList } from './budget-sector-filter/BudgetSectorFilter'
import { FundingSourceList } from './funding-source-filter/FundingSourceFilter'
import { UatList } from './uat-filter/UatList'
import { EntityTypeList } from './entity-type-filter/EntityTypeList'
import { Input } from '@/components/ui/input'

export function EntityAnalyticsFilter() {
  const { filter, setFilter, view, setView } = useEntityAnalyticsFilter()

  const selectedYearOptions = useMemo<OptionItem<number>[]>(() => {
    return (filter.years ?? []).map((y) => ({ id: y, label: String(y) }))
  }, [filter.years])

  const updateYearOptions = (
    years:
      | OptionItem<string | number>[]
      | ((prev: OptionItem<string | number>[]) => OptionItem<string | number>[]),
  ) => {
    const newYears = typeof years === 'function' ? years(selectedYearOptions) : years
    setFilter({ years: newYears.map((y) => Number(y.id)) })
  }

  const updateAccountCategory = (accountCategory: 'ch' | 'vn') => {
    setFilter({ account_category: accountCategory })
  }

  const updateNormalization = (normalization: 'total' | 'per_capita') => {
    setFilter({ normalization })
  }

  const updateMinAmount = (minAmount: string | undefined) => {
    setFilter({ min_amount: minAmount ? Number(minAmount) : undefined })
  }

  const updateMaxAmount = (maxAmount: string | undefined) => {
    setFilter({ max_amount: maxAmount ? Number(maxAmount) : undefined })
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
          <CardTitle className="text-xl">Entity Analytics</CardTitle>
          <div className="w-full md:w-auto">
            <EntityAnalyticsViewToggle value={view} onChange={setView} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Compact summary chips row could go here in future */}
        <div className="grid grid-cols-1 gap-3">
        <div className="md:col-span-1 space-y-4">
          <div>
            <Input
              placeholder="Search entities..."
              value={filter.search ?? ''}
              onChange={(e) => setFilter({ search: e.target.value || undefined })}
            />
          </div>
          <AccountCategoryRadioGroup value={filter.account_category} onChange={updateAccountCategory} />
          <PopulationRadioGroup value={filter.normalization ?? 'per_capita'} onChange={updateNormalization} />
          <FilterListContainer
            title="Year"
            icon={<Calendar className="w-4 h-4" />}
            listComponent={YearFilter}
            selected={selectedYearOptions}
            setSelected={updateYearOptions}
          />
        </div>
          <div className="space-y-4">
          <FilterListContainer
            title="UAT"
            icon={<MapPin className="w-4 h-4" />}
            listComponent={UatList}
            selected={(filter.uat_ids ?? []).map((id) => ({ id, label: String(id) }))}
            setSelected={(v) =>
              setFilter({
                uat_ids: (Array.isArray(v) ? v : (v as (prev: OptionItem<string | number>[]) => OptionItem<string | number>[])([])).map(
                  (o) => String(o.id),
                ),
              })
            }
          />
          <FilterListContainer
            title="County"
            icon={<MapPinned className="w-4 h-4" />}
            listComponent={CountyList}
            selected={(filter.county_codes ?? (filter.county_code ? [filter.county_code] : [])).map((c) => ({ id: c, label: String(c) }))}
            setSelected={(v) =>
              setFilter({
                county_codes: (Array.isArray(v) ? v : (v as (prev: OptionItem<string | number>[]) => OptionItem<string | number>[])([])).map(
                  (o) => String(o.id),
                ),
              })
            }
          />
          <FilterListContainer
            title="Entity Type"
            icon={<ChartBar className="w-4 h-4" />}
            listComponent={EntityTypeList as any}
            selected={(filter.entity_types ?? []).map((id) => ({ id, label: String(id) }))}
            setSelected={(v) =>
              setFilter({
                entity_types: (Array.isArray(v) ? v : (v as (prev: OptionItem<string | number>[]) => OptionItem<string | number>[])([])).map(
                  (o) => String(o.id),
                ),
              })
            }
          />
          <FilterListContainer
            title="Functional Classification"
            icon={<ChartBar className="w-4 h-4" />}
            listComponent={FunctionalClassificationList}
            selected={(filter.functional_codes ?? []).map((c) => ({ id: c, label: c }))}
            setSelected={(v) =>
              setFilter({
                functional_codes: (Array.isArray(v) ? v : (v as (prev: OptionItem<string | number>[]) => OptionItem<string | number>[])([])).map(
                  (o) => String(o.id),
                ),
              })
            }
          />
          <FilterListContainer
            title="Economic Classification"
            icon={<Tags className="w-4 h-4" />}
            listComponent={EconomicClassificationList}
            selected={(filter.economic_codes ?? []).map((c) => ({ id: c, label: c }))}
            setSelected={(v) =>
              setFilter({
                economic_codes: (Array.isArray(v) ? v : (v as (prev: OptionItem<string | number>[]) => OptionItem<string | number>[])([])).map(
                  (o) => String(o.id),
                ),
              })
            }
          />
          <FilterListContainer
            title="Budget Sector"
            icon={<Building2 className="w-4 h-4" />}
            listComponent={BudgetSectorList}
            selected={(filter.budget_sector_ids ?? []).map((id) => ({ id, label: String(id) }))}
            setSelected={(v) =>
              setFilter({
                budget_sector_ids: (Array.isArray(v) ? v : (v as (prev: OptionItem<string | number>[]) => OptionItem<string | number>[])([])).map(
                  (o) => String(o.id),
                ),
              })
            }
          />
          <FilterListContainer
            title="Funding Source"
            icon={<EuroIcon className="w-4 h-4" />}
            listComponent={FundingSourceList}
            selected={(filter.funding_source_ids ?? []).map((id) => ({ id, label: String(id) }))}
            setSelected={(v) =>
              setFilter({
                funding_source_ids: (Array.isArray(v) ? v : (v as (prev: OptionItem<string | number>[]) => OptionItem<string | number>[])([])).map(
                  (o) => String(o.id),
                ),
              })
            }
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


