import { z } from 'zod';
import { ChartTypeEnum, DEFAULT_CHART } from './constants';
import { generateRandomColor } from '@/components/charts/components/chart-renderer/utils';

export const defaultYearRange = {
  start: 2016,
  end: 2025,
};

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
  showDiffControl: z.boolean().optional().describe('Show a control to select a range and calculate the difference between the start and end values.'),
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
}).default({
  visible: true,
  showDataLabels: false,
  color: '#0000ff',
});

export type SeriesConfig = z.infer<typeof SeriesConfigSchema>;

// ============================================================================
// ANALYTICS FILTER SCHEMA (reusable from existing system)
// ============================================================================

// TODO: change to the new report types
export const ReportTypeEnum = z.enum(['Executie bugetara agregata la nivel de ordonator principal', 'Executie bugetara agregata la nivel de ordonator secundar', 'Executie bugetara detaliata']);
export type ReportType = z.infer<typeof ReportTypeEnum>;

export const Normalization = z.enum(['total', 'total_euro', 'per_capita', 'per_capita_euro']);
export type Normalization = z.infer<typeof Normalization>;

// ----------------------------------------------------------------------------
// Reporting period (client-side Zod schema to mirror GraphQL ReportPeriodInput)
// ----------------------------------------------------------------------------
export const ReportPeriodTypeZ = z.enum(['YEAR', 'MONTH', 'QUARTER']);
export type ReportPeriodTypeZ = z.infer<typeof ReportPeriodTypeZ>;

const DateInputZ = z.string();

const PeriodSelectionZ = z.union([
  z.object({
    interval: z.object({ start: DateInputZ, end: DateInputZ }),
    dates: z.undefined().optional(),
  }),
  z.object({
    dates: z.array(DateInputZ),
    interval: z.undefined().optional(),
  }),
]);

export const ReportPeriodInputZ = z.object({
  type: ReportPeriodTypeZ,
  selection: PeriodSelectionZ,
});
export type ReportPeriodInputZ = z.infer<typeof ReportPeriodInputZ>;

export const AnalyticsFilterSchema = z.object({
  // Required
  years: z.array(z.number()).optional().describe('Years to filter the data by. If not set, the chart will show all years.'),
  account_category: z.enum(['ch', 'vn']).default('ch').describe('Spending (ch) or Revenue (vn).'),
  report_period: ReportPeriodInputZ.optional().describe('Preferred period selector (month/quarter/year via month anchors).'),

  // Dimensional filters
  report_ids: z.array(z.string()).optional(),
  report_type: ReportTypeEnum.optional(),
  reporting_years: z.array(z.number()).optional(),
  entity_cuis: z.array(z.string()).optional().describe('The public entities cui of cif.'),
  functional_codes: z.array(z.string()).optional().describe('The functional codes using Romanian COFOG3 codes.'),
  functional_prefixes: z.array(z.string()).optional().describe('The functional prefixes using Romanian COFOG3 codes.'),
  economic_codes: z.array(z.string()).optional().describe('The economic codes using Romanian COFOG3 codes.'),
  economic_prefixes: z.array(z.string()).optional().describe('The economic prefixes using Romanian COFOG3 codes.'),
  funding_source_ids: z.array(z.string()).optional(),
  budget_sector_ids: z.array(z.string()).optional(),
  expense_types: z.array(z.enum(['dezvoltare', 'functionare'])).optional(),
  program_codes: z.array(z.string()).optional(),

  // Geography
  county_codes: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  uat_ids: z.array(z.string()).optional(),
  entity_types: z.array(z.string()).optional(),
  is_uat: z.boolean().optional(),
  search: z.string().optional(),

  // Population
  min_population: z.number().optional(),
  max_population: z.number().optional(),

  // Aggregates & transforms
  normalization: z.enum(['total', 'per_capita', 'total_euro', 'per_capita_euro']).optional(),
  aggregate_min_amount: z.number().or(z.string()).optional(),
  aggregate_max_amount: z.number().or(z.string()).optional(),

  // Per-item thresholds
  item_min_amount: z.number().or(z.string()).optional(),
  item_max_amount: z.number().or(z.string()).optional(),
});

