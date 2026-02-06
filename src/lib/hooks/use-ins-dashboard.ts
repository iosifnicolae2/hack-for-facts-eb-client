import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  getInsContexts,
  getInsCountyDashboard,
  getInsDatasetDimensions,
  getInsDatasetHistory,
  getInsDatasetsCatalog,
  getInsLatestDatasetValues,
  getInsUatDashboard,
  type InsDatasetHistoryResult,
} from '@/lib/api/ins';
import { generateHash } from '@/lib/utils';
import type {
  InsContextConnection,
  InsContextFilterInput,
  InsDashboardData,
  InsDatasetConnection,
  InsDatasetDimensionsResult,
  InsDatasetFilterInput,
  InsEntitySelectorInput,
  InsLatestDatasetValue,
  InsObservationFilterInput,
} from '@/schemas/ins';

const DEFAULT_STALE_TIME = 1000 * 60 * 15;
const LONG_STALE_TIME = 1000 * 60 * 60 * 24;

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

export const insContextsQueryOptions = (params: {
  filter?: InsContextFilterInput;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params;
  const hash = generateHash(JSON.stringify(queryParams));

  return queryOptions<InsContextConnection>({
    queryKey: ['insContexts', hash],
    queryFn: () => getInsContexts(queryParams),
    enabled,
    staleTime: LONG_STALE_TIME,
  });
};

export function useInsContexts(params: {
  filter?: InsContextFilterInput;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  return useQuery(insContextsQueryOptions(params));
}

export const insDatasetCatalogQueryOptions = (params: {
  filter?: InsDatasetFilterInput;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params;
  const hash = generateHash(JSON.stringify(queryParams));

  return queryOptions<InsDatasetConnection>({
    queryKey: ['insDatasetsCatalog', hash],
    queryFn: () => getInsDatasetsCatalog(queryParams),
    enabled,
    staleTime: LONG_STALE_TIME,
  });
};

export function useInsDatasetCatalog(params: {
  filter?: InsDatasetFilterInput;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  return useQuery(insDatasetCatalogQueryOptions(params));
}

export const insDatasetDimensionsQueryOptions = (params: {
  datasetCode: string;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params;
  const normalizedDatasetCode = queryParams.datasetCode.trim().toUpperCase();
  const hash = generateHash(normalizedDatasetCode);

  return queryOptions<InsDatasetDimensionsResult | null>({
    queryKey: ['insDatasetDimensions', hash],
    queryFn: () => getInsDatasetDimensions(normalizedDatasetCode),
    enabled: enabled && normalizedDatasetCode.length > 0,
    staleTime: LONG_STALE_TIME,
  });
};

export function useInsDatasetDimensions(params: {
  datasetCode: string;
  enabled?: boolean;
}) {
  return useQuery(insDatasetDimensionsQueryOptions(params));
}

export const insLatestDatasetValuesQueryOptions = (params: {
  entity: InsEntitySelectorInput;
  datasetCodes: string[];
  preferredClassificationCodes?: string[];
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params;
  const hash = generateHash(JSON.stringify(queryParams));

  return queryOptions<InsLatestDatasetValue[]>({
    queryKey: ['insLatestDatasetValues', hash],
    queryFn: () => getInsLatestDatasetValues(queryParams),
    enabled: enabled && queryParams.datasetCodes.length > 0,
    staleTime: DEFAULT_STALE_TIME,
  });
};

export function useInsLatestDatasetValues(params: {
  entity: InsEntitySelectorInput;
  datasetCodes: string[];
  preferredClassificationCodes?: string[];
  enabled?: boolean;
}) {
  return useQuery(insLatestDatasetValuesQueryOptions(params));
}

export const insDatasetHistoryQueryOptions = (params: {
  datasetCode: string;
  filter: InsObservationFilterInput;
  pageSize?: number;
  maxPages?: number;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params;
  const hash = generateHash(JSON.stringify(queryParams));

  return queryOptions<InsDatasetHistoryResult>({
    queryKey: ['insDatasetHistory', hash],
    queryFn: () => getInsDatasetHistory(queryParams),
    enabled: enabled && queryParams.datasetCode.trim().length > 0,
    staleTime: DEFAULT_STALE_TIME,
  });
};

export function useInsDatasetHistory(params: {
  datasetCode: string;
  filter: InsObservationFilterInput;
  pageSize?: number;
  maxPages?: number;
  enabled?: boolean;
}) {
  return useQuery(insDatasetHistoryQueryOptions(params));
}
