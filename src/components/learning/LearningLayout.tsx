import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { BookOpen, ChevronDown, Menu, Layers, Building2, TrendingUp, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { t } from '@lingui/core/macro'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// Navigation configuration - single source of truth
type NavItem = {
  readonly id: string
  readonly path: string
  readonly titleEn: string
  readonly titleRo: string
}

type NavSection = {
  readonly id: string
  readonly titleEn: string
  readonly titleRo: string
  readonly icon: LucideIcon
  readonly children: readonly NavItem[]
}

export const navigationConfig: readonly NavSection[] = [
  {
    id: 'fundamentals',
    titleEn: 'Fundamentals',
    titleRo: 'Bazele',
    icon: BookOpen,
    children: [
      { id: 'basics', path: 'fundamentals/basics', titleEn: 'Budget Basics', titleRo: 'Bazele Bugetului' },
      { id: 'structure', path: 'fundamentals/structure', titleEn: 'The Structure', titleRo: 'Structura' },
    ],
  },
  {
    id: 'organization',
    titleEn: 'Organization',
    titleRo: 'Organizare',
    icon: Building2,
    children: [
      { id: 'hierarchy', path: 'organization/hierarchy', titleEn: 'The Hierarchy', titleRo: 'Ierarhia' },
      { id: 'flow', path: 'organization/flow', titleEn: 'Flow & Consolidation', titleRo: 'Flux și Consolidare' },
    ],
  },
  {
    id: 'advanced',
    titleEn: 'Advanced',
    titleRo: 'Avansat',
    icon: TrendingUp,
    children: [
      { id: 'concepts', path: 'advanced/concepts', titleEn: 'Advanced Concepts', titleRo: 'Concepte Avansate' },
    ],
  },
] as const

// Helper to get all modules in flat order for navigation
export function getFlatModuleList(): readonly NavItem[] {
  return navigationConfig.flatMap((section) => section.children)
}

// Helper to find adjacent modules for prev/next navigation
export function getAdjacentModules(currentPath: string): { prev: NavItem | null; next: NavItem | null } {
  const flatList = getFlatModuleList()
  const currentIndex = flatList.findIndex((m) => currentPath.includes(m.path))
  return {
    prev: currentIndex > 0 ? flatList[currentIndex - 1] : null,
    next: currentIndex < flatList.length - 1 ? flatList[currentIndex + 1] : null,
  }
}

export function LearningLayout() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(navigationConfig.map((s) => s.id)) // All expanded by default
  )

  // Extract language from URL path (e.g., /ro/learning/... or /en/learning/...)
  const lang = location.pathname.startsWith('/ro') ? 'ro' : 'en'
  const isRo = lang === 'ro'

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const isActiveModule = (modulePath: string) => {
    return location.pathname.includes(`/learning/${modulePath}`)
  }

  const isActiveSection = (section: NavSection) => {
    return section.children.some((child) => isActiveModule(child.path))
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Layers className="h-5 w-5" />
          {isRo ? 'Academia Bugetară' : 'Budget Academy'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRo ? 'Învață despre bugetul public' : 'Master the public budget'}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-2">
        <nav className="grid gap-1">
          {/* Overview link */}
          <Link
            to={`/${lang}/learning` as '/'}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            activeProps={{ className: 'bg-accent text-accent-foreground' }}
            activeOptions={{ exact: true }}
            onClick={() => setIsOpen(false)}
          >
            <BookOpen className="h-4 w-4" />
            {t`Overview`}
          </Link>

          <div className="my-2 border-t" />

          {/* Hierarchical navigation */}
          {navigationConfig.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSections.has(section.id)
            const hasActiveChild = isActiveSection(section)

            return (
              <div key={section.id} className="space-y-1">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    hasActiveChild && 'text-primary'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{isRo ? section.titleRo : section.titleEn}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-200',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {/* Section children */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200',
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="ml-4 border-l pl-2 space-y-1">
                    {section.children.map((item) => {
                      const isActive = isActiveModule(item.path)
                      return (
                        <Link
                          key={item.id}
                          to={`/${lang}/learning/${item.path}` as '/'}
                          className={cn(
                            'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                            isActive
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-muted-foreground'
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {isRo ? item.titleRo : item.titleEn}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute left-4 top-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/10 lg:block lg:w-80 lg:shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl py-8 lg:py-12 px-4 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
