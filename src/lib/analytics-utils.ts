import classifications from '@/assets/functional-classificatinos-general.json';
import { ExecutionLineItem } from '@/lib/api/entities';

interface BudgetNode {
  description: string;
  code?: string;
  children?: BudgetNode[];
}

let chapterMapInstance: Map<string, string> | null = null;

/** Trim + normalize odd spaces/BOM. */
const tidy = (s: string | null | undefined) =>
  (s ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\uFEFF/g, '')
    .trim();

/** First two digits from any code-like string (e.g. "01", "01.02", "01.02.03"). */
const twoDigitPrefix = (codeLike: string | null | undefined): string | null => {
  if (!codeLike) return null;
  const raw = tidy(codeLike).replace(/\.$/, '');
  const m = raw.match(/^(\d{2})/);
  return m ? m[1] : null;
};

/** Build a prefix→description map by walking the BudgetNode tree. */
const buildChapterMapFromTree = (roots: BudgetNode[]): Map<string, string> => {
  type Entry = { name: string; depth: number; exact: boolean };
  const best = new Map<string, Entry>();

  const visit = (node: BudgetNode, depth: number) => {
    const prefix = node.code ? twoDigitPrefix(node.code) : null;
    if (prefix) {
      const exact = /^\d{2}$/.test(tidy(node.code!)); // prefer exact "NN" nodes
      const name = tidy(node.description) || prefix;

      const existing = best.get(prefix);
      if (!existing) {
        best.set(prefix, { name, depth, exact });
      } else {
        // prefer exact; then shallower depth
        if ((!existing.exact && exact) || (existing.exact === exact && depth < existing.depth)) {
          best.set(prefix, { name, depth, exact });
        }
      }
    }
    if (node.children?.length) {
      for (const child of node.children) visit(child, depth + 1);
    }
  };

  for (const root of roots) visit(root, 0);

  const map = new Map<string, string>();
  best.forEach((v, k) => map.set(k, v.name));
  return map;
};

export const getChapterMap = (): Map<string, string> => {
  if (chapterMapInstance) return chapterMapInstance;
  const tree = classifications as unknown as BudgetNode[];
  chapterMapInstance = buildChapterMapFromTree(Array.isArray(tree) ? tree : []);
  return chapterMapInstance!;
};

const aggregateByFunctionalCode = (items: ExecutionLineItem[]): Map<string, number> => {
  const functionalGroups = new Map<string, number>();
  for (const item of items ?? []) {
    const fc = item.functionalClassification?.functional_code;
    const prefix = twoDigitPrefix(fc);
    if (!prefix) continue;
    const amount = Number(item.amount) || 0;
    functionalGroups.set(prefix, (functionalGroups.get(prefix) || 0) + amount);
  }
  return functionalGroups;
};

export const getTopFunctionalGroupCodes = (items: ExecutionLineItem[], topN: number = 5): string[] => {
  if (!items?.length) return [];
  const functionalGroups = aggregateByFunctionalCode(items);
  return [...functionalGroups.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([prefix]) => prefix);
};

export const processDataForAnalyticsChart = (
  items: ExecutionLineItem[],
  topN: number = 6
): { name: string; value: number }[] => {
  const chapterMap = getChapterMap();
  const functionalGroups = aggregateByFunctionalCode(items);

  const sorted = Array.from(functionalGroups.entries(), ([prefix, value]) => ({
    name: chapterMap.get(prefix) || `Capitol ${prefix}`,
    value,
  })).sort((a, b) => b.value - a.value);

  if (sorted.length > topN) {
    const top = sorted.slice(0, topN);
    const otherValue = sorted.slice(topN).reduce((acc, cur) => acc + cur.value, 0);
    return [...top, { name: 'Other', value: otherValue }];
  }
  return sorted;
};
