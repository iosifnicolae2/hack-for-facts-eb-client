/**
 * UAT Finder Interaction Resolver
 *
 * Handles uatFinder.select, uatFinder.explore, and uatFinder.reset actions.
 * Used for the UATFinder interactive component where users search for and
 * explore local government budgets.
 */

import type {
  LearningContentStatus,
  LearningUATFinderSelectAction,
  LearningUATFinderExploreAction,
  LearningUATFinderResetAction,
} from '../../types'
import {
  registerInteractionResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

function resolveUATFinderSelect(
  action: LearningUATFinderSelectAction,
  _context: InteractionResolverContext
): SaveContentProgressInput {
  const status: LearningContentStatus = 'in_progress'

  return {
    contentId: action.contentId,
    status,
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'uat-finder',
        step: 'SELECTED',
        selectedCui: action.cui,
        selectedName: action.name,
        exploredAction: null,
      },
    },
  }
}

function resolveUATFinderExplore(
  action: LearningUATFinderExploreAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const status: LearningContentStatus = 'in_progress'
  const completedAt = context.nowIso()

  return {
    contentId: action.contentId,
    status,
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'uat-finder',
        step: 'EXPLORED',
        selectedCui: action.cui,
        selectedName: null, // Name not passed in explore action
        exploredAction: action.action,
        completedAt,
      },
    },
  }
}

function resolveUATFinderReset(
  action: LearningUATFinderResetAction,
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

registerInteractionResolver('uatFinder.select', resolveUATFinderSelect)
registerInteractionResolver('uatFinder.explore', resolveUATFinderExplore)
registerInteractionResolver('uatFinder.reset', resolveUATFinderReset)
