import { Chart } from '@/schemas/charts';
import { useMemo, type ReactNode } from 'react';
import { getYearRangeText, yValueFormatter } from '../utils';
import { SeriesId, DataPointPayload } from '../../../hooks/useChartData';
import { Trans } from '@lingui/react/macro';

// ---------------------------------------------------------------------------
// Time-Series Tooltip
// ---------------------------------------------------------------------------


interface CustomSeriesTooltipProps {
    active?: boolean;
    payload?: Array<{ dataKey: string, payload: Record<SeriesId, DataPointPayload> }> | DataPointPayload[];
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

    const isAggregated = chartConfig.chartType.endsWith('-aggr');
    const yearRangeText = isAggregated && chart ? getYearRangeText(chart as Chart) : undefined;

    const mappedPayload = useMemo(() => {
        if (!payload) {
            return [];
        }
        return payload.map((entry) => {
            if ('dataKey' in entry) {
                const seriesId = entry.dataKey.split('.')[0]; // the dataKey has the format: ${seriesId}.value
                const customPayload = entry.payload[seriesId];
                if (customPayload) {
                    return customPayload as DataPointPayload;
                }
            } else if ('payload' in entry) {
                return entry.payload as DataPointPayload;
            }
            return entry as DataPointPayload;
        }).filter(p => p.id).sort((a, b) => b.value - a.value);
    }, [payload]);

    if (!active || !mappedPayload || mappedPayload.length === 0) return null;

    return (
        <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 important:z-50 select-none">
            <div className="font-semibold text-foreground mb-2 text-center border-b pb-1">
                {isAggregated ? <Trans>Aggregated data</Trans> : <Trans>Year {label}</Trans>}
            </div>

            <div className="flex flex-col p-4 gap-6">
                {mappedPayload.map((dataPoint) => {
                    const { value, unit, initialValue, initialUnit } = dataPoint;

                    const primaryDisplayValue = yValueFormatter(value, unit, 'compact');
                    const secondaryDisplayValue = yValueFormatter(initialValue, initialUnit, 'standard');

                    return (
                        <div
                            key={dataPoint.id}
                            className="flex items-center gap-3 min-w-[140px]"
                        >
                            <span
                                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: dataPoint.series?.config.color }}
                            />
                            <div className="flex flex-row justify-between gap-6 items-center w-full">
                                <span className="font-medium text-sm text-foreground truncate">
                                    {dataPoint.series?.label}
                                </span>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-semibold">
                                        {primaryDisplayValue}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {secondaryDisplayValue}
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
