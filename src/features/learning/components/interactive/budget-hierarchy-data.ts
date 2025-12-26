export interface BudgetLevel {
  readonly id: string
  readonly name: string           // English name
  readonly nameRo: string         // Romanian name
  readonly percentage: number     // e.g., 50 for 50%
  readonly amount?: string        // e.g., "~300B RON"
  readonly description: string    // English description
  readonly descriptionRo: string  // Romanian description
  readonly color: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate'
  readonly icon: string           // Lucide icon name
  readonly children?: readonly BudgetLevel[]
  readonly examples?: readonly { name: string; nameRo: string }[]
  readonly explorerFilter?: string // URL filter for Budget Explorer
}

export interface BudgetHierarchyData {
  readonly root: BudgetLevel
}

export interface BudgetHierarchyText {
  readonly title: string
  readonly subtitle: string
  readonly clickToExplore: string
  readonly percentageLabel: string
  readonly examplesLabel: string
  readonly exploreInPlatform: string
}
