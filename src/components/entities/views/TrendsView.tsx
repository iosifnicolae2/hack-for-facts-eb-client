import React, { useMemo } from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { Chart, SeriesConfiguration, Normalization } from '@/schemas/charts';
import { useParams } from '@tanstack/react-router';
import { getChapterMap, getTopFunctionalGroupCodes } from '@/lib/analytics-utils';
import { getSeriesColor } from '@/components/charts/components/chart-renderer/utils';
import { useFinancialData } from '@/hooks/useFinancialData';
import { FinancialDataCard } from '../FinancialDataCard';
import { ChartCard } from './ChartCard';
import { TrendsViewSkeleton } from './TrendsViewSkeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { t } from '@lingui/core/macro';
import { toReportTypeValue, type ReportPeriodInput, type GqlReportType, type TMonth, type TQuarter } from '@/schemas/reporting';
import { useEntityExecutionLineItems } from '@/lib/hooks/useEntityDetails';

interface BaseTrendsViewProps {
  entity?: EntityDetailsData | null | undefined;
  type: 'income' | 'expense';
  currentYear: number;
  onYearClick: (year: number) => void;
  onSelectPeriod?: (label: string) => void;
  selectedQuarter?: TQuarter;
  selectedMonth?: TMonth;
  years?: number[];
  initialIncomeSearch?: string;
  initialExpenseSearch?: string;
  onSearchChange: (type: 'income' | 'expense', search: string) => void;
  isLoading?: boolean;
  normalization: Normalization;
  onNormalizationChange: (mode: Normalization) => void;
  reportPeriod: ReportPeriodInput;
  trendPeriod: ReportPeriodInput;
  reportType?: GqlReportType;
}

const TOP_CATEGORIES_COUNT = 10;

export const TrendsView: React.FC<BaseTrendsViewProps> = ({ entity, type, currentYear, onYearClick, onSelectPeriod, initialIncomeSearch, initialExpenseSearch, onSearchChange, isLoading, normalization, onNormalizationChange, reportPeriod, trendPeriod, reportType, years = [] }) => {
  const { cui } = useParams({ from: '/entities/$cui' });
  const isMobile = useIsMobile();
  const chapterMap = useMemo(() => getChapterMap(), []);

  // Compute selected month/quarter from the report period anchor
  const anchor = (reportPeriod.selection as any)?.interval?.start as string | undefined;
  const selectedMonth: TMonth | undefined = reportPeriod.type === 'MONTH' && anchor ? (anchor.split('-')[1] as TMonth) : undefined;
  const selectedQuarter: TQuarter | undefined = reportPeriod.type === 'QUARTER' && anchor ? (anchor.split('-')[1] as TQuarter) : undefined;

  // Lazy load full line items, then filter locally
  const { data: fullLineItems } = useEntityExecutionLineItems({
    cui,
    normalization,
    // Use report period and report type from controls
    reportPeriod,
    reportType: reportType ?? entity?.default_report_type,
    enabled: !!cui,
  });

  const lineItems = useMemo(() => {
    const nodes = fullLineItems?.nodes ?? [];
    const accountCategory = type === 'income' ? 'vn' : 'ch';
    return nodes.filter(item => item.account_category === accountCategory);
  }, [fullLineItems, type]);

  const topFunctionalGroups = useMemo(() => {
    return getTopFunctionalGroupCodes(lineItems, TOP_CATEGORIES_COUNT);
  }, [lineItems]);

  const entityNameRaw = entity?.name ?? '';

  const trendChart = useMemo<Chart | null>(() => {
    if (!entity) return null;
    const accountCategory = type === 'income' ? 'vn' : 'ch';
    const entityName = entityNameRaw.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const title = type === 'income' ? t`Top ${TOP_CATEGORIES_COUNT} Income Categories for ${entityName}` : t`Top ${TOP_CATEGORIES_COUNT} Spending Categories for ${entityName}`;

    const series: SeriesConfiguration[] = topFunctionalGroups.map((prefix, index) => ({
      id: `${prefix}${cui}-${type}`,
      type: 'line-items-aggregated-yearly',
      label: chapterMap.get(prefix) || prefix,
      filter: {
        entity_cuis: [cui],
        functional_prefixes: [prefix],
        account_category: accountCategory,
        report_type: toReportTypeValue(reportType ?? entity.default_report_type),
        normalization,
        report_period: trendPeriod,
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
        showTooltip: isMobile ? false : true,
        showDiffControl: true,
        editAnnotations: false,
      },
      series,
    } as Chart;
  }, [topFunctionalGroups, cui, type, chapterMap, entity, entityNameRaw, normalization, trendPeriod, reportType]);

  const handleXAxisClick = (value: number | string) => {
    const raw = String(value);
    if (reportPeriod.type === 'YEAR') {
      const y = Number(raw.slice(0, 4));
      if (Number.isFinite(y)) onYearClick(y);
      return;
    }
    if (reportPeriod.type === 'MONTH') {
      const m = raw.match(/^\d{4}-(0[1-9]|1[0-2])$/) || raw.match(/^(0[1-9]|1[0-2])$/);
      if (m) onSelectPeriod?.(m[1]);
      return;
    }
    if (reportPeriod.type === 'QUARTER') {
      const q = raw.match(/^\d{4}-(Q[1-4])$/) || raw.match(/^(Q[1-4])$/);
      if (q) onSelectPeriod?.(q[1]);
    }
  };

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

  if (isLoading || !entity || !trendChart) {
    return <TrendsViewSkeleton />;
  }

  // Build xAxis marker value to reflect current selection
  const xAxisMarker = reportPeriod.type === 'YEAR' ? currentYear : anchor;

  if (type === 'income') {
    return (
      <div className="space-y-8">
        <ChartCard
          chart={trendChart}
          xAxisMarker={xAxisMarker as any}
          onXAxisItemClick={handleXAxisClick}
          onYearClick={onYearClick}
          currentYear={currentYear}
          normalization={normalization}
          onNormalizationChange={onNormalizationChange}
        />
        <FinancialDataCard
          title={t`Incomes`}
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
          month={selectedMonth}
          quarter={selectedQuarter}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ChartCard
        chart={trendChart}
        xAxisMarker={xAxisMarker as any}
        onXAxisItemClick={handleXAxisClick}
        onYearClick={onYearClick}
        currentYear={currentYear}
        normalization={normalization}
        onNormalizationChange={onNormalizationChange}
      />
      <FinancialDataCard
        title={t`Expenses`}
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
        month={selectedMonth}
        quarter={selectedQuarter}
      />
    </div>
  );
};
