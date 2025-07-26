import { z } from 'zod';

// ============================================================================
// CORE CHART TYPES & ENUMS
// ============================================================================

export const ChartTypeEnum = z.enum(['line', 'bar', 'area', 'scatter', 'pie']);
export type ChartType = z.infer<typeof ChartTypeEnum>;

export const AnnotationTypeEnum = z.enum(['point', 'line', 'threshold', 'region']);
export type AnnotationType = z.infer<typeof AnnotationTypeEnum>;

// ============================================================================
// CHART CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Global chart configuration that can be overridden by individual series
 */
export const ChartConfigSchema = z.object({
  chartType: ChartTypeEnum,
  color: z.string().default('#8884d8'),
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
  entity_cuis: z.array(z.string()).optional(),
  economic_prefixes: z.array(z.string()).optional(),
  functional_prefixes: z.array(z.string()).optional(),
  report_type: z.string().optional(),
  account_category: z.enum(['ch', 'vn']).default('ch'),
  economic_codes: z.array(z.string()).optional(),
  functional_codes: z.array(z.string()).optional(),
  uat_ids: z.array(z.number()).optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  is_main_creditor: z.boolean().optional(),
  is_uat: z.boolean().optional(),
  entity_types: z.array(z.string()).optional(),
});

export type AnalyticsFilterType = z.infer<typeof AnalyticsFilterSchema>;

// ============================================================================
// SERIES CONFIGURATION
// ============================================================================

export const SeriesConfigurationSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  label: z.string().min(1, 'Series label is required'),
  filter: AnalyticsFilterSchema,
  config: SeriesConfigSchema,
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
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
  title: z.string().min(1, 'Chart title is required'),
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
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

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

export const ChartStateSchema = z.object({
  chart: ChartSchema,
  data: z.array(AnalyticsDataPointSchema),
  isLoading: z.boolean().default(false),
  error: z.string().optional(),
  lastUpdated: z.date().optional(),
});

export type ChartState = z.infer<typeof ChartStateSchema>;

// ============================================================================
// CHART BUILDER UI STATE
// ============================================================================

export const ChartBuilderViewEnum = z.enum(['overview', 'series-detail', 'annotations', 'preview']);
export type ChartBuilderView = z.infer<typeof ChartBuilderViewEnum>;

export const ChartBuilderStateSchema = z.object({
  currentView: ChartBuilderViewEnum.default('overview'),
  selectedSeriesId: z.string().optional(),
  selectedAnnotationId: z.string().optional(),
  isDirty: z.boolean().default(false),
  validationErrors: z.record(z.string(), z.array(z.string())).default({}),
});

export type ChartBuilderState = z.infer<typeof ChartBuilderStateSchema>;

// ============================================================================
// URL STATE SCHEMA (for persistence in URL params)
// ============================================================================

export const ChartBuilderUrlStateSchema = z.object({
  chartConfig: z.string().optional(), // base64 encoded chart configuration
  view: ChartBuilderViewEnum.optional(),
  seriesId: z.string().optional(),
});

export type ChartBuilderUrlState = z.infer<typeof ChartBuilderUrlStateSchema>;

// ============================================================================
// API INTEGRATION TYPES
// ============================================================================

export const AnalyticsInputSchema = z.object({
  label: z.string(),
  filter: AnalyticsFilterSchema,
});

export type AnalyticsInput = z.infer<typeof AnalyticsInputSchema>;

// ============================================================================
// CHART TEMPLATE SYSTEM
// ============================================================================

export const ChartTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['financial', 'comparison', 'trend', 'distribution']),
  template: ChartSchema.omit({ id: true, createdAt: true, updatedAt: true }),
  thumbnailUrl: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type ChartTemplate = z.infer<typeof ChartTemplateSchema>;


// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  chartType: 'line',
  color: '#8884d8',
  showDataLabels: false,
  showGridLines: true,
  showLegend: true,
  showRelativeValues: false,
};

export const DEFAULT_SERIES_CONFIG: SeriesConfig = {
  visible: true,
  yAxisId: 'left',
};

export const DEFAULT_AXIS_CONFIG: AxisConfig = {
  showTicks: true,
  showTickLabels: true,
  scale: 'linear',
  formatter: 'number',
}; 