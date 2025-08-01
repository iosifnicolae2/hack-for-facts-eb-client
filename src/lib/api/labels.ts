import { graphqlRequest } from "./graphql";
import { createLogger } from "../logger";

const logger = createLogger("classifications-api");

interface ClassificationResponse {
    nodes: {
        code: string;
        name: string;
    }[];
}

interface BudgetSectorResponse {
    nodes: {
        sector_id: string;
        sector_description: string;
    }[];
}

interface FundingSourceResponse {
    nodes: {
        source_id: string;
        source_description: string;
    }[];
}


interface UatNamesResponse {
    uats: {
        nodes: {
            id: string;
            name: string;
        }[];
    };
}


interface EntityNamesResponse {
    entities: {
        nodes: {
            cui: string;
            name: string;
        }[];
    }
}

const ENTITY_NAMES_QUERY = `
    query EntityNames($entityCuis: [String!]) {
      entities(filter: { cuis: $entityCuis }, limit: 1000) {
        nodes {
          cui
          name
        }
      }
    }
  `;


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


const FUNCTIONAL_CLASSIFICATION_NAMES_QUERY = `
    query FunctionalClassificationNames($codes: [String!]) {
        functionalClassifications(filter: { functional_codes: $codes }) {
            nodes {
                code: functional_code
                name: functional_name
            }
        }
    }
`;

const ECONOMIC_CLASSIFICATION_NAMES_QUERY = `
    query EconomicClassificationNames($codes: [String!]) {
        economicClassifications(filter: { economic_codes: $codes }) {
            nodes {
                code: economic_code
                name: economic_name
            }
        }
    }
`;

const BUDGET_SECTOR_NAMES_QUERY = `
    query BudgetSectorNames($ids: [String!]) {
        budgetSectors(filter: { sector_ids: $ids }) {
            nodes {
                sector_id
                sector_description
            }
        }
    }
`;

const FUNDING_SOURCE_NAMES_QUERY = `
    query FundingSourceNames($ids: [String!]) {
        fundingSources(filter: { source_ids: $ids }) {
            nodes {
                source_id
                source_description
            }
        }
    }
`;


export async function getFunctionalClassificationLabels(ids: (string | number)[]): Promise<{ id: string; label: string }[]> {
    const stringIds = ids.map(String);
    if (stringIds.length === 0) return [];
    try {
        const response = await graphqlRequest<{ functionalClassifications: ClassificationResponse }>(FUNCTIONAL_CLASSIFICATION_NAMES_QUERY, { codes: stringIds });
        return response.functionalClassifications.nodes.map(({ code, name }) => ({ id: code, label: name }));
    } catch (error) {
        logger.error("Error fetching functional classification labels", { error, ids });
        return [];
    }
}

export async function getEconomicClassificationLabels(ids: (string | number)[]): Promise<{ id: string; label: string }[]> {
    const stringIds = ids.map(String);
    if (stringIds.length === 0) return [];
    try {
        const response = await graphqlRequest<{ economicClassifications: ClassificationResponse }>(ECONOMIC_CLASSIFICATION_NAMES_QUERY, { codes: stringIds });
        return response.economicClassifications.nodes.map(({ code, name }) => ({ id: code, label: name }));
    }
    catch (error) {
        logger.error("Error fetching economic classification labels", { error, ids });
        return [];
    }
}

export async function getBudgetSectorLabels(ids: (string | number)[]): Promise<{ id: string | number; label: string }[]> {
    const stringIds = ids.map(String);
    if (stringIds.length === 0) return [];
    try {
        const response = await graphqlRequest<{ budgetSectors: BudgetSectorResponse }>(BUDGET_SECTOR_NAMES_QUERY, { ids: stringIds });
        return response.budgetSectors.nodes.map(({ sector_id, sector_description }) => ({ id: sector_id, label: sector_description }));
    }
    catch (error) {
        logger.error("Error fetching budget sector labels", { error, ids });
        return [];
    }
}

export async function getFundingSourceLabels(ids: (string | number)[]): Promise<{ id: string | number; label: string }[]> {
    const stringIds = ids.map(String);
    if (stringIds.length === 0) return [];
    try {
        const response = await graphqlRequest<{ fundingSources: FundingSourceResponse }>(FUNDING_SOURCE_NAMES_QUERY, { ids: stringIds });
        return response.fundingSources.nodes.map(({ source_id, source_description }) => ({ id: source_id, label: source_description }));
    }
    catch (error) {
        logger.error("Error fetching funding source labels", { error, ids });
        return [];
    }
}


export async function getEntityLabels(ids: (string | number)[]): Promise<{ id: string; label: string }[]> {
    const stringIds = ids.map(String);
    if (stringIds.length === 0) return [];
    try {
        const response = await graphqlRequest<EntityNamesResponse>(ENTITY_NAMES_QUERY, { entityCuis: stringIds });
        return response.entities.nodes.map(({ cui, name }) => ({ id: cui, label: name }));
    }
    catch (error) {
        logger.error("Error fetching entity labels", { error, ids });
        return [];
    }
}


export async function getUatLabels(ids: (string | number)[]): Promise<{ id: string; label: string }[]> {
    const stringIds = ids.map(String);
    if (stringIds.length === 0) return [];
    try {
        const response = await graphqlRequest<UatNamesResponse>(UAT_NAMES_QUERY, { uatIds: stringIds });
        return response.uats.nodes.map(({ id, name }) => ({ id, label: name }));
    }
    catch (error) {
        logger.error("Error fetching uat labels", { error, ids });
        return [];
    }
}
