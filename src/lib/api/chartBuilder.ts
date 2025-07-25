import { graphqlRequest } from './graphql';
import { AnalyticsInput, Chart } from '@/schemas/chartBuilder';

export interface YearlyTrendPoint {
  year: number;
  totalAmount: number;
}

export interface AnalyticsDataPoint {
  label: string;
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
        label
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

/**
 * Save chart configuration (example implementation using localStorage)
 * In production, this would save to your backend
 */
export async function saveChart(chart: Chart): Promise<void> {
  const savedCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
  const existingIndex = savedCharts.findIndex((c: Chart) => c.id === chart.id);
  
  if (existingIndex >= 0) {
    savedCharts[existingIndex] = chart;
  } else {
    savedCharts.push(chart);
  }
  
  localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
}

/**
 * Load saved charts
 */
export async function loadSavedCharts(): Promise<Chart[]> {
  return JSON.parse(localStorage.getItem('savedCharts') || '[]');
}

/**
 * Delete a saved chart
 */
export async function deleteChart(chartId: string): Promise<void> {
  const savedCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
  const updatedCharts = savedCharts.filter((chart: Chart) => chart.id !== chartId);
  localStorage.setItem('savedCharts', JSON.stringify(updatedCharts));
} 