import { FilterListContainer } from "./base-filter/FilterListContainer";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpDown, Calendar, ChartBar, Divide, Globe, Map, SlidersHorizontal, Tags, XCircle, Building2, HandCoins, Building, MapPin, MapPinned, TableIcon, BarChart2Icon, MapIcon } from "lucide-react";
import { Button } from "../ui/button";
import { EconomicClassificationList } from "./economic-classification-filter";
import { FunctionalClassificationList } from "./functional-classification-filter";
import { FilterRangeContainer } from "./base-filter/FilterRangeContainer";
import { AmountRangeFilter } from "./amount-range-filter";
import { useMapFilter } from "@/hooks/useMapFilter";
import { useEffect, useMemo } from "react";
import { ViewTypeRadioGroup } from "./ViewTypeRadioGroup";
import { EntityTypeList } from './entity-type-filter/EntityTypeList';
import { BudgetSectorList } from './budget-sector-filter/BudgetSectorFilter';
import { FundingSourceList } from './funding-source-filter/FundingSourceFilter';
import { PrefixFilter, FilterPrefixContainer } from './prefix-filter';
import { UatList } from './uat-filter/UatList';
import { EntityList } from './entity-filter/EntityList';
import { CountyList } from './county-filter/CountyList';
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { FilterRadioContainer } from "./base-filter/FilterRadioContainer";
import { ReportTypeFilter } from "./report-type-filter";
import { IsUatFilter } from './flags-filter';
import { FilterContainer } from './base-filter/FilterContainer';
import { PeriodFilter } from './period-filter/PeriodFilter';
import { getPeriodTags } from '@/lib/period-utils';
import { ReportPeriodInput } from '@/schemas/reporting';
import { OptionItem } from './base-filter/interfaces';
import { useNormalizationSelection } from '@/hooks/useNormalizationSelection';
import { useEntityLabel } from '@/hooks/filters/useFilterLabels';
import { useUserCurrency } from "@/lib/hooks/useUserCurrency";

