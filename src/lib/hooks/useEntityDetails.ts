import { useQuery, queryOptions } from '@tanstack/react-query';
import { getEntityDetails } from '@/lib/api/entities';
import { Normalization } from '@/schemas/charts';
import { ReportPeriodInput } from '@/schemas/reporting';

export const entityDetailsQueryOptions = (
  cui: string,
  year: number,
  startYear: number,
  endYear: number,
  normalization: Normalization,
  reportPeriod: ReportPeriodInput
) =>
  queryOptions({
    queryKey: ['entityDetails', cui, year, startYear, endYear, normalization, reportPeriod],
    queryFn: () => getEntityDetails(cui, year, startYear, endYear, normalization, reportPeriod),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!cui,
  });

export function useEntityDetails(
  cui: string,
  year: number,
  startYear: number,
  endYear: number,
  normalization: Normalization,
  reportPeriod: ReportPeriodInput
) {
  return useQuery(entityDetailsQueryOptions(cui, year, startYear, endYear, normalization, reportPeriod));
}