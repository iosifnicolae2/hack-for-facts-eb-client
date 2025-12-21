import { z } from 'zod'
import {
  LEARNING_PROGRESS_SCHEMA_VERSION,
  LEARNING_CERTIFICATES_SCHEMA_VERSION,
  type LearningCertificatesState,
  type LearningGuestProgress,
} from '../types'

export const LearningModuleStatusSchema = z.enum(['not_started', 'in_progress', 'completed', 'passed'])

export const LearningModuleProgressSchema = z.object({
  moduleId: z.string().min(1),
  status: LearningModuleStatusSchema,
  score: z.number().min(0).max(100).optional(),
  lastAttemptAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  contentVersion: z.string().min(1),
})

export const UserRoleSchema = z.enum(['student', 'journalist', 'researcher', 'citizen', 'public_servant'])
export const LearningDepthSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const LearningOnboardingStateSchema = z.object({
  role: UserRoleSchema.nullable(),
  depth: LearningDepthSchema.nullable(),
  completedAt: z.string().datetime().nullable(),
})

export const LearningGuestProgressSchema = z.object({
  version: z.literal(LEARNING_PROGRESS_SCHEMA_VERSION),
  onboarding: LearningOnboardingStateSchema,
  paths: z.record(
    z.string(),
    z.object({
      modules: z.record(z.string(), LearningModuleProgressSchema),
    }),
  ),
  lastUpdated: z.string().datetime(),
})

export function getEmptyLearningGuestProgress(): LearningGuestProgress {
  return {
    version: LEARNING_PROGRESS_SCHEMA_VERSION,
    onboarding: { role: null, depth: null, completedAt: null },
    paths: {},
    lastUpdated: new Date().toISOString(),
  }
}

export function parseLearningGuestProgress(raw: unknown): LearningGuestProgress {
  const parsed = LearningGuestProgressSchema.safeParse(raw)
  if (parsed.success) return parsed.data
  return getEmptyLearningGuestProgress()
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
