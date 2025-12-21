import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Circle, Menu } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { LearningProgressProvider, useLearningProgress } from '../../hooks/use-learning-progress'
import { getLearningPathById, getLearningPaths, getTranslatedText, getAllLessons } from '../../utils/paths'
import type { LearningModuleDefinition } from '../../types'

function parseLearningRoute(pathname: string): {
  readonly locale: 'en' | 'ro'
  readonly pathId: string | null
  readonly moduleId: string | null
  readonly lessonId: string | null
} {
  const parts = pathname.split('/').filter(Boolean)
  const locale: 'en' | 'ro' = parts[0] === 'ro' ? 'ro' : 'en'
  const learningIndex = parts.indexOf('learning')
  const pathId = learningIndex >= 0 ? (parts[learningIndex + 1] ?? null) : null
  const moduleId = learningIndex >= 0 ? (parts[learningIndex + 2] ?? null) : null
  const lessonId = learningIndex >= 0 ? (parts[learningIndex + 3] ?? null) : null
  return { locale, pathId, moduleId, lessonId }
}

type ModuleNavProps = {
  readonly module: LearningModuleDefinition
  readonly pathId: string
  readonly locale: 'en' | 'ro'
  readonly currentModuleId: string | null
  readonly currentLessonId: string | null
  readonly lessonProgress: Record<string, { readonly status: string } | undefined>
}

function ModuleNav({ module, pathId, locale, currentModuleId, currentLessonId, lessonProgress }: ModuleNavProps) {
  const isCurrentModule = module.id === currentModuleId
  const [isOpen, setIsOpen] = useState(isCurrentModule)

  const completedLessons = module.lessons.filter((lesson) => {
    const status = lessonProgress[lesson.id]?.status
    return status === 'completed' || status === 'passed'
  }).length
  const isModuleComplete = completedLessons === module.lessons.length

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
        <div className="flex items-center gap-2">
          {isModuleComplete ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground/50" />
          )}
          <span className={cn('truncate', isCurrentModule && 'font-medium')}>
            {getTranslatedText(module.title, locale)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {completedLessons}/{module.lessons.length}
          </Badge>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform text-muted-foreground', isOpen && 'rotate-180')}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4">
        <div className="grid gap-0.5 py-1">
          {module.lessons.map((lesson) => {
            const status = lessonProgress[lesson.id]?.status
            const isCompleted = status === 'completed' || status === 'passed'
            const isActive = lesson.id === currentLessonId

            return (
              <Link
                key={lesson.id}
                to={`/${locale}/learning/${pathId}/${module.id}/${lesson.id}` as '/'}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent/50 font-medium' : 'text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                )}
                <span className="truncate">{getTranslatedText(lesson.title, locale)}</span>
              </Link>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function LearningSidebar({ pathname }: { readonly pathname: string }) {
  const { auth, progress, poc } = useLearningProgress()
  const { locale, pathId, moduleId, lessonId } = parseLearningRoute(pathname)

  const paths = useMemo(() => getLearningPaths(), [])
  const activePath = pathId ? getLearningPathById(pathId) : null

  const completionStats = useMemo(() => {
    if (!activePath) return null
    const allLessons = getAllLessons(activePath)
    const total = allLessons.length
    const lessonProgress = progress.paths[activePath.id]?.modules ?? {}
    const completed = allLessons.filter((lesson) => {
      const status = lessonProgress[lesson.id]?.status
      return status === 'completed' || status === 'passed'
    }).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percent }
  }, [activePath, progress.paths])

  const lessonProgress = activePath ? (progress.paths[activePath.id]?.modules ?? {}) : {}
  const authLabel = auth.isAuthenticated ? (auth.isSimulated ? t`Simulated auth` : t`Authenticated`) : t`Guest`

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-4 space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t`Budget Academy (PoC)`}</h2>
          <p className="text-sm text-muted-foreground">{t`Learn the basics of public budgeting.`}</p>
        </div>

        {completionStats ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t`Path progress`}</span>
              <Badge variant={completionStats.completed === completionStats.total ? 'success' : 'secondary'}>
                {completionStats.completed}/{completionStats.total} {t`lessons`}
              </Badge>
            </div>
            <Progress value={completionStats.percent} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{authLabel}</span>
              <span>{completionStats.percent}%</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">{t`Select a path to start.`}</div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-2">
        <nav className="grid gap-1">
          <Link
            to={`/${locale}/learning` as '/'}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            activeProps={{ className: 'bg-accent text-accent-foreground' }}
            activeOptions={{ exact: true }}
          >
            <BookOpen className="h-4 w-4" />
            {t`Learning hub`}
          </Link>

          <div className="my-2 border-t" />

          <div className="px-3 pt-2 text-xs font-medium text-muted-foreground">{t`Paths`}</div>
          {paths.map((p) => (
            <Link
              key={p.id}
              to={`/${locale}/learning/${p.id}` as '/'}
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                p.id === pathId ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              <span className="truncate">{getTranslatedText(p.title, locale)}</span>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </Link>
          ))}

          {activePath ? (
            <>
              <div className="my-2 border-t" />
              <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">{t`Lessons`}</div>
              {activePath.modules.map((module) => (
                <ModuleNav
                  key={module.id}
                  module={module}
                  pathId={activePath.id}
                  locale={locale}
                  currentModuleId={moduleId}
                  currentLessonId={lessonId}
                  lessonProgress={lessonProgress}
                />
              ))}
            </>
          ) : null}
        </nav>
      </div>

      {import.meta.env.DEV ? (
        <div className="px-4">
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t`PoC controls`}</span>
              <span className="font-mono">{auth.userId ?? '-'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={poc.toggleSimulatedAuth} disabled={!poc.canSimulateAuth}>
                {auth.isAuthenticated ? t`Use guest` : t`Simulate auth`}
              </Button>
              <Button size="sm" variant="outline" onClick={poc.clearGuest}>
                {t`Clear guest`}
              </Button>
              <Button size="sm" variant="outline" onClick={poc.clearAuth} disabled={!auth.isAuthenticated}>
                {t`Clear auth`}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function LearningLayout() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <LearningProgressProvider>
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden absolute left-4 top-4 z-40">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <LearningSidebar pathname={location.pathname} />
          </SheetContent>
        </Sheet>

        <div className="hidden border-r bg-muted/10 lg:block lg:w-80 lg:shrink-0">
          <LearningSidebar pathname={location.pathname} />
        </div>

        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl py-8 lg:py-12 px-4 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </LearningProgressProvider>
  )
}
