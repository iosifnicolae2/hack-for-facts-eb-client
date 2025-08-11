import { useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { MapStateSchema, MapUrlState } from '@/schemas/map-filters';
import { useEconomicClassificationLabel, useFunctionalClassificationLabel, useAccountCategoryLabel } from '@/hooks/filters/useFilterLabels';
import { OptionItem } from '@/components/filters/base-filter/interfaces';
import { AnalyticsFilterType, defaultYearRange } from '@/schemas/charts';
import { LabelStore } from '@/hooks/filters/interfaces';

export function useMapFilter() {
    const navigate = useNavigate({ from: '/map' });
    const search = useSearch({ from: '/map' });
    const mapState = MapStateSchema.parse(search);

    const economicClassificationLabelsStore = useEconomicClassificationLabel(mapState.filters.economic_codes ?? []);
    const functionalClassificationLabelsStore = useFunctionalClassificationLabel(mapState.filters.functional_codes ?? []);
    const accountCategoryLabelsStore = useAccountCategoryLabel();

    const updateMapState = (newState: Partial<MapUrlState>) => {
        navigate({ search: (prev) => ({ ...prev, ...newState, filters: { ...(prev as MapUrlState)?.filters, ...newState.filters } }), replace: true });
    };

    const setFilters = (filters: Partial<AnalyticsFilterType>) => {
        navigate({
            search: (prev) => {
                const newFilters = { ...prev, filters: { ...(prev as MapUrlState)?.filters, ...filters } }
                if (newFilters.filters.years?.length === 0) {
                    newFilters.filters.years = [defaultYearRange.end];
                }
                if (!newFilters.filters.account_category) {
                    newFilters.filters.account_category = "ch";
                }
                return newFilters;
            }, replace: true
        });
    };

    // Helper to create list updaters for filters with label stores
    const createListUpdater = <K extends keyof AnalyticsFilterType>(filterKey: K, labelStore?: LabelStore) =>
        (action: React.SetStateAction<OptionItem<string | number>[]>) => {
            const currentOptions = (mapState.filters[filterKey] as (string | number)[])?.map(id => ({ id, label: labelStore?.map(id) ?? String(id) })) ?? [];
            const newState = typeof action === 'function' ? action(currentOptions) : action;
            if (labelStore) {
                labelStore.add(newState);
            }
            setFilters({ [filterKey]: newState.map(o => o.id as string) } as Partial<AnalyticsFilterType>);
        };

    // Setters for map filter classifications
    const setSelectedFunctionalClassificationOptions = createListUpdater('functional_codes', functionalClassificationLabelsStore);
    const setSelectedEconomicClassificationOptions = createListUpdater('economic_codes', economicClassificationLabelsStore);

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
        });
    };

    const setActiveView = (view: "map" | "table" | "chart") => {
        updateMapState({ activeView: view });
    };

    const setMapViewType = (viewType: "UAT" | "Judet") => {
        updateMapState({ mapViewType: viewType });
    };

    return {
        mapState,
        setFilters,
        selectedEconomicClassificationOptions,
        setSelectedEconomicClassificationOptions,
        selectedFunctionalClassificationOptions,
        setSelectedFunctionalClassificationOptions,
        selectedAccountCategoryOption,
        clearAllFilters,
        setActiveView,
        setMapViewType,
    };
}