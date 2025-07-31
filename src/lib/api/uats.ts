import { graphqlRequest } from "./graphql";

interface UatNamesResponse {
    uats: {
        nodes: {
            id: string;
            name: string;
        }[];
    };
}

const UAT_NAMES_QUERY = `
    query UatNames($uatIds: [String!]!) {
        uats(filter: { ids: $uatIds }) {
            nodes {
                id
                name
            }
        }
    }
`;

export async function getUatLabels(ids: string[]): Promise<{ id: string; label: string }[]> {
    const response = await graphqlRequest<UatNamesResponse>(UAT_NAMES_QUERY, { uatIds: ids });
    return response.uats.nodes.map(({ id, name }) => ({ id, label: name }));
}