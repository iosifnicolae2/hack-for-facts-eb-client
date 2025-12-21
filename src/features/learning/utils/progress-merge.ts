import type { LearningGuestProgress, LearningModuleProgress, LearningModuleStatus } from '../types'

const STATUS_RANK: Record<LearningModuleStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
  passed: 3,
}

function isoToTime(value: string): number {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function maxIso(a: string, b: string): string {
  return isoToTime(a) >= isoToTime(b) ? a : b
}

export function mergeModuleProgress(a: LearningModuleProgress, b: LearningModuleProgress): LearningModuleProgress {
  const aRank = STATUS_RANK[a.status]
  const bRank = STATUS_RANK[b.status]

  const status = aRank >= bRank ? a.status : b.status
  const score = Math.max(a.score ?? 0, b.score ?? 0)
  const lastAttemptAt = maxIso(a.lastAttemptAt, b.lastAttemptAt)
  const completedAt = a.completedAt && b.completedAt ? maxIso(a.completedAt, b.completedAt) : a.completedAt ?? b.completedAt

  const contentVersion = isoToTime(a.lastAttemptAt) >= isoToTime(b.lastAttemptAt) ? a.contentVersion : b.contentVersion

  return {
    moduleId: a.moduleId,
    status,
    score: score > 0 ? score : undefined,
    lastAttemptAt,
    completedAt,
    contentVersion,
  }
}

export function mergeLearningGuestProgress(local: LearningGuestProgress, remote: LearningGuestProgress): LearningGuestProgress {
  const pathIds = new Set<string>([...Object.keys(local.paths), ...Object.keys(remote.paths)])

  const mergedPaths: Record<string, { readonly modules: Record<string, LearningModuleProgress> }> = {}

  for (const pathId of pathIds) {
    const localModules = local.paths[pathId]?.modules ?? {}
    const remoteModules = remote.paths[pathId]?.modules ?? {}

    const moduleIds = new Set<string>([...Object.keys(localModules), ...Object.keys(remoteModules)])
    const mergedModules: Record<string, LearningModuleProgress> = {}

    for (const moduleId of moduleIds) {
      const a = localModules[moduleId]
      const b = remoteModules[moduleId]

      if (a && b) {
        mergedModules[moduleId] = mergeModuleProgress(a, b)
      } else if (a) {
        mergedModules[moduleId] = a
      } else if (b) {
        mergedModules[moduleId] = b
      }
    }

    mergedPaths[pathId] = { modules: mergedModules }
  }

  return {
    version: remote.version,
    onboarding: remote.onboarding.completedAt ? remote.onboarding : local.onboarding,
    paths: mergedPaths,
    lastUpdated: maxIso(local.lastUpdated, remote.lastUpdated),
  }
}
