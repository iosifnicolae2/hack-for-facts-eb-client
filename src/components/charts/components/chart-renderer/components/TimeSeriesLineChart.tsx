import { LineChart, Line, LabelList, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './ChartContainer';
import { ChartRendererProps } from './ChartRenderer';
import { useChartData } from '../hooks/useChartData';
import { ChartLabel } from './ChartLabel';
import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { useCallback } from 'react';
import { applyAlpha } from '../utils';

const dataLabelFormatter = (value: number, isRelative: boolean) => {
  if (isRelative) {
    return `${formatNumberRO(value)}%`;
  }
  return formatCurrency(value, "compact");
};

export function TimeSeriesLineChart({ chart, data, onAnnotationPositionChange }: ChartRendererProps) {
  const { timeSeriesData, enabledSeries } = useChartData(chart, data);
  const isRelative = chart.config.showRelativeValues ?? false;
  const getSeriesColor = useCallback(
    (seriesId: string, opacity = 1): string => {
      const seriesConfig = enabledSeries.find(s => s.id === seriesId);
      const index = enabledSeries.findIndex(s => s.id === seriesId);
      const base =
        seriesConfig?.config.color ||
        chart.config.color ||
        `hsl(${(index * 137.5) % 360}, 70%, 50%)`;

      return applyAlpha(base, opacity);
    },
    [enabledSeries, chart.config.color]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={timeSeriesData} margin={{ top: 30, right: 50, left: 30, bottom: 20 }}>
        <ChartContainer chart={chart} onAnnotationPositionChange={onAnnotationPositionChange}>
          {enabledSeries.map((series) => (
            <Line
              key={series.id}
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
              {(series.config.showDataLabels || chart.config.showDataLabels) && (
                <LabelList
                  dataKey={`${series.id}.value`}
                  offset={30}
                  content={(props) => <ChartLabel {...props} series={series} dataLabelFormatter={dataLabelFormatter} getSeriesColor={getSeriesColor} isRelative={isRelative} />}
                  formatter={(label: unknown) => dataLabelFormatter(Number(label as number), isRelative)}
                />
              )}
            </Line>
          ))}
        </ChartContainer>
      </LineChart>
    </ResponsiveContainer>
  );
} 