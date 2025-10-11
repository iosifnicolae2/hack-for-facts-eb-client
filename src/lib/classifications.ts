import classifications from '@/assets/functional-classificatinos-general.json';

type ClassificationNode = {
    code?: string;
    description: string;
    children?: ClassificationNode[];
};

const classificationMap = new Map<string, string>();

function flattenClassifications(nodes: ClassificationNode[]) {
    for (const node of nodes) {
        if (node.code) {
            classificationMap.set(node.code, node.description);
        }
        if (node.children) {
            flattenClassifications(node.children);
        }
    }
}

flattenClassifications(classifications);

export function getClassificationName(code: string): string | undefined {
    return classificationMap.get(code);
}
