import { Chart } from '@/schemas/charts';
import { AnalyticsDataPoint } from '@/lib/api/charts';
import { TimeSeriesLineChart } from './TimeSeriesLineChart';
import { TimeSeriesBarChart } from './TimeSeriesBarChart';
import { TimeSeriesAreaChart } from './TimeSeriesAreaChart';
import { useChartData } from '../hooks/useChartData';

export interface ChartRendererProps {
  chart: Chart;
  data: AnalyticsDataPoint[];
  className?: string;
  height?: number;
}

export function ChartRenderer({ chart, data, className, height = 400 }: ChartRendererProps) {
  const { filteredData } = useChartData(chart, data);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground" style={{ height }}>
        <p>No enabled series data available to display.</p>
      </div>
    );
  }
  const supportedChartTypes = ['line', 'bar', 'area'];
  if (!supportedChartTypes.includes(chart.config.chartType)) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Unsupported chart type: {chart.config.chartType}</p>
      </div>
    )
  }

  return (
    <div className={className} style={{ width: '100%', height }}>
      {chart.config.chartType === 'line' && <TimeSeriesLineChart chart={chart} data={data} />}
      {chart.config.chartType === 'bar' && <TimeSeriesBarChart chart={chart} data={data} />}
      {chart.config.chartType === 'area' && <TimeSeriesAreaChart chart={chart} data={data} />}
    </div>
  );
}