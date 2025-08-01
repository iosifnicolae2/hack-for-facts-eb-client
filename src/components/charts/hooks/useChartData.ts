import { useQuery } from "@tanstack/react-query";
import { getChartAnalytics } from "@/lib/api/charts";
import { AnalyticsFilterType, AnalyticsInput, Chart, AnalyticsDataPoint } from "@/schemas/charts";
import { useMemo } from "react";
import { generateHash } from "@/lib/utils";
import { calculateAllSeriesData } from "@/lib/chart-calculation-utils";

interface UseChartDataProps {
    chart?: Chart;
    enabled?: boolean;
}

export function useChartData({ chart, enabled = true }: UseChartDataProps) {
    const analyticsInputs = useMemo(() => {
        if (!chart) return [];
        return chart.series
            .filter(series => series.type === 'line-items-aggregated-yearly')
            .map(series => ({ seriesId: series.id, filter: series.filter as AnalyticsFilterType }));
    }, [chart]);

    const analyticsInputsHash = useMemo(() => getAnalyticsInputHash(analyticsInputs), [analyticsInputs]);
    const hasChart = !!chart;
    const hasFilters = analyticsInputs.length > 0;

    const { data: baseChartData, isLoading: isLoadingData, error: dataError } = useQuery({
        queryKey: ['chart-data', analyticsInputsHash],
        queryFn: () => getChartAnalytics(analyticsInputs),
        enabled: enabled && hasChart && hasFilters,
    });

    const chartData = useMemo(() => {
        if (!chart || !baseChartData) return undefined;

        // Convert array to map for calculation function
        const baseDataMap = new Map<string, AnalyticsDataPoint>();
        baseChartData.forEach(data => {
            baseDataMap.set(data.seriesId, data);
        });

        // Add custom series data to baseDataMap
        chart.series.forEach(series => {
            if (series.type === 'custom-series') {
                baseDataMap.set(series.id, {
                    seriesId: series.id, yearlyTrend: series.data.map(data => ({
                        year: data.year,
                        totalAmount: data.value,
                    }))
                });
            }
        });

        const calculatedDataMap = calculateAllSeriesData(chart.series, baseDataMap);

        // Convert map back to array for UI
        return Array.from(calculatedDataMap.values());

    }, [chart, baseChartData]);

    return {
        chartData,
        isLoadingData,
        dataError,
    };
}

function getAnalyticsInputHash(analyticsInputs: AnalyticsInput[]) {
    if (analyticsInputs.length === 0) return '';
    const payloadHash = analyticsInputs
        .sort((a, b) => a.seriesId.localeCompare(b.seriesId))
        .reduce((acc, input) => {
            return acc + input.seriesId + '::' + JSON.stringify(input.filter);
        }, '');

    return generateHash(payloadHash);
}
