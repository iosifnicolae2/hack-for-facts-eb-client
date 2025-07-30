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
  showTooltip: z.boolean().default(true),
  editAnnotations: z.boolean().default(true),
  showAnnotations: z.boolean().default(true),
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
  budget_sector_ids: z.array(z.string()).optional(),
  funding_source_ids: z.array(z.string()).optional(),
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
// ANNOTATIONS SCHEMA
// ============================================================================

export const AnnotationSchema = z.object({
  type: z.literal('annotation'),
  id: z.string().default(() => crypto.randomUUID()),
  enabled: z.boolean().default(true),
  locked: z.boolean().default(true),
  title: z.string(),
  subtitle: z.string().optional(),
  color: z.string().default('#000'),
  pX: z.number().min(-1).max(1).default(0.5).describe('Percentage of the x-axis to place the annotation'),
  pY: z.number().min(-1).max(1).default(0.5).describe('Percentage of the y-axis to place the annotation'),
  pXDelta: z.number().min(-1).max(1).default(0.05).describe('Percentage of the x-axis to move the annotation label'),
  pYDelta: z.number().min(-1).max(1).default(0.05).describe('Percentage of the y-axis to move the annotation label'),
});

export type TAnnotation = z.infer<typeof AnnotationSchema>;

// ============================================================================
// MAIN CHART SCHEMA
// ============================================================================

export const ChartSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: z.string().default(''),
  description: z.string().optional(),

  // Global chart configuration
  config: ChartConfigSchema,

  // Series data
  series: z.array(SeriesConfigurationSchema).default([]),

  // Annotations
  annotations: z.array(AnnotationSchema).default([]),

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