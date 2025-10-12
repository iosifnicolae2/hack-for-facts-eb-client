import classificationsRO from '@/assets/functional-classifications-general-ro.json';
import classificationsEN from '@/assets/functional-classifications-general-en.json';
import { getUserLocale } from '@/lib/utils';

type ClassificationNode = {
    code?: string;
    description: string;
    children?: ClassificationNode[];
};

const roMap = new Map<string, string>();
const enMap = new Map<string, string>();

function flattenClassifications(nodes: ClassificationNode[], map: Map<string, string>) {
    for (const node of nodes) {
        if (node.code) {
            map.set(node.code, node.description);
        }
        if (node.children) {
            flattenClassifications(node.children, map);
        }
    }
}

flattenClassifications(classificationsRO as unknown as ClassificationNode[], roMap);
flattenClassifications(classificationsEN as unknown as ClassificationNode[], enMap);

function getActiveMap(): Map<string, string> {
    const locale = getUserLocale();
    return locale === 'ro' ? roMap : enMap;
}

export function getClassificationName(code: string): string | undefined {
    const name = getActiveMap().get(code);
    if (!name && code.endsWith('00')) {
        return getClassificationName(code.substring(0, code.length - 3));
    }
    return name;
}

export function getClassificationParent(code: string): string | null {
    if (!code.includes('.')) return null;
    return code.substring(0, code.lastIndexOf('.'));
}
