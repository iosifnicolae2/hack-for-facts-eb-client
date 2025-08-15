import { z } from "zod";
import { AnalyticsFilterSchema, Normalization } from "@/schemas/charts";


export const entitySearchSchema = z.object({
    view: z.string().optional().default('overview'),
    year: z.coerce.number().min(2016).max(2024).optional(),
    expenseSearch: z.string().optional(),
    incomeSearch: z.string().optional(),
    analyticsChartType: z.enum(['bar', 'pie']).optional(),
    analyticsDataType: z.enum(['income', 'expense']).optional(),
    mapFilters: AnalyticsFilterSchema.optional(),
    normalization: Normalization.optional(),
});

export type EntitySearchSchema = z.infer<typeof entitySearchSchema>;