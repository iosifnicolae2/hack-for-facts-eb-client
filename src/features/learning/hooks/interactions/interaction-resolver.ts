/**
 * Interaction Resolver Registry
 *
 * This module provides a registry pattern for resolving interaction actions
 * to content progress updates. Each interaction type (quiz, prediction, etc.)
 * registers its own resolver function.
 *
 * To add a new interaction type:
 * 1. Define the action type in types.ts
 * 2. Create a resolver function that handles the action
 * 3. Register it using registerInteractionResolver()
 */

import type {
  LearningContentStatus,
  LearningGuestProgress,
  LearningInteractionAction,
  LearningInteractionState,
} from '../../types'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type SaveContentProgressInput = {
  readonly contentId: string
  readonly status: LearningContentStatus
  readonly score?: number
  readonly contentVersion?: string
  readonly interaction?: {
    readonly interactionId: string
    readonly state: LearningInteractionState | null
  }
}

export type InteractionResolverContext = {
  readonly progress: LearningGuestProgress
  readonly nowIso: () => string
}

export type InteractionResolver<T extends LearningInteractionAction = LearningInteractionAction> = (
  action: T,
  context: InteractionResolverContext
) => SaveContentProgressInput

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════

const resolverRegistry = new Map<string, InteractionResolver>()

/**
 * Register a resolver for a specific action type.
 * Call this at module load time for each interaction type.
 */
export function registerInteractionResolver<T extends LearningInteractionAction>(
  actionType: T['type'],
  resolver: InteractionResolver<T>
): void {
  resolverRegistry.set(actionType, resolver as InteractionResolver)
}

/**
 * Resolve an interaction action to a content progress update.
 * Throws if no resolver is registered for the action type.
 */
export function resolveInteractionAction(
  action: LearningInteractionAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const resolver = resolverRegistry.get(action.type)

  if (!resolver) {
    throw new Error(`No resolver registered for interaction action type: ${action.type}`)
  }

  return resolver(action, context)
}

/**
 * Check if a resolver is registered for a given action type.
 */
export function hasResolver(actionType: string): boolean {
  return resolverRegistry.has(actionType)
}
