import { useQuery, queryOptions } from '@tanstack/react-query';
import { getEntityDetails, getEntityExecutionLineItems, getEntityRelationships, getEntityReports, getReportsConnection, ReportsFilterInput, ReportConnection } from '@/lib/api/entities';
import { Normalization } from '@/schemas/charts';
import { ReportPeriodInput, GqlReportType } from '@/schemas/reporting';
import { generateHash } from '../utils';

export const entityDetailsQueryOptions = (
  cui: string,
  normalization: Normalization,
  reportPeriod: ReportPeriodInput,
  reportType?: GqlReportType,
  trendPeriod?: ReportPeriodInput,
  mainCreditorCui?: string,
) => {

  const payloadString = JSON.stringify({ cui, normalization, reportPeriod, reportType, trendPeriod, mainCreditorCui });
  const hash = generateHash(payloadString);

  return queryOptions({
    queryKey: ['entityDetails', hash],
    queryFn: () => getEntityDetails(cui, normalization, reportPeriod, reportType, trendPeriod, mainCreditorCui),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!cui,
  });

}
interface UseEntityDetailsProps {
  cui: string;
  normalization: Normalization;
  reportPeriod: ReportPeriodInput;
  reportType?: GqlReportType;
  trendPeriod?: ReportPeriodInput;
  mainCreditorCui?: string;
}

export function useEntityDetails(
  { cui, normalization, reportPeriod, reportType, trendPeriod, mainCreditorCui }: UseEntityDetailsProps
) {
  return useQuery(entityDetailsQueryOptions(cui, normalization, reportPeriod, reportType, trendPeriod, mainCreditorCui));
}

// Lazy hooks for heavy data

export function useEntityExecutionLineItems(params: {
  cui: string;
  normalization: Normalization;
  reportPeriod: ReportPeriodInput;
  reportType?: GqlReportType;
  enabled?: boolean;
  mainCreditorCui?: string;
}) {
  const { cui, normalization, reportPeriod, reportType, enabled = true, mainCreditorCui } = params;
  return useQuery({
    queryKey: ['entityLineItems', cui, normalization, reportPeriod, reportType, mainCreditorCui],
    queryFn: () => getEntityExecutionLineItems(cui, normalization, reportPeriod, reportType, mainCreditorCui),
    enabled: !!cui && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEntityRelationships(params: { cui: string; enabled?: boolean }) {
  const { cui, enabled = true } = params;
  return useQuery({
    queryKey: ['entityRelationships', cui],
    queryFn: () => getEntityRelationships(cui),
    enabled: !!cui && enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useEntityReports(params: { cui: string; limit?: number; offset?: number; year?: number; period?: string; type?: GqlReportType; sort?: { by: string; order: 'ASC' | 'DESC' }; enabled?: boolean }) {
  const { cui, limit, offset, year, period, type, sort, enabled = true } = params;
  return useQuery({
    queryKey: ['entityReports', cui, limit, offset, year, period, type, sort],
    queryFn: () => getEntityReports(cui, { limit, offset, year, period, type, sort }),
    enabled: !!cui && enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useReportsConnection(params: { filter: ReportsFilterInput; limit?: number; offset?: number; enabled?: boolean }) {
  const { filter, limit = 10, offset = 0, enabled = true } = params;
  return useQuery<ReportConnection>({
    queryKey: ['reportsConnection', filter, limit, offset],
    queryFn: () => getReportsConnection(filter, limit, offset),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}