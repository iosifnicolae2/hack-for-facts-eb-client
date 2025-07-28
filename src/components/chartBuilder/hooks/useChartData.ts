import { useQuery } from "@tanstack/react-query";
import { getChartAnalytics } from "@/lib/api/charts";
import { Chart } from "@/schemas/charts";

interface UseChartDataProps {
    chart: Chart;
}

export function useChartData({ chart }: UseChartDataProps) {


    const analyticsInputs = chart.series
        .filter(series => series.enabled)
        .map(series => ({ seriesId: series.id, filter: series.filter }));

    const { data: chartData, isLoading: isLoadingData, error: dataError } = useQuery({
        queryKey: ['chartData', analyticsInputs],
        queryFn: () => getChartAnalytics(analyticsInputs),
        enabled: !!chart && analyticsInputs.length > 0,
    });

    return {
        chartData,
        isLoadingData,
        dataError,
    };
}