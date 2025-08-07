import React from 'react';
import { cn } from '@/lib/utils';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityView } from '@/hooks/useEntityViews';

import { EntityHeaderSkeleton } from './EntityHeaderSkeleton';
import { EntityInfo } from './EntityInfo';
import { EntityRelationships } from './EntityRelationships';
import { EntityViewSwitcher } from './EntityViewSwitcher';

interface EntityHeaderProps {
  entity?: Pick<EntityDetailsData, 'name' | 'cui' | 'entity_type' | 'address' | 'uat' | 'children' | 'parents'>;
  views: EntityView[];
  activeView: string;
  onViewChange: (viewId: string) => void;
  yearSelector?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  entity,
  views,
  activeView,
  onViewChange,
  yearSelector,
  className,
  isLoading,
}) => {
  if (isLoading || !entity) {
    return <EntityHeaderSkeleton className={className} />;
  }

  return (
    <header className={cn("bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-md", className)}>
      {/* Main content: Info and Year Selector */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <EntityInfo entity={entity} />
        {yearSelector && <div className="flex-shrink-0">{yearSelector}</div>}
      </div>

      {/* View switcher for different data visualizations */}
      <EntityViewSwitcher
        views={views}
        activeView={activeView}
        onViewChange={onViewChange}
        className="mt-2"
      />

      {/* Related entities (funding and funded) */}
      <EntityRelationships
        parents={entity.parents}
        children={entity.children}
      />
    </header>
  );
}; 