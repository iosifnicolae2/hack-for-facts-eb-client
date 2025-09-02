import React, { useState, useMemo, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, ChevronRight, Landmark, Search } from 'lucide-react';
import Fuse from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useVirtualizer } from '@tanstack/react-virtual';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

interface EntityRelation {
  cui: string;
  name: string;
}

interface EntityRelationsListProps {
  entities: EntityRelation[];
  title: string;
  maxVisibleItems?: number;
  maxHeight?: string;
  showSearchThreshold?: number;
  defaultOpen?: boolean;
}

export const EntityRelationsList: React.FC<EntityRelationsListProps> = ({
  entities,
  title,
  maxVisibleItems = 3,
  maxHeight = '16rem',
  showSearchThreshold = 7,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(entities, {
        keys: ['name', 'cui'],
        threshold: 0.3,
      }),
    [entities]
  );

  const filteredEntities = useMemo(() => {
    if (!searchTerm) return entities;
    return fuse.search(searchTerm).map(result => result.item);
  }, [entities, searchTerm, fuse]);

  const shouldShowAccordion = entities.length > maxVisibleItems;
  const shouldShowSearch = entities.length >= showSearchThreshold;
  const shouldUseVirtualization = filteredEntities.length > 50; // Use virtualization for lists with more than 50 items

  // Virtual list configuration
  const virtualizer = useVirtualizer({
    count: filteredEntities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Estimated item height (updated for richer layout)
    overscan: 10,
  });

  if (entities.length === 0) {
    return null;
  }

  const renderEntityItem = (entity: EntityRelation) => (
    <Link
      to="/entities/$cui"
      params={{ cui: entity.cui }}
      aria-label={`${title}: ${entity.name}`}
      className="block"
    >
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-sm group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 p-1.5">
            <Landmark className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{entity.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">CUI: <code className="font-mono">{entity.cui}</code></div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
      </div>
    </Link>
  );

  const renderEntityList = (entitiesToRender: EntityRelation[], showAll: boolean = false) => {
    const itemsToRender = showAll ? entitiesToRender : entitiesToRender.slice(0, maxVisibleItems);

    if (!shouldUseVirtualization || !showAll) {
      return (
        <ul className="space-y-2">
          {itemsToRender.map(entity => (
            <li key={entity.cui}>
              {renderEntityItem(entity)}
            </li>
          ))}
        </ul>
      );
    }

    // Use virtualization for large lists
    return (
      <div
        ref={parentRef}
        style={{ maxHeight: maxHeight }}
        className={`overflow-auto`}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const entity = filteredEntities[virtualItem.index];
            return (
              <div
                key={entity.cui}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: '0.5rem', // match space-y-2 for visual consistency
                }}
              >
                {renderEntityItem(entity)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const titleChildren = (
    <>
      <Landmark className="h-4 w-4 text-slate-800 dark:text-slate-100" />
      <span className="text-slate-800 dark:text-slate-100 text-sm">{title} ({entities.length})</span>
    </>
  );

  if (!shouldShowAccordion) {
    return (
      <div className="mt-4 w-full">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          {titleChildren}
        </h3>
        {renderEntityList(entities, true)}
      </div>
    );
  }

  return (
    <div className="mt-4 w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {titleChildren}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2">
          {shouldShowSearch && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          )}

          <div className={`pr-2 overflow-y-auto w-full`} style={{ maxHeight: maxHeight }}>
            {filteredEntities.length > 0 ? (
              renderEntityList(filteredEntities, true)
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <Trans>No {title.toLowerCase()} found matching "{searchTerm}"</Trans>
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}; 