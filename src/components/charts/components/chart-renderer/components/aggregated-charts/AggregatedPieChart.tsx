import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ChartRendererProps } from '../ChartRenderer';
import { AlertTriangle } from 'lucide-react';
import { CustomSeriesTooltip } from '../Tooltips';
import { yValueFormatter } from '../../utils';

export function AggregatedPieChart({ chart, aggregatedData, unitMap, height }: ChartRendererProps) {

    const units = new Set(unitMap.values());
    if (units.size > 1) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground" style={{ height }}>
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <p className="mt-4 text-center text-lg">Multiple units selected</p>
                <p className="text-sm text-center">Pie charts cannot effectively display series with different units ({Array.from(units).join(', ')}).</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 60, right: 20, bottom: 60, left: 20 }}>
                <Pie
                    data={aggregatedData}
                    dataKey="value"
                    nameKey="series.label"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    labelLine={false}
                    animationEasing="ease-in-out"
                    animationDuration={300}
                    animationBegin={0}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
                        if (percent === undefined || midAngle === undefined || cx === undefined || cy === undefined || innerRadius === undefined || outerRadius === undefined) return null;
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        const align = x > cx ? 'start' : 'end';
                        const xLabel = x + (align === 'start' ? 40 : -40);
                        return (
                            <g>
                                <text x={x} y={y} textAnchor={align} dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                {chart.config.showDataLabels && payload && (
                                    <text x={xLabel} y={y} fill={payload.series.config.color} textAnchor={align} dominantBaseline="central">
                                        {align === 'start' ? ' - ' : ''} {`${payload.series.label} (${yValueFormatter(payload.initialValue, payload.initialUnit, 'compact')})`} {align === 'start' ? '' : ' - '}
                                    </text>
                                )}
                            </g>
                        );
                    }}
                >
                    {aggregatedData.map((entry) => (
                        <Cell key={entry.id} fill={entry.series.config.color} />
                    ))}
                </Pie>
                {chart.config.showTooltip && (
                    <Tooltip content={(props) => (
                        <CustomSeriesTooltip
                            {...props}
                            payload={props.payload?.map(p => p.payload)}
                            chartConfig={chart.config}
                            chart={chart}
                        />
                    )} />
                )}

                {chart.config.showLegend && (
                    <Legend
                        verticalAlign="bottom"
                        layout="horizontal"
                        align="center"
                        wrapperStyle={{ bottom: 20, left: 20, right: 20 }}
                    />
                )}
            </PieChart>
        </ResponsiveContainer>
    );
}
