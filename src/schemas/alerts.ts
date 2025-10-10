import { z } from 'zod';
import { AnalyticsFilterSchema } from './charts';

export const AlertOperatorEnum = z.enum(['gt', 'gte', 'lt', 'lte', 'eq']);
export type AlertOperator = z.infer<typeof AlertOperatorEnum>;

export const AlertConditionSchema = z.object({
  operator: AlertOperatorEnum.default('gt'),
  threshold: z.number().default(0),
  unit: z.string().default('RON'),
}).describe('Simple comparison condition evaluated when new data for the series is available.');

export type AlertCondition = z.infer<typeof AlertConditionSchema>;

export const AlertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200, { message: 'Title must be 200 characters or fewer' }).optional(),
  description: z.string().max(1000, { message: 'Description must be 1000 characters or fewer' }).optional(),
  isActive: z.boolean().optional().default(true),
  notificationType: z.literal('alert_data_series').optional(),
  filter: AnalyticsFilterSchema.default({
    account_category: 'ch',
    report_type: 'Executie bugetara agregata la nivel de ordonator principal',
  }),
  conditions: z.array(AlertConditionSchema).default([]),
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

  return AlertSchema.parse({
    ...base,
    ...partial,
  });
}
