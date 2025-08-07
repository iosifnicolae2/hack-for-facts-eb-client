import React from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { EntityRelationsList } from './EntityRelationsList';

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
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            {hasChildren && (
                <EntityRelationsList
                    entities={children}
                    title="Entități finanțate"
                    maxVisibleItems={0}
                />
            )}
            {hasParents && (
                <EntityRelationsList
                    entities={parents}
                    title="Finanțatori"
                    maxVisibleItems={0}
                />
            )}
        </div>
    );
};
