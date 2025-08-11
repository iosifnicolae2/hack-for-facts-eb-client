import { AnalyticsFilterType, defaultYearRange } from "@/schemas/charts";
import { useNavigate, useSearch } from "@tanstack/react-router";

const defaultMapFilters: AnalyticsFilterType = {
    years: [defaultYearRange.end],
    account_category: 'ch',
    normalization: 'per_capita',
};

interface UseEntityMapFilterProps {
    year: number;
}

export const useEntityMapFilter = ({ year }: UseEntityMapFilterProps) => {
    const navigate = useNavigate({ from: '/entities/$cui' });
    const search = useSearch({ from: '/entities/$cui' });
    const mapFilters = search.mapFilters ?? defaultMapFilters;

    // We want the year from the entity page to override the year from the map filters.
    mapFilters.years = [year];
    const updateMapFilters = (filters: Partial<AnalyticsFilterType>) => {
        navigate({ search: (prev) => ({ ...prev, mapFilters: { ...(prev)?.mapFilters, ...filters } }), replace: true });
    };
    return { mapFilters, updateMapFilters };
};