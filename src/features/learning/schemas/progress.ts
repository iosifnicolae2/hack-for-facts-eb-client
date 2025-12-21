import { z } from 'zod'
import {
  LEARNING_PROGRESS_SCHEMA_VERSION,
  LEARNING_CERTIFICATES_SCHEMA_VERSION,
  type LearningCertificatesState,
  type LearningGuestProgress,
} from '../types'

export const LearningContentStatusSchema = z.enum(['not_started', 'in_progress', 'completed', 'passed'])

const LearningQuizInteractionSchema = z.object({
  kind: z.literal('quiz'),
  selectedOptionId: z.string().nullable(),
})

const LearningInteractionStateSchema = z.discriminatedUnion('kind', [LearningQuizInteractionSchema])

export const LearningContentProgressSchema = z.object({
  contentId: z.string().min(1),
  status: LearningContentStatusSchema,
  score: z.number().min(0).max(100).optional(),
  lastAttemptAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  contentVersion: z.string().min(1),
  interactions: z.record(z.string(), LearningInteractionStateSchema).optional(),
})

export const UserRoleSchema = z.enum(['student', 'journalist', 'researcher', 'citizen', 'public_servant'])
export const LearningDepthSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const LearningOnboardingStateSchema = z.object({
  role: UserRoleSchema.nullable(),
  depth: LearningDepthSchema.nullable(),
  completedAt: z.string().datetime().nullable(),
})

const LearningGuestProgressSchema = z.object({
  version: z.literal(LEARNING_PROGRESS_SCHEMA_VERSION),
  onboarding: LearningOnboardingStateSchema,
  content: z.record(z.string(), LearningContentProgressSchema),
  lastUpdated: z.string().datetime(),
})

export function getEmptyLearningGuestProgress(): LearningGuestProgress {
  return {
    version: LEARNING_PROGRESS_SCHEMA_VERSION,
    onboarding: { role: null, depth: null, completedAt: null },
    content: {},
    lastUpdated: new Date().toISOString(),
  }
}

export function parseLearningGuestProgress(raw: unknown): LearningGuestProgress {
  const parsed = LearningGuestProgressSchema.safeParse(normalizeLearningGuestProgress(raw))
  if (parsed.success) return parsed.data
  return getEmptyLearningGuestProgress()
}

function normalizeLearningGuestProgress(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const draft = { ...(raw as Record<string, unknown>) }
  const content = (draft as { content?: Record<string, unknown> }).content

  if (!content || typeof content !== 'object') return draft

  const nextContent: Record<string, unknown> = { ...content }

  for (const [contentId, entry] of Object.entries(nextContent)) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const quizAnswers = record.quizAnswers
    if (!quizAnswers || typeof quizAnswers !== 'object') continue
    if (record.interactions && typeof record.interactions === 'object') continue

    const nextInteractions: Record<string, { readonly kind: 'quiz'; readonly selectedOptionId: string | null }> = {}

    for (const [quizId, selectedOptionId] of Object.entries(quizAnswers as Record<string, unknown>)) {
      if (typeof selectedOptionId === 'string' || selectedOptionId === null) {
        nextInteractions[quizId] = { kind: 'quiz', selectedOptionId: selectedOptionId as string | null }
      }
    }

    if (Object.keys(nextInteractions).length) {
      record.interactions = nextInteractions
      nextContent[contentId] = record
    }
  }

  draft.content = nextContent
  return draft
}

export const LearningCertificateTierSchema = z.enum(['bronze', 'silver', 'gold'])

export const LearningCertificateSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  pathId: z.string().min(1),
  recipientName: z.string().min(1),
  tier: LearningCertificateTierSchema,
  completionPercentage: z.number().min(0).max(100),
  issuedAt: z.string().datetime(),
})

export const LearningCertificatesStateSchema = z.object({
  version: z.literal(LEARNING_CERTIFICATES_SCHEMA_VERSION),
  certificatesById: z.record(z.string(), LearningCertificateSchema),
})

export function getEmptyLearningCertificatesState(): LearningCertificatesState {
  return {
    version: LEARNING_CERTIFICATES_SCHEMA_VERSION,
    certificatesById: {},
  }
}

export function parseLearningCertificatesState(raw: unknown): LearningCertificatesState {
  const parsed = LearningCertificatesStateSchema.safeParse(raw)
  if (parsed.success) return parsed.data
  return getEmptyLearningCertificatesState()
}
