import { useQuery } from "@tanstack/react-query";
import { getChartAnalytics } from "@/lib/api/charts";
import { AnalyticsInput, Chart } from "@/schemas/charts";
import { useMemo } from "react";
import { generateHash } from "@/lib/utils";

interface UseChartDataProps {
    chart?: Chart;
    enabled?: boolean;
}

export function useChartData({ chart, enabled = true }: UseChartDataProps) {

    const analyticsInputs = useMemo(() => chart?.series
        .map(series => ({ seriesId: series.id, filter: series.filter })) || [], [chart]);
    const analyticsInputsHash = useMemo(() => getAnalyticsInputHash(analyticsInputs), [analyticsInputs]);
    const hasChart = !!chart;
    const hasFilters = analyticsInputs.length > 0;

    const { data: chartData, isLoading: isLoadingData, error: dataError } = useQuery({
        queryKey: ['chart-data', analyticsInputsHash],
        queryFn: () => getChartAnalytics(analyticsInputs),
        enabled: enabled && hasChart && hasFilters,
    });

    return {
        chartData,
        isLoadingData,
        dataError,
    };
}

function getAnalyticsInputHash(analyticsInputs: AnalyticsInput[]) {
    const payloadHash = analyticsInputs.sort((a, b) => a.seriesId.localeCompare(b.seriesId)).reduce((acc, input) => {
        return acc + input.seriesId + '::' + JSON.stringify(input.filter);
    }, '');

    return generateHash(payloadHash);
}