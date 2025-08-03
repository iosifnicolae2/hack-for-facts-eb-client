import { useMemo } from 'react';
import { Chart, Series } from '@/schemas/charts';
import { AnalyticsDataPoint } from '@/lib/api/charts';
import { generateRandomColor, hslToHex } from '../components/chart-renderer/utils';

export interface AggregatedDataPoint {
    id: string;
    label: string;
    value: number;
    color: string;
    unit: string;
    absolute: number;
}

export function useAggregatedData(chart: Chart, data: AnalyticsDataPoint[]) {
    const enabledSeries = useMemo(() => chart.series.filter(s => s.enabled), [chart.series]);

    const aggregatedData: AggregatedDataPoint[] = useMemo(() => {
        if (!chart || !data) return [];

        const yearRange = chart.config.yearRange;
        const startYear = yearRange?.start ?? -Infinity;
        const endYear = yearRange?.end ?? Infinity;

        return enabledSeries.map((s: Series) => {
            const seriesAnalytics = data.find(d => d.seriesId === s.id);

            const totalValue = seriesAnalytics?.yearlyTrend
                .filter(trend => trend.year >= startYear && trend.year <= endYear)
                .reduce((acc, trend) => acc + trend.totalAmount, 0) ?? 0;

            const baseColor = s.config.color || chart.config.color || generateRandomColor();
            const color = baseColor.startsWith('hsl') ? hslToHex(baseColor) : baseColor;

            return {
                id: s.id,
                label: s.label || s.id.substring(0, 6),
                value: totalValue,
                absolute: totalValue,
                color,
                unit: s.unit || 'RON'
            };
        });

    }, [chart, data, enabledSeries]);

    const units = useMemo(() => {
        const allUnits = aggregatedData.map(d => d.unit);
        return [...new Set(allUnits)];
    }, [aggregatedData]);

    return { aggregatedData, enabledSeries, units };
}
