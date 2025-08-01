import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { GetLabels, LabelStore } from "./interfaces";
import { OptionItem } from "@/lib/hooks/useLineItemsFilter";
import { getBudgetSectorLabels, getEconomicClassificationLabels, getEntityLabels, getFundingSourceLabels, getFunctionalClassificationLabels, getUatLabels } from "@/lib/api/labels";
import entityCategories from "@/assets/entity-categories.json";

const EntityStorageKey = 'entity-labels';
const UatLabelStorageKey = 'uat-labels';
const EconomicClassificationLabelStorageKey = 'economic-classification-labels';
const FunctionalClassificationLabelStorageKey = 'functional-classification-labels';
const BudgetSectorLabelStorageKey = 'budget-sector-labels';
const FundingSourceLabelStorageKey = 'funding-source-labels';


const loadLocalData = (key: string): Record<string, string> => {
    try {
        const storage = localStorage.getItem(key);
        const parseJson = storage ? JSON.parse(storage) : {};
        const entitiesMap = Object.fromEntries(Object.entries(parseJson).map(([key, label]) => [String(key), String(label)]));
        return entitiesMap;
    } catch (error) {
        console.error("Failed to parse data from localStorage for key", key, error);
        return {};
    }
};

const saveLocalData = (key: string, data: Record<string, string>) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const useDataLabelBuilder = (key: string, getLabels: GetLabels, initialIds: (string | number)[]): LabelStore => {
    const queryClient = useQueryClient();

    const { data: dataMap } = useQuery<Record<string, string>>({
        queryKey: [key],
        queryFn: () => loadLocalData(key),
        staleTime: Infinity,
        initialData: loadLocalData(key),
    });

    /**
     * Fetches labels for any given ids that are not already in the local cache,
     * updates localStorage, and triggers a UI update.
     * @param {string[]} ids - An array of ids to check and fetch.
     */
    const fetchMissingLabels = async (ids: (string | number)[], getLabels: GetLabels) => {
        if (!ids || ids.length === 0) return;

        const dataMap = loadLocalData(key);
        const missingIds = ids.filter(id => !dataMap[String(id)]);

        if (missingIds.length === 0) return;

        try {
            // Correctly await the asynchronous API call.
            const newLabels = await getLabels(missingIds);

            newLabels.forEach(({ id, label }) => {
                dataMap[String(id)] = String(label);
            });

            saveLocalData(key, dataMap);

            // Invalidate the query. This tells TanStack Query to refetch the data
            // (by running `loadEntities`) and update all subscribed components.
            await queryClient.invalidateQueries({ queryKey: [key] });
        } catch (error) {
            console.error("Failed to fetch labels:", error);
        }
    };

    /**
     * Manually adds or updates labels in the cache from a list of OptionItems.
     * @param {OptionItem[]} labels - An array of options with id and label.
     */
    const addKnownLabels = (labels: OptionItem[]) => {
        const currentMap = loadLocalData(key);
        labels.forEach(({ id, label }) => {
            currentMap[String(id)] = String(label);
        });

        saveLocalData(key, currentMap);

        // Optimistically update the query cache for an instant UI change.
        // This is faster than invalidating and re-reading from localStorage.
        queryClient.setQueryData([key], currentMap);
    };

    useEffect(() => {
        if (initialIds) {
            fetchMissingLabels(initialIds, getLabels);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount to get not loaded entities
    }, []);

    const mapIdToLabel = (id: string | number) => dataMap?.[String(id)] ?? `id::${id}`;

    return {
        map: mapIdToLabel,
        add: addKnownLabels,
        fetch: fetchMissingLabels,
    };
};

export const useEntityLabel = (initialIds: string[]) => {
    return useDataLabelBuilder(EntityStorageKey, getEntityLabels, initialIds);
};

export const useUatLabel = (initialIds: string[]) => {
    return useDataLabelBuilder(UatLabelStorageKey, getUatLabels, initialIds);
};

export const useEconomicClassificationLabel = (initialIds: string[]) => {
    return useDataLabelBuilder(EconomicClassificationLabelStorageKey, getEconomicClassificationLabels, initialIds);
}

export const useFunctionalClassificationLabel = (initialIds: string[]) => {
    return useDataLabelBuilder(FunctionalClassificationLabelStorageKey, getFunctionalClassificationLabels, initialIds);
}

export const useBudgetSectorLabel = (initialIds: (string | number)[]) => {
    return useDataLabelBuilder(BudgetSectorLabelStorageKey, getBudgetSectorLabels, initialIds);
}

export const useFundingSourceLabel = (initialIds: (string | number)[]) => {
    return useDataLabelBuilder(FundingSourceLabelStorageKey, getFundingSourceLabels, initialIds);
}

export const useEntityTypeLabel = () => {
    const entityTypeOptions = useMemo(() => Object.entries(entityCategories.categories).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>), []);

    return {
        map: (id: string) => entityTypeOptions[id] ?? `id::${id}`,
        add: () => { },
        fetch: () => { },
    }
}

export const useAccountCategoryLabel = () => {
    const accountCategoryOptions = useMemo(() => {
        return {
            "ch": "Cheltuieli",
            "vn": "Venituri"
        }
    }, []);

    return {
        map: (id: string) => accountCategoryOptions[id as keyof typeof accountCategoryOptions] ?? `id::${id}`,
        add: () => { },
        fetch: () => { },
    }
}