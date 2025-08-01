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
  return key === "cui";
}; 