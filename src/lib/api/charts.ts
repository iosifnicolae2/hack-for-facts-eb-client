import { graphqlRequest } from './graphql';
import { AnalyticsInput } from '@/schemas/charts';

export interface YearlyTrendPoint {
  year: number;
  totalAmount: number;
}

export interface AnalyticsDataPoint {
  seriesId: string;
  yearlyTrend: YearlyTrendPoint[];
}

export interface AnalyticsResponse {
  data: {
    executionAnalytics: AnalyticsDataPoint[];
  };
}

/**
 * Fetch analytics data for chart rendering
 */
export async function getChartAnalytics(inputs: AnalyticsInput[]): Promise<AnalyticsDataPoint[]> {
  const query = `
    query GetExecutionLineItems($inputs: [AnalyticsInput!]!) {
      executionAnalytics(inputs: $inputs) {
        seriesId
        yearlyTrend {
          year
          totalAmount
        }
      }
    }
  `;

  const response = await graphqlRequest<{
    executionAnalytics: AnalyticsDataPoint[];
  }>(query, { inputs });

  return response.executionAnalytics;
}
