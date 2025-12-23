/**
 * Salary Calculator Interaction Resolver
 *
 * Handles salaryCalculator.save and salaryCalculator.reset actions.
 * Used for the SalaryTaxCalculator interactive component where users
 * enter their gross salary, guess their net salary, and reveal the calculation.
 */

import type {
  LearningContentStatus,
  LearningSalaryCalculatorSaveAction,
  LearningSalaryCalculatorResetAction,
} from '../../types'
import {
  registerInteractionResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function getStatusForStep(step: 'INPUT' | 'GUESS' | 'REVEAL'): LearningContentStatus {
  return step === 'REVEAL' ? 'completed' : 'in_progress'
}

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

function resolveSalaryCalculatorSave(
  action: LearningSalaryCalculatorSaveAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const status = getStatusForStep(action.step)
  const completedAt = action.step === 'REVEAL' ? context.nowIso() : undefined

  return {
    contentId: action.contentId,
    status,
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'salary-calculator',
        gross: action.gross,
        userGuess: action.userGuess,
        step: action.step,
        completedAt,
      },
    },
  }
}

function resolveSalaryCalculatorReset(
  action: LearningSalaryCalculatorResetAction,
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

registerInteractionResolver('salaryCalculator.save', resolveSalaryCalculatorSave)
registerInteractionResolver('salaryCalculator.reset', resolveSalaryCalculatorReset)
