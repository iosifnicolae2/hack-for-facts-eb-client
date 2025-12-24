import { describe, it, expect } from 'vitest'
import { resolveInteractionAction, type InteractionResolverContext } from './interaction-resolver'
import type { LearningGuestProgress, LearningQuizAnswerAction, LearningQuizResetAction } from '../../types'

// Import resolver to ensure registration
import './quiz-resolver'

function createEmptyProgress(): LearningGuestProgress {
  return {
    version: 1,
    onboarding: { pathId: null, completedAt: null },
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

describe('quiz-resolver', () => {
  describe('quiz.answer', () => {
    it('returns in_progress status for answered quizzes', () => {
      const action: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'correct',
        score: 100,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
      expect(result.score).toBe(100)
    })

    it('returns in_progress status when score < 70', () => {
      const action: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'wrong',
        score: 50,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
      expect(result.score).toBe(50)
    })

    it('returns in_progress status when score is exactly 70', () => {
      const action: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'partial',
        score: 70,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('clamps score to 0-100 range', () => {
      const actionOverflow: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'a',
        score: 150,
        contentVersion: 'v1',
      }

      const resultOverflow = resolveInteractionAction(actionOverflow, createContext())
      expect(resultOverflow.score).toBe(100)

      const actionUnderflow: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'a',
        score: -50,
        contentVersion: 'v1',
      }

      const resultUnderflow = resolveInteractionAction(actionUnderflow, createContext())
      expect(resultUnderflow.score).toBe(0)
    })

    it('stores interaction state with selected option', () => {
      const action: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'option-b',
        score: 100,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.interaction).toEqual({
        interactionId: 'quiz-1',
        state: {
          kind: 'quiz',
          selectedOptionId: 'option-b',
        },
      })
    })

    it('includes content version when provided', () => {
      const action: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'a',
        score: 100,
        contentVersion: 'v2',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentVersion).toBe('v2')
    })

    it('handles NaN score as undefined', () => {
      const action: LearningQuizAnswerAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'a',
        score: NaN,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
      expect(result.score).toBeUndefined()
    })
  })

  describe('quiz.reset', () => {
    it('preserves passed status when resetting', () => {
      const progress: LearningGuestProgress = {
        version: 1,
        onboarding: { pathId: null, completedAt: null },
        activePathId: null,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'passed',
            score: 100,
            lastAttemptAt: '2025-01-15T09:00:00.000Z',
            contentVersion: 'v1',
            interactions: {
              'quiz-1': { kind: 'quiz', selectedOptionId: 'b' },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningQuizResetAction = {
        type: 'quiz.reset',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.status).toBe('passed')
    })

    it('preserves completed status when resetting', () => {
      const progress: LearningGuestProgress = {
        version: 1,
        onboarding: { pathId: null, completedAt: null },
        activePathId: null,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'completed',
            lastAttemptAt: '2025-01-15T09:00:00.000Z',
            contentVersion: 'v1',
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningQuizResetAction = {
        type: 'quiz.reset',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.status).toBe('completed')
    })

    it('defaults to in_progress when no existing content', () => {
      const action: LearningQuizResetAction = {
        type: 'quiz.reset',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('clears interaction state by setting to null', () => {
      const action: LearningQuizResetAction = {
        type: 'quiz.reset',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.interaction).toEqual({
        interactionId: 'quiz-1',
        state: null,
      })
    })
  })
})
