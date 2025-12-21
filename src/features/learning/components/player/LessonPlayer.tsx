import { useCallback, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Home,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useLearningProgress } from '../../hooks/use-learning-progress'
import { prefetchModuleContent, useModuleContent } from '../../hooks/use-module-content'
import type { LearningLocale } from '../../types'
import { getAdjacentLessons, getAllLessons, getLearningPathById, getTranslatedText } from '../../utils/paths'
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

function Breadcrumbs({
  locale,
  pathId,
  pathTitle,
  moduleTitle,
  lessonTitle,
}: {
  readonly locale: LearningLocale
  readonly pathId: string
  readonly pathTitle: string
  readonly moduleTitle: string
  readonly lessonTitle: string
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto pb-1">
      <Link
        to={`/${locale}/learning` as '/'}
        className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t`Learning`}</span>
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <Link
        to={`/${locale}/learning/${pathId}` as '/'}
        className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
      >
        {pathTitle}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate max-w-[100px] sm:max-w-none">{moduleTitle}</span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium text-foreground truncate">{lessonTitle}</span>
    </nav>
  )
}

function LessonProgress({
  currentIndex,
  totalLessons,
  completedCount,
}: {
  readonly currentIndex: number
  readonly totalLessons: number
  readonly completedCount: number
}) {
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>
          {t`Lesson`} {currentIndex + 1} {t`of`} {totalLessons}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={progressPercent} className="w-24 h-1.5" />
        <span className="text-xs text-muted-foreground">{progressPercent}%</span>
      </div>
    </div>
  )
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
    const contentProgress = progress.content
    return lesson.prerequisites.filter((prereqId) => {
      const status = contentProgress[prereqId]?.status
      return status !== 'completed' && status !== 'passed'
    })
  }, [lesson, path, progress.content])

  // Calculate progress stats
  const progressStats = useMemo(() => {
    if (!path) return { currentIndex: 0, totalLessons: 0, completedCount: 0 }
    const allLessons = getAllLessons(path)
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
    const contentProgress = progress.content
    const completedCount = allLessons.filter((l) => {
      const status = contentProgress[l.id]?.status
      return status === 'completed' || status === 'passed'
    }).length
    return { currentIndex, totalLessons: allLessons.length, completedCount }
  }, [path, lessonId, progress.content])

  // Memoize MDX component wrappers to prevent re-mounting on every render
  const QuizWrapper = useCallback(
    (props: QuizMdxProps) => <Quiz {...props} contentId={lessonId} />,
    [lessonId]
  )

  const MarkCompleteWrapper = useCallback(
    (props: MarkCompleteMdxProps) => <MarkComplete {...props} contentId={lessonId} />,
    [lessonId]
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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t`Lesson not found`}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {t`The lesson you're looking for doesn't exist or may have been moved.`}
          </p>
          <Button asChild className="mt-4">
            <Link to={`/${locale}/learning` as '/'}>{t`Back to Learning Hub`}</Link>
          </Button>
        </CardContent>
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

  const currentLessonStatus = progress.content[lessonId]?.status
  const isCurrentCompleted = currentLessonStatus === 'completed' || currentLessonStatus === 'passed'

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with breadcrumbs and progress */}
      <div className="space-y-4">
        <Breadcrumbs
          locale={locale}
          pathId={pathId}
          pathTitle={getTranslatedText(path.title, locale)}
          moduleTitle={getTranslatedText(module.title, locale)}
          lessonTitle={getTranslatedText(lesson.title, locale)}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {getTranslatedText(module.title, locale)}
              </Badge>
              {isCurrentCompleted && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t`Completed`}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {getTranslatedText(lesson.title, locale)}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lesson.durationMinutes} {t`minutes`}
              </span>
            </div>
          </div>

          <LessonProgress
            currentIndex={progressStats.currentIndex}
            totalLessons={progressStats.totalLessons}
            completedCount={progressStats.completedCount}
          />
        </div>
      </div>

      {/* Prerequisites warning */}
      {prerequisitesMissing.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-200 dark:bg-amber-900/50">
                <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-amber-900 dark:text-amber-200">
                  {t`Prerequisites not completed`}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {t`You can continue, but we recommend completing:`} {prerequisitesMissing.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson content */}
      <div
        className={cn(
          'prose prose-slate dark:prose-invert max-w-none',
          'prose-headings:scroll-mt-20 prose-headings:font-bold',
          'prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-muted prose-pre:border',
          'prose-img:rounded-xl prose-img:shadow-md'
        )}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">{t`Loading lesson...`}</p>
            </div>
          </div>
        )}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
        {Component ? <Component components={mdxComponents} /> : null}
      </div>

      {/* Navigation footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t">
        {prev ? (
          <Button variant="outline" asChild className="gap-2 justify-start sm:flex-1 sm:max-w-[280px]">
            <Link to={`/${locale}/learning/${pathId}/${findModuleForLesson(prev.id)}/${prev.id}` as '/'}>
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs text-muted-foreground">{t`Previous`}</span>
                <span className="truncate text-sm font-medium">{getTranslatedText(prev.title, locale)}</span>
              </div>
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/${locale}/learning/${pathId}` as '/'}>
              <ArrowLeft className="h-4 w-4" />
              {t`Back to path`}
            </Link>
          </Button>
        )}

        {next ? (
          <Button asChild className="gap-2 justify-end sm:flex-1 sm:max-w-[280px]">
            <Link to={`/${locale}/learning/${pathId}/${findModuleForLesson(next.id)}/${next.id}` as '/'}>
              <div className="flex flex-col items-end min-w-0">
                <span className="text-xs opacity-80">{t`Next`}</span>
                <span className="truncate text-sm font-medium">{getTranslatedText(next.title, locale)}</span>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" className="gap-2">
            <Link to={`/${locale}/learning/${pathId}` as '/'}>
              {t`Complete path`}
              <CheckCircle2 className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
