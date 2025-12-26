/**
 * Budget Cycle Data and Types
 *
 * Shared data definitions for BudgetCycleTimeline and PhaseCards components.
 * Contains the 6 phases of the Romanian budget cycle with their timing,
 * legal basis, and citizen engagement opportunities.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  FileEdit,
  Vote,
  PlayCircle,
  BarChart3,
  Search,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type OpportunityLevel = 'low' | 'medium' | 'high'

export type BudgetPhaseId =
  | 'planning'
  | 'drafting'
  | 'approval'
  | 'execution'
  | 'reporting'
  | 'audit'

export type PhaseIconName =
  | 'calendar'
  | 'file-edit'
  | 'vote'
  | 'play-circle'
  | 'bar-chart-3'
  | 'search'

export type BudgetPhaseDeadline = {
  readonly date: string
  readonly description: string
}

export type BudgetPhaseDefinition = {
  readonly id: BudgetPhaseId
  readonly icon: PhaseIconName
  readonly startMonth: number // 1-12
  readonly endMonth: number // 1-12
  readonly opportunity: OpportunityLevel
}

// ═══════════════════════════════════════════════════════════════════════════
// Icon Mapping
// ═══════════════════════════════════════════════════════════════════════════

export const PHASE_ICON_MAP: Record<PhaseIconName, LucideIcon> = {
  calendar: Calendar,
  'file-edit': FileEdit,
  vote: Vote,
  'play-circle': PlayCircle,
  'bar-chart-3': BarChart3,
  search: Search,
}

export function getPhaseIcon(name: PhaseIconName): LucideIcon {
  return PHASE_ICON_MAP[name]
}

// ═══════════════════════════════════════════════════════════════════════════
// Color Variants
// ═══════════════════════════════════════════════════════════════════════════

export const OPPORTUNITY_COLORS = {
  low: {
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    bgSolid: 'bg-zinc-400 dark:bg-zinc-600',
    border: 'border-zinc-300 dark:border-zinc-600',
    text: 'text-zinc-600 dark:text-zinc-400',
    ring: '',
  },
  medium: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    bgSolid: 'bg-blue-500 dark:bg-blue-600',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    ring: '',
  },
  high: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    bgSolid: 'bg-amber-500 dark:bg-amber-500',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-2 ring-amber-300/50 dark:ring-amber-500/30',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// Phase Data
// ═══════════════════════════════════════════════════════════════════════════

export const BUDGET_PHASES: readonly BudgetPhaseDefinition[] = [
  {
    id: 'planning',
    icon: 'calendar',
    startMonth: 6,
    endMonth: 8,
    opportunity: 'low',
  },
  {
    id: 'drafting',
    icon: 'file-edit',
    startMonth: 8,
    endMonth: 11,
    opportunity: 'medium',
  },
  {
    id: 'approval',
    icon: 'vote',
    startMonth: 11,
    endMonth: 12,
    opportunity: 'high',
  },
  {
    id: 'execution',
    icon: 'play-circle',
    startMonth: 1,
    endMonth: 12,
    opportunity: 'medium',
  },
  {
    id: 'reporting',
    icon: 'bar-chart-3',
    startMonth: 1,
    endMonth: 12, // Quarterly throughout
    opportunity: 'medium',
  },
  {
    id: 'audit',
    icon: 'search',
    startMonth: 1,
    endMonth: 7, // Following year
    opportunity: 'low',
  },
] as const

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the budget submission deadline for a given year.
 * Default is November 15 as per Law 500/2002, Art. 35(4), amended by Law 270/2013.
 */
export function getBudgetSubmissionDeadline(year: number = new Date().getFullYear()): Date {
  return new Date(year, 10, 15) // Month is 0-indexed, so 10 = November
}

/**
 * Calculate days until the next budget submission deadline.
 * Returns negative number if deadline has passed for this year.
 */
export function getDaysUntilBudgetSeason(fromDate: Date = new Date()): number {
  const year = fromDate.getFullYear()
  let deadline = getBudgetSubmissionDeadline(year)

  // If we're past this year's deadline, calculate for next year
  if (fromDate > deadline) {
    deadline = getBudgetSubmissionDeadline(year + 1)
  }

  const diffTime = deadline.getTime() - fromDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Determine which budget phase is currently active based on the date.
 */
export function getCurrentPhase(date: Date = new Date()): BudgetPhaseId {
  const month = date.getMonth() + 1 // 1-indexed

  // Priority order matters for overlapping phases
  if (month >= 11 || month === 12) return 'approval'
  if (month >= 8 && month <= 11) return 'drafting'
  if (month >= 6 && month <= 8) return 'planning'

  // Default to execution for Jan-May (most common state)
  return 'execution'
}

/**
 * Check if we're currently in "budget season" (Oct-Dec).
 */
export function isBudgetSeason(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1
  return month >= 10 && month <= 12
}

/**
 * Get the phase column span for a Gantt chart (1-12 months).
 * Returns { start, end } where 1 = January, 12 = December.
 */
export function getPhaseSpan(phase: BudgetPhaseDefinition): { start: number; end: number } {
  return {
    start: phase.startMonth,
    end: phase.endMonth,
  }
}

/**
 * Calculate the width percentage for a phase bar in the timeline.
 * Handles year-wrap cases where end < start.
 */
export function getPhaseWidthPercent(phase: BudgetPhaseDefinition): number {
  const { startMonth, endMonth } = phase
  let months: number

  if (endMonth >= startMonth) {
    months = endMonth - startMonth + 1
  } else {
    // Year wrap (e.g., Nov to Jan)
    months = 12 - startMonth + 1 + endMonth
  }

  return (months / 12) * 100
}

/**
 * Calculate the left offset percentage for a phase bar in the timeline.
 */
export function getPhaseLeftPercent(phase: BudgetPhaseDefinition): number {
  return ((phase.startMonth - 1) / 12) * 100
}
