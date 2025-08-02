import { z } from 'zod';
import { ChartTypeEnum, DEFAULT_CHART } from './constants';
import { generateRandomColor } from '@/components/charts/components/chart-renderer/utils';

/**
 * Global chart configuration that can be overridden by individual series
 */
export const ChartConfigSchema = z.object({
  chartType: ChartTypeEnum,
  color: z.string().default(generateRandomColor()),
  showDataLabels: z.boolean().optional().describe('Show data labels on the chart for all the series'),
  showGridLines: z.boolean().default(true),
  showLegend: z.boolean().default(true),
  showRelativeValues: z.boolean().optional().describe('Show relative values on the chart for all the series using percentage and the first series as the base'),
  showTooltip: z.boolean().default(true),
  editAnnotations: z.boolean().default(true).describe('Allow editing of annotations'),
  showAnnotations: z.boolean().default(true).describe('Show annotations on the chart'),
  yearRange: z.object({
    start: z.number().optional(),
    end: z.number().optional(),
  }).optional().describe('Year range to show on the chart. If not set, the chart will show all years.'),
});

export type ChartConfig = z.infer<typeof ChartConfigSchema>;

/**
 * Series-specific configuration that can override global settings
 */
export const SeriesConfigSchema = z.object({
  visible: z.boolean().default(true).describe('Show the series on the chart'),
  showDataLabels: z.boolean().default(false).describe('Show data labels on the chart for the y axis'),
  dataLabels: z.array(z.string()).optional().describe('Data labels to show on the chart for the x axis. If not set, the chart will show all years.'),
  dataLabelOffset: z.number().optional().describe('Offset of the data labels from the x axis. If not set, the chart will show the data labels at the default position.'),
  color: z.string().default('#0000ff'),
}).default({});

export type SeriesConfig = z.infer<typeof SeriesConfigSchema>;

// ============================================================================
// ANALYTICS FILTER SCHEMA (reusable from existing system)
// ============================================================================

export const AnalyticsFilterSchema = z.object({
  years: z.array(z.number()).optional().describe('Years to filter the data by. If not set, the chart will show all years.'),
  entity_cuis: z.array(z.string()).optional().describe('The public entities cui of cif.'),
  economic_prefixes: z.array(z.string()).optional().describe('The economic prefixes using Romanian COFOG3 codes.'),
  functional_prefixes: z.array(z.string()).optional().describe('The functional prefixes using Romanian COFOG3 codes.'),
  report_type: z.enum(['Executie bugetara agregata la nivel de ordonator principal', 'Executie bugetara detaliata']).optional().default('Executie bugetara agregata la nivel de ordonator principal').describe('The report type to filter the data by.'),
  account_category: z.enum(['ch', 'vn']).default('ch').describe('Spending (ch) or Revenue (vn) used to aggregate the data. One of the two must be set.'),
  economic_codes: z.array(z.string()).optional().describe('The economic codes to filter the data by using Romanian COFOG3 codes.'),
  functional_codes: z.array(z.string()).optional().describe('The functional codes to filter the data by using Romanian COFOG3 codes.'),
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

type SeriesId = string;
type Operand = SeriesId | Calculation;
export type Operation = 'sum' | 'subtract' | 'multiply' | 'divide';
// Add mechanism to avoid circular dependencies. Also, add validation for operations: Ex: divide by zero, etc.
export interface Calculation {
  op: Operation;
  args: Array<Operand>;
}

const SeriesIdSchema = z.string();
const OperationSchema = z.enum(['sum', 'subtract', 'multiply', 'divide']);

const CalculationSchema: z.ZodType<Calculation> = z.lazy(() =>
  z.object({
    op: OperationSchema,
    args: z.array(OperandSchema),
  })
);

const OperandSchema: z.ZodType<Operand> = z.lazy(() =>
  z.union([SeriesIdSchema, CalculationSchema])
);

export const BaseSeriesConfigurationSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()).describe('The id of the series. It should be unique and immutable.'),
  enabled: z.boolean().default(true).describe('Whether the series is shown on the chart.'),
  label: z.string().default('').describe('The label of the series. It will be shown on the chart.'),
  unit: z.string().optional().describe('The unit of the series. It will be shown on the chart.'),
  config: SeriesConfigSchema,
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export const SeriesConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('line-items-aggregated-yearly'),
  filter: AnalyticsFilterSchema.describe('The filter to apply to the series.').default({}),
}).passthrough();

export const SeriesGroupConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('aggregated-series-calculation'),
  calculation: CalculationSchema.describe('Operation for generating a series from a set of series and applying an operation to them.').default({ op: 'sum', args: [] }),
}).passthrough()

// Add custom series with editable data values and unit
const initialYear = 2016;
const currentYear = new Date().getFullYear();
export const CustomSeriesConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('custom-series'),
  data: z.array(z.object({
    year: z.number(),
    value: z.number().default(1),
  })).default(Array.from({ length: currentYear - initialYear + 1 }, (_, index) => ({ year: index + initialYear, value: 1 }))),
}).passthrough();


export const SeriesSchema = z.discriminatedUnion('type', [SeriesConfigurationSchema, SeriesGroupConfigurationSchema, CustomSeriesConfigurationSchema]);

export type SeriesConfiguration = z.infer<typeof SeriesConfigurationSchema>;
export type SeriesGroupConfiguration = z.infer<typeof SeriesGroupConfigurationSchema>;
export type Series = z.infer<typeof SeriesSchema>;

// ============================================================================
// ANNOTATIONS SCHEMA
// ============================================================================

export const AnnotationSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  type: z.literal('annotation'),
  enabled: z.boolean().default(true),
  locked: z.boolean().default(true),
  title: z.string().describe('The title of the annotation.'),
  subtitle: z.string().optional().describe('The subtitle of the annotation.'),
  color: z.string().default('#000').describe('The color of the annotation.'),
  connector: z.boolean().default(true).describe('Whether the annotation is connected to the chart.'),
  subject: z.boolean().default(false).describe('Whether the annotation show a circle or icon around the point it starts from.'),
  label: z.boolean().default(true).describe('Whether the annotation show a label using title and subtitle.'),
  pX: z.number().default(0.5).describe('Percentage of the x-axis to place the annotation'),
  pY: z.number().default(0.5).describe('Percentage of the y-axis to place the annotation'),
  pXDelta: z.number().default(0.05).describe('Percentage of the x-axis to move the annotation label'),
  pYDelta: z.number().default(0.05).describe('Percentage of the y-axis to move the annotation label'),
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
  series: z.array(SeriesSchema).default([]),

  // Annotations
  annotations: z.array(AnnotationSchema).default([]).describe('The annotations to show on the chart. Used to manually add annotations to the chart.'),

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
export type YearlyTrendPoint = z.infer<typeof YearlyTrendPointSchema>;

export const AnalyticsDataPointSchema = z.object({
  seriesId: z.string(),
  yearlyTrend: z.array(YearlyTrendPointSchema),
});
export type AnalyticsDataPoint = z.infer<typeof AnalyticsDataPointSchema>;


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
  payload: z.array(SeriesSchema),
});

export type CopiedSeries = z.infer<typeof CopiedSeriesSchema>;
