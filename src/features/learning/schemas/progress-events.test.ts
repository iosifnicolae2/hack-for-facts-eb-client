/**
 * Schema Validation Tests for Learning Progress Events
 *
 * These tests ensure that all interaction types are properly registered in the
 * discriminated union schemas. This is critical because:
 *
 * 1. Events are saved to localStorage by dispatchInteractionAction()
 * 2. On page reload, parseLearningProgressEvents() validates them with safeParse()
 * 3. If an interaction type is missing from the schema, events are SILENTLY REJECTED
 * 4. This causes state restoration to fail without any error message
 *
 * These tests catch that bug before it reaches production.
 */

import { describe, it, expect } from 'vitest'
import { parseLearningProgressEvents } from './progress-events'
import type { LearningProgressEvent } from '../types'

function createBaseEvent(overrides: Partial<LearningProgressEvent> = {}) {
  return {
    eventId: 'evt-1',
    occurredAt: new Date().toISOString(),
    clientId: 'client-1',
    ...overrides,
  }
}

describe('parseLearningProgressEvents', () => {
  describe('interaction type validation (prevents silent parse failures)', () => {
    it('validates quiz interaction', () => {
      const events = [
        createBaseEvent({
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'in_progress',
            contentVersion: 'v1',
            interaction: {
              interactionId: 'quiz-1',
              state: {
                kind: 'quiz',
                selectedOptionId: 'option-a',
              },
            },
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('content.progressed')
      if (result[0].type === 'content.progressed') {
        expect(result[0].payload.interaction?.state?.kind).toBe('quiz')
      }
    })

    it('validates prediction interaction', () => {
      const events = [
        createBaseEvent({
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'in_progress',
            contentVersion: 'v1',
            interaction: {
              interactionId: 'prediction-1',
              state: {
                kind: 'prediction',
                reveals: {
                  'pred-1': {
                    guess: 45,
                    actualRate: 52,
                    revealedAt: new Date().toISOString(),
                  },
                },
              },
            },
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      if (result[0].type === 'content.progressed') {
        expect(result[0].payload.interaction?.state?.kind).toBe('prediction')
      }
    })

    it('validates salary-calculator interaction', () => {
      const events = [
        createBaseEvent({
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'in_progress',
            contentVersion: 'v1',
            interaction: {
              interactionId: 'calc-1',
              state: {
                kind: 'salary-calculator',
                gross: 5000,
                userGuess: 3500,
                step: 'REVEAL',
                completedAt: new Date().toISOString(),
              },
            },
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      if (result[0].type === 'content.progressed') {
        expect(result[0].payload.interaction?.state?.kind).toBe('salary-calculator')
      }
    })

    it('validates budget-allocator interaction', () => {
      const events = [
        createBaseEvent({
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'completed',
            score: 100,
            contentVersion: 'v1',
            interaction: {
              interactionId: 'allocator-1',
              state: {
                kind: 'budget-allocator',
                allocations: { education: 15, health: 12, defense: 8 },
                step: 'COMPARE',
                completedAt: new Date().toISOString(),
              },
            },
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('content.progressed')
      if (result[0].type === 'content.progressed') {
        const state = result[0].payload.interaction?.state
        expect(state?.kind).toBe('budget-allocator')
        if (state?.kind === 'budget-allocator') {
          expect(state.allocations).toEqual({ education: 15, health: 12, defense: 8 })
          expect(state.step).toBe('COMPARE')
        }
      }
    })

    it('rejects unknown interaction kinds (verifies schema completeness)', () => {
      // Using 'as unknown' to bypass TypeScript since we're deliberately testing invalid data
      const events = [
        createBaseEvent({
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'in_progress',
            contentVersion: 'v1',
            interaction: {
              interactionId: 'unknown-1',
              state: {
                kind: 'unknown-type', // This type doesn't exist in schema
                data: { foo: 'bar' },
              } as unknown as { kind: 'quiz'; selectedOptionId: string | null },
            },
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      // Event should be rejected because the interaction kind is not in the schema
      expect(result).toHaveLength(0)
    })
  })

  describe('event type validation', () => {
    it('parses content.progressed events', () => {
      const events = [
        createBaseEvent({
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'completed',
            score: 85,
            contentVersion: 'v1',
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('content.progressed')
    })

    it('parses onboarding.completed events', () => {
      const events = [
        createBaseEvent({
          type: 'onboarding.completed',
          payload: {
            pathId: 'citizen-foundations',
            relatedPaths: ['budget-basics'],
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('onboarding.completed')
    })

    it('parses onboarding.reset events', () => {
      const events = [
        createBaseEvent({
          type: 'onboarding.reset',
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('onboarding.reset')
    })

    it('parses activePath.set events', () => {
      const events = [
        createBaseEvent({
          type: 'activePath.set',
          payload: {
            pathId: 'budget-basics',
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('activePath.set')
    })

    it('parses progress.reset events', () => {
      const events = [
        createBaseEvent({
          type: 'progress.reset',
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('progress.reset')
    })
  })

  describe('mixed event log parsing', () => {
    it('parses complete event log with mixed interaction types', () => {
      const events = [
        createBaseEvent({
          eventId: 'evt-1',
          type: 'onboarding.completed',
          payload: { pathId: 'citizen-foundations', relatedPaths: [] },
        }),
        createBaseEvent({
          eventId: 'evt-2',
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'completed',
            contentVersion: 'v1',
            interaction: {
              interactionId: 'quiz-1',
              state: { kind: 'quiz', selectedOptionId: 'a' },
            },
          },
        }),
        createBaseEvent({
          eventId: 'evt-3',
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-2',
            status: 'completed',
            contentVersion: 'v1',
            interaction: {
              interactionId: 'allocator-1',
              state: {
                kind: 'budget-allocator',
                allocations: { education: 20 },
                step: 'COMPARE',
                completedAt: new Date().toISOString(),
              },
            },
          },
        }),
        createBaseEvent({
          eventId: 'evt-4',
          type: 'activePath.set',
          payload: { pathId: 'advanced-budgeting' },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(4)
      expect(result.map((e) => e.type)).toEqual([
        'onboarding.completed',
        'content.progressed',
        'content.progressed',
        'activePath.set',
      ])
    })

    it('filters out invalid events while keeping valid ones', () => {
      const events = [
        createBaseEvent({
          eventId: 'evt-1',
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'completed',
            contentVersion: 'v1',
          },
        }),
        // Invalid event - missing required fields
        { type: 'invalid', foo: 'bar' },
        createBaseEvent({
          eventId: 'evt-3',
          type: 'activePath.set',
          payload: { pathId: 'path-1' },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(2)
      expect(result[0].eventId).toBe('evt-1')
      expect(result[1].eventId).toBe('evt-3')
    })
  })

  describe('edge cases', () => {
    it('returns empty array for non-array input', () => {
      expect(parseLearningProgressEvents(null)).toEqual([])
      expect(parseLearningProgressEvents(undefined)).toEqual([])
      expect(parseLearningProgressEvents({})).toEqual([])
      expect(parseLearningProgressEvents('string')).toEqual([])
    })

    it('returns empty array for empty array input', () => {
      expect(parseLearningProgressEvents([])).toEqual([])
    })

    it('handles null interaction state', () => {
      const events = [
        createBaseEvent({
          type: 'content.progressed',
          payload: {
            contentId: 'lesson-1',
            status: 'in_progress',
            contentVersion: 'v1',
            interaction: {
              interactionId: 'quiz-1',
              state: null, // Explicitly null (e.g., after reset)
            },
          },
        }),
      ]

      const result = parseLearningProgressEvents(events)

      expect(result).toHaveLength(1)
      if (result[0].type === 'content.progressed') {
        expect(result[0].payload.interaction?.state).toBeNull()
      }
    })
  })
})
