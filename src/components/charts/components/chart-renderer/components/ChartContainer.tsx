import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Chart } from '@/schemas/charts';
import { formatCurrency, formatNumberRO } from '@/lib/utils';
import { CustomTimeSeriesTooltip } from './Tooltips';
import { ReactNode } from 'react';

interface ChartContainerProps {
  chart: Chart;
  children: ReactNode;
}

const yAxisTickFormatter = (value: number, isRelative: boolean) => {
  if (isRelative) {
    return `${formatNumberRO(value)}%`;
  }
  return formatCurrency(value, "compact");
};

export function ChartContainer({ chart, children }: ChartContainerProps) {
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
      <Tooltip reverseDirection={{ y: true }} content={<CustomTimeSeriesTooltip chartConfig={chart.config} />} wrapperStyle={{ zIndex: 10 }} />
      {chart.config.showLegend && <Legend
        verticalAlign="bottom"
        height={36}
        wrapperStyle={{ zIndex: 1 }}
        itemSorter={() => 0} // Sort by default series order
      />}
      {children}
    </>
  );
} 