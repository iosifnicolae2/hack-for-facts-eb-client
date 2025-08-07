import { useMapFilter } from "@/lib/hooks/useMapFilterStore";
import { getHeatmapJudetData, getHeatmapUATData } from "@/lib/api/dataDiscovery";
import { useQuery } from "@tanstack/react-query";

export function useHeatmapData() {
    const { heatmapFilterInput, mapViewType } = useMapFilter();

    const uatQuery = useQuery({
        queryKey: ['heatmapUATData', heatmapFilterInput],
        queryFn: () => getHeatmapUATData(heatmapFilterInput),
        enabled: mapViewType === 'UAT',
    });

    const judetQuery = useQuery({
        queryKey: ['heatmapJudetData', heatmapFilterInput],
        queryFn: () => getHeatmapJudetData(heatmapFilterInput),
        enabled: mapViewType === 'Judet',
    });


    if (mapViewType === 'UAT') {
        return {
            ...uatQuery,
            data: uatQuery.data,
        };
    }

    return {
        ...judetQuery,
        data: judetQuery.data,
    };
}
