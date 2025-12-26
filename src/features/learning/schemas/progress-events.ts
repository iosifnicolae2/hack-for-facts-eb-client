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

const LearningBudgetAllocatorStepSchema = z.enum(['ALLOCATE', 'COMPARE'])

const LearningBudgetAllocatorInteractionSchema = z.object({
  kind: z.literal('budget-allocator'),
  allocations: z.record(z.string(), z.number()),
  step: LearningBudgetAllocatorStepSchema,
  completedAt: z.string().datetime().optional(),
})

const BudgetPhaseIdSchema = z.enum([
  'planning',
  'drafting',
  'approval',
  'execution',
  'reporting',
  'audit',
])

const LearningBudgetCycleInteractionSchema = z.object({
  kind: z.literal('budget-cycle'),
  exploredPhases: z.array(BudgetPhaseIdSchema),
  lastExploredPhase: BudgetPhaseIdSchema.nullable(),
  completedAt: z.string().datetime().optional(),
})

/**
 * CRITICAL: All interaction types MUST be registered in this discriminated union.
 *
 * When a new interaction type is added (e.g., budget-allocator), it MUST be added here.
 * Otherwise, events will be saved to localStorage but SILENTLY REJECTED on parse,
 * causing state restoration to fail without any error.
 *
 * The parsing in parseLearningProgressEvents() uses safeParse which drops invalid
 * entries without throwing, making this bug hard to detect.
 *
 * Checklist when adding a new interaction:
 * 1. Add TypeScript types to types.ts
 * 2. Create resolver in hooks/interactions/
 * 3. Register resolver import in hooks/interactions/index.ts
 * 4. ADD SCHEMA HERE - Easy to forget!
 * 5. Add schema to progress.ts as well
 */
const LearningInteractionStateSchema = z.discriminatedUnion('kind', [
  LearningQuizInteractionSchema,
  LearningPredictionInteractionSchema,
  LearningSalaryCalculatorInteractionSchema,
  LearningBudgetAllocatorInteractionSchema,
  LearningBudgetCycleInteractionSchema,
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
  payload: z.object({
    pathId: z.string().min(1),
    relatedPaths: z.array(z.string()).default([]),
  }),
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
