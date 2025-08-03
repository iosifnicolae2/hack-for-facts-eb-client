import { ResponsiveContainer, Sankey, Tooltip, Layer } from 'recharts';
import { useAggregatedData } from '@/components/charts/hooks/useAggregatedData';
import { ChartRendererProps } from '../ChartRenderer';
import { CustomSeriesTooltip } from '../Tooltips';
import { useMemo, memo, useCallback, SVGProps, ReactElement } from 'react';
import { AlertTriangle } from 'lucide-react';
import { yValueFormatter } from '../../utils';

// Constants
const CHART_MARGINS = {
    top: 50,
    right: 120,
    bottom: 20,
    left: 320,
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

// Types
interface SankeyNode {
    name: string;
    color: string;
    value: number;
}

export interface NodeProps extends Omit<SVGProps<SVGRectElement>, 'height' | 'width'> {
    height: number;
    width: number;
    payload: SankeyNode;
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
    nodes: SankeyNode[];
    links: SankeyLink[];
}

interface SankeyNodeProps {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    payload: SankeyNode;
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
                    fill={payload.color}
                    fillOpacity="1"
                    role="img"
                    aria-label={`${payload.name}: ${yValueFormatter(payload.value, false, 'RON')}`}
                />
                <text
                    textAnchor={textAnchor}
                    x={textX}
                    y={centerY}
                    fontSize={NODE_CONFIG.fontSize.label}
                    fill={THEME.node.text}
                    opacity={THEME.node.textOpacity.primary}
                >
                    {payload.name}
                </text>
                <text
                    textAnchor={textAnchor}
                    x={textX}
                    y={centerY + 15}
                    fontSize={NODE_CONFIG.fontSize.value}
                    fill={THEME.node.text}
                    opacity={THEME.node.textOpacity.secondary}
                >
                    {yValueFormatter(payload.value, false, 'RON')}
                </text>
            </Layer>
        );
    }
);

SankeyNodeComponent.displayName = 'SankeyNodeComponent';

// Error display component
const MultiUnitError: React.FC<{ units: string[]; height: number }> = memo(({ units, height }) => (
    <div
        className="flex flex-col items-center justify-center h-full text-muted-foreground p-4"
        style={{ height }}
        role="alert"
        aria-live="polite"
    >
        <AlertTriangle className="w-12 h-12 text-amber-500" aria-hidden="true" />
        <h3 className="mt-4 text-center text-lg font-medium">Multiple units selected</h3>
        <p className="text-sm text-center mt-2 max-w-md">
            Sankey charts cannot effectively display series with different units
            ({units.join(', ')}). Please select series with the same unit.
        </p>
    </div>
));

MultiUnitError.displayName = 'MultiUnitError';

// Helper function to prepare Sankey data
const prepareSankeyData = (aggregatedData: Array<{ label: string; color: string; value: number }>): SankeyData => {
    if (!aggregatedData || aggregatedData.length === 0) {
        return { nodes: [], links: [] };
    }

    const totalValue = aggregatedData.reduce((acc, d) => acc + d.value, 0);

    const nodes: SankeyNode[] = [
        ...aggregatedData.map((d) => ({
            name: d.label,
            color: d.color,
            value: d.value
        })),
        {
            name: 'Total',
            color: THEME.total.color,
            value: totalValue
        },
    ];

    const links: SankeyLink[] = aggregatedData.map((_, index) => ({
        source: index,
        target: aggregatedData.length, // Total node index
        value: aggregatedData[index].value,
    }));

    return { nodes, links };
};


export function AggregatedSankeyChart({ chart, data, height }: ChartRendererProps) {
    const { aggregatedData, units } = useAggregatedData(chart, data);

    // Memoize Sankey data preparation
    const sankeyData = useMemo(
        () => prepareSankeyData(aggregatedData),
        [aggregatedData]
    );


    // Memoize node renderer to prevent recreation on every render
    const nodeRenderer: SankeyNodeOptions = useCallback(
        (props: NodeProps) => <SankeyNodeComponent {...props} containerWidth={props.width} />,
        []
    );

    // Handle multiple units error case
    if (units.length > 1) {
        return <MultiUnitError units={units} height={height ?? 0} />;
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
                node={(props) => nodeRenderer(props as unknown as NodeProps)} // TODO: fix this
                margin={CHART_MARGINS}
                link={{
                    stroke: THEME.link.color,
                    strokeOpacity: THEME.link.opacity
                }}
            >
                <Tooltip
                    content={({ active, payload }) => (
                        <CustomSeriesTooltip
                            active={active}
                            payload={payload?.map(p => p.payload)}
                            chartConfig={chart.config}
                            chart={chart}
                        />
                    )}
                />
            </Sankey>
        </ResponsiveContainer>
    );
}