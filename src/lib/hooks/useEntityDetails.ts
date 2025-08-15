import { useQuery } from '@tanstack/react-query';
import { getEntityDetails, EntityDetailsData } from '@/lib/api/entities';
import { convertDaysToMs } from '@/lib/utils';
import { Normalization } from '@/schemas/charts';

export const ENTITY_DETAILS_QUERY_KEY = 'entityDetails';

export function entityDetailsQueryOptions(
  cui: string | undefined,
  year?: number,
  startYear?: number,
  endYear?: number,
  normalization?: Normalization
) {
  return {
    queryKey: [ENTITY_DETAILS_QUERY_KEY, cui, year, startYear, endYear, normalization] as const,
    queryFn: async () => {
      if (!cui) {
        return null as EntityDetailsData | null;
      }
      return getEntityDetails(cui, year, startYear, endYear, normalization);
    },
    staleTime: convertDaysToMs(1),
    gcTime: convertDaysToMs(72),
  };
}

export function useEntityDetails(cui: string | undefined, year?: number, startYear?: number, endYear?: number, normalization?: Normalization) {
  const options = entityDetailsQueryOptions(cui, year, startYear, endYear, normalization);
  return useQuery({
    ...options,
    staleTime: convertDaysToMs(1),
    enabled: !!cui,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}