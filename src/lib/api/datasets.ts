
import { graphqlRequest } from './graphql';
import { Axis, AnalyticsSeriesPoint } from '@/schemas/charts';
import { getUserLocale } from '@/lib/utils';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  xAxis: Axis;
  yAxis: Axis;
  data: AnalyticsSeriesPoint[];
}

export async function getDatasets(ids: (string | number)[], lang?: string): Promise<Dataset[]> {
  const locale = lang || getUserLocale();
  const query = `
    query GetDatasets($ids: [ID!]!, $lang: String) {
      datasets(filter: { ids: $ids }, lang: $lang) {
        nodes {
          id
          name
          description
          sourceName
          sourceUrl
          xAxis { name type unit }
          yAxis { name type unit }
          data { x y }
        }
      }
    }
  `;
  const response = await graphqlRequest(query, { ids, lang: locale.toUpperCase() }) as { datasets: { nodes: Dataset[] } };
  return response.datasets.nodes;
}
