import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Chart } from '@/schemas/charts';
import { CustomSeriesTooltip } from './Tooltips';
import { ReactNode, useCallback, useMemo } from 'react';
import { ChartAnnotation } from './ChartAnnotation';
import { AnnotationPositionChange } from './interfaces';
import { yValueFormatter } from '../utils';
import { UnitMap } from '@/components/charts/hooks/useChartData';

interface MultiAxisChartContainerProps {
  chart: Chart;
  unitMap: UnitMap;
  children: ((getYAxisId: (seriesId: string) => string) => ReactNode) | ReactNode;
  onAnnotationPositionChange: (pos: AnnotationPositionChange) => void;
  disableTooltip?: boolean;
}

export function MultiAxisChartContainer({ unitMap, chart, children, onAnnotationPositionChange, disableTooltip }: MultiAxisChartContainerProps) {

  // Group series by unit
  const unitGroups = useMemo(() => {
    const groups = new Map<string, { unit: string; series: string[]; index: number }>();
    let index = 0;

    chart.series
      .filter(s => s.enabled && s.config.visible !== false)
      .forEach(series => {
        const unit = unitMap.get(series.id) || '';
        if (!groups.has(unit)) {
          groups.set(unit, { unit, series: [], index: index++ });
        }
        groups.get(unit)!.series.push(series.id);
      });

    return Array.from(groups.values());
  }, [chart.series, unitMap]);

  const getYAxisId = useCallback((seriesId: string) => {
    const group = unitGroups.find(g => g.series.includes(seriesId));
    return group ? `yaxis-${group.index}` : 'yaxis-0';
  }, [unitGroups]);

  // Stable legend sorter; must be declared unconditionally to respect hooks rules
  const legendItemSorter = useCallback(() => 0, []);


  return (
    <>
      {chart.config.showGridLines && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
      <XAxis dataKey="year" className="text-xs fill-muted-foreground select-none" tick={{ fontSize: 12 }} />

      {/* Render Y-axes for each unit */}
      {unitGroups.map((group, index) => (
        <YAxis
          key={`yaxis-${index}`}
          yAxisId={`yaxis-${index}`}
          orientation={index % 2 === 0 ? 'left' : 'right'}
          className="text-xs fill-muted-foreground select-none"
          tickFormatter={(value: number) => yValueFormatter(value, group.unit)}
        />
      ))}

      {chart.config.showTooltip && !disableTooltip && (
        <Tooltip
          reverseDirection={{ y: true }}
          animationDuration={100}
          content={<CustomSeriesTooltip chartConfig={chart.config} chart={chart} />}
          wrapperStyle={{ zIndex: 10 }}
          cursor={{ stroke: 'rgba(0, 0, 0, 0.1)', strokeWidth: 1 }}
        />
      )}

      {chart.config.showLegend && <Legend
        verticalAlign="bottom"
        height={36}
        wrapperStyle={{ zIndex: 1 }}
        itemSorter={legendItemSorter}
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
