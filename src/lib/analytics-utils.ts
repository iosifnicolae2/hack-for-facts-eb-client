import { useQuery } from '@tanstack/react-query';
import { ExecutionLineItem } from '@/lib/api/entities';
import { getUserLocale } from './utils';
import functionalClassificationsRo from '@/assets/functional-classifications-general-ro.json';
import functionalClassificationsEn from '@/assets/functional-classifications-general-en.json';

interface BudgetNode {
  description: string;
  code?: string;
  children?: BudgetNode[];
}

let chapterMapInstance: Map<string, string> | null = null;
let incomeSubchapterMapInstance: Map<string, string> | null = null;
let chapterMapPromise: Promise<Map<string, string>> | null = null;
let incomeSubchapterMapPromise: Promise<Map<string, string>> | null = null;

type FunctionalTree = BudgetNode[];

const userLocale = getUserLocale();
const CHAPTER_MAP_CACHE_KEY = `functional-chapter-map-cache-${userLocale}-v1`;
const INCOME_SUBCHAPTER_MAP_CACHE_KEY = `functional-income-subchapter-map-cache-${userLocale}-v1`;

const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const tryLoadMapCache = (key: string): Map<string, string> | null => {
  if (!canUseStorage) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Record<string, string>;
    return new Map(Object.entries(obj));
  } catch {
    return null;
  }
};

const trySaveMapCache = (key: string, map: Map<string, string>): void => {
  if (!canUseStorage) return;
  try {
    const obj = Object.fromEntries(map.entries());
    window.localStorage.setItem(key, JSON.stringify(obj));
  } catch {
    // ignore cache write errors
  }
};

const fetchFunctionalTree = async (): Promise<FunctionalTree> => {
  const data = userLocale === 'ro' ? functionalClassificationsRo : functionalClassificationsEn;
  return data as FunctionalTree;
};

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

/** First two groups from any code-like string (e.g. "01.02" from "01.02" or "01.02.03"). */
const twoGroupPrefix = (codeLike: string | null | undefined): string | null => {
  if (!codeLike) return null;
  const raw = tidy(codeLike).replace(/\.$/, '');
  const m = raw.match(/^(\d{2})\.(\d{2})/);
  return m ? `${m[1]}.${m[2]}` : null;
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

const ensureChapterMap = async (): Promise<Map<string, string>> => {
  if (chapterMapInstance) return chapterMapInstance;
  if (chapterMapPromise) return chapterMapPromise;
  const cached = tryLoadMapCache(CHAPTER_MAP_CACHE_KEY);
  if (cached) {
    chapterMapInstance = cached;
    return cached;
  }
  chapterMapPromise = fetchFunctionalTree().then((tree) => {
    const map = buildChapterMapFromTree(Array.isArray(tree) ? tree : []);
    chapterMapInstance = map;
    trySaveMapCache(CHAPTER_MAP_CACHE_KEY, map);
    return map;
  });
  return chapterMapPromise;
};

export const getChapterMap = (): Map<string, string> => {
  if (chapterMapInstance) return chapterMapInstance;
  const cached = tryLoadMapCache(CHAPTER_MAP_CACHE_KEY);
  if (cached) {
    chapterMapInstance = cached;
    return cached;
  }
  // Not yet loaded; return empty map as a safe fallback.
  return new Map<string, string>();
};

/** Build a map of income subchapters (NN.MM) to their descriptions. */
const buildIncomeSubchapterMapFromTree = (roots: BudgetNode[]): Map<string, string> => {
  type Entry = { name: string; depth: number; exact: boolean };
  const best = new Map<string, Entry>();

  const isIncomeRoot = (s: string) => /VENITURI/i.test(tidy(s));

  const visit = (node: BudgetNode, depth: number) => {
    const code = node.code ? twoGroupPrefix(node.code) : null;
    if (code) {
      const exact = /^\d{2}\.\d{2}$/.test(tidy(node.code!));
      const name = tidy(node.description) || code;

      const prev = best.get(code);
      if (!prev || (!prev.exact && exact) || (prev.exact === exact && depth < prev.depth)) {
        best.set(code, { name, depth, exact });
      }
    }
    if (node.children?.length) {
      for (const child of node.children) visit(child, depth + 1);
    }
  };

  for (const root of roots) {
    if (isIncomeRoot(root.description)) visit(root, 0);
  }

  const map = new Map<string, string>();
  best.forEach((v, k) => map.set(k, v.name));
  return map;
};

const ensureIncomeSubchapterMap = async (): Promise<Map<string, string>> => {
  if (incomeSubchapterMapInstance) return incomeSubchapterMapInstance;
  if (incomeSubchapterMapPromise) return incomeSubchapterMapPromise;
  const cached = tryLoadMapCache(INCOME_SUBCHAPTER_MAP_CACHE_KEY);
  if (cached) {
    incomeSubchapterMapInstance = cached;
    return cached;
  }
  incomeSubchapterMapPromise = fetchFunctionalTree().then((tree) => {
    const map = buildIncomeSubchapterMapFromTree(Array.isArray(tree) ? tree : []);
    incomeSubchapterMapInstance = map;
    trySaveMapCache(INCOME_SUBCHAPTER_MAP_CACHE_KEY, map);
    return map;
  });
  return incomeSubchapterMapPromise;
};

export const getIncomeSubchapterMap = (): Map<string, string> => {
  if (incomeSubchapterMapInstance) return incomeSubchapterMapInstance;
  const cached = tryLoadMapCache(INCOME_SUBCHAPTER_MAP_CACHE_KEY);
  if (cached) {
    incomeSubchapterMapInstance = cached;
    return cached;
  }
  // Not yet loaded; return empty map as a safe fallback.
  return new Map<string, string>();
};

export const useChapterMap = () => {
  return useQuery<Map<string, string>>({
    queryKey: ['functional-chapter-map'],
    queryFn: ensureChapterMap,
    staleTime: Infinity,
  });
};

export const useIncomeSubchapterMap = () => {
  return useQuery<Map<string, string>>({
    queryKey: ['functional-income-subchapter-map'],
    queryFn: ensureIncomeSubchapterMap,
    staleTime: Infinity,
  });
};

const aggregateByFunctionalCode = (items: readonly ExecutionLineItem[]): Map<string, number> => {
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

export const getTopFunctionalGroupCodes = (items: readonly ExecutionLineItem[], topN: number = 5): string[] => {
  if (!items?.length) return [];
  const functionalGroups = aggregateByFunctionalCode(items);
  return [...functionalGroups.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([prefix]) => prefix);
};

export const processDataForAnalyticsChart = (
  items: readonly ExecutionLineItem[],
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
