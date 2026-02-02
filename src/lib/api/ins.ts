import { createLogger } from '../logger';
import { graphqlRequest } from './graphql';
import type {
  InsDataset,
  InsObservation,
  InsObservationConnection,
  InsObservationFilterInput,
  InsUatDatasetGroup,
  InsDashboardData,
} from '@/schemas/ins';

const logger = createLogger('ins-api');

const INS_UAT_DASHBOARD_LIMIT = 2000;
const INS_OBSERVATION_LIMIT = 200;

const INS_DATASET_FIELDS = `
  id
  code
  name_ro
  name_en
  definition_ro
  definition_en
  periodicity
  year_range
  dimension_count
  has_uat_data
  has_county_data
  has_siruta
  sync_status
  last_sync_at
  context_code
  context_name_ro
  context_name_en
  context_path
  metadata
`;

const INS_OBSERVATION_FIELDS = `
  dataset_code
  value
  value_status
  time_period { iso_period year quarter month periodicity }
  territory { code siruta_code level name_ro }
  unit { code symbol name_ro }
  classifications { type_code code name_ro }
`;

const INS_UAT_DASHBOARD_QUERY = `
  query InsUatDashboard($sirutaCode: String!, $period: PeriodDate, $contextCode: String) {
    insUatDashboard(sirutaCode: $sirutaCode, period: $period, contextCode: $contextCode) {
      latestPeriod
      dataset { ${INS_DATASET_FIELDS} }
      observations { ${INS_OBSERVATION_FIELDS} }
    }
  }
`;

const INS_DATASETS_BY_CODES_QUERY = `
  query InsDatasetsByCodes($codes: [String!], $limit: Int) {
    insDatasets(filter: { codes: $codes }, limit: $limit, offset: 0) {
      nodes { ${INS_DATASET_FIELDS} }
    }
  }
`;

function buildInsObservationsBatchQuery(datasetCodes: string[]) {
  const aliasMap: Record<string, string> = {};
  const fields = datasetCodes.map((code, index) => {
    const alias = `d${index}`;
    aliasMap[alias] = code;
    return `${alias}: insObservations(datasetCode: "${code}", filter: $filter, limit: $limit, offset: 0) {\n` +
      `  nodes { ${INS_OBSERVATION_FIELDS} }\n` +
      `  pageInfo { totalCount hasNextPage hasPreviousPage }\n` +
      `}`;
  }).join('\n');

  const query = `
    query InsObservationsBatch($filter: InsObservationFilterInput, $limit: Int) {
      ${fields}
    }
  `;

  return { query, aliasMap };
}

export async function getInsUatDashboard(params: {
  sirutaCode: string;
  period?: string;
  contextCode?: string;
}): Promise<InsDashboardData> {
  logger.info('Fetching INS UAT dashboard', params);

  const response = await graphqlRequest<{ insUatDashboard: InsUatDatasetGroup[] }>(
    INS_UAT_DASHBOARD_QUERY,
    {
      sirutaCode: params.sirutaCode,
      period: params.period,
      contextCode: params.contextCode,
    }
  );

  const groups = response.insUatDashboard ?? [];
  const totalObservations = groups.reduce((total, group) => total + group.observations.length, 0);

  return {
    groups,
    partial: totalObservations >= INS_UAT_DASHBOARD_LIMIT,
  };
}

export async function getInsDatasetsByCodes(codes: string[]): Promise<InsDataset[]> {
  if (codes.length === 0) return [];

  logger.info('Fetching INS datasets by codes', { count: codes.length });

  const response = await graphqlRequest<{ insDatasets: { nodes: InsDataset[] } }>(
    INS_DATASETS_BY_CODES_QUERY,
    {
      codes,
      limit: Math.min(codes.length, 200),
    }
  );

  return response.insDatasets.nodes ?? [];
}

async function getInsObservationsBatch(params: {
  datasetCodes: string[];
  filter: InsObservationFilterInput;
  limit?: number;
}): Promise<Map<string, InsObservationConnection>> {
  if (params.datasetCodes.length === 0) return new Map();

  const { query, aliasMap } = buildInsObservationsBatchQuery(params.datasetCodes);
  const response = await graphqlRequest<Record<string, InsObservationConnection>>(query, {
    filter: params.filter,
    limit: params.limit ?? INS_OBSERVATION_LIMIT,
  });

  const result = new Map<string, InsObservationConnection>();
  for (const [alias, connection] of Object.entries(response)) {
    const datasetCode = aliasMap[alias];
    if (datasetCode) {
      result.set(datasetCode, connection);
    }
  }

  return result;
}

function getLatestPeriod(observations: InsObservation[]): string | null {
  let latestPeriod: string | null = null;
  let latestKey: number | null = null;

  for (const observation of observations) {
    const period = observation.time_period;
    const key = period.year * 10000 + (period.quarter ?? 0) * 100 + (period.month ?? 0);
    if (latestKey === null || key > latestKey) {
      latestKey = key;
      latestPeriod = period.iso_period;
    }
  }

  return latestPeriod;
}

export async function getInsCountyDashboard(params: {
  countyCode: string;
  datasetCodes: string[];
}): Promise<InsDashboardData> {
  const datasetCodes = params.datasetCodes;
  if (datasetCodes.length === 0) return { groups: [], partial: false };

  const normalizedCountyCode = params.countyCode.trim().toUpperCase();
  if (normalizedCountyCode.length === 0) {
    return { groups: [], partial: false };
  }

  const observationFilter: InsObservationFilterInput = {
    territoryCodes: [normalizedCountyCode],
    territoryLevels: ['NUTS3'],
  };

  logger.info('Fetching INS county dashboard', {
    countyCode: normalizedCountyCode,
    filterMode: 'territoryCode',
    datasetCount: datasetCodes.length,
  });

  const datasets = await getInsDatasetsByCodes(datasetCodes);
  const datasetMap = new Map(datasets.map((dataset) => [dataset.code, dataset]));

  const buildGroups = (observationsMap: Map<string, InsObservationConnection>) => {
    const groups: InsUatDatasetGroup[] = [];
    let partial = false;

    for (const code of datasetCodes) {
      const dataset = datasetMap.get(code);
      const connection = observationsMap.get(code);
      if (!dataset || !connection) continue;
      if (!dataset.has_county_data) continue;
      if (connection.pageInfo?.hasNextPage) {
        partial = true;
      }

      const observations = connection.nodes ?? [];
      if (observations.length === 0) continue;

      groups.push({
        dataset,
        observations,
        latestPeriod: getLatestPeriod(observations),
      });
    }

    return { groups, partial };
  };

  const observationsByDataset = await getInsObservationsBatch({
    datasetCodes,
    filter: observationFilter,
  });

  return buildGroups(observationsByDataset);
}
