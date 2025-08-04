import { BarChart, Bar, ResponsiveContainer, LabelList, ReferenceArea } from 'recharts';
import { MultiAxisChartContainer } from './MultiAxisChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { useCallback, useMemo } from 'react';
import { applyAlpha, generateRandomColor, yValueFormatter } from '../utils';
import { ChartLabel } from './ChartLabel';
import { DataPointPayload } from '@/components/charts/hooks/useChartData';
import { useChartDiff } from '../hooks/useChartDiff';
import { DiffLabel } from './DiffLabel';

export function TimeSeriesBarChart({ chart, timeSeriesData, unitMap, onAnnotationPositionChange }: ChartRendererProps) {
    const enabledSeries = chart.series.filter(s => s.enabled);
    const {
        refAreaLeft,
        refAreaRight,
        diffs,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        clearSelection,
    } = useChartDiff(timeSeriesData, enabledSeries);

    const getSeriesColor = useCallback(
        (seriesId: string, opacity = 1): string => {
            const seriesConfig = enabledSeries.find(s => s.id === seriesId);
            const base =
                seriesConfig?.config.color ||
                chart.config.color ||
                generateRandomColor();

            return applyAlpha(base, opacity);
        },
        [enabledSeries, chart.config.color]
    );

    const chartKey = useMemo(() => {
        return `${chart.id}-${enabledSeries.map(s => s.id).join('-')}`;
    }, [chart, enabledSeries]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                key={chartKey}
                data={timeSeriesData}
                margin={{ top: 30, right: 50, left: 50, bottom: 20 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={clearSelection}
            >
                <MultiAxisChartContainer chart={chart} unitMap={unitMap} onAnnotationPositionChange={onAnnotationPositionChange}>
                    {(getYAxisId: (seriesId: string) => string) => (
                        <>
                            {enabledSeries.map((series) => (
                                <Bar
                                    key={series.id}
                                    yAxisId={getYAxisId(series.id)}
                                    dataKey={`${series.id}.value`}
                                    name={series.label || 'Untitled'}
                                    fill={getSeriesColor(series.id)}
                                    fillOpacity={0.8}
                                    animationDuration={300}
                                    animationEasing="ease-in-out"
                                >
                                    <LabelList
                                        dataKey={series.id}
                                        offset={30}
                                        content={(props) => {
                                            const isShowLabels = series.config.showDataLabels || chart.config.showDataLabels;
                                            if (!isShowLabels) {
                                                return null;
                                            }

                                            const payload = props.value as unknown as DataPointPayload
                                            const dataLabels = series.config.dataLabels || []
                                            const year = String(payload.year)
                                            if (dataLabels.length > 0 && !dataLabels.includes(year)) {
                                                return null;
                                            }
                                            return (
                                                <ChartLabel
                                                    {...props}
                                                    value={payload.value}
                                                    series={series}
                                                    dataLabelFormatter={(value) => yValueFormatter(value, payload.unit)}
                                                    color={series.config.color}
                                                />
                                            )
                                        }}
                                        formatter={(label: unknown) => yValueFormatter(Number(label as number), '')}
                                    />
                                </Bar>
                            ))}
                            {refAreaLeft && refAreaRight && (
                                <ReferenceArea
                                    yAxisId={getYAxisId(enabledSeries[0]?.id)}
                                    x1={refAreaLeft}
                                    x2={refAreaRight}
                                    stroke="#3399FF"
                                    strokeOpacity={0.7}
                                    fill="#3399FF"
                                    fillOpacity={0.1}
                                    ifOverflow="visible"
                                    label={<DiffLabel data={diffs} start={refAreaLeft} end={refAreaRight} />}
                                />
                            )}
                        </>
                    )}
                </MultiAxisChartContainer>
            </BarChart>
        </ResponsiveContainer>
    );
}
