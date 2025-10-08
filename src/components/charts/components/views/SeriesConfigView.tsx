import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Settings, Eye, RotateCcw, BellPlus } from 'lucide-react';
import { CustomSeriesValueConfigurationSchema, Series, SeriesConfiguration, SeriesGroupConfiguration, StaticSeriesConfigurationSchema } from '@/schemas/charts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { SeriesFilter } from '../series-config/SeriesFilter';
import { useChartStore } from '../../hooks/useChartStore';
import { generateRandomColor } from '../chart-renderer/utils';
import { Slider } from '@/components/ui/slider';
import { DataLabelSelector } from '../series-config/DataLabelSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CalculationConfig } from '../series-config/CalculationConfig';
import { CustomSeriesDataEditor } from '../series-config/CustomSeriesDataEditor';
import { CustomSeriesConfigurationSchema } from '@/schemas/charts';
import { CustomSeriesValueEditor } from '../series-config/CustomSeriesValueEditor';
import { UnitInput } from '../series-config/UnitInput';
import { StaticSeriesEditor } from '../series-config/StaticSeriesEditor';
import { useCopyPasteChart } from '../../hooks/useCopyPaste';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useNavigate } from '@tanstack/react-router';
import { buildAlertFromSeries } from '@/lib/alert-links';
import { Analytics } from '@/lib/analytics';

