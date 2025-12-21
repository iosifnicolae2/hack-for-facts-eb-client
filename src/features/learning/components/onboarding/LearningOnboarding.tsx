import { t } from '@lingui/core/macro'
import { useMemo, useState } from 'react'
import { Check, ChevronRight, GraduationCap, Newspaper, Search, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { useLearningProgress } from '../../hooks/use-learning-progress'
import type { LearningDepth, UserRole } from '../../types'

export function LearningOnboarding() {
  const { saveOnboarding } = useLearningProgress()
  const [step, setStep] = useState<'role' | 'depth'>('role')
  const [role, setRole] = useState<UserRole | null>(null)
  const [depth, setDepth] = useState<LearningDepth | null>(null)

  const roles = useMemo<{ id: UserRole; label: string; icon: any; description: string }[]>(() => [
    {
      id: 'citizen',
      label: t`Citizen`,
      icon: User,
      description: t`I want to understand how public money is spent in my community.`,
    },
    {
      id: 'journalist',
      label: t`Journalist`,
      icon: Newspaper,
      description: t`I'm investigating public spending and need data for my stories.`,
    },
    {
      id: 'researcher',
      label: t`Researcher`,
      icon: Search,
      description: t`I'm analyzing fiscal trends and need detailed datasets.`,
    },
    {
      id: 'student',
      label: t`Student`,
      icon: GraduationCap,
      description: t`I'm learning about public finance and administration.`,
    },
    {
      id: 'public_servant',
      label: t`Public Servant`,
      icon: Users,
      description: t`I work in administration and want to compare budgets.`,
    },
  ], [])

  const depths = useMemo<{ id: LearningDepth; label: string; description: string }[]>(() => [
    {
      id: 'beginner',
      label: t`Beginner`,
      description: t`I'm new to this topic. Start with the basics.`,
    },
    {
      id: 'intermediate',
      label: t`Intermediate`,
      description: t`I have some knowledge. Show me more details.`,
    },
    {
      id: 'advanced',
      label: t`Advanced`,
      description: t`I'm an expert. Give me the raw data and complex tools.`,
    },
  ], [])

  const handleComplete = async () => {
    if (!role || !depth) return
    await saveOnboarding({ role, depth })
  }

  if (step === 'role') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t`Welcome to Budget Academy`}</h1>
          <p className="text-muted-foreground text-lg">
            {t`To personalize your learning experience, tell us a bit about yourself.`}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t`What describes you best?`}</CardTitle>
            <CardDescription>{t`Select the role that fits your goals.`}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={role ?? ''} onValueChange={(v) => setRole(v as UserRole)} className="grid gap-4 sm:grid-cols-2">
              {roles.map((item) => {
                const Icon = item.icon
                return (
                  <Label
                    key={item.id}
                    className={cn(
                      'flex flex-col gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                      role === item.id ? 'border-primary bg-accent' : ''
                    )}
                  >
                    <RadioGroupItem value={item.id} className="sr-only" />
                    <div className="flex items-center justify-between">
                      <Icon className="h-6 w-6" />
                      {role === item.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground font-normal leading-snug">
                      {item.description}
                    </div>
                  </Label>
                )
              })}
            </RadioGroup>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setStep('depth')} disabled={!role} size="lg">
                {t`Next step`} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t`How deep do you want to go?`}</h1>
        <p className="text-muted-foreground text-lg">
          {t`We can adjust the complexity of the content for you.`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t`Select your learning path`}</CardTitle>
          <CardDescription>{t`You can always change this later in settings.`}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={depth ?? ''} onValueChange={(v) => setDepth(v as LearningDepth)} className="grid gap-4">
            {depths.map((item) => (
              <Label
                key={item.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                  depth === item.id ? 'border-primary bg-accent' : ''
                )}
              >
                <RadioGroupItem value={item.id} className="sr-only" />
                <div className="space-y-1">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {item.description}
                  </div>
                </div>
                {depth === item.id && <Check className="h-5 w-5 text-primary" />}
              </Label>
            ))}
          </RadioGroup>

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep('role')}>
              {t`Back`}
            </Button>
            <Button onClick={handleComplete} disabled={!depth} size="lg">
              {t`Start Learning`} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
