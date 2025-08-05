import classifications from '@/assets/functional-classificatinos-general.json';
import { ExecutionLineItem } from '@/lib/api/entities';

let chapterMapInstance: Map<string, string> | null = null;

export const getChapterMap = (): Map<string, string> => {
    if (chapterMapInstance) {
        return chapterMapInstance;
    }
    const map = new Map<string, string>();
    classifications.groups.forEach(group => {
        group.chapters.forEach(chapter => {
            if (chapter.code) {
                map.set(chapter.code.slice(0, 2), chapter.description);
            } else if (chapter.codes) {
                chapter.codes.forEach(code => {
                    map.set(code.slice(0, 2), chapter.description);
                });
            }
        });
    });
    chapterMapInstance = map;
    return map;
};

const aggregateByFunctionalCode = (items: ExecutionLineItem[]): Map<string, number> => {
    const functionalGroups = new Map<string, number>();
    items.forEach((item) => {
        if (item.functionalClassification?.functional_code) {
            const prefix = item.functionalClassification.functional_code.slice(0, 2);
            functionalGroups.set(prefix, (functionalGroups.get(prefix) || 0) + item.amount);
        }
    });
    return functionalGroups;
}

export const getTopFunctionalGroupCodes = (items: ExecutionLineItem[], topN: number = 5): string[] => {
    if (!items) {
        return [];
    }
    const functionalGroups = aggregateByFunctionalCode(items);
    return [...functionalGroups.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map((entry) => entry[0]);
};

export const processDataForAnalyticsChart = (items: ExecutionLineItem[], topN: number = 6): { name: string, value: number }[] => {
    const chapterMap = getChapterMap();
    const functionalGroups = aggregateByFunctionalCode(items);
    
    const sortedData = Array.from(functionalGroups.entries(), ([code, value]) => ({
        name: chapterMap.get(code) || 'Unknown Chapter',
        value
    })).sort((a, b) => b.value - a.value);

    if (sortedData.length > topN) {
        const topData = sortedData.slice(0, topN);
        const otherValue = sortedData.slice(topN).reduce((acc, curr) => acc + curr.value, 0);
        return [...topData, { name: 'Other', value: otherValue }];
    }

    return sortedData;
};
