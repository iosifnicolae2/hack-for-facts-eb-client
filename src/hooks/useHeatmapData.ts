import { getHeatmapJudetData, getHeatmapUATData } from "@/lib/api/dataDiscovery";
import { useQuery, type QueryOptions, keepPreviousData } from "@tanstack/react-query";
import { MapFilters } from "@/schemas/map-filters";
import { convertDaysToMs } from "@/lib/utils";

export function heatmapUATQueryOptions(filter: MapFilters) {
    return {
        queryKey: ['heatmapUATData', filter] as const,
        queryFn: () => getHeatmapUATData(filter),
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    } satisfies QueryOptions<unknown, Error, unknown, readonly [string, MapFilters]> & {
        staleTime?: number;
        gcTime?: number;
    };
}

export function heatmapJudetQueryOptions(filter: MapFilters) {
    return {
        queryKey: ['heatmapJudetData', filter] as const,
        queryFn: () => getHeatmapJudetData(filter),
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    } satisfies QueryOptions<unknown, Error, unknown, readonly [string, MapFilters]> & {
        staleTime?: number;
        gcTime?: number;
    };
}

export function useHeatmapData(heatmapFilterInput: MapFilters, mapViewType: 'UAT' | 'Judet') {
    const uatQuery = useQuery({
        ...heatmapUATQueryOptions(heatmapFilterInput),
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        enabled: mapViewType === 'UAT',
    });

    const judetQuery = useQuery({
        ...heatmapJudetQueryOptions(heatmapFilterInput),
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
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
