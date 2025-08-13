// src/lib/chart-filter-utils.ts

import { useAccountCategoryLabel, useBudgetSectorLabel, useEconomicClassificationLabel, useEntityLabel, useEntityTypeLabel, useFunctionalClassificationLabel, useFundingSourceLabel, useUatLabel } from "@/hooks/filters/useFilterLabels";
import { AnalyticsFilterType, Chart } from "@/schemas/charts";

export type FiltersWithLabels = Pick<AnalyticsFilterType, "entity_cuis" | "economic_codes" | "functional_codes" | "budget_sector_ids" | "funding_source_ids" | "uat_ids">;

// Display names for filter keys
const FILTER_DISPLAY_NAME: Record<string, string> = {
  entity_cuis: "Entitate",
  uat_ids: "UAT",
  economic_codes: "Clasificare economică",
  functional_codes: "Clasificare funcțională",
  budget_sector_ids: "Sector bugetar",
  funding_source_ids: "Sursă de finanțare",
  account_category: "Tip de cont",
  report_type: "Tip de raport",
  is_uat: "Este UAT",
  functional_prefixes: "Prefix funcțional",
  economic_prefixes: "Prefix economic",
  entity_types: "Tip de entitate",
};

export const getFilterDisplayName = (key: string): string => FILTER_DISPLAY_NAME[key] ?? key;

export const useMapFilterValue = (filter: FiltersWithLabels) => {
  const entityLabelsStore = useEntityLabel(filter.entity_cuis ?? []);
  const economicCodesStore = useEconomicClassificationLabel(filter.economic_codes ?? []);
  const budgetSectorLabelsStore = useBudgetSectorLabel(filter.budget_sector_ids ?? []);
  const fundingSourceLabelsStore = useFundingSourceLabel(filter.funding_source_ids ?? []);
  const functionalCodesStore = useFunctionalClassificationLabel(filter.functional_codes ?? []);
  const uatLabelsStore = useUatLabel(filter.uat_ids ?? []);
  const entityTypesStore = useEntityTypeLabel();
  const accountCategoryLabelsStore = useAccountCategoryLabel();
  return {
    mapValueToLabel: (key: string, value: unknown) => {
      switch (key) {
        case "account_category":
          return accountCategoryLabelsStore.map(value as string);
        case "economic_codes":
          return economicCodesStore.map(value as string);
        case "entity_cuis":
          return entityLabelsStore.map(value as string);
        case "budget_sector_ids":
          return budgetSectorLabelsStore.map(value as string);
        case "funding_source_ids":
          return fundingSourceLabelsStore.map(value as string);
        case "functional_codes":
          return functionalCodesStore.map(value as string);
        case "uat_ids":
          return uatLabelsStore.map(value as string);
        case "entity_types":
          return entityTypesStore.map(value as string);
        default:
          return String(value);
      }
    }
  }
};

export const createDataDiscoveryUrl = (key: string, value: unknown): string => {
  return `/data-discovery?${key}=${value}`;
};
export const createEntityUrl = (cui: string): string => {
  return `/entities/${cui}`;
};
export const isEntityCui = (key: string): boolean => {
  return key === "cui";
};
export const isInteractiveFilter = (key: string): boolean => {
  const interactiveKeys = [
    'cui', // TODO: add other interactive keys
    // "economic_codes",
    // "functional_codes",
    // "uat_ids",
    // "entity_types",
    // "budget_sector_ids",
    // "funding_source_ids",
    // "economic_prefixes",
    // "functional_prefixes",
  ];
  return interactiveKeys.includes(key);
};

export function getSortOrder(keyA: keyof AnalyticsFilterType, keyB: keyof AnalyticsFilterType) {
  const ORDER: ReadonlyArray<keyof AnalyticsFilterType> = [
    "account_category",
    "entity_cuis",
    "entity_types",
    "uat_ids",
    "functional_prefixes",
    "economic_prefixes",
    "functional_codes",
    "economic_codes",
    "budget_sector_ids",
    "funding_source_ids",
    "is_uat",
    "aggregate_min_amount",
    "aggregate_max_amount",
    "report_type",
    "years",
  ];
  const indexA = ORDER.indexOf(keyA);
  const indexB = ORDER.indexOf(keyB);
  if (indexA === -1 && indexB === -1) return 0;
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  return indexA - indexB;
}

// ============================================================================
// Bulk filter edit helpers
// ============================================================================

export type ReplaceableFilterKey =
  | "entity_cuis"
  | "uat_ids"
  | "economic_codes"
  | "functional_codes"
  | "budget_sector_ids"
  | "funding_source_ids"
  | "entity_types"
  | "account_category"
  | "report_type"
  | "functional_prefixes"
  | "economic_prefixes"
  | "is_uat";

// Convenience: list of replaceable keys for UIs
export const REPLACEABLE_FILTER_KEYS: ReadonlyArray<ReplaceableFilterKey> = [
  "entity_cuis",
  "entity_types",
  "uat_ids",
  "functional_codes",
  "economic_codes",
  "budget_sector_ids",
  "funding_source_ids",
  "functional_prefixes",
  "economic_prefixes",
  "account_category",
  "report_type",
  "is_uat",
];

const isAggregatedYearlySeries = (s: { type?: unknown }) => s?.type === "line-items-aggregated-yearly";

// Coerce filter values to the correct type. Some keys are booleans, and need to be parsed from strings.
const parseFilterValueForKey = (key: ReplaceableFilterKey, value: string): unknown => {
  if (key === "is_uat") {
    const lower = value.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    return undefined;
  }
  return value;
};

export function collectUniqueFilterValues(chart: Chart, key: ReplaceableFilterKey): string[] {
  const values = new Set<string>();
  for (const s of chart.series) {
    if (!isAggregatedYearlySeries(s)) continue;
    const f = s.filter as AnalyticsFilterType;
    const v = (f as Record<string, unknown>)[key];
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) if (item != null) values.add(String(item));
    } else {
      values.add(String(v));
    }
  }
  return Array.from(values);
}

export function countPotentialReplacements(chart: Chart, key: ReplaceableFilterKey, fromValue: string): number {
  let count = 0;
  for (const s of chart.series) {
    if (!isAggregatedYearlySeries(s)) continue;
    const f = s.filter as AnalyticsFilterType;
    const v = (f as Record<string, unknown>)[key];
    if (v == null) continue;
    if (Array.isArray(v)) {
      count += v.filter((x) => String(x) === fromValue).length;
    } else if (String(v) === fromValue) {
      count += 1;
    }
  }
  return count;
}

export function replaceFilterValue(chart: Chart, key: ReplaceableFilterKey, fromValue: string, toValue: string): Chart {
  const replacementValue = parseFilterValueForKey(key, toValue);
  const nextSeries = chart.series.map((s) => {
    if (!isAggregatedYearlySeries(s)) return s;
    const f = { ...(s.filter as AnalyticsFilterType) } as Record<string, unknown>;
    const v = f[key];
    if (v == null) return s;

    if (Array.isArray(v)) {
      const replaced = (v as unknown[])
        .map((x) => (String(x) === fromValue ? (replacementValue as never) : x))
        .filter((x) => x !== undefined);
      return { ...s, filter: { ...(s.filter as AnalyticsFilterType), [key]: replaced } };
    }

    if (String(v) === fromValue) {
      return { ...s, filter: { ...(s.filter as AnalyticsFilterType), [key]: replacementValue } };
    }

    return s;
  });

  return {
    ...chart,
    series: nextSeries,
    updatedAt: new Date().toISOString(),
  };
}