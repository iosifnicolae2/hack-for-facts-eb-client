import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { Chart } from '@/schemas/charts';
import type { ReactNode } from 'react';
import { getYearRangeText } from '../utils';
import { AggregatedDataPoint } from '@/components/charts/hooks/useAggregatedData';
import { TimeSeriesDataPoint, SeriesValue } from '../hooks/useChartData';

// ---------------------------------------------------------------------------
// Time-Series Tooltip
// ---------------------------------------------------------------------------


interface TimeSeriesTooltipEntry {
    dataKey: string; // e.g. "SeriesLabel.value"
    name: string;
    color: string;
    value?: number;
    payload: TimeSeriesDataPoint;
}

interface CustomSeriesTooltipProps {
    active?: boolean;
    payload?: (TimeSeriesTooltipEntry | AggregatedDataPoint)[];
    label?: string | number;
    chartConfig: Chart['config'];
    chart?: Chart;
}

export function CustomSeriesTooltip({
    active,
    payload,
    label,
    chartConfig,
    chart,
}: CustomSeriesTooltipProps): ReactNode {
    if (!active || !payload || payload.length === 0) return null;

    const isRelative = chartConfig.showRelativeValues ?? false;

    const mappedPayload = payload.map((entry) => {
        if ('dataKey' in entry) { 
            const seriesId = entry.dataKey.split('.')[0];
            const seriesData = entry.payload[seriesId] as SeriesValue | undefined;
            return {
                id: seriesId,
                label: entry.name,
                value: entry.value ?? 0,
                color: entry.color,
                absolute: seriesData?.absolute ?? 0,
                unit: chart?.series.find(s => s.id === seriesId)?.unit || 'RON',
            };
        }
        return entry as AggregatedDataPoint; 
    }).sort((a, b) => b.value - a.value);


    const isAggregated = chartConfig.chartType.endsWith('-aggr');
    const yearRangeText = isAggregated && chart ? getYearRangeText(chart as Chart) : undefined;

    return (
        <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 important:z-50">
            <div className="font-semibold text-foreground mb-2 text-center border-b pb-1">
                {isAggregated ? `Date agregate ${yearRangeText}` : `Anul ${label}`}
            </div>

            <div className="flex flex-col p-4 gap-6">
                {mappedPayload.map((entry) => {
                    const series = chart?.series.find(s => s.id === entry.id);

                    const formatValue = (value: number, unit: string) => {
                        if (unit === '%') {
                            return `${formatNumberRO(value)}%`;
                        }
                        if (unit === 'RON') {
                            return formatCurrency(value, 'compact');
                        }
                        return `${formatNumberRO(value)} ${unit}`;
                    };

                    const formatAbsolute = (value: number, unit: string) => {
                        if (unit === '%') {
                            return `${formatNumberRO(value)}%`;
                        }
                        if (unit === 'RON') {
                            return formatCurrency(value, 'standard');
                        }
                        return `${formatNumberRO(value)} ${unit}`;
                    };

                    return (
                        <div
                            key={entry.id}
                            className="flex items-center gap-3 min-w-[140px]"
                        >
                            <span
                                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                            />
                            <div className="flex flex-row justify-between gap-6 items-center w-full">
                                <span className="font-medium text-sm text-foreground truncate">
                                    {entry.label}
                                </span>
                                <div className="flex flex-col items-end">
                                    {isRelative && (series?.config as { isRelative?: boolean })?.isRelative ? (
                                        <span className="font-semibold">
                                            {(entry.value ?? 0).toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-sm font-semibold">
                                            {formatValue(entry.value ?? 0, entry.unit)}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {formatAbsolute(entry.absolute ?? entry.value, entry.unit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
 