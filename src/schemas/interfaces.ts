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
