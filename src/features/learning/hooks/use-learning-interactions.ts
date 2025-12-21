import { useCallback, useMemo } from 'react'
import { useLearningProgress } from './use-learning-progress'
import { scoreSingleChoice, type SingleChoiceOption } from '../utils/scoring'
import { QUIZ_PASS_SCORE } from '../utils/interactions'
import type { LearningContentStatus, LearningGuestProgress } from '../types'

type QuizInteractionContext = {
  readonly selectedOptionId: string | null
  readonly isAnswered: boolean
  readonly score: number
  readonly isCorrect: boolean
  readonly answer: (optionId: string) => Promise<void>
  readonly reset: () => Promise<void>
}

type UseQuizInteractionInput = {
  readonly contentId: string
  readonly quizId: string
  readonly options: readonly SingleChoiceOption[]
  readonly passScore?: number
  readonly contentVersion?: string
}

type LessonCompletionContext = {
  readonly status: LearningContentStatus | undefined
  readonly isCompleted: boolean
  readonly markComplete: () => Promise<void>
}

type UseLessonCompletionInput = {
  readonly contentId: string
  readonly contentVersion?: string
}

function resolveQuizInteractionState(params: {
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

  const isValidOption = params.options.some((option) => option.id === selectedOptionId)
  return { selectedOptionId: isValidOption ? selectedOptionId : null }
}

function resolveLessonCompletionState(params: {
  readonly progress: LearningGuestProgress
  readonly contentId: string
}): { readonly status: LearningContentStatus | undefined; readonly isCompleted: boolean } {
  const status = params.progress.content[params.contentId]?.status
  const isCompleted = status === 'completed' || status === 'passed'
  return { status, isCompleted }
}

export function useQuizInteraction(params: UseQuizInteractionInput): QuizInteractionContext {
  const { progress, dispatchInteractionAction } = useLearningProgress()
  const passScore = params.passScore ?? QUIZ_PASS_SCORE

  const { selectedOptionId } = useMemo(
    () =>
      resolveQuizInteractionState({
        progress,
        contentId: params.contentId,
        quizId: params.quizId,
        options: params.options,
      }),
    [progress, params.contentId, params.quizId, params.options],
  )

  const score = useMemo(() => scoreSingleChoice(params.options, selectedOptionId), [params.options, selectedOptionId])
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
    [dispatchInteractionAction, params.contentId, params.contentVersion, params.options, params.quizId],
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

export function useLessonCompletion(params: UseLessonCompletionInput): LessonCompletionContext {
  const { progress, saveContentProgress } = useLearningProgress()

  const { status, isCompleted } = useMemo(
    () => resolveLessonCompletionState({ progress, contentId: params.contentId }),
    [progress, params.contentId],
  )

  const markComplete = useCallback(async () => {
    await saveContentProgress({
      contentId: params.contentId,
      status: 'completed',
      contentVersion: params.contentVersion ?? 'v1',
    })
  }, [params.contentId, params.contentVersion, saveContentProgress])

  return {
    status,
    isCompleted,
    markComplete,
  }
}
