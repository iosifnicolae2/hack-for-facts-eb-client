import { useEffect, useMemo, useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { EmployeesDataTable } from '@/components/tables/EmployeesDataTable'
import { useCsvData } from '@/hooks/useCsvData'
import { SortingState } from '@tanstack/react-table'
import { Seo } from '@/lib/seo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ExternalLink, Info } from 'lucide-react'
import { useHeatmapData } from '@/hooks/useHeatmapData'
import type { AnalyticsFilterType } from '@/schemas/charts'
import type { HeatmapUATDataPoint } from '@/schemas/heatmap'
import { Input } from '@/components/ui/input'
import Fuse from 'fuse.js'

export const Route = createLazyFileRoute('/research/employees-data')({
  component: EmployeesDataPage,
})

function EmployeesDataPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'employeesPer1000Capita', desc: true }])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 })
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const { data, isLoading, error } = useCsvData()
  // Heatmap data for financial metrics and UAT code (cui-like id)
  const heatmapFilter: AnalyticsFilterType = useMemo(() => ({ years: [2024], account_category: 'ch' }), [])
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
      return {
        ...row,
        __entityCui: hm?.uat_code,
        __uatCode: hm?.uat_code,
        __uatNameAccurate: hm?.uat_name ?? row.uatName,
        __countyName: hm?.county_name,
        __spendingTotal2024: hm?.total_amount ?? 0,
        __spendingPerCapita2024: hm?.per_capita_amount ?? 0,
      }
    })
    if (!debouncedQuery) return enriched
    const fuse = new Fuse(enriched, { keys: ['__uatNameAccurate', 'uatName'], threshold: 0.3, ignoreLocation: true, includeScore: false })
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

  // Debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 200)
    return () => clearTimeout(id)
  }, [query])

  return (
    <div className="mx-auto p-4 space-y-4 md:space-y-6 max-w-screen-2xl">
      <Seo title="Analiza personal UAT" description="Tabel cu indicatori despre personalul UAT și cheltuieli pe 2024." />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Analiza personal UAT</h1>
        <div className="w-full md:w-auto md:min-w-[320px]">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută UAT" className="h-9" />
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
        <EmployeesDataTable data={tableData ?? null} sorting={sorting} setSorting={setSorting} pagination={pagination} setPagination={setPagination} />
      )}

      <DataInfo />
    </div>
  )
}

function DataInfo() {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /><span>Despre Date și Metodologie</span></CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">Informațiile prezentate au caracter informativ și reprezintă o imagine a personalului din aparatele proprii ale primăriilor și consiliilor județene din România, la nivelul lunii Septembrie 2025. Sursa datelor este Guvernul României, pe baza raportărilor prefecturilor.</p>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Ce înseamnă 'Limită Legală Simulată'?</AccordionTrigger>
            <AccordionContent>Reprezintă un prag calculat pe baza unei propuneri de reducere cu <strong>15%</strong> a posturilor ocupate (ceea ce corespunde unei reduceri cu 45% a numărului maxim teoretic permis de O.U.G. 63/2010). Este o simulare pentru a evalua impactul unor posibile reforme, nu o limită legală în vigoare.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Sunt datele 100% exacte?</AccordionTrigger>
            <AccordionContent>Datele se bazează pe raportări multiple și, conform notei oficiale, s-ar putea înregistra un grad de eroare de aproximativ <strong>±2%</strong> la nivelul întregii țări din cauza unor posibile diferențe de raportare.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Care e diferența dintre 'Posturi Ocupate' și 'Numărul Maxim de Posturi'?</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Posturi Ocupate:</strong> Numărul efectiv de angajați.</li>
                <li><strong>Posturi în Organigramă:</strong> Totalul posturilor aprobate de consiliul local, inclusiv cele vacante.</li>
                <li><strong>Număr Maxim Legal:</strong> Limita superioară de posturi pe care o entitate ar putea să o aibă, conform populației. Majoritatea organigramelor sunt sub acest maxim.</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">La nivel național, aproximativ 32% din totalul posturilor prevăzute de lege sunt fie neînființate, fie vacante.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Ce entități sunt incluse în analiză?</AccordionTrigger>
            <AccordionContent>Analiza include toate UAT-urile (comune, orașe, municipii), Sectoarele Municipiului București, Consiliile Județene și Primăria Generală a Municipiului București.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-6">
          <Button asChild variant="link" className="px-0 h-auto">
            <a href="https://gov.ro/aal/" target="_blank" rel="noopener noreferrer" className="text-sm">Vezi Sursa Oficială pe gov.ro/aal<ExternalLink className="h-4 w-4 ml-1" /></a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
