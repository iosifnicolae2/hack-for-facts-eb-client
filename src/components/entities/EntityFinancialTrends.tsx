import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
// Removed direct Select usage; using NormalizationSelector
import { TrendingUp, BarChart2 } from 'lucide-react';
import { yValueFormatter } from '../charts/components/chart-renderer/utils';
import { EntityFinancialTrendsSkeleton } from './EntityFinancialTrendsSkeleton';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useParams } from '@tanstack/react-router';
import { buildEntityIncomeExpenseChartLink } from '@/lib/chart-links';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { AnalyticsSeries } from '@/schemas/charts';
import { Normalization } from '@/schemas/charts';
import { NormalizationSelector } from '@/components/common/NormalizationSelector';
import { getNormalizationUnit } from '@/lib/utils';

interface EntityFinancialTrendsProps {
  incomeTrend?: AnalyticsSeries | null;
  expenseTrend?: AnalyticsSeries | null;
  balanceTrend?: AnalyticsSeries | null;
  currentYear: number;
  entityName: string;
  normalization: Normalization;
  onNormalizationChange: (mode: Normalization) => void;
  onYearChange?: (year: number) => void;
  isLoading?: boolean;
}

export const EntityFinancialTrends: React.FC<EntityFinancialTrendsProps> = ({ incomeTrend, expenseTrend, balanceTrend, currentYear, entityName, normalization, onNormalizationChange, onYearChange, isLoading }) => {

  const { cui } = useParams({ from: '/entities/$cui' });

  const trendsAvailable = incomeTrend?.data.length || expenseTrend?.data.length || balanceTrend?.data.length;

  const mergedData = useMemo(() => {
    const years = new Set([
      ...(expenseTrend?.data || []).map(p => Number(p.x)),
      ...(incomeTrend?.data || []).map(p => Number(p.x)),
      ...(balanceTrend?.data || []).map(p => Number(p.x))
    ]);

    return Array.from(years).sort().map(year => ({
      year,
      expense: expenseTrend?.data.find(p => Number(p.x) === year)?.y ?? 0,
      income: incomeTrend?.data.find(p => Number(p.x) === year)?.y ?? 0,
      balance: balanceTrend?.data.find(p => Number(p.x) === year)?.y ?? 0,
    }));
  }, [incomeTrend, expenseTrend, balanceTrend]);

  const displayData = mergedData;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string; }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/50 dark:bg-slate-800/90 backdrop-blur-xs p-3 border border-slate-300 dark:border-slate-700 rounded shadow-lg">
          <p className="label font-bold mb-2">{`Anul: ${label}`}</p>
          <div className="flex flex-col gap-2">
            {payload.map((pld) => (
              <div key={pld.dataKey} style={{ color: pld.color }} className="flex flex-row gap-4 justify-between items-center text-sm">
                <p>{pld.name}</p>
                <p className="font-mono text-md font-bold text-slate-800 dark:text-slate-400">{yValueFormatter(pld.value, getNormalizationUnit(normalization))}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleChartClick = (e: { activeLabel?: string | undefined } | null) => {
    if (!e || !e.activeLabel) return;

    if (!onYearChange) return;

    const year = Number(e.activeLabel);
    const isValidYear = !isNaN(year) && year > 2000 && year <= new Date().getFullYear();

    if (isValidYear) {
      onYearChange(year);
    }
  };

  const incomeExpenseChartLink = useMemo(() => cui ? buildEntityIncomeExpenseChartLink(cui, entityName, normalization) : null, [cui, entityName, normalization]);

  if (isLoading) {
    return <EntityFinancialTrendsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span><Trans>Financial Trends</Trans></span>
            <Button asChild variant="ghost" size="icon" className="h-7 w-7 ml-1" aria-label={t`Deschide în editorul de grafice`}>
              <Link to={incomeExpenseChartLink?.to ?? '/charts/$chartId'} params={incomeExpenseChartLink?.params as any} search={incomeExpenseChartLink?.search as any} preload="intent">
                <BarChart2 className="h-4 w-4" />
              </Link>
            </Button>
          </CardTitle>
          <NormalizationSelector value={normalization} onChange={onNormalizationChange} />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!trendsAvailable ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4"><Trans>No data available to display financial evolution.</Trans></p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={displayData}
              margin={{ top: 5, right: 40, left: getNormalizationUnit(normalization).length * 5 + 30, bottom: 5 }}
              onClick={handleChartClick}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(val) => yValueFormatter(val, getNormalizationUnit(normalization))}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <ReferenceLine x={currentYear} stroke="gray" strokeDasharray="6 3" strokeWidth={1} />
              <Area type="monotone" dataKey="income" name={t`Income`} stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name={t`Expenses`} stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="balance" name={t`Balance`} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}; 