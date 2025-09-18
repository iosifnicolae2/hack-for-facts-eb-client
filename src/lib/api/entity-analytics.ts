import { graphqlRequest } from './graphql'
import type {
  EntityAnalyticsConnection,
  SortOrder,
  AggregatedLineItemConnection,
} from "@/schemas/entity-analytics";
import { AnalyticsFilterType } from "@/schemas/charts";
import { prepareFilterForServer } from "@/lib/filterUtils";

const ENTITY_ANALYTICS_QUERY = /* GraphQL */ `
  query EntityAnalytics($filter: AnalyticsFilterInput!, $sort: SortOrder, $limit: Int, $offset: Int) {
    entityAnalytics(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      nodes {
        entity_cui
        entity_name
        entity_type
        uat_id
        county_code
        county_name
        population
        amount
        total_amount
        per_capita_amount
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const AGGREGATED_LINE_ITEMS_QUERY = /* GraphQL */ `
  query AggregatedLineItems(
    $filter: AnalyticsFilterInput!
    $limit: Int
    $offset: Int
  ) {
    aggregatedLineItems(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        fn_c: functional_code
        fn_n: functional_name
        ec_c: economic_code
        ec_n: economic_name
        amount
        count
      }
      pageInfo {
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export async function fetchEntityAnalytics(params: {
  filter: AnalyticsFilterType
  sort?: SortOrder
  limit?: number
  offset?: number
}): Promise<EntityAnalyticsConnection> {
  const data = await graphqlRequest<{ entityAnalytics: EntityAnalyticsConnection }>(
    ENTITY_ANALYTICS_QUERY,
    {
      filter: prepareFilterForServer(params.filter),
      sort: params.sort,
      limit: params.limit,
      offset: params.offset,
    },
  )
  return data.entityAnalytics
}

export async function fetchAggregatedLineItems(params: {
  filter: AnalyticsFilterType;
  limit?: number;
  offset?: number;
}): Promise<AggregatedLineItemConnection> {
  const data = await graphqlRequest<{
    aggregatedLineItems: AggregatedLineItemConnection;
  }>(AGGREGATED_LINE_ITEMS_QUERY, {
    filter: prepareFilterForServer(params.filter),
    limit: params.limit,
    offset: params.offset,
  });
  return data.aggregatedLineItems;
}


