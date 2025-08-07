import { EntityDetailsData } from '@/lib/api/entities';
import { FileText, HomeIcon, MapIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

export type EntityView = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isDefault?: boolean;
};

export const useEntityViews = (entity: EntityDetailsData | null | undefined): EntityView[] => {
  const views: EntityView[] = [
    { id: 'overview', label: 'Overview', isDefault: true, icon: <HomeIcon className="w-4 h-4" /> },
  ];

  if (!entity) {
    return views;
  }

  const hasIncomeData = entity.executionLineItems?.nodes.some(node => node.account_category === 'vn' && node.amount > 0);
  const hasExpenseData = entity.executionLineItems?.nodes.some(node => node.account_category === 'ch' && node.amount > 0);

  if (hasExpenseData) {
    views.push({ id: 'expense-trends', label: 'Expense Trends', icon: <TrendingDownIcon className="w-4 h-4" /> });
  }
  if (hasIncomeData) {
    views.push({ id: 'income-trends', label: 'Income Trends', icon: <TrendingUpIcon className="w-4 h-4" /> });
  }

  // TODO: Add ranking view. Not implemented yet.
  // views.push({ id: 'ranking', label: 'Ranking' });

  if (entity.is_uat) {
    views.push({ id: 'map', label: 'Map', icon: <MapIcon className="w-4 h-4" /> });
  }

  if (entity.reports && entity.reports.nodes.length > 0) {
    views.push({ id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> });
  }



  return views;
};
