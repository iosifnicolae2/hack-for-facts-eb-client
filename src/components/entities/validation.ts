import { z } from "zod";
import { AnalyticsFilterSchema, defaultYearRange, Normalization } from "@/schemas/charts";
import { GqlReportTypeEnum } from "@/schemas/reporting";


export const entitySearchSchema = z.object({
    view: z
        .string()
        .optional()
        .default('overview')
        .describe('Which view to render for the entity page. Examples: overview, map, income-trends, expense-trends.'),
    period: z
        .enum(['YEAR', 'MONTH', 'QUARTER'])
        .optional()
        .describe('Reporting aggregation period. YEAR, QUARTER, or MONTH.'),
    year: z
        .coerce
        .number()
        .min(defaultYearRange.start)
        .max(defaultYearRange.end)
        .optional()
        .describe(`Year filter within [${defaultYearRange.start}, ${defaultYearRange.end}]. Example: ?year=${defaultYearRange.end}`),
    month: z
        .string()
        .regex(/^\d{2}$/)
        .optional()
        .describe('Month as two digits (01-12). Requires period=MONTH. Example: ?month=03'),
    quarter: z
        .string()
        .regex(/^Q\d{1}$/)
        .optional()
        .describe('Quarter as Q1..Q4. Requires period=QUARTER. Example: ?quarter=Q4'),
    report_type: GqlReportTypeEnum
        .optional()
        .describe('Report type. Mirrors GraphQL GqlReportType. Example: Executie bugetara agregata la nivel de ordonator principal'),
    main_creditor_cui: z
        .string()
        .optional()
        .describe('CUI of the main creditor to filter by.'),
    expenseSearch: z
        .string()
        .optional()
        .describe('Full-text search term for expenses table.'),
    incomeSearch: z
        .string()
        .optional()
        .describe('Full-text search term for income table.'),
    analyticsChartType: z
        .enum(['bar', 'pie'])
        .optional()
        .describe('Quick analytics chart type.'),
    analyticsDataType: z
        .enum(['income', 'expense'])
        .optional()
        .describe('Quick analytics data type.'),
    mapFilters: AnalyticsFilterSchema
        .optional()
        .describe('Advanced heatmap filters for the Map view (see AnalyticsFilterSchema).'),
    normalization: Normalization
        .optional()
        .describe('Value normalization. total, total_euro, per_capita, per_capita_euro.'),
    // Line items filter state (shared across all views)
    lineItemsTab: z
        .enum(['functional', 'funding', 'expenseType'])
        .optional()
        .describe('Active tab for line items: functional, funding, expenseType.'),
    selectedFundingKey: z
        .string()
        .optional()
        .describe('Selected funding key for line items.'),
    selectedExpenseTypeKey: z
        .string()
        .optional()
        .describe('Selected expense type key for line items.'),
    // Treemap state (Overview and TrendsView)
    treemapPrimary: z
        .enum(['fn', 'ec'])
        .optional()
        .describe('Treemap primary classification: fn (functional) or ec (economic).'),
    accountCategory: z
        .enum(['ch', 'vn'])
        .optional()
        .describe("Account category: 'ch' (cheltuieli/spending) or 'vn' (venituri/revenue)."),
    // Notification modal state
    notificationModal: z
        .enum(['open'])
        .optional()
        .describe('UI state for the notification modal.'),
    transferFilter: z
        .enum(['all', 'no-transfers', 'transfers-only'])
        .optional()
        .default('no-transfers')
        .describe('Filter for transfers between institutions.'),
});

export type EntitySearchSchema = z.infer<typeof entitySearchSchema>;
