import { z } from 'zod'
import { ReportTypeEnum } from './charts'

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
  // Required scope
  years: z.array(z.number()).min(1),
  account_category: AccountCategoryEnum,

  // Line-item dimensional filters
  report_ids: z.array(z.string()).optional(),
  report_type: ReportTypeEnum.optional(),
  reporting_years: z.array(z.number()).optional(),
  entity_cuis: z.array(z.string()).optional(),
  functional_codes: z.array(z.string()).optional(),
  functional_prefixes: z.array(z.string()).optional(),
  economic_codes: z.array(z.string()).optional(),
  economic_prefixes: z.array(z.string()).optional(),
  funding_source_ids: z.array(z.union([z.string(), z.number()])).optional(),
  budget_sector_ids: z.array(z.union([z.string(), z.number()])).optional(),
  expense_types: z.array(z.enum(['dezvoltare', 'functionare'])).optional(),
  program_codes: z.array(z.string()).optional(),

  // Geography / entity scope
  county_codes: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  uat_ids: z.array(z.union([z.string(), z.number()])).optional(),
  entity_types: z.array(z.string()).optional(),
  is_uat: z.boolean().optional(),
  search: z.string().optional(),

  // Population constraints
  min_population: z.number().optional(),
  max_population: z.number().optional(),

  // Aggregated constraints & transforms
  normalization: normalizationEnum.optional(),
  aggregate_min_amount: z.number().optional(),
  aggregate_max_amount: z.number().optional(),

  // Per-item thresholds
  item_min_amount: z.number().optional(),
  item_max_amount: z.number().optional(),
})

export type EntityAnalyticsFilter = z.infer<typeof entityAnalyticsFilterSchema>

export type SortOrder = {
  by: string
  order: 'asc' | 'desc' | 'ASC' | 'DESC'
}


