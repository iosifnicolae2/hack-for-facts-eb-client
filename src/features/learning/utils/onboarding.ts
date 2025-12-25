import { z } from 'zod'
import onboardingTree from '@/content/learning/onboarding-tree.json'

const TranslatedStringSchema = z.object({
  en: z.string().min(1),
  ro: z.string().min(1),
})

const LearningOnboardingOptionSchema = z
  .object({
    id: z.string().min(1),
    label: TranslatedStringSchema,
    description: TranslatedStringSchema.optional(),
    nextNodeId: z.string().min(1).optional(),
    pathId: z.string().min(1).optional(),
    set: z.record(z.string(), z.union([z.string().min(1), z.array(z.string().min(1))])).optional(),
  })
  .superRefine((value, ctx) => {
    const hasNext = Boolean(value.nextNodeId)
    const hasPath = Boolean(value.pathId)
    if (hasNext === hasPath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Option must define exactly one of nextNodeId or pathId.',
      })
    }
  })

const LearningOnboardingChoiceNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal('choice'),
  prompt: TranslatedStringSchema,
  description: TranslatedStringSchema.optional(),
  options: z.array(LearningOnboardingOptionSchema).min(1),
})

const LearningOnboardingResultNodeSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('result'),
    title: TranslatedStringSchema.optional(),
    description: TranslatedStringSchema.optional(),
    ctaLabel: TranslatedStringSchema.optional(),
    pathId: z.string().min(1).optional(),
    pathIdFrom: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    const hasPath = Boolean(value.pathId)
    const hasPathFrom = Boolean(value.pathIdFrom)
    if (hasPath === hasPathFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Result must define exactly one of pathId or pathIdFrom.',
      })
    }
  })

const LearningOnboardingNodeSchema = z.discriminatedUnion('type', [
  LearningOnboardingChoiceNodeSchema,
  LearningOnboardingResultNodeSchema,
])

const LearningOnboardingTreeSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  rootNodeId: z.string().min(1),
  nodes: z.array(LearningOnboardingNodeSchema).min(1),
})

export type LearningOnboardingOption = z.infer<typeof LearningOnboardingOptionSchema>
export type LearningOnboardingChoiceNode = z.infer<typeof LearningOnboardingChoiceNodeSchema>
export type LearningOnboardingResultNode = z.infer<typeof LearningOnboardingResultNodeSchema>
export type LearningOnboardingNode = z.infer<typeof LearningOnboardingNodeSchema>
export type LearningOnboardingTree = z.infer<typeof LearningOnboardingTreeSchema>

export function getLearningOnboardingTree(): LearningOnboardingTree {
  return LearningOnboardingTreeSchema.parse(onboardingTree)
}

export function getOnboardingNodeById(
  tree: LearningOnboardingTree,
  nodeId: string,
): LearningOnboardingNode | undefined {
  return tree.nodes.find((node) => node.id === nodeId)
}