export function SeriesConfigView() {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const { chart, seriesId, updateSeries, deleteSeries, goToOverview, goToConfig } = useChartStore();
  const series = chart.series.find(s => s.id === seriesId);
  const seriesLabel = series?.label || '';
  const [localLabel, setLocalLabel] = useState(seriesLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const { duplicateSeries, copySeries } = useCopyPasteChart();
  const navigate = useNavigate({ from: '/charts/$chartId' });


  useEffect(() => {
    setLocalLabel(seriesLabel);
  }, [seriesLabel]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const updateSeriesField = (field: keyof Series, value: string | object) => {
    if (!series) return;
    updateSeries(series.id, (prev) => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  const updateSeriesConfig = (config: Partial<SeriesConfiguration['config']>) => {
    if (!series) return;
    updateSeries(series.id, (prev) => ({
      ...prev,
      config: { ...prev.config, ...config },
      updatedAt: new Date().toISOString(),
    }));
  };

  if (!series) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground"><Trans>Series not found</Trans></p>
          <Button onClick={goToConfig} className="mt-4">
            <Trans>Back to Configuration</Trans>
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteSeries = () => {
    goToOverview();
    deleteSeries(series?.id || '');
  };

  const handleCreateAlertFromSeries = () => {
    if (!series || series.type !== 'line-items-aggregated-yearly') {
      return;
    }
    const alert = buildAlertFromSeries(series as SeriesConfiguration, { chartId: chart.id, chartTitle: chart.title });
    Analytics.capture(Analytics.EVENTS.AlertCreated, {
      alert_id: alert.id,
      source: 'chart_series',
      chart_id: chart.id,
      series_id: series.id,
    });
    navigate({
      to: '/alerts/$alertId',
      params: { alertId: alert.id },
      search: { alert, view: 'overview', mode: 'create' },
      replace: false,
    });
  };

  const isLineItemsSeries = series.type === 'line-items-aggregated-yearly';

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6 w-full overflow-x-hidden">
      {/* Normal page header with breadcrumbs */}
      <header className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="#" onClick={(e) => { e.preventDefault(); goToOverview(); }}>Chart</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="#" onClick={(e) => { e.preventDefault(); goToConfig(); }}>Chart Config</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Config</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight"><Trans>Configure Series</Trans></h2>
          <div className="flex items-center gap-2">
            <Button onClick={goToOverview} className="gap-2">
              <Eye className="h-4 w-4" />
              <Trans>View Chart</Trans>
            </Button>
          </div>
        </div>
      </header>

      {/* Single-column flow with quick settings under type */}
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="series-label"><Trans>Series Label</Trans> *</Label>
              <Input
                ref={inputRef}
                id="series-label"
                value={localLabel}
                onChange={(e) => {
                  setLocalLabel(e.target.value);
                  updateSeriesField('label', e.target.value);
                }}
                placeholder={t`Enter series label...`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="series-type"><Trans>Series Type</Trans></Label>
              <Select
                value={series?.type}
                onValueChange={(value) => updateSeriesField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t`Select Series Type`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line-items-aggregated-yearly"><Trans>Line Items Aggregated Yearly</Trans></SelectItem>
                  <SelectItem value="aggregated-series-calculation"><Trans>Aggregated Series Calculation</Trans></SelectItem>
                  <SelectItem value="custom-series"><Trans>Custom Series</Trans></SelectItem>
                  <SelectItem value="custom-series-value"><Trans>Custom Series Value</Trans></SelectItem>
                  <SelectItem value="static-series"><Trans>Static Series</Trans></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick settings section with improved layout */}
            <div className="flex flex-col gap-4 pt-2 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                {/* Left side: Active toggle and Color picker */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="series-enabled" className="text-sm font-medium cursor-pointer">
                      <Trans>Active</Trans>
                    </Label>
                    <Switch
                      id="series-enabled"
                      checked={!!series?.enabled}
                      onCheckedChange={(checked) => series && updateSeries(series.id, (prev) => ({ ...prev, enabled: checked, updatedAt: new Date().toISOString() }))}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="series-color" className="text-sm font-medium">
                      <Trans>Series Color</Trans>
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="series-color"
                        type="color"
                        value={series?.config.color || chart.config.color}
                        onChange={(e) => updateSeriesConfig({ color: e.target.value })}
                        className="w-10 h-10 rounded-md border-2 cursor-pointer"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => updateSeriesConfig({ color: generateRandomColor() })}
                        title={t`Generate random color`}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right side: Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {isLineItemsSeries && (
                    <Button variant="outline" size="sm" onClick={handleCreateAlertFromSeries} title={t`Create alert from this series`}>
                      <BellPlus className="h-4 w-4 mr-2" />
                      <Trans>Create Alert</Trans>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => duplicateSeries(series!.id)} title={t`Duplicate series`}>
                    <Trans>Duplicate</Trans>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copySeries(series!.id)} title={t`Copy series`}>
                    <Trans>Copy</Trans>
                  </Button>
                </div>
              </div>
            </div>

            {series.type !== 'line-items-aggregated-yearly' && (
              <UnitInput
                id="series-unit"
                value={series?.unit || ''}
                onChange={(value) => updateSeriesField('unit', value)}
                placeholder={t`e.g., RON, %, Units...`}
              />
            )}

            <div className="pt-2">
              <Button
                variant="link"
                className="p-0 h-auto text-sm font-normal text-muted-foreground hover:text-foreground"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                {showAdvancedSettings ? <Trans>Hide advanced settings</Trans> : <Trans>Show advanced settings</Trans>}
              </Button>
            </div>

            {showAdvancedSettings && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="series-show-data-labels" className="flex flex-col space-y-1">
                    <span><Trans>Show Data Labels</Trans></span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      <Trans>Display data labels on the chart</Trans>
                    </span>
                  </Label>
                  <Switch
                    id="series-show-data-labels"
                    checked={series?.config.showDataLabels ?? false}
                    onCheckedChange={(checked) => updateSeriesConfig({ showDataLabels: checked })}
                  />
                </div>
                <DataLabelSelector
                  selectedLabels={series.config.dataLabels || []}
                  onChange={(labels) => updateSeriesConfig({ dataLabels: labels })}
                />
                <div className="space-y-3">
                  <Label htmlFor="data-label-offset"><Trans>Data Label Offset</Trans></Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="data-label-offset"
                      min={-100}
                      max={100}
                      step={1}
                      value={[series.config.dataLabelOffset || 0]}
                      onValueChange={(value) => updateSeriesConfig({ dataLabelOffset: value[0] })}
                      className="w-full"
                    />
                    <span className="text-sm font-medium text-muted-foreground w-16 text-right">
                      {series.config.dataLabelOffset || 0}px
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ================= Series Filter / Calculation ================= */}
        {series.type === 'line-items-aggregated-yearly' && (
          <SeriesFilter seriesId={seriesId} />
        )}
        {series.type === 'aggregated-series-calculation' && (
          <CalculationConfig series={series as SeriesGroupConfiguration} />
        )}
        {series.type === 'custom-series' && (
          <CustomSeriesDataEditor series={series as z.infer<typeof CustomSeriesConfigurationSchema>} />
        )}
        {series.type === 'custom-series-value' && (
          <CustomSeriesValueEditor series={series as z.infer<typeof CustomSeriesValueConfigurationSchema>} />
        )}
        {series.type === 'static-series' && (
          <StaticSeriesEditor series={series as z.infer<typeof StaticSeriesConfigurationSchema>} />
        )}

        {/* ================= Series Delete ================= */}
        <footer className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
          <Button onClick={goToConfig} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            <Trans>Chart Configuration</Trans>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <Trans>Delete Series</Trans>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel><Trans>Are you sure you want to delete this series?</Trans></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteSeries}
                className="text-destructive focus:bg-destructive focus:text-white"
              >
                <Trans>Delete</Trans>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trans>Cancel</Trans>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </footer>
      </div>
    </div>
  );
}
