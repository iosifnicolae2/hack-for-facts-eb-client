import { useMemo } from 'react';
import { Chart } from '@/schemas/charts';
import { AnalyticsDataPoint } from '@/lib/api/charts';

// Shape of each data point fed into Recharts time-series components.
export type SeriesValue = {
  value: number;
  absolute: number;
};

export type TimeSeriesDataPoint = { year: number } & Record<string, SeriesValue>;

export function useChartData(chart: Chart, data: AnalyticsDataPoint[]) {
  const enabledSeries = useMemo(() => chart.series.filter(s => s.enabled), [chart.series]);

  const filteredData = useMemo(() => {
    const enabledLabels = new Set(enabledSeries.map(s => s.id));
    return data.filter(d => enabledLabels.has(d.seriesId));
  }, [data, enabledSeries]);

  const timeSeriesData = useMemo((): TimeSeriesDataPoint[] => {
    if (filteredData.length === 0) return [];

    const allYears = new Set<number>();
    filteredData.forEach(series => {
      series.yearlyTrend.forEach(point => allYears.add(point.year));
    });

    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    const filteredYears = sortedYears;

    const baseData = filteredYears.map(year => {
      const dataPoint: TimeSeriesDataPoint = { year } as TimeSeriesDataPoint;
      filteredData.forEach(series => {
        const yearData = series.yearlyTrend.find(p => p.year === year);
        const absoluteValue = yearData?.totalAmount || 0;
        dataPoint[series.seriesId] = {
          value: absoluteValue,
          absolute: absoluteValue,
        };
      });
      return dataPoint;
    });

    if (chart.config.showRelativeValues && filteredData.length > 0) {
      const baseSeriesLabel = chart.series.find(s => s.enabled)?.id;
      if (!baseSeriesLabel) {
        return baseData;
      }
      
      const baseSeriesHasData = baseData.some(d => d[baseSeriesLabel] !== undefined);
      if (!baseSeriesHasData) {
        return baseData;
      }

      return baseData.map(dataPoint => {
        const baseValue = dataPoint[baseSeriesLabel].absolute;
        const relativeDataPoint: TimeSeriesDataPoint = { year: dataPoint.year } as TimeSeriesDataPoint;
        filteredData.forEach(series => {
          const absoluteValue = dataPoint[series.seriesId].absolute;
          const relativeValue = baseValue === 0 ? 0 : (absoluteValue / baseValue) * 100;
          relativeDataPoint[series.seriesId] = {
            value: relativeValue,
            absolute: absoluteValue,
          };
        });
        return relativeDataPoint;
      });
    }

    return baseData;
  }, [filteredData, chart.config.showRelativeValues, chart.series]);

  return { timeSeriesData, enabledSeries, filteredData };
} 