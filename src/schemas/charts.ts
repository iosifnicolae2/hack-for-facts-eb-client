import { z } from 'zod';
import { ChartTypeEnum, DEFAULT_CHART } from './constants';

/**
 * Global chart configuration that can be overridden by individual series
 */
export const ChartConfigSchema = z.object({
  chartType: ChartTypeEnum,
  color: z.string().default('#0000ff'),
  showDataLabels: z.boolean().default(false),
  showGridLines: z.boolean().default(true),
  showLegend: z.boolean().default(true),
  showRelativeValues: z.boolean().default(false),
  // yearRangeEnabled: z.boolean().default(false),
  // yearRangeStart: z.number().optional(),
  // yearRangeEnd: z.number().optional(),
});

export type ChartConfig = z.infer<typeof ChartConfigSchema>;

/**
 * Series-specific configuration that can override global settings
 */
export const SeriesConfigSchema = ChartConfigSchema.partial().extend({
  visible: z.boolean().default(true),
  yAxisId: z.enum(['left', 'right']).default('left'),
});

export type SeriesConfig = z.infer<typeof SeriesConfigSchema>;

// ============================================================================
// ANALYTICS FILTER SCHEMA (reusable from existing system)
// ============================================================================

export const AnalyticsFilterSchema = z.object({
  years: z.array(z.number()).optional(),
  entity_cuis: z.array(z.string()).optional(),
  economic_prefixes: z.array(z.string()).optional(),
  functional_prefixes: z.array(z.string()).optional(),
  report_type: z.enum(['Executie bugetara agregata la nivel de ordonator principal', 'Executie bugetara detaliata']).optional().default('Executie bugetara agregata la nivel de ordonator principal'),
  account_category: z.enum(['ch', 'vn']).optional().default('ch'),
  economic_codes: z.array(z.string()).optional(),
  functional_codes: z.array(z.string()).optional(),
  uat_ids: z.array(z.string()).optional(),
  min_amount: z.number().or(z.string()).optional(),
  max_amount: z.number().or(z.string()).optional(),
  is_uat: z.boolean().optional(),
  entity_types: z.array(z.string()).optional(),
});

export type AnalyticsFilterType = z.infer<typeof AnalyticsFilterSchema>;

// ============================================================================
// SERIES CONFIGURATION
// ============================================================================

export const SeriesConfigurationSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  type: z.literal('line-items-aggregated-yearly').default('line-items-aggregated-yearly'),
  enabled: z.boolean().default(true),
  label: z.string().default(''),
  filter: AnalyticsFilterSchema,
  filterMetadata: z.record(z.string(), z.string()).default({}),
  config: SeriesConfigSchema,
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type SeriesConfiguration = z.infer<typeof SeriesConfigurationSchema>;

// ============================================================================
// ANNOTATIONS SYSTEM
// ============================================================================

export const PointAnnotationSchema = z.object({
  type: z.literal('point'),
  seriesId: z.string(),
  dataIndex: z.number(),
  title: z.string(),
  description: z.string().optional(),
  color: z.string().default('#ff0000'),
});

export const LineAnnotationSchema = z.object({
  type: z.literal('line'),
  orientation: z.enum(['horizontal', 'vertical']),
  value: z.number(),
  title: z.string(),
  description: z.string().optional(),
  color: z.string().default('#ff0000'),
  strokeDasharray: z.string().default('5,5'),
});

export const ThresholdAnnotationSchema = z.object({
  type: z.literal('threshold'),
  value: z.number(),
  condition: z.enum(['above', 'below']),
  title: z.string(),
  description: z.string().optional(),
  color: z.string().default('#ffa500'),
});

export const RegionAnnotationSchema = z.object({
  type: z.literal('region'),
  startValue: z.number(),
  endValue: z.number(),
  orientation: z.enum(['horizontal', 'vertical']),
  title: z.string(),
  description: z.string().optional(),
  color: z.string().default('#ffcccc'),
  opacity: z.number().min(0).max(1).default(0.3),
});

export const AnnotationSchema = z.discriminatedUnion('type', [
  PointAnnotationSchema,
  LineAnnotationSchema,
  ThresholdAnnotationSchema,
  RegionAnnotationSchema,
]);

export type Annotation = z.infer<typeof AnnotationSchema>;

// ============================================================================
// CHART AXIS CONFIGURATION
// ============================================================================

export const AxisConfigSchema = z.object({
  label: z.string().optional(),
  showTicks: z.boolean().default(true),
  showTickLabels: z.boolean().default(true),
  tickCount: z.number().min(2).max(20).optional(),
  domain: z.tuple([z.union([z.number(), z.literal('auto')]), z.union([z.number(), z.literal('auto')])]).optional(),
  scale: z.enum(['linear', 'log']).default('linear'),
  formatter: z.enum(['number', 'currency', 'percentage', 'date']).default('number'),
});

export type AxisConfig = z.infer<typeof AxisConfigSchema>;

// ============================================================================
// MAIN CHART SCHEMA
// ============================================================================

export const ChartSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: z.string().default(''),
  description: z.string().optional(),

  // Global chart configuration
  config: ChartConfigSchema,

  // Axis configurations. Disabled for now.
  // xAxis: AxisConfigSchema.optional(),
  // yAxis: AxisConfigSchema.optional(),
  // rightYAxis: AxisConfigSchema.optional(),

  // Series data
  series: z.array(SeriesConfigurationSchema).default([]),

  // Annotations
  // annotations: z.array(AnnotationSchema).default([]),

  // Metadata
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
}).default(DEFAULT_CHART);

export type Chart = z.infer<typeof ChartSchema>;

// ============================================================================
// CHART STATE (Runtime data)
// ============================================================================

export const YearlyTrendPointSchema = z.object({
  year: z.number(),
  totalAmount: z.number(),
});

export const AnalyticsDataPointSchema = z.object({
  label: z.string(),
  yearlyTrend: z.array(YearlyTrendPointSchema),
});

export const AnalyticsInputSchema = z.object({
  seriesId: z.string(),
  filter: AnalyticsFilterSchema,
});

export type AnalyticsInput = z.infer<typeof AnalyticsInputSchema>;

// ============================================================================
// Copy/Paste schemas
// ============================================================================

export const CopiedSeriesSchema = z.object({
  type: z.literal('chart-series-copy'),
  payload: z.array(SeriesConfigurationSchema),
});

export type CopiedSeries = z.infer<typeof CopiedSeriesSchema>;