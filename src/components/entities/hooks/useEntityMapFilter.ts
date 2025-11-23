import { AnalyticsFilterType, defaultYearRange } from "@/schemas/charts";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { withDefaultExcludes } from "@/lib/filterUtils";

const getDefaultMapFilters = (userCurrency: 'RON' | 'EUR'): AnalyticsFilterType => withDefaultExcludes({
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
    const mapFilters = withDefaultExcludes(search.mapFilters ?? getDefaultMapFilters(userCurrency));

    // We want the year from the entity page to override the year from the map filters.
    mapFilters.report_period = {
        type: 'YEAR',
        selection: { dates: [String(year)] },
    };
    mapFilters.report_type = 'Executie bugetara agregata la nivel de ordonator principal';
    const updateMapFilters = (filters: Partial<AnalyticsFilterType>) => {
      navigate({
        search: (prev) => {
          const merged = withDefaultExcludes({ ...(prev as any)?.mapFilters, ...filters })
          return { ...prev, mapFilters: merged }
        },
        replace: true,
        resetScroll: false,
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
