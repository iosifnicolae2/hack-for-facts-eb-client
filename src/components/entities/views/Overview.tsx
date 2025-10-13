import { EntityDetailsData } from "@/lib/api/entities";
import { EntityFinancialSummary } from "../EntityFinancialSummary"
import { EntityFinancialTrends } from "../EntityFinancialTrends"
import { EntityLineItemsTabs } from "../EntityLineItemsTabs"
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BudgetTreemap } from '@/components/budget-explorer/BudgetTreemap'
import { BudgetCategoryList } from '@/components/budget-explorer/BudgetCategoryList'
import { useTreemapDrilldown } from '@/components/budget-explorer/useTreemapDrilldown'
import type { AggregatedNode } from '@/components/budget-explorer/budget-transform'

interface OverviewProps {
    cui: string;
    entity?: EntityDetailsData | null | undefined;
    isLoading: boolean;
    selectedYear: number;
    normalization: Normalization;
    years: number[];
    periodType?: ReportPeriodType;
    reportPeriod: ReportPeriodInput;
    reportType?: GqlReportType;
    mainCreditorCui?: string;
    search: {
        expenseSearch?: string;
        incomeSearch?: string;
        analyticsChartType?: 'bar' | 'pie';
        analyticsDataType?: 'expense' | 'income';
        period?: ReportPeriodType;
        quarter?: string;
        month?: string;
        [key: string]: any; // Allow additional URL state
    };
    onChartNormalizationChange: (mode: Normalization) => void;
    onYearChange: (year: number) => void;
    onPeriodItemSelect?: (label: string) => void;
    onSearchChange: (type: 'expense' | 'income', term: string) => void;
    onAnalyticsChange: (type: 'analyticsChartType' | 'analyticsDataType', value: 'bar' | 'pie' | 'income' | 'expense') => void;
    // Line items tab state
    onLineItemsTabChange?: (tab: 'functional' | 'funding' | 'expenseType') => void;
    onSelectedFundingKeyChange?: (key: string) => void;
    onSelectedExpenseTypeKeyChange?: (key: string) => void;
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
    reportType,
    search,
    mainCreditorCui,
    onChartNormalizationChange,
    onYearChange,
    onPeriodItemSelect,
    onSearchChange,
    onAnalyticsChange,
    onLineItemsTabChange,
    onSelectedFundingKeyChange,
    onSelectedExpenseTypeKeyChange,
}: OverviewProps) => {

    const { data: lineItems, isLoading: isLoadingLineItems } = useEntityExecutionLineItems({
        cui,
        normalization,
        reportPeriod,
        reportType,
        enabled: true,
        mainCreditorCui: mainCreditorCui
    });

    const debouncedPrefetch = useDebouncedCallback(
        (options: { reportPeriod: ReportPeriodInput, trendPeriod: ReportPeriodInput, reportType?: GqlReportType }) => {
            queryClient.prefetchQuery(entityDetailsQueryOptions(cui, normalization, options.reportPeriod, options.reportType, options.trendPeriod, mainCreditorCui));
        },
        100
    );

    const handleYearChange = (year: number) => {
        onYearChange(year);
    }
    const handlePrefetchYear = (year: number) => {
        const nextReport = getInitialFilterState(periodType ?? 'YEAR', year, search.month as TMonth ?? '01', search.quarter as TQuarter ?? 'Q1');
        const nextTrend = makeTrendPeriod(periodType ?? 'YEAR', year, years[years.length - 1], years[0]);
        debouncedPrefetch({ reportPeriod: nextReport, trendPeriod: nextTrend, reportType });
    }
    const handleSearchChange = (type: 'expense' | 'income', term: string) => {
        onSearchChange(type, term);
    }
    const handleAnalyticsChange = (type: 'analyticsChartType' | 'analyticsDataType', value: 'bar' | 'pie' | 'income' | 'expense') => {
        onAnalyticsChange(type, value);
    }

    const handlePrefetchPeriod = useCallback((label: string) => {
        if ((periodType ?? 'YEAR') === 'YEAR') {
            const y = Number(label)
            if (!Number.isNaN(y)) handlePrefetchYear(y)
        } else {
            const year = selectedYear
            const currentPeriod = periodType ?? 'YEAR'
            const nextReport = getInitialFilterState(currentPeriod, year, currentPeriod === 'MONTH' ? label as TMonth : search.month as TMonth ?? '01', currentPeriod === 'QUARTER' ? label as TQuarter : search.quarter as TQuarter ?? 'Q1')
            const nextTrend = makeTrendPeriod(currentPeriod, year, years[years.length - 1], years[0])
            debouncedPrefetch({ reportPeriod: nextReport, trendPeriod: nextTrend, reportType })
        }
    }, [periodType, selectedYear, search.month, search.quarter, years, years.length, years[years.length - 1], years[0], debouncedPrefetch, reportType, handlePrefetchYear])

    const [accountCategory, setAccountCategory] = useState<'ch' | 'vn'>('ch')

    const filteredItems = useMemo(() => {
        const nodes = lineItems?.nodes ?? []
        return nodes.filter((n: any) => n?.account_category === accountCategory)
    }, [lineItems, accountCategory])

    const aggregatedNodes = useMemo<AggregatedNode[]>(() => {
        return filteredItems.map((n: any) => ({
            fn_c: n?.functionalClassification?.functional_code ?? null,
            fn_n: n?.functionalClassification?.functional_name ?? null,
            ec_c: n?.economicClassification?.economic_code ?? null,
            ec_n: n?.economicClassification?.economic_name ?? null,
            amount: Number(n?.amount ?? 0),
            // count is used by some grouping; default to 1 if missing
            count: Number.isFinite((n as any)?.count) ? (n as any).count : 1,
        }))
    }, [filteredItems])

    const { primary, activePrimary, setPrimary, treemapData, breadcrumbs, onNodeClick, onBreadcrumbClick, reset } = useTreemapDrilldown({ nodes: aggregatedNodes, initialPrimary: 'fn', rootDepth: 2 })

    // Reset drilldown when switching between income/expenses and auto-switch to functional for income
    useEffect(() => {
        reset()
        if (accountCategory === 'vn') {
            setPrimary('fn')
        }
    }, [accountCategory])

    return (
        <div className="space-y-6 sm:space-y-8">
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
                onPrefetchPeriod={handlePrefetchPeriod}
            />

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <h3 className="text-base sm:text-lg font-semibold">Budget Distribution</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <ToggleGroup type="single" value={accountCategory} onValueChange={(v) => v && setAccountCategory(v as 'ch' | 'vn')} variant="outline" size="sm">
                                <ToggleGroupItem value="vn" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4">Income</ToggleGroupItem>
                                <ToggleGroupItem value="ch" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4">Expenses</ToggleGroupItem>
                            </ToggleGroup>
                            <ToggleGroup type="single" value={primary} onValueChange={(v) => v && setPrimary(v as 'fn' | 'ec')} variant="outline" size="sm">
                                <ToggleGroupItem value="fn" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4">Functional</ToggleGroupItem>
                                <ToggleGroupItem value="ec" disabled={accountCategory === 'vn'} className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4">Economic</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading || isLoadingLineItems ? (
                        <Skeleton className="w-full h-[600px]" />
                    ) : (
                        <BudgetTreemap
                            data={treemapData}
                            primary={activePrimary}
                            onNodeClick={onNodeClick}
                            onBreadcrumbClick={onBreadcrumbClick}
                            path={breadcrumbs}
                            normalization={normalization}
                        />
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <h3>Top Categories</h3>
                </CardHeader>
                <CardContent>
                    {isLoading || isLoadingLineItems ? (
                        <Skeleton className="w-full h-[260px]" />
                    ) : (
                        <BudgetCategoryList 
                            aggregated={aggregatedNodes} 
                            depth={2} 
                            normalization={normalization}
                            showEconomic={accountCategory !== 'vn'}
                            economicInfoText={
                                <span>
                                    Economic breakdown is not available for income. Switch to <span className="font-semibold">Expenses</span> to view economic categories.
                                </span>
                            }
                        />
                    )}
                </CardContent>
            </Card>

            <div className="space-y-6">
                <EntityLineItemsTabs
                    lineItems={lineItems?.nodes ?? []}
                    fundingSources={lineItems?.fundingSources ?? []}
                    currentYear={selectedYear}
                    month={search.month as TMonth}
                    quarter={search.quarter as TQuarter}
                    years={years}
                    onYearChange={handleYearChange}
                    onPrefetchYear={handlePrefetchYear}
                    initialExpenseSearchTerm={search.expenseSearch ?? ''}
                    initialIncomeSearchTerm={search.incomeSearch ?? ''}
                    onSearchChange={(type: 'expense' | 'income', term: string) => handleSearchChange(type, term)}
                    isLoading={isLoading || isLoadingLineItems}
                    normalization={normalization}
                    lineItemsTab={search.lineItemsTab as 'functional' | 'funding' | 'expenseType' | undefined}
                    onLineItemsTabChange={onLineItemsTabChange}
                    selectedFundingKey={search.selectedFundingKey as string | undefined}
                    selectedExpenseTypeKey={search.selectedExpenseTypeKey as string | undefined}
                    onSelectedFundingKeyChange={onSelectedFundingKeyChange}
                    onSelectedExpenseTypeKeyChange={onSelectedExpenseTypeKeyChange}
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
                    dataType={search.analyticsDataType ?? 'expense'}
                    onDataTypeChange={(type: 'income' | 'expense') => handleAnalyticsChange('analyticsDataType', type)}
                    isLoading={isLoading || isLoadingLineItems}
                    normalization={normalization}
                />
            </div>

            {entity ? (
                <div className="mt-6">
                    <EntityReportsSummary
                        cui={cui}
                        reportPeriod={reportPeriod}
                        reportType={reportType ?? entity.default_report_type}
                        mainCreditorCui={(search as any).main_creditor_cui}
                        limit={12}
                    />
                </div>
            ) : null}

        </div>
    )
}
