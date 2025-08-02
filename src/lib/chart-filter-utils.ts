// src/lib/chart-filter-utils.ts

import { useAccountCategoryLabel, useBudgetSectorLabel, useEconomicClassificationLabel, useEntityLabel, useEntityTypeLabel, useFunctionalClassificationLabel, useFundingSourceLabel, useUatLabel } from "@/hooks/filters/useFilterLabels";
import { AnalyticsFilterType } from "@/schemas/charts";

export type FiltersWithLabels = Pick<AnalyticsFilterType, "entity_cuis" | "economic_codes" | "functional_codes" | "budget_sector_ids" | "funding_source_ids" | "uat_ids">;

// All your helper functions from the original component go here:
export const getFilterDisplayName = (key: string): string => {
  switch (key) {
    case "entity_cuis":
      return "Entitate";
    case "uat_ids":
      return "UAT";
    case "economic_codes":
      return "Clasificare economică";
    case "functional_codes":
      return "Clasificare funcțională";
    case "budget_sector_ids":
      return "Sector bugetar";
    case "funding_source_ids":
      return "Sursă de finanțare";
    case "account_category":
      return "Tip de cont";
    case "report_type":
      return "Tip de raport";
    case "is_uat":
      return "Este UAT";
    case "functional_prefixes":
      return "Prefix funcțional";
    case "economic_prefixes":
      return "Prefix economic";
    case "entity_types":
      return "Tip de entitate";
    default:
      return key;
  }
};

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
  const order = ["account_category", "entity_cuis", "entity_types", "uat_ids", "functional_prefixes", "economic_prefixes", "functional_codes", "economic_codes", "budget_sector_ids", "funding_source_ids", "is_uat", "min_amount", "max_amount", "report_type", "years"] as Array<keyof AnalyticsFilterType>;
  const indexA = order.indexOf(keyA);
  const indexB = order.indexOf(keyB);


  if (indexA === -1 && indexB === -1) {
    return 0;
  }
  if (indexA === -1) {
    return 1;
  }
  if (indexB === -1) {
    return -1;
  }
  return indexA - indexB;
} 