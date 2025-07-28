import { useQuery } from "@tanstack/react-query";
import { getChartAnalytics } from "@/lib/api/charts";
import { Chart } from "@/schemas/charts";

interface UseChartDataProps {
    chart?: Chart;
    enabled?: boolean;
}

export function useChartData({ chart, enabled = true }: UseChartDataProps) {

    const analyticsInputs = chart?.series
        .filter(series => series.enabled)
        .map(series => ({ seriesId: series.id, filter: series.filter })) || [];


    const hasChart = !!chart;
    const hasFilters = analyticsInputs.length > 0;

    const { data: chartData, isLoading: isLoadingData, error: dataError } = useQuery({
        queryKey: ['chartData', analyticsInputs],
        queryFn: () => getChartAnalytics(analyticsInputs),
        enabled: enabled && hasChart && hasFilters,
    });

    return {
        chartData,
        isLoadingData,
        dataError,
    };
}