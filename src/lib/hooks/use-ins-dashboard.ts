import { queryOptions, useQuery } from '@tanstack/react-query';
import { getInsCountyDashboard, getInsUatDashboard } from '@/lib/api/ins';
import { generateHash } from '@/lib/utils';
import type { InsDashboardData } from '@/schemas/ins';

const DEFAULT_STALE_TIME = 1000 * 60 * 15;

export const insUatDashboardQueryOptions = (params: {
  sirutaCode: string;
  period?: string;
  contextCode?: string;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params;
  const hash = generateHash(JSON.stringify(queryParams));

  return queryOptions<InsDashboardData>({
    queryKey: ['insUatDashboard', hash],
    queryFn: () => getInsUatDashboard(queryParams),
    enabled: enabled && !!queryParams.sirutaCode,
    staleTime: DEFAULT_STALE_TIME,
  });
};

export function useInsUatDashboard(params: {
  sirutaCode: string;
  period?: string;
  contextCode?: string;
  enabled?: boolean;
}) {
  return useQuery(insUatDashboardQueryOptions(params));
}

export const insCountyDashboardQueryOptions = (params: {
  countyCode: string;
  datasetCodes: string[];
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params;
  const hash = generateHash(JSON.stringify(queryParams));

  return queryOptions<InsDashboardData>({
    queryKey: ['insCountyDashboard', hash],
    queryFn: () => getInsCountyDashboard(queryParams),
    enabled: enabled && queryParams.countyCode.trim().length > 0 && queryParams.datasetCodes.length > 0,
    staleTime: DEFAULT_STALE_TIME,
  });
};

export function useInsCountyDashboard(params: {
  countyCode: string;
  datasetCodes: string[];
  enabled?: boolean;
}) {
  return useQuery(insCountyDashboardQueryOptions(params));
}
