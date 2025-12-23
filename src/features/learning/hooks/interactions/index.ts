/**
 * Learning Interactions Module
 *
 * This module provides hooks for managing interactive learning components.
 * Each interaction type (quiz, prediction, etc.) has its own hook that
 * encapsulates state management and actions.
 *
 * See README.md for documentation on adding new interaction types.
 */

// Resolver infrastructure
export {
  registerInteractionResolver,
  resolveInteractionAction,
  hasResolver,
  type SaveContentProgressInput,
  type InteractionResolverContext,
  type InteractionResolver,
} from './interaction-resolver'

// Quiz interaction
export { useQuizInteraction, type QuizInteractionContext, type UseQuizInteractionInput } from './use-quiz-interaction'

// Prediction interaction
export {
  usePredictionInteraction,
  type PredictionInteractionContext,
  type UsePredictionInteractionInput,
} from './use-prediction-interaction'

// Lesson completion
export {
  useLessonCompletion,
  type LessonCompletionContext,
  type UseLessonCompletionInput,
} from './use-lesson-completion'

// Salary calculator interaction
export {
  useSalaryCalculatorInteraction,
  type SalaryCalculatorInteractionContext,
  type UseSalaryCalculatorInteractionInput,
} from './use-salary-calculator-interaction'
