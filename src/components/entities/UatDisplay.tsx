import React from "react";
import { Link } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";
import { formatNumber } from "@/lib/utils";
import { Users2, MapPin } from "lucide-react";

import { EntityDetailsData } from "@/lib/api/entities";

interface UatDisplayProps {
    uat: NonNullable<EntityDetailsData["uat"]>;
}

export const UatDisplay: React.FC<UatDisplayProps> = ({ uat }) => {
    const isSameAsCounty = uat.name === uat.county_entity?.name;

    return (
        <div
            role="group"
            aria-label="UAT details"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-slate-800 dark:text-slate-200"
        >
            <span className="font-medium">
                <abbr title="Unitate administrativ-teritorială" className="no-underline">
                    UAT
                </abbr>
                :
            </span>

            <span className="min-w-0 truncate max-w-[45ch]" title={uat.name ?? undefined}>
                {uat.name}
            </span>

            {uat.population ? (
                <>
                    <Separator />
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        {/* remove next line if not using icons */}
                        <Users2 aria-hidden className="size-4" />
                        <Trans>Population</Trans>: {formatNumber(uat.population)}
                    </span>
                </>
            ) : null}

            {!isSameAsCounty && (
                <>
                    <Separator />
                    {uat.county_entity ? (
                        <Link
                            to="/entities/$cui"
                            params={{ cui: uat.county_entity.cui }}
                            title={`Deschide pagina: ${uat.county_entity.name}`}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400"
                        >
                            <MapPin aria-hidden className="size-4" />
                            {uat.county_entity.name}
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <MapPin aria-hidden className="size-4" />
                            <Trans>County</Trans>: {uat.county_name}
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

function Separator() {
    return <span aria-hidden className="mx-1 text-slate-400">•</span>;
}
