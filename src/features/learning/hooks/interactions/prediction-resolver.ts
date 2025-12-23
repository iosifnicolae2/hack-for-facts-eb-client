/**
 * Prediction Interaction Resolver
 *
 * Handles prediction.reveal and prediction.reset actions.
 * Used for interactive components like PromiseTracker where users
 * make predictions and then reveal the actual answer.
 */

import type { LearningPredictionRevealAction, LearningPredictionResetAction } from '../../types'
import {
  registerInteractionResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

function resolvePredictionReveal(
  action: LearningPredictionRevealAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const existingInteraction = context.progress.content[action.contentId]?.interactions?.[action.interactionId]
  const existingReveals = existingInteraction?.kind === 'prediction' ? existingInteraction.reveals : {}

  const newReveals = {
    ...existingReveals,
    [action.year]: {
      guess: action.guess,
      actualRate: action.actualRate,
      revealedAt: context.nowIso(),
    },
  }

  return {
    contentId: action.contentId,
    status: 'in_progress',
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'prediction',
        reveals: newReveals,
      },
    },
  }
}

function resolvePredictionReset(
  action: LearningPredictionResetAction,
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

registerInteractionResolver('prediction.reveal', resolvePredictionReveal)
registerInteractionResolver('prediction.reset', resolvePredictionReset)
