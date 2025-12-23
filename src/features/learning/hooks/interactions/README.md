# Learning Interactions Module

This module provides hooks for managing interactive learning components with persistent state that syncs to the API.

## Architecture

```
interactions/
├── README.md                      # This file
├── index.ts                       # Public exports
├── interaction-resolver.ts        # Registry pattern for action resolvers
├── quiz-resolver.ts               # Quiz action handlers
├── prediction-resolver.ts         # Prediction action handlers
├── use-quiz-interaction.ts        # Quiz UI hook
├── use-prediction-interaction.ts  # Prediction UI hook
└── use-lesson-completion.ts       # Lesson completion UI hook
```

## Usage

### Quiz Interaction

```tsx
import { useQuizInteraction } from '@/features/learning/hooks/interactions'

function Quiz({ contentId, quizId, options }: Props) {
  const { selectedOptionId, isAnswered, isCorrect, answer, reset } = useQuizInteraction({
    contentId,
    quizId,
    options,
  })

  return (
    <div>
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => answer(option.id)}
          disabled={isAnswered}
          className={selectedOptionId === option.id ? 'selected' : ''}
        >
          {option.text}
        </button>
      ))}
      {isAnswered && !isCorrect && (
        <button onClick={reset}>Try Again</button>
      )}
    </div>
  )
}
```

### Prediction Interaction

```tsx
import { usePredictionInteraction } from '@/features/learning/hooks/interactions'

function PredictionGame({ contentId, predictionId }: Props) {
  const { reveals, isYearRevealed, reveal, reset } = usePredictionInteraction({
    contentId,
    predictionId,
  })

  const [guess, setGuess] = useState(50)
  const actualRate = 60 // From your data

  if (isYearRevealed('2024')) {
    return (
      <div>
        <p>Your guess: {reveals['2024'].guess}%</p>
        <p>Actual: {reveals['2024'].actualRate}%</p>
        <button onClick={reset}>Reset</button>
      </div>
    )
  }

  return (
    <div>
      <Slider value={guess} onChange={setGuess} />
      <button onClick={() => reveal('2024', guess, actualRate)}>
        Reveal Answer
      </button>
    </div>
  )
}
```

### Lesson Completion

```tsx
import { useLessonCompletion } from '@/features/learning/hooks/interactions'

function MarkComplete({ contentId }: Props) {
  const { isCompleted, markComplete } = useLessonCompletion({ contentId })

  if (isCompleted) {
    return <span>✓ Completed</span>
  }

  return <button onClick={markComplete}>Mark Complete</button>
}
```

## Adding a New Interaction Type

Follow these steps to add a new interaction type (e.g., "flashcard"):

### 1. Define Types (`types.ts`)

Add the interaction state and action types:

```ts
// Interaction state (stored in progress)
export type LearningFlashcardInteractionState = {
  readonly kind: 'flashcard'
  readonly flippedCards: readonly string[]
}

// Update the union
export type LearningInteractionState =
  | LearningQuizInteractionState
  | LearningPredictionInteractionState
  | LearningFlashcardInteractionState

// Action types
export type LearningFlashcardFlipAction = {
  readonly type: 'flashcard.flip'
  readonly contentId: string
  readonly interactionId: string
  readonly cardId: string
  readonly contentVersion?: string
}

export type LearningFlashcardResetAction = {
  readonly type: 'flashcard.reset'
  readonly contentId: string
  readonly interactionId: string
}

// Update the union
export type LearningInteractionAction =
  | LearningQuizAnswerAction
  | LearningQuizResetAction
  | LearningPredictionRevealAction
  | LearningPredictionResetAction
  | LearningFlashcardFlipAction
  | LearningFlashcardResetAction
```

### 2. Add Schema (`schemas/progress-events.ts`)

Add Zod validation for the new state:

```ts
const LearningFlashcardInteractionSchema = z.object({
  kind: z.literal('flashcard'),
  flippedCards: z.array(z.string()),
})

// Update the union
const LearningInteractionStateSchema = z.discriminatedUnion('kind', [
  LearningQuizInteractionSchema,
  LearningPredictionInteractionSchema,
  LearningFlashcardInteractionSchema,
])
```

### 3. Create Resolver (`interactions/flashcard-resolver.ts`)

