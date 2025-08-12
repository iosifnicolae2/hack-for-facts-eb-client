import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { queryClient } from '@/lib/queryClient'
import { fetchAggregatedLineItems, fetchEntityAnalytics } from '@/lib/api/entity-analytics'
import { defaultEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'
import { AnalyticsFilterSchema } from '@/schemas/charts'
import { convertDaysToMs, generateHash } from '@/lib/utils'

const viewEnum = z.enum(['table', 'chart', 'line-items'])

const EntityAnalyticsSchema = z.object({
  view: viewEnum.default('table'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().default(1),
  pageSize: z.number().default(25),
  filter: AnalyticsFilterSchema.default(defaultEntityAnalyticsFilter),
})

export type EntityAnalyticsUrlState = z.infer<typeof EntityAnalyticsSchema>

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
    const parsed = EntityAnalyticsSchema.parse(search)
    const offset = (parsed.page - 1) * parsed.pageSize
    const sort = parsed.sortBy
      ? ({ by: mapColumnIdToSortBy(parsed.sortBy), order: parsed.sortOrder } as const)
      : undefined
    const filterHash = generateHash(JSON.stringify(parsed.filter))

    // Prime the list query so the page renders instantly
    if (parsed.view === 'table') {
      queryClient.prefetchQuery({
        queryKey: ['entity-analytics', filterHash, parsed.sortBy, parsed.sortOrder, parsed.page, parsed.pageSize],
        queryFn: () =>
          fetchEntityAnalytics({
            filter: parsed.filter,
            sort,
            limit: parsed.pageSize,
            offset,
          }),
        staleTime: convertDaysToMs(5),
        gcTime: convertDaysToMs(3),
      } as Parameters<typeof queryClient.prefetchQuery>[0])
    }
  },
})


