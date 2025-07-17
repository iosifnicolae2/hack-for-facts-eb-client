import React, { useState, useMemo, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, ChevronRight, Landmark, Search } from 'lucide-react';
import Fuse from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useVirtualizer } from '@tanstack/react-virtual';

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
}

export const EntityRelationsList: React.FC<EntityRelationsListProps> = ({
  entities,
  title,
  maxVisibleItems = 3,
  maxHeight = '200px',
  showSearchThreshold = 10,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    estimateSize: () => 28, // Estimated height of each item (24px line height + 4px margin)
    overscan: 10, // Render 10 extra items outside the visible area
  });

  if (entities.length === 0) {
    return null;
  }

  const renderEntityItem = (entity: EntityRelation) => (
    <Link
      to="/entities/$cui"
      params={{ cui: entity.cui }}
      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors block py-0.5"
    >
      {entity.name}
    </Link>
  );

  const renderEntityList = (entitiesToRender: EntityRelation[], showAll: boolean = false) => {
    const itemsToRender = showAll ? entitiesToRender : entitiesToRender.slice(0, maxVisibleItems);

    if (!shouldUseVirtualization || !showAll) {
      return (
        <ul className="space-y-1">
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
        className="overflow-auto"
        style={{ maxHeight }}
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
      <span className="text-slate-800 dark:text-slate-100">{title} ({entities.length})</span> 
    </>
  );

  if (!shouldShowAccordion) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          {titleChildren}
        </h3>
        {renderEntityList(entities, true)}
      </div>
    );
  }

  return (
    <div className="mt-4">
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
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          )}

          <div className="pr-2">
            {filteredEntities.length > 0 ? (
              renderEntityList(filteredEntities, true)
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No {title.toLowerCase()} found matching "{searchTerm}"
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}; 