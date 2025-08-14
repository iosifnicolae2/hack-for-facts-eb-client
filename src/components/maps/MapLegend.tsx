import React from 'react';
import { getHeatmapColor } from './utils';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { t } from '@lingui/core/macro';

interface MapLegendProps {
  min: number;
  max: number;
  className?: string;
  title?: string;
  isInModal?: boolean;
}

const formatLegendValue = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'N/A';
  return formatCurrency(value, 'compact');
};

export const MapLegend: React.FC<MapLegendProps> = ({
  min,
  max,
  className = '',
  title = t`Aggregated Value (RON)`,
  isInModal = false,
}) => {
  if (typeof min !== 'number' || typeof max !== 'number' || min > max) {
    return null;
  }

  if (min === max) {
    const color = getHeatmapColor(0.5);
    return (
      <div className={cn(isInModal ? 'p-3' : 'bg-card/80 backdrop-blur-sm p-3 rounded-md shadow-lg', className)}>
        <h4 className={cn("text-sm font-semibold mb-2", isInModal ? 'text-foreground' : 'text-card-foreground')}>{title}</h4>
        <div className="flex items-center space-x-2">
          <div
            className="w-5 h-5 border border-border"
            style={{ backgroundColor: color }}
            aria-label={t`Color for value ${formatLegendValue(min)}`}
          />
          <span className={cn("text-xs", isInModal ? 'text-foreground' : 'text-card-foreground')}>{formatLegendValue(min)}</span>
        </div>
      </div>
    );
  }

  const gradientStops = Array.from({ length: 100 }, (_, i) => getHeatmapColor(i / 99));
  const gradient = `linear-gradient(to right, ${gradientStops.join(', ')})`;

  return (
    <div className={cn(isInModal ? 'p-0' : 'bg-card/80 backdrop-blur-sm p-3 rounded-md shadow-lg', 'w-full max-w-xs', className)}>
      <h4 className={cn("text-sm font-semibold mb-2", isInModal ? 'text-foreground' : 'text-card-foreground')}>{title}</h4>
      <div className="flex flex-col space-y-1">
        <div
          className="h-5 w-full border border-border"
          style={{ background: gradient }}
          aria-label="Color gradient for the map legend"
        />
        <div className="flex justify-between text-xs">
          <span>{formatLegendValue(min)}</span>
          <span>{formatLegendValue(max)}</span>
        </div>
      </div>
    </div>
  );
};
