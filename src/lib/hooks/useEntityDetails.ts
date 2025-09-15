import { useQuery, queryOptions } from '@tanstack/react-query';
import { getEntityDetails } from '@/lib/api/entities';
import { Normalization } from '@/schemas/charts';
import { ReportPeriodInput, GqlReportType } from '@/schemas/reporting';

export const entityDetailsQueryOptions = (
  cui: string,
  normalization: Normalization,
  reportPeriod: ReportPeriodInput,
  reportType?: GqlReportType,
  trendPeriod?: ReportPeriodInput
) =>
  queryOptions({
    queryKey: ['entityDetails', cui, normalization, reportPeriod, reportType, trendPeriod],
    queryFn: () => getEntityDetails(cui, normalization, reportPeriod, reportType, trendPeriod),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!cui,
  });

interface UseEntityDetailsProps {
  cui: string;
  normalization: Normalization;
  reportPeriod: ReportPeriodInput;
  reportType?: GqlReportType;
  trendPeriod?: ReportPeriodInput;
}

export function useEntityDetails(
  { cui, normalization, reportPeriod, reportType, trendPeriod }: UseEntityDetailsProps
) {
  return useQuery(entityDetailsQueryOptions(cui, normalization, reportPeriod, reportType, trendPeriod));
}