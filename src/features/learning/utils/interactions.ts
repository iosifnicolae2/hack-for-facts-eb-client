import type { LearningContentStatus } from '../types'

export const QUIZ_PASS_SCORE = 70

export function getQuizStatus(score: number): LearningContentStatus {
  return score >= QUIZ_PASS_SCORE ? 'passed' : 'in_progress'
}
