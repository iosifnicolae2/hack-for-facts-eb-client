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

  if (entity.reports && entity.reports.nodes.length > 0) {
    views.push({ id: 'reports', label: 'Reports' });
  }

  if (entity.incomeTrend && entity.expenseTrend && (entity.incomeTrend.length > 0 || entity.expenseTrend.length > 0)) {
    views.push({ id: 'trends', label: 'Trends' });
  }

  if (entity.entity_type === 'UAT' || entity.entity_type === 'JUDET') {
    views.push({ id: 'map', label: 'Map Data' });
  }

  return views;
};