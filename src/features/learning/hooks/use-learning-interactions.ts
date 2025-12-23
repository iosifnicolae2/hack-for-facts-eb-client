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
  useSalaryCalculatorInteraction,
  type QuizInteractionContext,
  type UseQuizInteractionInput,
  type PredictionInteractionContext,
  type UsePredictionInteractionInput,
  type LessonCompletionContext,
  type UseLessonCompletionInput,
  type SalaryCalculatorInteractionContext,
  type UseSalaryCalculatorInteractionInput,
} from './interactions'
