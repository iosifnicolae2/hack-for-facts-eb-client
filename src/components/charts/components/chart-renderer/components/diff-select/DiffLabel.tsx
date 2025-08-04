import { cn } from '@/lib/utils';
import { yValueFormatter } from '../../utils';
import { ChartArea } from 'lucide-react';

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
  if (!viewBox || !data.length) return null;

  const { x, y, width, height } = viewBox;

  const [displayStart, displayEnd] = [start, end].sort((a, b) => Number(a) - Number(b));

  return (
    <foreignObject x={x} y={y} width={width} height={height} className="overflow-visible">
      <div className="w-full h-full flex justify-center items-center pointer-events-none ease-in duration-[50ms] fade-in-0 animate-in">
        <div
          className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg select-none pointer-events-auto w-64"
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
