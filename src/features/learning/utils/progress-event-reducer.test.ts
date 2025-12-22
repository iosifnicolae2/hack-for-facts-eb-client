import { describe, it, expect, vi } from 'vitest'
import { reduceLearningProgressEvents } from './progress-event-reducer'
import type { LearningProgressEvent } from '../types'

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}))

describe('progress-event-reducer', () => {
  it('preserves completion status when later events are lower status', () => {
    const events: LearningProgressEvent[] = [
      {
        eventId: 'event-1',
        clientId: 'client-1',
        occurredAt: '2024-01-01T10:00:00.000Z',
        type: 'content.progressed',
        payload: {
          contentId: 'lesson-1',
          status: 'completed',
          score: 80,
          contentVersion: 'v1',
        },
      },
      {
        eventId: 'event-2',
        clientId: 'client-1',
        occurredAt: '2024-01-02T10:00:00.000Z',
        type: 'content.progressed',
        payload: {
          contentId: 'lesson-1',
          status: 'in_progress',
          score: 40,
          contentVersion: 'v1',
        },
      },
    ]

    const progress = reduceLearningProgressEvents(events)
    const lesson = progress.content['lesson-1']

    expect(lesson.status).toBe('completed')
    expect(lesson.lastAttemptAt).toBe('2024-01-02T10:00:00.000Z')
    expect(lesson.completedAt).toBe('2024-01-01T10:00:00.000Z')
  })

  it('removes interaction state on reset without downgrading status', () => {
    const events: LearningProgressEvent[] = [
      {
        eventId: 'event-1',
        clientId: 'client-1',
        occurredAt: '2024-01-01T10:00:00.000Z',
        type: 'content.progressed',
        payload: {
          contentId: 'lesson-1',
          status: 'passed',
          score: 100,
          contentVersion: 'v1',
          interaction: {
            interactionId: 'quiz-1',
            state: { kind: 'quiz', selectedOptionId: 'b' },
          },
        },
      },
      {
        eventId: 'event-2',
        clientId: 'client-1',
        occurredAt: '2024-01-01T11:00:00.000Z',
        type: 'content.progressed',
        payload: {
          contentId: 'lesson-1',
          status: 'in_progress',
          contentVersion: 'v1',
          interaction: {
            interactionId: 'quiz-1',
            state: null,
          },
        },
      },
    ]

    const progress = reduceLearningProgressEvents(events)
    const lesson = progress.content['lesson-1']

    expect(lesson.status).toBe('passed')
    expect(lesson.interactions).toBeUndefined()
  })

  it('uses the latest onboarding event when re-onboarding', () => {
    const events: LearningProgressEvent[] = [
      {
        eventId: 'event-1',
        clientId: 'client-1',
        occurredAt: '2024-01-01T10:00:00.000Z',
        type: 'onboarding.completed',
        payload: { pathId: 'citizen' },
      },
      {
        eventId: 'event-2',
        clientId: 'client-1',
        occurredAt: '2024-01-02T10:00:00.000Z',
        type: 'onboarding.completed',
        payload: { pathId: 'journalist' },
      },
    ]

    const progress = reduceLearningProgressEvents(events)
    expect(progress.onboarding.pathId).toBe('journalist')
    expect(progress.onboarding.completedAt).toBe('2024-01-02T10:00:00.000Z')
    expect(progress.activePathId).toBe('journalist')
  })

  it('resets progress when a progress.reset event is applied', () => {
    const events: LearningProgressEvent[] = [
      {
        eventId: 'event-1',
        clientId: 'client-1',
        occurredAt: '2024-01-01T10:00:00.000Z',
        type: 'content.progressed',
        payload: {
          contentId: 'lesson-1',
          status: 'passed',
          score: 100,
          contentVersion: 'v1',
        },
      },
      {
        eventId: 'event-2',
        clientId: 'client-1',
        occurredAt: '2024-01-02T10:00:00.000Z',
        type: 'onboarding.completed',
        payload: { pathId: 'citizen' },
      },
      {
        eventId: 'event-3',
        clientId: 'client-1',
        occurredAt: '2024-01-03T10:00:00.000Z',
        type: 'progress.reset',
      },
    ]

    const progress = reduceLearningProgressEvents(events)

    expect(progress.content).toEqual({})
    expect(progress.onboarding.pathId).toBeNull()
    expect(progress.onboarding.completedAt).toBeNull()
    expect(progress.activePathId).toBeNull()
    expect(progress.lastUpdated).toBe('2024-01-03T10:00:00.000Z')
  })
})
