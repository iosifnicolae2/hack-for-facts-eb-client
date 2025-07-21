import { createFileRoute, useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useEntityDetails } from '@/lib/hooks/useEntityDetails';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { EntityHeader } from '@/components/entities/EntityHeader';
import { EntityFinancialSummary } from '@/components/entities/EntityFinancialSummary';
import { EntityFinancialTrends } from '@/components/entities/EntityFinancialTrends';
import { EntityLineItems } from '@/components/entities/EntityLineItems';
import { EntityReports } from '@/components/entities/EntityReports';
import { LineItemsAnalytics } from '@/components/entities/LineItemsAnalytics';
import { useState, useMemo, useEffect } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export const Route = createFileRoute('/entities/$cui')({
    validateSearch: z.object({
        year: z.coerce.number().min(2016).max(2024).optional(),
        trend: z.enum(['absolute', 'percent']).optional(),
        expenseSearch: z.string().optional(),
        incomeSearch: z.string().optional(),
        analyticsChartType: z.enum(['bar', 'pie']).optional(),
        analyticsDataType: z.enum(['income', 'expense']).optional(),
    }),
    component: EntityDetailsPage,
});

function EntityDetailsPage() {
    const { cui } = useParams({ from: Route.id });
    const search = useSearch({ from: Route.id });
    const navigate = useNavigate({ from: Route.id });

    // Year selection setup
    const CURRENT_YEAR = 2024; // hardcoded as requested
    const START_YEAR = 2016;

    const [selectedYear, setSelectedYear] = useState<number>(search.year ?? CURRENT_YEAR);

    const [trendMode, setTrendMode] = useState<'absolute' | 'percent'>((search.trend as 'absolute' | 'percent') ?? 'absolute');

    // Pre-compute year options (descending: newest → oldest)
    const years = useMemo(() =>
        Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, idx) => CURRENT_YEAR - idx),
        []
    );

    // Fetch entity details for the chosen year and trend range
    const { data: entity, isLoading, isError, error } = useEntityDetails(
        cui,
        selectedYear, // year for summary + line items
        START_YEAR,   // trend from 2016 …
        CURRENT_YEAR  // … up to 2024 (full range always shown)
    );

    const handleSearchChange = (type: 'expense' | 'income', value: string) => {
        const key = type + 'Search';
        navigate({
            search: (prev) => ({
                ...prev,
                [key]: value || undefined,
            }),
            replace: true,
        });
    };

    const handleAnalyticsChange = (
        key: 'analyticsChartType' | 'analyticsDataType',
        value: 'bar' | 'pie' | 'income' | 'expense'
    ) => {
        navigate({
            search: (prev) => ({
                ...prev,
                [key]: value,
            }),
            replace: true,
        });
    };

    // Sync state with URL search params when changes occur
    useEffect(() => {
        navigate({
            search: prev => ({
                ...prev,
                year: selectedYear,
                trend: trendMode,
            }),
            replace: true,
        });
    }, [selectedYear, trendMode, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                <p className="text-lg text-slate-700 dark:text-slate-300">Loading entity details...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
                <Alert variant="destructive" className="max-w-lg w-full bg-red-50 dark:bg-red-900 border-red-500 dark:border-red-700">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <AlertTitle className="text-red-700 dark:text-red-300">Error Fetching Entity Details</AlertTitle>
                    <AlertDescription className="text-red-600 dark:text-red-400">
                        There was a problem fetching the details for CUI: <strong>{cui}</strong>.
                        {error && <p className="mt-2 text-sm">Details: {error.message}</p>}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!entity) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
                <Alert className="max-w-lg w-full bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-700">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-300">No Data Found</AlertTitle>
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                        No entity details found for CUI: <strong>{cui}</strong>. It's possible this entity does not exist or has no associated data.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-8">
            <div className="container mx-auto max-w-7xl space-y-8">
                {/** Build year selector injected into header **/}
                <EntityHeader
                    entity={entity}
                    yearSelector={
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">Reporting Year</span>
                            <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val, 10))}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    }
                />

                <EntityFinancialSummary
                    totalIncome={entity.totalIncome}
                    totalExpenses={entity.totalExpenses}
                    budgetBalance={entity.budgetBalance}
                    currentYear={selectedYear}
                />

                <EntityFinancialTrends
                    incomeTrend={entity.incomeTrend}
                    expenseTrend={entity.expenseTrend}
                    balanceTrend={entity.balanceTrend}
                    mode={trendMode}
                    onModeChange={setTrendMode}
                />

                <EntityLineItems
                    lineItems={entity.executionLineItems}
                    currentYear={selectedYear}
                    totalIncome={entity.totalIncome}
                    totalExpenses={entity.totalExpenses}
                    years={years}
                    onYearChange={setSelectedYear}
                    initialExpenseSearchTerm={search.expenseSearch ?? ''}
                    initialIncomeSearchTerm={search.incomeSearch ?? ''}
                    onSearchChange={(type: 'expense' | 'income', term: string) => handleSearchChange(type, term)}
                />

                <LineItemsAnalytics
                    lineItems={entity.executionLineItems}
                    analyticsYear={selectedYear}
                    years={years}
                    onYearChange={setSelectedYear}
                    chartType={search.analyticsChartType ?? 'bar'}
                    onChartTypeChange={(type: 'bar' | 'pie') => handleAnalyticsChange('analyticsChartType', type)}
                    dataType={search.analyticsDataType ?? 'expense'}
                    onDataTypeChange={(type: 'income' | 'expense') => handleAnalyticsChange('analyticsDataType', type)}
                />

                <EntityReports reports={entity.reports} />
            </div>
        </div>
    );
}