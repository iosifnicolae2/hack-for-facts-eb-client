import type { LearningContentProgress, LearningContentStatus, LearningGuestProgress, LearningInteractionState } from '../types'

const STATUS_RANK: Record<LearningContentStatus, number> = {
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

function mergeInteractions(
  a: LearningContentProgress['interactions'],
  b: LearningContentProgress['interactions'],
  preferA: boolean,
): LearningContentProgress['interactions'] {
  if (!a && !b) return undefined
  const base = preferA ? (b ?? {}) : (a ?? {})
  const override = preferA ? (a ?? {}) : (b ?? {})
  const merged: Record<string, LearningInteractionState> = { ...base, ...override }
  return Object.keys(merged).length ? merged : undefined
}

export function mergeContentProgress(a: LearningContentProgress, b: LearningContentProgress): LearningContentProgress {
  const aRank = STATUS_RANK[a.status]
  const bRank = STATUS_RANK[b.status]

  const status = aRank >= bRank ? a.status : b.status
  const score = Math.max(a.score ?? 0, b.score ?? 0)
  const lastAttemptAt = maxIso(a.lastAttemptAt, b.lastAttemptAt)
  const completedAt = a.completedAt && b.completedAt ? maxIso(a.completedAt, b.completedAt) : a.completedAt ?? b.completedAt

  const preferA = isoToTime(a.lastAttemptAt) >= isoToTime(b.lastAttemptAt)
  const contentVersion = preferA ? a.contentVersion : b.contentVersion
  const interactions = mergeInteractions(a.interactions, b.interactions, preferA)

  return {
    contentId: a.contentId,
    status,
    score: score > 0 ? score : undefined,
    lastAttemptAt,
    completedAt,
    contentVersion,
    interactions,
  }
}

export function mergeLearningGuestProgress(local: LearningGuestProgress, remote: LearningGuestProgress): LearningGuestProgress {
  const contentIds = new Set<string>([...Object.keys(local.content), ...Object.keys(remote.content)])

  const mergedContent: Record<string, LearningContentProgress> = {}

  for (const contentId of contentIds) {
    const a = local.content[contentId]
    const b = remote.content[contentId]

    if (a && b) {
      mergedContent[contentId] = mergeContentProgress(a, b)
    } else if (a) {
      mergedContent[contentId] = a
    } else if (b) {
      mergedContent[contentId] = b
    }
  }

  return {
    version: remote.version,
    onboarding: remote.onboarding.completedAt ? remote.onboarding : local.onboarding,
    content: mergedContent,
    lastUpdated: maxIso(local.lastUpdated, remote.lastUpdated),
  }
}
