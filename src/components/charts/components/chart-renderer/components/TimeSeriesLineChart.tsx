import { LineChart, Line, LabelList, ResponsiveContainer } from 'recharts';
import { MultiAxisChartContainer } from './MultiAxisChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { SeriesValue, useChartData } from '../hooks/useChartData';
import { ChartLabel } from './ChartLabel';
import { useCallback } from 'react';
import { applyAlpha, generateRandomColor, yValueFormatter } from '../utils';


export function TimeSeriesLineChart({ chart, data, onAnnotationPositionChange }: ChartRendererProps) {
  const { timeSeriesData, enabledSeries } = useChartData(chart, data);
  const isRelative = chart.config.showRelativeValues ?? false;
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={timeSeriesData} margin={{ top: 30, right: 50, left: 50, bottom: 20 }}>
        <MultiAxisChartContainer chart={chart} onAnnotationPositionChange={onAnnotationPositionChange}>
          {(getYAxisId: (seriesId: string) => string) => enabledSeries.map((series) => (
            <Line
              key={series.id}
              yAxisId={getYAxisId(series.id)}
              dataKey={`${series.id}.value`}
              name={series.label || 'Untitled'}
              stroke={getSeriesColor(series.id)}
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
                  if (!isShowLabels) {
                    return null;
                  }

                  const payload = props.value as unknown as SeriesValue
                  const dataLabels = series.config.dataLabels || []
                  const year = String(payload.xValue)
                  if (dataLabels.length > 0 && !dataLabels.includes(year)) {
                    return null;
                  }
                  return (
                    <ChartLabel {...props} value={payload.value} series={series} dataLabelFormatter={(value, isRelative) => yValueFormatter(value, isRelative, series.unit)} getSeriesColor={getSeriesColor} isRelative={isRelative} />
                  )
                }}
                formatter={(label: unknown) => yValueFormatter(Number(label as number), isRelative, series.unit)}
              />
            </Line>
          ))}
        </MultiAxisChartContainer>
      </LineChart>
    </ResponsiveContainer>
  );
} 