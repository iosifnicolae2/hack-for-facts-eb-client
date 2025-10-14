import { AnalyticsFilterType, defaultYearRange } from "@/schemas/charts";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

const getDefaultMapFilters = (userCurrency: 'RON' | 'EUR'): AnalyticsFilterType => ({
    report_period: {
        type: 'YEAR',
        selection: { dates: [String(defaultYearRange.end)] },
    },
    account_category: 'ch',
    normalization: userCurrency === 'EUR' ? 'per_capita_euro' : 'per_capita',
});

interface UseEntityMapFilterProps {
    year: number;
    userCurrency?: 'RON' | 'EUR';
}

export const useEntityMapFilter = ({ year, userCurrency = 'RON' }: UseEntityMapFilterProps) => {
    const navigate = useNavigate({ from: '/entities/$cui' });
    const search = useSearch({ from: '/entities/$cui' });
    const mapFilters = search.mapFilters ?? getDefaultMapFilters(userCurrency);

    // We want the year from the entity page to override the year from the map filters.
    mapFilters.report_period = {
        type: 'YEAR',
        selection: { dates: [String(year)] },
    };
    mapFilters.report_type = 'Executie bugetara agregata la nivel de ordonator principal';
    const updateMapFilters = (filters: Partial<AnalyticsFilterType>) => {
        navigate({
            search: (prev) => {
                const newFilters = { ...prev, mapFilters: { ...(prev as any)?.mapFilters, ...filters } };
                if (!newFilters.mapFilters.account_category) {
                    newFilters.mapFilters.account_category = "ch";
                }
                return newFilters;
            },
            replace: true,
        });
    };

    useEffect(() => {
        if (userCurrency === 'EUR' && mapFilters.normalization !== 'total_euro' && mapFilters.normalization !== 'per_capita_euro') {
            updateMapFilters({ normalization: 'per_capita_euro' })
        } else if (userCurrency === 'RON' && mapFilters.normalization !== 'total' && mapFilters.normalization !== 'per_capita') {
            updateMapFilters({ normalization: 'per_capita' })
        }
    }, [userCurrency, mapFilters.normalization, updateMapFilters])

    return { mapFilters, updateMapFilters };
};