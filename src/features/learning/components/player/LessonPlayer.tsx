import { useCallback, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { prefetchModuleContent, useModuleContent } from '../../hooks/use-module-content'
import { useLearningProgress } from '../../hooks/use-learning-progress'
import type { LearningLocale } from '../../types'
import { getAdjacentLessons, getLearningPathById, getTranslatedText } from '../../utils/paths'
import { scoreSingleChoice } from '../../utils/scoring'
import { QUIZ_PASS_SCORE } from '../../utils/interactions'
import { Quiz, type QuizOption } from '../assessment/Quiz'
import { MarkComplete } from './MarkComplete'
import { LessonChallengesProvider, useRegisterLessonChallenge } from './lesson-challenges-context'
import { LessonSkeleton } from '../loading/LessonSkeleton'
import { BudgetFootprintRevealer } from '../interactive/BudgetFootprintRevealer'
import { FlashCard, FlashCardDeck } from '../interactive/FlashCardDeck'
import { PromiseTracker } from '../interactive/PromiseTracker'
import { SalaryTaxCalculator } from '../interactive/SalaryTaxCalculator'
import { RevenueDistributionGame } from '../interactive/RevenueDistributionGame'
import { VATCalculator } from '../interactive/VATCalculator'
import { VATReformCard } from '../interactive/VATReformCard'
import { EUComparisonChart } from '../interactive/EUComparisonChart'
import { PlatformMission } from '../interactive/PlatformMission'
import { DeficitVisual } from '../interactive/DeficitVisual'
import { Hidden } from '../interactive/Hidden'
import { Sources } from '../interactive/Sources'

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

type BudgetFootprintRevealerMdxProps = {
  readonly componentId?: string
  readonly budgetExplorerUrl?: string
}

type PromiseTrackerMdxProps = {
  readonly id?: string
}

type SalaryTaxCalculatorMdxProps = {
  readonly id?: string
}

type LessonQuizWrapperProps = QuizMdxProps & {
  readonly lessonId: string
}

type LessonPromiseTrackerWrapperProps = PromiseTrackerMdxProps & {
  readonly lessonId: string
  readonly locale: LearningLocale
}

type LessonSalaryTaxCalculatorWrapperProps = SalaryTaxCalculatorMdxProps & {
  readonly lessonId: string
}

function LessonQuizWrapper({ lessonId, ...props }: LessonQuizWrapperProps) {
  const { progress } = useLearningProgress()
  const interaction = progress.content[lessonId]?.interactions?.[props.id]
  const selectedOptionId = interaction?.kind === 'quiz' ? interaction.selectedOptionId : null
  const score = scoreSingleChoice(props.options, selectedOptionId)
  const isCompleted = score >= QUIZ_PASS_SCORE

  useRegisterLessonChallenge({ id: `quiz:${props.id}`, isCompleted })

  return <Quiz {...props} contentId={lessonId} />
}

function LessonPromiseTrackerWrapper({ lessonId, locale, id }: LessonPromiseTrackerWrapperProps) {
  const { progress } = useLearningProgress()
  const predictionId = id ?? 'promise-tracker'
  const interaction = progress.content[lessonId]?.interactions?.[predictionId]
  const hasReveal = interaction?.kind === 'prediction' && Object.keys(interaction.reveals ?? {}).length > 0

  useRegisterLessonChallenge({ id: `prediction:${predictionId}`, isCompleted: hasReveal })

  return <PromiseTracker locale={locale} contentId={lessonId} predictionId={predictionId} />
}

function LessonSalaryTaxCalculatorWrapper({ lessonId, id }: LessonSalaryTaxCalculatorWrapperProps) {
  const { progress } = useLearningProgress()
  const calculatorId = id ?? 'salary-tax-calculator'
  const interaction = progress.content[lessonId]?.interactions?.[calculatorId]
  const isCompleted = interaction?.kind === 'salary-calculator' && interaction.step === 'REVEAL'

  useRegisterLessonChallenge({ id: `salary:${calculatorId}`, isCompleted })

  return <SalaryTaxCalculator contentId={lessonId} calculatorId={calculatorId} />
}

export function LessonPlayer({ locale, pathId, moduleId, lessonId }: LessonPlayerProps) {
  const path = getLearningPathById(pathId)
  const module = path?.modules.find((m) => m.id === moduleId) ?? null
  const lesson = module?.lessons.find((l) => l.id === lessonId) ?? null

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

  // Memoize MDX component wrappers to prevent re-mounting on every render
  const QuizWrapper = useCallback(
    (props: QuizMdxProps) => <LessonQuizWrapper {...props} lessonId={lessonId} />,
    [lessonId]
  )

  const MarkCompleteWrapper = useCallback(
    (props: MarkCompleteMdxProps) => <MarkComplete {...props} contentId={lessonId} />,
    [lessonId]
  )

  const BudgetFootprintRevealerWrapper = useCallback(
    (props: BudgetFootprintRevealerMdxProps) => (
      <BudgetFootprintRevealer {...props} locale={locale} />
    ),
    [locale]
  )

  const PromiseTrackerWrapper = useCallback(
    (props: PromiseTrackerMdxProps) => (
      <LessonPromiseTrackerWrapper {...props} lessonId={lessonId} locale={locale} />
    ),
    [locale, lessonId]
  )

  const SalaryTaxCalculatorWrapper = useCallback(
    (props: SalaryTaxCalculatorMdxProps) => (
      <LessonSalaryTaxCalculatorWrapper {...props} lessonId={lessonId} />
    ),
    [lessonId]
  )

  const mdxComponents = useMemo(
    () => ({
      Quiz: QuizWrapper,
      MarkComplete: MarkCompleteWrapper,
      BudgetFootprintRevealer: BudgetFootprintRevealerWrapper,
      PromiseTracker: PromiseTrackerWrapper,
      FlashCard,
      FlashCardDeck,
      SalaryTaxCalculator: SalaryTaxCalculatorWrapper,
      RevenueDistributionGame,
      VATCalculator,
      VATReformCard,
      EUComparisonChart,
      PlatformMission,
      DeficitVisual,
      Hidden,
      Sources,
    }),
    [QuizWrapper, MarkCompleteWrapper, BudgetFootprintRevealerWrapper, PromiseTrackerWrapper, SalaryTaxCalculatorWrapper]
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

  return (
    <div className="animate-in fade-in duration-300">
      {/* Lesson content */}
      <div
        className={cn(
          'prose prose-slate dark:prose-invert max-w-none',
          'prose-headings:scroll-mt-20 prose-headings:font-bold',
          'prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none',
          'prose-img:rounded-xl prose-img:shadow-md',
          // Code block styling - max 90vw with horizontal scroll
          '[&_pre]:max-w-[90vw] [&_pre]:mx-auto [&_pre]:my-6',
          '[&_pre]:overflow-x-auto [&_pre]:rounded-xl',
          '[&_pre]:border [&_pre]:border-zinc-200 dark:[&_pre]:border-zinc-700',
          '[&_pre]:bg-zinc-100 dark:[&_pre]:bg-zinc-900',
          '[&_pre]:p-4 [&_pre]:text-sm',
          // CSS scroll shadows for code blocks
          '[&_pre]:bg-[linear-gradient(to_right,var(--color-zinc-100)_30%,transparent),linear-gradient(to_left,var(--color-zinc-100)_30%,transparent),linear-gradient(to_right,var(--color-zinc-300),transparent),linear-gradient(to_left,var(--color-zinc-300),transparent)]',
          'dark:[&_pre]:bg-[linear-gradient(to_right,var(--color-zinc-900)_30%,transparent),linear-gradient(to_left,var(--color-zinc-900)_30%,transparent),linear-gradient(to_right,var(--color-zinc-600),transparent),linear-gradient(to_left,var(--color-zinc-600),transparent)]',
          '[&_pre]:bg-position-[left_center,right_center,left_center,right_center]',
          '[&_pre]:bg-size-[40px_100%,40px_100%,14px_100%,14px_100%]',
          '[&_pre]:bg-no-repeat',
          '[&_pre]:[background-attachment:local,local,scroll,scroll]',
          // Code inside pre - ensure it doesn't wrap
          '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit',
          '[&_pre_code]:whitespace-pre [&_pre_code]:break-normal',
          // Table styling
          '[&_table]:my-8',
          '[&_table]:overflow-x-auto',
          '[&_table]:border [&_table]:border-zinc-200 dark:[&_table]:border-zinc-700',
          '[&_table]:bg-zinc-50 dark:[&_table]:bg-zinc-900/50',
          '[&_table]:text-sm',
          // CSS scroll shadows using background-attachment trick
          '[&_table]:bg-[linear-gradient(to_right,var(--color-zinc-50)_30%,transparent),linear-gradient(to_left,var(--color-zinc-50)_30%,transparent),linear-gradient(to_right,var(--color-zinc-300),transparent),linear-gradient(to_left,var(--color-zinc-300),transparent)]',
          'dark:[&_table]:bg-[linear-gradient(to_right,var(--color-zinc-900)_30%,transparent),linear-gradient(to_left,var(--color-zinc-900)_30%,transparent),linear-gradient(to_right,var(--color-zinc-600),transparent),linear-gradient(to_left,var(--color-zinc-600),transparent)]',
          '[&_table]:bg-position-[left_center,right_center,left_center,right_center]',
          '[&_table]:bg-size-[40px_100%,40px_100%,14px_100%,14px_100%]',
          '[&_table]:bg-no-repeat',
          '[&_table]:[background-attachment:local,local,scroll,scroll]',
          // Header styling
          '[&_thead]:bg-zinc-100/80 dark:[&_thead]:bg-zinc-800/80',
          '[&_thead]:border-b [&_thead]:border-zinc-200 dark:[&_thead]:border-zinc-700',
          '[&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider',
          '[&_th]:text-zinc-700 dark:[&_th]:text-zinc-200',
          // Body styling
          '[&_tbody_tr:nth-child(odd)]:bg-white/80 dark:[&_tbody_tr:nth-child(odd)]:bg-zinc-900/30',
          '[&_tbody_tr:nth-child(even)]:bg-zinc-50/50 dark:[&_tbody_tr:nth-child(even)]:bg-zinc-800/20',
          '[&_tbody_tr]:border-b [&_tbody_tr]:border-zinc-100 dark:[&_tbody_tr]:border-zinc-800/60',
          '[&_tbody_tr:last-child]:border-b-0',
          '[&_tbody_tr]:transition-colors',
          '[&_tbody_tr:hover]:bg-zinc-100/50 dark:[&_tbody_tr:hover]:bg-zinc-800/40',
          // Cell styling
          '[&_td]:px-4 [&_td]:py-3',
          '[&_td]:text-zinc-600 dark:[&_td]:text-zinc-300'
        )}
      >
        {isLoading && <LessonSkeleton />}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
        {Component ? (
          <LessonChallengesProvider>
            <Component components={mdxComponents} />
          </LessonChallengesProvider>
        ) : null}
      </div>

      {/* Navigation footer */}
      <nav className="flex items-center justify-between gap-3 pt-8 mt-8 border-t">
        {prev ? (
          <Link
            to={`/${locale}/learning/${pathId}/${findModuleForLesson(prev.id)}/${prev.id}` as '/'}
            className="group flex items-center gap-3 flex-1 min-w-0 max-w-[48%] p-3 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{t`Previous`}</span>
              <span className="truncate text-sm font-medium text-foreground">{getTranslatedText(prev.title, locale)}</span>
            </div>
          </Link>
        ) : (
          <Link
            to={`/${locale}/learning/${pathId}` as '/'}
            className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{t`Back to path`}</span>
          </Link>
        )}

        {next ? (
          <Link
            to={`/${locale}/learning/${pathId}/${findModuleForLesson(next.id)}/${next.id}` as '/'}
            className="group flex items-center justify-end gap-3 flex-1 min-w-0 max-w-[48%] p-3 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
          >
            <div className="flex flex-col items-end min-w-0 overflow-hidden">
              <span className="text-[10px] font-medium opacity-70 uppercase tracking-wide shrink-0">{t`Next`}</span>
              <span className="truncate text-sm font-medium w-full text-right">{getTranslatedText(next.title, locale)}</span>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/10">
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ) : (
          <Link
            to={`/${locale}/learning/${pathId}` as '/'}
            className="group flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 transition-all"
          >
            <span className="text-sm font-medium">{t`Complete path`}</span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </Link>
        )}
      </nav>
    </div>
  )
}
