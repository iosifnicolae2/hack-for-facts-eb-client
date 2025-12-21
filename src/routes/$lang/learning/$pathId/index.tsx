import { createFileRoute, Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { useMemo, useState } from 'react'
import { ArrowRight, Award, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLearningProgress } from '@/features/learning/hooks/use-learning-progress'
import { issueLearningCertificate } from '@/features/learning/components/certificates/certificates-storage'
import { getLearningPathById, getLearningPathCompletionStats, getTranslatedText, getAllLessons } from '@/features/learning/utils/paths'

export const Route = createFileRoute('/$lang/learning/$pathId/')({
  component: PathOverviewPage,
})

function PathOverviewPage() {
  const { lang, pathId } = Route.useParams()
  const { auth, progress } = useLearningProgress()

  const path = useMemo(() => getLearningPathById(pathId), [pathId])
  const [recipientName, setRecipientName] = useState('')
  const [issuedId, setIssuedId] = useState<string | null>(null)

  if (!path) {
    return <div className="text-sm text-muted-foreground">{t`Path not found`}</div>
  }

  const stats = getLearningPathCompletionStats({ path, progress })
  const isEligible = stats.completionPercentage >= 60
  const allLessons = getAllLessons(path)
  const progressForPath = progress.paths[path.id]?.modules ?? {}

  // Find the next incomplete lesson
  const nextLesson = allLessons.find((lesson) => {
    const status = progressForPath[lesson.id]?.status
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{getTranslatedText(path.title, lang as 'ro' | 'en')}</h1>
        <p className="text-muted-foreground">{getTranslatedText(path.description, lang as 'ro' | 'en')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>{t`Progress`}</CardTitle>
              <CardDescription>
                {stats.completedCount}/{stats.totalCount} {t`lessons completed`}
              </CardDescription>
            </div>
            <Badge variant={isEligible ? 'success' : 'secondary'}>{stats.completionPercentage}%</Badge>
          </div>
          <Progress value={stats.completionPercentage} className="mt-2" />
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild>
            <Link to={startHref as '/'}>
              {stats.completedCount > 0 ? t`Continue` : t`Start`} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="text-xs text-muted-foreground">
            {auth.isAuthenticated ? t`Authenticated` : t`Guest`} {auth.isSimulated ? t`(simulated)` : ''}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {path.modules.map((module) => {
          const completedLessons = module.lessons.filter((lesson) => {
            const status = progressForPath[lesson.id]?.status
            return status === 'completed' || status === 'passed'
          }).length
          const totalLessons = module.lessons.length
          const moduleProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

          return (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{getTranslatedText(module.title, lang as 'ro' | 'en')}</CardTitle>
                    <CardDescription>{getTranslatedText(module.description, lang as 'ro' | 'en')}</CardDescription>
                  </div>
                  <Badge variant={moduleProgress === 100 ? 'success' : 'secondary'}>
                    {completedLessons}/{totalLessons}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-2">
                  {module.lessons.map((lesson) => {
                    const status = progressForPath[lesson.id]?.status
                    const isCompleted = status === 'completed' || status === 'passed'

                    return (
                      <Link
                        key={lesson.id}
                        to={`/${lang}/learning/${path.id}/${module.id}/${lesson.id}` as '/'}
                        className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <div>
                            <div className="font-medium">{getTranslatedText(lesson.title, lang as 'ro' | 'en')}</div>
                            <div className="text-xs text-muted-foreground">
                              {lesson.durationMinutes} {t`min`}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>{t`Certificate`}</CardTitle>
          </div>
          <CardDescription>
            {t`Complete at least 60% of lessons to earn your certificate.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">{t`Name on certificate`}</div>
              <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder={t`Your name`} />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">{t`Eligibility`}</div>
              <div className="text-sm text-muted-foreground">
                {isEligible ? t`Eligible (>= 60%)` : t`Not eligible yet`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
            >
              {t`Claim certificate`}
            </Button>

            {issuedId ? (
              <Button variant="outline" asChild>
                <Link to={`/${lang}/learning/certificates/${issuedId}` as '/'}>
                  {t`View certificate`}
                </Link>
              </Button>
            ) : null}
          </div>

          {!auth.isAuthenticated ? (
            <p className="text-xs text-muted-foreground">{t`Sign in (or simulate auth in dev) to claim.`}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
