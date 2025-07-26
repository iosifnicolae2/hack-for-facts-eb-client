import { ComponentType, useCallback, useMemo } from 'react';
import {
  LineChart, BarChart, AreaChart, ScatterChart, PieChart,
  Line, Bar, Area, Scatter, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from 'recharts';
import { Chart } from '@/schemas/chartBuilder';
import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { AnalyticsDataPoint } from '@/lib/api/chartBuilder';
import { CustomPieTooltip, CustomTimeSeriesTooltip } from './Tooltips';
import { CartesianChartProps } from 'recharts/types/util/types';


interface ChartRendererProps {
  chart: Chart;
  data: AnalyticsDataPoint[];
  className?: string;
  height?: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface ScatterSeriesData {
  name: string;
  color: string;
  points: { x: number; y: number }[];
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
    const enabledLabels = new Set(enabledSeries.map(s => s.label));
    return data.filter(d => enabledLabels.has(d.label));
  }, [data, enabledSeries]);

  console.log({ enabledSeries, filteredData });

  const getSeriesColor = useCallback((seriesLabel: string): string => {
    const seriesConfig = enabledSeries.find(s => s.label === seriesLabel);
    // Fallback color generation is now more robust and distributed.
    const index = enabledSeries.findIndex(s => s.label === seriesLabel);
    return seriesConfig?.config.color || chart.config.color || `hsl(${index * 137.5 % 360}, 70%, 50%)`;
  }, [enabledSeries, chart.config.color]);

  const timeSeriesData = useMemo((): TimeSeriesDataPoint[] => {
    if (filteredData.length === 0) return [];

    const allYears = new Set<number>();
    filteredData.forEach(series => {
      series.yearlyTrend.forEach(point => allYears.add(point.year));
    });

    const sortedYears = Array.from(allYears).sort((a, b) => a - b);

    const yearRange = chart.config.yearRangeStart || chart.config.yearRangeEnd;
    const filteredYears = yearRange
      ? sortedYears.filter(year =>
        (chart.config.yearRangeStart === undefined || year >= chart.config.yearRangeStart) &&
        (chart.config.yearRangeEnd === undefined || year <= chart.config.yearRangeEnd)
      )
      : sortedYears;

    const baseData = filteredYears.map(year => {
      const dataPoint: TimeSeriesDataPoint = { year } as TimeSeriesDataPoint;
      filteredData.forEach(series => {
        const yearData = series.yearlyTrend.find(p => p.year === year);
        const absoluteValue = yearData?.totalAmount || 0;
        // The data structure now consistently holds both the value to plot and the original absolute value.
        dataPoint[series.label] = {
          value: absoluteValue,
          absolute: absoluteValue,
        };
      });
      return dataPoint;
    });

    if (chart.config.showRelativeValues && filteredData.length > 0) {
      const baseSeriesLabel = filteredData[0].label;
      return baseData.map(dataPoint => {
        const baseValue = dataPoint[baseSeriesLabel].absolute;
        const relativeDataPoint: TimeSeriesDataPoint = { year: dataPoint.year } as TimeSeriesDataPoint;
        filteredData.forEach(series => {
          const absoluteValue = dataPoint[series.label].absolute;
          // FIX: If base is 0, all relative values for that year become 0 to avoid NaN/Infinity
          // and prevent mixing absolute/relative data.
          const relativeValue = baseValue === 0 ? 0 : (absoluteValue / baseValue) * 100;
          relativeDataPoint[series.label] = {
            value: relativeValue,
            absolute: absoluteValue,
          };
        });
        return relativeDataPoint;
      });
    }

    return baseData;
  }, [filteredData, chart.config.showRelativeValues, chart.config.yearRangeStart, chart.config.yearRangeEnd]);

  const pieData = useMemo((): PieDataPoint[] => {
    return filteredData.map(series => ({
      name: series.label,
      value: series.yearlyTrend.reduce((sum, point) => sum + point.totalAmount, 0),
      fill: getSeriesColor(series.label),
    }));
  }, [filteredData, getSeriesColor]);

  const scatterData = useMemo((): ScatterSeriesData[] => {
    return filteredData.map(series => ({
      name: series.label,
      color: getSeriesColor(series.label),
      points: series.yearlyTrend.map(point => ({ x: point.year, y: point.totalAmount })),
    }));
  }, [filteredData, getSeriesColor]);


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

    console.log("renderTimeSeriesChart");
    return (
      <ChartComponent data={timeSeriesData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
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
            dataKey={`${series.label}.value`}
            name={series.label}
            fill={getSeriesColor(series.label)}
            stroke={getSeriesColor(series.label)}
            stackId={chart.config.stacked ? "stack" : undefined}
            {...extraSeriesProps}
          >
            {chart.config.showDataLabels && (
              <LabelList
                dataKey={`${series.label}.value`}
                position="top"
                className="text-xs fill-foreground"
                formatter={(label: unknown) => dataLabelFormatter(Number(label as number), isRelative)}
              />
            )}
          </SeriesComponent>
        ))}
      </ChartComponent>
    );
  };

  console.log("Return")

  const renderChart = () => {
    switch (chart.config.chartType) {
      case 'line':
        return renderTimeSeriesChart(LineChart, Line, {
          type: "monotone",
          strokeWidth: chart.config.strokeWidth || 2,
          dot: { r: 4 },
          activeDot: { r: 6 },
          connectNulls: false,
        });
      case 'bar':
        return renderTimeSeriesChart(BarChart, Bar, {
          fillOpacity: chart.config.fillOpacity || 0.8,
        });
      case 'area':
        return renderTimeSeriesChart(AreaChart, Area, {
          type: "monotone",
          strokeWidth: chart.config.strokeWidth || 2,
          fillOpacity: chart.config.fillOpacity || 0.6,
        });
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
            {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis type="number" dataKey="x" name="Year" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="Amount" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value, "compact")} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: number) => formatCurrency(value)} />
            {chart.config.showLegend && <Legend />}
            {scatterData.map(series => (
              <Scatter key={series.name} name={series.name} data={series.points} fill={series.color} />
            ))}
          </ScatterChart>
        );
      case 'pie':
        return (
          <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.35, 150)}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent || 0 * 100).toFixed(1)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            {chart.config.showLegend && <Legend />}
          </PieChart>
        );
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