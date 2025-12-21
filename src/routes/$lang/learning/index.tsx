import { createFileRoute, Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { useMemo } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getAllLessons,
  getLearningPaths,
  getTranslatedText,
} from '@/features/learning/utils/paths'
import { useLearningProgress } from '@/features/learning/hooks/use-learning-progress'
import { LearningOnboarding } from '@/features/learning/components/onboarding/LearningOnboarding'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/$lang/learning/')({
  component: LearningHubPage,
})

function LearningHubPage() {
  const { lang } = Route.useParams()
  const locale = lang as 'ro' | 'en'
  const paths = getLearningPaths()
  const { progress, resetOnboarding, setActivePathId } = useLearningProgress()

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
      nextLesson,
      moduleId: module?.id,
    }
  }, [activePath, progress.content])

  if (!progress.onboarding.completedAt) {
    return <LearningOnboarding />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-1000 py-10 px-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              {t`Status: Active`}
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground leading-tight">
            {t`Welcome back.`}
          </h1>
          <p className="text-muted-foreground font-medium text-lg opacity-60">
            {t`You're doing great. Keep up the momentum.`}
          </p>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{t`Completion`}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tabular-nums tracking-tighter">{stats?.percentage ?? 0}</span>
              <span className="text-sm font-black text-muted-foreground">%</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{t`Lessons`}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tabular-nums tracking-tighter">{stats?.completedCount}</span>
              <span className="text-sm font-black text-muted-foreground">/ {stats?.totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Active Path Card */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="h-4 w-[2px] bg-primary rounded-full" />
            {t`Current Path`}
          </h2>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                {t`Switch Path`}
                <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-[24px] p-2 shadow-2xl border-border/40 backdrop-blur-xl bg-background/95">
              {paths.map((p) => (
                <DropdownMenuItem 
                  key={p.id} 
                  onClick={() => setActivePathId(p.id)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 cursor-pointer rounded-[18px] transition-all mb-1 last:mb-0",
                    p.id === activePath?.id ? "bg-foreground text-background" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-bold text-sm tracking-tight">{getTranslatedText(p.title, locale)}</span>
                    {p.id === activePath?.id && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium line-clamp-1 opacity-60",
                    p.id === activePath?.id ? "text-background" : "text-muted-foreground"
                  )}>{getTranslatedText(p.description, locale)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {activePath && (stats?.percentage ?? 0) < 100 ? (
          <Card className="relative overflow-hidden rounded-[40px] border-none shadow-2xl shadow-primary/5 bg-gradient-to-br from-background via-background to-primary/[0.03] group transition-all hover:shadow-primary/10">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Trophy className="h-64 w-64 rotate-12" />
            </div>
            
            <CardContent className="p-10 md:p-14 space-y-12">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                <div className="space-y-6 flex-1">
                  <Badge variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-none shadow-none">
                    {activePath.difficulty}
                  </Badge>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] text-foreground">
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

      {/* Tertiary Info & Settings */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-10 px-2 pt-6 border-t border-muted/40">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-10">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t`Estimate`}</span>
              <span className="text-xs font-bold text-foreground tracking-tight">{t`2h remaining`}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 group cursor-default">
            <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-amber-500/5 transition-colors">
              <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t`Daily Streak`}</span>
              <span className="text-xs font-bold text-foreground tracking-tight">{t`1 Day`}</span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => void resetOnboarding()}
          className="h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all"
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5 opacity-50" />
          {t`Reset Academy`}
        </Button>
      </div>
    </div>
  )
}
