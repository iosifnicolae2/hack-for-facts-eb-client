import { EntityDetailsData } from "@/lib/api/entities";
import { EntityFinancialSummary } from "../EntityFinancialSummary"
import { EntityFinancialTrends } from "../EntityFinancialTrends"
import { EntityLineItems } from "../EntityLineItems"
import { LineItemsAnalytics } from "../LineItemsAnalytics"
import { Normalization } from "@/schemas/charts";
import type { GqlReportType, ReportPeriodInput, ReportPeriodType, TMonth, TQuarter } from "@/schemas/reporting";
import { getYearLabel } from "../utils";
import { useEntityExecutionLineItems } from "@/lib/hooks/useEntityDetails";
import { EntityReportsSummary } from "../EntityReportsSummary";
import { queryClient } from '@/lib/queryClient';
import { entityDetailsQueryOptions } from '@/lib/hooks/useEntityDetails';
import { getInitialFilterState, makeTrendPeriod } from '@/schemas/reporting';
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";

interface OverviewProps {
    cui: string;
    entity?: EntityDetailsData | null | undefined;
    isLoading: boolean;
    selectedYear: number;
    normalization: Normalization;
    years: number[];
    periodType?: ReportPeriodType;
    reportPeriod: ReportPeriodInput;
    trendPeriod: ReportPeriodInput;
    reportType?: GqlReportType;
    search: {
        expenseSearch?: string;
        incomeSearch?: string;
        analyticsChartType?: 'bar' | 'pie';
        analyticsDataType?: 'expense' | 'income';
        period?: ReportPeriodType;
        quarter?: string;
        month?: string;
    };
    onChartNormalizationChange: (mode: Normalization) => void;
    onYearChange: (year: number) => void;
    onPeriodItemSelect?: (label: string) => void;
    onSearchChange: (type: 'expense' | 'income', term: string) => void;
    onAnalyticsChange: (type: 'analyticsChartType' | 'analyticsDataType', value: 'bar' | 'pie' | 'income' | 'expense') => void;
}

export const Overview = ({
    cui,
    entity,
    isLoading,
    selectedYear,
    normalization,
    years,
    periodType,
    reportPeriod,
    trendPeriod,
    reportType,
    search,
    onChartNormalizationChange,
    onYearChange,
    onPeriodItemSelect,
    onSearchChange,
    onAnalyticsChange
}: OverviewProps) => {

    const { data: lineItems, isLoading: isLoadingLineItems } = useEntityExecutionLineItems({
        cui,
        normalization,
        reportPeriod,
        reportType,
        enabled: true,
    });

    const debouncedPrefetch = useDebouncedCallback(
        (options: { reportPeriod: ReportPeriodInput, trendPeriod: ReportPeriodInput, reportType?: GqlReportType }) => {
            queryClient.prefetchQuery(entityDetailsQueryOptions(cui, normalization, options.reportPeriod, options.reportType, options.trendPeriod));
        },
        100
    );

    const handleYearChange = (year: number) => {
        onYearChange(year);
    }
    const handlePrefetchYear = (year: number) => {
        const nextReport = getInitialFilterState(periodType ?? 'YEAR', year, search.month as TMonth ?? '12', search.quarter as TQuarter ?? 'Q4');
        const nextTrend = makeTrendPeriod(periodType ?? 'YEAR', year, years[years.length - 1], years[0]);
        debouncedPrefetch({ reportPeriod: nextReport, trendPeriod: nextTrend, reportType });
    }
    const handleSearchChange = (type: 'expense' | 'income', term: string) => {
        onSearchChange(type, term);
    }
    const handleAnalyticsChange = (type: 'analyticsChartType' | 'analyticsDataType', value: 'bar' | 'pie' | 'income' | 'expense') => {
        onAnalyticsChange(type, value);
    }

    return (
        <>
            <EntityFinancialSummary
                totalIncome={entity?.totalIncome}
                totalExpenses={entity?.totalExpenses}
                budgetBalance={entity?.budgetBalance}
                periodLabel={getYearLabel(selectedYear, search.month as TMonth, search.quarter as TQuarter)}
                isLoading={isLoading}
                currency={normalization === 'total_euro' || normalization === 'per_capita_euro' ? 'EUR' : 'RON'}
            />

            <EntityFinancialTrends
                incomeTrend={entity?.incomeTrend ?? null}
                expenseTrend={entity?.expenseTrend ?? null}
                balanceTrend={entity?.balanceTrend ?? null}
                currentYear={selectedYear}
                entityName={entity?.name ?? ''}
                normalization={normalization}
                onNormalizationChange={onChartNormalizationChange}
                onYearChange={onYearChange}
                periodType={periodType ?? 'YEAR'}
                onSelectPeriod={onPeriodItemSelect}
                selectedQuarter={search?.quarter as string | undefined}
                selectedMonth={search?.month as string | undefined}
                isLoading={isLoading}
                onPrefetchPeriod={(label: string) => {
                    if ((periodType ?? 'YEAR') === 'YEAR') {
                        const y = Number(label)
                        if (!Number.isNaN(y)) handlePrefetchYear(y)
                    } else {
                        const year = selectedYear
                        const currentPeriod = periodType ?? 'YEAR'
                        const nextReport = getInitialFilterState(currentPeriod, year, currentPeriod === 'MONTH' ? label as TMonth : search.month as TMonth ?? '12', currentPeriod === 'QUARTER' ? label as TQuarter : search.quarter as TQuarter ?? 'Q4')
                        const nextTrend = makeTrendPeriod(currentPeriod, year, years[years.length - 1], years[0])
                        debouncedPrefetch({ reportPeriod: nextReport, trendPeriod: nextTrend, reportType })
                    }
                }}
            />

            <EntityLineItems
                lineItems={lineItems}
                currentYear={selectedYear}
                month={search.month as TMonth}
                quarter={search.quarter as TQuarter}
                totalIncome={entity?.totalIncome}
                totalExpenses={entity?.totalExpenses}
                years={years}
                onYearChange={handleYearChange}
                onPrefetchYear={handlePrefetchYear}
                initialExpenseSearchTerm={search.expenseSearch ?? ''}
                initialIncomeSearchTerm={search.incomeSearch ?? ''}
                onSearchChange={(type: 'expense' | 'income', term: string) => handleSearchChange(type, term)}
                isLoading={isLoading || isLoadingLineItems}
                normalization={normalization}
            />

            <LineItemsAnalytics
                lineItems={lineItems}
                analyticsYear={selectedYear}
                month={search.month as TMonth}
                quarter={search.quarter as TQuarter}
                years={years}
                onYearChange={handleYearChange}
                onPrefetchYear={handlePrefetchYear}
                chartType={search.analyticsChartType ?? 'bar'}
                onChartTypeChange={(type: 'bar' | 'pie') => handleAnalyticsChange('analyticsChartType', type)}
                onPrefetchChartType={() => {}}
                dataType={search.analyticsDataType ?? 'expense'}
                onDataTypeChange={(type: 'income' | 'expense') => handleAnalyticsChange('analyticsDataType', type)}
                onPrefetchDataType={() => {}}
                isLoading={isLoading || isLoadingLineItems}
                normalization={normalization}
            />

            {entity ? (
                <div className="mt-6">
                    <EntityReportsSummary
                        cui={cui}
                        trendPeriod={trendPeriod}
                        reportType={reportType ?? entity.default_report_type}
                        limit={12}
                    />
                </div>
            ) : null}

        </>
    )
}