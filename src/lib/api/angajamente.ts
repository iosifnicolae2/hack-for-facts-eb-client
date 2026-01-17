/**
 * Mock API for Angajamente Bugetare (Budget Commitments)
 *
 * This module provides mock data for UI development.
 * Will be replaced with real GraphQL API calls later.
 */

import type {
  AngajamenteLineItem,
  AngajamenteSummary,
  AngajamentePaginatedResult,
  AngajamenteParams,
  PipelineStage,
  FunctionalBreakdown,
} from '@/schemas/angajamente'

// Mock data based on realistic Romanian budget commitment patterns
const MOCK_LINE_ITEMS: AngajamenteLineItem[] = [
  {
    key: '51.01.03|10.01.01|A|2',
    date: '31-DEC-2024',
    functionalCode: '51.01.03',
    functionalName: 'Autoritati executive',
    economicCode: '10.01.01',
    economicName: 'Salarii de baza',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 1124450,
    crediteButetare: 1124450,
    crediteAngajamentInitiale: 1000000,
    crediteButetareInitiale: 1000000,
    crediteAngajamentDefinitive: 1124450,
    crediteButetareDefinitive: 1124450,
    crediteAngajamentDisponibile: 14450,
    crediteButetareDisponibile: 14450,
    receptiiTotale: 1110000,
    platiTrezor: 1102313,
    platiNonTrezor: 0,
    receptiiNeplatite: 7687,
    monthlyPlatiTrezor: 92000,
    monthlyReceptiiTotale: 95000,
    monthlyCrediteAngajament: 50000,
  },
  {
    key: '51.01.03|10.01.06|A|2',
    date: '31-DEC-2024',
    functionalCode: '51.01.03',
    functionalName: 'Autoritati executive',
    economicCode: '10.01.06',
    economicName: 'Alte sporuri',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 250000,
    crediteButetare: 250000,
    crediteAngajamentInitiale: 200000,
    crediteButetareInitiale: 200000,
    crediteAngajamentDefinitive: 250000,
    crediteButetareDefinitive: 250000,
    crediteAngajamentDisponibile: 12000,
    crediteButetareDisponibile: 12000,
    receptiiTotale: 238000,
    platiTrezor: 235000,
    platiNonTrezor: 0,
    receptiiNeplatite: 3000,
    monthlyPlatiTrezor: 20000,
    monthlyReceptiiTotale: 21000,
    monthlyCrediteAngajament: 10000,
  },
  {
    key: '51.01.03|10.03.01|A|2',
    date: '31-DEC-2024',
    functionalCode: '51.01.03',
    functionalName: 'Autoritati executive',
    economicCode: '10.03.01',
    economicName: 'Contributii de asigurari sociale de stat',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 180000,
    crediteButetare: 180000,
    crediteAngajamentInitiale: 160000,
    crediteButetareInitiale: 160000,
    crediteAngajamentDefinitive: 180000,
    crediteButetareDefinitive: 180000,
    crediteAngajamentDisponibile: 5000,
    crediteButetareDisponibile: 5000,
    receptiiTotale: 175000,
    platiTrezor: 172000,
    platiNonTrezor: 0,
    receptiiNeplatite: 3000,
    monthlyPlatiTrezor: 15000,
    monthlyReceptiiTotale: 15500,
    monthlyCrediteAngajament: 5000,
  },
  {
    key: '65.03.01|20.01.01|A|2',
    date: '31-DEC-2024',
    functionalCode: '65.03.01',
    functionalName: 'Invatamant prescolar',
    economicCode: '20.01.01',
    economicName: 'Furnituri de birou',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 50000,
    crediteButetare: 50000,
    crediteAngajamentInitiale: 40000,
    crediteButetareInitiale: 40000,
    crediteAngajamentDefinitive: 50000,
    crediteButetareDefinitive: 50000,
    crediteAngajamentDisponibile: 8000,
    crediteButetareDisponibile: 8000,
    receptiiTotale: 42000,
    platiTrezor: 40000,
    platiNonTrezor: 0,
    receptiiNeplatite: 2000,
    monthlyPlatiTrezor: 5000,
    monthlyReceptiiTotale: 5500,
    monthlyCrediteAngajament: 3000,
  },
  {
    key: '65.03.01|20.01.03|A|2',
    date: '31-DEC-2024',
    functionalCode: '65.03.01',
    functionalName: 'Invatamant prescolar',
    economicCode: '20.01.03',
    economicName: 'Incalzit, iluminat si forta motrica',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 120000,
    crediteButetare: 120000,
    crediteAngajamentInitiale: 100000,
    crediteButetareInitiale: 100000,
    crediteAngajamentDefinitive: 120000,
    crediteButetareDefinitive: 120000,
    crediteAngajamentDisponibile: 15000,
    crediteButetareDisponibile: 15000,
    receptiiTotale: 105000,
    platiTrezor: 100000,
    platiNonTrezor: 0,
    receptiiNeplatite: 5000,
    monthlyPlatiTrezor: 12000,
    monthlyReceptiiTotale: 13000,
    monthlyCrediteAngajament: 8000,
  },
  {
    key: '67.02|20.30.30|A|2',
    date: '31-DEC-2024',
    functionalCode: '67.02',
    functionalName: 'Servicii culturale',
    economicCode: '20.30.30',
    economicName: 'Alte cheltuieli cu bunuri si servicii',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 85000,
    crediteButetare: 85000,
    crediteAngajamentInitiale: 70000,
    crediteButetareInitiale: 70000,
    crediteAngajamentDefinitive: 85000,
    crediteButetareDefinitive: 85000,
    crediteAngajamentDisponibile: 20000,
    crediteButetareDisponibile: 20000,
    receptiiTotale: 65000,
    platiTrezor: 60000,
    platiNonTrezor: 0,
    receptiiNeplatite: 5000,
    monthlyPlatiTrezor: 8000,
    monthlyReceptiiTotale: 9000,
    monthlyCrediteAngajament: 5000,
  },
  {
    key: '70.02.03|71.01.01|A|2',
    date: '31-DEC-2024',
    functionalCode: '70.02.03',
    functionalName: 'Locuinte',
    economicCode: '71.01.01',
    economicName: 'Constructii',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 500000,
    crediteButetare: 500000,
    crediteAngajamentInitiale: 600000,
    crediteButetareInitiale: 600000,
    crediteAngajamentDefinitive: 500000,
    crediteButetareDefinitive: 500000,
    crediteAngajamentDisponibile: 150000,
    crediteButetareDisponibile: 150000,
    receptiiTotale: 350000,
    platiTrezor: 320000,
    platiNonTrezor: 0,
    receptiiNeplatite: 30000,
    monthlyPlatiTrezor: 45000,
    monthlyReceptiiTotale: 50000,
    monthlyCrediteAngajament: 0,
  },
  {
    key: '74.02.05|20.01.09|A|2',
    date: '31-DEC-2024',
    functionalCode: '74.02.05',
    functionalName: 'Salubritate si gestiunea deseurilor',
    economicCode: '20.01.09',
    economicName: 'Materiale si prestari de servicii cu caracter functional',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 200000,
    crediteButetare: 200000,
    crediteAngajamentInitiale: 180000,
    crediteButetareInitiale: 180000,
    crediteAngajamentDefinitive: 200000,
    crediteButetareDefinitive: 200000,
    crediteAngajamentDisponibile: 25000,
    crediteButetareDisponibile: 25000,
    receptiiTotale: 175000,
    platiTrezor: 168000,
    platiNonTrezor: 0,
    receptiiNeplatite: 7000,
    monthlyPlatiTrezor: 18000,
    monthlyReceptiiTotale: 19000,
    monthlyCrediteAngajament: 10000,
  },
  // Add an item with YTD anomaly for demo
  {
    key: '84.02.01|10.01.01|A|2',
    date: '31-DEC-2024',
    functionalCode: '84.02.01',
    functionalName: 'Transporturi rutiere',
    economicCode: '10.01.01',
    economicName: 'Salarii de baza',
    fundingSource: 'A',
    fundingSourceDescription: 'Integral de la buget',
    crediteAngajament: 95000,
    crediteButetare: 95000,
    crediteAngajamentInitiale: 100000,
    crediteButetareInitiale: 100000,
    crediteAngajamentDefinitive: 95000,
    crediteButetareDefinitive: 95000,
    crediteAngajamentDisponibile: 5000,
    crediteButetareDisponibile: 5000,
    receptiiTotale: 90000,
    platiTrezor: 88000,
    platiNonTrezor: 0,
    receptiiNeplatite: 2000,
    monthlyPlatiTrezor: -5000, // Negative indicates correction
    monthlyReceptiiTotale: 8000,
    monthlyCrediteAngajament: -5000,
    anomaly: 'YTD_ANOMALY',
  },
]

