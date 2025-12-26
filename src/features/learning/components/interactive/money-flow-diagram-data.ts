// ═══════════════════════════════════════════════════════════════════════════
// MoneyFlowDiagram Data Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A type of transfer from central to local budget
 */
export interface TransferType {
  readonly id: string
  readonly name: string
  readonly nameRo: string
  readonly percentageRange: string
  readonly percentageMin: number
  readonly percentageMax: number
  readonly description: string
  readonly descriptionRo: string
  readonly details: readonly string[]
  readonly detailsRo: readonly string[]
  readonly color: 'blue' | 'purple' | 'amber'
  readonly icon: string
}

/**
 * Own revenue sources for local budgets
 */
export interface OwnRevenueSource {
  readonly id: string
  readonly name: string
  readonly nameRo: string
  readonly percentage: number
  readonly items: readonly string[]
  readonly itemsRo: readonly string[]
}

/**
 * Complete data structure for the diagram
 */
export interface MoneyFlowDiagramData {
  readonly centralBudget: {
    readonly name: string
    readonly nameRo: string
  }
  readonly localBudget: {
    readonly name: string
    readonly nameRo: string
  }
  readonly transfers: readonly TransferType[]
  readonly ownRevenues: OwnRevenueSource
  readonly totalCentralPercentage: number
}

/**
 * Localized text strings for the component
 */
export interface MoneyFlowDiagramText {
  readonly title: string
  readonly subtitle: string
  readonly centralLabel: string
  readonly localLabel: string
  readonly ownRevenuesLabel: string
  readonly keyInsightTitle: string
  readonly keyInsightText: string
  readonly clickToLearnMore: string
  readonly closeLabel: string
  readonly fromCenterLabel: string
  readonly detailsLabel: string
}

/**
 * Color configuration for each transfer type
 */
export const TRANSFER_COLORS = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    bgSolid: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    ring: 'ring-blue-400/30',
    stroke: '#3B82F6',
    fill: 'fill-blue-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    bgSolid: 'bg-purple-500',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    ring: 'ring-purple-400/30',
    stroke: '#8B5CF6',
    fill: 'fill-purple-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    bgSolid: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    ring: 'ring-amber-400/30',
    stroke: '#F59E0B',
    fill: 'fill-amber-500',
  },
} as const
