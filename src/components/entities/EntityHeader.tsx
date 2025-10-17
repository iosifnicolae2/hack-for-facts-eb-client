import React from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityView } from '@/hooks/useEntityViews';
import { EntityHeaderSkeleton } from './EntityHeaderSkeleton';
import { cn } from '@/lib/utils';
import { EntityViewSwitcher } from './EntityViewSwitcher';
import { Link } from '@tanstack/react-router';
import { Badge } from '../ui/badge';
import { useEntityTypeLabel } from '@/hooks/filters/useFilterLabels';
import { useExternalSearchLink } from '@/lib/hooks/useExternalSearchLink';
import { Building2, ExternalLink } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { UatDisplay } from './UatDisplay';
import { useHeaderSize } from './hooks/useHeaderSize';
import { EntityNotificationBell } from '@/features/notifications/components/EntityNotificationBell';

type HeaderEntity = Pick<EntityDetailsData, 'name' | 'cui' | 'entity_type' | 'address' | 'uat' | 'children' | 'parents' | 'executionLineItems'> & {
  is_uat?: boolean | null;
  population?: number | null | undefined;
};

interface EntityHeaderContentProps {
  entity: HeaderEntity;
  views: EntityView[];
  activeView: string;
  yearSelector?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

interface EntityHeaderProps {
  entity?: HeaderEntity | null | undefined;
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

  // Keep rendering the header while loading if we already have entity data.
  // This avoids unmounting controls (e.g., filters popover) during refetches.
  if (!entity) {
    return <EntityHeaderSkeleton className={className} />;
  }

  return (
    <EntityHeaderContent
      entity={entity}
      views={views}
      activeView={activeView}
      yearSelector={yearSelector}
      className={className}
      isLoading={isLoading}
    />
  )
};

const EntityHeaderContent: React.FC<EntityHeaderContentProps> = ({
  entity,
  views,
  activeView,
  yearSelector,
  className,
  isLoading,
}) => {
  const entityTypeLabel = useEntityTypeLabel();
  const entityCategory = entity?.entity_type ? entityTypeLabel.map(entity.entity_type) : null;
  const { headerRef, headerTitleRef, headerBottomRef, stickyTop } = useHeaderSize(isLoading);
  const { url: wikipediaUrl } = useExternalSearchLink(entity);

  return (
    <header ref={headerRef} className={cn("bg-background px-3 sm:px-6 pb-2 rounded-lg shadow-lg sticky z-30", className)} style={{ top: stickyTop }}>
      <div className="flex flex-col gap-4">
        <div className="flex-grow">
          <div ref={headerTitleRef} className="flex flex-col gap-2 mb-2 pt-2 sticky top-0 z-30 bg-background">
            <div className="flex flex-col lg:flex-row md:justify-between lg:items-start gap-2">
              <h1 className="text-4xl lg:text-5xl xl:text-5xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 min-w-0">
                <Link to={`/entities/$cui`} params={{ cui: entity.cui }} className="hover:underline break-words">
                  {entity.name}
                </Link>
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                {yearSelector}
                <EntityNotificationBell cui={entity.cui} entityName={entity.name} />
              </div>
            </div>
          </div>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
          )}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
              {entityCategory && (
                <Badge variant="secondary" className="px-2 py-1 text-sm">
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
                  className="inline-flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 gap-1 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">CUI:</span>
                <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">{entity.cui}</code>
              </p>
              {entity.address && (
                <p className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300"><Trans>Address</Trans>:</span>
                  <span className="font-normal break-words">{entity.address}</span>
                </p>
              )}
              {entity.uat && (
                <UatDisplay uat={entity.uat} />
              )}
            </div>
            <div ref={headerBottomRef} className={"relative max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-6rem)] md:max-w-[calc(100vw-12rem)]"}>
              <EntityViewSwitcher
                views={views}
                activeView={activeView}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
