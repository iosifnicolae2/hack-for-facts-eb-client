import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntityDetailsData } from '@/lib/api/entities';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';

interface EntityFinancialTrendsProps {
  incomeTrend: EntityDetailsData['incomeTrend'];
  expenseTrend: EntityDetailsData['expenseTrend'];
  balanceTrend: EntityDetailsData['balanceTrend'];
  mode: 'absolute' | 'percent';
  onModeChange: (mode: 'absolute' | 'percent') => void;
  onYearChange?: (year: number) => void;
}

export const EntityFinancialTrends: React.FC<EntityFinancialTrendsProps> = ({ incomeTrend, expenseTrend, balanceTrend, mode, onModeChange, onYearChange }) => {
  const trendsAvailable = incomeTrend?.length || expenseTrend?.length || balanceTrend?.length;

  const mergedData = useMemo(() => {
    const years = new Set([
      ...(incomeTrend || []).map(p => p.year),
      ...(expenseTrend || []).map(p => p.year),
      ...(balanceTrend || []).map(p => p.year)
    ]);

    return Array.from(years).sort().map(year => ({
      year,
      income: incomeTrend?.find(p => p.year === year)?.totalAmount ?? 0,
      expense: expenseTrend?.find(p => p.year === year)?.totalAmount ?? 0,
      balance: balanceTrend?.find(p => p.year === year)?.totalAmount ?? 0,
    }));
  }, [incomeTrend, expenseTrend, balanceTrend]);

  // Compute YoY percentage change dataset
  const percentData = useMemo(() => {
    const data = mergedData.map((entry, idx, arr) => {
      if (idx === 0) {
        return { year: entry.year, income: 0, expense: 0, balance: 0 };
      }
      const prev = arr[idx - 1];
      const pct = (curr: number, prevVal: number) => prevVal === 0 ? 0 : ((curr - prevVal) / prevVal) * 100;
      return {
        year: entry.year,
        income: pct(entry.income, prev.income),
        expense: pct(entry.expense, prev.expense),
        balance: pct(entry.balance, prev.balance),
      };
    });
    return data;
  }, [mergedData]);

  const displayData = mode === 'absolute' ? mergedData : percentData;

  const formatYAxis = (tickItem: number) => {
    if (Math.abs(tickItem) >= 1e9) {
      return `${(tickItem / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(tickItem) >= 1e6) {
      return `${(tickItem / 1e6).toFixed(1)}M`;
    }
    if (Math.abs(tickItem) >= 1e3) {
      return `${(tickItem / 1e3).toFixed(1)}K`;
    }
    return tickItem.toString();
  };

  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string; }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-300 dark:border-slate-700 rounded shadow-lg">
          <p className="label font-bold mb-2">{`Anul: ${label}`}</p>
          {payload.map((pld) => (
            <p key={pld.dataKey} style={{ color: pld.color }} className="text-sm">
              {`${pld.name}: ${mode === 'absolute' ? formatYAxis(pld.value) : formatPercent(pld.value)}`}
            </p>
          ))}
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Evoluție Financiară</span>
          </CardTitle>
          <Select value={mode} onValueChange={(val) => onModeChange(val as 'absolute' | 'percent')}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absolute">Valori Absolute</SelectItem>
              <SelectItem value="percent">Diferență % YoY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!trendsAvailable ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nu sunt date disponibile pentru afișarea evoluției financiare.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={displayData}
              margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
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
                tickFormatter={mode === 'absolute' ? formatYAxis : formatPercent}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Area type="monotone" dataKey="income" name="Venituri" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Cheltuieli" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="balance" name="Balanță" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}; 