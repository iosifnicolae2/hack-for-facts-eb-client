import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@/test/test-utils'
import { AuthProvider } from '@/lib/auth'
import { LearningProgressProvider } from './use-learning-progress'
import { useLessonCompletion, useQuizInteraction } from './use-learning-interactions'
import type { LearningGuestProgress } from '../types'

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}))

const STORAGE_KEY = 'learning_progress'

const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <AuthProvider>
    <LearningProgressProvider>{children}</LearningProgressProvider>
  </AuthProvider>
)

function seedProgress(progress: LearningGuestProgress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

function readProgress(): LearningGuestProgress {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    throw new Error('Expected learning progress in storage')
  }
  return JSON.parse(raw) as LearningGuestProgress
}

function buildProgress(overrides: Partial<LearningGuestProgress> = {}): LearningGuestProgress {
  const now = new Date().toISOString()
  return {
    version: 1,
    onboarding: { role: null, depth: null, completedAt: null },
    activePathId: null,
    content: {},
    lastUpdated: now,
    ...overrides,
  }
}

describe('use-learning-interactions', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('restores a persisted quiz selection and correctness', async () => {
    const now = new Date().toISOString()
    seedProgress(
      buildProgress({
        lastUpdated: now,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'in_progress',
            lastAttemptAt: now,
            contentVersion: 'v1',
            interactions: {
              'quiz-1': { kind: 'quiz', selectedOptionId: 'b' },
            },
          },
        },
      }),
    )

    const options = [
      { id: 'a', isCorrect: false },
      { id: 'b', isCorrect: true },
    ]

    const { result } = renderHook(
      () => useQuizInteraction({ contentId: 'lesson-1', quizId: 'quiz-1', options }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.selectedOptionId).toBe('b')
    })

    expect(result.current.isAnswered).toBe(true)
    expect(result.current.isCorrect).toBe(true)
  })

  it('ignores invalid persisted selections', async () => {
    const now = new Date().toISOString()
    seedProgress(
      buildProgress({
        lastUpdated: now,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'in_progress',
            lastAttemptAt: now,
            contentVersion: 'v1',
            interactions: {
              'quiz-1': { kind: 'quiz', selectedOptionId: 'z' },
            },
          },
        },
      }),
    )

    const options = [
      { id: 'a', isCorrect: false },
      { id: 'b', isCorrect: true },
    ]

    const { result } = renderHook(
      () => useQuizInteraction({ contentId: 'lesson-1', quizId: 'quiz-1', options }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.selectedOptionId).toBeNull()
    })

    expect(result.current.isAnswered).toBe(false)
  })

  it('stores quiz answers and updates status via action dispatch', async () => {
    const options = [
      { id: 'a', isCorrect: false },
      { id: 'b', isCorrect: true },
    ]

    const { result } = renderHook(
      () => useQuizInteraction({ contentId: 'lesson-1', quizId: 'quiz-1', options, contentVersion: 'v1' }),
      { wrapper },
    )

    await act(async () => {
      await result.current.answer('b')
    })

    await waitFor(() => {
      const stored = readProgress()
      const lesson = stored.content['lesson-1']
      expect(lesson.status).toBe('passed')
      expect(lesson.score).toBe(100)
      expect(lesson.interactions?.['quiz-1']).toEqual({ kind: 'quiz', selectedOptionId: 'b' })
      expect(lesson.completedAt).toBeTruthy()
    })
  })

  it('clears quiz interaction without downgrading status', async () => {
    const now = new Date().toISOString()
    seedProgress(
      buildProgress({
        lastUpdated: now,
        content: {
          'lesson-1': {
            contentId: 'lesson-1',
            status: 'passed',
            score: 100,
            lastAttemptAt: now,
            completedAt: now,
            contentVersion: 'v1',
            interactions: {
              'quiz-1': { kind: 'quiz', selectedOptionId: 'b' },
            },
          },
        },
      }),
    )

    const options = [
      { id: 'a', isCorrect: false },
      { id: 'b', isCorrect: true },
    ]

    const { result } = renderHook(
      () => useQuizInteraction({ contentId: 'lesson-1', quizId: 'quiz-1', options }),
      { wrapper },
    )

    await act(async () => {
      await result.current.reset()
    })

    await waitFor(() => {
      const stored = readProgress()
      const lesson = stored.content['lesson-1']
      expect(lesson.status).toBe('passed')
      expect(lesson.interactions).toBeUndefined()
    })
  })

  it('marks lesson completion via resolver hook', async () => {
    const { result } = renderHook(
      () => useLessonCompletion({ contentId: 'lesson-1', contentVersion: 'v1' }),
      { wrapper },
    )

    await act(async () => {
      await result.current.markComplete()
    })

    await waitFor(() => {
      const stored = readProgress()
      expect(stored.content['lesson-1']?.status).toBe('completed')
      expect(result.current.isCompleted).toBe(true)
    })
  })
})
