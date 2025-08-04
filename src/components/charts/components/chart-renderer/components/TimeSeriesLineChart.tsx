import { LineChart, Line, ResponsiveContainer, LabelList, ReferenceArea } from 'recharts';
import { MultiAxisChartContainer } from './MultiAxisChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { DataPointPayload } from '@/components/charts/hooks/useChartData';
import { ChartLabel } from './ChartLabel';
import { yValueFormatter } from '../utils';
import { useChartDiff } from '../hooks/useChartDiff';
import { DiffLabel } from './DiffLabel';

export function TimeSeriesLineChart({ chart, unitMap, timeSeriesData, onAnnotationPositionChange }: ChartRendererProps) {
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
                  animationDuration={300}
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
      </LineChart>
    </ResponsiveContainer>
  );
}
