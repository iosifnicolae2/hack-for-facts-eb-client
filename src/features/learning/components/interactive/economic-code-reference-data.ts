/**
 * Types and styling constants for EconomicCodeReference component
 *
 * Data is passed via MDX props for easier translation support.
 * The component teaches Romania's economic classification system
 * with emphasis on Code 71 (investments) as a key "red flag" indicator.
 */

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

/** Subcode within an economic code (e.g., 10.01, 10.02 under Code 10) */
export interface EconomicSubcodeProp {
  readonly code: string
  readonly name: string
  readonly examples?: readonly string[]
}

/** Individual economic code with optional subcodes */
export interface EconomicCodeProp {
  readonly code: string
  readonly name: string
  readonly description?: string
  readonly executionRate?: number // e.g., 95 for 95%
  readonly isWarningFlag?: boolean
  readonly subcodes?: readonly EconomicSubcodeProp[]
}

/** Category grouping codes by type */
export interface EconomicCategoryProp {
  readonly type: 'current' | 'capital'
  readonly executionRate: number // Average for the category
  readonly codes: readonly EconomicCodeProp[]
}

/** Text content passed from MDX for i18n support */
export interface EconomicCodeReferenceTextProp {
  readonly title?: string
  readonly subtitle?: string
  readonly currentLabel: string // "CURRENT EXPENSES"
  readonly currentDescription: string // "Day-to-day operations"
  readonly capitalLabel: string // "CAPITAL EXPENSES"
  readonly capitalDescription: string // "Investments"
  readonly executionLabel: string // "execution"
  readonly warningLabel: string // "WATCH CLOSELY"
  readonly explorerLabel?: string // "Open in Budget Explorer"
}

/** Full props for EconomicCodeReference component */
export interface EconomicCodeReferenceProps {
  readonly categories: readonly EconomicCategoryProp[]
  readonly text: EconomicCodeReferenceTextProp
  readonly explorerUrl?: string
}

// -----------------------------------------------------------------------------
// COLOR SYSTEM
// -----------------------------------------------------------------------------

export type CategoryType = 'current' | 'capital'

export const CATEGORY_COLORS = {
  current: {
    bg: 'bg-slate-50/50 dark:bg-slate-900/20',
    bgHover: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-800',
    bar: 'bg-blue-600 dark:bg-blue-500',
    barBg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-slate-900 dark:text-slate-100',
    textMuted: 'text-slate-500 dark:text-slate-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
    icon: 'text-blue-600 dark:text-blue-400',
    codeBg: 'bg-white dark:bg-slate-950',
  },
  capital: {
    bg: 'bg-rose-50/30 dark:bg-rose-950/10',
    bgHover: 'hover:bg-rose-50/50 dark:hover:bg-rose-900/20',
    border: 'border-rose-200/50 dark:border-rose-800/50',
    bar: 'bg-rose-500',
    barBg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-900 dark:text-rose-100',
    textMuted: 'text-rose-600/70 dark:text-rose-400/70',
    badge: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
    icon: 'text-rose-600 dark:text-rose-400',
    codeBg: 'bg-white dark:bg-slate-950',
    // Warning-specific styles for Code 71
    warningBadge:
      'bg-red-600 text-white dark:bg-red-500 dark:text-white border-none shadow-sm',
    warningPulse: 'animate-pulse-subtle',
  },
} as const
