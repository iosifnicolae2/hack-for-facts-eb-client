import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  LabelList
} from 'recharts';
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
import type { ReportPeriodType } from '@/schemas/reporting';
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
  periodType?: ReportPeriodType;
  onSelectPeriod?: (label: string) => void;
  selectedQuarter?: string;
  selectedMonth?: string;
}

export const EntityFinancialTrends: React.FC<EntityFinancialTrendsProps> = React.memo(({
  incomeTrend,
  expenseTrend,
  balanceTrend,
  currentYear,
  entityName,
  normalization,
  onNormalizationChange,
  onYearChange,
  isLoading,
  periodType = 'YEAR',
  onSelectPeriod,
  selectedQuarter,
  selectedMonth
}) => {

  const { cui } = useParams({ from: '/entities/$cui' });

  const trendsAvailable = incomeTrend?.data.length || expenseTrend?.data.length || balanceTrend?.data.length;

  const mergedData = useMemo(() => {
    if (periodType === 'YEAR') {
      const years = new Set([
        ...(expenseTrend?.data || []).map(p => Number(p.x)),
        ...(incomeTrend?.data || []).map(p => Number(p.x)),
        ...(balanceTrend?.data || []).map(p => Number(p.x))
      ]);
      return Array.from(years).sort().map(year => ({
        label: String(year),
        expense: expenseTrend?.data.find(p => Number(p.x) === year)?.y ?? 0,
        income: incomeTrend?.data.find(p => Number(p.x) === year)?.y ?? 0,
        balance: balanceTrend?.data.find(p => Number(p.x) === year)?.y ?? 0,
      }));
    }
    if (periodType === 'QUARTER') {
      const toQuarterNumber = (x: string): number | null => {
        const match = String(x).trim().toUpperCase().match(/^Q?(\d)$/);
        if (!match) return null;
        const q = Number(match[1]);
        return q >= 1 && q <= 4 ? q : null;
      };
      const getValueForQuarter = (series: AnalyticsSeries | null | undefined, q: number): number => {
        const point = series?.data.find(p => toQuarterNumber(p.x) === q);
        return point?.y ?? 0;
      };
      return [1, 2, 3, 4].map((q) => ({
        label: `Q${q}`,
        expense: getValueForQuarter(expenseTrend, q),
        income: getValueForQuarter(incomeTrend, q),
        balance: getValueForQuarter(balanceTrend, q),
      }));
    }
    // MONTH
    {
      const toMonthNumber = (x: string): number | null => {
        const value = String(x).trim();
        const isoMatch = value.match(/^\d{4}-(\d{2})$/);
        if (isoMatch) {
          const m = Number(isoMatch[1]);
          return m >= 1 && m <= 12 ? m : null;
        }
        const mMatch = value.match(/^(\d{1,2})$/);
        if (mMatch) {
          const m = Number(mMatch[1]);
          return m >= 1 && m <= 12 ? m : null;
        }
        const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const upper = value.toUpperCase();
        const idx = monthNames.findIndex(n => n === upper || n.slice(0, 3) === upper.slice(0, 3));
        if (idx >= 0) return idx + 1;
        return null;
      };
      const getValueForMonth = (series: AnalyticsSeries | null | undefined, m: number): number => {
        const point = series?.data.find(p => toMonthNumber(p.x) === m);
        return point?.y ?? 0;
      };
      return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const label = String(m).padStart(2, '0');
        return {
          label,
          expense: getValueForMonth(expenseTrend, m),
          income: getValueForMonth(incomeTrend, m),
          balance: getValueForMonth(balanceTrend, m),
        };
      });
    }
  }, [incomeTrend, expenseTrend, balanceTrend, periodType]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string; stroke?: string; dataKey: string; }[]; label?: string }) => {
    if (active && payload && payload.length) {
      const monthNames: Record<string, string> = {
        '01': t`January`, '02': t`February`, '03': t`March`, '04': t`April`, '05': t`May`, '06': t`June`,
        '07': t`July`, '08': t`August`, '09': t`September`, '10': t`October`, '11': t`November`, '12': t`December`,
      }
      const heading = periodType === 'YEAR' ? t`Year` : periodType === 'QUARTER' ? t`Quarter` : t`Month`
      const prettyLabel = periodType === 'MONTH' ? (monthNames[label ?? ''] ?? String(label)) : String(label)
      return (
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm p-3 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="label font-bold mb-2">{heading}: {prettyLabel}</p>
          <div className="flex flex-col gap-2">
            {payload.map((pld) => (
              <div key={pld.dataKey} style={{ color: pld.stroke || pld.color }} className="flex flex-row gap-4 justify-between items-center text-sm">
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

  const handleChartClick = (e: any) => {
    if (!e || !e.activeLabel) return;
    const label = String(e.activeLabel);
    if (periodType === 'YEAR') {
      const year = Number(label);
      if (onYearChange && !Number.isNaN(year)) onYearChange(year);
    } else {
      onSelectPeriod?.(label);
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
            <Button asChild variant="ghost" size="icon" className="h-7 w-7 ml-1" aria-label={t`Open in chart editor`}>
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
            <ComposedChart
              data={mergedData}
              margin={{ top: 30, right: 40, left: getNormalizationUnit(normalization).length * 5 + 30, bottom: 5 }}
              onClick={handleChartClick}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: string | number) => {
                  if (periodType === 'YEAR') return String(val)
                  return `${currentYear}-${String(val)}`
                }}
              />
              <YAxis
                tickFormatter={(val) => yValueFormatter(val, getNormalizationUnit(normalization))}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} strokeDasharray="2 4" />

              {periodType === 'YEAR' && (
                <ReferenceLine x={String(currentYear)} stroke="gray" strokeDasharray="6 3" strokeWidth={1} />
              )}
              {periodType === 'QUARTER' && selectedQuarter && (
                <ReferenceLine x={selectedQuarter} stroke="gray" strokeDasharray="6 3" strokeWidth={1} />
              )}
              {periodType === 'MONTH' && selectedMonth && (
                <ReferenceLine x={selectedMonth} stroke="gray" strokeDasharray="6 3" strokeWidth={1} />
              )}

              <Bar
                dataKey="income"
                name={t`Income`}
                fill="#10b981"
                fillOpacity={0.2}
                stroke="#0f766e"
                strokeWidth={2}
                radius={[3, 3, 0, 0]}
                animationEasing='ease-in-out'
                animationBegin={300}
              >
                <LabelList dataKey="income" position="top" angle={periodType === 'QUARTER' ? 0 : -45} offset={24} fontSize={11} formatter={(v: unknown) => yValueFormatter(Number(v), '', 'compact')} />
              </Bar>
              <Bar
                dataKey="expense"
                name={t`Expenses`}
                fill="#f43f5e"
                fillOpacity={0.2}
                stroke="#be123c"
                strokeWidth={2}
                radius={[3, 3, 0, 0]}
                animationEasing='ease-in-out'
                animationBegin={300}
              >
                <LabelList dataKey="expense" position="top" angle={periodType === 'QUARTER' ? 0 : -45} offset={24} fontSize={11} formatter={(v: unknown) => yValueFormatter(Number(v), '', 'compact')} />
              </Bar>

              <Line
                type="monotone"
                dataKey="balance"
                name={t`Balance`}
                stroke="#6366f1"
                animationBegin={600}
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#f8fafc' }}
                activeDot={{ r: 6 }}
              >
                <LabelList dataKey="balance" position="top" offset={8} fontSize={11} formatter={(v: unknown) => yValueFormatter(Number(v), '', 'compact')} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});