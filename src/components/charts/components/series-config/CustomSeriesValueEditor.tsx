import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSeriesValueConfigurationSchema } from '@/schemas/charts';
import { useChartStore } from '../../hooks/useChartStore';
import { useEffect, useState } from 'react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

type CustomSeriesValueEditorProps = {
  series: z.infer<typeof CustomSeriesValueConfigurationSchema>;
};

export function CustomSeriesValueEditor({ series }: CustomSeriesValueEditorProps) {
  const [localValue, setLocalValue] = useState(series.value);
  const { updateSeries } = useChartStore();

  useEffect(() => {
    setLocalValue(series.value);
  }, [series.value]);

  const handleValueChange = (value: string) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setLocalValue(numericValue);
      updateSeries(series.id, { ...series, value: numericValue });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><Trans>Constant Value</Trans></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="series-value"><Trans>Value</Trans></Label>
          <Input
            id="series-value"
            type="number"
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={t`Enter a constant value`}
          />
          <p className="text-sm text-muted-foreground">
            <Trans>This value will be used for every year in the chart's range.</Trans>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
