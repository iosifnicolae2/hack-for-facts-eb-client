import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@/test/test-utils'
import { AuthProvider } from '@/lib/auth'
import { LearningProgressProvider } from './use-learning-progress'
import { useAutoOnboarding } from './use-auto-onboarding'
import type { LearningGuestProgress, LearningProgressEvent } from '../types'

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}))

const EVENTS_KEY = 'learning_progress_events'
const SNAPSHOT_KEY = 'learning_progress_snapshot'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { readonly children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LearningProgressProvider>{children}</LearningProgressProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function buildProgress(overrides: Partial<LearningGuestProgress> = {}): LearningGuestProgress {
  const now = new Date().toISOString()
  return {
    version: 1,
    onboarding: { pathId: null, relatedPaths: [], completedAt: null },
    activePathId: null,
    content: {},
    streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
    lastUpdated: now,
    ...overrides,
  }
}

function buildEventsFromProgress(progress: LearningGuestProgress): LearningProgressEvent[] {
  const events: LearningProgressEvent[] = []

  if (progress.onboarding.completedAt && progress.onboarding.pathId) {
    events.push({
      eventId: 'event-onboarding',
      clientId: 'test-client',
      occurredAt: progress.onboarding.completedAt,
      type: 'onboarding.completed',
      payload: { pathId: progress.onboarding.pathId, relatedPaths: progress.onboarding.relatedPaths ?? [] },
    })
  }

  return events
}

function seedProgress(progress: LearningGuestProgress) {
  const events = buildEventsFromProgress(progress)
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

function readProgress(): LearningGuestProgress {
  const raw = window.localStorage.getItem(SNAPSHOT_KEY)
  if (!raw) {
    throw new Error('Expected learning progress in storage')
  }
  return JSON.parse(raw) as LearningGuestProgress
}

describe('useAutoOnboarding', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('auto-completes onboarding for new users with a valid path', async () => {
    // Start with no onboarding
    renderHook(() => useAutoOnboarding({ pathId: 'citizen' }), { wrapper: createWrapper() })

    await waitFor(() => {
      const stored = readProgress()
      expect(stored.onboarding.completedAt).toBeTruthy()
      expect(stored.onboarding.pathId).toBe('citizen')
      expect(stored.activePathId).toBe('citizen')
    })
  })

  it('does not modify onboarding for users who already completed it', async () => {
    const completedAt = '2024-01-01T00:00:00.000Z'
    seedProgress(
      buildProgress({
        onboarding: { pathId: 'journalist', relatedPaths: [], completedAt },
        activePathId: 'journalist',
      }),
    )

    renderHook(() => useAutoOnboarding({ pathId: 'citizen' }), { wrapper: createWrapper() })

    // Wait a bit to ensure the hook has processed
    await new Promise((resolve) => setTimeout(resolve, 100))

    const stored = readProgress()
    // Should still have the original onboarding, not the new path
    expect(stored.onboarding.pathId).toBe('journalist')
    expect(stored.onboarding.completedAt).toBe(completedAt)
  })

  it('does not complete onboarding for invalid paths', async () => {
    renderHook(() => useAutoOnboarding({ pathId: 'invalid-path-that-does-not-exist' }), { wrapper: createWrapper() })

    // Wait a bit to ensure the hook has processed
    await new Promise((resolve) => setTimeout(resolve, 100))

    const stored = readProgress()
    expect(stored.onboarding.completedAt).toBeNull()
    expect(stored.onboarding.pathId).toBeNull()
  })

  it('handles pathId changes correctly', async () => {
    const { rerender } = renderHook(
      ({ pathId }: { readonly pathId: string }) => useAutoOnboarding({ pathId }),
      { wrapper: createWrapper(), initialProps: { pathId: 'citizen' } },
    )

    await waitFor(() => {
      const stored = readProgress()
      expect(stored.onboarding.pathId).toBe('citizen')
    })

    // Rerender with a different pathId - should NOT change onboarding
    // because onboarding is already completed
    rerender({ pathId: 'journalist' })

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100))

    const stored = readProgress()
    // Should still have the original path since onboarding is already completed
    expect(stored.onboarding.pathId).toBe('citizen')
  })
})
