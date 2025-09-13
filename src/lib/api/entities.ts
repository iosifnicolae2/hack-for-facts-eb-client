import { graphqlRequest } from "./graphql";
import { createLogger } from "../logger";
import { EntitySearchResult, EntitySearchNode } from "@/schemas/entities";
import { Normalization, AnalyticsSeries } from '@/schemas/charts';
import { GqlReportType, ReportPeriodInput } from "@/schemas/reporting";

const logger = createLogger("entities-api");


export interface ExecutionLineItem {
  line_item_id: string;
  account_category: 'vn' | 'ch';
  functionalClassification?: {
    functional_name: string;
    functional_code: string;
  };
  economicClassification?: {
    economic_name: string;
    economic_code: string;
  } | null;
  ytd_amount: number;
  quarterly_amount: number;
  monthly_amount: number;
  // Client-computed unified amount for UI, based on the period type
  // Ex: yearly: amount <= ytd_amount, quarterly: amount <= quarterly_amount, monthly: amount <= monthly_amount
  amount: number;
}

export interface EntityDetailsData {
  cui: string;
  name: string;
  address?: string | null;
  default_report_type: GqlReportType;
  entity_type?: string | null;
  is_uat?: boolean | null;
  uat?: {
    county_name?: string | null;
    county_code?: string | null;
    name?: string | null;
    siruta_code?: number | null;
    population?: number | null;
    county_entity?: {
      cui: string;
      name: string;
    } | null;
  } | null;
  children: {
    cui: string;
    name: string;
  }[];
  parents: {
    cui: string;
    name: string;
  }[];
  totalIncome?: number | null;
  totalExpenses?: number | null;
  budgetBalance?: number | null;
  incomeTrend?: AnalyticsSeries | null;
  expenseTrend?: AnalyticsSeries | null;
  balanceTrend?: AnalyticsSeries | null;
  executionLineItems?: {
    nodes: ExecutionLineItem[];
  } | null;
  reports: {
    nodes: {
      report_id: string;
      reporting_year: number;
      report_type: string;
      report_date: string;
      download_links: string[];
      main_creditor: {
        cui: string;
        name: string;
      };
    }[];
  } | null;
}

// removed old EntityDetailsResponse; response shape is declared inline below

const GET_ENTITY_DETAILS_QUERY = `
  query GetEntityDetails($cui: ID!, $normalization: Normalization, $reportPeriod: ReportPeriodInput!, $reportType: ReportType, $trendPeriod: ReportPeriodInput!) {
    entity(cui: $cui) {
      cui
      name
      address
      default_report_type
      entity_type
      is_uat
      uat {
        county_name
        county_code
        name
        siruta_code
        population
        county_entity{
          cui
          name
        }
      }
      children {
        cui
        name
      }
      parents {
        cui
        name
      }
      totalIncome(period: $reportPeriod)
      totalExpenses(period: $reportPeriod)
      budgetBalance(period: $reportPeriod)
      incomeTrend(period: $trendPeriod, reportType: $reportType, normalization: $normalization) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
      expenseTrend: expensesTrend(period: $trendPeriod, reportType: $reportType, normalization: $normalization) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
      balanceTrend(period: $trendPeriod, reportType: $reportType, normalization: $normalization) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
      reports(limit: 100) {
        nodes {
          report_id
          reporting_year
          report_type
          report_date
          download_links
          main_creditor {
            cui
            name
          }
        }
        pageInfo {
          totalCount
          hasNextPage
        }
      }
      executionLineItemsCh: executionLineItems(
        filter: { 
          account_category: ch,
          report_period: $reportPeriod
        }
        sort: { by: "amount", order: "DESC" }
        limit: 1000
      ) {
        nodes {
          line_item_id
          account_category
          functionalClassification {
            functional_name
            functional_code
          }
          economicClassification {
            economic_name
            economic_code
          }
          ytd_amount
          quarterly_amount
          monthly_amount
        }
      }
      executionLineItemsVn: executionLineItems(
        filter: { 
          account_category: vn,
          report_period: $reportPeriod
        }
        sort: { by: "amount", order: "DESC" }
        limit: 1000
      ) {
        nodes {
          line_item_id
          account_category
          functionalClassification {
            functional_name
            functional_code
          }
          economicClassification {
            economic_name
            economic_code
          }
          ytd_amount
          quarterly_amount
          monthly_amount
        }
      }
    }
  }
`;

