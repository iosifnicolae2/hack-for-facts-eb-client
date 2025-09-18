import { graphqlRequest } from './graphql';
import { AnalyticsInput, AnalyticsSeries, AnalyticsFilterType } from '@/schemas/charts';
import { prepareFilterForServer } from '@/lib/filterUtils';

// Using types from schemas/charts.ts

/**
 * Fetch analytics data for chart rendering
 */
export async function getChartAnalytics(inputs: AnalyticsInput[]): Promise<AnalyticsSeries[]> {
  const query = `
    query GetExecutionLineItemsAnalytics($inputs: [AnalyticsInput!]!) {
      executionAnalytics(inputs: $inputs) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
    }
  `;

  const serverInputs = inputs.map((i) => ({
    ...i,
    filter: prepareFilterForServer(i.filter as unknown as AnalyticsFilterType),
  }))

  const response = await graphqlRequest<{
    executionAnalytics: AnalyticsSeries[];
  }>(query, { inputs: serverInputs });

  return response.executionAnalytics;
}

export async function getStaticChartAnalytics(seriesIds: string[]): Promise<AnalyticsSeries[]> {
  const query = `
    query GetStaticChartAnalytics($seriesIds: [ID!]!) {
      staticChartAnalytics(seriesIds: $seriesIds) {
        seriesId
        xAxis { name type unit }
        yAxis { name type unit }
        data { x y }
      }
    }
  `;

  const response = await graphqlRequest<{
    staticChartAnalytics: AnalyticsSeries[];
  }>(query, { seriesIds });

  return response.staticChartAnalytics;
}
