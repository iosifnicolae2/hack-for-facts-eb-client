// ═══════════════════════════════════════════════════════════════════════════
// UATFinder Types and Constants
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Romania's 42 counties (41 + București)
 * Used for the county filter dropdown
 */
export const ROMANIA_COUNTIES = [
  { code: 'AB', name: 'Alba', nameRo: 'Alba' },
  { code: 'AR', name: 'Arad', nameRo: 'Arad' },
  { code: 'AG', name: 'Argeș', nameRo: 'Argeș' },
  { code: 'BC', name: 'Bacău', nameRo: 'Bacău' },
  { code: 'BH', name: 'Bihor', nameRo: 'Bihor' },
  { code: 'BN', name: 'Bistrița-Năsăud', nameRo: 'Bistrița-Năsăud' },
  { code: 'BT', name: 'Botoșani', nameRo: 'Botoșani' },
  { code: 'BV', name: 'Brașov', nameRo: 'Brașov' },
  { code: 'BR', name: 'Brăila', nameRo: 'Brăila' },
  { code: 'B', name: 'București', nameRo: 'București' },
  { code: 'BZ', name: 'Buzău', nameRo: 'Buzău' },
  { code: 'CS', name: 'Caraș-Severin', nameRo: 'Caraș-Severin' },
  { code: 'CL', name: 'Călărași', nameRo: 'Călărași' },
  { code: 'CJ', name: 'Cluj', nameRo: 'Cluj' },
  { code: 'CT', name: 'Constanța', nameRo: 'Constanța' },
  { code: 'CV', name: 'Covasna', nameRo: 'Covasna' },
  { code: 'DB', name: 'Dâmbovița', nameRo: 'Dâmbovița' },
  { code: 'DJ', name: 'Dolj', nameRo: 'Dolj' },
  { code: 'GL', name: 'Galați', nameRo: 'Galați' },
  { code: 'GR', name: 'Giurgiu', nameRo: 'Giurgiu' },
  { code: 'GJ', name: 'Gorj', nameRo: 'Gorj' },
  { code: 'HR', name: 'Harghita', nameRo: 'Harghita' },
  { code: 'HD', name: 'Hunedoara', nameRo: 'Hunedoara' },
  { code: 'IL', name: 'Ialomița', nameRo: 'Ialomița' },
  { code: 'IS', name: 'Iași', nameRo: 'Iași' },
  { code: 'IF', name: 'Ilfov', nameRo: 'Ilfov' },
  { code: 'MM', name: 'Maramureș', nameRo: 'Maramureș' },
  { code: 'MH', name: 'Mehedinți', nameRo: 'Mehedinți' },
  { code: 'MS', name: 'Mureș', nameRo: 'Mureș' },
  { code: 'NT', name: 'Neamț', nameRo: 'Neamț' },
  { code: 'OT', name: 'Olt', nameRo: 'Olt' },
  { code: 'PH', name: 'Prahova', nameRo: 'Prahova' },
  { code: 'SM', name: 'Satu Mare', nameRo: 'Satu Mare' },
  { code: 'SJ', name: 'Sălaj', nameRo: 'Sălaj' },
  { code: 'SB', name: 'Sibiu', nameRo: 'Sibiu' },
  { code: 'SV', name: 'Suceava', nameRo: 'Suceava' },
  { code: 'TR', name: 'Teleorman', nameRo: 'Teleorman' },
  { code: 'TM', name: 'Timiș', nameRo: 'Timiș' },
  { code: 'TL', name: 'Tulcea', nameRo: 'Tulcea' },
  { code: 'VS', name: 'Vaslui', nameRo: 'Vaslui' },
  { code: 'VL', name: 'Vâlcea', nameRo: 'Vâlcea' },
  { code: 'VN', name: 'Vrancea', nameRo: 'Vrancea' },
] as const

export type CountyCode = typeof ROMANIA_COUNTIES[number]['code']

/**
 * UAT types mapped from entity_type values
 */
export const UAT_TYPE_MAP: Record<string, UATType> = {
  'admin_uat_municipality': 'municipality',
  'admin_uat_town': 'town',
  'admin_uat_commune': 'commune',
  'admin_county_council': 'county',
  'admin_uat_sector': 'sector', // București sectors
} as const

