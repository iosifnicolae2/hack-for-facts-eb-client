import { useEffect, useMemo, useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { EmployeesDataTable } from '@/components/tables/EmployeesDataTable'
import { useCsvData } from '@/hooks/useCsvData'
import { SortingState } from '@tanstack/react-table'
import { getSiteUrl } from '@/config/env'
import { useHeatmapData } from '@/hooks/useHeatmapData'
import type { AnalyticsFilterType } from '@/schemas/charts'
import type { HeatmapUATDataPoint } from '@/schemas/heatmap'
import { Input } from '@/components/ui/input'
import Fuse from 'fuse.js'
import { useDebouncedValue } from '@/lib/hooks'
import { EntityEmployeesDataInfo } from '@/components/entities/EntityEmployeesDataInfo'
import { withDefaultExcludes } from '@/lib/filterUtils'

export const Route = createLazyFileRoute('/research/employees-data')({
  component: EmployeesDataPage,
})

function EmployeesDataPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'employeesPer1000Capita', desc: true }])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 })
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 500)

  const { data, isLoading, error } = useCsvData()
  // Heatmap data for financial metrics and UAT code (cui-like id)
  const heatmapFilter: AnalyticsFilterType = useMemo(
    () => withDefaultExcludes({ years: [2024], account_category: 'ch' } as AnalyticsFilterType),
    []
  )
  const { data: heatmapRaw } = useHeatmapData(heatmapFilter, 'UAT')

  const tableData = useMemo(() => {
    const heatmap = (heatmapRaw as HeatmapUATDataPoint[] | undefined) ?? []
    const bySiruta = new Map<number, HeatmapUATDataPoint>()
    for (const h of heatmap) {
      const sirutaNum = Number(h.siruta_code)
      if (!Number.isNaN(sirutaNum)) bySiruta.set(sirutaNum, h)
    }
    const enriched = (data ?? []).map((row) => {
      const hm = bySiruta.get(row.sirutaCode)
      const baseName = hm?.uat_name ?? row.uatName
      const countyName = hm?.county_name ? `- Jud. ${hm.county_name}` : ''
      const uatNameAccurate = `${baseName} ${countyName}`.trim()
      return {
        ...row,
        __entityCui: hm?.uat_code,
        __uatCode: hm?.uat_code,
        __uatNameAccurate: uatNameAccurate,
        __countyName: hm?.county_name,
        __spendingTotal2024: hm?.total_amount ?? 0,
        __spendingPerCapita2024: hm?.per_capita_amount ?? 0,
      }
    })
    if (!debouncedQuery) return enriched
    const fuse = new Fuse(enriched, { keys: ['__uatNameAccurate'], threshold: 0.3, ignoreLocation: false, includeScore: false, shouldSort: true })
    return fuse.search(debouncedQuery).map(r => r.item)
  }, [data, heatmapRaw, debouncedQuery])

  // Ensure we keep `view=table` in the URL for future extensibility
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('view') !== 'table') {
      url.searchParams.set('view', 'table')
      window.history.replaceState(null, '', url)
    }
  }, [])

  return (
    <div className="container mx-auto py-4 space-y-4 px-2 md:px-6 max-w-full">
      {/* Head handled by Route.head */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Analiza personal UAT</h1>
        <div className="w-full md:w-auto md:min-w-[320px] md:max-w-md">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută UAT" className="h-9 bg-white" />
        </div>
      </div>

      {error ? (
        <div className="text-red-600">{error.message}</div>
      ) : isLoading ? (
        <div className="rounded-md border space-y-2 p-4 bg-card animate-pulse">
          <div className="h-8 bg-muted rounded" />
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/50 rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full items-start">
          <section className="w-full">
            <div className="rounded-lg border border-border bg-card shadow-sm min-h-[300px]">
              <EmployeesDataTable data={tableData ?? null} sorting={sorting} setSorting={setSorting} pagination={pagination} setPagination={setPagination} />
            </div>
          </section>
        </div>
      )}

      <EntityEmployeesDataInfo />
    </div>
  )
}

function buildEmployeesDataHead() {
  const site = getSiteUrl()
  const canonical = `${site}/research/employees-data`
  const title = 'Analiza personal UAT'
  const description = 'Tabel cu indicatori despre personalul UAT și cheltuieli pe 2024.'
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:url', content: canonical },
      { name: 'canonical', content: canonical },
    ],
  }
}

export function head() {
  return buildEmployeesDataHead()
}
