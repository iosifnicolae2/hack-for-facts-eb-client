import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { hasCalculationCycle } from '@/lib/chart-calculation-utils';
import { Calculation, Chart, Operation, Series, SeriesGroupConfiguration } from '@/schemas/charts';
import { ArrowDown, ArrowUp, Check, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useChartStore } from '../../hooks/useChartStore';
import { applyAlpha } from '../chart-renderer/utils';
import { getContextualOperandLabel, operationIcons, operationLabels } from './utils';

// ============================================================================
// Main Component
// ============================================================================

type CalculationConfigProps = {
  series: SeriesGroupConfiguration;
};

export function CalculationConfig({ series }: CalculationConfigProps) {
  const { chart, updateSeries } = useChartStore();

  const handleCalculationChange = (newCalculation: Calculation) => {
    if (hasCalculationCycle(series.id, newCalculation, chart.series)) {
      toast.error('This change would create a circular dependency.');
      return;
    }
    updateSeries(series.id, { ...series, calculation: newCalculation });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculation</CardTitle>
      </CardHeader>
      <CardContent>
        <RecursiveCalculation
          calculation={series.calculation}
          onChange={handleCalculationChange}
          allSeries={chart.series}
          seriesId={series.id}
          chart={chart}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Recursive Calculation Component
// ============================================================================

type RecursiveCalculationProps = {
  calculation: Calculation;
  onChange: (calculation: Calculation) => void;
  allSeries: Series[];
  seriesId: string;
  chart: Chart;
} & ControlPanelProps;

function RecursiveCalculation({
  calculation,
  onChange,
  allSeries,
  seriesId,
  chart,
  controls
}: RecursiveCalculationProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const availableSeries = allSeries.filter(s => s.id !== seriesId);

  const handleOpChange = (op: Operation) => {
    onChange({ ...calculation, op });
  };

  const handleAddSeries = (operand: string) => {
    const newArgs = [...calculation.args, operand];
    onChange({ ...calculation, args: newArgs });
    setIsPopoverOpen(false);
  };

  const handleAddNestedCalculation = () => {
    const newNestedCalc: Calculation = { op: 'sum', args: [] };
    const newArgs = [...calculation.args, newNestedCalc];
    onChange({ ...calculation, args: newArgs });
  };

  const handleMoveOperand = (index: number, direction: 'up' | 'down') => {
    const newArgs = [...calculation.args];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newArgs.length) {
      return;
    }
    // Simple swap
    [newArgs[index], newArgs[targetIndex]] = [newArgs[targetIndex], newArgs[index]];

    onChange({ ...calculation, args: newArgs });
  };

  const handleOperandChange = (index: number, newOperand: Calculation | number) => {
    const newArgs = [...calculation.args];
    newArgs[index] = newOperand;
    onChange({ ...calculation, args: newArgs });
  };

  const handleRemoveOperand = (index: number) => {
    const newArgs = calculation.args.filter((_, i) => i !== index);
    onChange({ ...calculation, args: newArgs });
  };

  return (
    <div className="bg-muted/30 p-4 rounded-lg border space-y-4 overflow-x-auto">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={calculation.op} onValueChange={handleOpChange}>
            <SelectTrigger className="w-[150px] bg-background/50">
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              {['sum', 'subtract', 'multiply', 'divide'].map((op) => (
                <SelectItem key={op} value={op}>
                  <div className="flex items-center gap-2">
                    {operationIcons[op as Operation]}
                    <span>{operationLabels[op as Operation]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-background/50">
                  <PlusCircle className="h-4 w-4" /> Add Series
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandEmpty>No series found.</CommandEmpty>
                  <CommandGroup>
                    {availableSeries.map((s) => (
                      <CommandItem key={s.id} value={s.id} onSelect={handleAddSeries}>
                        <Check className={cn("mr-2 h-4 w-4", calculation.args.includes(s.id) ? "opacity-100" : "opacity-0")} />
                        {s.label || s.id}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" className="gap-2 bg-background/50" onClick={() => onChange({ ...calculation, args: [...calculation.args, 0] })}>
              <PlusCircle className="h-4 w-4" /> Add Number
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-background/50" onClick={handleAddNestedCalculation}>
              <PlusCircle className="h-4 w-4" /> Add Calculation
            </Button>
          </div>
        </div>
        <ControlPanel controls={controls} forceVisible={true} />
      </div>

      <div className="space-y-3 pl-4 border-l-2 ml-2">
        {calculation.args.length > 0 ? (
          calculation.args.map((arg, index) => {
            const operandLabel = getContextualOperandLabel(calculation.op, index);
            const seriesOperand = typeof arg === 'string' ? allSeries.find(s => s.id === arg) : null;

            const controls = {
              canMoveUp: index > 0,
              canMoveDown: index < calculation.args.length - 1,
              onMoveUp: () => handleMoveOperand(index, 'up'),
              onMoveDown: () => handleMoveOperand(index, 'down'),
              onRemove: () => handleRemoveOperand(index),
            };
            return (
              <div key={index} className="flex items-center gap-4">
                <div>
                  <div className={cn("w-16 h-[2px] bg-border -ml-4", operandLabel && "w-4")} />
                </div>
                {operandLabel && <div className="text-sm text-muted-foreground w-20 text-left font-medium">{operandLabel}</div>}
                <div className="flex-grow">
                  {seriesOperand ? (
                    <SeriesOperand
                      series={seriesOperand}
                      chart={chart}
                      controls={controls}
                    />
                  ) : typeof arg === 'number' ? (
                    <NumberOperand
                      value={arg}
                      onChange={(newVal) => handleOperandChange(index, newVal)}
                      controls={controls}
                    />
                  ) : typeof arg !== 'string' ? (
                    <RecursiveCalculation
                      calculation={arg}
                      onChange={(newCalc) => handleOperandChange(index, newCalc)}
                      allSeries={allSeries}
                      seriesId={seriesId}
                      chart={chart}
                      controls={controls}
                    />
                  ) : (
                    <NotFoundSeries
                      seriesId={arg}
                      controls={controls}
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No operands. Add a series or a new calculation.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components & Functions
// ============================================================================

type NotFoundSeriesProps = {
  seriesId: string;
} & ControlPanelProps;

function NotFoundSeries({
  seriesId,
  controls,
}: NotFoundSeriesProps) {
  const idPrefix = seriesId.substring(0, 6);
  return (
    <div className="group text-destructive p-2 flex items-center justify-between gap-4 border border-destructive/50 rounded-lg bg-destructive/10">
      <span>Error: Series not found {idPrefix}...</span>
      <ControlPanel controls={controls} />
    </div>
  );
}

type SeriesOperandProps = {
  series: Series;
  chart: Chart;
} & ControlPanelProps;

function SeriesOperand({
  series,
  chart,
  controls,
}: SeriesOperandProps) {
  const color = series.config.color || chart.config.color;
  const label = series.label || 'Untitled Series';
  const idPrefix = series.id.substring(0, 6);

  return (
    <div className="group flex items-center justify-between p-2 pl-4 border rounded-lg bg-background w-full" style={{ backgroundColor: applyAlpha(color, 0.1) }}>
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium truncate" title={label}>{label}</span>
        <span className="text-xs text-muted-foreground">[id:{idPrefix}...]</span>
      </div>
      <ControlPanel controls={controls} />
    </div>
  );
}

interface ControlPanelProps {
  controls?: {
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
  }
  forceVisible?: boolean;
}

function ControlPanel({ controls, forceVisible }: ControlPanelProps) {
  if (!controls) return null;
  return (
    <div className={
      cn(
        "flex items-center flex-shrink-0 group-hover:opacity-100 transition-opacity mx-2",
        forceVisible ? "opacity-100" : "opacity-0",
      )}>
      <Button variant="ghost" size="icon" onClick={controls.onMoveUp} disabled={!controls.canMoveUp}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={controls.onMoveDown} disabled={!controls.canMoveDown}>
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={controls.onRemove} className="flex-shrink-0">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

type NumberOperandProps = {
  value: number;
  onChange: (value: number) => void;
} & ControlPanelProps;

function NumberOperand({ value, onChange, controls }: NumberOperandProps) {
  return (
    <div className="group flex items-center justify-between p-2 pl-4 border rounded-lg bg-background w-full">
      <Input
        type="number"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <ControlPanel controls={controls} />
    </div>
  );
}
