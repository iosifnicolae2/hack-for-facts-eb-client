import { z } from "zod";
import { AnalyticsFilterSchema, defaultYearRange, Normalization } from "@/schemas/charts";
import { GqlReportTypeEnum } from "@/schemas/reporting";


export const entitySearchSchema = z.object({
    view: z.string().optional().default('overview'),
    period: z.enum(['YEAR', 'MONTH', 'QUARTER']).optional(),
    year: z.coerce.number().min(defaultYearRange.start).max(defaultYearRange.end).optional(),
    month: z.string().regex(/^\d{2}$/).optional(),
    quarter: z.string().regex(/^Q\d{1}$/).optional(),
    report_type: GqlReportTypeEnum.optional(),
    main_creditor_cui: z.string().optional(),
    expenseSearch: z.string().optional(),
    incomeSearch: z.string().optional(),
    analyticsChartType: z.enum(['bar', 'pie']).optional(),
    analyticsDataType: z.enum(['income', 'expense']).optional(),
    mapFilters: AnalyticsFilterSchema.optional(),
    normalization: Normalization.optional(),
    // Line items filter state (shared across all views)
    lineItemsTab: z.enum(['functional', 'funding', 'expenseType']).optional(),
    selectedFundingKey: z.string().optional(),
    selectedExpenseTypeKey: z.string().optional(),
});

export type EntitySearchSchema = z.infer<typeof entitySearchSchema>;
