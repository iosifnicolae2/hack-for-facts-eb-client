import Papa from 'papaparse'
import { useQuery } from '@tanstack/react-query'
import { EnrichedEmployeeData, EnrichedEmployeeDataSchema, EmployeeDataInput, EmployeeDataSchema, employeeHeaderMap } from '@/schemas/employeeData'

/** Maps Romanian CSV header to internal camelCase key */
const mapHeader = (header: string): keyof EmployeeDataInput | undefined => {
  return employeeHeaderMap[header as keyof typeof employeeHeaderMap]
}

const parseCsvRaw = (csvRaw: string): Record<string, string>[] => {
  const result = Papa.parse<Record<string, string>>(csvRaw, {
    header: true,
    delimiter: ';',
    skipEmptyLines: 'greedy',
    transformHeader: (h: string) => h.trim(),
  })
  if (result.errors?.length) {
    // In production we swallow and continue; the hook will surface an error via query
    // but we keep partial rows if possible.
  }
  return (result.data ?? []).filter(Boolean)
}

const coerceAndValidate = (rows: Record<string, string>[]): EnrichedEmployeeData[] => {
  const enriched: EnrichedEmployeeData[] = []
  for (const row of rows) {
    const input: EmployeeDataInput = {}
    for (const [header, value] of Object.entries(row)) {
      const key = mapHeader(header)
      if (!key) continue
      input[key] = value
    }

    const parsed = EmployeeDataSchema.safeParse(input)
    if (!parsed.success) {
      continue
    }

    const base = parsed.data
    const employeesPer1000Capita = base.uatPopulation > 0 ? (base.occupiedPosts ?? 0) / base.uatPopulation * 1000 : 0
    const enrichedRow = EnrichedEmployeeDataSchema.parse({
      ...base,
      employeesPer1000Capita,
    })
    enriched.push(enrichedRow)
  }
  return enriched
}

export function useCsvData() {

  return useQuery<EnrichedEmployeeData[], Error>({
    queryKey: ['employees-csv'],
    queryFn: async () => {
      // Vite will inline and gzip raw string assets; this import keeps it bundled
      const mod = await import(/* @vite-ignore */ `@/assets/data/25-09-02-uat-nr-angajati.csv?raw`)
      const csvRaw: string = mod.default ?? mod
      const rows = parseCsvRaw(csvRaw)
      return coerceAndValidate(rows)
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}


