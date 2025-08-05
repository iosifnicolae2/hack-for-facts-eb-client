import { EntityDetailsData } from "@/lib/api/entities";
import { EntityFinancialSummary } from "../EntityFinancialSummary"
import { EntityFinancialTrends } from "../EntityFinancialTrends"
import { EntityLineItems } from "../EntityLineItems"
import { LineItemsAnalytics } from "../LineItemsAnalytics"

interface OverviewProps {
    entity: EntityDetailsData;
    selectedYear: number;
    trendMode: 'absolute' | 'percent';
    years: number[];
    search: {
        expenseSearch?: string;
        incomeSearch?: string;
        analyticsChartType?: 'bar' | 'pie';
        analyticsDataType?: 'expense' | 'income';
    };
    onChartTrendModeChange: (mode: 'absolute' | 'percent') => void;
        onYearChange: (year: number) => void;
    onSearchChange: (type: 'expense' | 'income', term: string) => void;
    onAnalyticsChange: (type: 'analyticsChartType' | 'analyticsDataType', value: 'bar' | 'pie' | 'income' | 'expense') => void;
}

export const Overview = ({
    entity,
    selectedYear,
    trendMode,
    years,
    search,
    onChartTrendModeChange,
    onYearChange,
    onSearchChange,
    onAnalyticsChange
}: OverviewProps) => {

    const handleYearChange = (year: number) => {
        onYearChange(year);
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
                totalIncome={entity.totalIncome}
                totalExpenses={entity.totalExpenses}
                budgetBalance={entity.budgetBalance}
                currentYear={selectedYear}
            />

            <EntityFinancialTrends
                incomeTrend={entity.incomeTrend}
                expenseTrend={entity.expenseTrend}
                balanceTrend={entity.balanceTrend}
                currentYear={selectedYear}
                mode={trendMode}
                onModeChange={onChartTrendModeChange}
                onYearChange={onYearChange}
            />



            <EntityLineItems
                lineItems={entity.executionLineItems}
                currentYear={selectedYear}
                totalIncome={entity.totalIncome}
                totalExpenses={entity.totalExpenses}
                years={years}
                onYearChange={handleYearChange}
                initialExpenseSearchTerm={search.expenseSearch ?? ''}
                initialIncomeSearchTerm={search.incomeSearch ?? ''}
                onSearchChange={(type: 'expense' | 'income', term: string) => handleSearchChange(type, term)}
            />

            <LineItemsAnalytics
                lineItems={entity.executionLineItems}
                analyticsYear={selectedYear}
                years={years}
                onYearChange={handleYearChange}
                chartType={search.analyticsChartType ?? 'bar'}
                onChartTypeChange={(type: 'bar' | 'pie') => handleAnalyticsChange('analyticsChartType', type)}
                dataType={search.analyticsDataType ?? 'expense'}
                onDataTypeChange={(type: 'income' | 'expense') => handleAnalyticsChange('analyticsDataType', type)}
            />
        </>
    )
}