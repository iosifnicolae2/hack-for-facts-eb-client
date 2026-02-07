import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  getInsContexts,
  getInsCountyDashboard,
  getInsDatasetDimensions,
  getInsDatasetHistory,
  getInsDatasetsCatalog,
  getInsLatestDatasetValues,
  getInsObservationsSnapshotByDatasets,
  getInsUatDashboard,
  type InsDatasetHistoryResult,
  type InsObservationsSnapshotByDatasetResult,
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

function buildHash(payload: unknown): string {
  if (typeof payload === 'string') {
    return generateHash(payload);
  }
  return generateHash(JSON.stringify(payload));
}

function splitEnabled<T extends object>(params: T & { enabled?: boolean }): {
  enabled: boolean;
  queryParams: T;
} {
  const { enabled = true, ...queryParams } = params;
  return {
    enabled,
    queryParams: queryParams as T,
  };
}

function normalizeDatasetCodes(datasetCodes: string[]): string[] {
  return Array.from(new Set(datasetCodes.map((datasetCode) => datasetCode.trim().toUpperCase()).filter(Boolean)));
}

function createQueryOptions<TData>(params: {
  key: string;
  hashSource: unknown;
  queryFn: () => Promise<TData>;
  enabled: boolean;
  staleTime: number;
}) {
  return queryOptions<TData>({
    queryKey: [params.key, buildHash(params.hashSource)],
    queryFn: params.queryFn,
    enabled: params.enabled,
    staleTime: params.staleTime,
  });
}

export const insUatDashboardQueryOptions = (params: {
  sirutaCode: string;
  period?: string;
  contextCode?: string;
  enabled?: boolean;
}) => {
  const { enabled, queryParams } = splitEnabled(params);

  return createQueryOptions<InsDashboardData>({
    key: 'insUatDashboard',
    hashSource: queryParams,
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
  const { enabled, queryParams } = splitEnabled(params);

  return createQueryOptions<InsDashboardData>({
    key: 'insCountyDashboard',
    hashSource: queryParams,
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
  const { enabled, queryParams } = splitEnabled(params);

  return createQueryOptions<InsContextConnection>({
    key: 'insContexts',
    hashSource: queryParams,
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
  const { enabled, queryParams } = splitEnabled(params);

  return createQueryOptions<InsDatasetConnection>({
    key: 'insDatasetsCatalog',
    hashSource: queryParams,
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
  const { enabled, queryParams } = splitEnabled(params);
  const normalizedDatasetCode = queryParams.datasetCode.trim().toUpperCase();

  return createQueryOptions<InsDatasetDimensionsResult | null>({
    key: 'insDatasetDimensions',
    hashSource: normalizedDatasetCode,
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
  const { enabled, queryParams } = splitEnabled(params);

  return createQueryOptions<InsLatestDatasetValue[]>({
    key: 'insLatestDatasetValues',
    hashSource: queryParams,
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
  const { enabled, queryParams } = splitEnabled(params);

  return createQueryOptions<InsDatasetHistoryResult>({
    key: 'insDatasetHistory',
    hashSource: queryParams,
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

export const insObservationsSnapshotByDatasetsQueryOptions = (params: {
  datasetCodes: string[];
  filter: InsObservationFilterInput;
  limit?: number;
  enabled?: boolean;
}) => {
  const { enabled, queryParams } = splitEnabled(params);
  const normalizedDatasetCodes = normalizeDatasetCodes(queryParams.datasetCodes);
  const normalizedQueryParams = {
    ...queryParams,
    datasetCodes: normalizedDatasetCodes,
  };

  return createQueryOptions<InsObservationsSnapshotByDatasetResult>({
    key: 'insObservationsSnapshotByDatasets',
    hashSource: normalizedQueryParams,
    queryFn: () => getInsObservationsSnapshotByDatasets(normalizedQueryParams),
    enabled: enabled && normalizedDatasetCodes.length > 0,
    staleTime: DEFAULT_STALE_TIME,
  });
};

export function useInsObservationsSnapshotByDatasets(params: {
  datasetCodes: string[];
  filter: InsObservationFilterInput;
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery(insObservationsSnapshotByDatasetsQueryOptions(params));
}
