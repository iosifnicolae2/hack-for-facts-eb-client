import { useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { defaultMapFilters, MapStateSchema, MapUrlState } from '@/schemas/map-filters';
import { useEconomicClassificationLabel, useFunctionalClassificationLabel, useAccountCategoryLabel, useUatLabel } from '@/hooks/filters/useFilterLabels';
import { OptionItem } from '@/components/filters/base-filter/interfaces';
import { AnalyticsFilterType, defaultYearRange } from '@/schemas/charts';
import { LabelStore } from '@/hooks/filters/interfaces';
import { Analytics } from '@/lib/analytics';

export function useMapFilter() {
    const navigate = useNavigate({ from: '/map' });
    const search = useSearch({ from: '/map' });
    const mapState = MapStateSchema.parse(search);

    const economicClassificationLabelsStore = useEconomicClassificationLabel(mapState.filters.economic_codes ?? []);
    const functionalClassificationLabelsStore = useFunctionalClassificationLabel(mapState.filters.functional_codes ?? []);
    const accountCategoryLabelsStore = useAccountCategoryLabel();
    const uatLabelsStore = useUatLabel((mapState.filters.uat_ids ?? []).map(String));

    const setFilters = (filters: Partial<AnalyticsFilterType>) => {
        navigate({
            search: (prev) => {
                const prevState = (prev as MapUrlState);
                const prevFilter = prevState?.filters || defaultMapFilters;
                const newFilters = { ...prevState, filters: { ...prevFilter, ...filters } };
                if (newFilters.filters.years?.length === 0) {
                    newFilters.filters.years = [defaultYearRange.end];
                }
                if (!newFilters.filters.account_category) {
                    newFilters.filters.account_category = "ch";
                }
                // Emit a summarized change to avoid sending sensitive data
                const filterHash = JSON.stringify(newFilters.filters);
                Analytics.capture(Analytics.EVENTS.MapFilterChanged, {
                    filter_hash: filterHash,
                    ...Analytics.summarizeFilter(newFilters.filters),
                });
                return newFilters;
            },
            replace: true,
        });
    };

    const createListUpdater = <K extends keyof AnalyticsFilterType>(filterKey: K, labelStore?: LabelStore) =>
        (action: React.SetStateAction<OptionItem<string | number>[]>) => {
            const currentOptions = (mapState.filters[filterKey] as (string | number)[])?.map(id => ({ id, label: labelStore?.map(id) ?? String(id) })) ?? [];
            const newState = typeof action === 'function' ? action(currentOptions) : action;
            if (labelStore) {
                labelStore.add(newState);
            }
            setFilters({ [filterKey]: newState.map(o => o.id) } as Partial<AnalyticsFilterType>);
        };

    const createValueUpdater = <K extends keyof AnalyticsFilterType>(filterKey: K) =>
        (value: AnalyticsFilterType[K]) => {
            setFilters({ [filterKey]: value } as Partial<AnalyticsFilterType>);
        };

    const setSelectedFunctionalClassificationOptions = createListUpdater('functional_codes', functionalClassificationLabelsStore);
    const setSelectedEconomicClassificationOptions = createListUpdater('economic_codes', economicClassificationLabelsStore);
    const setSelectedUatOptions = createListUpdater('uat_ids', uatLabelsStore);
    const setSelectedCountyOptions = createListUpdater('county_codes');
    const setSelectedEntityTypeOptions = createListUpdater('entity_types');
    const setSelectedBudgetSectorOptions = createListUpdater('budget_sector_ids');
    const setSelectedFundingSourceOptions = createListUpdater('funding_source_ids');
    const setAccountCategory = createValueUpdater('account_category');
    const setNormalization = createValueUpdater('normalization');
    const setFunctionalPrefixes = createValueUpdater('functional_prefixes');
    const setEconomicPrefixes = createValueUpdater('economic_prefixes');
    const setMinPopulation = createValueUpdater('min_population');
    const setMaxPopulation = createValueUpdater('max_population');
    const setAggregateMinAmount = createValueUpdater('aggregate_min_amount');
    const setAggregateMaxAmount = createValueUpdater('aggregate_max_amount');
    const setYears = (years: OptionItem<string | number>[] | ((prevState: OptionItem<string | number>[]) => OptionItem<string | number>[])) => {
        const selectedYearOptions = mapState.filters.years?.map(y => ({ id: y, label: String(y) })) ?? [];
        const newYears = typeof years === 'function' ? years(selectedYearOptions) : years;
        setFilters({ years: newYears.map(y => Number(y.id)) });
    };

    const selectedEconomicClassificationOptions: OptionItem[] = useMemo(() =>
        mapState.filters.economic_codes?.map(id => ({ id, label: economicClassificationLabelsStore.map(id) })) ?? [],
        [mapState.filters.economic_codes, economicClassificationLabelsStore]
    );

    const selectedFunctionalClassificationOptions: OptionItem[] = useMemo(() =>
        mapState.filters.functional_codes?.map(id => ({ id, label: functionalClassificationLabelsStore.map(id) })) ?? [],
        [mapState.filters.functional_codes, functionalClassificationLabelsStore]
    );

    const selectedAccountCategoryOption: OptionItem = useMemo(() =>
        ({ id: mapState.filters.account_category, label: accountCategoryLabelsStore.map(mapState.filters.account_category) }),
        [mapState.filters.account_category, accountCategoryLabelsStore]
    );

    const selectedUatOptions: OptionItem<string | number>[] = useMemo(() =>
        (mapState.filters.uat_ids ?? []).map((id) => ({ id, label: uatLabelsStore.map(String(id)) })),
        [mapState.filters.uat_ids, uatLabelsStore],
    );

    const clearAllFilters = () => {
        setFilters({
            years: [defaultYearRange.end],
            functional_codes: [],
            economic_codes: [],
            account_category: "ch",
            normalization: "per_capita",
            county_codes: [],
            regions: [],
            min_population: undefined,
            max_population: undefined,
            aggregate_min_amount: undefined,
            aggregate_max_amount: undefined,
            item_min_amount: undefined,
            item_max_amount: undefined,
            functional_prefixes: [],
            economic_prefixes: [],
            entity_types: [],
            budget_sector_ids: [],
            funding_source_ids: [],
            program_codes: [],
            expense_types: [],
            uat_ids: [],
        });
    };

    const setActiveView = (view: "map" | "table" | "chart") => {
        Analytics.capture(Analytics.EVENTS.MapActiveViewChanged, { view });
        navigate({ search: (prev) => ({ ...prev, activeView: view }), replace: true });
    };

    const setMapViewType = (viewType: "UAT" | "Judet") => {
        Analytics.capture(Analytics.EVENTS.MapViewTypeChanged, { view_type: viewType });
        navigate({ search: (prev) => ({ ...prev, mapViewType: viewType }), replace: true });
    };

    return {
        mapState,
        setFilters,
        clearAllFilters,
        setActiveView,
        setMapViewType,
        selectedEconomicClassificationOptions,
        setSelectedEconomicClassificationOptions,
        selectedFunctionalClassificationOptions,
        setSelectedFunctionalClassificationOptions,
        selectedAccountCategoryOption,
        setAccountCategory,
        setNormalization,
        setYears,
        selectedUatOptions,
        setSelectedUatOptions,
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
    };
}
