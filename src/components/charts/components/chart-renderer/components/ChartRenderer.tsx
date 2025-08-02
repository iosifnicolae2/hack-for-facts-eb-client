import { Chart } from '@/schemas/charts';
import { AnalyticsDataPoint } from '@/lib/api/charts';
import { TimeSeriesLineChart } from './TimeSeriesLineChart';
import { TimeSeriesBarChart } from './TimeSeriesBarChart';
import { TimeSeriesAreaChart } from './TimeSeriesAreaChart';
import { AnnotationPositionChange } from './interfaces';
import { AggregatedBarChart } from './aggregated-charts/AggregatedBarChart';
import { AggregatedPieChart } from './aggregated-charts/AggregatedPieChart';

export interface ChartRendererProps {
  chart: Chart;
  data: AnalyticsDataPoint[];
  className?: string;
  height?: number;
  onAnnotationPositionChange: (pos: AnnotationPositionChange) => void;
}

export function ChartRenderer({ chart, data, className, height = 400, onAnnotationPositionChange }: ChartRendererProps) {

  if (chart.series.filter(s => s.enabled).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground" style={{ height }}>
        <p>No enabled series data available to display.</p>
      </div>
    );
  }

  const supportedChartTypes = ['line', 'bar', 'area', 'bar-aggr', 'pie-aggr', 'treemap-aggr', 'sankey-aggr'];
  if (!supportedChartTypes.includes(chart.config.chartType)) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Unsupported chart type: {chart.config.chartType}</p>
      </div>
    )
  }

  const isAggregated = chart.config.chartType.endsWith('-aggr');

  return (
    <div className={className} style={{ width: '100%', height }}>
      {!isAggregated && chart.config.chartType === 'line' && <TimeSeriesLineChart chart={chart} data={data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {!isAggregated && chart.config.chartType === 'bar' && <TimeSeriesBarChart chart={chart} data={data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {!isAggregated && chart.config.chartType === 'area' && <TimeSeriesAreaChart chart={chart} data={data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {isAggregated && chart.config.chartType === 'bar-aggr' && <AggregatedBarChart chart={chart} data={data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {isAggregated && chart.config.chartType === 'pie-aggr' && <AggregatedPieChart chart={chart} data={data} onAnnotationPositionChange={onAnnotationPositionChange} />}
    </div>
  );
}