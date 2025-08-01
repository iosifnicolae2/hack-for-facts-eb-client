import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { hasCalculationCycle } from '@/lib/chart-calculation-utils';
import { Calculation, Chart, Operation, Series, SeriesGroupConfiguration } from '@/schemas/charts';
import { Check, DivideIcon, Minus, PlusCircle, Sigma, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useChartStore } from '../../hooks/useChartStore';
import React from 'react';
import { applyAlpha } from '../chart-renderer/utils';

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
  onRemove?: () => void;
};

function RecursiveCalculation({
  calculation,
  onChange,
  allSeries,
  seriesId,
  chart,
  onRemove,
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

  const handleOperandChange = (index: number, newOperand: Calculation) => {
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
            <Button variant="outline" size="sm" className="gap-2 bg-background/50" onClick={handleAddNestedCalculation}>
              <PlusCircle className="h-4 w-4" /> Add Calculation
            </Button>
          </div>
        </div>
        {onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <div className="space-y-3 pl-4 border-l-2 ml-2">
        {calculation.args.length > 0 ? (
          calculation.args.map((arg, index) => {
            const operandLabel = getContextualOperandLabel(calculation.op, index);
            const seriesOperand = typeof arg === 'string' ? allSeries.find(s => s.id === arg) : null;
            return (
              <div key={index} className="flex items-center gap-4">
                <div>
                  <div className={cn("w-16 h-[2px] bg-border -ml-4", operandLabel && "w-4")} />
                </div>
                {operandLabel && <div className="text-sm text-muted-foreground w-24 text-right font-medium">{operandLabel}</div>}
                <div className="flex-grow">
                  {seriesOperand ? (
                    <SeriesOperand
                      series={seriesOperand}
                      chart={chart}
                      onRemove={() => handleRemoveOperand(index)}
                    />
                  ) : typeof arg !== 'string' ? (
                    <RecursiveCalculation
                      calculation={arg}
                      onChange={(newCalc) => handleOperandChange(index, newCalc)}
                      allSeries={allSeries}
                      seriesId={seriesId}
                      chart={chart}
                      onRemove={() => handleRemoveOperand(index)}
                    />
                  ) : (
                    <NotFoundSeries seriesId={seriesId} onRemove={() => handleRemoveOperand(index)} />
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

function NotFoundSeries({ seriesId, onRemove }: { seriesId: string, onRemove: () => void }) {
  const idPrefix = seriesId.substring(0, 6);
  return (
    <div className="text-destructive p-2 flex items-center gap-4">
      <span>Error: Series not found {idPrefix}...</span>
      <Button variant="ghost" size="icon" onClick={onRemove} className="flex-shrink-0">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SeriesOperand({ series, chart, onRemove }: { series: Series, chart: Chart, onRemove: () => void }) {
  const color = series.config.color || chart.config.color;
  const label = series.label || 'Untitled Series';
  const idPrefix = series.id.substring(0, 6);

  return (
    <div className="flex items-center justify-between p-2 pl-4 border rounded-lg bg-background w-full" style={{ backgroundColor: applyAlpha(color, 0.1) }}>
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium truncate" title={label}>{label}</span>
        <span className="text-xs text-muted-foreground">[id:{idPrefix}...]</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} className="flex-shrink-0">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getContextualOperandLabel(op: Operation, index: number): string | null {
  if (op === 'subtract') {
    return index === 0 ? 'From' : 'Subtract';
  }
  if (op === 'divide') {
    if (index === 0) return 'Numerator';
    if (index === 1) return 'Denominator';
    return `Divide by`;
  }
  return null;
}

const operationIcons: Record<Operation, React.ReactNode> = {
  sum: <Sigma className="h-4 w-4" />,
  subtract: <Minus className="h-4 w-4" />,
  multiply: <X className="h-4 w-4" />,
  divide: <DivideIcon className="h-4 w-4" />,
};

const operationLabels: Record<Operation, string> = {
  sum: 'Sum',
  subtract: 'Subtract',
  multiply: 'Multiply',
  divide: 'Divide',
};