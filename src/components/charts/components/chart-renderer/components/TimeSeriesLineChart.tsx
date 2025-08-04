import { LabelList, Line, LineChart, ResponsiveContainer } from 'recharts';
import { MultiAxisChartContainer } from './MultiAxisChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { DataPointPayload } from '@/components/charts/hooks/useChartData';
import { ChartLabel } from './ChartLabel';
import { yValueFormatter } from '../utils';
import { useChartDiff } from '../hooks/useChartDiff';
import { DiffArea } from './diff-select/DiffArea';
import { useChartAnimation } from '../hooks/useChartAnimatin';

export function TimeSeriesLineChart({ chart, unitMap, timeSeriesData, onAnnotationPositionChange }: ChartRendererProps) {
  const enabledSeries = chart.series.filter(s => s.enabled);
  const animationDuration = 300;
  const { isAnimationActive } = useChartAnimation(animationDuration);
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
      <LineChart
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
                <Line
                  key={series.id}
                  yAxisId={getYAxisId(series.id)}
                  dataKey={`${series.id}.value`}
                  name={series.label || 'Untitled'}
                  stroke={series.config.color}
                  type="monotone"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
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
                    formatter={(label: unknown) => yValueFormatter(Number(label as number), '')}
                  />
                </Line>
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
      </LineChart>
    </ResponsiveContainer>
  );
}