import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface UatTopNBarChartProps {
  data: (HeatmapUATDataPoint | HeatmapJudetDataPoint)[];
  valueKey: keyof (HeatmapUATDataPoint & HeatmapJudetDataPoint); 
  nameKey: keyof (HeatmapUATDataPoint & HeatmapJudetDataPoint);  
  topN?: number;
  chartTitle?: string;
  barColor?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  isCurrency?: boolean; // Added to determine if valueKey is a currency
}

export const UatTopNBarChart: React.FC<UatTopNBarChartProps> = ({
  data,
  valueKey,
  nameKey,
  topN = 10,
  chartTitle,
  barColor = '#8884d8',
  xAxisLabel,
  yAxisLabel,
  isCurrency = true, // Default to true as this chart is often used for amounts
}) => {
  const processedData = React.useMemo(() => {
    type ValueType = number | undefined
    type NameType = string | undefined
    const getNumber = (v: unknown): number | undefined => typeof v === 'number' ? v : undefined
    const getString = (v: unknown): string | undefined => typeof v === 'string' ? v : undefined

    return data
      .map((item) => {
        const record = item as unknown as Record<string, unknown>
        const rawValue = record[valueKey as string]
        const rawName = record[nameKey as string]
        const value = getNumber(rawValue) as ValueType
        const name = getString(rawName) as NameType
        return value !== undefined && name ? { ...item, [valueKey]: value, [nameKey]: name } : undefined
      })
      .filter((x): x is (HeatmapUATDataPoint & HeatmapJudetDataPoint) => Boolean(x))
      .sort((a, b) => {
        const ra = a as unknown as Record<string, unknown>
        const rb = b as unknown as Record<string, unknown>
        return Number(rb[valueKey as string]) - Number(ra[valueKey as string])
      })
      .slice(0, topN)
  }, [data, valueKey, nameKey, topN])

  if (processedData.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">Not enough data to display this chart.</p>;
  }

  const getFormatter = (compactView: boolean) => {
    if (isCurrency) {
      const view = compactView ? 'compact' : 'standard'
      return (value: number) => formatCurrency(value, view);
    }
    return formatNumber;
  };

  const compactFormatter = (value: React.ReactNode) => {
    if (typeof value === 'number') {
      return getFormatter(true)(value);
    }
    return '';
  };
  
  const tooltipFormatter = getFormatter(false);

  return (
    <div style={{ width: '100%', height: 300 + topN * 10 }}>
      {chartTitle && <h4 className="text-md font-medium mb-2 text-center">{chartTitle}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          layout="vertical" 
          margin={{
            top: 5,
            right: 30,
            left: 20, 
            bottom: 70, 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey={valueKey as string} tickFormatter={(value) => getFormatter(true)(value)} label={{ value: xAxisLabel, position: 'insideBottom', dy: 30, fontSize: 12 }} />
          <YAxis type="category" dataKey={nameKey as string} width={150} interval={0} tick={{ fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', dx: -10, fontSize: 12 }}/>
          <Tooltip formatter={(value: number) => [tooltipFormatter(value), valueKey as string]} />
          {topN <= 15 && <Legend verticalAlign="top" height={36}/>}
          <Bar dataKey={valueKey as string} name={String(valueKey)} fill={barColor}>
            <LabelList dataKey={valueKey as string} position="right" formatter={compactFormatter} fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 