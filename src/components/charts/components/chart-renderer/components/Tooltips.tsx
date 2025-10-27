import { Chart } from '@/schemas/charts';
import { useMemo, type ReactNode } from 'react';
import { yValueFormatter } from '../utils';
import { SeriesId, DataPointPayload } from '../../../hooks/useChartData';
import { Trans } from '@lingui/react/macro';

// ---------------------------------------------------------------------------
// Time-Series Tooltip
// ---------------------------------------------------------------------------


interface CustomSeriesTooltipProps {
    active?: boolean;
    payload?: Array<{ dataKey: any; payload: Record<SeriesId, DataPointPayload> | any; name?: string; color?: string } | DataPointPayload>;
    label?: string | number;
    chartConfig: Chart['config'];
    chart?: Chart;
}

export function CustomSeriesTooltip({
    active,
    payload,
    label,
    chartConfig,
}: CustomSeriesTooltipProps): ReactNode {

    const isAggregated = chartConfig.chartType.endsWith('-aggr');

    const mappedPayload = useMemo(() => {
        if (!payload) return [];

        const resolved = payload.map((entry) => {
            // Aggregated charts pass DataPointPayload directly
            if (!('payload' in entry)) {
                return entry as DataPointPayload;
            }

            const row = entry.payload as Record<SeriesId, DataPointPayload> | undefined;
            if (!row) return undefined;

            // When dataKey is a string like `${seriesId}.value`, preserve legacy behavior
            if (typeof (entry as any).dataKey === 'string') {
                const dk = String((entry as any).dataKey);
                const seriesId = dk.split('.')[0];
                const customPayload = (row as any)[seriesId];
                if (customPayload) return customPayload as DataPointPayload;
            }

            // For function dataKeys, match by series label first, then by color as fallback
            const name = (entry as any).name as string | undefined;
            const color = (entry as any).color as string | undefined;
            const candidates = Object.values(row).filter((v: any) => v && typeof v === 'object' && 'series' in v && 'value' in v) as DataPointPayload[];

            if (name) {
                const byLabel = candidates.find((v) => v.series?.label === name);
                if (byLabel) return byLabel;
            }
            if (color) {
                const byColor = candidates.find((v) => v.series?.config?.color === color);
                if (byColor) return byColor;
            }

            // Fallback: return the first candidate for this entry
            return candidates[0];
        })
            .filter((p): p is DataPointPayload => !!p && !!(p as any).id)
            .sort((a, b) => b.value - a.value);

        return resolved;
    }, [payload]);

    if (!active || !mappedPayload || mappedPayload.length === 0) return null;

    // Prefer the original per-series label (first payload entry) if present
    const headerLabel = (mappedPayload[0] as DataPointPayload | undefined)?.originalLabel ?? label;

    return (
        <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 important:z-50 select-none">
            <div className="font-semibold text-foreground mb-2 text-center border-b pb-1">
                {isAggregated ? <Trans>Aggregated data</Trans> : <Trans>Year {headerLabel}</Trans>}
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
