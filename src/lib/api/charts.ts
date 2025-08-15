import { graphqlRequest } from './graphql';
import { AnalyticsInput } from '@/schemas/charts';

export interface YearlyTrendPoint {
  year: number;
  value: number;
}

export interface AnalyticsDataPoint {
  seriesId: string;
  unit: string;
  yearlyTrend: YearlyTrendPoint[];
}

export interface AnalyticsResponse {
  data: {
    executionAnalytics: AnalyticsDataPoint[];
  };
}

export interface StaticAnalyticsDataPoint {
  seriesId: string;
  unit: string;
  yearlyTrend: YearlyTrendPoint[];
}

/**
 * Fetch analytics data for chart rendering
 */
export async function getChartAnalytics(inputs: AnalyticsInput[]): Promise<AnalyticsDataPoint[]> {
  const query = `
    query GetExecutionLineItemsAnalytics($inputs: [AnalyticsInput!]!) {
      executionAnalytics(inputs: $inputs) {
        seriesId
        unit
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

export async function getStaticChartAnalytics(seriesIds: string[]): Promise<StaticAnalyticsDataPoint[]> {
  const query = `
    query GetStaticChartAnalytics($seriesIds: [ID!]!) {
      staticChartAnalytics(seriesIds: $seriesIds) {
        seriesId
        unit
        yearlyTrend {
          year
          totalAmount
        }
      }
    }
  `;

  const response = await graphqlRequest<{
    staticChartAnalytics: StaticAnalyticsDataPoint[];
  }>(query, { seriesIds });

  return response.staticChartAnalytics;
}
