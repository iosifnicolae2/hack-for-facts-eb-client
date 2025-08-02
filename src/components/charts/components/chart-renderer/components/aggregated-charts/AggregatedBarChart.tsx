import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { useAggregatedData } from '@/components/charts/hooks/useAggregatedData';
import { ChartRendererProps } from '../ChartRenderer';
import { yValueFormatter } from '../../utils';
import { ReactNode } from 'react';
import { CustomSeriesTooltip } from '../Tooltips';

interface CustomYAxisTickProps {
    y?: number;
    payload?: { value: string };
    width?: number;
}

const CustomYAxisTick = ({ y, payload, width }: CustomYAxisTickProps) => {
    if (!payload) return null;
    return (
        <g transform={`translate(0,${y})`}>
            <text x={0} y={0} dy={4} width={width} textAnchor="start" fill="#666" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {payload.value}
            </text>
        </g>
    );
};

export function AggregatedBarChart({ chart, data, height }: ChartRendererProps) {
    const { aggregatedData, units } = useAggregatedData(chart, data);
    const displayUnit = units[0] || 'RON';

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={aggregatedData} layout="vertical" margin={{ top: 50, right: 40, left: 120, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    type="number"
                    tickFormatter={(value) => yValueFormatter(value, false, displayUnit)}
                />
                <YAxis
                    dataKey="label"
                    type="category"
                    width={100}
                    tick={<CustomYAxisTick width={100} />}
                    interval={0}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
                    content={({ active, payload }) => <CustomSeriesTooltip active={active} payload={payload?.map(p => p.payload)} chartConfig={chart.config} chart={chart} />}
                />
                <Bar dataKey="value" background={{ fill: '#eee' }}>
                    {aggregatedData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                    ))}
                    <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(label: ReactNode) => {
                            if (typeof label === 'number') {
                                return yValueFormatter(label, false, displayUnit);
                            }
                            return null;
                        }}
                        style={{ fill: 'black', fontSize: 12 }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