/**
 * Simulates API delay for realistic UX
 */
function simulateDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get paginated Angajamente line items
 */
export async function getAngajamenteData(
  params: AngajamenteParams
): Promise<AngajamentePaginatedResult> {
  await simulateDelay()

  let filtered = [...MOCK_LINE_ITEMS]

  // Filter by functional code prefix if provided
  if (params.functionalCodePrefix) {
    filtered = filtered.filter((item) =>
      item.functionalCode.startsWith(params.functionalCodePrefix!)
    )
  }

  // Filter by economic code prefix if provided
  if (params.economicCodePrefix) {
    filtered = filtered.filter((item) =>
      item.economicCode?.startsWith(params.economicCodePrefix!)
    )
  }

  // Filter by funding source if provided
  if (params.fundingSource) {
    filtered = filtered.filter((item) => item.fundingSource === params.fundingSource)
  }

  // Pagination
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = filtered.slice(start, end)

  return {
    data,
    totalCount,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    currentPage: page,
    pageSize,
    totalPages,
  }
}

/**
 * Get aggregated summary for an entity
 */
export async function getAngajamenteSummary(
  _cui: string,
  _year: number
): Promise<AngajamenteSummary> {
  await simulateDelay(200)

  // Aggregate from mock data
  const totals = MOCK_LINE_ITEMS.reduce(
    (acc, item) => ({
      totalCrediteAngajament: acc.totalCrediteAngajament + item.crediteAngajament,
      totalCrediteButetare: acc.totalCrediteButetare + item.crediteButetare,
      totalCrediteButetareDefinitive:
        acc.totalCrediteButetareDefinitive + item.crediteButetareDefinitive,
      totalReceptii: acc.totalReceptii + item.receptiiTotale,
      totalPlati: acc.totalPlati + item.platiTrezor,
      totalArierate: acc.totalArierate + item.receptiiNeplatite,
    }),
    {
      totalCrediteAngajament: 0,
      totalCrediteButetare: 0,
      totalCrediteButetareDefinitive: 0,
      totalReceptii: 0,
      totalPlati: 0,
      totalArierate: 0,
    }
  )

  const utilizationRate =
    totals.totalCrediteButetare > 0
      ? (totals.totalPlati / totals.totalCrediteButetare) * 100
      : 0

  const commitmentRate =
    totals.totalCrediteButetare > 0
      ? (totals.totalCrediteAngajament / totals.totalCrediteButetare) * 100
      : 0

  return {
    ...totals,
    utilizationRate: Math.round(utilizationRate * 100) / 100,
    commitmentRate: Math.round(commitmentRate * 100) / 100,
  }
}

