export type LearningLocale = 'en' | 'ro'

export type TranslatedString = {
  readonly en: string
  readonly ro: string
}

export type LearningPathDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type LearningModuleCompletionMode = 'quiz' | 'mark_complete'

export type LearningLessonDefinition = {
  readonly id: string
  readonly slug: string
  readonly title: TranslatedString
  readonly durationMinutes: number
  readonly contentDir: string
  readonly completionMode: LearningModuleCompletionMode
  readonly prerequisites: readonly string[]
}

export type LearningModuleDefinition = {
  readonly id: string
  readonly slug: string
  readonly title: TranslatedString
  readonly description: TranslatedString
  readonly lessons: readonly LearningLessonDefinition[]
}

export type LearningPathDefinition = {
  readonly id: string
  readonly slug: string
  readonly difficulty: LearningPathDifficulty
  readonly title: TranslatedString
  readonly description: TranslatedString
  readonly modules: readonly LearningModuleDefinition[]
}

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

export const LEARNING_PROGRESS_SCHEMA_VERSION = 1 as const

export type LearningOnboardingState = {
  readonly pathId: string | null
  readonly completedAt: string | null
}

export type LearningStreakState = {
  readonly currentStreak: number
  readonly longestStreak: number
  readonly lastActivityDate: string | null // ISO date string (YYYY-MM-DD)
}

export type LearningGuestProgress = {
  readonly version: typeof LEARNING_PROGRESS_SCHEMA_VERSION
  readonly onboarding: LearningOnboardingState
  readonly activePathId: string | null
  readonly content: Readonly<Record<string, LearningContentProgress>>
  readonly streak: LearningStreakState
  readonly lastUpdated: string
}

export type LearningCertificateTier = 'bronze' | 'silver' | 'gold'

export type LearningCertificate = {
  readonly id: string
  readonly userId: string
  readonly pathId: string
  readonly recipientName: string
  readonly tier: LearningCertificateTier
  readonly completionPercentage: number
  readonly issuedAt: string
}

export const LEARNING_CERTIFICATES_SCHEMA_VERSION = 1 as const

export type LearningCertificatesState = {
  readonly version: typeof LEARNING_CERTIFICATES_SCHEMA_VERSION
  readonly certificatesById: Readonly<Record<string, LearningCertificate>>
}

export type LearningAuthState = {
  readonly isAuthenticated: boolean
  readonly userId: string | null
}
