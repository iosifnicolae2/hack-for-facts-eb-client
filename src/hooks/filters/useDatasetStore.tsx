import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Dataset, getDatasets } from "@/lib/api/datasets";

const DatasetStorageKey = 'datasets';

const loadLocalData = (): Record<string, Dataset> => {
    try {
        const storage = localStorage.getItem(DatasetStorageKey);
        return storage ? JSON.parse(storage) : {};
    } catch (error) {
        console.error("Failed to parse data from localStorage for key", DatasetStorageKey, error);
        return {};
    }
};

const saveLocalData = (data: Record<string, Dataset>) => {
    localStorage.setItem(DatasetStorageKey, JSON.stringify(data));
};

export const useDatasetStore = (initialIds: (string | number)[]) => {
    const queryClient = useQueryClient();

    const { data: dataMap } = useQuery<Record<string, Dataset>>({
        queryKey: [DatasetStorageKey],
        queryFn: () => loadLocalData(),
        staleTime: Infinity,
        initialData: loadLocalData(),
    });

    const fetchMissingDatasets = async (ids: (string | number)[]) => {
        if (!ids || ids.length === 0) return;

        const dataMap = loadLocalData();
        const missingIds = ids.filter(id => !dataMap[String(id)]);

        if (missingIds.length === 0) return;

        try {
            const newDatasets = await getDatasets(missingIds);

            newDatasets.forEach((dataset) => {
                dataMap[String(dataset.id)] = dataset;
            });

            saveLocalData(dataMap);

            await queryClient.invalidateQueries({ queryKey: [DatasetStorageKey] });
        } catch (error) {
            console.error("Failed to fetch datasets:", error);
        }
    };

    const addKnownDatasets = (datasets: Dataset[]) => {
        const currentMap = loadLocalData();
        datasets.forEach((dataset) => {
            currentMap[String(dataset.id)] = dataset;
        });

        saveLocalData(currentMap);

        queryClient.setQueryData([DatasetStorageKey], currentMap);
    };

    useEffect(() => {
        if (initialIds) {
            fetchMissingDatasets(initialIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount
    }, []);

    const getDataset = (id: string | number) => dataMap?.[String(id)];

    return {
        get: getDataset,
        add: addKnownDatasets,
        fetch: fetchMissingDatasets,
    };
};