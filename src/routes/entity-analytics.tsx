import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { queryClient } from '@/lib/queryClient'
import { fetchEntityAnalytics } from '@/lib/api/entity-analytics'
import { entityAnalyticsFilterSchema } from '@/schemas/entity-analytics'
import { defaultEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'

const viewEnum = z.enum(['table', 'chart'])

const searchSchema = z.object({
  view: viewEnum.default('table'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  pageSize: z.number().default(25),
  filter: entityAnalyticsFilterSchema.default(defaultEntityAnalyticsFilter),
})

function mapColumnIdToSortBy(columnId: string): string {
  switch (columnId) {
    case 'entity_name':
      return 'entity_name'
    case 'entity_type':
      return 'entity_type'
    case 'county_name':
      return 'county_code'
    case 'population':
      return 'population'
    case 'amount':
      return 'amount'
    case 'total_amount':
      return 'total_amount'
    case 'per_capita_amount':
      return 'per_capita_amount'
    default:
      return columnId
  }
}

export const Route = createFileRoute('/entity-analytics')({
  beforeLoad: ({ search }) => {
    const parsed = searchSchema.parse(search)
    const offset = (parsed.page - 1) * parsed.pageSize
    const sort = parsed.sortBy
      ? ({ by: mapColumnIdToSortBy(parsed.sortBy), order: parsed.sortOrder } as const)
      : undefined

    // Prime the list query so the page renders instantly
    queryClient.prefetchQuery({
      queryKey: ['entity-analytics', parsed.filter, parsed.sortBy, parsed.sortOrder, parsed.page, parsed.pageSize],
      queryFn: () =>
        fetchEntityAnalytics({
          filter: parsed.filter,
          sort,
          limit: parsed.pageSize,
          offset,
        }),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 3,
    } as Parameters<typeof queryClient.prefetchQuery>[0])
  },
})


