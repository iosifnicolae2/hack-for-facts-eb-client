import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TopItemsList } from './TopItemsList';
import { EntityDetailsData } from '@/lib/api/entities';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'; // Icons for expenses and income

interface EntityTopItemsProps {
  lineItems: EntityDetailsData['executionLineItems']
  currentYear: number;
}

export const EntityLineItems: React.FC<EntityTopItemsProps> = ({ lineItems, currentYear }) => {
  const expenses = lineItems?.nodes.filter(li => li.account_category === 'ch')
  const incomes = lineItems?.nodes.filter(li => li.account_category === 'vn')

  console.log({expenses, incomes})
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
        <CardHeader>
          {/* CardTitle is removed from here and integrated into TopItemsList for better alignment with icon */}
        </CardHeader>
        <CardContent className="flex-grow">
          <TopItemsList
            items={expenses}
            title="Top 5 Expenses"
            nameKey="economicClassification"
            currentYear={currentYear}
            icon={ArrowDownCircle}
            iconColor="text-red-500 dark:text-red-400"
          />
        </CardContent>
      </Card>
      <Card className="shadow-lg dark:bg-slate-800 h-full flex flex-col">
        <CardHeader>
          {/* CardTitle is removed from here and integrated into TopItemsList for better alignment with icon */}
        </CardHeader>
        <CardContent className="flex-grow">
          <TopItemsList
            items={incomes}
            title="Top 5 Income Sources"
            nameKey="functionalClassification"
            currentYear={currentYear}
            icon={ArrowUpCircle}
            iconColor="text-green-500 dark:text-green-400"
          />
        </CardContent>
      </Card>
    </section>
  );
}; 