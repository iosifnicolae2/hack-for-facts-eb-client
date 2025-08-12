import React from 'react';
import { cn } from '@/lib/utils';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityView } from '@/hooks/useEntityViews';

import { EntityHeaderSkeleton } from './EntityHeaderSkeleton';
import { EntityInfo } from './EntityInfo';
import { EntityRelationships } from './EntityRelationships';
import { EntityViewSwitcher } from './EntityViewSwitcher';

type HeaderEntity = Pick<EntityDetailsData, 'name' | 'cui' | 'entity_type' | 'address' | 'uat' | 'children' | 'parents' | 'executionLineItems' | 'is_main_creditor'> & {
  is_uat?: boolean;
};

interface EntityHeaderProps {
  entity?: HeaderEntity;
  views: EntityView[];
  activeView: string;
  yearSelector?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  entity,
  views,
  activeView,
  yearSelector,
  className,
  isLoading,
}) => {
  if (isLoading || !entity) {
    return <EntityHeaderSkeleton className={className} />;
  }

  return (
    <header className={cn("bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-md relative z-30", className)}>
      {/* Main content: Info and Year Selector */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <EntityInfo entity={entity} />
        {yearSelector && (
          <div
            className={cn(
              "w-[40%] sm:w-auto",
              "rounded-xl border border-slate-200/80 dark:border-slate-700/70",
              "bg-white/70 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:bg-white/30",
              "px-2 py-1 shadow-sm",
            )}
          >
            {yearSelector}
          </div>
        )}
      </div>

      {/* View switcher for different data visualizations */}
      <EntityViewSwitcher
        views={views}
        activeView={activeView}
        className="mt-2 pt-[1px]"
      />

      {/* Related entities (funding and funded) */}
      <EntityRelationships
        parents={entity.parents}
        children={entity.children}
      />
    </header>
  );
}; 