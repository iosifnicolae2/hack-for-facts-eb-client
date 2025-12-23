/**
 * Lesson Completion Hook
 *
 * Provides state and actions for marking lessons as complete.
 *
 * @example
 * ```tsx
 * function MarkCompleteButton({ contentId }: Props) {
 *   const { isCompleted, markComplete } = useLessonCompletion({ contentId })
 *
 *   if (isCompleted) {
 *     return <span>Completed!</span>
 *   }
 *
 *   return <button onClick={markComplete}>Mark Complete</button>
 * }
 * ```
 */

import { useCallback, useMemo } from 'react'
import { useLearningProgress } from '../use-learning-progress'
import type { LearningContentStatus, LearningGuestProgress } from '../../types'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type LessonCompletionContext = {
  /** Current status of the content */
  readonly status: LearningContentStatus | undefined
  /** Whether the content is completed or passed */
  readonly isCompleted: boolean
  /** Mark the lesson as complete */
  readonly markComplete: () => Promise<void>
}

export type UseLessonCompletionInput = {
  /** The content/lesson ID */
  readonly contentId: string
  /** Content version for tracking changes */
  readonly contentVersion?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// State Resolution
// ═══════════════════════════════════════════════════════════════════════════

function resolveLessonCompletionState(params: {
  readonly progress: LearningGuestProgress
  readonly contentId: string
}): { readonly status: LearningContentStatus | undefined; readonly isCompleted: boolean } {
  const status = params.progress.content[params.contentId]?.status
  const isCompleted = status === 'completed' || status === 'passed'
  return { status, isCompleted }
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

export function useLessonCompletion(params: UseLessonCompletionInput): LessonCompletionContext {
  const { progress, saveContentProgress } = useLearningProgress()

  const { status, isCompleted } = useMemo(
    () => resolveLessonCompletionState({ progress, contentId: params.contentId }),
    [progress, params.contentId]
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