export async function getEntityDetails(
  cui: string,
  normalization: Normalization = 'total',
  reportPeriod: ReportPeriodInput,
  reportType?: GqlReportType,
  trendPeriod?: ReportPeriodInput
): Promise<EntityDetailsData | null> {
  logger.info(`Fetching entity details for CUI: ${cui}`);

  try {
    const response = await graphqlRequest<{
      entity: (Omit<EntityDetailsData, 'incomeTrend' | 'expenseTrend' | 'balanceTrend'> & {
        incomeTrend?: AnalyticsSeries | null;
        expenseTrend?: AnalyticsSeries | null;
        balanceTrend?: AnalyticsSeries | null;
        executionLineItemsCh?: { nodes: ExecutionLineItem[] } | null;
        executionLineItemsVn?: { nodes: ExecutionLineItem[] } | null;
      }) | null;
    }>(
      GET_ENTITY_DETAILS_QUERY,
      { cui, normalization, reportPeriod, reportType, trendPeriod: trendPeriod ?? reportPeriod }
    );

    if (!response || !response.entity) {
      logger.warn("Received null or undefined response for entity details", {
        response,
        cui,
      });
      return null;
    }

    // Merge aliased execution line items, and compute unified `amount` field per current report period
    const periodType = reportPeriod.type
    const mapWithAmount = (n: any): ExecutionLineItem => {
      const amount = periodType === 'YEAR'
        ? Number(n?.ytd_amount ?? 0)
        : periodType === 'QUARTER'
          ? Number(n?.quarterly_amount ?? 0)
          : Number(n?.monthly_amount ?? 0)
      return { ...n, amount } as ExecutionLineItem
    }
    const mergedNodes: ExecutionLineItem[] = [
      ...(response.entity.executionLineItemsCh?.nodes ?? []),
      ...(response.entity.executionLineItemsVn?.nodes ?? []),
    ].map(mapWithAmount)

    const merged: EntityDetailsData = {
      ...response.entity,
      incomeTrend: response.entity.incomeTrend ?? null,
      expenseTrend: response.entity.expenseTrend ?? null,
      balanceTrend: response.entity.balanceTrend ?? null,
      executionLineItems: {
        nodes: mergedNodes,
      },
    } as EntityDetailsData;

    return merged;
  } catch (error) {
    logger.error(`Error fetching entity details for CUI: ${cui}`, {
      error,
      cui,
    });
    throw error; // Re-throw the error to be handled by React Query
  }
}

const ENTITY_SEARCH_QUERY = `
  query EntitySearch($search: String, $limit: Int) {
    entities(filter: { search: $search }, limit: $limit) {
      nodes {
        name
        cui
        uat {
          county_name
          name
        }
      }
      # If your API returns pagination info for search, you can include it here
      # pageInfo {
      #   totalCount
      # }
    }
  }
`;

/**
 * Searches for entities based on a search term.
 * @param searchTerm The term to search for.
 * @param limit The maximum number of results to return (default: 10).
 * @returns A promise that resolves to the search results.
 */
export async function searchEntities(
  searchTerm: string,
  limit: number = 10
): Promise<EntitySearchNode[]> { // Return nodes directly for simplicity in the component
  if (!searchTerm || searchTerm.trim() === "") {
    return Promise.resolve([]);
  }

  logger.info("Searching entities", { searchTerm, limit });

  try {
    const variables = {
      search: searchTerm,
      limit,
    };

    // The actual response structure from graphqlRequest will be { data: { entities: EntitySearchResult } }
    // or just { entities: EntitySearchResult } if graphqlRequest unwraps the 'data' object.
    // Adjust based on how graphqlRequest is implemented.
    // The current type { entities: EntitySearchResult } assumes graphqlRequest returns the direct GQL response data.
    const response = await graphqlRequest<{ entities: EntitySearchResult }>(ENTITY_SEARCH_QUERY, variables);

    // Check if response and response.entities and response.entities.nodes exist
    if (response && response.entities && response.entities.nodes) {
      return response.entities.nodes;
    }
    return []; // Return empty array if data is not in the expected shape

  } catch (error) {
    logger.error("Error searching entities", { error, searchTerm });
    // Depending on error handling strategy, you might want to throw the error
    // or return an empty array / specific error object.
    throw error; // Or return [];
  }
}
