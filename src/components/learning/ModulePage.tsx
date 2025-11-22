import { Link, useLocation } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { t } from '@lingui/core/macro'
import { Button } from '@/components/ui/button'
import { getAdjacentModules } from './LearningLayout'

type ModulePageProps = {
  readonly title: string
  readonly description: string
  readonly children: React.ReactNode
}

export function ModulePage({ title, description, children }: ModulePageProps) {
  const location = useLocation()
  const { prev, next } = getAdjacentModules(location.pathname)
  // Extract language from URL path (e.g., /ro/learning/... or /en/learning/...)
  const lang = location.pathname.startsWith('/ro') ? 'ro' : 'en'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-8">{children}</div>

      <div className="flex justify-between pt-8 border-t mt-12">
        {prev ? (
          <Button variant="outline" asChild>
            <Link to={`/${lang}/learning/${prev.path}` as '/'}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t`Previous`}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {next ? (
          <Button asChild>
            <Link to={`/${lang}/learning/${next.path}` as '/'}>
              {t`Next`} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link to={`/${lang}/learning` as '/'}>
              {t`Finish Course`} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// Content building blocks
export function Heading({ children }: { readonly children: React.ReactNode }) {
  return <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
}

export function Text({ children }: { readonly children: React.ReactNode }) {
  return <p className="text-lg leading-relaxed text-muted-foreground">{children}</p>
}
