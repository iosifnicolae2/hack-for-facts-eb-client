import { createFileRoute, Link } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { BookOpen, ArrowRight, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getLearningPaths, getTranslatedText } from '@/features/learning/utils/paths'
import { useLearningProgress } from '@/features/learning/hooks/use-learning-progress'
import { LearningOnboarding } from '@/features/learning/components/onboarding/LearningOnboarding'

export const Route = createFileRoute('/$lang/learning/')({
  component: LearningHubPage,
})

function LearningHubPage() {
  const { lang } = Route.useParams()
  const paths = getLearningPaths()
  const { progress, saveOnboarding } = useLearningProgress()

  if (!progress.onboarding.completedAt) {
    return <LearningOnboarding />
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t`Learning hub (PoC)`}</h1>
          <p className="text-muted-foreground">
            {t`Your personalized learning journey.`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveOnboarding({ ...progress.onboarding, completedAt: null } as any)}
        >
          <Settings className="mr-2 h-4 w-4" />
          {t`Reset onboarding`}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {paths.map((path) => (
          <Card key={path.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                <CardTitle>{getTranslatedText(path.title, lang as 'ro' | 'en')}</CardTitle>
              </div>
              <CardDescription>{getTranslatedText(path.description, lang as 'ro' | 'en')}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {path.modules.length} {t`modules`}
              </div>
              <Button asChild>
                <Link to={`/${lang}/learning/${path.id}` as '/'}>
                  {t`Start`} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t`Acesta este un proof of concept. Conținutul este încărcat din fișiere MDX în src/content/learning.`}
      </p>
    </div>
  )
}
