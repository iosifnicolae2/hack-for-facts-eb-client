import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Clock,
  MoreVertical,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getAllLessons,
  getLearningPaths,
  getTranslatedText,
} from '@/features/learning/utils/paths'
import { getDisplayStreak, formatStreak } from '@/features/learning/utils/streak'
import { useLearningProgress } from '@/features/learning/hooks/use-learning-progress'
import { LearningHubLoading } from '@/features/learning/components/loading/LearningHubLoading'

export const Route = createFileRoute('/$lang/learning/')({
  component: LearningHubPage,
})

function formatRemainingTime(minutes: number): string {
  if (minutes <= 0) return t`Done`
  if (minutes < 60) return t`${minutes}m remaining`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return t`${hours}h remaining`
  return t`${hours}h ${mins}m remaining`
}

function LearningHubPage() {
  const { lang } = Route.useParams()
  const locale = lang as 'ro' | 'en'
  const paths = getLearningPaths()
  const { isReady, progress, resetOnboarding, clearProgress } = useLearningProgress()
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false)
  const [isWipeDialogOpen, setIsWipeDialogOpen] = useState(false)

  const activePath = useMemo(() => {
    return paths.find((p) => p.id === progress.activePathId) ?? paths[0]
  }, [paths, progress.activePathId])

  const stats = useMemo(() => {
    if (!activePath) return null
    const allLessons = getAllLessons(activePath)
    const completedCount = allLessons.filter((l) => {
      const status = progress.content[l.id]?.status
      return status === 'completed' || status === 'passed'
    }).length
    const percentage = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0

    // Calculate remaining time from incomplete lessons
    const remainingMinutes = allLessons
      .filter((l) => {
        const status = progress.content[l.id]?.status
        return status !== 'completed' && status !== 'passed'
      })
      .reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0)

    // Find next lesson
    const nextLesson = allLessons.find((l) => {
      const status = progress.content[l.id]?.status
      return status !== 'completed' && status !== 'passed'
    })

    const module = nextLesson ? activePath.modules.find((m) => m.lessons.some((l) => l.id === nextLesson.id)) : null

    return {
      completedCount,
      totalCount: allLessons.length,
      percentage,
      remainingMinutes,
      nextLesson,
      moduleId: module?.id,
    }
  }, [activePath, progress.content])

  // Show loading while auth/progress is loading
  if (!isReady) {
    return <LearningHubLoading />
  }

  // Redirect to onboarding if not completed
  if (!progress.onboarding.completedAt) {
    return <Navigate to={`/${lang}/learning/onboarding` as '/'} replace />
  }

  return (
    <div className=" max-w-4xl mx-auto space-y-10 animate-in fade-in duration-1000 py-6 px-4">
      {/* Header Row: Title + Menu */}
      <div className="flex items-start justify-between pl-9">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tight text-foreground leading-tight">
            {(stats?.completedCount ?? 0) > 0 ? t`Welcome back.` : t`Ready to learn?`}
          </h1>
          <p className="text-muted-foreground font-medium text-lg opacity-60">
            {(stats?.completedCount ?? 0) > 0
              ? t`You're doing great. Keep up the momentum.`
              : t`Start your first lesson and track your progress.`}
          </p>
        </div>
        {/* Settings Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem
              onClick={() => setIsRestartDialogOpen(true)}
              className="flex items-center gap-2.5 py-2.5 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{t`Restart Onboarding`}</span>
            </DropdownMenuItem>
            {import.meta.env.DEV && (
              <DropdownMenuItem
                onClick={() => setIsWipeDialogOpen(true)}
                className="flex items-center gap-2.5 py-2.5 text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">{t`Wipe All Data`}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Active Path Card */}
      <div className="space-y-6">
        {activePath && (stats?.percentage ?? 0) < 100 ? (
          <Card className="relative overflow-hidden rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-gradient-to-br from-background via-background to-primary/[0.03] group transition-all hover:shadow-primary/10">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Trophy className="h-64 w-64 rotate-12" />
            </div>
            
            <CardContent className="p-6 md:p-10 space-y-10">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-[1.1] text-foreground">
                    {getTranslatedText(activePath.title, locale)}
                  </h3>
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl opacity-70">
                    {getTranslatedText(activePath.description, locale)}
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 min-w-[240px]">
                  {stats?.nextLesson ? (
                    <Button asChild size="lg" className="rounded-[22px] px-10 h-16 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95 bg-primary text-primary-foreground border-none">
                      <Link
                        to={`/${lang}/learning/${activePath.id}/${stats.moduleId}/${stats.nextLesson.id}` as '/'}
                      >
                        <Play className="mr-3 h-5 w-5 fill-current" />
                        {stats.completedCount > 0 ? t`Continue` : t`Start Path`}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" className="rounded-[22px] px-10 h-16 text-lg font-black border-2 border-green-500/20 bg-green-500/[0.05] text-green-600 hover:bg-green-500/10 transition-all">
                      <Trophy className="mr-3 h-5 w-5" />
                      {t`Path Completed`}
                    </Button>
                  )}
                  
                  <Button asChild variant="ghost" className="rounded-2xl h-14 text-sm font-black text-muted-foreground hover:bg-transparent hover:text-foreground group/link">
                    <Link to={`/${lang}/learning/${activePath.id}` as '/'}>
                      {t`View Details`}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-5 pt-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1">
                  <span className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    {t`Path Progress`}
                  </span>
                  <span className="text-primary">{stats?.percentage}%</span>
                </div>
                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner p-0.5">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${stats?.percentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 pt-8 border-t border-border/30">
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t`Completion`}</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black tabular-nums tracking-tighter">{stats?.percentage ?? 0}</span>
                      <span className="text-xs font-black text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 group cursor-default">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t`Lessons`}</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black tabular-nums tracking-tighter">{stats?.completedCount}</span>
                      <span className="text-xs font-black text-muted-foreground">/ {stats?.totalCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 group cursor-default">
                  <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t`Estimate`}</span>
                    <span className="text-xs font-bold text-foreground tracking-tight">{formatRemainingTime(stats?.remainingMinutes ?? 0)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 group cursor-default">
                  <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-amber-500/5 transition-colors">
                    <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t`Daily Streak`}</span>
                    <span className="text-xs font-bold text-foreground tracking-tight">{formatStreak(getDisplayStreak(progress.streak))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-[40px] border-2 border-dashed border-muted">
            <Trophy className="h-16 w-16 text-primary/40 mb-6" />
            <h3 className="text-2xl font-black tracking-tight mb-2">{t`Congratulations!`}</h3>
            <p className="text-muted-foreground font-medium mb-8">{t`You've completed this learning path.`}</p>
            <Button asChild variant="outline" className="rounded-2xl px-8 h-12 font-bold">
              <Link to={`/${lang}/learning/${activePath?.id}` as '/'}>{t`Review Path`}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Restart Onboarding Confirmation Dialog */}
      <AlertDialog open={isRestartDialogOpen} onOpenChange={setIsRestartDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t`Restart Onboarding?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {t`This will reset your onboarding preferences and show the welcome flow again. Your lesson progress will be preserved.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t`Cancel`}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void resetOnboarding()}
              className="rounded-xl"
            >
              {t`Restart`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wipe All Data Confirmation Dialog (DEV only) */}
      {import.meta.env.DEV && (
        <AlertDialog open={isWipeDialogOpen} onOpenChange={setIsWipeDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">{t`Wipe All Data?`}</AlertDialogTitle>
              <AlertDialogDescription>
                {t`This will permanently delete all your learning progress, including completed lessons, quiz scores, and onboarding preferences. This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t`Cancel`}</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearProgress}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t`Wipe All Data`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
