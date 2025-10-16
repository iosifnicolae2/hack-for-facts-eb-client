import { cn } from '@/lib/utils';
import { yValueFormatter } from '../../utils';
import { ChartArea } from 'lucide-react';
import { useChartWidth } from 'recharts';

export type DiffInfo = {
  label: string;
  color: string;
  diff: number;
  percentage: number;
  unit: string;
};

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DiffLabelProps {
  viewBox?: ViewBox;
  data: DiffInfo[];
  start: string | number;
  end: string | number;
}

export const DiffLabel = ({ viewBox, data, start, end }: DiffLabelProps) => {
  const chartWidth = useChartWidth() ?? 0;
  if (!viewBox || !data.length) return null;
  const { x: xValue, y: yValue, width } = viewBox;

  // Calculate the actual panel dimensions
  const panelWidth = 250;
  const panelHeight = 80 + (data.length * 40); // Header + items

  // Position the panel within chart bounds
  // X: Keep it within left and right edges
  let x = xValue + width / 2 - panelWidth / 2; // Center on selection
  x = Math.max(10, Math.min(x, chartWidth - panelWidth - 10)); // Keep 10px padding

  // Y: Position the panel at the center of the selected area
  // This ensures it's always visible within the chart bounds
  const y = Math.max(10, yValue);

  const isAnimationActive = false;

  const [displayStart, displayEnd] = [start, end].sort((a, b) => Number(a) - Number(b));

  return (
    <foreignObject x={x} y={y} width={panelWidth} height={panelHeight} className="overflow-visible" style={{ overflow: 'visible' }}>
      <div className={cn("w-full h-full flex justify-start items-start pointer-events-none bg-transparent", isAnimationActive && "ease-in duration-[100ms] fade-in-0 animate-in")} style={{ overflow: 'visible' }}>
        <div
          className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg select-none pointer-events-auto w-full"
        >
          <h4 className="font-bold text-sm mb-2 text-foreground flex items-center">
            <ChartArea className="w-4 h-4 mr-2" /> {displayStart} - {displayEnd}
          </h4>
          <div className="space-y-1">
            {data.map((item) => (
              <div key={item.label} className="flex justify-between items-center text-xs gap-x-4">
                <div className="flex items-center shrink truncate">
                  <span
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold truncate" >
                    {item.label}
                  </span>
                </div>
                <div className="flex flex-col items-end justify-end font-mono text-muted-foreground shrink-0">
                  <span className="text-foreground whitespace-nowrap">
                    {yValueFormatter(item.diff, item.unit)}
                  </span>
                  <span className={cn("text-xs font-bold text-foreground whitespace-nowrap")}>
                    ({item.percentage > 0 ? '+' : ''}
                    {item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </foreignObject>
  );
};
