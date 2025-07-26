import { Building2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FilterListContainer } from "../filters/base-filter/FilterListContainer";
// import { FilterPrefixContainer } from "../filters/prefix-filter";
// import { FilterRangeContainer } from "../filters/base-filter/FilterRangeContainer";
// import { FilterRadioContainer } from "../filters/base-filter/FilterRadioContainer";
// import { ReportTypeFilter } from "../filters/report-type-filter";
// import { FilterContainer } from "../filters/base-filter/FilterContainer";
// import { FlagsFilter } from "../filters/flags-filter";
// import { EconomicClassificationList } from "../filters/economic-classification-filter";
// import { UatList } from "../filters/uat-filter";
// import { EntityTypeList } from "../filters/entity-type-filter/EntityTypeList";
// import { AmountRangeFilter } from "../filters/amount-range-filter";
// import { AccountTypeFilter } from "../filters/account-type-filter/AccountTypeFilter";
import { EntityList } from "../filters/entity-filter";
import { useChartBuilder } from "./hooks/useChartBuilder";
import { OptionItem } from "../filters/base-filter/interfaces";


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

    const clearAllFilters = () => {
        // setSelectedYearOptions([]);
        // setSelectedEntityOptions([]);
        // setSelectedUatOptions([]);
        // setSelectedEconomicClassificationOptions([]);
        // setSelectedFunctionalClassificationOptions([]);
        // setMinAmount('');
        // setMaxAmount('');
        // setSelectedAccountTypeOptions([]);
        // setReportType(undefined);
        // setIsMainCreditor(undefined);
        // setIsUat(undefined);
        // setFunctionalPrefix(undefined);
        // setEconomicPrefix(undefined);
        // setSelectedEntityTypeOptions([]);
    };

    const totalSelectedFilters = 0;
    // const totalSelectedFilters =
    //     [
    //         selectedYearOptions,
    //         selectedEntityOptions,
    //         selectedUatOptions,
    //         selectedEconomicClassificationOptions,
    //         selectedFunctionalClassificationOptions,
    //         selectedAccountTypeOptions,
    //         selectedEntityTypeOptions,
    //     ].reduce((count, options) => count + options.length, 0) +
    //     (filter.min_amount !== undefined && minAmount !== '' ? 1 : 0) +
    //     (maxAmount !== undefined && maxAmount !== '' ? 1 : 0) +
    //     (reportType ? 1 : 0) +
    //     (isMainCreditor !== undefined ? 1 : 0) +
    //     (isUat !== undefined ? 1 : 0) +
    //     (functionalPrefix ? 1 : 0) +
    //     (economicPrefix ? 1 : 0);

    // const reportTypeOption: OptionItem | null = filter.report_type ? { id: filter.report_type, label: filter.report_type } : null;

    const flagsOptions: OptionItem[] = [];
    if (filter.is_main_creditor === true) flagsOptions.push({ id: 'isMainCreditor', label: 'Ordonator principal: Da' });
    if (filter.is_main_creditor === false) flagsOptions.push({ id: 'isMainCreditor', label: 'Ordonator principal: Nu' });
    if (filter.is_uat === true) flagsOptions.push({ id: 'isUat', label: 'UAT: Da' });
    if (filter.is_uat === false) flagsOptions.push({ id: 'isUat', label: 'UAT: Nu' });

    const selectedEntityOptions: OptionItem[] = filter.entity_cuis?.map(cui => ({ id: cui, label: series.filterMetadata[cui] || cui })) || [];
    const setSelectedEntityOptions: React.Dispatch<React.SetStateAction<OptionItem<string | number>[]>> = (action: React.SetStateAction<OptionItem<string | number>[]>) => {
        const newState = typeof action === 'function' ? action(selectedEntityOptions) : action;
        if (!seriesId) return;
        updateSeries(seriesId, (prevSeries) =>{
            prevSeries.filter.entity_cuis = newState.map(o => String(o.id))
            prevSeries.filterMetadata = {
                ...prevSeries.filterMetadata,
                ...newState.reduce((acc, o) => ({ ...acc, [o.id]: o.label }), {})
            }
            return prevSeries;
        });

        return newState;
    }
    // const handleClearReportType = () => {
    //     setReportType(undefined);
    // }

    // const handleClearFlag = (option: OptionItem) => {
    //     if (option.id === 'isMainCreditor') {
    //         setIsMainCreditor(undefined);
    //     } else if (option.id === 'isUat') {
    //         setIsUat(undefined);
    //     }
    // }

    // const handleClearAllFlags = () => {
    //     setIsMainCreditor(undefined);
    //     setIsUat(undefined);
    // }

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
            {totalSelectedFilters > 0 && (
                <div className="p-4 border-b flex justify-end items-center">
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        Clear all ({totalSelectedFilters})
                    </Button>
                </div>
            )}
            <CardContent className={`flex flex-col flex-grow p-0`}>
                <FilterListContainer
                    title="Entitati Publice"
                    icon={<Building2 className="w-4 h-4" />}
                    listComponent={EntityList}
                    selected={selectedEntityOptions}
                    setSelected={setSelectedEntityOptions}
                />
                {/* <FilterListContainer
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
                <FilterListContainer
                    title="Anul"
                    icon={<Calendar className="w-4 h-4" />}
                    listComponent={YearFilter}
                    selected={selectedYearOptions}
                    setSelected={setSelectedYearOptions}
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
                />
                <FilterRadioContainer
                    title="Tip Raport"
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    selectedOption={reportTypeOption}
                    onClear={handleClearReportType}
                >
                    <ReportTypeFilter />
                </FilterRadioContainer>
                <FilterContainer
                    title="Flags"
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    selectedOptions={flagsOptions}
                    onClearOption={handleClearFlag}
                    onClearAll={handleClearAllFlags}
                >
                    <FlagsFilter />
                </FilterContainer>
                <FilterListContainer
                    title="Venituri/Cheltuieli"
                    icon={<ArrowUpDown className="w-4 h-4" />}
                    listComponent={AccountTypeFilter}
                    selected={selectedAccountTypeOptions}
                    setSelected={setSelectedAccountTypeOptions}
                /> */}
            </CardContent>
        </Card>
    );
}
