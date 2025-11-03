import { ChartSchema, defaultYearRange, ReportType } from '@/schemas/charts';
import type { Chart, Normalization, Calculation, Series } from '@/schemas/charts';
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

    const baseIncomeSeries = {
        label: "Income",
        type: 'line-items-aggregated-yearly' as const,
        unit: '',
        filter: {
            entity_cuis: [cui],
            account_category: 'vn' as const,
            report_type: reportType,
            normalization,
        },
        config: { showDataLabels: false, color: incomeColor },
    };

    const baseExpenseSeries = {
        label: "Expenses",
        type: 'line-items-aggregated-yearly' as const,
        unit: '',
        filter: {
            entity_cuis: [cui],
            account_category: 'ch' as const,
            report_type: reportType,
            normalization,
        },
        config: { showDataLabels: false, color: expenseColor },
    };

    const incomeSeriesId = generateSeriesId(baseIncomeSeries);
    const expenseSeriesId = generateSeriesId(baseExpenseSeries);

    const baseBalanceSeries = {
        label: "Balance",
        type: 'aggregated-series-calculation' as const,
        unit: getNormalizationUnit(normalization),
        config: { showDataLabels: false, color: '#ee8420' },
        calculation: {
            op: 'subtract' as const,
            args: [incomeSeriesId, expenseSeriesId],
        },
    };
    const balanceSeriesId = generateSeriesId(baseBalanceSeries);

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
                ...baseIncomeSeries,
                id: incomeSeriesId,
                enabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                ...baseExpenseSeries,
                id: expenseSeriesId,
                enabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                ...baseBalanceSeries,
                id: balanceSeriesId,
                enabled: true,
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

interface BuildTreemapChartStateOptions {
    title: string
    seriesConfigs: Series[]
    normalization?: Normalization
}

/**
 * Build a ChartUrlState from treemap series configurations.
 * Creates a multi-series chart based on treemap drill-down state.
 */
export function buildTreemapChartState(
    options: BuildTreemapChartStateOptions
): ChartUrlState {
    const { title, seriesConfigs } = options
    const years = Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, i) => defaultYearRange.start + i)

    // This process is done in two passes to handle dependencies between series.
    // Calculation series may refer to other series by their IDs. When we generate new
    // hash-based IDs, we must update these references.

    // Pass 1: Generate IDs for data series (non-calculation) and create a map from old to new IDs.
    const idMap = new Map<string, string>();
    const dataSeries = seriesConfigs.filter(s => s.type !== 'aggregated-series-calculation');
    const calculationSeries = seriesConfigs.filter(
        (s): s is Extract<Series, { type: 'aggregated-series-calculation' }> => s.type === 'aggregated-series-calculation'
    );

    const dataSeriesWithIds = dataSeries.map(seriesConfig => {
        const newId = generateSeriesId(seriesConfig);
        if (seriesConfig.id) {
            idMap.set(seriesConfig.id, newId);
        }
        return { ...seriesConfig, id: newId };
    });

    // Pass 2: Update calculation series with the new IDs and then generate their own IDs.
    const calculationSeriesWithIds = calculationSeries.map(seriesConfig => {
        let updatedCalculation = seriesConfig.calculation;
        if (updatedCalculation) {
            const calc = updatedCalculation as Calculation;
            updatedCalculation = {
                ...calc,
                args: calc.args.map((arg) => (typeof arg === 'string' && idMap.has(arg) ? idMap.get(arg)! : arg)),
            } as Calculation;
        }

        const newId = generateSeriesId({ ...seriesConfig, calculation: updatedCalculation });
        if (seriesConfig.id) {
            idMap.set(seriesConfig.id, newId);
        }
        return { ...seriesConfig, id: newId, calculation: updatedCalculation };
    });

    const seriesWithIds = [...dataSeriesWithIds, ...calculationSeriesWithIds];

    const chartId = generateHash(JSON.stringify({ title, series: seriesWithIds.map(s => s.id) }))

    const chart: Chart = ChartSchema.parse({
        id: chartId,
        title,
        config: {
            chartType: 'bar',
            showGridLines: true,
            showLegend: true,
            showTooltip: true,
            editAnnotations: false,
            showAnnotations: true,
            showDiffControl: false,
            yearRange: { start: years[0], end: years[years.length - 1] },
        },
        series: seriesWithIds,
        annotations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    })

    return { chart, view: 'overview' }
}

/**
 * Convenience helper to produce params and search for the charts route from treemap.
 */
export function buildTreemapChartLink(
    options: BuildTreemapChartStateOptions
) {
    const search = buildTreemapChartState(options)
    const params = { chartId: search.chart.id } as const
    return { to: '/charts/$chartId' as const, params, search }
}

/**
 * Generate a deterministic series ID from the series configuration.
 * Uses generateHash to create a hash based on label, color, filter, type, unit, etc.
 * Same configuration will always generate the same ID.
 */
function generateSeriesId(seriesConfig: {
    label: string;
    type: string;
    config: { color: string;[key: string]: unknown };
    filter?: Record<string, unknown>;
    calculation?: Calculation;
    unit?: string;
}): string {
    const hashInput = {
        label: seriesConfig.label,
        type: seriesConfig.type,
        color: seriesConfig.config.color,
        filter: seriesConfig.filter,
        calculation: seriesConfig.calculation,
        unit: seriesConfig.unit,
    };
    return generateHash(JSON.stringify(hashInput));
}