import { describe, it, expect } from 'vitest'
import {
  registerInteractionResolver,
  resolveInteractionAction,
  hasResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'
import type { LearningGuestProgress, LearningInteractionAction } from '../../types'

// Import resolvers to ensure they're registered
import './quiz-resolver'
import './prediction-resolver'

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

describe('interaction-resolver', () => {
  describe('hasResolver', () => {
    it('returns true for registered quiz.answer resolver', () => {
      expect(hasResolver('quiz.answer')).toBe(true)
    })

    it('returns true for registered quiz.reset resolver', () => {
      expect(hasResolver('quiz.reset')).toBe(true)
    })

    it('returns true for registered prediction.reveal resolver', () => {
      expect(hasResolver('prediction.reveal')).toBe(true)
    })

    it('returns true for registered prediction.reset resolver', () => {
      expect(hasResolver('prediction.reset')).toBe(true)
    })

    it('returns false for unregistered action type', () => {
      expect(hasResolver('unknown.action')).toBe(false)
    })
  })

  describe('resolveInteractionAction', () => {
    it('throws error for unregistered action type', () => {
      const action = {
        type: 'unknown.action',
        contentId: 'lesson-1',
      } as unknown as LearningInteractionAction

      expect(() => resolveInteractionAction(action, createContext())).toThrow(
        'No resolver registered for interaction action type: unknown.action'
      )
    })

    it('resolves quiz.answer action correctly', () => {
      const action: LearningInteractionAction = {
        type: 'quiz.answer',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
        selectedOptionId: 'b',
        score: 100,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentId).toBe('lesson-1')
      expect(result.status).toBe('passed')
      expect(result.score).toBe(100)
      expect(result.interaction?.interactionId).toBe('quiz-1')
      expect(result.interaction?.state).toEqual({
        kind: 'quiz',
        selectedOptionId: 'b',
      })
    })

    it('resolves quiz.reset action correctly', () => {
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

      const action: LearningInteractionAction = {
        type: 'quiz.reset',
        contentId: 'lesson-1',
        interactionId: 'quiz-1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.contentId).toBe('lesson-1')
      expect(result.status).toBe('passed') // Should preserve existing status
      expect(result.interaction?.state).toBeNull()
    })

    it('resolves prediction.reveal action correctly', () => {
      const action: LearningInteractionAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: '2024',
        guess: 75,
        actualRate: 60,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentId).toBe('lesson-1')
      expect(result.status).toBe('in_progress')
      expect(result.interaction?.interactionId).toBe('prediction-1')
      expect(result.interaction?.state).toEqual({
        kind: 'prediction',
        reveals: {
          '2024': {
            guess: 75,
            actualRate: 60,
            revealedAt: '2025-01-15T10:00:00.000Z',
          },
        },
      })
    })

    it('resolves prediction.reset action correctly', () => {
      const action: LearningInteractionAction = {
        type: 'prediction.reset',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentId).toBe('lesson-1')
      expect(result.status).toBe('in_progress')
      expect(result.interaction?.state).toBeNull()
    })
  })

  describe('registerInteractionResolver', () => {
    it('allows registering custom resolvers', () => {
      // Register a test resolver
      const testResolver = (
        action: LearningInteractionAction,
        _context: InteractionResolverContext
      ): SaveContentProgressInput => ({
        contentId: action.contentId,
        status: 'completed',
      })

      // Note: This modifies global state, but since 'test.custom' is unique, it's safe
      registerInteractionResolver('test.custom' as LearningInteractionAction['type'], testResolver)

      expect(hasResolver('test.custom')).toBe(true)
    })
  })
})
