import { describe, expect, it } from 'vitest'
import { LEARNING_PROGRESS_SCHEMA_VERSION } from '../types'
import { mergeLearningGuestProgress, mergeModuleProgress } from './progress-merge'
import type { LearningGuestProgress, LearningModuleProgress } from '../types'

describe('progress-merge', () => {
  const ISO_1 = '2025-01-01T00:00:00.000Z'
  const ISO_2 = '2025-01-02T00:00:00.000Z'
  const ISO_3 = '2025-01-03T00:00:00.000Z'

  it('prefers the higher status rank', () => {
    const a: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'completed',
      lastAttemptAt: ISO_1,
      completedAt: ISO_1,
      contentVersion: 'v1',
    }

    const b: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'passed',
      score: 70,
      lastAttemptAt: ISO_2,
      completedAt: ISO_2,
      contentVersion: 'v2',
    }

    expect(mergeModuleProgress(a, b).status).toBe('passed')
  })

  it('takes the max score and omits it when 0', () => {
    const a: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'in_progress',
      score: 50,
      lastAttemptAt: ISO_1,
      contentVersion: 'v1',
    }

    const b: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'completed',
      score: 0,
      lastAttemptAt: ISO_2,
      completedAt: ISO_2,
      contentVersion: 'v2',
    }

    expect(mergeModuleProgress(a, b).score).toBe(50)

    const c: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_1,
      contentVersion: 'v1',
    }

    const d: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'in_progress',
      score: 0,
      lastAttemptAt: ISO_2,
      contentVersion: 'v2',
    }

    expect(mergeModuleProgress(c, d).score).toBeUndefined()
  })

  it('uses the latest lastAttemptAt and completedAt', () => {
    const a: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'completed',
      lastAttemptAt: ISO_1,
      completedAt: ISO_1,
      contentVersion: 'v1',
    }

    const b: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'completed',
      lastAttemptAt: ISO_3,
      completedAt: ISO_2,
      contentVersion: 'v2',
    }

    const merged = mergeModuleProgress(a, b)

    expect(merged.lastAttemptAt).toBe(ISO_3)
    expect(merged.completedAt).toBe(ISO_2)
  })

  it('uses the contentVersion from the most recent attempt; local wins ties', () => {
    const a: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_2,
      contentVersion: 'local',
    }

    const b: LearningModuleProgress = {
      moduleId: 'm1',
      status: 'in_progress',
      lastAttemptAt: ISO_2,
      contentVersion: 'remote',
    }

    expect(mergeModuleProgress(a, b).contentVersion).toBe('local')
  })

  it('merges paths and modules, keeping remote schema version', () => {
    const local: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { role: null, depth: null, completedAt: null },
      lastUpdated: ISO_1,
      paths: {
        citizen: {
          modules: {
            'budget-basics': {
              moduleId: 'budget-basics',
              status: 'completed',
              lastAttemptAt: ISO_1,
              completedAt: ISO_1,
              contentVersion: 'v1',
            },
          },
        },
      },
    }

    const remote: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { role: 'student', depth: 'beginner', completedAt: ISO_2 },
      lastUpdated: ISO_3,
      paths: {
        citizen: {
          modules: {
            'budget-basics': {
              moduleId: 'budget-basics',
              status: 'passed',
              score: 80,
              lastAttemptAt: ISO_2,
              completedAt: ISO_2,
              contentVersion: 'v2',
            },
          },
        },
        another: {
          modules: {
            m2: {
              moduleId: 'm2',
              status: 'in_progress',
              lastAttemptAt: ISO_3,
              contentVersion: 'v1',
            },
          },
        },
      },
    }

    const merged = mergeLearningGuestProgress(local, remote)

    expect(merged.version).toBe(remote.version)
    expect(merged.lastUpdated).toBe(ISO_3)
    expect(merged.onboarding.role).toBe('student')
    expect(merged.paths.citizen?.modules['budget-basics']?.status).toBe('passed')
    expect(merged.paths.another?.modules.m2?.moduleId).toBe('m2')
  })

  it('is idempotent when re-merging the same remote state', () => {
    const local: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { role: null, depth: null, completedAt: null },
      lastUpdated: ISO_1,
      paths: {
        citizen: {
          modules: {
            m1: {
              moduleId: 'm1',
              status: 'in_progress',
              lastAttemptAt: ISO_1,
              contentVersion: 'v1',
            },
          },
        },
      },
    }

    const remote: LearningGuestProgress = {
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      onboarding: { role: 'student', depth: 'beginner', completedAt: ISO_2 },
      lastUpdated: ISO_2,
      paths: {
        citizen: {
          modules: {
            m1: {
              moduleId: 'm1',
              status: 'completed',
              lastAttemptAt: ISO_2,
              completedAt: ISO_2,
              contentVersion: 'v2',
            },
          },
        },
      },
    }

    const once = mergeLearningGuestProgress(local, remote)
    const twice = mergeLearningGuestProgress(once, remote)

    expect(twice).toEqual(once)
  })
})
