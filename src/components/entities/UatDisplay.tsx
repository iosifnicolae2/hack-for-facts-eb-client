import React from 'react';
import { Link } from '@tanstack/react-router';
import { EntityDetailsData } from '@/lib/api/entities';

interface UatDisplayProps {
    uat: NonNullable<EntityDetailsData['uat']>;
}

export const UatDisplay: React.FC<UatDisplayProps> = ({ uat }) => {

    const CountyComponent = () => {
        if (uat.name === uat.county_entity?.name) {
            return null;
        }
        if (uat.county_entity) {
            return (
                <>
                    <span>-</span>
                    <Link to={`/entities/$cui`} params={{ cui: uat.county_entity.cui }} className="hover:underline">
                        {uat.county_entity.name}
                    </Link>
                </>
            )
        }
        return (
            <>
                <span>-</span>
                <span>
                    Județ: {uat.county_name}
                </span>
            </>
        )
    }

    return (
        <p className="flex flex-row gap-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
                UAT:
            </span>
            <span>
                {uat.name}
            </span>
            <CountyComponent />
        </p>
    );
}
