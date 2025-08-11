import { useMemo, useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { EntityAnalyticsFilter as EntityAnalyticsFilterPanel } from '@/components/filters/EntityAnalyticsFilter'
import { useEntityAnalyticsFilter } from '@/hooks/useEntityAnalyticsFilter'
import { fetchEntityAnalytics } from '@/lib/api/entity-analytics'
import { EntityAnalyticsTable } from '@/components/entity-analytics/EntityAnalyticsTable'
import type { EntityAnalyticsDataPoint } from '@/schemas/entity-analytics'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SlidersHorizontal } from 'lucide-react'
import { useTablePreferences } from '@/hooks/useTablePreferences'
import { EntityAnalyticsLayout } from '@/components/entity-analytics/EntityAnalyticsLayout'
import { AnalyticsFilterType } from '@/schemas/charts'

export const Route = createLazyFileRoute('/entity-analytics')({
  component: EntityAnalyticsPage,
})

function EntityAnalyticsPage() {
  const { filter, sortBy, sortOrder, setSorting, page, pageSize, setPagination, resetFilter } = useEntityAnalyticsFilter()
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
  const { density, setDensity, columnVisibility, setColumnVisibility, columnPinning, setColumnPinning, columnSizing, setColumnSizing, columnOrder, setColumnOrder, currencyFormat, setCurrencyFormat } = useTablePreferences('entity-analytics', {
    columnVisibility: {
      entity_name: true,
      county_name: true,
      population: true,
      per_capita_amount: true,
      total_amount: true,
    }
  })

  const handleExportCsv = async () => {
    try {
      setExporting(true)
      const total = data?.pageInfo?.totalCount ?? 0
      const pageSizeBatch = 500
      const all: EntityAnalyticsDataPoint[] = []
      for (let fetched = 0; fetched < total; fetched += pageSizeBatch) {
        const batch = await fetchEntityAnalytics({
          filter: normalizeFilterForSort(filter, sortBy),
          sort: sortBy ? { by: mapColumnIdToSortBy(sortBy), order: (normalizeOrder(sortOrder) as 'asc' | 'desc') } : undefined,
          limit: pageSizeBatch,
          offset: fetched,
        })
        all.push(...batch.nodes)
        if (!batch.pageInfo?.hasNextPage) break
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
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => resetFilter()}>Clear filters</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Density</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={density === 'comfortable'} onCheckedChange={() => setDensity('comfortable')}>Comfortable</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={density === 'compact'} onCheckedChange={() => setDensity('compact')}>Compact</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Currency</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={currencyFormat === 'standard'} onCheckedChange={() => setCurrencyFormat('standard')}>Standard</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={currencyFormat === 'compact'} onCheckedChange={() => setCurrencyFormat('compact')}>Compact</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={currencyFormat === 'both'} onCheckedChange={() => setCurrencyFormat('both')}>Both</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={columnVisibility.entity_name !== false} onCheckedChange={(v) => setColumnVisibility((p: Record<string, boolean>) => ({ ...p, entity_name: Boolean(v) }))}>Entity</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={columnVisibility.county_name !== false} onCheckedChange={(v) => setColumnVisibility((p: Record<string, boolean>) => ({ ...p, county_name: Boolean(v) }))}>County</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={columnVisibility.population !== false} onCheckedChange={(v) => setColumnVisibility((p: Record<string, boolean>) => ({ ...p, population: Boolean(v) }))}>Population</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={columnVisibility.per_capita_amount !== false} onCheckedChange={(v) => setColumnVisibility((p: Record<string, boolean>) => ({ ...p, per_capita_amount: Boolean(v) }))}>Per Capita</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={columnVisibility.total_amount !== false} onCheckedChange={(v) => setColumnVisibility((p: Record<string, boolean>) => ({ ...p, total_amount: Boolean(v) }))}>Total Amount</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" disabled={exporting || (data?.pageInfo?.totalCount ?? 0) === 0} onClick={handleExportCsv}>{exporting ? 'Exporting…' : 'Export CSV'}</Button>
          </div>
          <EntityAnalyticsTable
            data={nodes}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder as 'asc' | 'desc' | undefined}
            onSortChange={(by, order) => setSorting(by, order)}
            density={density}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            columnPinning={columnPinning}
            onColumnPinningChange={setColumnPinning}
            columnSizing={columnSizing}
            onColumnSizingChange={setColumnSizing}
            columnOrder={columnOrder}
            onColumnOrderChange={setColumnOrder}
            currencyFormat={currencyFormat}
            rowNumberStart={offset}
          />
          {data?.pageInfo?.totalCount ? (
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={data.pageInfo.totalCount || 0}
              onPageChange={(p: number) => setPagination(p)}
              onPageSizeChange={(s: number) => setPagination(1, s)}
              isLoading={isLoading}
              pageSizeOptions={[25, 50, 100]}
            />
          ) : null}
        </div>
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

function normalizeFilterForSort(filter: AnalyticsFilterType, sortBy?: string) {
  // Ensure the server interprets `amount` according to normalization:
  // - if sorting explicitly by `amount`, we let the API map it based on normalization
  // - otherwise pass filter as-is
  if (!sortBy) return filter
  return filter
}


