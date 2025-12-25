import { getEmptyLearningGuestProgress } from '../schemas/progress'
import { calculateStreakUpdate } from './streak'
import type {
  LearningContentProgress,
  LearningContentStatus,
  LearningGuestProgress,
  LearningInteractionState,
  LearningProgressEvent,
} from '../types'

const STATUS_RANK: Record<LearningContentStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
  passed: 3,
}

const DEFAULT_CONTENT_VERSION = 'v1' as const

function isoToTime(value: string): number {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function maxIso(a: string, b: string): string {
  return isoToTime(a) >= isoToTime(b) ? a : b
}

function clampScore(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return Math.max(0, Math.min(100, value))
}

function pickHigherStatus(a: LearningContentStatus | undefined, b: LearningContentStatus): LearningContentStatus {
  if (!a) return b
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b
}

function toDateString(iso: string): string {
  if (!iso || iso.length < 10) return iso
  return iso.slice(0, 10)
}

function upsertContentProgress(params: {
  readonly existing: LearningContentProgress | undefined
  readonly now: string
  readonly contentId: string
  readonly status: LearningContentStatus
  readonly score?: number
  readonly contentVersion?: string
  readonly interaction?: {
    readonly interactionId: string
    readonly state: LearningInteractionState | null
  }
}): LearningContentProgress {
  const score = clampScore(params.score)
  const contentVersion = params.contentVersion ?? params.existing?.contentVersion ?? DEFAULT_CONTENT_VERSION
  const interaction = params.interaction
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
      contentId: params.contentId,
      status: params.status,
      score,
      lastAttemptAt: params.now,
      completedAt: params.status === 'completed' || params.status === 'passed' ? params.now : undefined,
      contentVersion,
      interactions,
    }
  }

  const status = pickHigherStatus(params.existing.status, params.status)
  const completedAt =
    status === 'completed' || status === 'passed'
      ? params.existing.completedAt ??
        (params.status === 'completed' || params.status === 'passed' ? params.now : undefined)
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

function applyContentProgressEvent(progress: LearningGuestProgress, event: LearningProgressEvent): LearningGuestProgress {
  if (event.type !== 'content.progressed') return progress
  const payload = event.payload
  const existingContent = progress.content[payload.contentId]
  const nextContent = upsertContentProgress({
    existing: existingContent,
    now: event.occurredAt,
    contentId: payload.contentId,
    status: payload.status,
    score: payload.score,
    contentVersion: payload.contentVersion,
    interaction: payload.interaction,
  })

  const wasCompleted =
    existingContent?.status === 'completed' || existingContent?.status === 'passed'
  const isCompleted = nextContent.status === 'completed' || nextContent.status === 'passed'

  const nextStreak = !wasCompleted && isCompleted
    ? calculateStreakUpdate(progress.streak, toDateString(event.occurredAt))
    : progress.streak

  return {
    ...progress,
    content: {
      ...progress.content,
      [payload.contentId]: nextContent,
    },
    streak: nextStreak,
    lastUpdated: maxIso(progress.lastUpdated, event.occurredAt),
  }
}

function applyOnboardingCompletedEvent(
  progress: LearningGuestProgress,
  event: LearningProgressEvent,
): LearningGuestProgress {
  if (event.type !== 'onboarding.completed') return progress
  return {
    ...progress,
    onboarding: {
      pathId: event.payload.pathId,
      relatedPaths: event.payload.relatedPaths ?? [],
      completedAt: event.occurredAt,
    },
    activePathId: event.payload.pathId,
    lastUpdated: maxIso(progress.lastUpdated, event.occurredAt),
  }
}

function applyOnboardingResetEvent(
  progress: LearningGuestProgress,
  event: LearningProgressEvent,
): LearningGuestProgress {
  if (event.type !== 'onboarding.reset') return progress
  return {
    ...progress,
    onboarding: {
      pathId: null,
      relatedPaths: [],
      completedAt: null,
    },
    lastUpdated: maxIso(progress.lastUpdated, event.occurredAt),
  }
}

function applyActivePathSetEvent(
  progress: LearningGuestProgress,
  event: LearningProgressEvent,
): LearningGuestProgress {
  if (event.type !== 'activePath.set') return progress
  return {
    ...progress,
    activePathId: event.payload.pathId,
    lastUpdated: maxIso(progress.lastUpdated, event.occurredAt),
  }
}

function applyProgressResetEvent(
  progress: LearningGuestProgress,
  event: LearningProgressEvent,
): LearningGuestProgress {
  if (event.type !== 'progress.reset') return progress
  return {
    ...getEmptyLearningGuestProgress(),
    lastUpdated: event.occurredAt,
  }
}

export function applyLearningProgressEvent(
  progress: LearningGuestProgress,
  event: LearningProgressEvent,
): LearningGuestProgress {
  switch (event.type) {
    case 'content.progressed':
      return applyContentProgressEvent(progress, event)
    case 'onboarding.completed':
      return applyOnboardingCompletedEvent(progress, event)
    case 'onboarding.reset':
      return applyOnboardingResetEvent(progress, event)
    case 'activePath.set':
      return applyActivePathSetEvent(progress, event)
    case 'progress.reset':
      return applyProgressResetEvent(progress, event)
  }
}

export function sortLearningProgressEvents(events: LearningProgressEvent[]): LearningProgressEvent[] {
  return [...events].sort((a, b) => {
    const timeDiff = isoToTime(a.occurredAt) - isoToTime(b.occurredAt)
    if (timeDiff !== 0) return timeDiff
    return a.eventId.localeCompare(b.eventId)
  })
}

export function reduceLearningProgressEvents(events: LearningProgressEvent[]): LearningGuestProgress {
  const sorted = sortLearningProgressEvents(events)
  let progress = getEmptyLearningGuestProgress()

  for (const event of sorted) {
    progress = applyLearningProgressEvent(progress, event)
  }

  if (sorted.length > 0) {
    progress = {
      ...progress,
      lastUpdated: sorted.reduce((latest, event) => maxIso(latest, event.occurredAt), progress.lastUpdated),
    }
  }

  return progress
}
