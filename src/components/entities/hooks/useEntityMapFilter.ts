import { AnalyticsFilterType, defaultYearRange } from "@/schemas/charts";
import { DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES, DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES } from "@/lib/analytics-defaults";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { withDefaultExcludes } from "@/lib/filterUtils";

const getDefaultMapFilters = (currency: 'RON' | 'EUR' | 'USD'): AnalyticsFilterType => withDefaultExcludes({
  report_period: {
    type: 'YEAR',
    selection: { dates: [String(defaultYearRange.end)] },
  },
  account_category: 'ch',
  normalization: 'per_capita',
  currency,
  inflation_adjusted: false,
  exclude: {
    economic_prefixes: [...DEFAULT_EXPENSE_EXCLUDE_ECONOMIC_PREFIXES],
    functional_prefixes: [...DEFAULT_INCOME_EXCLUDE_FUNCTIONAL_PREFIXES], 
  },
});

interface UseEntityMapFilterProps {
    year: number;
    currency?: 'RON' | 'EUR' | 'USD';
}

export const useEntityMapFilter = ({ year, currency = 'RON' }: UseEntityMapFilterProps) => {
    const navigate = useNavigate({ from: '/entities/$cui' });
    const search = useSearch({ from: '/entities/$cui' });
    const mapFilters = search.mapFilters ?? getDefaultMapFilters(currency);

    // We want the year from the entity page to override the year from the map filters.
    mapFilters.report_period = {
        type: 'YEAR',
        selection: { dates: [String(year)] },
    };
    mapFilters.report_type = 'Executie bugetara agregata la nivel de ordonator principal';
    const updateMapFilters = (filters: Partial<AnalyticsFilterType>) => {
      navigate({
        search: (prev) => {
          return { ...prev, mapFilters: { ...(prev as any)?.mapFilters, ...filters } }
        },
        replace: true,
        resetScroll: false,
      });
    };

    useEffect(() => {
        if (!mapFilters.currency) {
            updateMapFilters({ currency })
            return
        }
        if (mapFilters.normalization === 'total_euro') {
            updateMapFilters({ normalization: 'total', currency: 'EUR' })
            return
        }
        if (mapFilters.normalization === 'per_capita_euro') {
            updateMapFilters({ normalization: 'per_capita', currency: 'EUR' })
        }
    }, [currency, mapFilters.currency, mapFilters.normalization, updateMapFilters])

    return { mapFilters, updateMapFilters };
};
