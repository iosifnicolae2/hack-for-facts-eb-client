export type InsPeriodicity = 'ANNUAL' | 'QUARTERLY' | 'MONTHLY';
export type InsTerritoryLevel = 'NATIONAL' | 'NUTS1' | 'NUTS2' | 'NUTS3' | 'LAU';

export interface InsTimePeriod {
  iso_period: string;
  year: number;
  quarter?: number | null;
  month?: number | null;
  periodicity: InsPeriodicity;
}

export interface InsTerritory {
  code?: string | null;
  siruta_code?: string | null;
  level?: InsTerritoryLevel | string | null;
  name_ro?: string | null;
}

export interface InsUnit {
  code?: string | null;
  symbol?: string | null;
  name_ro?: string | null;
}

export interface InsClassification {
  id?: string | null;
  type_code?: string | null;
  type_name_ro?: string | null;
  type_name_en?: string | null;
  code?: string | null;
  name_ro?: string | null;
  name_en?: string | null;
  sort_order?: number | null;
}

export type InsDimensionType = 'TEMPORAL' | 'TERRITORIAL' | 'CLASSIFICATION' | 'UNIT_OF_MEASURE';

export interface InsClassificationTypeRef {
  code: string;
  name_ro?: string | null;
  name_en?: string | null;
}

export interface InsDatasetDimension {
  index: number;
  type: InsDimensionType;
  label_ro?: string | null;
  label_en?: string | null;
  classification_type?: InsClassificationTypeRef | null;
}

export interface InsDatasetDimensionsResult {
  datasetCode: string;
  dimensions: InsDatasetDimension[];
}

export interface InsObservation {
  dataset_code: string;
  value: string | null;
  value_status?: string | null;
  time_period: InsTimePeriod;
  territory?: InsTerritory | null;
  unit?: InsUnit | null;
  classifications?: InsClassification[] | null;
  dimensions?: Record<string, unknown> | null;
}

export interface InsDataset {
  id: string;
  code: string;
  name_ro?: string | null;
  name_en?: string | null;
  definition_ro?: string | null;
  definition_en?: string | null;
  periodicity: InsPeriodicity[];
  year_range?: number[] | null;
  dimension_count?: number | null;
  has_uat_data: boolean;
  has_county_data: boolean;
  has_siruta: boolean;
  sync_status?: string | null;
  last_sync_at?: string | null;
  context_code?: string | null;
  context_name_ro?: string | null;
  context_name_en?: string | null;
  context_path?: string | null;
  metadata?: Record<string, unknown> | null;
  dimensions?: InsDatasetDimension[] | null;
}

export interface InsUatDatasetGroup {
  dataset: InsDataset;
  observations: InsObservation[];
  latestPeriod?: string | null;
}

export interface PageInfo {
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InsObservationConnection {
  nodes: InsObservation[];
  pageInfo: PageInfo;
}

export interface InsDashboardData {
  groups: InsUatDatasetGroup[];
  partial: boolean;
}

export interface InsObservationFilterInput {
  territoryCodes?: string[];
  sirutaCodes?: string[];
  territoryLevels?: InsTerritoryLevel[];
  unitCodes?: string[];
  classificationValueCodes?: string[];
  classificationTypeCodes?: string[];
  periodicity?: InsPeriodicity;
  years?: number[];
  quarters?: number[];
  months?: number[];
  period?: string;
  periodRange?: {
    start: string;
    end: string;
  };
  hasValue?: boolean;
}

export interface InsContext {
  id: string;
  code: string;
  name_ro?: string | null;
  name_en?: string | null;
  name_ro_markdown?: string | null;
  name_en_markdown?: string | null;
  level?: number | null;
  parent_id?: number | null;
  parent_code?: string | null;
  path: string;
  matrix_count?: number | null;
}

export interface InsContextFilterInput {
  search?: string;
  level?: number;
  parentCode?: string;
  rootContextCode?: string;
}

export interface InsContextConnection {
  nodes: InsContext[];
  pageInfo: PageInfo;
}

export interface InsDatasetFilterInput {
  search?: string;
  codes?: string[];
  contextCode?: string;
  rootContextCode?: string;
  periodicity?: InsPeriodicity[];
  hasUatData?: boolean;
  hasCountyData?: boolean;
}

export interface InsDatasetConnection {
  nodes: InsDataset[];
  pageInfo: PageInfo;
}

export interface InsEntitySelectorInput {
  sirutaCode?: string;
  territoryCode?: string;
  territoryLevel?: InsTerritoryLevel;
}

export type InsLatestMatchStrategy =
  | 'PREFERRED_CLASSIFICATION'
  | 'TOTAL_FALLBACK'
  | 'REPRESENTATIVE_FALLBACK'
  | 'NO_DATA';

export interface InsLatestDatasetValue {
  dataset: InsDataset;
  observation?: InsObservation | null;
  latestPeriod?: string | null;
  matchStrategy: InsLatestMatchStrategy;
  hasData: boolean;
}
