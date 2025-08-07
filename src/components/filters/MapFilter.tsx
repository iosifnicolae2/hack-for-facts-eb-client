import { FilterListContainer } from "./base-filter/FilterListContainer";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpDown, Calendar, ChartBar, Divide, Globe, Map, Navigation, SlidersHorizontal, Tags, XCircle } from "lucide-react";
import { YearFilter } from "./year-filter";
import { AccountCategoryRadioGroup } from "./account-type-filter/AccountCategoryRadioGroup";
import { Button } from "../ui/button";
import { EconomicClassificationList } from "./economic-classification-filter";
import { FunctionalClassificationList } from "./functional-classification-filter";
import { PopulationRadioGroup } from "./account-type-filter/PopulationRadioGroup";
import { FilterRangeContainer } from "./base-filter/FilterRangeContainer";
import { AmountRangeFilter } from "./amount-range-filter";
import { MapViewTypeRadioGroup } from "./MapViewTypeRadioGroup";
import { useMapFilter } from "@/hooks/useMapFilter";
import { useMemo } from "react";
import { OptionItem } from "./base-filter/interfaces";
import { ViewTypeRadioGroup } from "./ViewTypeRadioGroup";

export function MapFilter() {
    const {
        mapState,
        setFilters,
        clearAllFilters,
        setMapViewType,
        setActiveView,
        selectedFunctionalClassificationOptions,
        setSelectedFunctionalClassificationOptions,
        selectedEconomicClassificationOptions,
        setSelectedEconomicClassificationOptions
    } = useMapFilter();

    const totalOptionalFilters =
        (mapState.filters.years?.length ?? 0) +
        (mapState.filters.functional_codes?.length ?? 0) +
        (mapState.filters.economic_codes?.length ?? 0) +
        (mapState.filters.min_amount ? 1 : 0) +
        (mapState.filters.max_amount ? 1 : 0) +
        (mapState.filters.min_population ? 1 : 0) +
        (mapState.filters.max_population ? 1 : 0);

    const selectedAccountCategoryOption = useMemo(() => {
        return mapState.filters.account_categories[0];
    }, [mapState.filters.account_categories]);

    const updateAccountCategory = (accountCategory: "ch" | "vn") => {
        setFilters({ account_categories: [accountCategory] });
    };

    const selectedNormalizationOption = useMemo(() => {
        return mapState.filters.normalization;
    }, [mapState.filters.normalization]);

    const updateNormalization = (normalization: "total" | "per_capita") => {
        setFilters({ normalization });
    };

    const selectedYearOptions = useMemo(() => {
        return mapState.filters.years?.map(y => ({ id: y, label: String(y) })) ?? [];
    }, [mapState.filters.years]);

    const updateYearOptions = (years: OptionItem<string | number>[] | ((prevState: OptionItem<string | number>[]) => OptionItem<string | number>[])) => {
        const newYears = typeof years === 'function' ? years(selectedYearOptions) : years;
        setFilters({ years: newYears.map(y => Number(y.id)) });
    };

    const updateMinValueAmount = (minAmount: string | undefined) => {
        setFilters({ min_amount: Number(minAmount) });
    };

    const updateMaxValueAmount = (maxAmount: string | undefined) => {
        setFilters({ max_amount: Number(maxAmount) });
    };

    const updateMinValuePopulation = (minPopulation: string | undefined) => {
        setFilters({ min_population: Number(minPopulation) });
    };

    const updateMaxValuePopulation = (maxPopulation: string | undefined) => {
        setFilters({ max_population: Number(maxPopulation) });
    };

    return (
        <Card className="flex flex-col w-full min-h-full overflow-y-auto shadow-lg">
            <CardHeader className="py-4 px-6 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Filtre Hartă</CardTitle>
                    {totalOptionalFilters > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            Șterge filtre ({totalOptionalFilters})
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow p-0 space-y-1">
                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center">
                        <ChartBar className="w-4 h-4 mr-2" />
                        Vizualizare Date
                    </h4>
                    <ViewTypeRadioGroup
                        value={mapState.activeView}
                        onChange={(activeView) => setActiveView(activeView)}
                    />
                </div>
                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center">
                        <Map className="w-4 h-4 mr-2" />
                        Vizualizare Hartă
                    </h4>
                    <MapViewTypeRadioGroup
                        value={mapState.mapViewType}
                        onChange={(mapViewType) => setMapViewType(mapViewType)}
                    />
                </div>
                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Venituri/Cheltuieli
                    </h4>
                    <AccountCategoryRadioGroup
                        value={selectedAccountCategoryOption}
                        onChange={updateAccountCategory}
                    />
                </div>

                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center">
                        <Divide className="w-4 h-4 mr-2" />
                        Sumă totală
                    </h4>
                    <PopulationRadioGroup
                        value={selectedNormalizationOption}
                        onChange={updateNormalization}
                    />
                </div>

                <FilterListContainer
                    title="Anul"
                    icon={<Calendar className="w-4 h-4" />}
                    listComponent={YearFilter}
                    selected={selectedYearOptions}
                    setSelected={updateYearOptions}
                />
                <FilterListContainer
                    title="Clasificare Functionala"
                    icon={<ChartBar className="w-4 h-4" />}
                    listComponent={FunctionalClassificationList}
                    selected={selectedFunctionalClassificationOptions}
                    setSelected={setSelectedFunctionalClassificationOptions}
                />
                <FilterListContainer
                    title="Clasificare Economică"
                    icon={<Tags className="w-4 h-4" />}
                    listComponent={EconomicClassificationList}
                    selected={selectedEconomicClassificationOptions}
                    setSelected={setSelectedEconomicClassificationOptions}
                />
                <FilterRangeContainer
                    title="Interval Valoare"
                    icon={<SlidersHorizontal className="w-4 h-4" />}
                    unit="RON"
                    rangeComponent={AmountRangeFilter}
                    minValue={mapState.filters.min_amount}
                    onMinValueChange={updateMinValueAmount}
                    maxValue={mapState.filters.max_amount}
                    onMaxValueChange={updateMaxValueAmount}
                />
                <FilterRangeContainer
                    title="Interval Populație"
                    unit="locuitori"
                    icon={<Globe className="w-4 h-4" />}
                    rangeComponent={AmountRangeFilter}
                    minValue={mapState.filters.min_population}
                    onMinValueChange={updateMinValuePopulation}
                    maxValue={mapState.filters.max_population}
                    maxValueAllowed={100_000_000}
                    onMaxValueChange={updateMaxValuePopulation}
                />
            </CardContent>
        </Card>
    );
}