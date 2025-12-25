/**
 * Types and styling constants for ClassificationExplorer component
 *
 * Data is passed via MDX props for easier translation support.
 * The component demonstrates functional vs economic budget classifications
 * using real Romanian budget data.
 */

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type ClassificationView = 'fn' | 'ec'

/** Budget item passed from MDX */
export interface BudgetItemProp {
  readonly code: string
  readonly name: string
  readonly value: number
}

/** Text content passed from MDX */
export interface ClassificationExplorerTextProp {
  readonly hookTitle: string
  readonly hookTitleHighlight: string
  readonly hookSubtitle: string
  readonly hookButton: string
  readonly explorePhaseLabel: string
  readonly exploreTitle: string
  readonly exploreTitleHighlight: string
  readonly functionalLabel: string
  readonly functionalQuestion: string
  readonly economicLabel: string
  readonly economicQuestion: string
  readonly functionalHint: string
  readonly economicHint: string
  readonly keyInsightTitle: string
  readonly keyInsightText: string
  readonly resetButton: string
  readonly sourceLabel: string
  readonly fnPreview: {
    readonly title: string
    readonly subtitle: string
    readonly examples: string
  }
  readonly ecPreview: {
    readonly title: string
    readonly subtitle: string
    readonly examples: string
  }
}

/** Budget info passed from MDX */
export interface BudgetInfoProp {
  readonly totalBillions: number
  readonly currency: string
  readonly year: number
}

/** Full props for ClassificationExplorer component */
export interface ClassificationExplorerProps {
  readonly functionalData: readonly BudgetItemProp[]
  readonly economicData: readonly BudgetItemProp[]
  readonly text: ClassificationExplorerTextProp
  readonly budgetInfo: BudgetInfoProp
  readonly sourceUrl?: string
  readonly defaultView?: ClassificationView
}

// -----------------------------------------------------------------------------
// COLOR VARIANTS
// -----------------------------------------------------------------------------

export const CLASSIFICATION_COLORS = {
  fn: {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-500/10',
    bgLighter: 'bg-indigo-50 dark:bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    blur: 'bg-indigo-100/30 dark:bg-indigo-500/5',
  },
  ec: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10',
    bgLighter: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    blur: 'bg-emerald-100/30 dark:bg-emerald-500/5',
  },
} as const
