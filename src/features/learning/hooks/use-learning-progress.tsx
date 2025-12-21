import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@lingui/core/macro'
import { useAuth } from '@/lib/auth'
import { getEmptyLearningGuestProgress, parseLearningGuestProgress } from '../schemas/progress'
import { mergeLearningGuestProgress } from '../utils/progress-merge'
import type { LearningAuthState, LearningGuestProgress, LearningModuleProgress, LearningModuleStatus, UserRole, LearningDepth } from '../types'

const GUEST_STORAGE_KEY = 'learning_progress'

function getAuthStorageKey(userId: string): string {
  return `learning_progress:${userId}`
}

const POC_SIMULATED_AUTH_KEY = 'learning:poc:isAuthenticated'
const POC_SIMULATED_USER_ID_KEY = 'learning:poc:userId'

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

type SaveModuleProgressInput = {
  readonly pathId: string
  readonly moduleId: string
  readonly status: LearningModuleStatus
  readonly score?: number
  readonly contentVersion?: string
}

type SaveOnboardingInput = {
  readonly role: UserRole
  readonly depth: LearningDepth
}

type LearningProgressContextValue = {
  readonly auth: LearningAuthState
  readonly progress: LearningGuestProgress
  readonly getModuleProgress: (pathId: string, moduleId: string) => LearningModuleProgress | undefined
  readonly saveModuleProgress: (input: SaveModuleProgressInput) => Promise<void>
  readonly saveOnboarding: (input: SaveOnboardingInput) => Promise<void>
  readonly sync: () => Promise<void>
  readonly poc: {
    readonly canSimulateAuth: boolean
    readonly toggleSimulatedAuth: () => void
    readonly clearGuest: () => void
    readonly clearAuth: () => void
  }
}

const LearningProgressContext = createContext<LearningProgressContextValue | null>(null)

function loadProgressForKey(key: string): LearningGuestProgress {
  return parseLearningGuestProgress(readJsonFromStorage(key))
}

function saveProgressForKey(key: string, state: LearningGuestProgress): void {
  writeJsonToStorage(key, state)
}

function getSimulatedAuthFromStorage(): { readonly isAuthenticated: boolean; readonly userId: string } {
  const rawAuth = readJsonFromStorage(POC_SIMULATED_AUTH_KEY)
  const rawUserId = readJsonFromStorage(POC_SIMULATED_USER_ID_KEY)

  const isAuthenticated = rawAuth === true
  const userId = typeof rawUserId === 'string' && rawUserId.trim().length ? rawUserId : 'poc-user'

  return { isAuthenticated, userId }
}

function getEffectiveAuthState(params: {
  readonly isDev: boolean
  readonly isAuthEnabled: boolean
  readonly isSignedIn: boolean
  readonly userId: string | null
  readonly simulated: { readonly isAuthenticated: boolean; readonly userId: string }
}): LearningAuthState {
  const isActuallyAuthenticated = params.isAuthEnabled && params.isSignedIn && Boolean(params.userId)
  const canUseSimulated = params.isDev && !isActuallyAuthenticated

  if (isActuallyAuthenticated) {
    return {
      isAuthenticated: true,
      userId: params.userId,
      isSimulated: false,
    }
  }

  if (canUseSimulated && params.simulated.isAuthenticated) {
    return {
      isAuthenticated: true,
      userId: params.simulated.userId,
      isSimulated: true,
    }
  }

  return {
    isAuthenticated: false,
    userId: null,
    isSimulated: false,
  }
}

function clampScore(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return Math.max(0, Math.min(100, value))
}

function upsertModuleProgress(params: {
  readonly existing: LearningModuleProgress | undefined
  readonly input: SaveModuleProgressInput
  readonly now: string
}): LearningModuleProgress {
  const score = clampScore(params.input.score)
  const contentVersion = params.input.contentVersion ?? 'poc'

  if (!params.existing) {
    return {
      moduleId: params.input.moduleId,
      status: params.input.status,
      score,
      lastAttemptAt: params.now,
      completedAt: params.input.status === 'completed' || params.input.status === 'passed' ? params.now : undefined,
      contentVersion,
    }
  }

  const completedAt =
    params.input.status === 'completed' || params.input.status === 'passed'
      ? params.existing.completedAt ?? params.now
      : params.existing.completedAt

  const mergedScore = (() => {
    const existingScore = params.existing.score
    if (typeof score !== 'number') return existingScore
    if (typeof existingScore !== 'number') return score
    return Math.max(existingScore, score)
  })()

  return {
    moduleId: params.existing.moduleId,
    status: params.input.status,
    score: mergedScore,
    lastAttemptAt: params.now,
    completedAt,
    contentVersion,
  }
}

