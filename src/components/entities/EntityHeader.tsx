import React from 'react';
import { cn } from '@/lib/utils';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityView } from '@/hooks/useEntityViews';
import { EntityHeaderSkeleton } from './EntityHeaderSkeleton';
import { EntityRelationships } from './EntityRelationships';
import { EntityViewSwitcher } from './EntityViewSwitcher';
import { Link } from '@tanstack/react-router';
import { Badge } from '../ui/badge';
import { useEntityTypeLabel } from '@/hooks/filters/useFilterLabels';
import { useExternalSearchLink } from '@/lib/hooks/useExternalSearchLink';
import { Building2, ExternalLink } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { UatDisplay } from './UatDisplay';
import { useEntityHeaderExpanded } from '@/lib/hooks/useEntityHeaderExpanded';

type HeaderEntity = Pick<EntityDetailsData, 'name' | 'cui' | 'entity_type' | 'address' | 'uat' | 'children' | 'parents' | 'executionLineItems' | 'is_main_creditor'> & {
  is_uat?: boolean;
  population?: number | null;
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
  const entityTypeLabel = useEntityTypeLabel();
  const hideThreshold = 200
  const { isHeaderExpanded, hiddenContentRef } = useEntityHeaderExpanded({ hideThreshold })

  const entityCategory = entity.entity_type ? entityTypeLabel.map(entity.entity_type) : null;
  const { url: wikipediaUrl } = useExternalSearchLink(entity);

  return (
    <header className={cn("bg-background p-6 rounded-lg shadow-lg relative z-30", className)}>
      {/* Main content: Info and Year Selector */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-grow">
          {/* Title and Category Badge */}
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl lg:text-5xl font-extrabold underline text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Link to={`/entities/$cui`} params={{ cui: entity.cui }}>
                  {entity.name}
                </Link>
              </h1>
            </div>

            {yearSelector && (
              <div
                className={cn(
                  "rounded-xl border border-slate-200/80 dark:border-slate-700/70 mt-0 mb-auto",
                  "bg-white/70 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:bg-white/30",
                  "px-2 py-1 shadow-sm",
                )}
              >
                {yearSelector}
              </div>
            )}
          </div>

          {/* Expanded content with transitions */}
          <div ref={hiddenContentRef} className={cn(
            "overflow-hidden transition-all duration-300",
            isHeaderExpanded ? "h-auto opacity-100 ease-in" : "h-0 opacity-0 ease-out"
          )}>
            {/* Badge and Wikipedia link */}
            <div className="flex items-center gap-2 mb-4">
              {entityCategory && (
                <Badge variant="secondary" className="px-2 py-1 text-sm whitespace-nowrap">
                  <Building2 className="h-4 w-4 mr-1.5" />
                  <span className="font-semibold">{entityCategory}</span>
                </Badge>
              )}
              {wikipediaUrl && (
                <a
                  href={wikipediaUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={t`Open on Wikipedia`}
                  className="inline-flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Detailed Information */}
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-4">
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">CUI</span>: <code className="font-mono font-bold">{entity.cui}</code>
              </p>
              {entity.address && (
                <p className="flex items-center gap-1 font-semibold">
                  <Trans>Address</Trans>: <span className="font-normal truncate">{entity.address}</span>
                </p>
              )}
              {entity.uat && (
                <UatDisplay uat={entity.uat} />
              )}
            </div>

            {/* View switcher and relationships */}
            <EntityViewSwitcher
              views={views}
              activeView={activeView}
            />
            <EntityRelationships
              parents={entity.parents}
              children={entity.children}
            />
          </div>
        </div>
      </div>
    </header>
  );
}; 