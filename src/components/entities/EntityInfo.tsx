import React from 'react';
import { Link } from '@tanstack/react-router';
import { Building2, ExternalLink } from 'lucide-react';

import { EntityDetailsData } from '@/lib/api/entities';
import entityCategories from '@/assets/entity-categories.json';
import { Badge } from '@/components/ui/badge';
import { UatDisplay } from './UatDisplay';
import { useExternalSearchLink } from '@/lib/hooks/useWikipediaLink';

interface EntityInfoProps {
    entity: Pick<EntityDetailsData, 'name' | 'cui' | 'entity_type' | 'address' | 'uat' | 'children' | 'parents'>;
}

export const EntityInfo: React.FC<EntityInfoProps> = ({ entity }) => {
    const entityCategory = entity.entity_type
        ? entityCategories.categories[entity.entity_type as keyof typeof entityCategories.categories]
        : null;
    const { url: wikipediaUrl } = useExternalSearchLink(entity);

    return (
        <div className="flex-grow">
            {/* Title and Category Badge */}
            <div className="flex items-center gap-4 flex-wrap mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Link to={`/entities/$cui`} params={{ cui: entity.cui }}>
                        {entity.name}
                    </Link>
                </h1>
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
                        aria-label="Open on Wikipedia"
                        className="inline-flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 gap-1"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>

            {/* Detailed Information */}
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
                    <UatDisplay uat={entity.uat} />
                )}
            </div>
        </div>
    );
};
