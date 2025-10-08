import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { SeriesFilter } from '@/components/charts/components/series-config/SeriesFilter';
import type { SeriesFilterAdapter } from '@/components/charts/components/series-config/SeriesFilter';
import { AlertConditionSchema, type Alert } from '@/schemas/alerts';
import { Alert as UiAlert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDeleteAlertMutation, useSaveAlertMutation } from '@/features/alerts/hooks/useAlertsApi';
import { useNavigate, useBlocker } from '@tanstack/react-router';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { areAlertsEqual, useAlertStore } from '../hooks/useAlertStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartPreview } from '@/components/charts/components/chart-preview/ChartPreview';
import { buildAlertPreviewChartState } from '@/lib/alert-links';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';

interface AlertEditorViewProps {
  serverAlert?: Alert;
  isFetching?: boolean;
  mode: 'create' | 'edit';
  view: 'overview' | 'preview' | 'filters' | 'history';
  onChangeView: (next: 'overview' | 'preview' | 'filters' | 'history') => void;
}

export function AlertEditorView({ serverAlert, isFetching, mode, view, onChangeView }: AlertEditorViewProps) {
  const navigate = useNavigate({ from: '/alerts/$alertId' });
  const {
    alert,
    updateAlert,
    updateSeries,
    setCondition,
    toggleActive,
    setView,
    setAlert,
  } = useAlertStore();

  const initialDraftRef = useRef(alert);

  // Local state for input fields to avoid lag
  const [localTitle, setLocalTitle] = useState(alert.title);
  const [localDescription, setLocalDescription] = useState(alert.description ?? '');
  const [localThreshold, setLocalThreshold] = useState(alert.condition.threshold);
  const [localUnit, setLocalUnit] = useState(alert.condition.unit);

  // Sync local state when alert changes from external sources
  useEffect(() => {
    setLocalTitle(alert.title);
    setLocalDescription(alert.description ?? '');
    setLocalThreshold(alert.condition.threshold);
    setLocalUnit(alert.condition.unit);
  }, [alert.id]); // Only sync when switching to a different alert

  // Debounced update handlers using useDebouncedCallback
  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    updateAlert({ title: value });
  }, 300);

  const debouncedUpdateDescription = useDebouncedCallback((value: string) => {
    updateAlert({ description: value || undefined });
  }, 300);

  const debouncedUpdateUnit = useDebouncedCallback((value: string) => {
    setCondition((draft) => {
      draft.unit = value;
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

  useEffect(() => {
    if (serverAlert) {
      initialDraftRef.current = serverAlert;
    }
  }, [serverAlert]);

  const saveMutation = useSaveAlertMutation();
  const deleteMutation = useDeleteAlertMutation();

  const baselineAlert = serverAlert ?? initialDraftRef.current;
  const isDirty = useMemo(() => !areAlertsEqual(alert, baselineAlert), [alert, baselineAlert]);
  const canBlock = mode !== 'create';

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => canBlock && isDirty && next.pathname !== current.pathname,
    withResolver: true,
    enableBeforeUnload: false,
  });

  const showUnsavedDialog = canBlock && blocker.status === 'blocked' && isDirty;

  const adapter = useMemo<SeriesFilterAdapter>(
    () => ({
      series: alert.series,
      applyChanges: (mutator) => {
        updateSeries((draft) => {
          mutator(draft);
        });
      },
    }),
    [alert.series, updateSeries],
  );

  const debouncedUpdateThreshold = useDebouncedCallback((value: number) => {
    setCondition((draft) => {
      draft.threshold = value;
    });
  }, 300);

  const handleThresholdChange = useCallback((value: number) => {
    setLocalThreshold(value);
    debouncedUpdateThreshold(value);
  }, [debouncedUpdateThreshold]);

  const handleOperatorChange = (operator: string) => {
    const parsed = AlertConditionSchema.shape.operator.safeParse(operator);
    if (!parsed.success) {
      return;
    }
    setCondition((draft) => {
      draft.operator = parsed.data;
    });
  };

  const handleSave = () => {
    saveMutation.mutate(
      { alert },
      {
        onSuccess: (savedAlert) => {
          setAlert(savedAlert, { mode: 'edit' });
        },
      },
    );
  };

  const handleDeleteAlert = () => {
    if (!serverAlert) return;
    deleteMutation.mutate(serverAlert.id, {
      onSuccess: () => navigate({ to: '/alerts', replace: false }),
    });
  };

  const headerStatus = (() => {
    if (saveMutation.isPending) return t`Saving…`;
    if (saveMutation.isError) return saveMutation.error instanceof Error ? saveMutation.error.message : t`Failed to save`;
    if (isFetching) return t`Syncing…`;
    if (isDirty) return t`Unsaved changes`;
    return t`All changes saved`;
  })();

  const isPreviewOpen = view === 'preview';
  const previewChart = useMemo(() => buildAlertPreviewChartState(alert).chart, [alert]);

  return (
    <div className="space-y-6 py-8">
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        isSaving={saveMutation.isPending}
        onStay={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />

      <Dialog open={isPreviewOpen} onOpenChange={(open) => onChangeView(open ? 'preview' : 'overview')}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{alert.title || t`Alert preview`}</DialogTitle>
          </DialogHeader>
          <ChartPreview
            chart={previewChart}
            height={420}
            className="pl-6 pr-4"
            customizeChart={(draft) => {
              draft.config.showLegend = true;
              draft.config.showTooltip = true;
              draft.config.showGridLines = true;
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4 px-2 md:px-0">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              <Trans>Alert Editor</Trans>
            </h1>
            <p className="text-sm text-muted-foreground">
              <Trans>Configure the data series and threshold that will trigger this alert.</Trans>
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-muted-foreground md:text-right md:min-w-[140px]">
              {headerStatus}
            </span>
            <div className="flex items-center gap-2">
              {serverAlert && isDirty ? (
                <Button variant="ghost" size="sm" onClick={() => serverAlert && setAlert(serverAlert)}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  <Trans>Revert</Trans>
                </Button>
              ) : null}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={(!isDirty && !!serverAlert) || saveMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {serverAlert ? <Trans>Save</Trans> : <Trans>Create alert</Trans>}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onChangeView('preview')}
                disabled={saveMutation.isPending}
              >
                <Trans>Preview</Trans>
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                  <Select value={alert.condition.operator} onValueChange={handleOperatorChange}>
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

              <div>
                <Button variant="outline" onClick={() => setView('preview')}>
                  <Trans>Preview chart</Trans>
                </Button>
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
              <div className="flex justify-between">
                <span><Trans>Created</Trans></span>
                <span>{new Date(alert.createdAt).toLocaleString()}</span>
              </div>
              {serverAlert ? (
                <div className="flex justify-between">
                  <span><Trans>Last saved</Trans></span>
                  <span>{new Date(serverAlert.updatedAt).toLocaleString()}</span>
                </div>
              ) : null}
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

          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Danger Zone</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={!serverAlert || deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    <Trans>Delete alert</Trans>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      <Trans>Delete alert</Trans>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <Trans>
                        Are you sure you want to delete this alert? This action cannot be undone.
                      </Trans>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Trans>Cancel</Trans>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteAlert}
                    >
                      <Trans>Delete</Trans>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
