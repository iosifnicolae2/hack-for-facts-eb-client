import { graphqlRequest } from "./graphql";
import { createLogger } from "../logger";
import { EntitySearchResult, EntitySearchNode } from "@/schemas/entities";

const logger = createLogger("entities-api");

export interface TrendPoint {
  year: number;
  totalAmount: number;
}

export interface ExecutionLineItem {
  account_category: string
  economicClassification?: {
    economic_name: string;
    economic_code: string;
  };
  functionalClassification?: {
    functional_name: string;
    functional_code: string;
  };
  amount: number;
}

export interface EntityDetailsData {
  cui: string;
  name: string;
  address?: string | null;
  entity_type?: string | null;
  is_uat?: boolean | null;
  is_main_creditor?: boolean | null;
  uat?: {
    county_name?: string | null;
    county_code?: string | null;
    name?: string | null;
    siruta_code?: number | null;
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
  incomeTrend?: TrendPoint[] | null;
  expenseTrend?: TrendPoint[] | null;
  balanceTrend?: TrendPoint[] | null;
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

interface EntityDetailsResponse {
  entity: EntityDetailsData | null;
}

const GET_ENTITY_DETAILS_QUERY = `
  query GetEntityDetails($cui: ID!, $year: Int!, $startYear: Int!, $endYear: Int!) {
    entity(cui: $cui) {
      cui
      name
      address
      entity_type
      is_uat
      is_main_creditor
      uat {
        county_name
        county_code
        name
        siruta_code
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
      totalIncome(year: $year)
      totalExpenses(year: $year)
      budgetBalance(year: $year)
      incomeTrend(startYear: $startYear, endYear: $endYear) {
        year
        totalAmount
      }
      expenseTrend(startYear: $startYear, endYear: $endYear) {
        year
        totalAmount
      }
      balanceTrend(startYear: $startYear, endYear: $endYear) {
        year
        totalAmount
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
      executionLineItems(
        filter: { year: $year }
        sort: { by: "amount", order: "DESC" }
        limit: 1000
      ) {
        nodes {
          account_category
          functionalClassification {
            functional_name
            functional_code
          }
          economicClassification {
            economic_name
            economic_code
          }
          amount
        }
      }
    }
  }
`;

export async function getEntityDetails(
  cui: string,
  year: number = 2024, // Defaulting to 2024 as in the query
  startYear: number = 2016, // Defaulting as in the query
  endYear: number = 2025 // Defaulting as in the query
): Promise<EntityDetailsData | null> {
  logger.info(`Fetching entity details for CUI: ${cui}`, { cui, year, startYear, endYear });

  try {
    const response = await graphqlRequest<EntityDetailsResponse>(
      GET_ENTITY_DETAILS_QUERY,
      { cui, year, startYear, endYear }
    );

    if (!response || !response.entity) {
      logger.warn("Received null or undefined response for entity details", {
        response,
        cui,
      });
      return null;
    }

    return response.entity;
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
