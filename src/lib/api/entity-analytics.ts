import { graphqlRequest } from './graphql'
import type { EntityAnalyticsConnection, EntityAnalyticsFilter, SortOrder } from '@/schemas/entity-analytics'

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

export async function fetchEntityAnalytics(params: {
  filter: EntityAnalyticsFilter
  sort?: SortOrder
  limit?: number
  offset?: number
}): Promise<EntityAnalyticsConnection> {
  const data = await graphqlRequest<{ entityAnalytics: EntityAnalyticsConnection }>(
    ENTITY_ANALYTICS_QUERY,
    {
      filter: params.filter,
      sort: params.sort,
      limit: params.limit,
      offset: params.offset,
    },
  )
  return data.entityAnalytics
}


