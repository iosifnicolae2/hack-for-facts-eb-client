import { createFileRoute, Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { useMemo } from 'react'
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  getAllLessons,
  getLearningPathById,
  getLearningPaths,
  getTranslatedText,
} from '@/features/learning/utils/paths'
import { useLearningProgress } from '@/features/learning/hooks/use-learning-progress'
import { LearningOnboarding } from '@/features/learning/components/onboarding/LearningOnboarding'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/$lang/learning/')({
  component: LearningHubPage,
})

type ContinueLearningData = {
  readonly pathId: string
  readonly pathTitle: string
  readonly lessonId: string
  readonly lessonTitle: string
  readonly moduleId: string
  readonly completedCount: number
  readonly totalCount: number
  readonly percentage: number
}

function LearningHubPage() {
  const { lang } = Route.useParams()
  const locale = lang as 'ro' | 'en'
  const paths = getLearningPaths()
  const { progress, resetOnboarding } = useLearningProgress()

  // Calculate continue learning data
  const continueData = useMemo<ContinueLearningData | null>(() => {
    for (const path of paths) {
      const contentProgress = progress.content
      const allLessons = getAllLessons(path)
      const completedCount = allLessons.filter((l) => {
        const status = contentProgress[l.id]?.status
        return status === 'completed' || status === 'passed'
      }).length

      if (completedCount > 0 && completedCount < allLessons.length) {
        // Find next incomplete lesson
        const nextLesson = allLessons.find((l) => {
          const status = contentProgress[l.id]?.status
          return status !== 'completed' && status !== 'passed'
        })

        if (nextLesson) {
          const module = path.modules.find((m) => m.lessons.some((l) => l.id === nextLesson.id))
          return {
            pathId: path.id,
            pathTitle: getTranslatedText(path.title, locale),
            lessonId: nextLesson.id,
            lessonTitle: getTranslatedText(nextLesson.title, locale),
            moduleId: module?.id ?? path.modules[0]?.id ?? '',
            completedCount,
            totalCount: allLessons.length,
            percentage: Math.round((completedCount / allLessons.length) * 100),
          }
        }
      }
    }
    return null
  }, [paths, progress.content, locale])

  // Calculate overall stats
  const stats = useMemo(() => {
    let totalLessons = 0
    let completedLessons = 0
    let totalMinutes = 0

    for (const path of paths) {
      const contentProgress = progress.content
      const allLessons = getAllLessons(path)
      totalLessons += allLessons.length
      for (const lesson of allLessons) {
        totalMinutes += lesson.durationMinutes
        const status = contentProgress[lesson.id]?.status
        if (status === 'completed' || status === 'passed') {
          completedLessons++
        }
      }
    }

    return { totalLessons, completedLessons, totalMinutes, pathCount: paths.length }
  }, [paths, progress.content])

  if (!progress.onboarding.completedAt) {
    return <LearningOnboarding />
  }

  const roleLabel =
    progress.onboarding.role === 'citizen'
      ? t`Citizen`
      : progress.onboarding.role === 'journalist'
        ? t`Journalist`
        : progress.onboarding.role === 'researcher'
          ? t`Researcher`
          : progress.onboarding.role === 'student'
            ? t`Student`
            : progress.onboarding.role === 'public_servant'
              ? t`Public Servant`
              : ''

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 lg:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {roleLabel}
              </Badge>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {t`Welcome back!`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t`Continue your journey to understand public budgets.`}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void resetOnboarding()}
            className="self-start lg:self-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t`Reset preferences`}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-background/80 backdrop-blur-sm border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Layers className="h-4 w-4" />
              {t`Paths`}
            </div>
            <div className="text-2xl font-bold mt-1">{stats.pathCount}</div>
          </div>
          <div className="rounded-xl bg-background/80 backdrop-blur-sm border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <BookOpen className="h-4 w-4" />
              {t`Lessons`}
            </div>
            <div className="text-2xl font-bold mt-1">{stats.totalLessons}</div>
          </div>
          <div className="rounded-xl bg-background/80 backdrop-blur-sm border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Trophy className="h-4 w-4" />
              {t`Completed`}
            </div>
            <div className="text-2xl font-bold mt-1">{stats.completedLessons}</div>
          </div>
          <div className="rounded-xl bg-background/80 backdrop-blur-sm border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              {t`Total time`}
            </div>
            <div className="text-2xl font-bold mt-1">{stats.totalMinutes} {t`min`}</div>
          </div>
        </div>
      </div>

      {/* Continue Learning Card */}
      {continueData ? (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Play className="h-6 w-6 text-primary ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">{t`Continue where you left off`}</div>
                <div className="font-semibold text-lg truncate">{continueData.lessonTitle}</div>
                <div className="text-sm text-muted-foreground mt-1">{continueData.pathTitle}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <div className="text-2xl font-bold text-primary">{continueData.percentage}%</div>
                  <div className="text-xs text-muted-foreground">
                    {continueData.completedCount}/{continueData.totalCount}
                  </div>
                </div>
                <Button asChild size="lg" className="gap-2 shadow-md">
                  <Link
                    to={`/${lang}/learning/${continueData.pathId}/${continueData.moduleId}/${continueData.lessonId}` as '/'}
                  >
                    {t`Continue`}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <Progress value={continueData.percentage} className="h-1 rounded-none" />
          </CardContent>
        </Card>
      ) : null}

      {/* Learning Paths */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t`Learning Paths`}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {paths.map((path) => {
            const pathData = getLearningPathById(path.id)
            const allLessons = pathData ? getAllLessons(pathData) : []
            const contentProgress = progress.content
            const completedCount = allLessons.filter((l) => {
              const status = contentProgress[l.id]?.status
              return status === 'completed' || status === 'passed'
            }).length
            const percentage = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0
            const totalMinutes = allLessons.reduce((sum, l) => sum + l.durationMinutes, 0)
            const isComplete = completedCount === allLessons.length && allLessons.length > 0
            const hasStarted = completedCount > 0

            return (
              <Card
                key={path.id}
                className={cn(
                  'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50',
                  isComplete && 'border-green-500/50 bg-green-500/5'
                )}
              >
                {/* Progress ring in corner */}
                {hasStarted && (
                  <div className="absolute top-4 right-4">
                    <div className="relative h-12 w-12">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-muted/30"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={isComplete ? 'text-green-500' : 'text-primary'}
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${percentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <CardHeader className={cn(hasStarted && 'pr-20')}>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200',
                        isComplete ? 'bg-green-500/20 text-green-600' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                      )}
                    >
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{getTranslatedText(path.title, locale)}</CardTitle>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {path.modules.length} {t`modules`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {totalMinutes} {t`min`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3">
                    {getTranslatedText(path.description, locale)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {isComplete ? (
                        <Badge variant="success" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {t`Completed`}
                        </Badge>
                      ) : hasStarted ? (
                        <span>
                          {completedCount}/{allLessons.length} {t`lessons`}
                        </span>
                      ) : (
                        <Badge variant="secondary">{t`Not started`}</Badge>
                      )}
                    </div>
                    <Button asChild variant={hasStarted ? 'default' : 'outline'} className="gap-2">
                      <Link to={`/${lang}/learning/${path.id}` as '/'}>
                        {isComplete ? t`Review` : hasStarted ? t`Continue` : t`Start`}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
