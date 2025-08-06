import { EntityDetailsData } from '@/lib/api/entities';

export type EntityView = {
  id: string;
  label: string;
  isDefault?: boolean;
};

export const useEntityViews = (entity: EntityDetailsData | null | undefined): EntityView[] => {
  const views: EntityView[] = [
    { id: 'overview', label: 'Overview', isDefault: true },
  ];

  if (!entity) {
    return views;
  }

  const hasIncomeData = entity.executionLineItems?.nodes.some(node => node.account_category === 'vn' && node.amount > 0);
  const hasExpenseData = entity.executionLineItems?.nodes.some(node => node.account_category === 'ch' && node.amount > 0);

  if (hasExpenseData) {
    views.push({ id: 'expense-trends', label: 'Expense Trends' });
  }
  if (hasIncomeData) {
    views.push({ id: 'income-trends', label: 'Income Trends' });
  }


  views.push({ id: 'ranking', label: 'Ranking' });

  if (entity.reports && entity.reports.nodes.length > 0) {
    views.push({ id: 'reports', label: 'Reports' });
  }

  if (entity.entity_type === 'UAT' || entity.entity_type === 'JUDET') {
    views.push({ id: 'map', label: 'Map Data' });
  }


  return views;
};
