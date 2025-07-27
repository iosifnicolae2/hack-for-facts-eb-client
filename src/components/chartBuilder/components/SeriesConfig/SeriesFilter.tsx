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
import { useChartBuilder } from "../../hooks/useChartBuilder";
import { OptionItem } from "../../../filters/base-filter/interfaces";
import { FunctionalClassificationList } from "../../../filters/functional-classification-filter";
import { AccountCategoryRadio } from "../../../filters/account-type-filter/AccountCategoryRadio";

interface SeriesFilterProps {
    seriesId?: string;
}

export function SeriesFilter({ seriesId }: SeriesFilterProps) {
    const { chart, updateSeries } = useChartBuilder();
    const series = chart.series.find(s => s.id === seriesId)

    if (!series) {
        return null;
    }

    const { filter } = series;

    // Generic updater for list-based filters
    const createListUpdater = (filterKey: keyof typeof filter) =>
        (action: React.SetStateAction<OptionItem<string | number>[]>) => {
            if (!seriesId) return;

            const currentOptions = (filter[filterKey] as (string | number)[])?.map(id => ({ id, label: series.filterMetadata[id] || String(id) })) || [];
            const newState = typeof action === 'function' ? action(currentOptions) : action;

            updateSeries(seriesId, (prevSeries) => {
                (prevSeries.filter[filterKey] as (string | number)[]) = newState.map(o => o.id);
                prevSeries.filterMetadata = {
                    ...prevSeries.filterMetadata,
                    ...newState.reduce((acc, o) => ({ ...acc, [o.id]: o.label }), {})
                };
                return prevSeries;
            });
            return newState;
        };

    // Generic updater for simple value filters
    const createValueUpdater = (filterKey: keyof typeof filter, transform?: (value: string | number | boolean | undefined) => string | number | boolean | (string | number)[] | undefined) =>
        (value: string | number | boolean | undefined) => {
            console.log('createValueUpdater', filterKey, value);
            if (!seriesId) return;
            updateSeries(seriesId, (prevSeries) => {
                const newValue = typeof transform === 'function' ? transform(value) : value;
                prevSeries.filter[filterKey] = newValue as never;
                return prevSeries;
            });
        };

    // State and Handlers

    const selectedEntityOptions: OptionItem[] = filter.entity_cuis?.map(cui => ({ id: cui, label: series.filterMetadata[cui] || cui })) || [];
    const setSelectedEntityOptions = createListUpdater('entity_cuis');

    const selectedUatOptions: OptionItem<string>[] = filter.uat_ids?.map(id => ({ id: id, label: series.filterMetadata[id] || String(id) })) || [];
    const setSelectedUatOptions = createListUpdater('uat_ids');

    const selectedEconomicClassificationOptions: OptionItem[] = filter.economic_codes?.map(id => ({ id, label: series.filterMetadata[id] || String(id) })) || [];
    const setSelectedEconomicClassificationOptions = createListUpdater('economic_codes');

    const selectedFunctionalClassificationOptions: OptionItem[] = filter.functional_codes?.map(id => ({ id, label: series.filterMetadata[id] || String(id) })) || [];
    const setSelectedFunctionalClassificationOptions = createListUpdater('functional_codes');

    const accountTypeLabels: Record<string, string> = { 'ch': 'Cheltuieli', 'vn': 'Venituri' };
    const selectedAccountTypeOption: OptionItem = filter.account_category ? { id: filter.account_category, label: accountTypeLabels[filter.account_category] } : { id: 'ch', label: accountTypeLabels['ch'] };
    const setSelectedAccountTypeOption = createValueUpdater('account_category', (v) => v ? v : undefined);

    const selectedEntityTypeOptions: OptionItem[] = filter.entity_types?.map(id => ({ id, label: series.filterMetadata[id] || String(id) })) || [];
    const setSelectedEntityTypeOptions = createListUpdater('entity_types');

    const minAmount = String(filter.min_amount ?? '');
    const maxAmount = String(filter.max_amount ?? '');
    const setMinAmount = createValueUpdater('min_amount', (v) => v ? Number(v) : undefined);
    const setMaxAmount = createValueUpdater('max_amount', (v) => v ? Number(v) : undefined);

    const reportType = filter.report_type;
    const setReportType = createValueUpdater('report_type', (v) => v ? v : undefined);
    const reportTypeOption: OptionItem | null = reportType ? { id: reportType, label: reportType } : null;

    const functionalPrefix = filter.functional_prefixes?.[0];
    const setFunctionalPrefix = createValueUpdater('functional_prefixes', (v) => v ? [String(v)] : undefined);

    const economicPrefix = filter.economic_prefixes?.[0];
    const setEconomicPrefix = createValueUpdater('economic_prefixes', (v) => v ? [String(v)] : undefined);

    const flagsOptions: OptionItem[] = [];
    if (filter.is_uat === true) flagsOptions.push({ id: 'isUat', label: 'UAT: Da' });
    if (filter.is_uat === false) flagsOptions.push({ id: 'isUat', label: 'UAT: Nu' });
    const setIsUat = createValueUpdater('is_uat', (v) => v !== undefined ? v : undefined);

    const clearAllFilters = () => {
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) => {
            prevSeries.filter = { account_category: 'ch', report_type: 'Executie bugetara agregata la nivel de ordonator principal' };
            return prevSeries;
        });
    };

    const totalSelectedFilters =
        (filter.entity_cuis?.length ?? 0) +
        (filter.uat_ids?.length ?? 0) +
        (filter.economic_prefixes?.length ?? 0) +
        (filter.functional_prefixes?.length ?? 0) +
        (filter.account_category ? 1 : 0) +
        (filter.entity_types?.length ?? 0) +
        (filter.min_amount != null ? 1 : 0) +
        (filter.max_amount != null ? 1 : 0) +
        (reportType ? 1 : 0) +
        (filter.is_uat !== undefined ? 1 : 0) +
        (functionalPrefix ? 1 : 0) +
        (economicPrefix ? 1 : 0);

    const handleClearReportType = () => setReportType(undefined);

    const handleClearFlag = (option: OptionItem) => {
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) => {
            if (option.id === 'isUat') prevSeries.filter.is_uat = undefined;
            return prevSeries;
        });
    };

    const handleClearAllFlags = () => {
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) => {
            prevSeries.filter.is_uat = undefined;
            return prevSeries;
        });
    };

    return (
        <Card className={`flex flex-col w-full`}>
            <CardHeader className="py-4 px-6 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Filtre</CardTitle>
                    {totalSelectedFilters > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            Clear all ({totalSelectedFilters})
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className={`flex flex-col flex-grow p-0 overflow-y-auto`}>
                <FilterRadioContainer
                    title="Venituri/Cheltuieli"
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
                    title="Entitati Publice"
                    icon={<Building2 className="w-4 h-4" />}
                    listComponent={EntityList}
                    selected={selectedEntityOptions}
                    setSelected={setSelectedEntityOptions}
                />
                <FilterListContainer
                    title="Tip Entitate"
                    icon={<Building2 className="w-4 h-4" />}
                    listComponent={EntityTypeList}
                    selected={selectedEntityTypeOptions}
                    setSelected={setSelectedEntityTypeOptions}
                />
                <FilterListContainer
                    title="Unitati Administrativ Teritoriale (UAT)"
                    icon={<MapPin className="w-4 h-4" />}
                    listComponent={UatList}
                    selected={selectedUatOptions}
                    setSelected={setSelectedUatOptions}
                />
                <FilterListContainer
                    title="Clasificare Economica"
                    icon={<EuroIcon className="w-4 h-4" />}
                    listComponent={EconomicClassificationList}
                    selected={selectedEconomicClassificationOptions}
                    setSelected={setSelectedEconomicClassificationOptions}
                />
                <FilterListContainer
                    title="Clasificare Functionala"
                    icon={<ChartBar className="w-4 h-4" />}
                    listComponent={FunctionalClassificationList}
                    selected={selectedFunctionalClassificationOptions}
                    setSelected={setSelectedFunctionalClassificationOptions}
                />
                <FilterPrefixContainer
                    title="Prefix Clasificare Functionala"
                    icon={<ChartBar className="w-4 h-4" />}
                    prefixComponent={PrefixFilter}
                    value={functionalPrefix}
                    onValueChange={setFunctionalPrefix}
                />
                <FilterPrefixContainer
                    title="Prefix Clasificare Economica"
                    icon={<EuroIcon className="w-4 h-4" />}
                    prefixComponent={PrefixFilter}
                    value={economicPrefix}
                    onValueChange={setEconomicPrefix}
                />
                <FilterRangeContainer
                    title="Interval Valoare"
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
                    title="Tip Raport"
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    selectedOption={reportTypeOption}
                    onClear={handleClearReportType}
                >
                    <ReportTypeFilter
                        reportType={reportType}
                        setReportType={setReportType}
                    />
                </FilterRadioContainer>
                <FilterContainer
                    title="Este UAT"
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