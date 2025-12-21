import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@lingui/core/macro'
import { useAuth } from '@/lib/auth'
import { getEmptyLearningGuestProgress, parseLearningGuestProgress } from '../schemas/progress'
import { mergeLearningGuestProgress } from '../utils/progress-merge'
import { getQuizStatus } from '../utils/interactions'
import { calculateStreakUpdate, getTodayDateString } from '../utils/streak'
import type {
  LearningAuthState,
  LearningContentProgress,
  LearningContentStatus,
  LearningGuestProgress,
  LearningInteractionAction,
  LearningInteractionState,
  UserRole,
  LearningDepth,
} from '../types'

const GUEST_STORAGE_KEY = 'learning_progress'

function getAuthStorageKey(userId: string): string {
  return `learning_progress:${userId}`
}

function readJsonFromStorage(key: string): unknown {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function writeJsonToStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}

function nowIso(): string {
  return new Date().toISOString()
}

type SaveContentProgressInput = {
  readonly contentId: string
  readonly status: LearningContentStatus
  readonly score?: number
  readonly contentVersion?: string
  readonly interaction?: {
    readonly interactionId: string
    readonly state: LearningInteractionState | null
  }
}

type SaveOnboardingInput = {
  readonly role: UserRole
  readonly depth: LearningDepth
}

type LearningProgressContextValue = {
  readonly isReady: boolean
  readonly auth: LearningAuthState
  readonly progress: LearningGuestProgress
  readonly getContentProgress: (contentId: string) => LearningContentProgress | undefined
  readonly saveContentProgress: (input: SaveContentProgressInput) => Promise<void>
  readonly dispatchInteractionAction: (action: LearningInteractionAction) => Promise<void>
  readonly saveOnboarding: (input: SaveOnboardingInput) => Promise<void>
  readonly setActivePathId: (pathId: string | null) => Promise<void>
  readonly resetOnboarding: () => Promise<void>
  readonly sync: () => Promise<void>
  readonly clearProgress: () => void
}

const LearningProgressContext = createContext<LearningProgressContextValue | null>(null)

function loadProgressForKey(key: string): LearningGuestProgress {
  return parseLearningGuestProgress(readJsonFromStorage(key))
}

function saveProgressForKey(key: string, state: LearningGuestProgress): void {
  writeJsonToStorage(key, state)
}

function getAuthState(params: {
  readonly isAuthEnabled: boolean
  readonly isSignedIn: boolean
  readonly userId: string | null
}): LearningAuthState {
  const isAuthenticated = params.isAuthEnabled && params.isSignedIn && Boolean(params.userId)

  if (isAuthenticated) {
    return {
      isAuthenticated: true,
      userId: params.userId,
    }
  }

  return {
    isAuthenticated: false,
    userId: null,
  }
}

function clampScore(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return Math.max(0, Math.min(100, value))
}

const STATUS_RANK: Record<LearningContentStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
  passed: 3,
}

function pickHigherStatus(a: LearningContentStatus | undefined, b: LearningContentStatus): LearningContentStatus {
  if (!a) return b
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b
}

function upsertContentProgress(params: {
  readonly existing: LearningContentProgress | undefined
  readonly input: SaveContentProgressInput
  readonly now: string
}): LearningContentProgress {
  const score = clampScore(params.input.score)
  const contentVersion = params.input.contentVersion ?? params.existing?.contentVersion ?? 'v1'
  const interaction = params.input.interaction
  const interactions = (() => {
    if (!interaction) return params.existing?.interactions
    const nextInteractions = { ...(params.existing?.interactions ?? {}) }
    if (interaction.state === null) {
      delete nextInteractions[interaction.interactionId]
    } else {
      nextInteractions[interaction.interactionId] = interaction.state
    }
    return Object.keys(nextInteractions).length ? nextInteractions : undefined
  })()

  if (!params.existing) {
    return {
      contentId: params.input.contentId,
      status: params.input.status,
      score,
      lastAttemptAt: params.now,
      completedAt: params.input.status === 'completed' || params.input.status === 'passed' ? params.now : undefined,
      contentVersion,
      interactions,
    }
  }

  const status = pickHigherStatus(params.existing.status, params.input.status)
  const completedAt =
    status === 'completed' || status === 'passed'
      ? params.existing.completedAt ??
        (params.input.status === 'completed' || params.input.status === 'passed' ? params.now : undefined)
      : params.existing.completedAt

  const mergedScore = (() => {
    const existingScore = params.existing.score
    if (typeof score !== 'number') return existingScore
    if (typeof existingScore !== 'number') return score
    return Math.max(existingScore, score)
  })()

  return {
    contentId: params.existing.contentId,
    status,
    score: mergedScore,
    lastAttemptAt: params.now,
    completedAt,
    contentVersion,
    interactions,
  }
}

