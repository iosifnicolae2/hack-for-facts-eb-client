import { useMemo } from 'react';
import {
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  Line,
  Bar,
  Area,
  Scatter,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Chart } from '@/schemas/chartBuilder';
import { formatCurrency } from '@/lib/utils';
import { AnalyticsDataPoint } from '@/lib/api/chartBuilder';

interface ChartRendererProps {
  chart: Chart;
  data: AnalyticsDataPoint[];
  className?: string;
  height?: number;
}

interface ChartDataPoint {
  year: number;
  [key: string]: number; // Series data by label
}

interface PieDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{`Year: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${formatCurrency(entry.value || 0)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie tooltip
const PieTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
}) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{data.name}</p>
        <p style={{ color: data.color }} className="text-sm">
          {`Value: ${formatCurrency(data.value || 0)}`}
        </p>
      </div>
    );
  }
  return null;
};

export function ChartRenderer({ chart, data, className, height = 400 }: ChartRendererProps) {
  // Transform data for time series charts (line, bar, area)
  const timeSeriesData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get all unique years from all series
    const allYears = new Set<number>();
    data.forEach(series => {
      series.yearlyTrend.forEach((point: { year: number; totalAmount: number }) => allYears.add(point.year));
    });

    const sortedYears = Array.from(allYears).sort();

    // Create data points for each year
    return sortedYears.map(year => {
      const dataPoint: ChartDataPoint = { year };
      
      data.forEach(series => {
        const yearData = series.yearlyTrend.find((point: { year: number; totalAmount: number }) => point.year === year);
        dataPoint[series.label] = yearData?.totalAmount || 0;
      });
      
      return dataPoint;
    });
  }, [data]);

  // Transform data for pie chart (sum of all years for each series)
  const pieData = useMemo((): PieDataPoint[] => {
    if (!data || data.length === 0) return [];

    return data.map((series, index) => {
      const totalValue = series.yearlyTrend.reduce((sum: number, point: { year: number; totalAmount: number }) => sum + point.totalAmount, 0);
      const seriesConfig = chart.series.find(s => s.label === series.label);
      const color = seriesConfig?.config.color || chart.config.color || `hsl(${index * 137.5 % 360}, 70%, 50%)`;
      
      return {
        name: series.label,
        value: totalValue,
        fill: color,
      };
    });
  }, [data, chart]);

  // Generate colors for series
  const getSeriesColor = (seriesLabel: string, index: number): string => {
    const seriesConfig = chart.series.find(s => s.label === seriesLabel);
    return seriesConfig?.config.color || chart.config.color || `hsl(${index * 137.5 % 360}, 70%, 50%)`;
  };

  const renderChart = () => {
    const commonProps = {
      height: height,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (chart.config.chartType) {
      case 'line':
        return (
          <LineChart data={timeSeriesData} {...commonProps}>
            {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis 
              dataKey="year" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, "compact")}
            />
            <Tooltip content={<CustomTooltip />} />
            {chart.config.showLegend && <Legend />}
            {data.map((series, index) => (
              <Line
                key={series.label}
                type="monotone"
                dataKey={series.label}
                stroke={getSeriesColor(series.label, index)}
                strokeWidth={chart.config.strokeWidth || 2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={timeSeriesData} {...commonProps}>
            {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis 
              dataKey="year" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, "compact")}
            />
            <Tooltip content={<CustomTooltip />} />
            {chart.config.showLegend && <Legend />}
            {data.map((series, index) => (
              <Bar
                key={series.label}
                dataKey={series.label}
                fill={getSeriesColor(series.label, index)}
                fillOpacity={chart.config.fillOpacity || 0.8}
                stackId={chart.config.stacked ? "stack" : undefined}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={timeSeriesData} {...commonProps}>
            {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis 
              dataKey="year" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, "compact")}
            />
            <Tooltip content={<CustomTooltip />} />
            {chart.config.showLegend && <Legend />}
            {data.map((series, index) => (
              <Area
                key={series.label}
                type="monotone"
                dataKey={series.label}
                stroke={getSeriesColor(series.label, index)}
                fill={getSeriesColor(series.label, index)}
                fillOpacity={chart.config.fillOpacity || 0.6}
                strokeWidth={chart.config.strokeWidth || 2}
                stackId={chart.config.stacked ? "stack" : undefined}
              />
            ))}
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Year"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Amount"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, "compact")}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
            />
            {chart.config.showLegend && <Legend />}
            {data.map((series, index) => (
              <Scatter
                key={series.label}
                name={series.label}
                data={series.yearlyTrend.map((point: { year: number; totalAmount: number }) => ({ x: point.year, y: point.totalAmount }))}
                fill={getSeriesColor(series.label, index)}
              />
            ))}
          </ScatterChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.35, 150)}
              dataKey="value"
              label={({ name, percent }: { name: string; percent?: number }) => 
                `${name}: ${percent ? (percent * 100).toFixed(1) : '0.0'}%`
              }
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
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

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No data available to display</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
} 