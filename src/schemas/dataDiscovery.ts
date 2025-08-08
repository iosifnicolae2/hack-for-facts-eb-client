export type UATData = {
  uat_code?: string;
  name?: string;
  county_name?: string;
  county_code?: string;
  region?: string;
  population?: number;
};

export type EntityData = {
  cui: string;
  name: string;
  sector_type?: string;
  uat?: UATData;
  address?: string;
};

export type BudgetLineItem = {
  line_item_id: string;
  report_id: string;
  entity_name: string;
  entity_cui: string;
  entity: {
    cui: string;
    name: string;
  };
  functional_code: string;
  functional_name?: string;
  economic_code?: string;
  economic_name?: string;
  amount: number;
  year: number;
  account_category: string;
  functionalClassification?: {
    functional_name: string;
  };
  economicClassification?: {
    economic_name: string;
  };
};

export type AggregatedBudgetData = {
  id: string;
  category: string;
  name: string;
  value: number;
  percentage: number;
  children?: AggregatedBudgetData[];
};

export type SortOrder = {
  by: string;
  order: 'asc' | 'desc';
};

export type EntityFilter = Record<string, unknown>;

export type GetDataParams = {
  filters: EntityFilter;
  sort?: SortOrder;
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};