export type AnalyticsFilterType = z.infer<typeof AnalyticsFilterSchema>;

// ============================================================================
// SERIES CONFIGURATION
// ============================================================================

type SeriesId = string;
export type Operand = SeriesId | Calculation | number;
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
  z.union([SeriesIdSchema, CalculationSchema, z.number()])
);

export const BaseSeriesConfigurationSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()).describe('The id of the series. It should be unique and immutable.'),
  enabled: z.boolean().default(true).describe('Whether the series is shown on the chart.'),
  label: z.string().default('').describe('The label of the series. It will be shown on the chart.'),
  unit: z.string().optional().default('RON').describe('The unit of the series. It will be shown on the chart.'),
  config: SeriesConfigSchema,
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export const SeriesConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('line-items-aggregated-yearly'),
  unit: z.string().optional().default('').describe('The unit of the series. The unit should come from the api.'),
  filter: AnalyticsFilterSchema.describe('The filter to apply to the series.').default({
    years: [defaultYearRange.end],
    report_period: {
      type: 'YEAR',
      selection: { interval: { start: String(defaultYearRange.end), end: String(defaultYearRange.end) } },
    },
    account_category: 'ch',
    report_type: 'Executie bugetara agregata la nivel de ordonator principal',
  }),
}).loose();

export const SeriesGroupConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('aggregated-series-calculation'),
  calculation: CalculationSchema.describe('Operation for generating a series from a set of series and applying an operation to them.').default({ op: 'sum', args: [] }),
}).loose()

// Add custom series with editable data values and unit
export const CustomSeriesConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('custom-series'),
  data: z.array(z.object({
    year: z.number(),
    value: z.number().default(1),
  })).default(Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, index) => ({ year: index + defaultYearRange.start, value: 1 }))),
}).loose();


export const CustomSeriesValueConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('custom-series-value'),
  value: z.number().default(1),
  unit: z.string().optional().default('').describe('The unit of the series. It will be shown on the chart.'),
}).passthrough();

export const StaticSeriesConfigurationSchema = BaseSeriesConfigurationSchema.extend({
  type: z.literal('static-series'),
  seriesId: z.string().optional().describe('The id of the dataset to use for the static series. The data is fetched from the server.'),
}).passthrough();


export const SeriesSchema = z.discriminatedUnion('type', [
  SeriesConfigurationSchema,
  SeriesGroupConfigurationSchema,
  CustomSeriesConfigurationSchema,
  CustomSeriesValueConfigurationSchema,
  StaticSeriesConfigurationSchema,
]);

export type SeriesConfiguration = z.infer<typeof SeriesConfigurationSchema>;
export type SeriesGroupConfiguration = z.infer<typeof SeriesGroupConfigurationSchema>;
export type StaticSeriesConfiguration = z.infer<typeof StaticSeriesConfigurationSchema>;
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
  color: z.string().default('#0062ff').describe('The color of the annotation.'),
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

// New server data model types
export const AxisDataTypeEnum = z.enum(['STRING', 'INTEGER', 'FLOAT', 'DATE']);
export type AxisDataType = z.infer<typeof AxisDataTypeEnum>;

export const AxisSchema = z.object({
  name: z.string(),
  type: AxisDataTypeEnum,
  unit: z.string(),
});
export type Axis = z.infer<typeof AxisSchema>;

export const AnalyticsSeriesPointSchema = z.object({
  x: z.string(),
  y: z.number(),
});
export type AnalyticsSeriesPoint = z.infer<typeof AnalyticsSeriesPointSchema>;

export const AnalyticsSeriesSchema = z.object({
  seriesId: z.string(),
  xAxis: AxisSchema,
  yAxis: AxisSchema,
  data: z.array(AnalyticsSeriesPointSchema),
});
export type AnalyticsSeries = z.infer<typeof AnalyticsSeriesSchema>;



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

// Allow copying annotations between charts
export const CopiedAnnotationsSchema = z.object({
  type: z.literal('chart-annotations-copy'),
  payload: z.array(AnnotationSchema),
});

export type CopiedAnnotations = z.infer<typeof CopiedAnnotationsSchema>;
