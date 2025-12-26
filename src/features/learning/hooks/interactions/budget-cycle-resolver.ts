/**
 * Budget Cycle Interaction Resolver
 *
 * Handles budgetCycle.explore and budgetCycle.reset actions.
 * Used for the BudgetCycleTimeline and PhaseCards interactive components
 * where users explore the 6 phases of the Romanian budget cycle.
 */

import type {
  LearningContentStatus,
  LearningBudgetCycleExploreAction,
  LearningBudgetCycleResetAction,
} from '../../types'
import {
  registerInteractionResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'

// Total number of budget phases
const TOTAL_PHASES = 6

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

function resolveBudgetCycleExplore(
  action: LearningBudgetCycleExploreAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const existingProgress = context.progress.content[action.contentId]
  const existingInteraction = existingProgress?.interactions?.[action.interactionId]
  const existingState =
    existingInteraction?.kind === 'budget-cycle' ? existingInteraction : null

  // Get existing explored phases or start fresh
  const exploredPhases = existingState?.exploredPhases ?? []

  // Add the new phase if not already explored
  const newExploredPhases = exploredPhases.includes(action.phaseId)
    ? exploredPhases
    : [...exploredPhases, action.phaseId]

  // Check if all phases have been explored
  const allPhasesExplored = newExploredPhases.length === TOTAL_PHASES
  const status: LearningContentStatus = allPhasesExplored ? 'completed' : 'in_progress'

  // Calculate score as percentage of phases explored
  const score = Math.round((newExploredPhases.length / TOTAL_PHASES) * 100)

  return {
    contentId: action.contentId,
    status,
    score,
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'budget-cycle',
        exploredPhases: newExploredPhases,
        lastExploredPhase: action.phaseId,
        completedAt: allPhasesExplored
          ? (existingState?.completedAt ?? context.nowIso())
          : undefined,
      },
    },
  }
}

function resolveBudgetCycleReset(
  action: LearningBudgetCycleResetAction,
  _context: InteractionResolverContext
): SaveContentProgressInput {
  return {
    contentId: action.contentId,
    status: 'in_progress',
    interaction: {
      interactionId: action.interactionId,
      state: null,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════════

registerInteractionResolver('budgetCycle.explore', resolveBudgetCycleExplore)
registerInteractionResolver('budgetCycle.reset', resolveBudgetCycleReset)