export type UATType = 'municipality' | 'town' | 'commune' | 'county' | 'sector'

/**
 * Display configuration for UAT types
 */
export const UAT_TYPE_CONFIG: Record<UATType, {
  label: string
  labelRo: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  municipality: {
    label: 'Municipality',
    labelRo: 'Municipiu',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  town: {
    label: 'Town',
    labelRo: 'Oraș',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
  commune: {
    label: 'Commune',
    labelRo: 'Comună',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  county: {
    label: 'County',
    labelRo: 'Județ',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    borderColor: 'border-slate-200 dark:border-slate-800',
  },
  sector: {
    label: 'Sector',
    labelRo: 'Sector',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Basic UAT search result from entity search
 */
export interface UATSearchResult {
  readonly cui: string
  readonly name: string
  readonly type: UATType
  readonly countyCode: string | null
  readonly countyName: string | null
}

/**
 * Full UAT details with budget metrics
 */
export interface UATDetailResult extends UATSearchResult {
  readonly population: number | null
  readonly totalBudget: number | null
  readonly perCapita: number | null
}

/**
 * Props for the UATFinder component
 */
export interface UATFinderProps {
  readonly locale: 'en' | 'ro'
  readonly text: UATFinderText
  readonly onSelect?: (uat: UATDetailResult) => void
  /** Unique ID for localStorage persistence (allows multiple instances) */
  readonly finderId?: string
}

/**
 * Localized text for the UATFinder component
 */
export interface UATFinderText {
  readonly title: string
  readonly subtitle: string
  readonly searchPlaceholder: string
  readonly recentSearchesLabel: string
  readonly noResultsMessage: string
  readonly loadingMessage: string
  readonly errorMessage: string
  // Detail card
  readonly typeLabel: string
  readonly countyLabel: string
  readonly populationLabel: string
  readonly totalBudgetLabel: string
  readonly perCapitaLabel: string
  readonly dataYearLabel: string
  // Actions
  readonly viewDetailsLabel: string
  readonly compareLabel: string
  readonly viewOnMapLabel: string
  readonly clearLabel: string
}

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Map entity_type to UATType
 */
export function getUATType(entityType: string | null | undefined): UATType | null {
  if (!entityType) return null
  return UAT_TYPE_MAP[entityType] ?? null
}

/**
 * Check if an entity type is a UAT
 */
export function isUATEntityType(entityType: string | null | undefined): boolean {
  if (!entityType) return false
  return entityType in UAT_TYPE_MAP
}

/**
 * Get county by code
 */
export function getCountyByCode(code: string): typeof ROMANIA_COUNTIES[number] | undefined {
  return ROMANIA_COUNTIES.find(c => c.code === code)
}

/**
 * Format population number
 */
export function formatPopulation(population: number | null | undefined, locale: 'en' | 'ro'): string {
  if (population == null) return '-'
  return new Intl.NumberFormat(locale === 'ro' ? 'ro-RO' : 'en-US').format(population)
}

/**
 * Format budget amount in RON
 */
export function formatBudget(amount: number | null | undefined, locale: 'en' | 'ro'): string {
  if (amount == null) return '-'
  
  const formatter = new Intl.NumberFormat(locale === 'ro' ? 'ro-RO' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  // Convert to millions/billions for readability
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000
    return `${formatter.format(Math.round(billions * 10) / 10)} ${locale === 'ro' ? 'mld' : 'B'} RON`
  }
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    return `${formatter.format(Math.round(millions * 10) / 10)} ${locale === 'ro' ? 'mil' : 'M'} RON`
  }
  if (amount >= 1_000) {
    const thousands = amount / 1_000
    return `${formatter.format(Math.round(thousands))} ${locale === 'ro' ? 'mii' : 'K'} RON`
  }
  return `${formatter.format(amount)} RON`
}

/**
 * Format per-capita amount
 */
export function formatPerCapita(amount: number | null | undefined, locale: 'en' | 'ro'): string {
  if (amount == null) return '-'
  
  const formatter = new Intl.NumberFormat(locale === 'ro' ? 'ro-RO' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return `${formatter.format(Math.round(amount))} RON`
}
