import { z } from 'zod'

export type EntityAnalyticsDataPoint = {
  entity_cui: string
  entity_name: string
  entity_type?: string | null
  uat_id?: string | null
  county_code?: string | null
  county_name?: string | null
  population?: number | null
  amount: number
  total_amount: number
  per_capita_amount: number
}

export type EntityAnalyticsConnection = {
  nodes: EntityAnalyticsDataPoint[]
  pageInfo: {
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export const AccountCategoryEnum = z.enum(['ch', 'vn'])

export const normalizationEnum = z.enum(['total', 'per_capita'])

export const entityAnalyticsFilterSchema = z.object({
  account_category: AccountCategoryEnum,
  years: z.array(z.number()).min(1),

  // Execution line item filters
  report_id: z.string().optional(),
  report_ids: z.array(z.string()).optional(),
  report_type: z.string().optional(),
  entity_cuis: z.array(z.string()).optional(),
  functional_codes: z.array(z.string()).optional(),
  functional_prefixes: z.array(z.string()).optional(),
  economic_codes: z.array(z.string()).optional(),
  economic_prefixes: z.array(z.string()).optional(),
  funding_source_id: z.union([z.string(), z.number()]).optional(),
  funding_source_ids: z.array(z.union([z.string(), z.number()])).optional(),
  budget_sector_id: z.union([z.string(), z.number()]).optional(),
  budget_sector_ids: z.array(z.union([z.string(), z.number()])).optional(),
  expense_types: z.array(z.string()).optional(),
  program_code: z.string().optional(),
  reporting_year: z.number().optional(),
  county_code: z.string().optional(),
  county_codes: z.array(z.string()).optional(),
  uat_ids: z.array(z.union([z.string(), z.number()])).optional(),
  entity_types: z.array(z.string()).optional(),
  is_uat: z.boolean().optional(),

  // Entity-level filters
  search: z.string().optional(),

  // Aggregated constraints & transforms
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  normalization: normalizationEnum.optional(),
  // Population constraints
  min_population: z.number().optional(),
  max_population: z.number().optional(),
})

export type EntityAnalyticsFilter = z.infer<typeof entityAnalyticsFilterSchema>

export type SortOrder = {
  by: string
  order: 'asc' | 'desc' | 'ASC' | 'DESC'
}


