import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useAggregatedData } from '@/components/charts/hooks/useAggregatedData';
import { ChartRendererProps } from '../ChartRenderer';
import { AlertTriangle } from 'lucide-react';
import { CustomSeriesTooltip } from '../Tooltips';

export function AggregatedPieChart({ chart, data, height }: ChartRendererProps) {
    const { aggregatedData, units } = useAggregatedData(chart, data);

    if (units.length > 1) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground" style={{ height }}>
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <p className="mt-4 text-center text-lg">Multiple units selected</p>
                <p className="text-sm text-center">Pie charts cannot effectively display series with different units ({units.join(', ')}).</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 60, right: 20, bottom: 60, left: 20 }}>
                <Pie
                    data={aggregatedData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        if (percent === undefined || midAngle === undefined || cx === undefined || cy === undefined || innerRadius === undefined || outerRadius === undefined) return null;
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return (
                            <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        );
                    }}
                >
                    {aggregatedData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={({ active, payload }) => <CustomSeriesTooltip active={active} payload={payload?.map(p => p.payload)} chartConfig={chart.config} chart={chart} />} />
                <Legend
                    verticalAlign="bottom"
                    layout="horizontal"
                    align="center"
                    wrapperStyle={{ bottom: 20, left: 20, right: 20 }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
