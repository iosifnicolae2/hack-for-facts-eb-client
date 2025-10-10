import { useMemo, useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { produce } from 'immer';
import type { SeriesConfiguration } from '@/schemas/charts';
import { SeriesConfigSchema } from '@/schemas/charts';
import { SeriesFilter } from '@/components/charts/components/series-config/SeriesFilter';
import type { SeriesFilterAdapter } from '@/components/charts/components/series-config/SeriesFilter';
import { AlertConditionSchema, type Alert } from '@/schemas/alerts';
import { Alert as UiAlert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';

type AlertUpdater = Partial<Alert> | ((draft: Alert) => void);

interface AlertEditorViewProps {
  alert: Alert;
  serverAlert?: Alert;
  onChange: (updater: AlertUpdater) => void;
}

export function AlertEditorView({ alert, serverAlert: _serverAlert, onChange }: AlertEditorViewProps) {
  // Local state for input fields to avoid lag
  const [localTitle, setLocalTitle] = useState(alert.title ?? '');
  const [localDescription, setLocalDescription] = useState(alert.description ?? '');
  const [localThreshold, setLocalThreshold] = useState(alert.condition?.threshold ?? 0);
  const [localUnit, setLocalUnit] = useState(alert.condition?.unit ?? 'RON');

  // Sync local state when alert prop changes (e.g., when reverting)
  useEffect(() => {
    setLocalTitle(alert.title ?? '');
    setLocalDescription(alert.description ?? '');
    setLocalThreshold(alert.condition?.threshold ?? 0);
    setLocalUnit(alert.condition?.unit ?? 'RON');
  }, [alert.id, alert.title, alert.description, alert.condition?.threshold, alert.condition?.unit]);

  // Debounced update handlers
  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    onChange({ title: value });
  }, 300);

  const debouncedUpdateDescription = useDebouncedCallback((value: string) => {
    onChange({ description: value || undefined });
  }, 300);

  const debouncedUpdateUnit = useDebouncedCallback((value: string) => {
    onChange((draft) => {
      if (!draft.condition) {
        draft.condition = AlertConditionSchema.parse({});
      }
      draft.condition.unit = value;
    });
  }, 300);

  const debouncedUpdateThreshold = useDebouncedCallback((value: number) => {
    onChange((draft) => {
      if (!draft.condition) {
        draft.condition = AlertConditionSchema.parse({});
      }
      draft.condition.threshold = value;
    });
  }, 300);

  const handleTitleChange = useCallback((value: string) => {
    setLocalTitle(value);
    debouncedUpdateTitle(value);
  }, [debouncedUpdateTitle]);

  const handleDescriptionChange = useCallback((value: string) => {
    setLocalDescription(value);
    debouncedUpdateDescription(value);
  }, [debouncedUpdateDescription]);

  const handleUnitChange = useCallback((value: string) => {
    setLocalUnit(value);
    debouncedUpdateUnit(value);
  }, [debouncedUpdateUnit]);

  const handleThresholdChange = useCallback((value: number) => {
    setLocalThreshold(value);
    debouncedUpdateThreshold(value);
  }, [debouncedUpdateThreshold]);

  const handleOperatorChange = (operator: string) => {
    const parsed = AlertConditionSchema.shape.operator.safeParse(operator);
    if (!parsed.success) {
      return;
    }
    onChange((draft) => {
      if (!draft.condition) {
        draft.condition = AlertConditionSchema.parse({});
      }
      draft.condition.operator = parsed.data;
    });
  };

  const toggleActive = useCallback((isActive: boolean) => {
    onChange({ isActive });
  }, [onChange]);

  const adapter = useMemo<SeriesFilterAdapter>(() => {
    // Create a dummy series object to pass to the SeriesFilter component
    const series: SeriesConfiguration = {
      id: alert.id ?? 'new-alert',
      type: 'line-items-aggregated-yearly',
      label: alert.title ?? '',
      filter: alert.filter,
      enabled: alert.isActive ?? true,
      unit: alert.condition.unit,
      config: SeriesConfigSchema.parse({}), // Use default config
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };

    const applyChanges = (mutator: (draft: SeriesConfiguration) => void) => {
      onChange((alertDraft) => {
        const currentSeries: SeriesConfiguration = {
          id: alertDraft.id ?? 'new-alert',
          type: 'line-items-aggregated-yearly',
          label: alertDraft.title ?? '',
          filter: alertDraft.filter,
          enabled: alertDraft.isActive ?? true,
          unit: alertDraft.condition.unit,
          config: SeriesConfigSchema.parse({}),
          createdAt: alertDraft.createdAt,
          updatedAt: alertDraft.updatedAt,
        };
        const nextSeries = produce(currentSeries, mutator);
        alertDraft.filter = nextSeries.filter;
      });
    };

    return { series, applyChanges };
  }, [alert, onChange]);

  return (
    <div className="space-y-6 py-8">

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Alert Details</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert-title">
                  <Trans>Title</Trans>
                </Label>
                <Input
                  id="alert-title"
                  value={localTitle}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder={t`e.g. Expense growth alert`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-description">
                  <Trans>Description</Trans>
                </Label>
                <Textarea
                  id="alert-description"
                  value={localDescription}
                  onChange={(event) => handleDescriptionChange(event.target.value)}
                  placeholder={t`Optional context for the monthly newsletter`}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="alert-active-toggle">
                    <Trans>Alert enabled</Trans>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    <Trans>Enabled alerts are evaluated monthly and included in your newsletter.</Trans>
                  </p>
                </div>
                <Switch
                  id="alert-active-toggle"
                  checked={alert.isActive}
                  onCheckedChange={toggleActive}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Alert Condition</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UiAlert variant="default">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  <Trans>Monthly monitoring</Trans>
                </AlertTitle>
                <AlertDescription>
                  <Trans>
                    This alert is included in every monthly newsletter with its current status. When the threshold condition is met, the alert will be emphasized with a customized message to draw your attention.
                  </Trans>
                </AlertDescription>
              </UiAlert>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alert-operator">
                    <Trans>Operator</Trans>
                  </Label>
                  <Select value={alert.condition?.operator ?? 'gt'} onValueChange={handleOperatorChange}>
                    <SelectTrigger id="alert-operator">
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
                  <Label htmlFor="alert-threshold">
                    <Trans>Threshold</Trans>
                  </Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    step={1000}
                    value={localThreshold}
                    onChange={(event) => handleThresholdChange(Number(event.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-threshold-unit">
                  <Trans>Threshold unit</Trans>
                </Label>
                <Input
                  id="alert-threshold-unit"
                  value={localUnit}
                  onChange={(event) => handleUnitChange(event.target.value)}
                  placeholder="RON"
                />
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Data Series Filter</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SeriesFilter adapter={adapter} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Metadata</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span><Trans>Alert ID</Trans></span>
                <span className="font-mono text-xs">{alert.id}</span>
              </div>
              {/* TODO: Add back timestamps if needed */}
              {/* <div className="flex justify-between">
                <span><Trans>Created</Trans></span>
                <span>{new Date(alert.createdAt).toLocaleString()}</span>
              </div>
              {serverAlert ? (
                <div className="flex justify-between">
                  <span><Trans>Last saved</Trans></span>
                  <span>{new Date(serverAlert.updatedAt).toLocaleString()}</span>
                </div>
              ) : null} */}
              <div className="flex justify-between">
                <span><Trans>Status</Trans></span>
                <span>{alert.isActive ? t`Active` : t`Paused`}</span>
              </div>
              {alert.lastEvaluatedAt && (
                <div className="flex justify-between">
                  <span><Trans>Last evaluated</Trans></span>
                  <span>{new Date(alert.lastEvaluatedAt).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
