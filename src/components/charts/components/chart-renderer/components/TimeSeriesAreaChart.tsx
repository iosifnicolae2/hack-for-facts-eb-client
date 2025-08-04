import { AreaChart, Area, ResponsiveContainer, LabelList } from 'recharts';
import { MultiAxisChartContainer } from './MultiAxisChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { useCallback } from 'react';
import { applyAlpha, generateRandomColor, yValueFormatter } from '../utils';
import { ChartLabel } from './ChartLabel';
import { DataPointPayload } from '@/components/charts/hooks/useChartData';



export function TimeSeriesAreaChart({ chart, timeSeriesData, unitMap, onAnnotationPositionChange }: ChartRendererProps) {
  const enabledSeries = chart.series.filter(s => s.enabled);

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
      <AreaChart data={timeSeriesData} margin={{ top: 30, right: 50, left: 50, bottom: 20 }}>
        <MultiAxisChartContainer chart={chart} unitMap={unitMap} onAnnotationPositionChange={onAnnotationPositionChange}>
          {(getYAxisId: (seriesId: string) => string) => enabledSeries.map((series) => (
            <Area
              key={series.id}
              yAxisId={getYAxisId(series.id)}
              dataKey={`${series.id}.value`}
              name={series.label || 'Untitled'}
              stroke={getSeriesColor(series.id)}
              fill={getSeriesColor(series.id, 0.6)}
              type="monotone"
              strokeWidth={2}
              fillOpacity={0.6}
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
            </Area>
          ))}
        </MultiAxisChartContainer>
      </AreaChart>
    </ResponsiveContainer>
  );
} 