/**
 * Quiz Interaction Resolver
 *
 * Handles quiz.answer and quiz.reset actions.
 */

import { QUIZ_PASS_SCORE } from '../../utils/interactions'
import type { LearningContentStatus, LearningQuizAnswerAction, LearningQuizResetAction } from '../../types'
import {
  registerInteractionResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function clampScore(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return Math.max(0, Math.min(100, value))
}

function getQuizStatus(score: number): LearningContentStatus {
  return score >= QUIZ_PASS_SCORE ? 'passed' : 'in_progress'
}

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

function resolveQuizAnswer(
  action: LearningQuizAnswerAction,
  _context: InteractionResolverContext
): SaveContentProgressInput {
  const clampedScore = clampScore(action.score)
  const status = getQuizStatus(clampedScore ?? 0)

  return {
    contentId: action.contentId,
    status,
    score: clampedScore,
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'quiz',
        selectedOptionId: action.selectedOptionId,
      },
    },
  }
}

function resolveQuizReset(
  action: LearningQuizResetAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const currentStatus = context.progress.content[action.contentId]?.status ?? 'in_progress'

  return {
    contentId: action.contentId,
    status: currentStatus,
    interaction: {
      interactionId: action.interactionId,
      state: null,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════════

registerInteractionResolver('quiz.answer', resolveQuizAnswer)
registerInteractionResolver('quiz.reset', resolveQuizReset)
