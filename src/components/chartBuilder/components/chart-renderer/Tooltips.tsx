import { formatCurrency } from '@/lib/utils';
import { Chart } from '@/schemas/charts';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Pie Tooltip
// ---------------------------------------------------------------------------

interface PieTooltipPayload {
    payload: {
        name: string;
        value: number;
        fill: string;
    };
}

interface CustomPieTooltipProps {
    active?: boolean;
    payload?: PieTooltipPayload[];
}

export function CustomPieTooltip({ active, payload }: CustomPieTooltipProps): ReactNode {
    if (!active || !payload || payload.length === 0) return null;

    const { name, value, fill } = payload[0].payload;

    return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 flex items-center space-x-4">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: fill }} />
            <div>
                <div className="font-medium text-sm text-foreground">{name}</div>
                <div className="text-sm text-muted-foreground">{formatCurrency(value)}</div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Time-Series Tooltip
// ---------------------------------------------------------------------------

type SeriesValue = {
    value: number;
    absolute: number;
};

type TimeSeriesDataPoint = { year: number } & Record<string, SeriesValue>;

interface TimeSeriesTooltipEntry {
    dataKey: string; // e.g. "SeriesLabel.value"
    name: string;
    color: string;
    value?: number;
    payload: TimeSeriesDataPoint;
}

interface CustomTimeSeriesTooltipProps {
    active?: boolean;
    payload?: TimeSeriesTooltipEntry[];
    label?: string | number;
    chartConfig: Chart['config'];
}

export function CustomTimeSeriesTooltip({
    active,
    payload,
    label,
    chartConfig,
}: CustomTimeSeriesTooltipProps): ReactNode {
    if (!active || !payload || payload.length === 0) return null;

    const isRelative = chartConfig.showRelativeValues ?? false;

    const sortedPayload = payload.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4">
            <div className="font-semibold text-foreground mb-2 text-center border-b pb-1">
                Year {label}
            </div>

            <div className="flex flex-col p-4 gap-6">
                {sortedPayload.map((entry) => {
                    // Extract series label from dataKey e.g. "SeriesLabel.value" → "SeriesLabel"
                    const seriesLabel = entry.dataKey.split('.')[0];
                    const absolute = (entry.payload as TimeSeriesDataPoint)[seriesLabel]?.absolute ?? 0;

                    return (
                        <div
                            key={entry.dataKey}
                            className="flex items-center gap-3 min-w-[140px]"
                        >
                            <span
                                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                            />
                            <div className="flex flex-row justify-between gap-6 items-center w-full">
                                <span className="font-medium text-sm text-foreground truncate">
                                    {entry.name}
                                </span>
                                <div className="flex flex-col items-end">
                                    {isRelative ? (
                                        <span className="font-semibold">
                                            {(entry.value ?? 0).toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-sm font-semibold">
                                            {formatCurrency(entry.value ?? 0, 'compact')}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {formatCurrency(absolute, 'standard')}
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