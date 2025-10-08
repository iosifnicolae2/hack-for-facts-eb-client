import { z } from 'zod';
import { SeriesConfigurationSchema } from './charts';

export const AlertOperatorEnum = z.enum(['gt', 'gte', 'lt', 'lte', 'eq']);
export type AlertOperator = z.infer<typeof AlertOperatorEnum>;

export const AlertConditionSchema = z.object({
  operator: AlertOperatorEnum.default('gt'),
  threshold: z.number().default(0),
  unit: z.string().default('RON'),
}).describe('Simple comparison condition evaluated when new data for the series is available.');

export type AlertCondition = z.infer<typeof AlertConditionSchema>;

export const AlertSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: z.string().default(''),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  notificationType: z.literal('alert_data_series').default('alert_data_series'),
  series: SeriesConfigurationSchema.default(() =>
    SeriesConfigurationSchema.parse({
      type: 'line-items-aggregated-yearly',
      label: 'Alert Series',
    })
  ),
  condition: AlertConditionSchema.default(() => AlertConditionSchema.parse({})),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  lastEvaluatedAt: z.string().optional(),
}).describe('Client-side representation of a data series alert included in monthly newsletters.');

export type Alert = z.infer<typeof AlertSchema>;

export const AlertViewEnum = z.enum(['overview', 'filters', 'preview', 'history']);
export type AlertView = z.infer<typeof AlertViewEnum>;

export const AlertEditorModeEnum = z.enum(['create', 'edit']);
export type AlertEditorMode = z.infer<typeof AlertEditorModeEnum>;

export const alertUrlStateSchema = z.object({
  alert: AlertSchema,
  view: AlertViewEnum.default('overview'),
  mode: AlertEditorModeEnum.default('edit'),
}).describe('Router search schema used when creating or editing alerts.');

export type AlertUrlState = z.infer<typeof alertUrlStateSchema>;

export function createEmptyAlert(partial?: Partial<Alert>): Alert {
  const base = AlertSchema.parse({});
  if (!partial) {
    return base;
  }

  const mergedSeries = partial.series
    ? SeriesConfigurationSchema.parse(partial.series)
    : base.series;

  return {
    ...base,
    ...partial,
    series: mergedSeries,
    condition: partial.condition
      ? AlertConditionSchema.parse(partial.condition)
      : base.condition,
  };
}
