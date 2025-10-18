import React, { useEffect, useMemo } from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { Chart, SeriesConfiguration, Normalization } from '@/schemas/charts';
import { useParams } from '@tanstack/react-router';
import { getChapterMap, getTopFunctionalGroupCodes } from '@/lib/analytics-utils';
import { getSeriesColor } from '@/components/charts/components/chart-renderer/utils';
import { ChartCard } from './ChartCard';
import { TrendsViewSkeleton } from './TrendsViewSkeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { t } from '@lingui/core/macro';
import { toReportTypeValue, type ReportPeriodInput, type GqlReportType, type TMonth, type TQuarter } from '@/schemas/reporting';
import { usePeriodLabel } from '@/hooks/use-period-label'
import { useEntityExecutionLineItems } from '@/lib/hooks/useEntityDetails';
import { EntityLineItemsTabs } from '../EntityLineItemsTabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BudgetTreemap } from '@/components/budget-explorer/BudgetTreemap'
import { BudgetCategoryList } from '@/components/budget-explorer/BudgetCategoryList'
import { useTreemapDrilldown } from '@/components/budget-explorer/useTreemapDrilldown'
import type { AggregatedNode } from '@/components/budget-explorer/budget-transform'
import { SpendingBreakdown } from '@/components/budget-explorer/SpendingBreakdown'
import { RevenueBreakdown } from '@/components/budget-explorer/RevenueBreakdown'
import { getNormalizationUnit } from '@/lib/utils';
import { Trans } from '@lingui/react/macro'

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
  lineItemsTab?: 'functional' | 'funding' | 'expenseType';
  onLineItemsTabChange?: (tab: 'functional' | 'funding' | 'expenseType') => void;
  selectedFundingKey?: string;
  selectedExpenseTypeKey?: string;
  onSelectedFundingKeyChange?: (key: string) => void;
  onSelectedExpenseTypeKeyChange?: (key: string) => void;
  treemapPrimary?: 'fn' | 'ec';
  onTreemapPrimaryChange?: (primary: 'fn' | 'ec') => void;
}

const TOP_CATEGORIES_COUNT = 10;

