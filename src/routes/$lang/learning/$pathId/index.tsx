import { createFileRoute, Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Lock,
  Play,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLearningProgress } from '@/features/learning/hooks/use-learning-progress'
import { issueLearningCertificate } from '@/features/learning/components/certificates/certificates-storage'
import {
  getAllLessons,
  getLearningPathById,
  getLearningPathCompletionStats,
  getTranslatedText,
} from '@/features/learning/utils/paths'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/$lang/learning/$pathId/')({
  component: PathOverviewPage,
})

function CircularProgress({
  value,
  size = 64,
  strokeWidth = 5,
}: {
  readonly value: number
  readonly size?: number
  readonly strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          className="text-muted/30"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={cn('transition-all duration-700', value === 100 ? 'text-green-500' : 'text-primary')}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold">{value}%</span>
      </div>
    </div>
  )
}

function PathOverviewPage() {
  const { lang, pathId } = Route.useParams()
  const locale = lang as 'ro' | 'en'
  const { auth, progress } = useLearningProgress()

  const path = useMemo(() => getLearningPathById(pathId), [pathId])
  const [recipientName, setRecipientName] = useState('')
  const [issuedId, setIssuedId] = useState<string | null>(null)

  if (!path) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">{t`Path not found`}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t`The learning path you're looking for doesn't exist.`}</p>
        <Button asChild className="mt-4">
          <Link to={`/${lang}/learning` as '/'}>{t`Back to Learning Hub`}</Link>
        </Button>
      </div>
    )
  }

  const stats = getLearningPathCompletionStats({ path, progress })
  const isEligible = stats.completionPercentage >= 60
  const isComplete = stats.completionPercentage === 100
  const allLessons = getAllLessons(path)
  const contentProgress = progress.content

  // Find the next incomplete lesson
  const nextLesson = allLessons.find((lesson) => {
    const status = contentProgress[lesson.id]?.status
    return status !== 'completed' && status !== 'passed'
  })

  // Find module for lesson
  const findModuleForLesson = (lessonId: string) => {
    for (const m of path.modules) {
      if (m.lessons.some((l) => l.id === lessonId)) {
        return m.id
      }
    }
    return path.modules[0]?.id
  }

  const startHref = nextLesson
    ? `/${lang}/learning/${path.id}/${findModuleForLesson(nextLesson.id)}/${nextLesson.id}`
    : `/${lang}/learning/${path.id}/${path.modules[0]?.id}/${path.modules[0]?.lessons[0]?.id}`

  const totalMinutes = allLessons.reduce((sum, l) => sum + l.durationMinutes, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 lg:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <CircularProgress value={stats.completionPercentage} size={80} strokeWidth={6} />

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3 w-3" />
                {path.modules.length} {t`modules`}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {allLessons.length} {t`lessons`}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {totalMinutes} {t`min`}
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {getTranslatedText(path.title, locale)}
            </h1>
            <p className="text-muted-foreground">{getTranslatedText(path.description, locale)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {stats.completedCount}/{stats.totalCount} {t`lessons completed`}
            </span>
            {isComplete ? (
              <Badge variant="success" className="gap-1">
                <Trophy className="h-3 w-3" />
                {t`Completed!`}
              </Badge>
            ) : (
              <span className="text-muted-foreground">{stats.completionPercentage}%</span>
            )}
          </div>
          <Progress value={stats.completionPercentage} className="h-2" />
        </div>

        {/* Action Button */}
        <div className="relative mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="gap-2 shadow-lg">
            <Link to={startHref as '/'}>
              {isComplete ? (
                <>
                  <BookOpen className="h-4 w-4" />
                  {t`Review Path`}
                </>
              ) : stats.completedCount > 0 ? (
                <>
                  <Play className="h-4 w-4" />
                  {t`Continue Learning`}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t`Start Learning`}
                </>
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {auth.isAuthenticated && (
            <Badge variant="outline" className="gap-1">
              <User className="h-3 w-3" />
              {t`Authenticated`}
            </Badge>
          )}
        </div>
      </div>

      {/* Modules Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t`Course Modules`}</h2>
        </div>

        <div className="space-y-4">
          {path.modules.map((module, moduleIndex) => {
            const completedLessons = module.lessons.filter((lesson) => {
              const status = contentProgress[lesson.id]?.status
              return status === 'completed' || status === 'passed'
            }).length
            const totalLessons = module.lessons.length
            const moduleProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
            const isModuleComplete = completedLessons === totalLessons

            // Check if previous module is complete (for unlock logic)
            const isPreviousModuleComplete =
              moduleIndex === 0 ||
              (() => {
                const prevModule = path.modules[moduleIndex - 1]
                const prevCompleted = prevModule?.lessons.filter((l) => {
                  const s = contentProgress[l.id]?.status
                  return s === 'completed' || s === 'passed'
                }).length
                return prevCompleted === prevModule?.lessons.length
              })()

            const isLocked = !isPreviousModuleComplete && completedLessons === 0

            return (
              <Card
                key={module.id}
                className={cn(
                  'relative overflow-hidden transition-all duration-300',
                  isModuleComplete && 'border-green-500/30 bg-green-500/5',
                  isLocked && 'opacity-75'
                )}
              >
                {/* Timeline connector */}
                {moduleIndex < path.modules.length - 1 && (
                  <div className="absolute left-[29px] top-full w-0.5 h-4 bg-gradient-to-b from-muted to-transparent z-10" />
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    {/* Module number/status indicator */}
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold transition-colors',
                        isModuleComplete
                          ? 'bg-green-500 text-white'
                          : isLocked
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary/10 text-primary'
                      )}
                    >
                      {isModuleComplete ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg">{getTranslatedText(module.title, locale)}</CardTitle>
                        <Badge variant={isModuleComplete ? 'success' : 'secondary'} className="shrink-0">
                          {completedLessons}/{totalLessons}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {getTranslatedText(module.description, locale)}
                      </CardDescription>

                      {/* Module progress */}
                      {completedLessons > 0 && !isModuleComplete && (
                        <Progress value={moduleProgress} className="h-1.5 mt-3" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid gap-2 ml-16">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const status = contentProgress[lesson.id]?.status
                      const isCompleted = status === 'completed' || status === 'passed'
                      const isNextUp =
                        !isCompleted &&
                        lessonIndex ===
                          module.lessons.findIndex((l) => {
                            const s = contentProgress[l.id]?.status
                            return s !== 'completed' && s !== 'passed'
                          })

                      return (
                        <Link
                          key={lesson.id}
                          to={`/${lang}/learning/${path.id}/${module.id}/${lesson.id}` as '/'}
                          className={cn(
                            'group flex items-center justify-between gap-3 rounded-xl border p-3 transition-all duration-200',
                            isCompleted
                              ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                              : isNextUp
                                ? 'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50'
                                : 'hover:bg-muted hover:border-muted-foreground/20'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isNextUp
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : isNextUp ? (
                                <Play className="h-4 w-4" />
                              ) : (
                                <span className="text-xs font-medium">{lessonIndex + 1}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {getTranslatedText(lesson.title, locale)}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.durationMinutes} {t`min`}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Certificate Section */}
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-amber-600/5">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {t`Earn Your Certificate`}
                {isEligible && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t`Eligible`}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isEligible
                  ? t`Congratulations! You've completed enough to claim your certificate.`
                  : t`Complete at least 60% of lessons to earn your certificate.`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress towards certificate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t`Progress to eligibility`}</span>
              <span className={isEligible ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                {stats.completionPercentage}% / 60%
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isEligible ? 'bg-green-500' : 'bg-amber-500'
                )}
                style={{ width: `${Math.min(stats.completionPercentage, 100)}%` }}
              />
              {/* 60% marker */}
              <div className="absolute top-0 h-full w-0.5 bg-muted-foreground/50" style={{ left: '60%' }} />
            </div>
          </div>

          {/* Certificate form */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium">{t`Name on certificate`}</label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={t`Enter your name`}
                disabled={!isEligible}
                className="bg-background/80"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  if (!auth.userId) return
                  const trimmedName = recipientName.trim()
                  if (!trimmedName) return

                  const certificate = issueLearningCertificate({
                    userId: auth.userId,
                    recipientName: trimmedName,
                    path,
                    progress,
                  })
                  setIssuedId(certificate.id)
                }}
                disabled={!auth.isAuthenticated || !auth.userId || !isEligible || !recipientName.trim()}
                className="gap-2"
              >
                <Award className="h-4 w-4" />
                {t`Claim Certificate`}
              </Button>

              {issuedId && (
                <Button variant="outline" asChild>
                  <Link to={`/${lang}/learning/certificates/${issuedId}` as '/'}>
                    {t`View`}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Auth hint */}
          {!auth.isAuthenticated && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              {t`Sign in to claim your certificate.`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
