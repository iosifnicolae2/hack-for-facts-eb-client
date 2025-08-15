import { ChartSchema, defaultYearRange, ReportType } from '@/schemas/charts';
import type { Chart, Normalization } from '@/schemas/charts';
import type { ChartUrlState } from '@/components/charts/page-schema';
import { generateHash, getNormalizationUnit } from '@/lib/utils';
import { t } from '@lingui/core/macro';

interface BuildEntityIncomeExpenseChartOptions {
    title?: string;
    reportType?: ReportType;
    incomeColor?: string;
    expenseColor?: string;
}

/**
 * Build a ChartUrlState for a two-series chart (Income + Expense) for an entity.
 * Returns an object usable directly as TanStack Router `search` for /charts/$chartId.
 */
export function buildEntityIncomeExpenseChartState(
    cui: string,
    entityName: string,
    normalization: Normalization,
    options?: BuildEntityIncomeExpenseChartOptions
): ChartUrlState {
    const years = Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, i) => defaultYearRange.start + i);
    const chartId = generateHash(JSON.stringify({ cui, kind: 'income-expense' }));
    const title = options?.title ?? t`Financial Evolution - ${entityName}`;
    const reportType = options?.reportType ?? 'Executie bugetara agregata la nivel de ordonator principal';
    const incomeColor = options?.incomeColor ?? '#10B981';
    const expenseColor = options?.expenseColor ?? '#EF4444';

    const incomeSeriesId = `${cui}-income-series`;
    const expenseSeriesId = `${cui}-expense-series`;
    const balanceSeriesId = `${cui}-balance-series`;

    const chart: Chart = ChartSchema.parse({
        id: chartId,
        title,
        config: {
            chartType: 'line',
            showGridLines: true,
            showLegend: true,
            showTooltip: true,
            editAnnotations: false,
            showAnnotations: true,
            showDiffControl: true,
            yearRange: { start: years[0], end: years[years.length - 1] },
        },
        series: [
            {
                id: incomeSeriesId,
                type: 'line-items-aggregated-yearly',
                enabled: true,
                label: "Income",
                unit: '',
                filter: {
                    entity_cuis: [cui],
                    account_category: 'vn',
                    report_type: reportType,
                    normalization,
                },
                config: { visible: true, showDataLabels: false, color: incomeColor },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: expenseSeriesId,
                type: 'line-items-aggregated-yearly',
                enabled: true,
                label: "Expenses",
                unit: '',
                filter: {
                    entity_cuis: [cui],
                    account_category: 'ch',
                    report_type: reportType,
                    normalization,
                },
                config: { visible: true, showDataLabels: false, color: expenseColor },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: balanceSeriesId,
                type: 'aggregated-series-calculation',
                enabled: true,
                label: "Balance",
                unit: getNormalizationUnit(normalization),
                config: { visible: true, showDataLabels: false, color: '#ee8420' },
                calculation: {
                    op: 'subtract',
                    args: [incomeSeriesId, expenseSeriesId],
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ],
        annotations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    return { chart, view: 'overview' };
}

/**
 * Convenience helper to produce params and search for the charts route.
 */
export function buildEntityIncomeExpenseChartLink(
    cui: string,
    entityName: string,
    normalization: Normalization,
    options?: BuildEntityIncomeExpenseChartOptions
) {
    const search = buildEntityIncomeExpenseChartState(cui, entityName, normalization, options);
    const params = { chartId: search.chart.id } as const;
    return { to: '/charts/$chartId' as const, params, search };
}


