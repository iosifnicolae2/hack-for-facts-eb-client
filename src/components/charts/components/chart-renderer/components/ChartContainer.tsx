import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Chart } from '@/schemas/charts';
import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { CustomTimeSeriesTooltip } from './Tooltips';
import { ReactNode } from 'react';
import { ChartAnnotation } from './ChartAnnotation';
import { AnnotationPositionChange } from './interfaces';

interface ChartContainerProps {
  chart: Chart;
  children: ReactNode;
  onAnnotationPositionChange: (pos: AnnotationPositionChange) => void;
}

const yAxisTickFormatter = (value: number, isRelative: boolean) => {
  if (isRelative) {
    return `${formatNumberRO(value)}%`;
  }
  return formatCurrency(value, "compact");
};

export function ChartContainer({ chart, children, onAnnotationPositionChange }: ChartContainerProps) {
  const isRelative = chart.config.showRelativeValues ?? false;

  return (
    <>
      {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
      <XAxis dataKey="year" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
      <YAxis
        className="text-xs fill-muted-foreground"
        tick={{ fontSize: 12 }}
        tickFormatter={(value: number) => yAxisTickFormatter(value, isRelative)}
      />
      {chart.config.showTooltip && <Tooltip reverseDirection={{ y: true }} content={<CustomTimeSeriesTooltip chartConfig={chart.config} />} wrapperStyle={{ zIndex: 10 }} />}
      {chart.config.showLegend && <Legend
        verticalAlign="bottom"
        height={36}
        wrapperStyle={{ zIndex: 1 }}
        itemSorter={() => 0} // Sort by default series order
      />}
      {children}
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