import { defaultYearRange } from "@/schemas/charts";
import { MapFilters } from "@/schemas/map-filters";
import { useNavigate, useSearch } from "@tanstack/react-router";

const defaultMapFilters: MapFilters = {
    years: [defaultYearRange.end],
    account_categories: ['ch'] as ('ch' | 'vn')[],
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
    const updateMapFilters = (filters: Partial<MapFilters>) => {
        navigate({ search: (prev) => ({ ...prev, mapFilters: { ...(prev)?.mapFilters, ...filters } }), replace: true });
    };
    return { mapFilters, updateMapFilters };
};