import { z } from "zod";

export const entitySearchSchema = z.object({
    year: z.coerce.number().min(2016).max(2024).optional(),
    trend: z.enum(['absolute', 'percent']).optional(),
    expenseSearch: z.string().optional(),
    incomeSearch: z.string().optional(),
    analyticsChartType: z.enum(['bar', 'pie']).optional(),
    analyticsDataType: z.enum(['income', 'expense']).optional(),
});