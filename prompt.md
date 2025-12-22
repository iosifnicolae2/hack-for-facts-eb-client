
- Unique IDs: what exactly counts as a “progress item” ID (lesson id, quiz id, interaction id, or a new global id)? Should IDs be globally unique across all
    paths/modules/locales, or just within a path?
  - Yes, it should be globally unique across all paths/modules/locales. The interaction item has a unique id but can have different payloads depending on the interaction type.

export type LearningContentStatus = 'not_started' | 'in_progress' | 'completed' | 'passed'

export type LearningQuizInteractionState = {
  readonly kind: 'quiz'
  readonly selectedOptionId: string | null
}

export type LearningInteractionState = LearningQuizInteractionState

export type LearningQuizAnswerAction = {
  readonly type: 'quiz.answer'
  readonly contentId: string
  readonly interactionId: string
  readonly selectedOptionId: string
  readonly score: number
  readonly contentVersion?: string
}

export type LearningQuizResetAction = {
  readonly type: 'quiz.reset'
  readonly contentId: string
  readonly interactionId: string
}

export type LearningInteractionAction = LearningQuizAnswerAction | LearningQuizResetAction

export type LearningContentProgress = {
  readonly contentId: string
  readonly status: LearningContentStatus
  readonly score?: number
  readonly lastAttemptAt: string
  readonly completedAt?: string
  readonly contentVersion: string
  readonly interactions?: Readonly<Record<string, LearningInteractionState>>
}

- learning:validate: where is this run today, and what should it validate (only uniqueness, or also references to reused items)?
In the ci. Validate uniqueness to avoid conflicts.

- Reused items: when two modules reuse the same item id, is the intended behavior to share completion state across both modules?
- Yes, it should share the completion state across both modules.

- Interaction sync: which interaction data must be synced (quiz selection, score, reset events)? Do we need to support deleting interaction state (e.g.,
    quiz.reset) via API?
- Yes, we need to support deleting interaction state (e.g., quiz.reset) via API. We sync the full interaction state with the content progress.

- Sync granularity: should we send only changed items (delta) or do we need to include related parent/global fields in the same request (onboarding, streak,
    activePath)?
- We need to sync only the delta. We should have a delta for the global fields (onboarding, streak, activePath) and a delta for the content progress. We should use a store with action and every time the user update the state the should be synced, we set the status to pending and when the sync is successful we set the status to synced.

- Server merge: should the server merge per-item updates using the same union rules, or should it fully trust client updates?
- Yes, we should fully trust client updates.

- Page load flow: when fetching full progress, do we merge remote → local and then push local dirty items, or do we wait for user actions?
- We should merge remote → local and then push local dirty items.

- Local cache: do we still keep a full local progress snapshot for UI, or only item-based records plus derived view?
- We should keep a full local progress snapshot for UI.

- Conflict rules: if two devices update the same item, should we use status precedence + lastAttemptAt as today, or something else?
- We should use status precedence + lastAttemptAt as today.

- API preference: do you want REST endpoints for item upserts (e.g. PUT /progress/items) or GraphQL mutations?
- We should use REST endpoints for item upserts (e.g. PUT /progress/items).


It's important to review the answers and make a coheren specification file documenting the decisions and the reasoning behind them.