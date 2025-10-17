import { useNavigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { AnalyticsFilterSchema, AnalyticsFilterType, defaultYearRange } from '@/schemas/charts'
import { Analytics } from '@/lib/analytics'

const viewEnum = z.enum(['table', 'chart', 'line-items'])

export const defaultEntityAnalyticsFilter: AnalyticsFilterType = {
  account_category: 'ch',
  report_period: {
    type: 'YEAR',
    selection: { dates: [String(defaultYearRange.end)] },
  },
  normalization: 'total',
  report_type: 'Executie bugetara agregata la nivel de ordonator principal',
}

const searchSchema = z.object({
  view: viewEnum.default('table'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  pageSize: z.number().default(25),
  filter: AnalyticsFilterSchema.default(defaultEntityAnalyticsFilter as AnalyticsFilterType),
  treemapPrimary: z.enum(['fn', 'ec']).optional(),
  treemapDepth: z.enum(['main', 'detail']).optional(),
})

export type EntityAnalyticsSearch = z.infer<typeof searchSchema>

export function useEntityAnalyticsFilter() {
  const navigate = useNavigate({ from: '/entity-analytics' })
  const raw = useSearch({ from: '/entity-analytics' })
  const search = searchSchema.parse(raw)

  const setFilter = (partial: Partial<AnalyticsFilterType>) => {
    navigate({
      search: (prev) => {
        const prevFilter = (prev as EntityAnalyticsSearch).filter ?? defaultEntityAnalyticsFilter
        const merged = { ...prevFilter, ...partial }
        if (!merged.account_category) {
          merged.account_category = 'ch'
        }
    const filterHash = JSON.stringify(merged)
    Analytics.capture(Analytics.EVENTS.EntityAnalyticsFilterChanged, {
      filter_hash: filterHash,
      ...Analytics.summarizeFilter(merged),
    })
        return { ...prev, filter: merged }
      },
      replace: true,
      resetScroll: false,
    })
  }

  const setView = (view: 'table' | 'chart' | 'line-items') => {
    Analytics.capture(Analytics.EVENTS.EntityAnalyticsViewChanged, { view })
    navigate({ search: (prev) => ({ ...prev, view }), replace: true, resetScroll: false })
  }

  const setSorting = (by: string, order: 'asc' | 'desc') => {
    Analytics.capture(Analytics.EVENTS.EntityAnalyticsSortChanged, { by, order })
    navigate({ search: (prev) => ({ ...prev, sortBy: by, sortOrder: order }), replace: true, resetScroll: false })
  }

  const setPagination = (page: number, pageSize?: number) => {
    Analytics.capture(Analytics.EVENTS.EntityAnalyticsPaginationChanged, { page, pageSize: pageSize ?? (search as EntityAnalyticsSearch).pageSize })
    navigate({
      search: (prev) => ({ ...prev, page, pageSize: pageSize ?? (prev as EntityAnalyticsSearch).pageSize }),
      replace: true,
      resetScroll: false,
    })
  }

  const resetFilter = () => {
    Analytics.capture(Analytics.EVENTS.EntityAnalyticsFilterReset)
    navigate({
      search: (prev) => ({ ...prev, filter: defaultEntityAnalyticsFilter }),
      replace: true,
      resetScroll: false,
    })
  }

  const setTreemapPrimary = (primary: 'fn' | 'ec') => {
    navigate({ search: (prev) => ({ ...prev, treemapPrimary: primary }), replace: true, resetScroll: false })
  }

  const setTreemapDepth = (depth: 'main' | 'detail') => {
    navigate({ search: (prev) => ({ ...prev, treemapDepth: depth }), replace: true, resetScroll: false })
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
    treemapPrimary: search.treemapPrimary,
    treemapDepth: search.treemapDepth,
    setTreemapPrimary,
    setTreemapDepth,
  }
}


