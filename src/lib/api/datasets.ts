
import { graphqlRequest } from './graphql';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  unit: string;
}

export async function getDatasets(ids: (string | number)[]): Promise<Dataset[]> {
  const query = `
    query GetDatasets($ids: [ID!]!) {
      datasets(filter: { ids: $ids }) {
        nodes {
          id
          name
          description
          sourceName
          sourceUrl
          unit
        }
      }
    }
  `;
  const response = await graphqlRequest(query, { ids }) as { datasets: { nodes: Dataset[] } };
  return response.datasets.nodes;
}
