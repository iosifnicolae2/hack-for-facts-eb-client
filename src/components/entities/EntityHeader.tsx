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

  if (isLoading || !entity) {
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
    <header ref={headerRef} className={cn("bg-background px-6 pb-2 rounded-lg shadow-lg sticky z-30", className)} style={{ top: stickyTop }}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-grow">
          <div ref={headerTitleRef} className="flex flex-col md:flex-row md:justify-between mb-2 pt-2 sticky top-0 z-30 bg-background">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl lg:text-5xl font-extrabold underline text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Link to={`/entities/$cui`} params={{ cui: entity.cui }}>
                  {entity.name}
                </Link>
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {yearSelector}
              <EntityNotificationBell cui={entity.cui} entityName={entity.name} />
            </div>
          </div>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
          )}>
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
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
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
            <div ref={headerBottomRef} className={"relative"}>
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
