import { getHeatmapCountyData, getHeatmapUATData } from "@/lib/api/dataDiscovery";
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
        queryKey: ['heatmapCountyData', filterHash] as const,
        queryFn: () => getHeatmapCountyData(filter),
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    } satisfies QueryOptions<unknown, Error, unknown, readonly [string, string]> & {
        staleTime?: number;
        gcTime?: number;
    };
}

export function useHeatmapData(heatmapFilterInput: AnalyticsFilterType, mapViewType: 'UAT' | 'County') {
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
        enabled: mapViewType === 'County',
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
