// ═══════════════════════════════════════════════════════════════════════════
// UATTypeBreakdown Data Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Example of a specific administrative unit
 */
export interface UATExample {
  readonly name: string
  readonly population?: string
}

/**
 * A category of administrative units (e.g., Counties, Municipalities)
 */
export interface UATCategory {
  readonly id: string
  readonly name: string
  readonly nameRo: string
  readonly count: number
  readonly populationMin?: string
  readonly description: string
  readonly descriptionRo: string
  readonly examples: readonly UATExample[]
  readonly color: 'slate' | 'blue' | 'indigo' | 'emerald'
  readonly icon: string
  readonly mapFilterParam?: string
}

/**
 * Complete data structure for the breakdown
 */
export interface UATTypeBreakdownData {
  readonly totalCount: number
  readonly level1: UATCategory
  readonly level2: readonly UATCategory[]
}

/**
 * Localized text strings for the component
 */
export interface UATTypeBreakdownText {
  readonly title: string
  readonly subtitle: string
  readonly level1Label: string
  readonly level2Label: string
  readonly totalLabel: string
  readonly viewMapLabel: string
  readonly legalNoteLabel: string
  readonly clickToExpand: string
  readonly examplesLabel: string
  readonly closeLabel: string
}

/**
 * Color configuration for each category type
 */
export const UAT_COLORS = {
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    bgLight: 'bg-slate-100 dark:bg-slate-900/50',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    accent: 'bg-slate-100 dark:bg-slate-800',
    ring: 'ring-slate-400/20',
    bar: 'bg-slate-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    bgLight: 'bg-blue-100 dark:bg-blue-900/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    accent: 'bg-blue-100 dark:bg-blue-800',
    ring: 'ring-blue-400/20',
    bar: 'bg-blue-500',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    bgLight: 'bg-indigo-100 dark:bg-indigo-900/50',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
    accent: 'bg-indigo-100 dark:bg-indigo-800',
    ring: 'ring-indigo-400/20',
    bar: 'bg-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    bgLight: 'bg-emerald-100 dark:bg-emerald-900/50',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    accent: 'bg-emerald-100 dark:bg-emerald-800',
    ring: 'ring-emerald-400/20',
    bar: 'bg-emerald-500',
  },
} as const
