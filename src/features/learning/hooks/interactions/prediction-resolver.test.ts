import { describe, it, expect } from 'vitest'
import { resolveInteractionAction, type InteractionResolverContext } from './interaction-resolver'
import type {
  LearningGuestProgress,
  LearningPredictionRevealAction,
  LearningPredictionResetAction,
} from '../../types'

// Import resolver to ensure registration
import './prediction-resolver'

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

describe('prediction-resolver', () => {
  describe('prediction.reveal', () => {
    it('creates reveal entry with guess and actual rate', () => {
      const action: LearningPredictionRevealAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: '2024',
        guess: 75,
        actualRate: 60,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

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

    it('preserves existing reveals when adding new year', () => {
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
              'prediction-1': {
                kind: 'prediction',
                reveals: {
                  '2022': {
                    guess: 50,
                    actualRate: 58,
                    revealedAt: '2025-01-15T08:00:00.000Z',
                  },
                },
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningPredictionRevealAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: '2023',
        guess: 65,
        actualRate: 60,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.interaction?.state).toEqual({
        kind: 'prediction',
        reveals: {
          '2022': {
            guess: 50,
            actualRate: 58,
            revealedAt: '2025-01-15T08:00:00.000Z',
          },
          '2023': {
            guess: 65,
            actualRate: 60,
            revealedAt: '2025-01-15T10:00:00.000Z',
          },
        },
      })
    })

    it('overwrites existing reveal for same year', () => {
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
              'prediction-1': {
                kind: 'prediction',
                reveals: {
                  '2024': {
                    guess: 50,
                    actualRate: 60,
                    revealedAt: '2025-01-15T08:00:00.000Z',
                  },
                },
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningPredictionRevealAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: '2024',
        guess: 80,
        actualRate: 60,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.interaction?.state).toEqual({
        kind: 'prediction',
        reveals: {
          '2024': {
            guess: 80,
            actualRate: 60,
            revealedAt: '2025-01-15T10:00:00.000Z',
          },
        },
      })
    })

    it('always returns in_progress status', () => {
      const action: LearningPredictionRevealAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: '2024',
        guess: 75,
        actualRate: 60,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('handles boundary values for guess and actualRate', () => {
      const action: LearningPredictionRevealAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: '2024',
        guess: 0,
        actualRate: 100,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'prediction') {
        expect(state.reveals['2024'].guess).toBe(0)
        expect(state.reveals['2024'].actualRate).toBe(100)
      }
    })

    it('includes content version when provided', () => {
      const action: LearningPredictionRevealAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: '2024',
        guess: 75,
        actualRate: 60,
        contentVersion: 'v2',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentVersion).toBe('v2')
    })

    it('handles string year identifiers', () => {
      const action: LearningPredictionRevealAction = {
        type: 'prediction.reveal',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
        year: 'q1-2024',
        guess: 75,
        actualRate: 60,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'prediction') {
        expect(state.reveals['q1-2024']).toBeDefined()
      }
    })
  })

  describe('prediction.reset', () => {
    it('clears all reveals by setting state to null', () => {
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
              'prediction-1': {
                kind: 'prediction',
                reveals: {
                  '2022': { guess: 50, actualRate: 58, revealedAt: '2025-01-15T08:00:00.000Z' },
                  '2023': { guess: 65, actualRate: 60, revealedAt: '2025-01-15T08:30:00.000Z' },
                  '2024': { guess: 75, actualRate: 60, revealedAt: '2025-01-15T09:00:00.000Z' },
                },
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningPredictionResetAction = {
        type: 'prediction.reset',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.interaction).toEqual({
        interactionId: 'prediction-1',
        state: null,
      })
    })

    it('returns in_progress status after reset', () => {
      const action: LearningPredictionResetAction = {
        type: 'prediction.reset',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('works when no existing prediction state', () => {
      const action: LearningPredictionResetAction = {
        type: 'prediction.reset',
        contentId: 'lesson-1',
        interactionId: 'prediction-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentId).toBe('lesson-1')
      expect(result.interaction?.state).toBeNull()
    })
  })
})