/**
 * Get pipeline stages for visualization
 */
export async function getAngajamentePipeline(
  cui: string,
  year: number
): Promise<PipelineStage[]> {
  const summary = await getAngajamenteSummary(cui, year)

  const baseValue = summary.totalCrediteButetareDefinitive

  const getStatus = (percentage: number): 'healthy' | 'warning' | 'danger' => {
    if (percentage >= 90) return 'healthy'
    if (percentage >= 70) return 'warning'
    return 'danger'
  }

  const stages: PipelineStage[] = [
    {
      id: 'credits',
      label: 'Credite Bugetare',
      value: summary.totalCrediteButetareDefinitive,
      percentage: 100,
      status: 'healthy',
    },
    {
      id: 'commitments',
      label: 'Angajamente',
      value: summary.totalCrediteAngajament,
      percentage:
        baseValue > 0
          ? Math.round((summary.totalCrediteAngajament / baseValue) * 100)
          : 0,
      status: getStatus(
        baseValue > 0 ? (summary.totalCrediteAngajament / baseValue) * 100 : 0
      ),
    },
    {
      id: 'receipts',
      label: 'Receptii',
      value: summary.totalReceptii,
      percentage:
        baseValue > 0 ? Math.round((summary.totalReceptii / baseValue) * 100) : 0,
      status: getStatus(baseValue > 0 ? (summary.totalReceptii / baseValue) * 100 : 0),
    },
    {
      id: 'payments',
      label: 'Plati',
      value: summary.totalPlati,
      percentage:
        baseValue > 0 ? Math.round((summary.totalPlati / baseValue) * 100) : 0,
      status: getStatus(baseValue > 0 ? (summary.totalPlati / baseValue) * 100 : 0),
    },
  ]

  return stages
}

/**
 * Get line items grouped by functional classification
 */
export async function getAngajamenteByFunctional(
  _cui: string,
  _year: number
): Promise<FunctionalBreakdown[]> {
  await simulateDelay()

  const grouped = new Map<
    string,
    {
      functionalCode: string
      functionalName: string
      totalCredite: number
      totalAngajamente: number
      totalPlati: number
      totalArierate: number
      items: AngajamenteLineItem[]
    }
  >()

  for (const item of MOCK_LINE_ITEMS) {
    const key = item.functionalCode
    const existing = grouped.get(key)

    if (existing) {
      existing.totalCredite += item.crediteButetare
      existing.totalAngajamente += item.crediteAngajament
      existing.totalPlati += item.platiTrezor
      existing.totalArierate += item.receptiiNeplatite
      existing.items.push(item)
    } else {
      grouped.set(key, {
        functionalCode: item.functionalCode,
        functionalName: item.functionalName || item.functionalCode,
        totalCredite: item.crediteButetare,
        totalAngajamente: item.crediteAngajament,
        totalPlati: item.platiTrezor,
        totalArierate: item.receptiiNeplatite,
        items: [item],
      })
    }
  }

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    utilizationRate:
      group.totalCredite > 0
        ? Math.round((group.totalPlati / group.totalCredite) * 100)
        : 0,
    commitmentRate:
      group.totalCredite > 0
        ? Math.round((group.totalAngajamente / group.totalCredite) * 100)
        : 0,
  }))
}
