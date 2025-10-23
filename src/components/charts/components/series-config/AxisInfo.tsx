import { Axis } from '@/schemas/charts';

interface AxisInfoProps {
  readonly xAxis: Axis;
  readonly yAxis: Axis;
  readonly variant?: 'full' | 'compact';
}

export function AxisInfo({ xAxis, yAxis, variant = 'full' }: AxisInfoProps) {
  if (variant === 'compact') {
    return (
      <div className="text-sm text-muted-foreground">
        X axis: {xAxis.unit || xAxis.name} ({xAxis.type}), Y axis: {yAxis.unit || yAxis.name} ({yAxis.type})
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <div>X axis: {xAxis.unit || xAxis.name} ({xAxis.type})</div>
      <div>Y axis: {yAxis.unit || yAxis.name} ({yAxis.type})</div>
    </div>
  );
}
