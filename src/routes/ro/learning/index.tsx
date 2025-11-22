import { createFileRoute, Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, GraduationCap, TrendingUp } from 'lucide-react'
import { navigationConfig } from '@/components/learning/LearningLayout'

export const Route = createFileRoute('/ro/learning/')({
  component: LearningIndex,
})

function LearningIndex() {
  // Get the first module path for "Start Learning" button
  const firstModulePath = navigationConfig[0]?.children[0]?.path ?? 'fundamentals/basics'

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-primary/5 p-8 md:p-12 text-center lg:text-left">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-primary">
            Academia Bugetară
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Înțelege cum sunt colectați, cheltuiți și gestionați banii publici în România. De la
            concepte de bază la analiză fiscală avansată.
          </p>
          <Button asChild size="lg" className="gap-2 text-lg h-12 px-8 shadow-lg shadow-primary/20">
            <Link to={`/ro/learning/${firstModulePath}` as '/'}>
              {t`Start Learning`} <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10 pointer-events-none">
          <TrendingUp className="w-96 h-96 text-primary" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-xl">Învățare Interactivă</h3>
          <p className="text-muted-foreground leading-relaxed">
            Ghiduri vizuale și grafice interactive te ajută să înțelegi concepte complexe.
          </p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-xl">Cunoștințe Expert</h3>
          <p className="text-muted-foreground leading-relaxed">
            Bazat pe legile oficiale (500/2002, 273/2006) și standardele Ministerului de Finanțe.
          </p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-xl">Date Reale</h3>
          <p className="text-muted-foreground leading-relaxed">
            Învață să interpretezi cifrele reale din spatele știrilor.
          </p>
        </div>
      </div>

      {/* Curriculum - Hierarchical Display */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">{t`Curriculum`}</h2>

        {navigationConfig.map((section, sectionIndex) => {
          const Icon = section.icon
          return (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{section.titleRo}</h3>
                <span className="text-sm text-muted-foreground">
                  ({section.children.length} {section.children.length === 1 ? 'modul' : 'module'})
                </span>
              </div>

              {/* Section Modules */}
              <div className="grid gap-3 md:grid-cols-2 pl-4 border-l-2 border-muted ml-4">
                {section.children.map((module, moduleIndex) => {
                  // Calculate global module number
                  const globalIndex =
                    navigationConfig
                      .slice(0, sectionIndex)
                      .reduce((acc, s) => acc + s.children.length, 0) +
                    moduleIndex +
                    1

                  return (
                    <Link
                      key={module.id}
                      to={`/ro/learning/${module.path}` as '/'}
                      className="group relative overflow-hidden rounded-xl border bg-card p-5 hover:shadow-md transition-all hover:border-primary/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-medium text-base group-hover:text-primary transition-colors">
                            {module.titleRo}
                          </h4>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                          {globalIndex}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
