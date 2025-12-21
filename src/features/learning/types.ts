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

export type LearningModuleStatus = 'not_started' | 'in_progress' | 'completed' | 'passed'

export type LearningModuleProgress = {
  readonly moduleId: string
  readonly status: LearningModuleStatus
  readonly score?: number
  readonly lastAttemptAt: string
  readonly completedAt?: string
  readonly contentVersion: string
}

export const LEARNING_PROGRESS_SCHEMA_VERSION = 1 as const

export type UserRole = 'student' | 'journalist' | 'researcher' | 'citizen' | 'public_servant'
export type LearningDepth = 'beginner' | 'intermediate' | 'advanced'

export type LearningOnboardingState = {
  readonly role: UserRole | null
  readonly depth: LearningDepth | null
  readonly completedAt: string | null
}

export type LearningGuestProgress = {
  readonly version: typeof LEARNING_PROGRESS_SCHEMA_VERSION
  readonly onboarding: LearningOnboardingState
  readonly paths: Readonly<
    Record<
      string,
      {
        readonly modules: Readonly<Record<string, LearningModuleProgress>>
      }
    >
  >
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
  readonly isSimulated: boolean
}
