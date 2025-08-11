import { getHeatmapJudetData, getHeatmapUATData } from "@/lib/api/dataDiscovery";
import { useQuery, type QueryOptions, keepPreviousData } from "@tanstack/react-query";
import { AnalyticsFilterType } from "@/schemas/charts";
import { convertDaysToMs, generateHash } from "@/lib/utils";

export function heatmapUATQueryOptions(filter: AnalyticsFilterType) {
    const filterHash = generateHash(JSON.stringify(filter));
    return {
        queryKey: ['heatmapUATData', filterHash] as const,
        queryFn: () => getHeatmapUATData(filter),
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    } satisfies QueryOptions<unknown, Error, unknown, readonly [string, string]> & {
        staleTime?: number;
        gcTime?: number;
    };
}

export function heatmapJudetQueryOptions(filter: AnalyticsFilterType) {
    const filterHash = generateHash(JSON.stringify(filter));
    return {
        queryKey: ['heatmapJudetData', filterHash] as const,
        queryFn: () => getHeatmapJudetData(filter),
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    } satisfies QueryOptions<unknown, Error, unknown, readonly [string, string]> & {
        staleTime?: number;
        gcTime?: number;
    };
}

export function useHeatmapData(heatmapFilterInput: AnalyticsFilterType, mapViewType: 'UAT' | 'Judet') {
    console.log('heatmapFilterInput', heatmapFilterInput);
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
