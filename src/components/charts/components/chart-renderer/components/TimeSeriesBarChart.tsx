import { BarChart, Bar, LabelList, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './ChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { useChartData } from '../hooks/useChartData';
import { ChartLabel } from './ChartLabel';
import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { useCallback, useMemo } from 'react';
import { applyAlpha } from '../utils';

const dataLabelFormatter = (value: number, isRelative: boolean) => {
    if (isRelative) {
        return `${formatNumberRO(value)}%`;
    }
    return formatCurrency(value, "compact");
};

export function TimeSeriesBarChart({ chart, data }: ChartRendererProps) {
    const { timeSeriesData, enabledSeries } = useChartData(chart, data);
    const isRelative = chart.config.showRelativeValues ?? false;

    const getSeriesColor = useCallback(
        (seriesId: string, opacity = 1): string => {
            const seriesConfig = enabledSeries.find(s => s.id === seriesId);
            const index = enabledSeries.findIndex(s => s.id === seriesId);
            const base =
                seriesConfig?.config.color ||
                chart.config.color ||
                `hsl(${(index * 137.5) % 360}, 70%, 50%)`;

            return applyAlpha(base, opacity);
        },
        [enabledSeries, chart.config.color]
    );

    // There is a bug in bar order when shuffling them multiple times. This forces a re-render when the series order changes.
    const chartKey = useMemo(() => {
        return `${chart.id}-${enabledSeries.map(s => s.id).join('-')}`;
    }, [chart, enabledSeries]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart key={chartKey} data={timeSeriesData} margin={{ top: 30, right: 50, left: 30, bottom: 20 }}>
                <ChartContainer chart={chart}>
                    {enabledSeries.map((series) => (
                        <Bar
                            key={series.id}
                            dataKey={`${series.id}.value`}
                            name={series.label || 'Untitled'}
                            fill={getSeriesColor(series.id)}
                            fillOpacity={0.8}
                            animationDuration={300}
                            animationEasing="ease-in-out"
                        >
                            {(series.config.showDataLabels || chart.config.showDataLabels) && (
                                <LabelList
                                    dataKey={`${series.id}.value`}
                                    offset={30}
                                    content={(props) => <ChartLabel {...props} series={series} dataLabelFormatter={dataLabelFormatter} getSeriesColor={getSeriesColor} isRelative={isRelative} />}
                                    formatter={(label: unknown) => dataLabelFormatter(Number(label as number), isRelative)}
                                />
                            )}
                        </Bar>
                    )
                    )}
                </ChartContainer>
            </BarChart>
        </ResponsiveContainer>
    );
} 