export type LineItemsFilter = {
  report_id?: string;
  report_ids?: string[];
  report_type?: string;
  entity_cuis?: string[];
  funding_source_id?: number;
  functional_codes?: string[];
  economic_codes?: string[];
  account_categories?: ("vn" | "ch")[];
  min_amount?: number;
  max_amount?: number;
  program_code?: string;
  county_code?: string;
  uat_ids?: number[];
  year?: number;
  years?: number[];
  start_year?: number;
  end_year?: number;
  search?: string;
  is_main_creditor?: boolean;
  is_uat?: boolean;
  page?: number;
  pageSize?: number;
};

export interface SortOrder {
  by?:
  'line_item_id' |
  'report_id' |
  'entity_cui' |
  'funding_source_id' |
  'functional_code' |
  'economic_code' |
  'account_category' |
  'amount' |
  'program_code' |
  'year' |
  null;
  order?: 'asc' | 'desc' | null;
}

export interface GroupedEconomic {
    code: string;
    name: string;
    amount: number;
}
  
export interface GroupedFunctional {
    code: string;
    name: string;
    totalAmount: number;
    economics: GroupedEconomic[];
}

export interface GroupedChapter {
    prefix: string;
    description: string;
    totalAmount: number;
    functionals: GroupedFunctional[];
}
