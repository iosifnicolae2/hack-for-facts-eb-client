/**
 * Types and styling constants for FunctionalClassificationAccordion component
 *
 * Data is passed via MDX props for easier translation support.
 * The component teaches Romania's functional classification hierarchy
 * (COFOG-adapted) organized into 5 Parts (Părți).
 */

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

/** Individual classification code */
export interface ClassificationCodeProp {
  readonly code: string
  readonly name: string
  readonly description?: string
}

/** A functional classification Part (Parte) */
export interface FunctionalPartProp {
  readonly id: string
  readonly name: string
  readonly codes: readonly ClassificationCodeProp[]
  readonly color?: PartColor
}

/** Text content passed from MDX */
export interface FunctionalClassificationTextProp {
  readonly title?: string
  readonly subtitle?: string
  readonly explorerLabel?: string
}

/** Full props for FunctionalClassificationAccordion component */
export interface FunctionalClassificationAccordionProps {
  readonly parts: readonly FunctionalPartProp[]
  readonly text?: FunctionalClassificationTextProp
  readonly highlightCodes?: readonly string[]
  readonly explorerUrl?: string
}

// -----------------------------------------------------------------------------
// COLOR VARIANTS
// -----------------------------------------------------------------------------

export type PartColor = 'slate' | 'red' | 'emerald' | 'blue' | 'purple'

export const PART_COLORS = {
  slate: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    hover: 'hover:bg-slate-50 dark:hover:bg-slate-900/50',
    accent: 'bg-slate-500',
  },
  red: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    hover: 'hover:bg-red-50/50 dark:hover:bg-red-950/30',
    accent: 'bg-red-500',
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    hover: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
    accent: 'bg-emerald-500',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
    accent: 'bg-blue-500',
  },
  purple: {
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-50/50 dark:hover:bg-purple-950/30',
    accent: 'bg-purple-500',
  },
} as const

// Default color mapping for Parts I-V
export const DEFAULT_PART_COLORS: Record<string, PartColor> = {
  I: 'slate',
  II: 'red',
  III: 'emerald',
  IV: 'blue',
  V: 'purple',
}
