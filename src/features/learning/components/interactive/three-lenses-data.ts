/**
 * Types and styling constants for ThreeLensesExplorer component
 *
 * Follows the pattern established by classification-explorer-data.ts
 */

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

/** A single budget example showing all three classification perspectives */
export interface BudgetLensExample {
  readonly id: string
  /** Short description like "Teacher Salary" */
  readonly title: string
  /** Amount in RON for display */
  readonly amount: number
  /** WHO spends it - Ministry/Entity name (no code) */
  readonly organizational: {
    readonly entity: string
  }
  /** WHAT FOR - Purpose with code */
  readonly functional: {
    readonly category: string
    readonly code: string
    /** E.g., "Primary Education" */
    readonly subcategory?: string
  }
  /** WHAT TYPE - Expense type with code */
  readonly economic: {
    readonly type: string
    readonly code: string
    /** E.g., "Basic Salaries" */
    readonly subtype?: string
  }
}

/** Insight text for a specific lens */
export interface LensInsight {
  readonly title: string
  readonly text: string
}

/** Text content passed from MDX for i18n support */
export interface ThreeLensesTextProp {
  /** Header section */
  readonly title: string
  readonly subtitle: string
  /** Lens labels and questions */
  readonly organizational: {
    readonly label: string
    readonly question: string // "WHO?"
    /** Insight shown when this lens is clicked (optional for backward compatibility) */
    readonly insight?: LensInsight
  }
  readonly functional: {
    readonly label: string
    readonly question: string // "WHAT FOR?"
    /** Insight shown when this lens is clicked (optional for backward compatibility) */
    readonly insight?: LensInsight
  }
  readonly economic: {
    readonly label: string
    readonly question: string // "WHAT TYPE?"
    /** Insight shown when this lens is clicked (optional for backward compatibility) */
    readonly insight?: LensInsight
  }
  /** Example navigation */
  readonly exampleLabel: string
  /** Default key insight (shown when no lens is selected) */
  readonly insightTitle: string
  readonly insightText: string
  /** No code label for organizational */
  readonly noCodeLabel: string
  /** Label for closing the insight */
  readonly closeInsightLabel?: string
  /** Hint text shown below cards when no lens is selected */
  readonly hintText?: string
}

/** Full props for ThreeLensesExplorer component */
export interface ThreeLensesExplorerProps {
  readonly examples: readonly BudgetLensExample[]
  readonly text: ThreeLensesTextProp
  /** Optional: start with a specific example */
  readonly defaultExampleIndex?: number
}

// -----------------------------------------------------------------------------
// COLOR SYSTEM
// -----------------------------------------------------------------------------

/**
 * Color variants for the three lenses
 * - Organizational: Slate/Gray (neutral, less emphasized per requirements)
 * - Functional: Indigo (consistent with ClassificationExplorer)
 * - Economic: Emerald (consistent with ClassificationExplorer)
 */
export const LENS_COLORS = {
  organizational: {
    bg: 'bg-slate-500',
    bgLight: 'bg-slate-500/10',
    bgLighter: 'bg-slate-50 dark:bg-slate-800/30',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    blur: 'bg-slate-100/30 dark:bg-slate-500/5',
    accent: 'bg-slate-100 dark:bg-slate-800',
  },
  functional: {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-500/10',
    bgLighter: 'bg-indigo-50 dark:bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    blur: 'bg-indigo-100/30 dark:bg-indigo-500/5',
    accent: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  economic: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10',
    bgLighter: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    blur: 'bg-emerald-100/30 dark:bg-emerald-500/5',
    accent: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
} as const

export type LensType = keyof typeof LENS_COLORS
