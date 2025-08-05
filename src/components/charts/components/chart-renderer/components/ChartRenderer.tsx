import { Chart } from '@/schemas/charts';
import { TimeSeriesLineChart } from './TimeSeriesLineChart';
import { TimeSeriesBarChart } from './TimeSeriesBarChart';
import { TimeSeriesAreaChart } from './TimeSeriesAreaChart';
import { AnnotationPositionChange, ChartMargins } from './interfaces';
import { AggregatedBarChart } from './aggregated-charts/AggregatedBarChart';
import { AggregatedPieChart } from './aggregated-charts/AggregatedPieChart';
import { AggregatedTreemapChart } from './aggregated-charts/AggregatedTreemapChart';
import { AggregatedSankeyChart } from './aggregated-charts/AggregatedSankeyChart';
import { DataPointPayload, DataSeriesMap, TimeSeriesDataPoint, UnitMap } from '../../../hooks/useChartData';

export interface ChartRendererProps {
  chart: Chart;
  dataMap: DataSeriesMap;
  timeSeriesData: TimeSeriesDataPoint[];
  aggregatedData: DataPointPayload[];
  unitMap: UnitMap;
  className?: string;
  height?: number;
  margins?: Partial<ChartMargins>;
  isPreview?: boolean;
  xAxisMarker?: number;
  onXAxisClick?: (value: number | string) => void;
  onAnnotationPositionChange: (pos: AnnotationPositionChange) => void;
}

export function ChartRenderer({ chart, dataMap, unitMap, aggregatedData, timeSeriesData, className, height = 400, isPreview, onAnnotationPositionChange, xAxisMarker, onXAxisClick }: ChartRendererProps) {

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
  const data = {
    chart,
    dataMap,
    unitMap,
    aggregatedData,
    timeSeriesData,
    xAxisMarker,
    onXAxisClick,
  }

  const sankeyMargins = isPreview ? { left: 120, bottom: 50, right: 10 } : { left: 240, bottom: 30, right: 50 };


  return (
    <div className={className} style={{ width: '100%', height }}>
      {!isAggregated && chart.config.chartType === 'line' && <TimeSeriesLineChart {...data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {!isAggregated && chart.config.chartType === 'bar' && <TimeSeriesBarChart {...data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {!isAggregated && chart.config.chartType === 'area' && <TimeSeriesAreaChart {...data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {isAggregated && chart.config.chartType === 'bar-aggr' && <AggregatedBarChart {...data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {isAggregated && chart.config.chartType === 'pie-aggr' && <AggregatedPieChart {...data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {isAggregated && chart.config.chartType === 'treemap-aggr' && <AggregatedTreemapChart {...data} onAnnotationPositionChange={onAnnotationPositionChange} />}
      {isAggregated && chart.config.chartType === 'sankey-aggr' && <AggregatedSankeyChart {...data} onAnnotationPositionChange={onAnnotationPositionChange} margins={sankeyMargins} />}
    </div>
  );
}
