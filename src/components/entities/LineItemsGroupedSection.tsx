import React, { useMemo, useEffect } from 'react';
import type { ExecutionLineItem, FundingSourceOption } from '@/lib/api/entities';
import { FinancialDataCard } from './FinancialDataCard';
import { useFinancialData } from '@/hooks/useFinancialData';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { TMonth, TQuarter } from '@/schemas/reporting';

type GroupMode = 'functional' | 'funding' | 'expenseType';

export interface LineItemsGroupedSectionProps {
  items: readonly ExecutionLineItem[];
  fundingSources?: readonly FundingSourceOption[];
  type: 'income' | 'expense';
  title: string;
  currentYear: number;
  years: number[];
  month?: TMonth;
  quarter?: TQuarter;
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro';
  onYearChange: (year: number) => void;
  onPrefetchYear?: (year: number) => void;
  isLoading?: boolean;
  // Shared search term state
  initialSearchTerm?: string;
  onInitialSearchChange?: (term: string) => void;
  // Tab control (read-only, determines which mode to display)
  activeTab?: GroupMode;
  selectedFundingKey?: string;
  onSelectedFundingKeyChange?: (key: string) => void;
  selectedExpenseTypeKey?: string;
  onSelectedExpenseTypeKeyChange?: (key: string) => void;
  // Icon and search key
  iconType?: 'income' | 'expense';
  searchFocusKey?: string;
  transferFilter?: 'all' | 'no-transfers' | 'transfers-only';
  onTransferFilterChange?: (filter: 'all' | 'no-transfers' | 'transfers-only') => void;
}

interface GroupBucketMeta {
  key: string; // stable key (e.g., fs:1 or et:functionare)
  title: string;
  total: number;
  percentage: number; // of account-category total
  count: number;
}

