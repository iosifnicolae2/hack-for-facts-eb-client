import { useNavigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { AnalyticsFilterSchema, AnalyticsFilterType, defaultYearRange } from '@/schemas/charts'

const viewEnum = z.enum(['table', 'chart'])

export const defaultEntityAnalyticsFilter: AnalyticsFilterType = {
  account_category: 'ch',
  years: [defaultYearRange.end],
  normalization: 'total',
}

const searchSchema = z.object({
  view: viewEnum.default('table'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  pageSize: z.number().default(25),
  filter: AnalyticsFilterSchema.default(defaultEntityAnalyticsFilter as AnalyticsFilterType),
})

export type EntityAnalyticsSearch = z.infer<typeof searchSchema>

export function useEntityAnalyticsFilter() {
  const navigate = useNavigate({ from: '/entity-analytics' })
  const raw = useSearch({ from: '/entity-analytics' })
  const search = searchSchema.parse(raw)

  const setFilter = (partial: Partial<AnalyticsFilterType>) => {
    navigate({
      search: (prev) => {
        const prevFilter = (prev as EntityAnalyticsSearch).filter ?? {}
        const merged = { ...prevFilter, ...partial }
        if (!merged.years || merged.years.length === 0) {
          merged.years = [defaultYearRange.end]
        }
        if (!merged.account_category) {
          merged.account_category = 'ch'
        }
        return { ...prev, filter: merged }
      },
      replace: true,
    })
  }

  const setView = (view: 'table' | 'chart') => {
    navigate({ search: (prev) => ({ ...prev, view }), replace: true })
  }

  const setSorting = (by: string, order: 'asc' | 'desc') => {
    navigate({ search: (prev) => ({ ...prev, sortBy: by, sortOrder: order }), replace: true })
  }

  const setPagination = (page: number, pageSize?: number) => {
    navigate({
      search: (prev) => ({ ...prev, page, pageSize: pageSize ?? (prev as EntityAnalyticsSearch).pageSize }),
      replace: true,
    })
  }

  const resetFilter = () => {
    navigate({
      search: (prev) => ({ ...prev, filter: defaultEntityAnalyticsFilter }),
      replace: true,
    })
  }

  return {
    search,
    filter: search.filter,
    setFilter,
    view: search.view,
    setView,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
    setSorting,
    page: search.page,
    pageSize: search.pageSize,
    setPagination,
    resetFilter,
  }
}


