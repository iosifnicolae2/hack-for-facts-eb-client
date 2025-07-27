// src/lib/chart-filter-utils.ts

// All your helper functions from the original component go here:
export const getFilterDisplayName = (key: string): string => {
  switch (key) {
    case "cui":
      return "CUI";
    default:
      return key;
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