export const TrendsView: React.FC<BaseTrendsViewProps> = ({ entity, type, currentYear, onYearClick, onSelectPeriod, initialIncomeSearch, initialExpenseSearch, onSearchChange, isLoading, normalization, onNormalizationChange, reportPeriod, trendPeriod, reportType, years = [], lineItemsTab = 'functional', onLineItemsTabChange, selectedFundingKey = '', selectedExpenseTypeKey = '', onSelectedFundingKeyChange, onSelectedExpenseTypeKeyChange, treemapPrimary, onTreemapPrimaryChange }) => {
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

  const fundingSources = (fullLineItems as any)?.fundingSources ?? [];

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
      unit: getNormalizationUnit(normalization),
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

  // Build xAxis marker value to reflect current selection
  const xAxisMarker = reportPeriod.type === 'YEAR' ? currentYear : anchor;

  const periodLabel = usePeriodLabel(reportPeriod)

  const aggregatedNodes = useMemo<AggregatedNode[]>(() => {
    return (lineItems ?? []).map((n: any) => ({
      fn_c: n?.functionalClassification?.functional_code ?? null,
      fn_n: n?.functionalClassification?.functional_name ?? null,
      ec_c: n?.economicClassification?.economic_code ?? null,
      ec_n: n?.economicClassification?.economic_name ?? null,
      amount: Number(n?.amount ?? 0),
      count: Number.isFinite((n as any)?.count) ? (n as any).count : 1,
    }))
  }, [lineItems])

  // Exclude non-direct spending items for expense view
  const excludeEcCodes = type === 'expense' ? ['51', '80', '81'] : []

  const {
    primary,
    activePrimary,
    setPrimary,
    treemapData,
    breadcrumbs,
    excludedItemsSummary,
    onNodeClick,
    onBreadcrumbClick,
    reset,
  } = useTreemapDrilldown({
    nodes: aggregatedNodes,
    initialPrimary: treemapPrimary ?? 'fn',
    rootDepth: 2,
    excludeEcCodes,
    onPrimaryChange: onTreemapPrimaryChange,
  })

  // Reset drilldown when switching between income/expense tabs
  useEffect(() => {
    reset()
  }, [type, reset])

  // Force functional grouping for income view since economic data is not available
  useEffect(() => {
    if (type === 'income' && primary !== 'fn') {
      setPrimary('fn')
    }
  }, [type, primary, setPrimary])

  if (isLoading || !entity || !trendChart) {
    return <TrendsViewSkeleton />;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-semibold"><Trans>Budget Distribution</Trans> - {periodLabel}</h3>
            <ToggleGroup type="single" value={primary} onValueChange={(v) => v && setPrimary(v as 'fn' | 'ec')} variant="outline" size="sm">
              <ToggleGroupItem value="fn" className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4"><Trans>Functional</Trans></ToggleGroupItem>
              <ToggleGroupItem value="ec" disabled={type === 'income'} className="data-[state=on]:bg-foreground data-[state=on]:text-background px-4"><Trans>Economic</Trans></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || !fullLineItems ? (
            <Skeleton className="w-full h-[600px]" />
          ) : (
            <BudgetTreemap
              data={treemapData}
              primary={activePrimary}
              onNodeClick={onNodeClick}
              onBreadcrumbClick={onBreadcrumbClick}
              path={breadcrumbs}
              normalization={normalization}
              excludedItemsSummary={excludedItemsSummary}
            />
          )}
        </CardContent>
      </Card>

      {type === 'expense' && (
        <SpendingBreakdown
          nodes={aggregatedNodes}
          normalization={normalization}
          periodLabel={periodLabel}
          isLoading={isLoading || !fullLineItems}
        />
      )}
      {type === 'income' && (
        <RevenueBreakdown
          nodes={aggregatedNodes}
          normalization={normalization}
          periodLabel={periodLabel}
          isLoading={isLoading || !fullLineItems}
        />
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <h3 className='sr-only'>Top Categories</h3>
        </CardHeader>
        <CardContent>
          {isLoading || !fullLineItems ? (
            <Skeleton className="w-full h-[260px]" />
          ) : (
            <BudgetCategoryList
              aggregated={aggregatedNodes}
              depth={2}
              normalization={normalization}
              showEconomic={type !== 'income'}
              economicInfoText={
                <span>
                  Economic breakdown is not available for income. Switch to <span className="font-semibold">Expenses</span> to view economic categories.
                </span>
              }
            />
          )}
        </CardContent>
      </Card>

      <ChartCard
        chart={trendChart}
        xAxisMarker={xAxisMarker as any}
        onXAxisItemClick={handleXAxisClick}
        onYearClick={onYearClick}
        currentYear={currentYear}
        normalization={normalization}
        onNormalizationChange={onNormalizationChange}
      />
      <EntityLineItemsTabs
        lineItems={lineItems}
        fundingSources={fundingSources}
        currentYear={currentYear}
        month={selectedMonth}
        quarter={selectedQuarter}
        years={years}
        onYearChange={onYearClick}
        initialExpenseSearchTerm={initialExpenseSearch ?? ''}
        initialIncomeSearchTerm={initialIncomeSearch ?? ''}
        onSearchChange={onSearchChange}
        isLoading={isLoading || !fullLineItems}
        normalization={normalization}
        lineItemsTab={lineItemsTab}
        onLineItemsTabChange={onLineItemsTabChange}
        selectedFundingKey={selectedFundingKey}
        selectedExpenseTypeKey={selectedExpenseTypeKey}
        onSelectedFundingKeyChange={onSelectedFundingKeyChange}
        onSelectedExpenseTypeKeyChange={onSelectedExpenseTypeKeyChange}
        types={[type]}
      />
    </div>
  );
};
