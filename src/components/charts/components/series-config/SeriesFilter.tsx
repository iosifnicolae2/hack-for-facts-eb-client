import { Building2, XCircle, MapPin, EuroIcon, ChartBar, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { FilterListContainer } from "../../../filters/base-filter/FilterListContainer";
import { FilterPrefixContainer, PrefixFilter } from "../../../filters/prefix-filter";
import { FilterRangeContainer } from "../../../filters/base-filter/FilterRangeContainer";
import { FilterRadioContainer } from "../../../filters/base-filter/FilterRadioContainer";
import { ReportTypeFilter } from "../../../filters/report-type-filter";
import { FilterContainer } from "../../../filters/base-filter/FilterContainer";
import { IsUatFilter } from "../../../filters/flags-filter";
import { EconomicClassificationList } from "../../../filters/economic-classification-filter";
import { UatList } from "../../../filters/uat-filter";
import { EntityTypeList } from "../../../filters/entity-type-filter/EntityTypeList";
import { AmountRangeFilter } from "../../../filters/amount-range-filter";
import { EntityList } from "../../../filters/entity-filter";
import { useChartStore } from "../../hooks/useChartStore";
import { OptionItem } from "../../../filters/base-filter/interfaces";
import { FunctionalClassificationList } from "../../../filters/functional-classification-filter";
import { AccountCategoryRadio } from "../../../filters/account-type-filter/AccountCategoryRadio";
import { cn } from "@/lib/utils";
import { BudgetSectorList } from "@/components/filters/budget-sector-filter";
import { FundingSourceList } from "@/components/filters/funding-source-filter";
import { useBudgetSectorLabel, useEconomicClassificationLabel, useEntityLabel, useFundingSourceLabel, useFunctionalClassificationLabel, useUatLabel, useEntityTypeLabel, useAccountCategoryLabel } from "@/hooks/filters/useFilterLabels";
import { LabelStore } from "@/hooks/filters/interfaces";
import { ReportType, SeriesConfiguration } from "@/schemas/charts";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { NormalizationFilter } from "@/components/filters/normalization-filter/NormalizationFilter";

interface SeriesFilterProps {
    seriesId?: string;
    className?: string;
}

type FilterValue = string | number | boolean | undefined;

export function SeriesFilter({ seriesId, className }: SeriesFilterProps) {
    const { chart, updateSeries } = useChartStore();
    const series = chart.series.find(s => s.id === seriesId && s.type === 'line-items-aggregated-yearly') as SeriesConfiguration;
    const entityLabelsStore = useEntityLabel(series?.filter.entity_cuis ?? []);
    const uatLabelsStore = useUatLabel(series?.filter.uat_ids ?? []);
    const economicClassificationLabelsStore = useEconomicClassificationLabel(series?.filter.economic_codes ?? []);
    const functionalClassificationLabelsStore = useFunctionalClassificationLabel(series?.filter.functional_codes ?? []);
    const budgetSectorLabelsStore = useBudgetSectorLabel(series?.filter.budget_sector_ids ?? []);
    const fundingSourceLabelsStore = useFundingSourceLabel(series?.filter.funding_source_ids ?? []);
    const entityTypeLabelsStore = useEntityTypeLabel();
    const accountCategoryLabelsStore = useAccountCategoryLabel();

    if (!series) {
        return null;
    }

    const { filter } = series;

    // Generic updater for list-based filters
    const createListUpdater = (filterKey: keyof typeof filter, labelStore?: LabelStore) =>
        (action: React.SetStateAction<OptionItem<string | number>[]>) => {
            if (!seriesId) return;

            const currentOptions = (filter[filterKey] as (string | number)[])?.map(id => ({ id, label: labelStore?.map(id) ?? String(id) })) || [];
            const newState = typeof action === 'function' ? action(currentOptions) : action;
            if (labelStore) {
                labelStore.add(newState);
            }

            updateSeries(seriesId, (prevSeries) => {
                if (prevSeries.type === 'line-items-aggregated-yearly') {
                    (prevSeries.filter[filterKey] as (string | number)[]) = newState.map(o => o.id);
                }
                return prevSeries;
            });
            return newState;
        };

    const createValueUpdater = (filterKey: keyof typeof filter, transform?: (value: FilterValue) => FilterValue) =>
        (value: FilterValue) => {
            if (!seriesId) return;
            updateSeries(seriesId, (prevSeries) => {
                const newValue = typeof transform === 'function' ? transform(value) : value;
                if (prevSeries.type === 'line-items-aggregated-yearly') {
                    prevSeries.filter[filterKey] = newValue as never;
                }
                return prevSeries;
            });
        };

    const createPrefixListUpdater = (filterKey: 'functional_prefixes' | 'economic_prefixes') =>
        (value: string[] | undefined) => {
            if (!seriesId) return;
            updateSeries(seriesId, (prevSeries) => {
                if (prevSeries.type === 'line-items-aggregated-yearly') {
                    prevSeries.filter[filterKey] = value && value.length > 0 ? value : undefined;
                }
                return prevSeries;
            });
        };


    // State and Handlers

    const selectedEntityOptions: OptionItem[] = filter.entity_cuis?.map(cui => ({ id: cui, label: entityLabelsStore.map(cui) })) || [];
    const setSelectedEntityOptions = createListUpdater('entity_cuis', entityLabelsStore);

    const selectedUatOptions: OptionItem<string>[] = filter.uat_ids?.map(id => ({ id: id, label: uatLabelsStore.map(id) })) || [];
    const setSelectedUatOptions = createListUpdater('uat_ids', uatLabelsStore);

    const selectedEconomicClassificationOptions: OptionItem[] = filter.economic_codes?.map(id => ({ id, label: economicClassificationLabelsStore.map(id) })) || [];
    const setSelectedEconomicClassificationOptions = createListUpdater('economic_codes', economicClassificationLabelsStore);

    const selectedFunctionalClassificationOptions: OptionItem[] = filter.functional_codes?.map(id => ({ id, label: functionalClassificationLabelsStore.map(id) })) || [];
    const setSelectedFunctionalClassificationOptions = createListUpdater('functional_codes', functionalClassificationLabelsStore);

    const selectedAccountTypeOption: OptionItem = filter.account_category ? { id: filter.account_category, label: accountCategoryLabelsStore.map(filter.account_category) } : { id: 'ch', label: accountCategoryLabelsStore.map('ch') };
    const setSelectedAccountTypeOption = createValueUpdater('account_category', (v) => v ? v : undefined);

    const selectedEntityTypeOptions: OptionItem[] = filter.entity_types?.map(id => ({ id, label: entityTypeLabelsStore.map(id) })) || [];
    const setSelectedEntityTypeOptions = createListUpdater('entity_types');

    const minAmount = String(filter.aggregate_min_amount ?? '');
    const maxAmount = String(filter.aggregate_max_amount ?? '');
    const setMinAmount = createValueUpdater('aggregate_min_amount', (v) => v ? Number(v) : undefined);
    const setMaxAmount = createValueUpdater('aggregate_max_amount', (v) => v ? Number(v) : undefined);

    const reportType = filter.report_type;
    const setReportType = (v: FilterValue) => {
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) => {
            if (prevSeries.type === 'line-items-aggregated-yearly') {
                prevSeries.filter.report_type = v ? String(v) as ReportType : undefined;
            }
            return prevSeries;
        });
    };
    const normalization = filter.normalization;
    const setNormalization = createValueUpdater('normalization', (v) => v ? v : undefined);
    const normalizationOption: OptionItem | null = normalization ? { id: normalization, label: normalization } : null;
    
    const reportTypeOption: OptionItem | null = reportType ? { id: reportType, label: reportType } : null;
    
    const functionalPrefixes = filter.functional_prefixes ?? [];
    const setFunctionalPrefixes = createPrefixListUpdater('functional_prefixes');

    const economicPrefixes = filter.economic_prefixes ?? [];
    const setEconomicPrefixes = createPrefixListUpdater('economic_prefixes');

    const selectedBudgetSectorOptions: OptionItem[] = filter.budget_sector_ids?.map(id => ({ id, label: budgetSectorLabelsStore.map(id) })) || [];
    const setSelectedBudgetSectorOptions = createListUpdater('budget_sector_ids', budgetSectorLabelsStore);

    const selectedFundingSourceOptions: OptionItem[] = filter.funding_source_ids?.map(id => ({ id, label: fundingSourceLabelsStore.map(id) })) || [];
    const setSelectedFundingSourceOptions = createListUpdater('funding_source_ids', fundingSourceLabelsStore);

    const flagsOptions: OptionItem[] = [];
    if (filter.is_uat === true) flagsOptions.push({ id: 'isUat', label: t`UAT: Yes` });
    if (filter.is_uat === false) flagsOptions.push({ id: 'isUat', label: t`UAT: No` });
    const setIsUat = createValueUpdater('is_uat', (v) => v !== undefined ? v : undefined);

    const clearAllFilters = () => {
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) => {
            if (prevSeries.type === 'line-items-aggregated-yearly') {
                prevSeries.filter = { account_category: 'ch', report_type: 'Executie bugetara agregata la nivel de ordonator principal' };
            }
            return prevSeries;
        });
    };

    const totalSelectedFilters =
        (filter.entity_cuis?.length ?? 0) +
        (filter.uat_ids?.length ?? 0) +
        (filter.economic_codes?.length ?? 0) +
        (filter.functional_codes?.length ?? 0) +
        (filter.budget_sector_ids?.length ?? 0) +
        (filter.funding_source_ids?.length ?? 0) +
        (filter.account_category ? 1 : 0) +
        (filter.entity_types?.length ?? 0) +
        (filter.aggregate_min_amount != null ? 1 : 0) +
        (filter.aggregate_max_amount != null ? 1 : 0) +
        (filter.report_type ? 1 : 0) +
        (filter.normalization ? 1 : 0) +
        (filter.is_uat !== undefined ? 1 : 0) +
        (filter.functional_prefixes?.length ?? 0) +
        (filter.economic_prefixes?.length ?? 0);

    const handleClearReportType = () => setReportType(undefined);
    const handleClearNormalization = () => setNormalization(undefined);
    const handleClearFlag = (option: OptionItem) => {
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) => {
            if (prevSeries.type === 'line-items-aggregated-yearly') {
                if (option.id === 'isUat') prevSeries.filter.is_uat = undefined;
            }
            return prevSeries;
        });
    };

    const handleClearAllFlags = () => {
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) => {
            if (prevSeries.type === 'line-items-aggregated-yearly') {
                prevSeries.filter.is_uat = undefined;
            }
            return prevSeries;
        });
    };

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader className="py-4 px-6 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                        <Trans>Filters</Trans>
                    </CardTitle>
                    {totalSelectedFilters > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            <Trans>Clear all</Trans> ({totalSelectedFilters})
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className={`flex flex-col p-0 overflow-y-auto`}>
                <FilterRadioContainer
                    title={t`Income/Expenses`}
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    selectedOption={selectedAccountTypeOption}
                    onClear={() => setSelectedAccountTypeOption('ch')}
                >
                    <AccountCategoryRadio
                        accountCategory={filter.account_category}
                        setAccountCategory={setSelectedAccountTypeOption}
                    />
                </FilterRadioContainer>
                <FilterListContainer
                    title={t`Public Entities`}
                    icon={<Building2 className="w-4 h-4" />}
                    listComponent={EntityList}
                    selected={selectedEntityOptions}
                    setSelected={setSelectedEntityOptions}
                />
                <FilterListContainer
                    title={t`Entity Type`}
                    icon={<Building2 className="w-4 h-4" />}
                    listComponent={EntityTypeList}
                    selected={selectedEntityTypeOptions}
                    setSelected={setSelectedEntityTypeOptions}
                />
                <FilterListContainer
                    title={t`Territorial Administrative Units (UAT)`}
                    icon={<MapPin className="w-4 h-4" />}
                    listComponent={UatList}
                    selected={selectedUatOptions}
                    setSelected={setSelectedUatOptions}
                />
                <FilterListContainer
                    title={t`Economic Classification`}
                    icon={<EuroIcon className="w-4 h-4" />}
                    listComponent={EconomicClassificationList}
                    selected={selectedEconomicClassificationOptions}
                    setSelected={setSelectedEconomicClassificationOptions}
                />
                <FilterListContainer
                    title={t`Functional Classification`}
                    icon={<ChartBar className="w-4 h-4" />}
                    listComponent={FunctionalClassificationList}
                    selected={selectedFunctionalClassificationOptions}
                    setSelected={setSelectedFunctionalClassificationOptions}
                />
                <FilterPrefixContainer
                    title={t`Functional Classification Prefix`}
                    icon={<ChartBar className="w-4 h-4" />}
                    prefixComponent={PrefixFilter}
                    value={functionalPrefixes}
                    onValueChange={setFunctionalPrefixes}
                />
                <FilterPrefixContainer
                    title={t`Economic Classification Prefix`}
                    icon={<EuroIcon className="w-4 h-4" />}
                    prefixComponent={PrefixFilter}
                    value={economicPrefixes}
                    onValueChange={setEconomicPrefixes}
                />
                <FilterRangeContainer
                    title={t`Amount Range`}
                    unit="RON"
                    icon={<SlidersHorizontal className="w-4 h-4" />}
                    rangeComponent={AmountRangeFilter}
                    minValue={minAmount}
                    onMinValueChange={setMinAmount}
                    maxValue={maxAmount}
                    onMaxValueChange={setMaxAmount}
                    debounceMs={0}
                />
                <FilterRadioContainer
                    title={t`Report Type`}
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    selectedOption={reportTypeOption}
                    onClear={handleClearReportType}
                >
                    <ReportTypeFilter
                        reportType={reportType}
                        setReportType={setReportType}
                    />
                </FilterRadioContainer>
                <FilterRadioContainer
                    title={t`Normalization`}
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    selectedOption={normalizationOption}
                    onClear={handleClearNormalization}
                >
                    <NormalizationFilter
                        normalization={normalization}
                        setNormalization={setNormalization}
                    />
                </FilterRadioContainer>
                <FilterListContainer
                    title={t`Budget Sector`}
                    icon={<Building2 className="w-4 h-4" />}
                    listComponent={BudgetSectorList}
                    selected={selectedBudgetSectorOptions}
                    setSelected={setSelectedBudgetSectorOptions}
                />
                <FilterListContainer
                    title={t`Funding Source`}
                    icon={<EuroIcon className="w-4 h-4" />}
                    listComponent={FundingSourceList}
                    selected={selectedFundingSourceOptions}
                    setSelected={setSelectedFundingSourceOptions}
                />
                <FilterContainer
                    title={t`Is UAT`}
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    selectedOptions={flagsOptions}
                    onClearOption={handleClearFlag}
                    onClearAll={handleClearAllFlags}
                >
                    <IsUatFilter
                        isUat={filter.is_uat}
                        setIsUat={setIsUat}
                    />
                </FilterContainer>
            </CardContent>
        </Card>
    );
}
