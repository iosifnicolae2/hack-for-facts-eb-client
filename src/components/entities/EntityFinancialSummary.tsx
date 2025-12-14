import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { EntityFinancialSummarySkeleton } from './EntityFinancialSummarySkeleton';
import { t } from '@lingui/core/macro';
import type { NormalizationOptions } from '@/lib/normalization';
import { normalizeNormalizationOptions } from '@/lib/normalization';

interface EntityFinancialSummaryCardProps {
  title: string;
  value: number | null | undefined;
  icon?: React.ElementType;
  periodLabel: string;
  color: string;
  format: 'currency' | 'percent';
  currency: 'RON' | 'EUR' | 'USD';
}

const formatDisplayValue = (
  value: number | null | undefined,
  notation: 'compact' | 'standard',
  format: 'currency' | 'percent',
  currency: 'RON' | 'EUR' | 'USD'
): string => {
  if (value === null || value === undefined) return 'N/A';
  if (format === 'percent') return `${formatNumber(value, notation)}%`;
  return formatCurrency(value, notation, currency);
};

const iconColorMap: Record<string, string> = {
  green: 'text-green-500 dark:text-green-400',
  red: 'text-red-500 dark:text-red-400',
  blue: 'text-blue-500 dark:text-blue-400',
};

export const EntityFinancialSummaryCard: React.FC<EntityFinancialSummaryCardProps> = ({ title, value, icon: Icon, color, periodLabel, currency, format }) => {
  const displayValueCompact = formatDisplayValue(value, 'compact', format, currency);
  const displayValueStandard = formatDisplayValue(value, 'standard', format, currency);
  const iconColor = iconColorMap[color] ?? 'text-slate-500 dark:text-slate-400';

  return (
    <Card className="flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800">
      <CardHeader className="flex flex-row items-center space-y-0 space-x-4 pb-2 ">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">{title} ({periodLabel})</CardTitle>
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <p className="text-4xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{displayValueCompact}</p>
        <p className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{displayValueStandard}</span>
        </p>
        {/* You could add a small percentage change here if data is available */}
        {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
      </CardContent>
    </Card>
  );
};

interface EntityFinancialSummaryProps {
  totalIncome: number | null | undefined;
  totalExpenses: number | null | undefined;
  budgetBalance: number | null | undefined;
  periodLabel: string;
  isLoading?: boolean;
  normalizationOptions: NormalizationOptions;
}

export const EntityFinancialSummary: React.FC<EntityFinancialSummaryProps> = (
  { totalIncome, totalExpenses, budgetBalance, periodLabel, isLoading, normalizationOptions }
) => {
  if (isLoading) {
    return <EntityFinancialSummarySkeleton />;
  }

  const normalized = normalizeNormalizationOptions(normalizationOptions)
  const format: 'currency' | 'percent' = normalized.normalization === 'percent_gdp' ? 'percent' : 'currency'

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <EntityFinancialSummaryCard title={t`Total Income`} value={totalIncome} icon={TrendingUp} color="green" periodLabel={periodLabel} currency={normalized.currency} format={format} />
      <EntityFinancialSummaryCard title={t`Total Expenses`} value={totalExpenses} icon={TrendingDown} color="red" periodLabel={periodLabel} currency={normalized.currency} format={format} />
      <EntityFinancialSummaryCard title={t`Income - Expenses`} value={budgetBalance} icon={Scale} color="blue" periodLabel={periodLabel} currency={normalized.currency} format={format} />
    </section>
  );
}; 
