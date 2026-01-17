/**
 * Angajamente Bugetare (Budget Commitments) Types
 *
 * These types represent budget commitment data which tracks:
 * - Commitment credits (authorized spending limits)
 * - Budget credits (actual allocations)
 * - Receipts (goods/services received)
 * - Payments (treasury disbursements)
 * - Arrears (unpaid receipts)
 */

/**
 * Individual line item from an Angajamente Bugetare report
 */
export interface AngajamenteLineItem {
  // Identification
  key: string // Composite key: "fn_code|ec_code|funding_source|sector_id"
  date: string // Report date (e.g., "31-JAN-2025")
  functionalCode: string // Functional classification (e.g., "51.01.03")
  functionalName?: string // Functional classification name
  economicCode?: string // Economic classification (e.g., "10.01.01")
  economicName?: string // Economic classification name
  fundingSource?: string // Funding source code (e.g., "A")
  fundingSourceDescription?: string // Funding source description

  // YTD Credit Fields
  crediteAngajament: number // Commitment credits
  crediteButetare: number // Budget credits
  crediteAngajamentInitiale: number // Initial commitment credits
  crediteButetareInitiale: number // Initial budget credits
  crediteAngajamentDefinitive: number // Final commitment credits
  crediteButetareDefinitive: number // Final budget credits
  crediteAngajamentDisponibile: number // Available commitment credits
  crediteButetareDisponibile: number // Available budget credits

  // YTD Payment/Receipt Fields
  receptiiTotale: number // Total receipts (goods/services received)
  platiTrezor: number // Treasury payments
  platiNonTrezor: number // Non-treasury payments
  receptiiNeplatite: number // Unpaid receipts (arrears indicator)

  // Computed Monthly Values
  monthlyPlatiTrezor: number | null
  monthlyReceptiiTotale: number | null
  monthlyCrediteAngajament: number | null

  // Data Quality Flags
  anomaly?: 'YTD_ANOMALY' | 'MISSING_LINE_ITEM'
}

/**
 * Aggregated summary of Angajamente data for an entity
 */
export interface AngajamenteSummary {
  totalCrediteAngajament: number
  totalCrediteButetare: number
  totalCrediteButetareDefinitive: number
  totalReceptii: number
  totalPlati: number
  totalArierate: number // Sum of receptiiNeplatite
  utilizationRate: number // (plati / crediteButetare) * 100
  commitmentRate: number // (crediteAngajament / crediteButetare) * 100
}

/**
 * Pipeline stage data for visualization
 */
export interface PipelineStage {
  id: 'credits' | 'commitments' | 'receipts' | 'payments'
  label: string
  value: number
  percentage: number // Relative to first stage (credits)
  status: 'healthy' | 'warning' | 'danger'
}

/**
 * Breakdown by functional classification
 */
export interface FunctionalBreakdown {
  functionalCode: string
  functionalName: string
  totalCredite: number
  totalAngajamente: number // Total commitment credits
  totalPlati: number
  totalArierate: number
  utilizationRate: number
  commitmentRate: number // (totalAngajamente / totalCredite) * 100
  items: AngajamenteLineItem[]
}

/**
 * Paginated response for Angajamente line items
 */
export interface AngajamentePaginatedResult {
  data: AngajamenteLineItem[]
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  currentPage: number
  pageSize: number
  totalPages: number
}

/**
 * Parameters for fetching Angajamente data
 */
export interface AngajamenteParams {
  cui: string
  year: number
  month?: number
  functionalCodePrefix?: string
  economicCodePrefix?: string
  fundingSource?: string
  page?: number
  pageSize?: number
}

/**
 * Funding source options
 */
export type FundingSource = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'

export const FUNDING_SOURCE_LABELS: Record<FundingSource, string> = {
  A: 'Integral de la buget',
  B: 'Venituri proprii',
  C: 'Credite externe',
  D: 'Credite interne',
  E: 'Fonduri externe nerambursabile',
  F: 'Venituri proprii și subvenții',
  G: 'Subvenții de la bugetul de stat',
  H: 'Subvenții de la alte administrații',
  I: 'Alte surse',
}
