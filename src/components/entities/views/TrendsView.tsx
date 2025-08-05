import React, { useMemo } from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { Chart, SeriesConfiguration } from '@/schemas/charts';
import { useParams } from '@tanstack/react-router';
import { getChapterMap, getTopFunctionalGroupCodes } from '@/lib/analytics-utils';
import { getSeriesColor } from '@/components/charts/components/chart-renderer/utils';
import { useFinancialData } from '@/hooks/useFinancialData';
import { FinancialDataCard } from '../FinancialDataCard';
import { ChartCard } from './ChartCard';

interface BaseTrendsViewProps {
  entity: EntityDetailsData;
  type: 'income' | 'expense';
  currentYear: number;
  onYearClick: (year: number) => void;
  initialIncomeSearch?: string;
  initialExpenseSearch?: string;
  onSearchChange: (type: 'income' | 'expense', search: string) => void;
}

const TOP_CATEGORIES_COUNT = 10;

export const TrendsView: React.FC<BaseTrendsViewProps> = ({ entity, type, currentYear, onYearClick, initialIncomeSearch, initialExpenseSearch, onSearchChange }) => {
  const { cui } = useParams({ from: '/entities/$cui' });
  const chapterMap = getChapterMap();

  const lineItems = useMemo(() => {
    const accountCategory = type === 'income' ? 'vn' : 'ch';
    return entity.executionLineItems?.nodes.filter(item => item.account_category === accountCategory) || [];
  }, [entity.executionLineItems, type]);

  const topFunctionalGroups = useMemo(() => {
    return getTopFunctionalGroupCodes(lineItems, TOP_CATEGORIES_COUNT);
  }, [lineItems]);

  const trendChart = useMemo<Chart>(() => {
    const accountCategory = type === 'income' ? 'vn' : 'ch';
    const entityName = entity.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const title = type === 'income' ? `Top ${TOP_CATEGORIES_COUNT} Income Categories for ${entityName}` : `Top ${TOP_CATEGORIES_COUNT} Spending Categories for ${entityName}`;

    const series: SeriesConfiguration[] = topFunctionalGroups.map((prefix, index) => ({
      id: `${prefix}${cui}-${type}`,
      type: 'line-items-aggregated-yearly',
      label: chapterMap.get(prefix) || prefix,
      filter: {
        entity_cuis: [cui],
        functional_prefixes: [prefix],
        account_category: accountCategory,
        report_type: 'Executie bugetara agregata la nivel de ordonator principal',
      },
      enabled: true,
      config: { color: getSeriesColor(index), visible: true, showDataLabels: false },
      unit: 'RON',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return {
      id: `trends-${entity.name}-${cui}-${type}`,
      title,
      config: {
        chartType: 'line',
        showLegend: false,
        showGridLines: true,
        showTooltip: true,
        showDiffControl: true,
        editAnnotations: false,
      },
      series,
    } as Chart;
  }, [topFunctionalGroups, cui, entity.name, type, chapterMap]);

  const {
    expenseSearchTerm,
    onExpenseSearchChange,
    expenseSearchActive,
    onExpenseSearchToggle,
    filteredExpenseGroups,
    incomeSearchTerm,
    onIncomeSearchChange,
    incomeSearchActive,
    onIncomeSearchToggle,
    filteredIncomeGroups,
    incomeBase,
    expenseBase,
  } = useFinancialData(lineItems, null, null, initialExpenseSearch, initialIncomeSearch);

  const handleSearchChange = (term: string) => {
    onSearchChange(type, term);
    if (type === 'income') {
      onIncomeSearchChange(term);
    } else {
      onExpenseSearchChange(term);
    }
  };

  const years = useMemo(() => {
    const trend = type === 'income' ? entity.incomeTrend : entity.expenseTrend;
    const allYears = new Set(trend?.map(item => item.year));
    return Array.from(allYears).sort((a, b) => b - a);
  }, [entity.incomeTrend, entity.expenseTrend, type]);

  if (type === 'income') {
    return (
      <div className="space-y-8">
        <ChartCard
          chart={trendChart}
          onYearClick={onYearClick}
          currentYear={currentYear}
        />
        <FinancialDataCard
          title={'Incomes'}
          iconType={'income'}
          currentYear={currentYear}
          searchTerm={incomeSearchTerm}
          searchFocusKey="mod+l"
          onSearchChange={handleSearchChange}
          searchActive={incomeSearchActive}
          onSearchToggle={onIncomeSearchToggle}
          groups={filteredIncomeGroups}
          baseTotal={incomeBase}
          years={years}
          onYearChange={onYearClick}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ChartCard
        chart={trendChart}
        onYearClick={onYearClick}
        currentYear={currentYear}
      />
      <FinancialDataCard
        title="Expenses"
        iconType="expense"
        currentYear={currentYear}
        searchTerm={expenseSearchTerm}
        searchFocusKey="mod+j"
        onSearchChange={handleSearchChange}
        searchActive={expenseSearchActive}
        onSearchToggle={onExpenseSearchToggle}
        onYearChange={onYearClick}
        groups={filteredExpenseGroups}
        baseTotal={expenseBase}
        years={years}
      />
    </div>
  );
};
