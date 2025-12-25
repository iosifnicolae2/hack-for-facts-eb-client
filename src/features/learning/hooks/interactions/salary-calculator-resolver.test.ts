import { describe, it, expect } from 'vitest'
import { resolveInteractionAction, type InteractionResolverContext } from './interaction-resolver'
import type {
  LearningGuestProgress,
  LearningSalaryCalculatorSaveAction,
  LearningSalaryCalculatorResetAction,
} from '../../types'

// Import resolver to ensure registration
import './salary-calculator-resolver'

function createEmptyProgress(): LearningGuestProgress {
  return {
    version: 1,
    onboarding: { pathId: null, relatedPaths: [], completedAt: null },
    activePathId: null,
    content: {},
    streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
    lastUpdated: new Date().toISOString(),
  }
}

function createContext(progress?: LearningGuestProgress): InteractionResolverContext {
  return {
    progress: progress ?? createEmptyProgress(),
    nowIso: () => '2025-01-15T10:00:00.000Z',
  }
}

describe('salary-calculator-resolver', () => {
  describe('salaryCalculator.save', () => {
    it('creates state with gross, userGuess, and step', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 3500,
        step: 'GUESS',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.interaction?.state).toEqual({
        kind: 'salary-calculator',
        gross: 5000,
        userGuess: 3500,
        step: 'GUESS',
        completedAt: undefined,
      })
    })

    it('sets status to in_progress for INPUT step', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 0,
        step: 'INPUT',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('sets status to in_progress for GUESS step', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 3500,
        step: 'GUESS',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('sets status to in_progress for REVEAL step', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 3500,
        step: 'REVEAL',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('sets completedAt for REVEAL step', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 3500,
        step: 'REVEAL',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'salary-calculator') {
        expect(state.completedAt).toBe('2025-01-15T10:00:00.000Z')
      }
    })

    it('does not set completedAt for non-REVEAL steps', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 3500,
        step: 'GUESS',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'salary-calculator') {
        expect(state.completedAt).toBeUndefined()
      }
    })

    it('overwrites existing state', () => {
      const progress: LearningGuestProgress = {
        version: 1,
        onboarding: { pathId: null, relatedPaths: [], completedAt: null },
        activePathId: null,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'in_progress',
            lastAttemptAt: '2025-01-15T09:00:00.000Z',
            contentVersion: 'v1',
            interactions: {
              'calculator-1': {
                kind: 'salary-calculator',
                gross: 4000,
                userGuess: 2800,
                step: 'GUESS',
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 3500,
        step: 'REVEAL',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.interaction?.state).toEqual({
        kind: 'salary-calculator',
        gross: 5000,
        userGuess: 3500,
        step: 'REVEAL',
        completedAt: '2025-01-15T10:00:00.000Z',
      })
    })

    it('includes content version when provided', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 5000,
        userGuess: 3500,
        step: 'GUESS',
        contentVersion: 'v2',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentVersion).toBe('v2')
    })

    it('handles boundary values for gross and userGuess', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 0,
        userGuess: 0,
        step: 'INPUT',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'salary-calculator') {
        expect(state.gross).toBe(0)
        expect(state.userGuess).toBe(0)
      }
    })

    it('handles large values for gross and userGuess', () => {
      const action: LearningSalaryCalculatorSaveAction = {
        type: 'salaryCalculator.save',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
        gross: 100000,
        userGuess: 65000,
        step: 'GUESS',
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'salary-calculator') {
        expect(state.gross).toBe(100000)
        expect(state.userGuess).toBe(65000)
      }
    })
  })

  describe('salaryCalculator.reset', () => {
    it('clears state by setting state to null', () => {
      const progress: LearningGuestProgress = {
        version: 1,
        onboarding: { pathId: null, relatedPaths: [], completedAt: null },
        activePathId: null,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'completed',
            lastAttemptAt: '2025-01-15T09:00:00.000Z',
            contentVersion: 'v1',
            interactions: {
              'calculator-1': {
                kind: 'salary-calculator',
                gross: 5000,
                userGuess: 3500,
                step: 'REVEAL',
                completedAt: '2025-01-15T09:00:00.000Z',
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningSalaryCalculatorResetAction = {
        type: 'salaryCalculator.reset',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.interaction).toEqual({
        interactionId: 'calculator-1',
        state: null,
      })
    })

    it('returns in_progress status after reset', () => {
      const action: LearningSalaryCalculatorResetAction = {
        type: 'salaryCalculator.reset',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('works when no existing calculator state', () => {
      const action: LearningSalaryCalculatorResetAction = {
        type: 'salaryCalculator.reset',
        contentId: 'lesson-1',
        interactionId: 'calculator-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentId).toBe('lesson-1')
      expect(result.interaction?.state).toBeNull()
    })
  })
})