function resolveInteractionAction(
  action: LearningInteractionAction,
  progress: LearningGuestProgress,
): SaveContentProgressInput {
  switch (action.type) {
    case 'quiz.answer': {
      const clampedScore = clampScore(action.score)
      const status = getQuizStatus(clampedScore ?? 0)
      return {
        contentId: action.contentId,
        status,
        score: clampedScore,
        contentVersion: action.contentVersion,
        interaction: {
          interactionId: action.interactionId,
          state: {
            kind: 'quiz',
            selectedOptionId: action.selectedOptionId,
          },
        },
      }
    }
    case 'quiz.reset': {
      const currentStatus = progress.content[action.contentId]?.status ?? 'in_progress'
      return {
        contentId: action.contentId,
        status: currentStatus,
        interaction: {
          interactionId: action.interactionId,
          state: null,
        },
      }
    }
  }
}

export function LearningProgressProvider({ children }: { readonly children: React.ReactNode }) {
  const { isEnabled, isLoaded, isSignedIn, user } = useAuth()

  const auth = useMemo<LearningAuthState>(() => {
    return getAuthState({
      isAuthEnabled: isEnabled,
      isSignedIn,
      userId: user?.id ?? null,
    })
  }, [isEnabled, isSignedIn, user?.id])

  const [progress, setProgress] = useState<LearningGuestProgress>(() => getEmptyLearningGuestProgress())
  const [isReady, setIsReady] = useState(false)

  const prevIsAuthenticatedRef = useRef<boolean>(auth.isAuthenticated)

  const recomputeProgress = useCallback(() => {
    if (auth.isAuthenticated && auth.userId) {
      setProgress(loadProgressForKey(getAuthStorageKey(auth.userId)))
      return
    }

    setProgress(loadProgressForKey(GUEST_STORAGE_KEY))
  }, [auth.isAuthenticated, auth.userId])

  const sync = useCallback(async () => {
    if (!auth.isAuthenticated || !auth.userId) {
      recomputeProgress()
      return
    }

    const guest = loadProgressForKey(GUEST_STORAGE_KEY)
    const remote = loadProgressForKey(getAuthStorageKey(auth.userId))
    const merged = mergeLearningGuestProgress(guest, remote)

    saveProgressForKey(getAuthStorageKey(auth.userId), merged)
    removeFromStorage(GUEST_STORAGE_KEY)
    setProgress(merged)
  }, [auth.isAuthenticated, auth.userId, recomputeProgress])

  useEffect(() => {
    if (!isLoaded) {
      setIsReady(false)
      return
    }

    const prevIsAuthenticated = prevIsAuthenticatedRef.current
    prevIsAuthenticatedRef.current = auth.isAuthenticated

    if (!prevIsAuthenticated && auth.isAuthenticated) {
      void sync().then(() => setIsReady(true))
      return
    }

    recomputeProgress()
    setIsReady(true)
  }, [auth.isAuthenticated, isLoaded, recomputeProgress, sync])

  const saveContentProgress = useCallback(
    async (input: SaveContentProgressInput) => {
      if (!input.contentId.trim()) throw new Error(t`Missing content id`)

      const storageKey = auth.isAuthenticated && auth.userId ? getAuthStorageKey(auth.userId) : GUEST_STORAGE_KEY
      const current = loadProgressForKey(storageKey)
      const timestamp = nowIso()

      const existingContent = current.content[input.contentId]
      const nextContent = upsertContentProgress({ existing: existingContent, input, now: timestamp })

      // Update streak when content is completed or passed
      const isNewCompletion =
        (input.status === 'completed' || input.status === 'passed') &&
        existingContent?.status !== 'completed' &&
        existingContent?.status !== 'passed'

      const nextStreak = isNewCompletion
        ? calculateStreakUpdate(current.streak, getTodayDateString())
        : current.streak

      const nextState: LearningGuestProgress = {
        ...current,
        content: {
          ...current.content,
          [input.contentId]: nextContent,
        },
        streak: nextStreak,
        lastUpdated: timestamp,
      }

      saveProgressForKey(storageKey, nextState)
      setProgress(nextState)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('learning-progress-update'))
      }
    },
    [auth.isAuthenticated, auth.userId],
  )

  const dispatchInteractionAction = useCallback(
    async (action: LearningInteractionAction) => {
      const resolved = resolveInteractionAction(action, progress)
      await saveContentProgress(resolved)
    },
    [progress, saveContentProgress],
  )

  const saveOnboarding = useCallback(
    async (input: SaveOnboardingInput) => {
      const storageKey = auth.isAuthenticated && auth.userId ? getAuthStorageKey(auth.userId) : GUEST_STORAGE_KEY
      const current = loadProgressForKey(storageKey)
      const timestamp = nowIso()

      const nextState: LearningGuestProgress = {
        ...current,
        onboarding: {
          role: input.role,
          depth: input.depth,
          completedAt: timestamp,
        },
        activePathId: input.role, // Default active path to selected role
        lastUpdated: timestamp,
      }

      saveProgressForKey(storageKey, nextState)
      setProgress(nextState)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('learning-progress-update'))
      }
    },
    [auth.isAuthenticated, auth.userId],
  )

  const setActivePathId = useCallback(
    async (pathId: string | null) => {
      const storageKey = auth.isAuthenticated && auth.userId ? getAuthStorageKey(auth.userId) : GUEST_STORAGE_KEY
      const current = loadProgressForKey(storageKey)
      const timestamp = nowIso()

      const nextState: LearningGuestProgress = {
        ...current,
        activePathId: pathId,
        lastUpdated: timestamp,
      }

      saveProgressForKey(storageKey, nextState)
      setProgress(nextState)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('learning-progress-update'))
      }
    },
    [auth.isAuthenticated, auth.userId],
  )

  const resetOnboarding = useCallback(async () => {
    const storageKey = auth.isAuthenticated && auth.userId ? getAuthStorageKey(auth.userId) : GUEST_STORAGE_KEY
    const current = loadProgressForKey(storageKey)
    const timestamp = nowIso()

    const nextState: LearningGuestProgress = {
      ...current,
      onboarding: {
        role: null,
        depth: null,
        completedAt: null,
      },
      lastUpdated: timestamp,
    }

    saveProgressForKey(storageKey, nextState)
    setProgress(nextState)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('learning-progress-update'))
    }
  }, [auth.isAuthenticated, auth.userId])

  const getContentProgress = useCallback(
    (contentId: string) => {
      return progress.content[contentId]
    },
    [progress.content],
  )

  const clearProgress = useCallback(() => {
    if (auth.isAuthenticated && auth.userId) {
      removeFromStorage(getAuthStorageKey(auth.userId))
    } else {
      removeFromStorage(GUEST_STORAGE_KEY)
    }
    recomputeProgress()
  }, [auth.isAuthenticated, auth.userId, recomputeProgress])

  const value = useMemo<LearningProgressContextValue>(
    () => ({
      isReady,
      auth,
      progress,
      getContentProgress,
      saveContentProgress,
      dispatchInteractionAction,
      saveOnboarding,
      setActivePathId,
      resetOnboarding,
      sync,
      clearProgress,
    }),
    [
      isReady,
      auth,
      progress,
      getContentProgress,
      saveContentProgress,
      dispatchInteractionAction,
      saveOnboarding,
      setActivePathId,
      resetOnboarding,
      sync,
      clearProgress,
    ],
  )

  return <LearningProgressContext.Provider value={value}>{children}</LearningProgressContext.Provider>
}

export function useLearningProgress() {
  const ctx = useContext(LearningProgressContext)
  if (!ctx) throw new Error('useLearningProgress must be used within <LearningProgressProvider>')
  return ctx
}
