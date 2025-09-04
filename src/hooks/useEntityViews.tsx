import { EntityDetailsData } from '@/lib/api/entities';
import { FileText, HomeIcon, MapIcon, TrendingDownIcon, TrendingUpIcon, BarChart3, Building2Icon, UsersIcon } from 'lucide-react';
import { t } from '@lingui/core/macro';

export type EntityView = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isDefault?: boolean;
};

export const useEntityViews = (entity: EntityDetailsData | null | undefined): EntityView[] => {
  const views: EntityView[] = [
    { id: 'overview', label: t`Overview`, isDefault: true, icon: <HomeIcon className="w-4 h-4" /> },
  ];

  if (!entity) {
    return views;
  }

  const hasIncomeData = entity.executionLineItems?.nodes.some(node => node.account_category === 'vn' && node.amount > 0);
  const hasExpenseData = entity.executionLineItems?.nodes.some(node => node.account_category === 'ch' && node.amount > 0);

  if (hasExpenseData) {
    views.push({ id: 'expense-trends', label: t`Expense Trends`, icon: <TrendingDownIcon className="w-4 h-4" /> });
  }
  if (hasIncomeData) {
    views.push({ id: 'income-trends', label: t`Income Trends`, icon: <TrendingUpIcon className="w-4 h-4" /> });
  }

  // TODO: Add ranking view. Not implemented yet.
  // views.push({ id: 'ranking', label: 'Ranking' });

  if (entity.is_uat) {
    views.push({ id: 'map', label: t`Map`, icon: <MapIcon className="w-4 h-4" /> });
  }

  // Experimental employees data view
  if (entity.is_uat && entity.entity_type !== "admin_county_council" && entity.uat?.siruta_code != null) {
    views.push({ id: 'employees', label: t`Employees`, icon: <UsersIcon className="w-4 h-4" /> });
  }

  views.push({ id: 'related-charts', label: t`Charts`, icon: <BarChart3 className="w-4 h-4" /> });


  const hasParents = entity.parents && entity.parents.length > 0;
  const hasChildren = entity.children && entity.children.length > 0;

  if (hasParents || hasChildren) {
    views.push({ id: 'relationships', label: t`Entities`, icon: <Building2Icon className="w-4 h-4" /> });
  }

  if (entity.reports && entity.reports.nodes.length > 0) {
    views.push({ id: 'reports', label: t`Reports`, icon: <FileText className="w-4 h-4" /> });
  }

  return views;
};