export function LearningProgressProvider({ children }: { readonly children: React.ReactNode }) {
  const { isEnabled, isLoaded, isSignedIn, user } = useAuth()

  const [simulatedAuth, setSimulatedAuth] = useState(() =>
    import.meta.env.DEV ? getSimulatedAuthFromStorage() : { isAuthenticated: false, userId: 'poc-user' },
  )

  const auth = useMemo<LearningAuthState>(() => {
    return getEffectiveAuthState({
      isDev: import.meta.env.DEV,
      isAuthEnabled: isEnabled,
      isSignedIn,
      userId: user?.id ?? null,
      simulated: simulatedAuth,
    })
  }, [isEnabled, isSignedIn, simulatedAuth, user?.id])

  const [progress, setProgress] = useState<LearningGuestProgress>(() => getEmptyLearningGuestProgress())

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
    if (!isLoaded) return

    const prevIsAuthenticated = prevIsAuthenticatedRef.current
    prevIsAuthenticatedRef.current = auth.isAuthenticated

    if (!prevIsAuthenticated && auth.isAuthenticated) {
      void sync()
      return
    }

    recomputeProgress()
  }, [auth.isAuthenticated, isLoaded, recomputeProgress, sync])

  const saveModuleProgress = useCallback(
    async (input: SaveModuleProgressInput) => {
      if (!input.pathId.trim()) throw new Error(t`Missing path id`)
      if (!input.moduleId.trim()) throw new Error(t`Missing module id`)

      const storageKey = auth.isAuthenticated && auth.userId ? getAuthStorageKey(auth.userId) : GUEST_STORAGE_KEY
      const current = loadProgressForKey(storageKey)
      const timestamp = nowIso()

      const existingModule = current.paths[input.pathId]?.modules?.[input.moduleId]
      const nextModule = upsertModuleProgress({ existing: existingModule, input, now: timestamp })

      const nextState: LearningGuestProgress = {
        ...current,
        paths: {
          ...current.paths,
          [input.pathId]: {
            modules: {
              ...(current.paths[input.pathId]?.modules ?? {}),
              [input.moduleId]: nextModule,
            },
          },
        },
        lastUpdated: timestamp,
      }

      saveProgressForKey(storageKey, nextState)
      setProgress(nextState)
    },
    [auth.isAuthenticated, auth.userId],
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
        lastUpdated: timestamp,
      }

      saveProgressForKey(storageKey, nextState)
      setProgress(nextState)
    },
    [auth.isAuthenticated, auth.userId],
  )

  const getModuleProgress = useCallback(
    (pathId: string, moduleId: string) => {
      return progress.paths[pathId]?.modules?.[moduleId]
    },
    [progress.paths],
  )

  const poc = useMemo(() => {
    const canSimulateAuth = import.meta.env.DEV && !(isEnabled && isSignedIn && Boolean(user?.id))

    return {
      canSimulateAuth,
      toggleSimulatedAuth: () => {
        if (!canSimulateAuth) return

        const next = { isAuthenticated: !simulatedAuth.isAuthenticated, userId: simulatedAuth.userId }
        writeJsonToStorage(POC_SIMULATED_AUTH_KEY, next.isAuthenticated)
        writeJsonToStorage(POC_SIMULATED_USER_ID_KEY, next.userId)
        setSimulatedAuth(next)
      },
      clearGuest: () => {
        removeFromStorage(GUEST_STORAGE_KEY)
        recomputeProgress()
      },
      clearAuth: () => {
        if (!auth.userId) return
        removeFromStorage(getAuthStorageKey(auth.userId))
        recomputeProgress()
      },
    }
  }, [auth.userId, isEnabled, isSignedIn, recomputeProgress, simulatedAuth, user?.id])

  const value = useMemo<LearningProgressContextValue>(
    () => ({
      auth,
      progress,
      getModuleProgress,
      saveModuleProgress,
      saveOnboarding,
      sync,
      poc,
    }),
    [auth, progress, getModuleProgress, saveModuleProgress, saveOnboarding, sync, poc],
  )

  return <LearningProgressContext.Provider value={value}>{children}</LearningProgressContext.Provider>
}

export function useLearningProgress() {
  const ctx = useContext(LearningProgressContext)
  if (!ctx) throw new Error('useLearningProgress must be used within <LearningProgressProvider>')
  return ctx
}
