import React, { useMemo } from 'react';
import type { ExecutionLineItem, FundingSourceOption } from '@/lib/api/entities';
import { t } from '@lingui/core/macro';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

type AccountCategory = 'vn' | 'ch';

interface BucketSummary {
  key: string;
  title: string;
  incomeTotal: number;
  expenseTotal: number;
  incomePercentage: number;
  expensePercentage: number;
}

interface BucketComputationResult {
  bucketSummaries: BucketSummary[];
  totalIncome: number;
  totalExpense: number;
}

interface LineItemsBadgeFiltersProps {
  items: readonly ExecutionLineItem[];
  fundingSources?: readonly FundingSourceOption[];
  mode: 'funding' | 'expenseType';
  selectedKey: string;
  onSelectedKeyChange: (key: string) => void;
  normalization?: 'total' | 'total_euro' | 'per_capita' | 'per_capita_euro';
  isLoading?: boolean;
  // Display mode: 'combined' shows income/expense, 'single' shows only the filtered type
  displayMode?: 'combined' | 'single';
  // For single mode, specify which type to show
  accountCategory?: 'vn' | 'ch';
}

export const LineItemsBadgeFilters: React.FC<LineItemsBadgeFiltersProps> = ({
  items,
  fundingSources = [],
  mode,
  selectedKey,
  onSelectedKeyChange,
  normalization,
  isLoading = false,
  displayMode = 'combined',
  accountCategory,
}) => {
  const currencyCode = normalization === 'total_euro' || normalization === 'per_capita_euro' ? 'EUR' : 'RON';

  // Aggregate line items into display buckets for the selected mode.
  const { bucketSummaries, totalIncome, totalExpense } = useMemo<BucketComputationResult>(() => {
    type BucketAccumulator = Omit<BucketSummary, 'incomePercentage' | 'expensePercentage'>;

    const bucketMap = new Map<string, BucketAccumulator>();
    const totals = { income: 0, expense: 0 };
    const fundingSourceLabels = new Map<string, string>();

    if (mode === 'funding') {
      for (const source of fundingSources) {
        fundingSourceLabels.set(String(source.source_id), source.source_description);
      }
    }

    const getBucketDetails = (item: ExecutionLineItem) => {
      if (mode === 'funding') {
        const rawSourceId = item.funding_source_id == null ? '' : String(item.funding_source_id);
        const key = `fs:${rawSourceId || 'unknown'}`;
        const title = rawSourceId ? (fundingSourceLabels.get(rawSourceId) ?? rawSourceId) : t`Unknown source`;
        return { key, title };
      }

      const expenseType = item.expense_type ?? 'unknown';
      const key = `et:${expenseType}`;
      let title: string;

      switch (expenseType) {
        case 'dezvoltare':
          title = t`Development`;
          break;
        case 'functionare':
          title = t`Operations`;
          break;
        default:
          title = t`Unknown type`;
          break;
      }

      return { key, title };
    };

    const ensureBucket = (key: string, title: string) => {
      if (!bucketMap.has(key)) {
        bucketMap.set(key, {
          key,
          title,
          incomeTotal: 0,
          expenseTotal: 0,
        });
      }
      return bucketMap.get(key)!;
    };

    for (const item of items) {
      if (item.account_category !== 'vn' && item.account_category !== 'ch') {
        continue;
      }
      const amount = item.amount ?? 0;
      const { key, title } = getBucketDetails(item);
      const bucket = ensureBucket(key, title);

      if (item.account_category === 'vn') {
        bucket.incomeTotal += amount;
        totals.income += amount;
      } else {
        bucket.expenseTotal += amount;
        totals.expense += amount;
      }
    }

    const computedBuckets = Array.from(bucketMap.values()).map((bucket) => ({
      ...bucket,
      incomePercentage: totals.income > 0 ? (bucket.incomeTotal / totals.income) * 100 : 0,
      expensePercentage: totals.expense > 0 ? (bucket.expenseTotal / totals.expense) * 100 : 0,
    }));

    computedBuckets.sort((a, b) => (b.incomeTotal + b.expenseTotal) - (a.incomeTotal + a.expenseTotal));

    return {
      bucketSummaries: computedBuckets,
      totalIncome: totals.income,
      totalExpense: totals.expense,
    };
  }, [items, fundingSources, mode]);

  const isCombinedView = displayMode === 'combined';
  const singleViewCategory: AccountCategory = accountCategory === 'vn' ? 'vn' : 'ch';

  if (isLoading) {
    return (
      <div className="flex gap-2 flex-wrap mb-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-7 w-44" />
      </div>
    );
  }

  return (
    <ScrollArea className="w-full mb-4">
      <div className="flex gap-2 pb-2">
        <Badge
          key="all"
          variant={selectedKey === '' ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer py-1.5 px-3 text-xs',
            selectedKey === '' && 'shadow-sm'
          )}
          onClick={() => onSelectedKeyChange('')}
        >
          <span className="font-semibold">{t`All`}</span>
          <span className="mx-1.5">·</span>
          <p className="font-normal">
            {isCombinedView
              ? (
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  {formatCurrency(totalIncome, 'compact', currencyCode)} /
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  {formatCurrency(totalExpense, 'compact', currencyCode)}
                </span>
              )
              : formatCurrency(singleViewCategory === 'vn' ? totalIncome : totalExpense, 'compact', currencyCode)
            }
          </p>
        </Badge>
        {bucketSummaries.map((bucket) => {
          const displayPercentage = isCombinedView
            ? (
              <p className="inline-flex items-center gap-2 whitespace-nowrap">
                <TrendingUp className="w-3 h-3 text-green-500" />
                {formatNumber(bucket.incomePercentage)}% /
                <TrendingDown className="w-3 h-3 text-red-500" />
                {formatNumber(bucket.expensePercentage)}%
              </p>
            )
            : `${formatNumber(singleViewCategory === 'vn' ? bucket.incomePercentage : bucket.expensePercentage)}%`;

          const tooltipText = isCombinedView
            ? `${bucket.title}: ${formatCurrency(bucket.incomeTotal, 'standard', currencyCode)} (${formatNumber(bucket.incomePercentage)}%) / ${formatCurrency(bucket.expenseTotal, 'standard', currencyCode)} (${formatNumber(bucket.expensePercentage)}%)`
            : `${bucket.title}: ${formatCurrency(singleViewCategory === 'vn' ? bucket.incomeTotal : bucket.expenseTotal, 'standard', currencyCode)} (${formatNumber(singleViewCategory === 'vn' ? bucket.incomePercentage : bucket.expensePercentage)}%)`;

          return (
            <Badge
              key={bucket.key}
              variant={selectedKey === bucket.key ? 'default' : 'secondary'}
              className={cn(
                'cursor-pointer py-1.5 px-3 text-xs whitespace-nowrap',
                selectedKey === bucket.key && 'shadow-sm'
              )}
              onClick={() => onSelectedKeyChange(bucket.key)}
              title={tooltipText}
            >
              <span className="font-semibold max-w-[200px] truncate" title={bucket.title}>
                {bucket.title}
              </span>
              <span className="mx-1.5">·</span>
              <span className="font-normal">{displayPercentage}</span>
            </Badge>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