export const LineItemsGroupedSection: React.FC<LineItemsGroupedSectionProps> = ({
  items,
  fundingSources = [],
  type,
  title,
  currentYear,
  years,
  month,
  quarter,
  normalization,
  onYearChange,
  onPrefetchYear,
  isLoading = false,
  initialSearchTerm = '',
  onInitialSearchChange,
  activeTab = 'functional',
  selectedFundingKey = '',
  onSelectedFundingKeyChange,
  selectedExpenseTypeKey = '',
  onSelectedExpenseTypeKeyChange,
  iconType,
  searchFocusKey,
  transferFilter,
  onTransferFilterChange,
}) => {
  const accountCategory = type === 'income' ? 'vn' : 'ch';

  const scopedItems = useMemo(() => items.filter((n) => n.account_category === accountCategory), [items, accountCategory]);

  // Determine current mode and state based on active tab
  const mode = activeTab;
  const selectedKey = mode === 'funding' ? selectedFundingKey : mode === 'expenseType' ? selectedExpenseTypeKey : '';
  const onSelectedKeyChange = mode === 'funding' ? onSelectedFundingKeyChange : mode === 'expenseType' ? onSelectedExpenseTypeKeyChange : undefined;

  const totalForCategory = useMemo(() => scopedItems.reduce((s, n) => s + (n.amount || 0), 0), [scopedItems]);

  const sourceIdToLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of fundingSources) map.set(String(s.source_id), s.source_description);
    return map;
  }, [fundingSources]);

  const buckets = useMemo(() => {
    if (mode === 'functional') return [];

    const map = new Map<string, GroupBucketMeta & { items: ExecutionLineItem[] }>();

    const pushToBucket = (key: string, title: string, item: ExecutionLineItem) => {
      let b = map.get(key);
      if (!b) {
        b = { key, title, items: [], total: 0, percentage: 0, count: 0 };
        map.set(key, b);
      }
      b.items.push(item);
      b.total += item.amount || 0;
      b.count += 1;
    };

    for (const item of scopedItems) {
      if (mode === 'funding') {
        const raw = item.funding_source_id == null ? '' : String(item.funding_source_id);
        const key = `fs:${raw || 'unknown'}`;
        const title = raw ? (sourceIdToLabel.get(raw) ?? raw) : t`Unknown source`;
        pushToBucket(key, title, item);
      } else if (mode === 'expenseType') {
        const et = item.expense_type || 'unknown';
        const key = `et:${et}`;
        const title = et === 'dezvoltare' ? t`Development` : et === 'functionare' ? t`Operations` : t`Unknown type`;
        pushToBucket(key, title, item);
      }
    }

    const out: (GroupBucketMeta & { items: ExecutionLineItem[] })[] = Array.from(map.values());
    for (const b of out) {
      b.percentage = totalForCategory > 0 ? (b.total / totalForCategory) * 100 : 0;
    }
    out.sort((a, b) => b.total - a.total);
    return out;
  }, [scopedItems, mode, sourceIdToLabel, totalForCategory]);

  // Validate and auto-reset if selected key no longer exists
  useEffect(() => {
    if (mode !== 'functional' && selectedKey && selectedKey !== '' && buckets.length > 0) {
      const exists = buckets.some((b) => b.key === selectedKey);
      if (!exists) {
        onSelectedKeyChange?.('');
      }
    }
  }, [selectedKey, buckets, onSelectedKeyChange, mode]);

  const activeItems = useMemo(() => {
    if (mode === 'functional' || !selectedKey) return scopedItems;
    const bucket = buckets.find((b) => b.key === selectedKey);
    return bucket ? bucket.items : [];
  }, [selectedKey, scopedItems, buckets, mode]);

  // For functional mode, use the initial search term
  // Reuse financial grouping logic
  const { filteredIncomeGroups, filteredExpenseGroups, incomeBase, expenseBase, onIncomeSearchChange, onExpenseSearchChange, incomeSearchTerm, expenseSearchTerm, incomeSearchActive, expenseSearchActive, onIncomeSearchToggle, onExpenseSearchToggle } = useFinancialData(
    mode === 'functional' ? scopedItems : activeItems,
    type === 'income' ? (mode === 'functional' ? scopedItems : activeItems).reduce((s, n) => s + (n.amount || 0), 0) : null,
    type === 'expense' ? (mode === 'functional' ? scopedItems : activeItems).reduce((s, n) => s + (n.amount || 0), 0) : null,
    type === 'expense' ? initialSearchTerm : '',
    type === 'income' ? initialSearchTerm : ''
  );

  const groups = type === 'income' ? filteredIncomeGroups : filteredExpenseGroups;
  const baseTotal = type === 'income' ? incomeBase : expenseBase;
  const currentSearch = type === 'income' ? incomeSearchTerm : expenseSearchTerm;
  const currentSearchActive = type === 'income' ? incomeSearchActive : expenseSearchActive;

  const handleSearchChange = (term: string) => {
    if (type === 'income') onIncomeSearchChange(term); else onExpenseSearchChange(term);
    onInitialSearchChange?.(term);
  };

  const handleSearchToggle = (active: boolean) => {
    if (type === 'income') onIncomeSearchToggle(active); else onExpenseSearchToggle(active);
  };

  const badgeItems: GroupBucketMeta[] = useMemo(() => buckets.map(({ key, title, total, percentage, count }) => ({ key, title, total, percentage, count })), [buckets]);

  const titleSuffix = useMemo(() => {
    if (mode === 'functional') return '';
    if (!selectedKey) return t`All`;
    const it = badgeItems.find((b) => b.key === selectedKey);
    return it ? it.title : t`All`;
  }, [selectedKey, badgeItems, mode]);

  const subtitle = useMemo(() => {
    if (mode === 'functional') return '';
    const label = mode === 'funding' ? t`Funding` : t`Expense Type`;
    return `${label}: ${titleSuffix}`;
  }, [mode, titleSuffix]);

  // Empty state when no data
  if (!isLoading && scopedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">
          <Trans>No {type === 'income' ? 'income' : 'expense'} data available for this period.</Trans>
        </p>
      </div>
    );
  }

  // Empty state when no buckets (edge case for non-functional modes)
  if (!isLoading && mode !== 'functional' && buckets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">
          <Trans>No grouping available for the selected filter.</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Financial data card with current selection */}
      <FinancialDataCard
        title={title}
        subtitle={subtitle}
        iconType={iconType ?? (type === 'income' ? 'income' : 'expense')}
        currentYear={currentYear}
        years={years}
        onYearChange={onYearChange}
        onPrefetchYear={onPrefetchYear}
        month={month}
        quarter={quarter}
        searchTerm={currentSearch}
        onSearchChange={handleSearchChange}
        searchActive={currentSearchActive}
        onSearchToggle={handleSearchToggle}
        groups={groups}
        baseTotal={baseTotal}
        normalization={normalization}
        searchFocusKey={searchFocusKey}
        transferFilter={transferFilter}
        onTransferFilterChange={onTransferFilterChange}
      />
    </div>
  );
};

