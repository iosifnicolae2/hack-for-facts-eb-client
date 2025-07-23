import React from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityRelationsList } from './EntityRelationsList';
import { Building2 } from 'lucide-react';
import entityCategories from '@/assets/entity-categories.json';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EntityHeaderProps {
  entity: Pick<EntityDetailsData, 'name' | 'cui' | 'entity_type' | 'address' | 'uat' | 'children' | 'parents'>;
  /** Optional element (e.g., a Select) rendered to the right of the title */
  yearSelector?: React.ReactNode;
  onTitleClick?: () => void;
  className?: string;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({ entity, yearSelector, className, onTitleClick }) => {

  const entityCategory = entity.entity_type ? entityCategories.categories[entity.entity_type as keyof typeof entityCategories.categories] : null;

  return (
    <header className={cn("bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-md", className)}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 cursor-pointer" onClick={onTitleClick}>{entity.name}</h1>
            {entityCategory && (
              <Badge variant="secondary" className="px-2 py-1 text-xs sm:text-sm whitespace-nowrap">
                <Building2 className="h-4 w-4 mr-1.5" />
                <span className="font-semibold">{entityCategory}</span>
              </Badge>
            )}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">CUI:</span> {entity.cui}
            </p>
            {entity.address && (
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Adresă:</span> {entity.address}
              </p>
            )}
            {entity.uat && (
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">UAT:</span> {entity.uat.name} (Județ: {entity.uat.county_name || 'N/A'})
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {yearSelector}
        </div>
      </div>

      {(entity.children.length > 0 || entity.parents.length > 0) && (
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          {entity.children.length > 0 && (
            <EntityRelationsList
              entities={entity.children}
              title="Entități finanțate"
              maxVisibleItems={3}
            />
          )}

          {entity.parents.length > 0 && (
            <EntityRelationsList
              entities={entity.parents}
              title="Finanțatori"
              maxVisibleItems={3}
            />
          )}
        </div>
      )}
    </header>
  );
}; 