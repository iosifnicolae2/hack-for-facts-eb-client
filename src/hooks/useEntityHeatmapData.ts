import { getHeatmapJudetData, getHeatmapUATData } from "@/lib/api/dataDiscovery";
import { useQuery } from "@tanstack/react-query";
import { EntityDetailsData } from "@/lib/api/entities";
import { HeatmapFilterInput, HeatmapJudetDataPoint, HeatmapUATDataPoint } from "@/schemas/heatmap";

export function useEntityHeatmapData(entity: EntityDetailsData | null, year: number, dataType: 'income' | 'expense') {
    const filterInput: HeatmapFilterInput = {
        years: [year],
        account_categories: dataType === 'income' ? ['vn'] : ['ch'],
    };

    const queryKey = ['entityHeatmapData', entity?.cui, year, dataType];

    const queryFn = (): Promise<(HeatmapUATDataPoint | HeatmapJudetDataPoint)[]> => {
        if (entity?.entity_type === 'JUDET') {
            return getHeatmapJudetData(filterInput) as Promise<(HeatmapUATDataPoint | HeatmapJudetDataPoint)[]>;
        }
        return getHeatmapUATData(filterInput) as Promise<(HeatmapUATDataPoint | HeatmapJudetDataPoint)[]>;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: queryFn,
        enabled: !!entity,
    });

    return { data, isLoading, error };
}