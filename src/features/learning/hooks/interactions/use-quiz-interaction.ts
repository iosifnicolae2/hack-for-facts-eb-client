/**
 * Quiz Interaction Hook
 *
 * Provides state and actions for quiz components.
 *
 * @example
 * ```tsx
 * function MyQuiz({ contentId, quizId, options }: QuizProps) {
 *   const { selectedOptionId, isAnswered, isCorrect, answer, reset } = useQuizInteraction({
 *     contentId,
 *     quizId,
 *     options,
 *   })
 *
 *   return (
 *     <div>
 *       {options.map(option => (
 *         <button
 *           key={option.id}
 *           onClick={() => answer(option.id)}
 *           disabled={isAnswered}
 *         >
 *           {option.text}
 *         </button>
 *       ))}
 *       {isAnswered && !isCorrect && <button onClick={reset}>Try Again</button>}
 *     </div>
 *   )
 * }
 * ```
 */

import { useCallback, useMemo } from 'react'
import { useLearningProgress } from '../use-learning-progress'
import { scoreSingleChoice, type SingleChoiceOption } from '../../utils/scoring'
import { QUIZ_PASS_SCORE } from '../../utils/interactions'
import type { LearningGuestProgress } from '../../types'

// Import resolver to ensure registration
import './quiz-resolver'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type QuizInteractionContext = {
  /** The currently selected option ID, or null if not answered */
  readonly selectedOptionId: string | null
  /** Whether the quiz has been answered */
  readonly isAnswered: boolean
  /** The score achieved (0-100) */
  readonly score: number
  /** Whether the answer is correct (score >= pass threshold) */
  readonly isCorrect: boolean
  /** Submit an answer */
  readonly answer: (optionId: string) => Promise<void>
  /** Reset the quiz to try again */
  readonly reset: () => Promise<void>
}

export type UseQuizInteractionInput = {
  /** The content/lesson ID this quiz belongs to */
  readonly contentId: string
  /** Unique identifier for this quiz within the content */
  readonly quizId: string
  /** Available options for the quiz */
  readonly options: readonly SingleChoiceOption[]
  /** Score required to pass (default: 70) */
  readonly passScore?: number
  /** Content version for tracking changes */
  readonly contentVersion?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// State Resolution
// ═══════════════════════════════════════════════════════════════════════════

function resolveQuizState(params: {
  readonly progress: LearningGuestProgress
  readonly contentId: string
  readonly quizId: string
  readonly options: readonly SingleChoiceOption[]
}): { readonly selectedOptionId: string | null } {
  const interaction = params.progress.content[params.contentId]?.interactions?.[params.quizId]
  const selectedOptionId = interaction?.kind === 'quiz' ? interaction.selectedOptionId : null

  if (!selectedOptionId) {
    return { selectedOptionId: null }
  }

  // Validate the option still exists
  const isValidOption = params.options.some((option) => option.id === selectedOptionId)
  return { selectedOptionId: isValidOption ? selectedOptionId : null }
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

export function useQuizInteraction(params: UseQuizInteractionInput): QuizInteractionContext {
  const { progress, dispatchInteractionAction } = useLearningProgress()
  const passScore = params.passScore ?? QUIZ_PASS_SCORE

  const { selectedOptionId } = useMemo(
    () =>
      resolveQuizState({
        progress,
        contentId: params.contentId,
        quizId: params.quizId,
        options: params.options,
      }),
    [progress, params.contentId, params.quizId, params.options]
  )

  const score = useMemo(
    () => scoreSingleChoice(params.options, selectedOptionId),
    [params.options, selectedOptionId]
  )

  const isCorrect = score >= passScore
  const isAnswered = selectedOptionId !== null

  const answer = useCallback(
    async (optionId: string) => {
      const isValidOption = params.options.some((option) => option.id === optionId)
      if (!isValidOption) return

      const nextScore = scoreSingleChoice(params.options, optionId)
      await dispatchInteractionAction({
        type: 'quiz.answer',
        contentId: params.contentId,
        interactionId: params.quizId,
        selectedOptionId: optionId,
        score: nextScore,
        contentVersion: params.contentVersion,
      })
    },
    [dispatchInteractionAction, params.contentId, params.contentVersion, params.options, params.quizId]
  )

  const reset = useCallback(async () => {
    await dispatchInteractionAction({
      type: 'quiz.reset',
      contentId: params.contentId,
      interactionId: params.quizId,
    })
  }, [dispatchInteractionAction, params.contentId, params.quizId])

  return {
    selectedOptionId,
    isAnswered,
    score,
    isCorrect,
    answer,
    reset,
  }
}
