import { ResponsiveContainer, Sankey, Tooltip, Layer } from 'recharts';
import { ChartRendererProps } from '../ChartRenderer';
import { CustomSeriesTooltip } from '../Tooltips';
import { useMemo, memo, SVGProps, ReactElement } from 'react';
import { AlertTriangle } from 'lucide-react';
import { yValueFormatter } from '../../utils';
import { DataPointPayload } from '@/components/charts/hooks/useChartData';
import { ChartMargins } from '../interfaces';

// Constants
const CHART_MARGINS: ChartMargins = {
    top: 50,
    right: 30,
    bottom: 30,
    left: 120,
} as const;

const NODE_CONFIG = {
    width: 10,
    padding: 50,
    labelOffset: 6,
    fontSize: {
        label: 14,
        value: 12,
    },
} as const;

const THEME = {
    node: {
        text: '#333',
        textOpacity: {
            primary: 1,
            secondary: 0.8,
        },
    },
    link: {
        color: '#B3B3B3',
        opacity: 0.5,
    },
    total: {
        color: '#A9A9A9',
    },
} as const;

export interface NodeProps extends Omit<SVGProps<SVGRectElement>, 'height' | 'width'> {
    height: number;
    width: number;
    payload: DataPointPayload;
    index: number;
    x: number;
    y: number;
}

export type SankeyNodeOptions = (props: NodeProps) => ReactElement<SVGProps<SVGRectElement>>;

interface SankeyLink {
    source: number;
    target: number;
    value: number;
}

interface SankeyData {
    nodes: DataPointPayload[];
    links: SankeyLink[];
}

interface SankeyNodeProps {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    payload: DataPointPayload;
    containerWidth: number;
}

// Memoized node component for better performance
const SankeyNodeComponent = memo<SankeyNodeProps>(
    ({ x, y, width, height, index, payload, containerWidth }) => {
        const isOut = x + width + NODE_CONFIG.labelOffset > containerWidth;
        const textX = isOut ? x - NODE_CONFIG.labelOffset : x + width + NODE_CONFIG.labelOffset;
        const textAnchor = isOut ? 'end' : 'start';
        const centerY = y + height / 2;

        return (
            <Layer key={`CustomNode${index}`}>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={payload.series.config.color}
                    fillOpacity="1"
                    role="img"
                    aria-label={`${payload.series.label}: ${yValueFormatter(payload.value, payload.unit)}`}
                />
                <text
                    textAnchor={textAnchor}
                    x={textX}
                    y={centerY}
                    fontSize={NODE_CONFIG.fontSize.label}
                    fill={THEME.node.text}
                    opacity={THEME.node.textOpacity.primary}
                >
                    {payload.series.label}
                </text>
                <text
                    textAnchor={textAnchor}
                    x={textX}
                    y={centerY + 15}
                    fontSize={NODE_CONFIG.fontSize.value}
                    fill={THEME.node.text}
                    opacity={THEME.node.textOpacity.secondary}
                >
                    {yValueFormatter(payload.value, payload.unit)}
                </text>
            </Layer>
        );
    }
);

SankeyNodeComponent.displayName = 'SankeyNodeComponent';

// Error display component
const MultiUnitError: React.FC<{ units: string[]; height: number }> = memo(({ units, height }) => (
    <div
        className="h-full p-4 "
        role="alert"
        aria-live="polite"
        style={{ height }}
    >
        <div className="flex flex-col items-center justify-center text-muted-foreground m-30">
            <AlertTriangle className="w-12 h-12 text-amber-500" aria-hidden="true" />
            <h3 className="mt-4 text-center text-lg font-medium">Multiple units selected</h3>
            <p className="text-sm text-center mt-2 max-w-md">
                Sankey charts cannot effectively display series with different units
                ({units.join(', ')}). Please select series with the same unit.
            </p>
        </div>
    </div>
));

MultiUnitError.displayName = 'MultiUnitError';

// Helper function to prepare Sankey data
const prepareSankeyData = (aggregatedData: DataPointPayload[]): SankeyData => {
    if (!aggregatedData || aggregatedData.length === 0) {
        return { nodes: [], links: [] };
    }

    const totalValue = aggregatedData.reduce((acc, d) => acc + d.value, 0);
    const unit = aggregatedData[0]?.unit;
    const year = aggregatedData[0]?.year;

    // Filter smaller values
    const aggregatedDataDisplayed = aggregatedData.filter(d => d.value > 1);

    // Node for the total value
    const totalNode: DataPointPayload = {
        value: totalValue,
        unit: unit,
        initialValue: totalValue,
        initialUnit: unit,
        year: year,
        id: 'total',
        series: {
            id: 'total',
            label: 'Total',
            config: {
                color: THEME.total.color,
            },
        },
    }

    const nodes: DataPointPayload[] = [
        ...aggregatedDataDisplayed,
        totalNode,
    ];

    const links: SankeyLink[] = aggregatedDataDisplayed.map((_, index) => ({
        source: index,
        target: aggregatedDataDisplayed.length, // Total node index
        value: aggregatedDataDisplayed[index].value,
    }));

    return { nodes, links };
};


export function AggregatedSankeyChart({ chart, aggregatedData, unitMap, height, margins }: ChartRendererProps) {
    const units = new Set(unitMap.values());
    // Memoize Sankey data preparation
    const sankeyData = useMemo(
        () => prepareSankeyData(aggregatedData),
        [aggregatedData]
    );

    // Handle multiple units error case
    if (units.size > 1) {
        return <MultiUnitError units={Array.from(units)} height={height ?? 0} />;
    }

    // Handle empty data case
    if (sankeyData.nodes.length === 0) {
        return (
            <div
                className="flex items-center justify-center h-full text-muted-foreground"
                style={{ height }}
            >
                <p>No data available</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <Sankey
                data={sankeyData}
                nodePadding={NODE_CONFIG.padding}
                nodeWidth={NODE_CONFIG.width}
                linkCurvature={0.5}
                iterations={32}
                node={(props) => <SankeyNodeComponent {...props} payload={props.payload as unknown as DataPointPayload} containerWidth={props.width} />}
                margin={{ ...CHART_MARGINS, ...margins }}
                link={{
                    stroke: THEME.link.color,
                    strokeOpacity: THEME.link.opacity
                }}
            >
                {chart.config.showTooltip && (
                    <Tooltip
                        content={(props) => (
                            <CustomSeriesTooltip
                                {...props}
                                payload={props.payload?.map(p => ({
                                    ...p.payload,
                                    dataKey: 'source.value',
                                }))}
                                chartConfig={chart.config}
                                chart={chart}
                            />
                        )}
                    />
                )}
            </Sankey>
        </ResponsiveContainer>
    );
}