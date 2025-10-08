import { ChartSchema, CustomSeriesValueConfigurationSchema } from '@/schemas/charts';
import type { Chart, ChartConfig, SeriesConfiguration } from '@/schemas/charts';
import type { ChartUrlState } from '@/components/charts/page-schema';
import { createEmptyAlert, type Alert } from '@/schemas/alerts';
import { t } from '@lingui/core/macro';

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
  const thresholdLabel = t`Threshold (${alert.condition.unit})`;
  const thresholdSeries = CustomSeriesValueConfigurationSchema.parse({
    id: `${alert.id}-threshold`,
    label: thresholdLabel,
    type: 'custom-series-value',
    value: alert.condition.threshold,
    unit: alert.condition.unit || alert.series.unit || 'RON',
    config: {
      visible: true,
      showDataLabels: false,
      color: '#f97316',
    },
  });

  const primarySeries = {
    ...alert.series,
    id: alert.series.id || `${alert.id}-series`,
    label: alert.series.label || alert.title || t`Alert series`,
    enabled: true,
  } as SeriesConfiguration;

  const chart: Chart = ChartSchema.parse({
    id: `${alert.id}-preview`,
    title: alert.title || 'Alert Preview',
    description: alert.description,
    config: {
      ...DEFAULT_CHART_CONFIG,
      color: alert.series.config.color,
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

export function buildAlertFromSeries(series: SeriesConfiguration, options?: { chartId?: string; chartTitle?: string }): Alert {
  const alertId = crypto.randomUUID();
  const base = createEmptyAlert({
    id: alertId,
    title: options?.chartTitle ? `${series.label || 'Series'} alert` : series.label || 'New alert',
    description: options?.chartTitle ? `Alert created from chart "${options.chartTitle}"` : undefined,
  });

  return {
    ...base,
    series: {
      ...series,
      id: crypto.randomUUID(),
      label: series.label || base.title || 'Alert series',
      enabled: true,
      unit: series.unit,
    },
    condition: {
      ...base.condition,
      unit: series.unit || base.condition.unit,
    },
  };
}
