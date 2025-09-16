import React from 'react';
import { useEntityRelationships } from '@/lib/hooks/useEntityDetails';
import { t } from '@lingui/core/macro';
import { Card, CardContent } from '@/components/ui/card';
import { EntityRelationsList } from './EntityRelationsList';

interface EntityRelationshipsProps {
    cui?: string;
}

export const EntityRelationships: React.FC<EntityRelationshipsProps> = ({ cui }) => {
    const { data: lazy } = useEntityRelationships({ cui: cui ?? '', enabled: !!cui });
    const parents = lazy?.parents ?? [];
    const children = lazy?.children ?? [];
    const hasParents = parents && parents.length > 0;
    const hasChildren = children && children.length > 0;

    if (!hasParents && !hasChildren) {
        return (
            <Card className="w-full">
                <CardContent className="py-6">
                    <p className="text-slate-500 dark:text-slate-400">{t`This entity has no funding or funded relationships.`}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="grid grid-cols-1 lg:w-full gap-6 mb-8">
            <CardContent className="py-6">
                <div className="w-full space-y-4">
                    {hasParents && (
                        <EntityRelationsList
                            entities={parents}
                            title={t`Funding Entities`}
                            maxVisibleItems={8}
                            maxHeight="60vh"
                            showSearchThreshold={7}
                            defaultOpen
                        />
                    )}
                    {hasChildren && (
                        <EntityRelationsList
                            entities={children}
                            title={t`Funded Entities`}
                            maxVisibleItems={12}
                            maxHeight="60vh"
                            showSearchThreshold={7}
                            defaultOpen
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
