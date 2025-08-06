import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react'; // Example icons
import { EntityFinancialSummarySkeleton } from './EntityFinancialSummarySkeleton';

interface EntityFinancialSummaryCardProps {
  title: string;
  value: number | null | undefined;
  icon?: React.ElementType;
  currentYear: number;
  color: string;
}

export const EntityFinancialSummaryCard: React.FC<EntityFinancialSummaryCardProps> = ({ title, value, icon: Icon, color, currentYear }) => {
  const displayValueCompact = value !== null && value !== undefined ? formatCurrency(value, "compact") : 'N/A';
  const displayValueStandard = value !== null && value !== undefined ? formatCurrency(value, "standard") : 'N/A';
  let iconColor = "text-slate-500 dark:text-slate-400";
  if (color === "green") iconColor = "text-green-500 dark:text-green-400";
  if (color === "red") iconColor = "text-red-500 dark:text-red-400";
  if (color === "blue") iconColor = "text-blue-500 dark:text-blue-400";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">{title} ({currentYear})</CardTitle>
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{displayValueCompact}</p>
        <p className="text-sm text-muted-foreground">{displayValueStandard}</p>
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
  currentYear: number;
  isLoading?: boolean;
}

export const EntityFinancialSummary: React.FC<EntityFinancialSummaryProps> = (
  { totalIncome, totalExpenses, budgetBalance, currentYear, isLoading }
) => {
  if (isLoading) {
    return <EntityFinancialSummarySkeleton />;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <EntityFinancialSummaryCard title="Cheltuieli totale" value={totalExpenses} icon={TrendingDown} color="red" currentYear={currentYear} />
      <EntityFinancialSummaryCard title="Venituri totale" value={totalIncome} icon={TrendingUp} color="green" currentYear={currentYear} />
      <EntityFinancialSummaryCard title="Balanta bugetara" value={budgetBalance} icon={Scale} color="blue" currentYear={currentYear} />
    </section>
  );
}; 