import { AnalyticsFilterType, defaultYearRange } from "@/schemas/charts";
import { makeSingleTimePeriod, type DateInput } from "@/schemas/reporting";
import { useNavigate, useSearch } from "@tanstack/react-router";

const defaultMapFilters: AnalyticsFilterType = {
    years: [defaultYearRange.end],
    report_period: makeSingleTimePeriod('YEAR', `${defaultYearRange.end}` as DateInput),
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
    mapFilters.report_period = makeSingleTimePeriod('YEAR', `${year}` as DateInput);
    const updateMapFilters = (filters: Partial<AnalyticsFilterType>) => {
        navigate({
            search: (prev) => {
                const newFilters = { ...prev, mapFilters: { ...(prev as any)?.mapFilters, ...filters } };
                if (newFilters.mapFilters.years?.length === 0) {
                    newFilters.mapFilters.years = [defaultYearRange.end];
                }
                if (!newFilters.mapFilters.account_category) {
                    newFilters.mapFilters.account_category = "ch";
                }
                if (!newFilters.mapFilters.report_period) {
                    const y = newFilters.mapFilters.years?.[0] ?? defaultYearRange.end;
                    newFilters.mapFilters.report_period = makeSingleTimePeriod('YEAR', `${y}` as DateInput);
                }
                return newFilters;
            },
            replace: true,
        });
    };
    return { mapFilters, updateMapFilters };
};