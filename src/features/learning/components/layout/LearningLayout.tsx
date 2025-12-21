import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  GraduationCap,
  Home,
  Menu,
  PlayCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { LearningProgressProvider, useLearningProgress } from '../../hooks/use-learning-progress'
import { getAllLessons, getLearningPathById, getLearningPaths, getTranslatedText } from '../../utils/paths'
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
  readonly lessonProgress: Readonly<Record<string, { readonly status: string } | undefined>>
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
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-accent">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
          {isModuleComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <div className="relative h-5 w-5">
              <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                <circle
                  className="text-muted/40"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  cx="10"
                  cy="10"
                  r="8"
                />
                <circle
                  className="text-primary transition-all duration-500"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(completedLessons / module.lessons.length) * 50.3} 50.3`}
                  cx="10"
                  cy="10"
                  r="8"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                {completedLessons}
              </span>
            </div>
          )}
        </div>
        <span className={cn('flex-1 text-left truncate', isCurrentModule && 'font-medium text-foreground')}>
          {getTranslatedText(module.title, locale)}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="ml-4 border-l-2 border-muted pl-2 py-1 space-y-0.5">
          {module.lessons.map((lesson, index) => {
            const status = lessonProgress[lesson.id]?.status
            const isCompleted = status === 'completed' || status === 'passed'
            const isActive = lesson.id === currentLessonId
            const isNextUp = !isCompleted && index === module.lessons.findIndex((l) => {
              const s = lessonProgress[l.id]?.status
              return s !== 'completed' && s !== 'passed'
            })

            return (
              <Link
                key={lesson.id}
                to={`/${locale}/learning/${pathId}/${module.id}/${lesson.id}` as '/'}
                className={cn(
                  'group/lesson flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : isActive ? (
                    <PlayCircle className="h-4 w-4 text-primary animate-pulse" />
                  ) : isNextUp ? (
                    <Circle className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
                <span className="truncate">{getTranslatedText(lesson.title, locale)}</span>
              </Link>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function CircularProgress({ value, size = 48 }: { readonly value: number; readonly size?: number }) {
  const strokeWidth = 4
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
          className={cn('transition-all duration-500', value === 100 ? 'text-green-500' : 'text-primary')}
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
        <span className="text-sm font-bold">{value}%</span>
      </div>
    </div>
  )
}

function LearningSidebar({ pathname }: { readonly pathname: string }) {
  const { auth, progress, clearProgress } = useLearningProgress()
  const { locale, pathId, moduleId, lessonId } = parseLearningRoute(pathname)

  const paths = useMemo(() => getLearningPaths(), [])
  const activePath = pathId ? getLearningPathById(pathId) : null

  const completionStats = useMemo(() => {
    if (!activePath) return null
    const allLessons = getAllLessons(activePath)
    const total = allLessons.length
    const lessonProgress = progress.content
    const completed = allLessons.filter((lesson) => {
      const status = lessonProgress[lesson.id]?.status
      return status === 'completed' || status === 'passed'
    }).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percent }
  }, [activePath, progress.content])

  const lessonProgress = progress.content
  const authLabel = auth.isAuthenticated ? t`Authenticated` : t`Guest`

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-b from-muted/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold tracking-tight truncate">{t`Budget Academy`}</h2>
            <p className="text-xs text-muted-foreground">{t`Learn public budgeting`}</p>
          </div>
        </div>
      </div>

      {/* Progress Section - Only when path is active */}
      {completionStats ? (
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <CircularProgress value={completionStats.percent} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {activePath ? getTranslatedText(activePath.title, locale) : ''}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {completionStats.completed}/{completionStats.total} {t`lessons`}
              </div>
              <Badge
                variant={completionStats.completed === completionStats.total ? 'success' : 'secondary'}
                className="mt-2 text-xs"
              >
                {completionStats.completed === completionStats.total ? t`Complete!` : t`In progress`}
              </Badge>
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {/* Hub Link */}
          <Link
            to={`/${locale}/learning` as '/'}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              !pathId ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            activeOptions={{ exact: true }}
          >
            <Home className="h-4 w-4" />
            {t`Learning Hub`}
          </Link>

          {/* Paths Section */}
          <div className="pt-4">
            <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t`Learning Paths`}
            </div>
            {paths.map((p) => {
              const isActivePath = p.id === pathId

              return (
                <Link
                  key={p.id}
                  to={`/${locale}/learning/${p.id}` as '/'}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    isActivePath
                      ? 'bg-accent font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate">{getTranslatedText(p.title, locale)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                </Link>
              )
            })}
          </div>

          {/* Modules for Active Path */}
          {activePath ? (
            <div className="pt-4">
              <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t`Modules`}
              </div>
              <div className="space-y-1">
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
              </div>
            </div>
          ) : null}
        </nav>
      </ScrollArea>

      {/* Footer - Dev Controls */}
      {import.meta.env.DEV ? (
        <div className="p-3 border-t bg-muted/30">
          <div className="rounded-lg border bg-background/50 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t`Dev Controls`}</span>
              <Badge variant="outline" className="text-[10px] px-1.5">
                {authLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={clearProgress}>
                {t`Clear progress`}
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
      <div className="flex min-h-screen w-full">
        {/* Mobile Sidebar */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden fixed left-4 top-4 z-40 shadow-md bg-background"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <LearningSidebar pathname={location.pathname} />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col border-r bg-muted/5">
          <LearningSidebar pathname={location.pathname} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl py-8 lg:py-12 px-4 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </LearningProgressProvider>
  )
}
