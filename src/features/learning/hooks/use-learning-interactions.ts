/**
 * Learning Interactions - Re-export for backward compatibility
 *
 * This file re-exports hooks from the interactions module.
 * New code should import directly from './interactions'.
 *
 * @deprecated Import from './interactions' instead
 */

export {
  useQuizInteraction,
  usePredictionInteraction,
  useLessonCompletion,
  type QuizInteractionContext,
  type UseQuizInteractionInput,
  type PredictionInteractionContext,
  type UsePredictionInteractionInput,
  type LessonCompletionContext,
  type UseLessonCompletionInput,
} from './interactions'
