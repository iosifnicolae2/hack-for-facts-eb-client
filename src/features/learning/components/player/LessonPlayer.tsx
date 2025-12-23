import { useCallback, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { prefetchModuleContent, useModuleContent } from '../../hooks/use-module-content'
import type { LearningLocale } from '../../types'
import { getAdjacentLessons, getLearningPathById, getTranslatedText } from '../../utils/paths'
import { Quiz, type QuizOption } from '../assessment/Quiz'
import { MarkComplete } from './MarkComplete'
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
import { ResponsiveTable } from '../interactive/ResponsiveTable'

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
    (props: QuizMdxProps) => <Quiz {...props} contentId={lessonId} />,
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
      <PromiseTracker
        {...props}
        locale={locale}
        contentId={lessonId}
        predictionId={props.id ?? 'promise-tracker'}
      />
    ),
    [locale, lessonId]
  )

  const SalaryTaxCalculatorWrapper = useCallback(
    (props: SalaryTaxCalculatorMdxProps) => (
      <SalaryTaxCalculator
        contentId={lessonId}
        calculatorId={props.id ?? 'salary-tax-calculator'}
      />
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
      ResponsiveTable,
    }),
    // Ensure all interactive components are included in the dependency array
    [QuizWrapper, MarkCompleteWrapper, BudgetFootprintRevealerWrapper, PromiseTrackerWrapper, SalaryTaxCalculatorWrapper, RevenueDistributionGame, VATCalculator, VATReformCard, EUComparisonChart, PlatformMission, DeficitVisual, Hidden, Sources, ResponsiveTable]
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
