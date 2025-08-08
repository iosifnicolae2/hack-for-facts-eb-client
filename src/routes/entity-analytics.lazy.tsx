import { useMemo, useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EntityAnalyticsFilter as EntityAnalyticsFilterPanel } from '@/components/filters/EntityAnalyticsFilter'
import { useEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'
import { fetchEntityAnalytics } from '@/lib/api/entity-analytics'
import { EntityAnalyticsTable } from '@/components/entity-analytics/EntityAnalyticsTable'
import { EntityAnalyticsCharts } from '@/components/entity-analytics/EntityAnalyticsCharts'
import type { EntityAnalyticsDataPoint } from '@/schemas/entity-analytics'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EntityAnalyticsLayout } from '@/components/entity-analytics/EntityAnalyticsLayout'

export const Route = createLazyFileRoute('/entity-analytics')({
  component: EntityAnalyticsPage,
})

function EntityAnalyticsPage() {
  const { filter, view, sortBy, sortOrder, setSorting, page, pageSize, setPagination, resetFilter } = useEntityAnalyticsFilter()
  const [exporting, setExporting] = useState(false)

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize])

  const { data, isLoading, error } = useQuery({
    queryKey: ['entity-analytics', filter, sortBy, sortOrder, page, pageSize],
    queryFn: () =>
      fetchEntityAnalytics({
        filter: normalizeFilterForSort(filter, sortBy),
        sort: sortBy
          ? { by: mapColumnIdToSortBy(sortBy), order: (normalizeOrder(sortOrder) as 'asc' | 'desc') }
          : undefined,
        limit: pageSize,
        offset,
      }),
  })

  const nodes: readonly EntityAnalyticsDataPoint[] = data?.nodes ?? []

  const handleExportCsv = async () => {
    try {
      setExporting(true)
      const total = data?.pageInfo?.totalCount ?? 0
      const maxRows = Math.min(total || 0, 5000)
      const pageSizeBatch = 500
      const pages = Math.ceil(maxRows / pageSizeBatch)
      const all: EntityAnalyticsDataPoint[] = []
      for (let i = 0; i < pages; i++) {
        const batch = await fetchEntityAnalytics({
          filter: normalizeFilterForSort(filter, sortBy),
          sort: sortBy ? { by: mapColumnIdToSortBy(sortBy), order: (normalizeOrder(sortOrder) as 'asc' | 'desc') } : undefined,
          limit: pageSizeBatch,
          offset: i * pageSizeBatch,
        })
        all.push(...batch.nodes)
      }
      const header = [
        'entity_cui',
        'entity_name',
        'entity_type',
        'county_code',
        'county_name',
        'population',
        'total_amount',
        'per_capita_amount',
      ]
      const rows = all.map((d) => [
        d.entity_cui,
        d.entity_name,
        d.entity_type ?? '',
        d.county_code ?? '',
        d.county_name ?? '',
        String(d.population ?? ''),
        String(d.total_amount),
        String(d.per_capita_amount),
      ])
      const csv = [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'entity-analytics.csv'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="container mx-auto py-4 px-2 md:px-6 max-w-full">
      <EntityAnalyticsLayout
        filters={<EntityAnalyticsFilterPanel />}
        subtitle="Analyze aggregated values per entity and explore top entities."
      >
      {error ? (
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="font-medium text-red-500">Error loading analytics</h3>
            <p className="text-muted-foreground mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      ) : view === 'table' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => resetFilter()}>Clear filters</Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPagination(1, Number(v))}>
                <SelectTrigger className="h-8 w-[90px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[25, 50, 100].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" disabled={exporting || (data?.pageInfo?.totalCount ?? 0) === 0} onClick={handleExportCsv}>{exporting ? 'Exporting…' : 'Export CSV'}</Button>
          </div>
          <EntityAnalyticsTable
            data={nodes}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder as 'asc' | 'desc' | undefined}
            onSortChange={(by, order) => setSorting(by, order)}
          />
          {data?.pageInfo?.totalCount ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {Math.max(1, Math.ceil((data.pageInfo.totalCount || 0) / pageSize))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPagination(page - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading || page >= Math.ceil((data.pageInfo.totalCount || 0) / pageSize)}
                  onClick={() => setPagination(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <EntityAnalyticsCharts data={nodes} normalization={filter.normalization ?? 'per_capita'} />
      )}
      </EntityAnalyticsLayout>
    </div>
  )
}

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

function normalizeOrder(order?: string): 'asc' | 'desc' {
  if (!order) return 'desc'
  return order.toLowerCase() === 'asc' ? 'asc' : 'desc'
}

import type { EntityAnalyticsFilter as EntityAnalyticsFilterType } from '@/schemas/entity-analytics'

function normalizeFilterForSort(filter: EntityAnalyticsFilterType, sortBy?: string) {
  // Ensure the server interprets `amount` according to normalization:
  // - if sorting explicitly by `amount`, we let the API map it based on normalization
  // - otherwise pass filter as-is
  if (!sortBy) return filter
  return filter
}


