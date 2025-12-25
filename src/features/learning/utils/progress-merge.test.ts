import { describe, expect, it } from 'vitest'
import { LEARNING_PROGRESS_SCHEMA_VERSION } from '../types'
import { mergeContentProgress, mergeLearningGuestProgress } from './progress-merge'
import type { LearningContentProgress, LearningGuestProgress } from '../types'

describe('progress-merge', () => {
  const ISO_1 = '2025-01-01T00:00:00.000Z'
  const ISO_2 = '2025-01-02T00:00:00.000Z'
  const ISO_3 = '2025-01-03T00:00:00.000Z'

  it('prefers the higher status rank', () => {
    const a: LearningContentProgress = {
      contentId: 'm1',
      status: 'completed',
      lastAttemptAt: ISO_1,
      completedAt: ISO_1,
      contentVersion: 'v1',
    }

    const b: LearningContentProgress = {
      contentId: 'm1',
      status: 'passed',
      score: 70,
      lastAttemptAt: ISO_2,
      completedAt: ISO_2,
      contentVersion: 'v2',
    }

    expect(mergeContentProgress(a, b).status).toBe('passed')
  })

  it('takes the max score and omits it when 0', () => {
    const a: LearningContentProgress = {
      contentId: 'm1',
      status: 'in_progress',
      score: 50,
      lastAttemptAt: ISO_1,
      contentVersion: 'v1',
    }

    const b: LearningContentProgress = {
      contentId: 'm1',
      status: 'completed',
      score: 0,
      lastAttemptAt: ISO_2,
      completedAt: ISO_2,
      contentVersion: 'v2',
    }

    expect(mergeContentProgress(a, b).score).toBe(50)

    const c: LearningContentProgress = {
      contentId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_1,
      contentVersion: 'v1',
    }

    const d: LearningContentProgress = {
      contentId: 'm1',
      status: 'in_progress',
      score: 0,
      lastAttemptAt: ISO_2,
      contentVersion: 'v2',
    }

    expect(mergeContentProgress(c, d).score).toBeUndefined()
  })

  it('uses the latest lastAttemptAt and completedAt', () => {
    const a: LearningContentProgress = {
      contentId: 'm1',
      status: 'completed',
      lastAttemptAt: ISO_1,
      completedAt: ISO_1,
      contentVersion: 'v1',
    }

    const b: LearningContentProgress = {
      contentId: 'm1',
      status: 'completed',
      lastAttemptAt: ISO_3,
      completedAt: ISO_2,
      contentVersion: 'v2',
    }

    const merged = mergeContentProgress(a, b)

    expect(merged.lastAttemptAt).toBe(ISO_3)
    expect(merged.completedAt).toBe(ISO_2)
  })

  it('uses the contentVersion from the most recent attempt; local wins ties', () => {
    const a: LearningContentProgress = {
      contentId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_2,
      contentVersion: 'local',
      interactions: { q1: { kind: 'quiz', selectedOptionId: 'a' } },
    }

    const b: LearningContentProgress = {
      contentId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_2,
      contentVersion: 'remote',
      interactions: {
        q1: { kind: 'quiz', selectedOptionId: 'b' },
        q2: { kind: 'quiz', selectedOptionId: 'c' },
      },
    }

    expect(mergeContentProgress(a, b).contentVersion).toBe('local')
  })

  it('merges interactions, preferring the most recent attempt for conflicts', () => {
    const a: LearningContentProgress = {
      contentId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_2,
      contentVersion: 'v1',
      interactions: {
        q1: { kind: 'quiz', selectedOptionId: 'a' },
        q2: { kind: 'quiz', selectedOptionId: 'b' },
      },
    }

    const b: LearningContentProgress = {
      contentId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_3,
      contentVersion: 'v2',
      interactions: {
        q2: { kind: 'quiz', selectedOptionId: 'c' },
        q3: { kind: 'quiz', selectedOptionId: 'd' },
      },
    }

    const merged = mergeContentProgress(a, b)
    expect(merged.interactions).toEqual({
      q1: { kind: 'quiz', selectedOptionId: 'a' },
      q2: { kind: 'quiz', selectedOptionId: 'c' },
      q3: { kind: 'quiz', selectedOptionId: 'd' },
    })
  })

  it('merges content progress, keeping remote schema version', () => {
    const local: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { pathId: null, relatedPaths: [], completedAt: null },
      activePathId: null,
      lastUpdated: ISO_1,
      content: {
        'budget-basics': {
          contentId: 'budget-basics',
          status: 'completed',
          lastAttemptAt: ISO_1,
          completedAt: ISO_1,
          contentVersion: 'v1',
        },
      },
      streak: { currentStreak: 1, longestStreak: 1, lastActivityDate: '2025-01-01' },
    }

    const remote: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { pathId: 'citizen', relatedPaths: [], completedAt: ISO_2 },
      activePathId: 'citizen',
      lastUpdated: ISO_3,
      content: {
        'budget-basics': {
          contentId: 'budget-basics',
          status: 'passed',
          score: 80,
          lastAttemptAt: ISO_2,
          completedAt: ISO_2,
          contentVersion: 'v2',
        },
        m2: {
          contentId: 'm2',
          status: 'in_progress',
          lastAttemptAt: ISO_3,
          contentVersion: 'v1',
        },
      },
      streak: { currentStreak: 3, longestStreak: 5, lastActivityDate: '2025-01-03' },
    }

    const merged = mergeLearningGuestProgress(local, remote)

    expect(merged.version).toBe(remote.version)
    expect(merged.lastUpdated).toBe(ISO_3)
    expect(merged.onboarding.pathId).toBe('citizen')
    expect(merged.content['budget-basics']?.status).toBe('passed')
    expect(merged.content.m2?.contentId).toBe('m2')
  })

  it('is idempotent when re-merging the same remote state', () => {
    const local: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { pathId: null, relatedPaths: [], completedAt: null },
      activePathId: null,
      lastUpdated: ISO_1,
      content: {
        m1: {
          contentId: 'm1',
          status: 'in_progress',
          lastAttemptAt: ISO_1,
          contentVersion: 'v1',
        },
      },
      streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
    }

    const remote: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { pathId: 'citizen', relatedPaths: [], completedAt: ISO_2 },
      activePathId: 'journalist',
      lastUpdated: ISO_2,
      content: {
        m1: {
          contentId: 'm1',
          status: 'completed',
          lastAttemptAt: ISO_2,
          completedAt: ISO_2,
          contentVersion: 'v2',
        },
      },
      streak: { currentStreak: 2, longestStreak: 2, lastActivityDate: '2025-01-02' },
    }

    const once = mergeLearningGuestProgress(local, remote)
    const twice = mergeLearningGuestProgress(once, remote)

    expect(twice).toEqual(once)
  })
})
