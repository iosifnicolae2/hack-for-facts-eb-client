import { createLogger } from "../logger";
import { graphqlRequest } from "./graphql";
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from "@/schemas/heatmap";
import { BudgetLineItem, PaginatedResult, EntityData, AggregatedBudgetData, GetDataParams } from "@/schemas/dataDiscovery";
import { MapFilters } from "@/schemas/map-filters";

const logger = createLogger("data-discovery-api");

interface HeatmapUATDataApiResponse {
  heatmapUATData: HeatmapUATDataPoint[];
}

interface HeatmapJudetDataApiResponse {
  heatmapJudetData: HeatmapJudetDataPoint[];
}
// --- END HEATMAP TYPES ---

const GET_HEATMAP_JUDET_DATA_QUERY = `
  query GetHeatmapJudetData($filter: AnalyticsFilterInput!) {
    heatmapJudetData(filter: $filter) {
      county_code
      county_name
      county_population
      total_amount
      per_capita_amount
      county_entity {
        cui
        name
      }
    }
  }
`;

// Query to get entities with filtering
const GET_ENTITIES_QUERY = `
  query GetEntities($filter: EntityFilter, $limit: Int, $offset: Int) {
    entities(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        cui
        name
        entity_type
        uat {
          name
          county_code
          region
          population
        }
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Query to get execution line items with filtering
const GET_EXECUTION_LINE_ITEMS_QUERY = `
  query GetExecutionLineItems($filter: AnalyticsFilterInput, $sort: SortOrder, $limit: Int, $offset: Int) {
    executionLineItems(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      nodes {
        line_item_id
        report_id
        functional_code
        economic_code
        amount
        year
        account_category
        entity {
          cui
          name
        }
        functionalClassification {
          functional_name
        }
        economicClassification {
          economic_name
        }
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// --- BEGIN HEATMAP QUERY ---
const GET_HEATMAP_UAT_DATA_QUERY = `
  query GetHeatmapUATData($filter: AnalyticsFilterInput!) {
    heatmapUATData(filter: $filter) {
      uat_id
      uat_name
      uat_code
      siruta_code
      county_code
      county_name
      population
      amount
      total_amount
      per_capita_amount
    }
  }
`;
// --- END HEATMAP QUERY ---

export async function getEntities({
  filters,
  page = 1,
  pageSize = 50,
}: GetDataParams): Promise<PaginatedResult<EntityData>> {
  logger.info("Fetching entities with filters", { filters, page, pageSize });
  try {
    const offset = (page - 1) * pageSize;

    const response = await graphqlRequest<{
      entities: {
        nodes: EntityData[];
        pageInfo: {
          totalCount: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      };
    }>(GET_ENTITIES_QUERY, {
      filter: filters,
      limit: pageSize,
      offset,
    });
    
    const { nodes, pageInfo } = response.entities;
    const totalPages = Math.ceil(pageInfo.totalCount / pageSize);

    return {
      data: nodes,
      totalCount: pageInfo.totalCount,
      hasNextPage: pageInfo.hasNextPage,
      hasPreviousPage: pageInfo.hasPreviousPage,
      currentPage: page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    logger.error("Error fetching entities", { error });
    throw error;
  }
}

export async function getBudgetLineItems({
  filters,
  sort,
  page = 1,
  pageSize = 100,
}: GetDataParams): Promise<PaginatedResult<BudgetLineItem>> {
  logger.info("Fetching budget line items with filters", {
    filters,
    page,
    pageSize,
    sort,
  });

  try {
    const offset = (page - 1) * pageSize;
    const response = await graphqlRequest<{
      executionLineItems: {
        nodes: BudgetLineItem[];
        pageInfo: {
          totalCount: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      };
    }>(GET_EXECUTION_LINE_ITEMS_QUERY, {
      filter: filters,
      sort: sort?.by ? sort : undefined,
      limit: pageSize,
      offset,
    });

    const { nodes, pageInfo } = response.executionLineItems;
    const totalPages = Math.ceil(pageInfo.totalCount / pageSize);

    // Transform response to match our expected format
    const data = nodes.map((item) => ({
      ...item,
      entity_name: item.entity?.name,
      entity_cui: item.entity?.cui,
      functional_name: item.functionalClassification?.functional_name,
      economic_name: item.economicClassification?.economic_name,
    }));

    return {
      data,
      totalCount: pageInfo.totalCount,
      hasNextPage: pageInfo.hasNextPage,
      hasPreviousPage: pageInfo.hasPreviousPage,
      currentPage: page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    logger.error("Error fetching budget line items", { error });
    // Return empty paginated result in case of error
    return {
      data: [],
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      currentPage: page,
      pageSize,
      totalPages: 0,
    };
  }
}

export async function getAggregatedData({
  filters,
}: GetDataParams): Promise<AggregatedBudgetData[]> {
  logger.info("Fetching aggregated data with filters", { filters });

  try {
    // For aggregation, we need a reasonable amount of data but still with pagination
    const result = await getBudgetLineItems({
      filters,
      page: 1,
      pageSize: 500, // Limit to 500 items for aggregation
      sort: {
        by: "amount",
        order: "desc",
      },
    });

    const budgetItems = result.data;

    if (budgetItems.length === 0) {
      return [];
    }

    // Group by functional code and aggregate
    const functionalGroups = budgetItems.reduce((acc, item) => {
      if (!item.functional_code || !item.functional_name) return acc;

      const existingGroup = acc.find(
        (group) => group.id === item.functional_code
      );

      if (existingGroup) {
        existingGroup.value += item.amount;
      } else {
        acc.push({
          id: item.functional_code,
          category: "functional",
          name: item.functional_name,
          value: item.amount,
          percentage: 0, // Will calculate after sum is known
        });
      }

      return acc;
    }, [] as AggregatedBudgetData[]);

    // Calculate total and percentages
    const total = functionalGroups.reduce((sum, group) => sum + group.value, 0);
    functionalGroups.forEach((group) => {
      group.percentage = Math.round((group.value / total) * 100);
    });

    // Sort by value descending
    return functionalGroups.sort((a, b) => b.value - a.value);
  } catch (error) {
    logger.error("Error fetching aggregated data", { error });
    return [];
  }
}

// Functions to get metadata for filters

export async function getUniqueFunctionalCategories(): Promise<
  { code: string; name: string }[]
> {
  try {
    // Use GraphQL query instead of fetching all budget items
    const response = await graphqlRequest<{
      functionalClassifications: {
        functional_code: string;
        functional_name: string;
      }[];
    }>(`
      query GetFunctionalClassifications {
        functionalClassifications {
          functional_code
          functional_name
        }
      }
    `);

    return response.functionalClassifications
      .map((fc) => ({
        code: fc.functional_code,
        name: fc.functional_name,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    logger.error("Error fetching functional categories", { error });
    return [];
  }
}

export async function getUniqueEconomicCategories(): Promise<
  { code: string; name: string }[]
> {
  try {
    // Use GraphQL query instead of fetching all budget items
    const response = await graphqlRequest<{
      economicClassifications: {
        economic_code: string;
        economic_name: string;
      }[];
    }>(`
      query GetEconomicClassifications {
        economicClassifications {
          economic_code
          economic_name
        }
      }
    `);

    return response.economicClassifications
      .map((ec) => ({
        code: ec.economic_code,
        name: ec.economic_name,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    logger.error("Error fetching economic categories", { error });
    return [];
  }
}

export async function getUniqueEntityTypes(): Promise<string[]> {
  try {
    // Get just the entity types, limited by pagination
    const result = await getEntities({
      filters: {
      },
      page: 1,
      pageSize: 100, // Fetch enough entities to get a good sample of types
    });

    return Array.from(new Set(result.data.map((entity) => entity.entity_type).filter(Boolean) as string[]));
  } catch (error) {
    logger.error("Error fetching entity types", { error });
    return [];
  }
}

export async function getUniqueCounties(): Promise<
  { code: string; name: string }[]
> {
  try {
    // Get counties, limited by pagination
    const result = await getEntities({
      filters: {
      },
      page: 1,
      pageSize: 250 // Fetch more entities to get a wider range of countie
    });

    const uniqueCodes = new Set<string>();
    const counties: { code: string; name: string }[] = [];

    result.data.forEach((entity) => {
      // Access county info from the nested uat object
      const countyCode = entity.uat?.county_code;
      const countyName = entity.uat?.county_name;

      if (countyCode && countyName && !uniqueCodes.has(countyCode)) {
        uniqueCodes.add(countyCode);
        counties.push({
          code: countyCode,
          name: countyName,
        });
      }
    });

    return counties.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    logger.error("Error fetching counties", { error });
    return [];
  }
}

// --- BEGIN GET HEATMAP UAT DATA FUNCTION ---
function mapFiltersToAnalyticsFilter(filter: MapFilters) {
  return {
    years: filter.years,
    account_category: (filter.account_categories?.[0] ?? 'ch') as 'ch' | 'vn',
    normalization: filter.normalization,
    functional_codes: filter.functional_codes,
    economic_codes: filter.economic_codes,
    county_codes: filter.county_codes,
    regions: filter.regions,
    // Map UI aggregated amount range to aggregate_* thresholds for heatmaps
    aggregate_min_amount: filter.min_amount,
    aggregate_max_amount: filter.max_amount,
    min_population: filter.min_population,
    max_population: filter.max_population,
  } as const;
}

export async function getHeatmapUATData(
  filter: MapFilters
): Promise<HeatmapUATDataPoint[]> {
  logger.info("Fetching heatmap UAT data with filter", { filter });

  try {
    const response = await graphqlRequest<HeatmapUATDataApiResponse>(
      GET_HEATMAP_UAT_DATA_QUERY,
      { filter: mapFiltersToAnalyticsFilter(filter) }
    );

    if (!response || !response.heatmapUATData) {
      logger.warn("Received null or undefined response for heatmapUATData", {
        response,
      });
      // Consider throwing an error or returning a default/empty state
      // depending on how callers should handle this.
      // For now, returning empty array if data is not in the expected shape.
      return [];
    }

    return response.heatmapUATData;
  } catch (error) {
    logger.error("Error fetching heatmap UAT data", { error, filter });
    throw error; // Re-throw the error to be handled by the caller
  }
}
// --- END GET HEATMAP UAT DATA FUNCTION ---

// --- BEGIN GET HEATMAP JUDET DATA FUNCTION ---
export async function getHeatmapJudetData(
  filter: MapFilters
): Promise<HeatmapJudetDataPoint[]> {
  logger.info("Fetching heatmap JUDET data with filter", { filter });

  try {
    const response = await graphqlRequest<HeatmapJudetDataApiResponse>(
      GET_HEATMAP_JUDET_DATA_QUERY,
      { filter: mapFiltersToAnalyticsFilter(filter) }
    );

    if (!response || !response.heatmapJudetData) {
      logger.warn("Received null or undefined response for heatmapJudetData", {
        response,
      });
      return [];
    }

    return response.heatmapJudetData;
  } catch (error) {
    logger.error("Error fetching heatmap JUDET data", { error, filter });
    throw error;
  }
}
// --- END GET HEATMAP JUDET DATA FUNCTION ---

