import { EntityList } from "./entity-filter/EntityList";
import { FilterListContainer } from "./base-filter/FilterListContainer";
import { UatList } from "./uat-filter";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpDown, Building2, Calendar, ChartBar, EuroIcon, MapPin, SlidersHorizontal, XCircle } from "lucide-react";
import { EconomicClassificationList } from "./economic-classification-filter";
import { FunctionalClassificationList } from "./functional-classification-filter";
import { YearFilter } from "./year-filter";
import { AmountRangeFilter } from "./amount-range-filter";
import { FilterRangeContainer } from "./base-filter/FilterRangeContainer";
import { AccountTypeFilter } from "./account-type-filter/AccountTypeFilter";
import { useFilterSearch } from "../../lib/hooks/useLineItemsFilter";
import { Button } from "../ui/button";
import { ReportTypeFilter } from "./report-type-filter";
import { FilterRadioContainer } from "./base-filter/FilterRadioContainer";
import { OptionItem } from "./base-filter/interfaces";
import { FlagsFilter } from "./flags-filter";
import { FilterContainer } from "./base-filter/FilterContainer";

interface LineItemsFilterProps {
    isInModal?: boolean;
}

export function LineItemsFilter({ isInModal = false }: LineItemsFilterProps) {
    const {
        selectedYearOptions,
        setSelectedYearOptions,
        selectedEntityOptions,
        setSelectedEntityOptions,
        selectedUatOptions,
        setSelectedUatOptions,
        selectedEconomicClassificationOptions,
        setSelectedEconomicClassificationOptions,
        selectedFunctionalClassificationOptions,
        setSelectedFunctionalClassificationOptions,
        minAmount,
        setMinAmount,
        maxAmount,
        setMaxAmount,
        selectedAccountTypeOptions,
        setSelectedAccountTypeOptions,
        reportType,
        setReportType,
        isMainCreditor,
        setIsMainCreditor,
        isUat,
        setIsUat,
    } = useFilterSearch();

    const clearAllFilters = () => {
        setSelectedYearOptions([]);
        setSelectedEntityOptions([]);
        setSelectedUatOptions([]);
        setSelectedEconomicClassificationOptions([]);
        setSelectedFunctionalClassificationOptions([]);
        setMinAmount('');
        setMaxAmount('');
        setSelectedAccountTypeOptions([]);
        setReportType(undefined);
        setIsMainCreditor(undefined);
        setIsUat(undefined);
    };

    const totalSelectedFilters =
        [
            selectedYearOptions,
            selectedEntityOptions,
            selectedUatOptions,
            selectedEconomicClassificationOptions,
            selectedFunctionalClassificationOptions,
            selectedAccountTypeOptions,
        ].reduce((count, options) => count + options.length, 0) +
        (minAmount !== undefined && minAmount !== '' ? 1 : 0) +
        (maxAmount !== undefined && maxAmount !== '' ? 1 : 0) +
        (reportType ? 1 : 0) +
        (isMainCreditor !== undefined ? 1 : 0) +
        (isUat !== undefined ? 1 : 0);

    const reportTypeOption: OptionItem | null = reportType ? { id: reportType, label: reportType } : null;
    
    const flagsOptions: OptionItem[] = [];
    if (isMainCreditor === true) flagsOptions.push({ id: 'isMainCreditor', label: 'Ordonator principal: Da' });
    if (isMainCreditor === false) flagsOptions.push({ id: 'isMainCreditor', label: 'Ordonator principal: Nu' });
    if (isUat === true) flagsOptions.push({ id: 'isUat', label: 'UAT: Da' });
    if (isUat === false) flagsOptions.push({ id: 'isUat', label: 'UAT: Nu' });
    
    const handleClearReportType = () => {
        setReportType(undefined);
    }

    const handleClearFlag = (option: OptionItem) => {
        if (option.id === 'isMainCreditor') {
            setIsMainCreditor(undefined);
        } else if (option.id === 'isUat') {
            setIsUat(undefined);
        }
    }

    const handleClearAllFlags = () => {
        setIsMainCreditor(undefined);
        setIsUat(undefined);
    }

    return (
        <Card className={`flex flex-col w-full ${isInModal ? 'shadow-none border-none h-full' : 'min-h-full shadow-lg'}`}>
            {!isInModal && (
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
            )}
            {isInModal && totalSelectedFilters > 0 && (
                <div className="p-4 border-b flex justify-end items-center">
                     <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        Clear all ({totalSelectedFilters})
                    </Button>
                </div>
            )}
            <CardContent className={`flex flex-col flex-grow p-0 ${isInModal ? 'overflow-y-auto' : ''}`}>
                <FilterListContainer
                    title="Entitati Publice"
                    icon={<Building2 className="w-4 h-4" />}
                    listComponent={EntityList}
                    selected={selectedEntityOptions}
                    setSelected={setSelectedEntityOptions}
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
                />
            </CardContent>
        </Card>
    );
}
