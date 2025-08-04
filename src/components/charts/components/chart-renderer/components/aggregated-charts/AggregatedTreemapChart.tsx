import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartRendererProps } from '../ChartRenderer';
import { CustomSeriesTooltip } from '../Tooltips';
import { AlertTriangle, Info } from 'lucide-react';
import { useMemo } from 'react';
import { yValueFormatter } from '../../utils';
import { DataPointPayload } from '@/components/charts/hooks/useChartData';

const MIN_WIDTH_FOR_LABEL = 80;
const MIN_HEIGHT_FOR_LABEL = 25;
const MIN_HEIGHT_FOR_VALUE = 45;

interface CustomizedContentProps {
    depth: number;
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    payload?: DataPointPayload;
}

const CustomizedContent: React.FC<CustomizedContentProps> = (props) => {
    const { depth, x, y, width, height, payload } = props;

    if (!payload || isNaN(payload.value) || !payload.series.config.color) {
        return null;
    }

    const displayValue = yValueFormatter(payload.value, payload.unit, 'compact');
    const textColor = '#000000';

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: payload.series.config.color,
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {width > MIN_WIDTH_FOR_LABEL && height > MIN_HEIGHT_FOR_LABEL && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={14}
                    style={{ pointerEvents: 'none' }}
                >
                    {payload.series.label}
                </text>
            )}
            {width > MIN_WIDTH_FOR_LABEL && height > MIN_HEIGHT_FOR_VALUE && (
                <text x={x + 4} y={y + 18} fill={textColor} fontSize={12} fillOpacity={0.9}>
                    {displayValue}
                </text>
            )}
        </g>
    );
};

export type TreemapData = {
    name: string;
    value: number;
    children: TreemapData[];
    payload?: DataPointPayload;
}

export function AggregatedTreemapChart({ chart, aggregatedData, unitMap, height }: ChartRendererProps) {
    const units = new Set(unitMap.values());

    const treemapData: TreemapData[] = useMemo(() => {
        if (!aggregatedData || aggregatedData.length === 0) {
            return [];
        }

        const totalValue = aggregatedData.reduce((acc, item) => acc + item.value, 0);

        console.log("aggregatedData", aggregatedData, totalValue);

        return [{
            name: 'Aggregated Data',
            value: totalValue,
            children: aggregatedData.map(item => ({
                name: item.series.label,
                value: item.value,
                payload: item,
                children: [],
            })),
        }];
    }, [aggregatedData]);

    if (units.size > 1) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground" style={{ height }}>
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <p className="mt-4 text-center text-lg">Multiple units selected</p>
                <p className="text-sm text-center">Treemaps cannot effectively display series with different units ({Array.from(units).join(', ')}).</p>
            </div>
        );
    }

    if (!treemapData || treemapData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground" style={{ height }}>
                <Info className="w-12 h-12 text-blue-500" />
                <p className="mt-4 text-center text-lg">No data available</p>
                <p className="text-sm text-center">There is no data to display for the selected filters.</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={height} style={{ padding: '2rem' }}>
            <Treemap
                data={treemapData}
                dataKey="value"
                nameKey="name"
                animationEasing="ease-in-out"
                animationDuration={300}
                animationBegin={0}
                content={(props) => <CustomizedContent {...(props)} />}
            >
                <Tooltip
                    content={({ active, payload }) => <CustomSeriesTooltip active={active} payload={payload.map(p => p.payload)} chartConfig={chart.config} chart={chart} />}
                />
            </Treemap>
        </ResponsiveContainer>
    );
}
