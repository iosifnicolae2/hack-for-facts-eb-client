import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Chart } from '@/schemas/charts';
import { CustomTimeSeriesTooltip } from './Tooltips';
import { ReactNode, useMemo } from 'react';
import { ChartAnnotation } from './ChartAnnotation';
import { AnnotationPositionChange } from './interfaces';
import { yValueFormatter } from '../utils';

interface MultiAxisChartContainerProps {
  chart: Chart;
  children: ((getYAxisId: (seriesId: string) => string) => ReactNode) | ReactNode;
  onAnnotationPositionChange: (pos: AnnotationPositionChange) => void;
}

export function MultiAxisChartContainer({ chart, children, onAnnotationPositionChange }: MultiAxisChartContainerProps) {
  const isRelative = chart.config.showRelativeValues ?? false;

  // Group series by unit
  const unitGroups = useMemo(() => {
    const groups = new Map<string, { unit: string; series: string[]; index: number }>();
    let index = 0;

    chart.series
      .filter(s => s.enabled)
      .forEach(series => {
        const unit = series.unit || 'RON'; // Default unit
        if (!groups.has(unit)) {
          groups.set(unit, { unit, series: [], index: index++ });
        }
        groups.get(unit)!.series.push(series.id);
      });

    return Array.from(groups.values());
  }, [chart.series]);

  const getYAxisId = (seriesId: string) => {
    const group = unitGroups.find(g => g.series.includes(seriesId));
    return group ? `yaxis-${group.index}` : 'yaxis-0';
  };


  return (
    <>
      {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
      <XAxis dataKey="year" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />

      {/* Render Y-axes for each unit */}
      {unitGroups.map((group, index) => (
        <YAxis
          key={`yaxis-${index}`}
          yAxisId={`yaxis-${index}`}
          orientation={index % 2 === 0 ? 'left' : 'right'}
          className="text-xs fill-muted-foreground"
          tickFormatter={(value: number) => yValueFormatter(value, isRelative, group.unit)}
        />
      ))}

      {chart.config.showTooltip && <Tooltip reverseDirection={{ y: true }} content={<CustomTimeSeriesTooltip chartConfig={chart.config} chart={chart} />} wrapperStyle={{ zIndex: 10 }} />}
      {chart.config.showLegend && <Legend
        verticalAlign="bottom"
        height={36}
        wrapperStyle={{ zIndex: 1 }}
        itemSorter={() => 0} // Sort by default series order
      />}

      {/* Pass the getYAxisId function to children */}
      {typeof children === 'function' ? children(getYAxisId) : children}

      {chart.config.showAnnotations && chart.annotations.filter(a => a.enabled).map((annotation) => (
        <ChartAnnotation
          key={annotation.id}
          annotation={annotation}
          globalEditable={chart.config.editAnnotations}
          onPositionChange={onAnnotationPositionChange}
        />
      ))}
    </>
  );
}