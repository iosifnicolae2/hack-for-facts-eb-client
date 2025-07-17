import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntityDetailsData } from '@/lib/api/entities';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface EntityFinancialTrendsProps {
  incomeTrend: EntityDetailsData['incomeTrend'];
  expenseTrend: EntityDetailsData['expenseTrend'];
  balanceTrend: EntityDetailsData['balanceTrend'];
}

export const EntityFinancialTrends: React.FC<EntityFinancialTrendsProps> = ({ incomeTrend, expenseTrend, balanceTrend }) => {
  const trendsAvailable = incomeTrend?.length || expenseTrend?.length || balanceTrend?.length;

  const mergedData = React.useMemo(() => {
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

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string; }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-300 dark:border-slate-700 rounded shadow-lg">
          <p className="label font-bold mb-2">{`Anul: ${label}`}</p>
          {payload.map((pld) => (
            <p key={pld.dataKey} style={{ color: pld.color }} className="text-sm">
              {`${pld.name}: ${formatYAxis(pld.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Evoluție Financiară</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!trendsAvailable ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nu sunt date disponibile pentru afișarea evoluției financiare.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart 
              data={mergedData}
              margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
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