```ts
import type { LearningFlashcardFlipAction, LearningFlashcardResetAction } from '../../types'
import {
  registerInteractionResolver,
  type InteractionResolverContext,
  type SaveContentProgressInput,
} from './interaction-resolver'

function resolveFlashcardFlip(
  action: LearningFlashcardFlipAction,
  context: InteractionResolverContext
): SaveContentProgressInput {
  const existing = context.progress.content[action.contentId]?.interactions?.[action.interactionId]
  const existingCards = existing?.kind === 'flashcard' ? existing.flippedCards : []

  const newCards = existingCards.includes(action.cardId)
    ? existingCards
    : [...existingCards, action.cardId]

  return {
    contentId: action.contentId,
    status: 'in_progress',
    contentVersion: action.contentVersion,
    interaction: {
      interactionId: action.interactionId,
      state: {
        kind: 'flashcard',
        flippedCards: newCards,
      },
    },
  }
}

function resolveFlashcardReset(
  action: LearningFlashcardResetAction,
  _context: InteractionResolverContext
): SaveContentProgressInput {
  return {
    contentId: action.contentId,
    status: 'in_progress',
    interaction: {
      interactionId: action.interactionId,
      state: null,
    },
  }
}

// Register the resolvers
registerInteractionResolver('flashcard.flip', resolveFlashcardFlip)
registerInteractionResolver('flashcard.reset', resolveFlashcardReset)
```

### 4. Create UI Hook (`interactions/use-flashcard-interaction.ts`)

```ts
import { useCallback, useMemo } from 'react'
import { useLearningProgress } from '../use-learning-progress'
import type { LearningGuestProgress } from '../../types'

// Import resolver to ensure registration
import './flashcard-resolver'

export type FlashcardInteractionContext = {
  readonly flippedCards: readonly string[]
  readonly isFlipped: (cardId: string) => boolean
  readonly flip: (cardId: string) => Promise<void>
  readonly reset: () => Promise<void>
}

export type UseFlashcardInteractionInput = {
  readonly contentId: string
  readonly flashcardId: string
  readonly contentVersion?: string
}

export function useFlashcardInteraction(
  params: UseFlashcardInteractionInput
): FlashcardInteractionContext {
  const { progress, dispatchInteractionAction } = useLearningProgress()

  const flippedCards = useMemo(() => {
    const interaction = progress.content[params.contentId]?.interactions?.[params.flashcardId]
    return interaction?.kind === 'flashcard' ? interaction.flippedCards : []
  }, [progress, params.contentId, params.flashcardId])

  const isFlipped = useCallback(
    (cardId: string) => flippedCards.includes(cardId),
    [flippedCards]
  )

  const flip = useCallback(
    async (cardId: string) => {
      await dispatchInteractionAction({
        type: 'flashcard.flip',
        contentId: params.contentId,
        interactionId: params.flashcardId,
        cardId,
        contentVersion: params.contentVersion,
      })
    },
    [dispatchInteractionAction, params]
  )

  const reset = useCallback(async () => {
    await dispatchInteractionAction({
      type: 'flashcard.reset',
      contentId: params.contentId,
      interactionId: params.flashcardId,
    })
  }, [dispatchInteractionAction, params])

  return { flippedCards, isFlipped, flip, reset }
}
```

### 5. Export from Index (`interactions/index.ts`)

```ts
export {
  useFlashcardInteraction,
  type FlashcardInteractionContext,
  type UseFlashcardInteractionInput,
} from './use-flashcard-interaction'
```

## How It Works

### Event Flow

1. **User action** (e.g., clicks "Reveal") → UI hook calls `dispatchInteractionAction()`
2. **Action resolved** → `resolveInteractionAction()` finds registered resolver
3. **Progress input created** → Resolver returns `SaveContentProgressInput`
4. **Event created** → `saveContentProgress()` creates a `content.progressed` event
5. **Local update** → Event stored in localStorage, snapshot updated
6. **Sync queued** → Background sync sends event to API (if authenticated)

### State Persistence

- **Guests**: `localStorage` key `learning_progress_events`
- **Authenticated**: Synced to API, cached in `learning_progress_events:{userId}`
- **Cross-tab**: `storage` event listener keeps tabs in sync
- **Offline**: Events queued locally, synced when back online

### Resolver Registry

The registry pattern allows interaction types to be added without modifying the core progress hook:

```ts
// Resolvers register themselves at module load time
registerInteractionResolver('quiz.answer', resolveQuizAnswer)
registerInteractionResolver('quiz.reset', resolveQuizReset)

// Core hook calls the registry
const resolved = resolveInteractionAction(action, context)
```

## Best Practices

1. **Keep resolvers pure** - They should only transform action → progress input
2. **Validate in hooks** - UI hooks should validate inputs before dispatching
3. **Import resolvers** - Import the resolver file in your hook to ensure registration
4. **Use readonly types** - All state should be immutable
5. **Handle missing state** - Always provide defaults for undefined state
