import { ChartSchema, CustomSeriesValueConfigurationSchema } from '@/schemas/charts';
import type { Chart, ChartConfig, SeriesConfiguration } from '@/schemas/charts';
import type { ChartUrlState } from '@/components/charts/page-schema';
import { createEmptyAlert, type Alert } from '@/schemas/alerts';
import { t } from '@lingui/core/macro';
import { ensureShortRedirectUrl } from '@/lib/api/shortLinks';
import { getSiteUrl } from '@/config/env';

const DEFAULT_CHART_CONFIG: ChartConfig = {
  chartType: 'line',
  color: '#0062ff',
  showDataLabels: false,
  showGridLines: true,
  showLegend: true,
  showRelativeValues: false,
  showTooltip: true,
  editAnnotations: false,
  showAnnotations: false,
  showDiffControl: false,
};

export function buildAlertPreviewChartState(alert: Alert): ChartUrlState {
  const thresholdLabel = t`Threshold (${alert.condition?.unit ?? 'RON'})`;
  const thresholdSeries = CustomSeriesValueConfigurationSchema.parse({
    id: `${alert.id}-threshold`,
    label: thresholdLabel,
    type: 'custom-series-value',
    value: alert.condition?.threshold ?? 0,
    unit: alert.condition?.unit ?? 'RON',
    config: {
      visible: true,
      showDataLabels: false,
      color: '#f97316',
    },
  });

  // Create a basic series configuration for preview
  const seriesConfig: any = {
    id: `${alert.id}-series`,
    type: 'line-items-aggregated-yearly',
    label: alert.title || t`Alert series`,
    enabled: true,
    config: {
      visible: true,
      showDataLabels: false,
      color: '#0062ff',
    },
  };

  if (alert.filter) {
    seriesConfig.filter = alert.filter;
  }

  const primarySeries: SeriesConfiguration = seriesConfig;

  const chart: Chart = ChartSchema.parse({
    id: `${alert.id}-preview`,
    title: alert.title || 'Alert Preview',
    description: alert.description,
    config: {
      ...DEFAULT_CHART_CONFIG,
      color: '#0062ff',
    },
    series: [
      primarySeries,
      thresholdSeries,
    ],
    annotations: [],
    createdAt: alert.createdAt,
    updatedAt: new Date().toISOString(),
  });

  return {
    chart,
    view: 'overview',
    seriesId: chart.series[0]?.id,
  };
}

export function buildAlertPreviewChartLink(alert: Alert) {
  const chartState = buildAlertPreviewChartState(alert);
  return {
    to: '/charts/$chartId' as const,
    params: { chartId: chartState.chart.id },
    search: chartState,
  };
}

export function buildAlertFromFilter(filter: any, options?: { chartId?: string; chartTitle?: string; label?: string }): Alert {
  const alertId = crypto.randomUUID();
  const base = createEmptyAlert({
    id: alertId,
    title: options?.chartTitle ? `${options.label || 'Filter'} alert` : options?.label || 'New alert',
    description: options?.chartTitle ? `Alert created from chart "${options.chartTitle}"` : undefined,
  });

  return {
    ...base,
    filter: filter,
    condition: base.condition, // Keep default condition
  };
}

/** Build a sanitized payload for sharing/cloning an alert */
export function serializeAlertForShare(alert: Alert): Partial<Alert> {
  return {
    title: alert.title,
    description: alert.description,
    isActive: alert.isActive,
    filter: alert.filter,
    condition: alert.condition,
  } as Partial<Alert>;
}

export function buildAlertShareDestination(alert: Alert) {
  return {
    to: '/alerts/new' as const,
    search: { preset: serializeAlertForShare(alert) },
  };
}

export async function ensureAlertShareUrl(alert: Alert): Promise<string> {
  const dest = buildAlertShareDestination(alert);
  const params = new URLSearchParams();
  params.set('preset', encodeURIComponent(JSON.stringify(dest.search.preset)));
  const url = `${getSiteUrl()}${dest.to}?${params.toString()}`;
  return ensureShortRedirectUrl(url, getSiteUrl());
}
