/**
 * Budget Allocator Interaction Resolver
 *
 * Handles budgetAllocator.submit and budgetAllocator.reset actions.
 * Used for the BudgetAllocatorGame interactive component where users
 * allocate budget percentages across categories and compare with reality.
 */

import type {
  LearningContentStatus,
  LearningBudgetAllocatorSubmitAction,
  LearningBudgetAllocatorResetAction,
} from '../../types'
import {
  registerInteractionResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

function resolveBudgetAllocatorSubmit(
  action: LearningBudgetAllocatorSubmitAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const status: LearningContentStatus = 'completed'
  const existingProgress = context.progress.content[action.contentId]
  const existingInteraction = existingProgress?.interactions?.[action.interactionId]
  const existingState = existingInteraction?.kind === 'budget-allocator' ? existingInteraction : null

  return {
    contentId: action.contentId,
    status,
    score: 100,
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'budget-allocator',
        allocations: action.allocations,
        step: 'COMPARE',
        completedAt: existingState?.completedAt ?? context.nowIso(),
      },
    },
  }
}

function resolveBudgetAllocatorReset(
  action: LearningBudgetAllocatorResetAction,
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

registerInteractionResolver('budgetAllocator.submit', resolveBudgetAllocatorSubmit)
registerInteractionResolver('budgetAllocator.reset', resolveBudgetAllocatorReset)
