import { useCallback, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLearningProgress } from '../../hooks/use-learning-progress'
import { prefetchModuleContent, useModuleContent } from '../../hooks/use-module-content'
import type { LearningLocale } from '../../types'
import { getAdjacentLessons, getLearningPathById, getTranslatedText } from '../../utils/paths'
import { Quiz, type QuizOption } from '../assessment/Quiz'
import { MarkComplete } from './MarkComplete'

type LessonPlayerProps = {
  readonly locale: LearningLocale
  readonly pathId: string
  readonly moduleId: string
  readonly lessonId: string
}

type QuizMdxProps = {
  readonly id: string
  readonly question: string
  readonly options: readonly QuizOption[]
  readonly explanation: string
}

type MarkCompleteMdxProps = {
  readonly label?: string
}

export function LessonPlayer({ locale, pathId, moduleId, lessonId }: LessonPlayerProps) {
  const path = getLearningPathById(pathId)
  const module = path?.modules.find((m) => m.id === moduleId) ?? null
  const lesson = module?.lessons.find((l) => l.id === lessonId) ?? null

  const { progress } = useLearningProgress()

  const { Component, isLoading, error } = useModuleContent({
    contentDir: lesson?.contentDir ?? 'missing',
    locale,
  })

  const { prev, next } = useMemo(
    () => (path ? getAdjacentLessons({ path, lessonId }) : { prev: null, next: null }),
    [lessonId, path]
  )

  const prevContentDir = prev?.contentDir ?? ''
  const nextContentDir = next?.contentDir ?? ''

  useEffect(() => {
    // Prefetch adjacent lessons so navigation feels instant.
    if (prevContentDir) {
      void prefetchModuleContent({ contentDir: prevContentDir, locale })
    }
    if (nextContentDir) {
      void prefetchModuleContent({ contentDir: nextContentDir, locale })
    }
  }, [locale, nextContentDir, prevContentDir])

  const prerequisitesMissing = useMemo(() => {
    if (!path || !lesson) return []
    const p = progress.paths[path.id]?.modules ?? {}
    return lesson.prerequisites.filter((prereqId) => {
      const status = p[prereqId]?.status
      return status !== 'completed' && status !== 'passed'
    })
  }, [lesson, path, progress.paths])

  // Memoize MDX component wrappers to prevent re-mounting on every render
  const QuizWrapper = useCallback(
    (props: QuizMdxProps) => <Quiz {...props} pathId={pathId} moduleId={lessonId} />,
    [pathId, lessonId]
  )

  const MarkCompleteWrapper = useCallback(
    (props: MarkCompleteMdxProps) => <MarkComplete {...props} pathId={pathId} moduleId={lessonId} />,
    [pathId, lessonId]
  )

  const mdxComponents = useMemo(
    () => ({
      Quiz: QuizWrapper,
      MarkComplete: MarkCompleteWrapper,
    }),
    [QuizWrapper, MarkCompleteWrapper]
  )

  if (!path || !module || !lesson) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">{t`Lesson not found`}</CardContent>
      </Card>
    )
  }

  // Find the module for adjacent lessons to build correct URLs
  const findModuleForLesson = (lid: string) => {
    for (const m of path.modules) {
      if (m.lessons.some((l) => l.id === lid)) {
        return m.id
      }
    }
    return moduleId
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2 border-b pb-6">
        <div className="text-sm text-muted-foreground mb-1">
          {getTranslatedText(module.title, locale)}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{getTranslatedText(lesson.title, locale)}</h1>
        <p className="text-sm text-muted-foreground">
          {t`Estimated duration:`} {lesson.durationMinutes} {t`minutes`}
        </p>

        {prerequisitesMissing.length ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">{t`Prerequisites not completed`}</p>
                <p className="text-sm">
                  {t`You can continue, but we recommend completing:`} {prerequisitesMissing.join(', ')}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={cn('prose prose-slate dark:prose-invert max-w-none', 'prose-headings:scroll-mt-20')}>
        {isLoading ? <p className="text-sm text-muted-foreground">{t`Loading lesson...`}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {Component ? <Component components={mdxComponents} /> : null}
      </div>

      <div className="flex justify-between pt-8 border-t">
        {prev ? (
          <Button variant="outline" asChild>
            <Link to={`/${locale}/learning/${pathId}/${findModuleForLesson(prev.id)}/${prev.id}` as '/'}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t`Previous`}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link to={`/${locale}/learning/${pathId}` as '/'}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t`Back to path`}
            </Link>
          </Button>
        )}

        {next ? (
          <Button asChild>
            <Link to={`/${locale}/learning/${pathId}/${findModuleForLesson(next.id)}/${next.id}` as '/'}>
              {t`Next`} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link to={`/${locale}/learning/${pathId}` as '/'}>
              {t`Finish`} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
