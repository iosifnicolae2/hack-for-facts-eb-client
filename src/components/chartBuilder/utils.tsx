import { BarChart3, LineChart, PieChart, ScatterChart, TrendingUp } from 'lucide-react';
import React from 'react';
import { ChartType } from '@/schemas/constants';

export const getChartTypeIcon = (chartType: ChartType | string, className: string = "h-4 w-4"): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    line: <LineChart className={className} />,
    bar: <BarChart3 className={className} />,
    area: <TrendingUp className={className} />,
    scatter: <ScatterChart className={className} />,
    pie: <PieChart className={className} />,
  };
  return icons[chartType] || <BarChart3 className={className} />;
}; 