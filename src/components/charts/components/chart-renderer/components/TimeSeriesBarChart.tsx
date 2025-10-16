import { Bar, BarChart, LabelList, ResponsiveContainer } from 'recharts';
import { MultiAxisChartContainer } from './MultiAxisChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { ChartLabel } from './ChartLabel';
import { DataPointPayload } from '@/components/charts/hooks/useChartData';
import { yValueFormatter } from '../utils';
import { useChartDiff } from '../hooks/useChartDiff';
import { DiffArea } from './diff-select/DiffArea';
import { useChartAnimation } from '../hooks/useChartAnimation';
import { useMemo } from 'react';

export function TimeSeriesBarChart({ chart, unitMap, timeSeriesData, onAnnotationPositionChange, margins }: ChartRendererProps) {
  const enabledSeries = useMemo(() => chart.series.filter(s => s.enabled), [chart.series]);
  const { isAnimationActive, animationDuration } = useChartAnimation({ duration: 300 });

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearSelection,
    refAreaLeft,
    refAreaRight,
    diffs,
  } = useChartDiff(timeSeriesData, enabledSeries);
  const diffEnabled = chart.config.showDiffControl && !!refAreaLeft && !!refAreaRight && enabledSeries.length > 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={timeSeriesData}
        margin={{ top: 30, right: 50, left: 50, bottom: 20, ...margins }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={clearSelection}
      >
        <MultiAxisChartContainer disableTooltip={diffEnabled} chart={chart} unitMap={unitMap} onAnnotationPositionChange={onAnnotationPositionChange}>
          {(getYAxisId: (seriesId: string) => string) => (
            <>
              {enabledSeries.map((series) => (
                <Bar
                  key={series.id}
                  yAxisId={getYAxisId(series.id)}
                  dataKey={`${series.id}.value`}
                  name={series.label || 'Untitled'}
                  fill={series.config.color}
                  isAnimationActive={isAnimationActive}
                  animationDuration={animationDuration}
                  animationEasing="ease-in-out"
                >
                  <LabelList
                    dataKey={`${series.id}`}
                    offset={30}
                    content={(props) => {
                      const isShowLabels = series.config.showDataLabels || chart.config.showDataLabels;
                      if (!isShowLabels) return null;
                      const payload = props.value as unknown as DataPointPayload;
                      const dataLabels = series.config.dataLabels || [];
                      if (dataLabels.length > 0 && !dataLabels.includes(String(payload.year))) return null;
                      return (
                        <ChartLabel
                          {...props}
                          value={payload.value}
                          series={series}
                          dataLabelFormatter={(value) => yValueFormatter(value, payload.unit)}
                          color={series.config.color}
                        />
                      );
                    }}
                  />
                </Bar>
              ))}
              {diffEnabled && (
                <DiffArea
                  yAxisId={getYAxisId(enabledSeries[0].id)}
                  refAreaLeft={refAreaLeft}
                  refAreaRight={refAreaRight}
                  diffs={diffs}
                />
              )}
            </>
          )}
        </MultiAxisChartContainer>
      </BarChart>
    </ResponsiveContainer>
  );
}
