import { graphqlRequest } from './graphql';
import { AnalyticsInput, Chart } from '@/schemas/chartBuilder';

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

const chartsKey = 'savedCharts';

export interface StoredChart extends Chart {
  favorite?: boolean;
  deleted?: boolean;
}

export const loadSavedCharts = ({ filterDeleted = false }: { filterDeleted?: boolean } = {}): StoredChart[] => {
  const chartsRaw = localStorage.getItem(chartsKey);
  const charts = chartsRaw ? JSON.parse(chartsRaw) : [];
  if (!filterDeleted) {
    return charts;
  }
  return charts.filter((c: StoredChart) => !c.deleted);
}

export const deleteChart = (chartId: string) => {
  const savedCharts = loadSavedCharts();
  const newCharts = savedCharts.map((c: Chart) => {
    if (c.id === chartId) {
      return { ...c, deleted: true };
    }
    return c;
  });
  localStorage.setItem(chartsKey, JSON.stringify(newCharts));
}

export const saveChartToLocalStorage = (chart: StoredChart) => {
  const savedCharts = loadSavedCharts();
  const hasChart = savedCharts.some((c) => c.id === chart.id);
  if (hasChart) {
    return;
  }

  localStorage.setItem(chartsKey, JSON.stringify([
    chart,
    ...savedCharts,
  ]));
}

export const updateChartInLocalStorage = (chart: Chart) => {
  const savedCharts = loadSavedCharts();
  localStorage.setItem(chartsKey, JSON.stringify([
    chart,
    ...savedCharts.filter((c: Chart) => c.id !== chart.id),
  ]));
}

export const toggleChartFavorite = (chartId: string) => {
  const savedCharts = loadSavedCharts();
  const chart = savedCharts.find((c: StoredChart) => c.id === chartId);
  if (!chart) {
    return;
  }
  const newChart = { ...chart, favorite: !chart.favorite };
  updateChartInLocalStorage(newChart);
}