export function MapFilter() {
    const {
        mapState,
        clearAllFilters,
        setMapViewType,
        setActiveView,
        selectedFunctionalClassificationOptions,
        setSelectedFunctionalClassificationOptions,
        selectedEconomicClassificationOptions,
        setSelectedEconomicClassificationOptions,
        setAccountCategory,
        setNormalization,
        setReportPeriod,
        selectedUatOptions,
        selectedEntityOptions,
        setSelectedUatOptions,
        setSelectedEntityOptions,
        setSelectedCountyOptions,
        setSelectedEntityTypeOptions,
        setSelectedBudgetSectorOptions,
        setSelectedFundingSourceOptions,
        setFunctionalPrefixes,
        setEconomicPrefixes,
        setMinPopulation,
        setMaxPopulation,
        setAggregateMinAmount,
        setAggregateMaxAmount,
        setReportType,
        setIsUat,
        setMainCreditorCui,
    } = useMapFilter();
    const [currency] = useUserCurrency();
    const { toDisplayNormalization, toEffectiveNormalization } = useNormalizationSelection(mapState.filters.normalization as any);

    useEffect(() => {
        const { normalization } = mapState.filters;
        if (currency === 'EUR' && normalization !== 'total_euro' && normalization !== 'per_capita_euro') {
            setNormalization('total_euro');
        } else if (currency === 'RON' && normalization !== 'total' && normalization !== 'per_capita') {
            setNormalization('total');
        }
    }, [currency, mapState.filters.normalization, setNormalization]);

    const handleRemovePeriodTag = (tagToRemove: OptionItem) => {
        const report_period = mapState.filters.report_period as ReportPeriodInput | undefined;
        if (!report_period) return;

        if (report_period.selection.dates) {
            const newDates = report_period.selection.dates.filter(d => d !== tagToRemove.id);
            if (newDates.length > 0) {
                setReportPeriod({ ...report_period, selection: { dates: newDates } } as any);
            } else {
                setReportPeriod(undefined);
            }
        } else if (report_period.selection.interval) {
            setReportPeriod(undefined);
        }
    };

    const periodTags = getPeriodTags(mapState.filters.report_period as ReportPeriodInput).map(tag => ({
        id: String(tag.value),
        label: String(tag.value),
    }));

    const mainCreditorLabelStore = useEntityLabel(
        mapState.filters.main_creditor_cui ? [mapState.filters.main_creditor_cui] : []
    );
    const selectedMainCreditorOption = mapState.filters.main_creditor_cui
        ? [{ id: mapState.filters.main_creditor_cui, label: mainCreditorLabelStore.map(mapState.filters.main_creditor_cui) }]
        : [];

    const totalOptionalFilters =
        (mapState.filters.report_period ? 1 : 0) +
        (mapState.filters.functional_codes?.length ?? 0) +
        (mapState.filters.economic_codes?.length ?? 0) +
        (mapState.filters.functional_prefixes?.length ?? 0) +
        (mapState.filters.economic_prefixes?.length ?? 0) +
        (mapState.filters.entity_cuis?.length ?? 0) +
        (mapState.filters.main_creditor_cui ? 1 : 0) +
        (mapState.filters.entity_types?.length ?? 0) +
        (mapState.filters.budget_sector_ids?.length ?? 0) +
        (mapState.filters.funding_source_ids?.length ?? 0) +
        (mapState.filters.program_codes?.length ?? 0) +
        (mapState.filters.expense_types?.length ?? 0) +
        (mapState.filters.uat_ids?.length ?? 0) +
        (mapState.filters.county_codes?.length ?? 0) +
        (mapState.filters.aggregate_min_amount ? 1 : 0) +
        (mapState.filters.aggregate_max_amount ? 1 : 0) +
        (mapState.filters.report_type ? 1 : 0) +
        (mapState.filters.is_uat !== undefined ? 1 : 0) +
        (mapState.filters.min_population ? 1 : 0) +
        (mapState.filters.max_population ? 1 : 0);

    const selectedAccountCategoryOption = useMemo(() => mapState.filters.account_category, [mapState.filters.account_category]);
    const selectedNormalizationOption = useMemo(() => mapState.filters.normalization ?? 'total', [mapState.filters.normalization]);

    return (
        <Card className="flex flex-col w-full min-h-full overflow-y-auto shadow-lg" role="region" aria-labelledby="map-filters-title">
            <CardHeader className="py-4 px-6 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold" id="map-filters-title"><Trans>Map Filters</Trans></CardTitle>
                    {totalOptionalFilters > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
                            <XCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                            <Trans>Clear filters ({totalOptionalFilters})</Trans>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow p-0 space-y-1">
                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center" id="data-view-label">
                        <ChartBar className="w-4 h-4 mr-2" aria-hidden="true" />
                        <Trans>Data View</Trans>
                    </h4>
                    <div role="group" aria-labelledby="data-view-label">
                        <ViewTypeRadioGroup
                            value={mapState.activeView}
                            onChange={(activeView) => setActiveView(activeView)}
                            viewOptions={[
                                { id: 'map', label: t`Map`, icon: MapIcon },
                                { id: 'table', label: t`Table`, icon: TableIcon },
                                { id: 'chart', label: t`Chart`, icon: BarChart2Icon },
                            ]}
                        />
                    </div>
                </div>
                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center" id="map-view-label">
                        <Map className="w-4 h-4 mr-2" aria-hidden="true" />
                        <Trans>Map View</Trans>
                    </h4>
                    <div role="group" aria-labelledby="map-view-label">
                        <ViewTypeRadioGroup
                            value={mapState.mapViewType}
                            onChange={(mapViewType) => setMapViewType(mapViewType)}
                            viewOptions={[
                                { id: 'UAT', label: t`UAT` },
                                { id: 'County', label: t`County` },
                            ]}
                        />
                    </div>
                </div>
                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center" id="income-expenses-label">
                        <ArrowUpDown className="w-4 h-4 mr-2" aria-hidden="true" />
                        <Trans>Income/Expenses</Trans>
                    </h4>
                    <div role="group" aria-labelledby="income-expenses-label">
                        <ViewTypeRadioGroup
                            value={selectedAccountCategoryOption}
                            onChange={(accountCategory) => setAccountCategory(accountCategory)}
                            viewOptions={[
                                { id: 'ch', label: t`Expenses` },
                                { id: 'vn', label: t`Income` },
                            ]}
                        />
                    </div>
                </div>

                <div className="p-3 border-b">
                    <h4 className="mb-2 text-sm font-medium flex items-center" id="normalization-label">
                        <Divide className="w-4 h-4 mr-2" aria-hidden="true" />
                        <Trans>Total Amount</Trans>
                    </h4>
                    <div role="group" aria-labelledby="normalization-label">
                        <ViewTypeRadioGroup
                            value={toDisplayNormalization(selectedNormalizationOption as any)}
                            onChange={(display) => setNormalization(toEffectiveNormalization(display as 'total' | 'per_capita'))}
                            viewOptions={[
                                { id: 'total', label: t`Total` },
                                { id: 'per_capita', label: t`Per Capita` },
                            ]}
                        />
                    </div>
                </div>

                <FilterContainer
                    title={t`Period`}
                    icon={<Calendar className="w-4 h-4" aria-hidden="true" />}
                    selectedOptions={periodTags}
                    onClearOption={handleRemovePeriodTag}
                    onClearAll={() => setReportPeriod(undefined)}
                >
                    <PeriodFilter value={mapState.filters.report_period as any} onChange={(p) => setReportPeriod(p as any)} />
                </FilterContainer>
                <FilterListContainer
                    title={t`Entities`}
                    icon={<Building2 className="w-4 h-4" aria-hidden="true" />}
                    listComponent={EntityList}
                    selected={selectedEntityOptions}
                    setSelected={setSelectedEntityOptions}
                />

                <FilterContainer
                    title={t`Main Creditor`}
                    icon={<Building2 className="w-4 h-4" aria-hidden="true" />}
                    selectedOptions={selectedMainCreditorOption}
                    onClearOption={() => setMainCreditorCui(undefined)}
                    onClearAll={() => setMainCreditorCui(undefined)}
                >
                    <EntityList
                        selectedOptions={selectedMainCreditorOption}
                        toggleSelect={(option) => setMainCreditorCui(String(option.id))}
                        pageSize={100}
                    />
                </FilterContainer>

                <FilterListContainer
                    title={t`UATs`}
                    icon={<MapPin className="w-4 h-4" aria-hidden="true" />}
                    listComponent={UatList}
                    selected={selectedUatOptions}
                    setSelected={setSelectedUatOptions}
                />

                <FilterListContainer
                    title={t`Counties`}
                    icon={<MapPinned className="w-4 h-4" aria-hidden="true" />}
                    listComponent={CountyList}
                    selected={(mapState.filters.county_codes ?? []).map((c) => ({ id: c, label: String(c) }))}
                    setSelected={setSelectedCountyOptions}
                />

                <FilterListContainer
                    title={t`Functional Classification`}
                    icon={<ChartBar className="w-4 h-4" aria-hidden="true" />}
                    listComponent={FunctionalClassificationList}
                    selected={selectedFunctionalClassificationOptions}
                    setSelected={setSelectedFunctionalClassificationOptions}
                />
                <FilterPrefixContainer
                    title={t`Functional Classification Prefix`}
                    icon={<ChartBar className="w-4 h-4" aria-hidden="true" />}
                    prefixComponent={PrefixFilter}
                    value={mapState.filters.functional_prefixes}
                    onValueChange={setFunctionalPrefixes}
                />
                <FilterListContainer
                    title={t`Economic Classification`}
                    icon={<Tags className="w-4 h-4" aria-hidden="true" />}
                    listComponent={EconomicClassificationList}
                    selected={selectedEconomicClassificationOptions}
                    setSelected={setSelectedEconomicClassificationOptions}
                />
                <FilterPrefixContainer
                    title={t`Economic Classification Prefix`}
                    icon={<Tags className="w-4 h-4" aria-hidden="true" />}
                    prefixComponent={PrefixFilter}
                    value={mapState.filters.economic_prefixes}
                    onValueChange={setEconomicPrefixes}
                />

                <FilterListContainer
                    title={t`Entity Type`}
                    icon={<Building className="w-4 h-4" aria-hidden="true" />}
                    listComponent={EntityTypeList}
                    selected={(mapState.filters.entity_types ?? []).map(id => ({ id, label: id }))}
                    setSelected={setSelectedEntityTypeOptions}
                />

                <FilterListContainer
                    title={t`Budget Sector`}
                    icon={<Building2 className="w-4 h-4" aria-hidden="true" />}
                    listComponent={BudgetSectorList}
                    selected={(mapState.filters.budget_sector_ids ?? []).map(id => ({ id, label: String(id) }))}
                    setSelected={setSelectedBudgetSectorOptions}
                />

                <FilterListContainer
                    title={t`Funding Source`}
                    icon={<HandCoins className="w-4 h-4" aria-hidden="true" />}
                    listComponent={FundingSourceList}
                    selected={(mapState.filters.funding_source_ids ?? []).map(id => ({ id, label: String(id) }))}
                    setSelected={setSelectedFundingSourceOptions}
                />

                <FilterRadioContainer
                    title={t`Report Type`}
                    icon={<ArrowUpDown className="w-4 h-4" aria-hidden="true" />}
                    selectedOption={(mapState.filters.report_type) ? { id: mapState.filters.report_type, label: mapState.filters.report_type } : null}
                    onClear={() => setReportType(undefined)}
                >
                    <ReportTypeFilter
                        reportType={mapState.filters.report_type}
                        setReportType={(v) => setReportType(v as 'Executie bugetara agregata la nivel de ordonator principal' | 'Executie bugetara detaliata' | undefined)}
                    />
                </FilterRadioContainer>

                <FilterContainer
                    title={t`Is UAT`}
                    icon={<ArrowUpDown className="w-4 h-4" aria-hidden="true" />}
                    selectedOptions={mapState.filters.is_uat === undefined ? [] : [{ id: 'is_uat', label: mapState.filters.is_uat ? t`UAT: Yes` : t`UAT: No` }]}
                    onClearOption={() => setIsUat(undefined)}
                    onClearAll={() => setIsUat(undefined)}
                >
                    <IsUatFilter isUat={mapState.filters.is_uat} setIsUat={setIsUat} />
                </FilterContainer>

                <FilterRangeContainer
                    title={t`Amount Range`}
                    icon={<SlidersHorizontal className="w-4 h-4" aria-hidden="true" />}
                    unit="RON"
                    rangeComponent={AmountRangeFilter}
                    minValue={mapState.filters.aggregate_min_amount}
                    onMinValueChange={(v) => setAggregateMinAmount(v ? Number(v) : undefined)}
                    maxValue={mapState.filters.aggregate_max_amount}
                    onMaxValueChange={(v) => setAggregateMaxAmount(v ? Number(v) : undefined)}
                />
                <FilterRangeContainer
                    title={t`Population Range`}
                    unit={t`inhabitants`}
                    icon={<Globe className="w-4 h-4" aria-hidden="true" />}
                    rangeComponent={AmountRangeFilter}
                    minValue={mapState.filters.min_population}
                    onMinValueChange={(v) => setMinPopulation(v ? Number(v) : undefined)}
                    maxValue={mapState.filters.max_population}
                    maxValueAllowed={100_000_000}
                    onMaxValueChange={(v) => setMaxPopulation(v ? Number(v) : undefined)}
                />
            </CardContent>
        </Card>
    );
}
