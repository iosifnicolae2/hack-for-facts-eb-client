import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import type { AlertCondition } from '@/schemas/alerts';
import { AlertConditionSchema } from '@/schemas/alerts';

interface ConditionsListProps {
  conditions: AlertCondition[];
  onChange: (conditions: AlertCondition[]) => void;
}

export function ConditionsList({ conditions, onChange }: ConditionsListProps) {
  const addCondition = useCallback(() => {
    const newCondition = AlertConditionSchema.parse({});
    onChange([...conditions, newCondition]);
  }, [conditions, onChange]);

  const removeCondition = useCallback((index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  }, [conditions, onChange]);

  const updateCondition = useCallback((index: number, updates: Partial<AlertCondition>) => {
    const updated = conditions.map((condition, i) =>
      i === index ? { ...condition, ...updates } : condition
    );
    onChange(updated);
  }, [conditions, onChange]);

  const handleOperatorChange = useCallback((index: number, operator: string) => {
    const parsed = AlertConditionSchema.shape.operator.safeParse(operator);
    if (!parsed.success) {
      return;
    }
    updateCondition(index, { operator: parsed.data });
  }, [updateCondition]);

  return (
    <div className="space-y-4">
      {conditions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            <Trans>No conditions added yet. Click the button below to add your first condition.</Trans>
          </p>
          <Button onClick={addCondition} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            <Trans>Add Condition</Trans>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        <Trans>Condition {index + 1}</Trans>
                      </span>
                      <Button
                        onClick={() => removeCondition(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only"><Trans>Remove condition</Trans></span>
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`condition-operator-${index}`}>
                          <Trans>Operator</Trans>
                        </Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => handleOperatorChange(index, value)}
                        >
                          <SelectTrigger id={`condition-operator-${index}`}>
                            <SelectValue placeholder={t`Choose operator`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gt">{t`Greater than`}</SelectItem>
                            <SelectItem value="gte">{t`Greater or equal`}</SelectItem>
                            <SelectItem value="lt">{t`Less than`}</SelectItem>
                            <SelectItem value="lte">{t`Less or equal`}</SelectItem>
                            <SelectItem value="eq">{t`Equal to`}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`condition-threshold-${index}`}>
                          <Trans>Threshold</Trans>
                        </Label>
                        <Input
                          id={`condition-threshold-${index}`}
                          type="number"
                          step={1000}
                          value={condition.threshold}
                          onChange={(e) => updateCondition(index, { threshold: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`condition-unit-${index}`}>
                        <Trans>Unit</Trans>
                      </Label>
                      <Input
                        id={`condition-unit-${index}`}
                        value={condition.unit}
                        onChange={(e) => updateCondition(index, { unit: e.target.value })}
                        placeholder="RON"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={addCondition} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            <Trans>Add Another Condition</Trans>
          </Button>
        </>
      )}
    </div>
  );
}
