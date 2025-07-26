import { ComponentType, useCallback, useMemo } from 'react';
import {
  LineChart, BarChart, AreaChart,
  Line, Bar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { Chart } from '@/schemas/chartBuilder';
import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { AnalyticsDataPoint } from '@/lib/api/chartBuilder';
import { CustomTimeSeriesTooltip } from './Tooltips';
import { CartesianChartProps } from 'recharts/types/util/types';


interface ChartRendererProps {
  chart: Chart;
  data: AnalyticsDataPoint[];
  className?: string;
  height?: number;
}

// Shape of each data point fed into Recharts time-series components.
type SeriesValue = {
  value: number;
  absolute: number;
};

export type TimeSeriesDataPoint = { year: number } & Record<string, SeriesValue>;

/**
 * A consistent formatter for Y-Axis ticks across all time-series charts.
 */
const yAxisTickFormatter = (value: number, isRelative: boolean) => {
  if (isRelative) {
    return `${formatNumberRO(value)}%`;
  }
  return formatCurrency(value, "compact");
};

/**
 * A consistent formatter for data labels (LabelList) inside the charts.
 */
const dataLabelFormatter = (value: number, isRelative: boolean) => {
  if (isRelative) {
    return `${formatNumberRO(value)}%`;
  }
  return formatCurrency(value, "compact");
};

export function ChartRenderer({ chart, data, className, height = 400 }: ChartRendererProps) {

  const enabledSeries = useMemo(() => chart.series.filter(s => s.enabled), [chart.series]);

  const filteredData = useMemo(() => {
    const enabledLabels = new Set(enabledSeries.map(s => s.id));
    return data.filter(d => enabledLabels.has(d.seriesId));
  }, [data, enabledSeries]);

  const getSeriesColor = useCallback((seriesId: string): string => {
    const seriesConfig = enabledSeries.find(s => s.id === seriesId);
    // Fallback color generation is now more robust and distributed.
    const index = enabledSeries.findIndex(s => s.id === seriesId);
    return seriesConfig?.config.color || chart.config.color || `hsl(${index * 137.5 % 360}, 70%, 50%)`;
  }, [enabledSeries, chart.config.color]);

  const timeSeriesData = useMemo((): TimeSeriesDataPoint[] => {
    if (filteredData.length === 0) return [];

    const allYears = new Set<number>();
    filteredData.forEach(series => {
      series.yearlyTrend.forEach(point => allYears.add(point.year));
    });

    const sortedYears = Array.from(allYears).sort((a, b) => a - b);

    // TODO: add year range selector
    // const yearRange = chart.config.yearRangeStart || chart.config.yearRangeEnd;
    // const filteredYears = yearRange
    //   ? sortedYears.filter(year =>
    //     (chart.config.yearRangeStart === undefined || year >= chart.config.yearRangeStart) &&
    //     (chart.config.yearRangeEnd === undefined || year <= chart.config.yearRangeEnd)
    //   )
    //   : sortedYears;
    const filteredYears = sortedYears;

    const baseData = filteredYears.map(year => {
      const dataPoint: TimeSeriesDataPoint = { year } as TimeSeriesDataPoint;
      filteredData.forEach(series => {
        const yearData = series.yearlyTrend.find(p => p.year === year);
        const absoluteValue = yearData?.totalAmount || 0;
        // The data structure now consistently holds both the value to plot and the original absolute value.
        dataPoint[series.seriesId] = {
          value: absoluteValue,
          absolute: absoluteValue,
        };
      });
      return dataPoint;
    });

    if (chart.config.showRelativeValues && filteredData.length > 0) {
      const baseSeriesLabel = filteredData[0].seriesId;
      return baseData.map(dataPoint => {
        const baseValue = dataPoint[baseSeriesLabel].absolute;
        const relativeDataPoint: TimeSeriesDataPoint = { year: dataPoint.year } as TimeSeriesDataPoint;
        filteredData.forEach(series => {
          const absoluteValue = dataPoint[series.seriesId].absolute;
          // FIX: If base is 0, all relative values for that year become 0 to avoid NaN/Infinity
          // and prevent mixing absolute/relative data.
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
  }, [filteredData, chart.config.showRelativeValues]);

  // const pieData = useMemo((): PieDataPoint[] => {
  //   return filteredData.map(series => ({
  //     name: series.label,
  //     value: series.yearlyTrend.reduce((sum, point) => sum + point.totalAmount, 0),
  //     fill: getSeriesColor(series.label),
  //   }));
  // }, [filteredData, getSeriesColor]);

  // const scatterData = useMemo((): ScatterSeriesData[] => {
  //   return filteredData.map(series => ({
  //     name: series.label,
  //     color: getSeriesColor(series.label),
  //     points: series.yearlyTrend.map(point => ({ x: point.year, y: point.totalAmount })),
  //   }));
  // }, [filteredData, getSeriesColor]);


  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground" style={{ height }}>
        <p>No enabled series data available to display.</p>
      </div>
    );
  }
  const renderTimeSeriesChart = (
    ChartComponent: ComponentType<CartesianChartProps>,
    SeriesComponent: ComponentType<any>,
    extraSeriesProps: Record<string, unknown> = {},
  ) => {
    const isRelative = chart.config.showRelativeValues ?? false;

    return (
      <ChartComponent data={timeSeriesData} margin={{ top: 20, right: 0, left: 30, bottom: 20 }}>
        {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        <XAxis dataKey="year" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
        <YAxis
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: 12 }}
          tickFormatter={(value: number) => yAxisTickFormatter(value, isRelative)}
        />
        <Tooltip content={<CustomTimeSeriesTooltip chartConfig={chart.config} />} />
        {chart.config.showLegend && <Legend />}

        {enabledSeries.map(series => (
          <SeriesComponent
            // The dataKey now points to the 'value' property within each series object.
            dataKey={`${series.id}.value`}
            name={series.label || 'Untitled'}
            fill={getSeriesColor(series.id)}
            stroke={getSeriesColor(series.id)}
            animationDuration={300}
            animationEasing="ease-in-out"
            {...extraSeriesProps}
          >
            {(series.config.showDataLabels || chart.config.showDataLabels) && (
              <LabelList
                dataKey={`${series.id}.value`}
                position="top"
                offset={20}
                className="text-xs fill-foreground text-center font-bold"
                formatter={(label: unknown) => dataLabelFormatter(Number(label as number), isRelative)}
              />
            )}
          </SeriesComponent>
        ))}
      </ChartComponent>
    );
  };

  const renderChart = () => {
    switch (chart.config.chartType) {
      case 'line':
        return renderTimeSeriesChart(LineChart, Line, {
          type: "monotone",
          strokeWidth: 2,
          dot: { r: 4 },
          activeDot: { r: 6 },
          connectNulls: false,
        });
      case 'bar':
        return renderTimeSeriesChart(BarChart, Bar, {
          fillOpacity: 0.8,
        });
      case 'area':
        return renderTimeSeriesChart(AreaChart, Area, {
          type: "monotone",
          strokeWidth: 2,
          fillOpacity: 0.6,
        });
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Unsupported chart type: {chart.config.chartType}</p>
          </div>
        );
    }
  };

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}