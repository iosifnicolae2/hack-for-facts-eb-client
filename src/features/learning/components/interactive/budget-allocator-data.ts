// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type DeficitSeverity =
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'critical'
  | 'catastrophic'
export type SurplusSeverity = 'minor' | 'significant' | 'extreme'

// -----------------------------------------------------------------------------
// MDX PROPS TYPES (for passing data from MDX files)
// -----------------------------------------------------------------------------

export type IconName =
  | 'shield'
  | 'heart'
  | 'graduation-cap'
  | 'building-2'
  | 'landmark'
  | 'scale'
  | 'swords'
  | 'trees'

export interface CategoryConsequenceProp {
  readonly minDiff: number
  readonly maxDiff: number
  readonly severity: 'positive' | 'neutral' | 'negative'
  readonly impacts: readonly string[]
}

export interface CategoryProp {
  readonly id: string
  readonly label: string
  readonly subLabel: string
  readonly icon: IconName
  readonly color: string
  readonly actualPercentage: number
  readonly defaultValue: number
  readonly stakeholders: readonly string[]
  readonly consequences: readonly CategoryConsequenceProp[]
}

export interface StakeholderReactionsProp {
  readonly happy: { readonly threshold: number; readonly message: string }
  readonly angry: { readonly threshold: number; readonly message: string }
  readonly neutral: { readonly message: string }
}

export interface StakeholderProp {
  readonly id: string
  readonly emoji: string
  readonly label: string
  readonly affectedBy: readonly string[]
  readonly reactions: StakeholderReactionsProp
}

export interface DeficitLevelProp {
  readonly minDeficit: number
  readonly maxDeficit: number
  readonly severity: DeficitSeverity
  readonly consequence: string
}

export interface SurplusLevelProp {
  readonly minSurplus: number
  readonly maxSurplus: number
  readonly consequence: string
}

export interface BudgetAllocatorTextProp {
  readonly hookTitle: string
  readonly hookSubtitle: string
  readonly hookButton: string
  readonly allocateTitle: string
  readonly allocateSubtitle: string
  readonly compareButton: string
  readonly compareTitle: string
  readonly compareSubtitle: string
  readonly tryAgainButton: string
  readonly insightsTitle: string
  readonly stakeholdersTitle: string
  readonly negativeImpactsTitle?: string
  readonly positiveImpactsTitle?: string
  readonly balanceLabels: {
    readonly balanced: string
    readonly deficit: string
    readonly surplus: string
  }
}

export interface BudgetInfoProp {
  readonly totalBillions: number
  readonly currency: string
  readonly year: number
}

export interface BudgetAllocatorGameProps {
  readonly categories: readonly CategoryProp[]
  readonly stakeholders: readonly StakeholderProp[]
  readonly deficitLevels: readonly DeficitLevelProp[]
  readonly surplusLevels: readonly SurplusLevelProp[]
  readonly text: BudgetAllocatorTextProp
  readonly budgetInfo: BudgetInfoProp
  readonly contentId?: string
  readonly interactionId?: string
}

// -----------------------------------------------------------------------------
// COLOR VARIANTS
// -----------------------------------------------------------------------------

export const COLOR_VARIANTS = {
  rose: {
    bg: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-t-rose-600 dark:border-t-rose-500',
    bgLight: 'bg-rose-500/10',
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-t-blue-600 dark:border-t-blue-500',
    bgLight: 'bg-blue-500/10',
  },
  violet: {
    bg: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-t-violet-600 dark:border-t-violet-500',
    bgLight: 'bg-violet-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-t-emerald-600 dark:border-t-emerald-500',
    bgLight: 'bg-emerald-500/10',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-t-amber-600 dark:border-t-amber-500',
    bgLight: 'bg-amber-500/10',
  },
  slate: {
    bg: 'bg-slate-500',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-t-slate-600 dark:border-t-slate-500',
    bgLight: 'bg-slate-500/10',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-t-red-600 dark:border-t-red-500',
    bgLight: 'bg-red-500/10',
  },
  teal: {
    bg: 'bg-teal-500',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-t-teal-600 dark:border-t-teal-500',
    bgLight: 'bg-teal-500/10',
  },
} as const

export type ColorVariant = keyof typeof COLOR_VARIANTS
