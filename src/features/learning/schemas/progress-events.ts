import { z } from 'zod'
import { LearningContentStatusSchema } from './progress'
import type { LearningProgressEvent } from '../types'

const LearningQuizInteractionSchema = z.object({
  kind: z.literal('quiz'),
  selectedOptionId: z.string().nullable(),
})

const LearningPredictionRevealSchema = z.object({
  guess: z.number().min(0).max(100),
  actualRate: z.number().min(0).max(100),
  revealedAt: z.string().datetime(),
})

const LearningPredictionInteractionSchema = z.object({
  kind: z.literal('prediction'),
  reveals: z.record(z.string(), LearningPredictionRevealSchema),
})

const LearningSalaryCalculatorStepSchema = z.enum(['INPUT', 'GUESS', 'REVEAL'])

const LearningSalaryCalculatorInteractionSchema = z.object({
  kind: z.literal('salary-calculator'),
  gross: z.number().min(0),
  userGuess: z.number().min(0),
  step: LearningSalaryCalculatorStepSchema,
  completedAt: z.string().datetime().optional(),
})

const LearningInteractionStateSchema = z.discriminatedUnion('kind', [
  LearningQuizInteractionSchema,
  LearningPredictionInteractionSchema,
  LearningSalaryCalculatorInteractionSchema,
])

const LearningProgressEventBaseSchema = z.object({
  eventId: z.string().min(1),
  occurredAt: z.string().datetime(),
  clientId: z.string().min(1),
  type: z.enum(['content.progressed', 'onboarding.completed', 'onboarding.reset', 'activePath.set', 'progress.reset']),
})

const ContentProgressPayloadSchema = z.object({
  contentId: z.string().min(1),
  status: LearningContentStatusSchema,
  score: z.number().min(0).max(100).optional(),
  contentVersion: z.string().min(1).optional(),
  interaction: z
    .object({
      interactionId: z.string().min(1),
      state: LearningInteractionStateSchema.nullable(),
    })
    .optional(),
})

const ContentProgressedEventSchema = LearningProgressEventBaseSchema.extend({
  type: z.literal('content.progressed'),
  payload: ContentProgressPayloadSchema,
})

const OnboardingCompletedEventSchema = LearningProgressEventBaseSchema.extend({
  type: z.literal('onboarding.completed'),
  payload: z.object({ pathId: z.string().min(1) }),
})

const OnboardingResetEventSchema = LearningProgressEventBaseSchema.extend({
  type: z.literal('onboarding.reset'),
})

const ActivePathSetEventSchema = LearningProgressEventBaseSchema.extend({
  type: z.literal('activePath.set'),
  payload: z.object({ pathId: z.string().nullable() }),
})

const ProgressResetEventSchema = LearningProgressEventBaseSchema.extend({
  type: z.literal('progress.reset'),
})

const LearningProgressEventSchema = z.discriminatedUnion('type', [
  ContentProgressedEventSchema,
  OnboardingCompletedEventSchema,
  OnboardingResetEventSchema,
  ActivePathSetEventSchema,
  ProgressResetEventSchema,
])

export function parseLearningProgressEvents(raw: unknown): LearningProgressEvent[] {
  if (!Array.isArray(raw)) return []
  const events: LearningProgressEvent[] = []
  for (const entry of raw) {
    const parsed = LearningProgressEventSchema.safeParse(entry)
    if (parsed.success) {
      events.push(parsed.data)
    }
  }
  return events
}
