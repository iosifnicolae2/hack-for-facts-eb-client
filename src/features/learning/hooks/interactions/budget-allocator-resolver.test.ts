import { describe, it, expect } from 'vitest'
import { resolveInteractionAction, type InteractionResolverContext } from './interaction-resolver'
import type {
  LearningGuestProgress,
  LearningBudgetAllocatorSubmitAction,
  LearningBudgetAllocatorResetAction,
} from '../../types'

// Import resolver to ensure registration
import './budget-allocator-resolver'

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

describe('budget-allocator-resolver', () => {
  describe('budgetAllocator.submit', () => {
    it('creates state with allocations and step COMPARE', () => {
      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: { education: 15, health: 12, defense: 8 },
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.interaction?.state).toEqual({
        kind: 'budget-allocator',
        allocations: { education: 15, health: 12, defense: 8 },
        step: 'COMPARE',
        completedAt: '2025-01-15T10:00:00.000Z',
      })
    })

    it('sets status to completed and score to 100', () => {
      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: { education: 15, health: 12 },
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('completed')
      expect(result.score).toBe(100)
    })

    it('preserves completedAt from existing state', () => {
      const existingCompletedAt = '2025-01-10T08:00:00.000Z'
      const progress: LearningGuestProgress = {
        version: 1,
        onboarding: { pathId: null, relatedPaths: [], completedAt: null },
        activePathId: null,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'completed',
            lastAttemptAt: '2025-01-10T08:00:00.000Z',
            contentVersion: 'v1',
            interactions: {
              'allocator-1': {
                kind: 'budget-allocator',
                allocations: { education: 20 },
                step: 'COMPARE',
                completedAt: existingCompletedAt,
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: { education: 15, health: 12 },
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext(progress))
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'budget-allocator') {
        expect(state.completedAt).toBe(existingCompletedAt)
      }
    })

    it('sets new completedAt if no existing state', () => {
      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: { education: 15 },
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'budget-allocator') {
        expect(state.completedAt).toBe('2025-01-15T10:00:00.000Z')
      }
    })

    it('includes content version when provided', () => {
      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: { education: 15 },
        contentVersion: 'v2',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentVersion).toBe('v2')
    })

    it('handles empty allocations object', () => {
      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: {},
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'budget-allocator') {
        expect(state.allocations).toEqual({})
      }
    })

    it('handles many categories', () => {
      const manyAllocations = {
        education: 15,
        health: 12,
        defense: 8,
        infrastructure: 10,
        socialServices: 20,
        agriculture: 5,
        research: 3,
        culture: 2,
      }

      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: manyAllocations,
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext())
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'budget-allocator') {
        expect(state.allocations).toEqual(manyAllocations)
      }
    })

    it('overwrites existing state with new allocations', () => {
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
              'allocator-1': {
                kind: 'budget-allocator',
                allocations: { education: 20, health: 10 },
                step: 'COMPARE',
                completedAt: '2025-01-15T09:00:00.000Z',
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningBudgetAllocatorSubmitAction = {
        type: 'budgetAllocator.submit',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
        allocations: { education: 25, defense: 15 },
        contentVersion: 'v1',
      }

      const result = resolveInteractionAction(action, createContext(progress))
      const state = result.interaction?.state

      expect(state).toBeDefined()
      if (state && state.kind === 'budget-allocator') {
        expect(state.allocations).toEqual({ education: 25, defense: 15 })
      }
    })
  })

  describe('budgetAllocator.reset', () => {
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
              'allocator-1': {
                kind: 'budget-allocator',
                allocations: { education: 15, health: 12 },
                step: 'COMPARE',
                completedAt: '2025-01-15T09:00:00.000Z',
              },
            },
          },
        },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        lastUpdated: new Date().toISOString(),
      }

      const action: LearningBudgetAllocatorResetAction = {
        type: 'budgetAllocator.reset',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
      }

      const result = resolveInteractionAction(action, createContext(progress))

      expect(result.interaction).toEqual({
        interactionId: 'allocator-1',
        state: null,
      })
    })

    it('returns in_progress status after reset', () => {
      const action: LearningBudgetAllocatorResetAction = {
        type: 'budgetAllocator.reset',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.status).toBe('in_progress')
    })

    it('works when no existing allocator state', () => {
      const action: LearningBudgetAllocatorResetAction = {
        type: 'budgetAllocator.reset',
        contentId: 'lesson-1',
        interactionId: 'allocator-1',
      }

      const result = resolveInteractionAction(action, createContext())

      expect(result.contentId).toBe('lesson-1')
      expect(result.interaction?.state).toBeNull()
    })
  })
})
