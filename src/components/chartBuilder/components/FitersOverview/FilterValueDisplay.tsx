// src/components/chartBuilder/FilterValueDisplay.tsx

import { useState } from 'react';

const MAX_ITEMS_TO_SHOW = 6;

const formatValue = (value: unknown): string => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined) return 'None';
  return String(value);
};

export function FilterValueDisplay({ value }: { value: unknown }) {
    const [showAll, setShowAll] = useState(false);

    if (Array.isArray(value)) {
        if (value.length === 0) return <>None</>;

        const itemsToShow = showAll ? value : value.slice(0, MAX_ITEMS_TO_SHOW);
        const visibleItems = itemsToShow.map(String);
        const remainingCount = value.length - itemsToShow.length;

        return (
            <>
                {visibleItems.join(', ')}
                {remainingCount > 0 && !showAll && (
                    <button
                        type="button"
                        className="ml-1.5 px-1.5 py-0.5 text-xs rounded-sm bg-muted text-muted-foreground hover:bg-muted/80"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowAll(true);
                        }}
                    >
                        +{remainingCount} more
                    </button>
                )}
            </>
        );
    }

    return <>{formatValue(value)}</>;
} 