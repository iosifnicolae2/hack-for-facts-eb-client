import { cn } from '@/lib/utils';
import { yValueFormatter } from '../utils';

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

  const foreignObjectHeight = 10 + data.length * 100;
  const foreignObjectWidth = 300;

  const labelX = Math.min(x + width + 15, 1000 - foreignObjectWidth);
  let labelY = y + height / 2 - foreignObjectHeight / 2;
  labelY = Math.max(5, labelY);

  return (
    <foreignObject x={labelX} y={labelY} width={foreignObjectWidth} height={foreignObjectHeight}>
      <div
        className="bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg select-none"
      >
        <h4 className="font-bold text-sm mb-2 text-foreground">
          Diferenta: {displayStart} - {displayEnd}
        </h4>
        <div className="space-y-1">
          {data.map((item) => (
            <div key={item.label} className="flex justify-between items-center text-xs">
              <div className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold" style={{ color: item.color }}>
                  {item.label}
                </span>
              </div>
              <div className="flex flex-col items-end justify-end font-mono text-muted-foreground">
                <span className="text-foreground">
                  {`${yValueFormatter(item.diff, item.unit)}`}
                </span>
                <span className={cn("text-xs font-bold text-foreground")}>
                  {` (${item.percentage > 0 ? '+' : ''}${item.percentage.toFixed(1)}%)`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
};
