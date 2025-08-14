import React from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityRelationsList } from './EntityRelationsList';
import { t } from '@lingui/core/macro';

interface EntityRelationshipsProps {
    parents: EntityDetailsData['parents'];
    children: EntityDetailsData['children'];
}

export const EntityRelationships: React.FC<EntityRelationshipsProps> = ({ parents, children }) => {
    const hasParents = parents.length > 0;
    const hasChildren = children.length > 0;

    if (!hasParents && !hasChildren) {
        return null; // Render nothing if there are no relationships
    }

    return (
        <div className="mt-2 pt-0 border-t border-slate-200 dark:border-slate-700 space-y-4">
            {hasChildren && (
                <EntityRelationsList
                    entities={children}
                    title={t`Funded Entities`}
                    maxVisibleItems={0}
                />
            )}
            {hasParents && (
                <EntityRelationsList
                    entities={parents}
                    title={t`Funding Entities`}
                    maxVisibleItems={0}
                />
            )}
        </div>
    );
};
