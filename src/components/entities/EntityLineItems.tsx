import React, { useMemo } from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { useFinancialData } from '@/hooks/useFinancialData';
import { FinancialDataCard } from './FinancialDataCard';

export interface EntityTopItemsProps {
  lineItems: EntityDetailsData["executionLineItems"];
  currentYear: number;
  totalIncome?: number | null;
  totalExpenses?: number | null;
  years: number[];
  onYearChange: (year: number) => void;
  initialExpenseSearchTerm: string;
  initialIncomeSearchTerm: string;
  onSearchChange: (type: 'expense' | 'income', term: string) => void;
}

export interface GroupedEconomic {
  code: string;
  name: string;
  amount: number;
}

export interface GroupedFunctional {
  code: string;
  name: string;
  totalAmount: number;
  economics: GroupedEconomic[];
}

export interface GroupedChapter {
  prefix: string;
  description: string;
  totalAmount: number;
  functionals: GroupedFunctional[];
}

export const EntityLineItems: React.FC<EntityTopItemsProps> = ({
  lineItems,
  currentYear,
  totalIncome,
  totalExpenses,
  years,
  onYearChange,
  initialExpenseSearchTerm,
  initialIncomeSearchTerm,
  onSearchChange,
}) => {
  const initialTotalIncome = totalIncome ?? 0;
  const initialTotalExpenses = totalExpenses ?? 0;
  const initialLineItems = useMemo(() => lineItems?.nodes || [], [lineItems]);
  const {
    expenseSearchTerm,
    onExpenseSearchChange,
    expenseSearchActive,
    onExpenseSearchToggle,
    filteredExpenseGroups,
    expenseBase,
    incomeSearchTerm,
    onIncomeSearchChange,
    incomeSearchActive,
    onIncomeSearchToggle,
    filteredIncomeGroups,
    incomeBase,
  } = useFinancialData(initialLineItems, initialTotalIncome, initialTotalExpenses, initialExpenseSearchTerm, initialIncomeSearchTerm);

  const handleExpenseSearchChange = (term: string) => {
    onSearchChange('expense', term);
    onExpenseSearchChange(term);
  };
  const handleIncomeSearchChange = (term: string) => {
    onSearchChange('income', term);
    onIncomeSearchChange(term);
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <FinancialDataCard
        title="Expenses"
        iconType="expense"
        currentYear={currentYear}
        years={years}
        onYearChange={onYearChange}
        searchTerm={expenseSearchTerm}
        onSearchChange={handleExpenseSearchChange}
        searchActive={expenseSearchActive}
        onSearchToggle={onExpenseSearchToggle}
        groups={filteredExpenseGroups}
        baseTotal={expenseBase}
        searchFocusKey="mod+j"
      />
      <FinancialDataCard
        title="Incomes"
        iconType="income"
        currentYear={currentYear}
        years={years}
        onYearChange={onYearChange}
        searchTerm={incomeSearchTerm}
        onSearchChange={handleIncomeSearchChange}
        searchActive={incomeSearchActive}
        onSearchToggle={onIncomeSearchToggle}
        groups={filteredIncomeGroups}
        baseTotal={incomeBase}
        searchFocusKey="mod+l"
      />
    </section>
  );
}; 