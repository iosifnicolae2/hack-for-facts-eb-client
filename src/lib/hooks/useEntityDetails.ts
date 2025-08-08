import { useQuery } from '@tanstack/react-query';
import { getEntityDetails, EntityDetailsData } from '@/lib/api/entities';
import { convertDaysToMs } from '@/lib/utils';

export const ENTITY_DETAILS_QUERY_KEY = 'entityDetails';

export function entityDetailsQueryOptions(
  cui: string | undefined,
  year?: number,
  startYear?: number,
  endYear?: number
) {
  return {
    queryKey: [ENTITY_DETAILS_QUERY_KEY, cui, year, startYear, endYear] as const,
    queryFn: async () => {
      if (!cui) {
        return null as EntityDetailsData | null;
      }
      return getEntityDetails(cui, year, startYear, endYear);
    },
    staleTime: convertDaysToMs(1),
    gcTime: convertDaysToMs(72),
  };
}

export function useEntityDetails(cui: string | undefined, year?: number, startYear?: number, endYear?: number) {
  const options = entityDetailsQueryOptions(cui, year, startYear, endYear);
  return useQuery({
    ...options,
    staleTime: convertDaysToMs(1),
    enabled: !!cui,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}