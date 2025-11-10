import { useMemo, useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { produce } from 'immer';
import type { SeriesConfiguration } from '@/schemas/charts';
import { SeriesConfigSchema } from '@/schemas/charts';
import { SeriesFilter } from '@/components/charts/components/series-config/SeriesFilter';
import type { SeriesFilterAdapter } from '@/components/charts/components/series-config/SeriesFilter';
import type { Alert, AlertCondition } from '@/schemas/alerts';
import { Alert as UiAlert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import { ConditionsList } from './ConditionsList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatasetList } from '@/components/charts/components/series-config/DatasetList';
import { useDatasetStore } from '@/hooks/filters/useDatasetStore';
import { CardDescription } from '@/components/ui/card';
import { AxisInfo } from '@/components/charts/components/series-config/AxisInfo';

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

  // Sync local state when alert prop changes (e.g., when reverting)
  useEffect(() => {
    setLocalTitle(alert.title ?? '');
    setLocalDescription(alert.description ?? '');
  }, [alert.id, alert.title, alert.description]);

  // Debounced update handlers - memoize onChange to prevent recreation
  const debouncedUpdateTitle = useDebouncedCallback(
    useCallback((value: string) => {
      onChange({ title: value });
    }, [onChange]),
    300
  );

  const debouncedUpdateDescription = useDebouncedCallback(
    useCallback((value: string) => {
      onChange({ description: value || undefined });
    }, [onChange]),
    300
  );

  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalTitle(value);
    debouncedUpdateTitle(value);
  }, [debouncedUpdateTitle]);

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setLocalDescription(value);
    debouncedUpdateDescription(value);
  }, [debouncedUpdateDescription]);

  const toggleActive = useCallback((isActive: boolean) => {
    onChange({ isActive });
  }, [onChange]);

  const handleConditionsChange = useCallback((conditions: AlertCondition[]) => {
    onChange({ conditions });
  }, [onChange]);

  const adapter = useMemo<SeriesFilterAdapter>(() => {
    // Create a dummy series object to pass to the SeriesFilter component
    // Use the first condition's unit or default to 'RON'
    const unit = alert.conditions?.[0]?.unit ?? 'RON';

    const series: SeriesConfiguration = {
      id: alert.id ?? 'new-alert',
      type: 'line-items-aggregated-yearly',
      label: alert.title ?? '',
      filter: alert.filter,
      enabled: alert.isActive ?? true,
      unit,
      config: SeriesConfigSchema.parse({}), // Use default config
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };

    const applyChanges = (mutator: (draft: SeriesConfiguration) => void) => {
      onChange((alertDraft) => {
        const currentUnit = alertDraft.conditions?.[0]?.unit ?? 'RON';
        const currentSeries: SeriesConfiguration = {
          id: alertDraft.id ?? 'new-alert',
          type: 'line-items-aggregated-yearly',
          label: alertDraft.title ?? '',
          filter: alertDraft.filter,
          enabled: alertDraft.isActive ?? true,
          unit: currentUnit,
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

  // Static dataset selector helpers
  const { get: getDataset, add: addDatasets } = useDatasetStore(alert.datasetId ? [alert.datasetId] : []);
  const selectedDataset = alert.datasetId ? getDataset(alert.datasetId) : null;

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
                  onChange={handleTitleChange}
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
                  onChange={handleDescriptionChange}
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

              <div className="space-y-2">
                <Label>
                  <Trans>Alert type</Trans>
                </Label>
                <Select
                  value={alert.seriesType}
                  onValueChange={(v) => onChange({ seriesType: v as 'analytics' | 'static' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytics">{t`Data series (analytics)`}</SelectItem>
                    <SelectItem value="static">{t`Static dataset`}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Alert Conditions</Trans>
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
                    This alert is included in every monthly newsletter with its current status. When all threshold conditions are met, the alert will be emphasized with a customized message to draw your attention.
                  </Trans>
                </AlertDescription>
              </UiAlert>

              <ConditionsList
                conditions={alert.conditions ?? []}
                onChange={handleConditionsChange}
              />
            </CardContent>
          </Card>

          {alert.seriesType === 'analytics' && (
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
          )}

          {alert.seriesType === 'static' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans>Static Dataset</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>Select a predefined dataset to track</Trans>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DatasetList
                  selectedOptions={alert.datasetId && selectedDataset ? [{ id: selectedDataset.id, label: selectedDataset.name }] : []}
                  toggleSelect={(dataset) => onChange({ datasetId: dataset.id })}
                  addDatasets={addDatasets}
                />
                {selectedDataset && (
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="text-sm font-medium">{selectedDataset.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedDataset.description}</div>
                    <AxisInfo xAxis={selectedDataset.xAxis} yAxis={selectedDataset.yAxis} variant="compact" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
