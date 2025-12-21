import { z } from 'zod'
import type {
  LearningGuestProgress,
  LearningLocale,
  LearningModuleCompletionMode,
  LearningLessonDefinition,
  LearningPathDefinition,
  LearningPathDifficulty,
  TranslatedString,
} from '../types'

const TranslatedStringSchema = z.object({
  en: z.string().min(1),
  ro: z.string().min(1),
})

const LearningPathDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])

const LearningModuleCompletionModeSchema = z.enum(['quiz', 'mark_complete'])

const LearningLessonDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: TranslatedStringSchema,
  durationMinutes: z.number().int().positive(),
  contentDir: z.string().min(1),
  completionMode: LearningModuleCompletionModeSchema,
  prerequisites: z.array(z.string()).default([]),
})

const LearningModuleDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: TranslatedStringSchema,
  description: TranslatedStringSchema,
  lessons: z.array(LearningLessonDefinitionSchema),
})

const LearningPathDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  difficulty: LearningPathDifficultySchema,
  title: TranslatedStringSchema,
  description: TranslatedStringSchema,
  modules: z.array(LearningModuleDefinitionSchema),
})

type RawPathModule = { readonly default: unknown }

const pathModules = import.meta.glob('/src/content/learning/paths/*.json', { eager: true }) as Record<string, RawPathModule>

export function getLearningPaths(): readonly LearningPathDefinition[] {
  return Object.values(pathModules)
    .map((m) => LearningPathDefinitionSchema.parse(m.default))
    .sort((a, b) => a.id.localeCompare(b.id))
}

export function getLearningPathById(pathId: string): LearningPathDefinition | null {
  const all = getLearningPaths()
  return all.find((p) => p.id === pathId) ?? null
}

export function getTranslatedText(value: TranslatedString, locale: LearningLocale): string {
  return locale === 'ro' ? value.ro : value.en
}

export function isCompletionMode(value: unknown): value is LearningModuleCompletionMode {
  return value === 'quiz' || value === 'mark_complete'
}

export function isDifficulty(value: unknown): value is LearningPathDifficulty {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced'
}

export function getLearningPathLocaleFromPathname(pathname: string): LearningLocale {
  return pathname.startsWith('/ro') ? 'ro' : 'en'
}

export function getAllLessons(path: LearningPathDefinition): readonly LearningLessonDefinition[] {
  return path.modules.flatMap((m) => m.lessons)
}

export function getLearningPathCompletionStats(params: {
  readonly path: LearningPathDefinition
  readonly progress: LearningGuestProgress
}): { readonly completedCount: number; readonly totalCount: number; readonly completionPercentage: number } {
  const progressForPath = params.progress.paths[params.path.id]?.modules ?? {}
  const allLessons = getAllLessons(params.path)
  const totalCount = allLessons.length
  
  const completedCount = allLessons.filter((lesson) => {
    const status = progressForPath[lesson.id]?.status
    return status === 'completed' || status === 'passed'
  }).length

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  return { completedCount, totalCount, completionPercentage }
}

export function getAdjacentLessons(params: {
  readonly path: LearningPathDefinition
  readonly lessonId: string
}): { readonly prev: LearningLessonDefinition | null; readonly next: LearningLessonDefinition | null } {
  const allLessons = getAllLessons(params.path)
  const idx = allLessons.findIndex((m) => m.id === params.lessonId)
  return {
    prev: idx > 0 ? allLessons[idx - 1] : null,
    next: idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
  }
}
