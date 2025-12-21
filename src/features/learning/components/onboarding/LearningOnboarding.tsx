import { t } from '@lingui/core/macro'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  Database,
  GraduationCap,
  Search,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { useLearningProgress } from '../../hooks/use-learning-progress'
import type { LearningDepth, UserRole } from '../../types'

type Step = 'welcome' | 'role' | 'depth'

function StepIndicator({ currentStep }: { readonly currentStep: Step }) {
  if (currentStep === 'welcome') return null

  const totalSteps = 2
  const currentStepIndex = currentStep === 'role' ? 1 : 2

  return (
    <div className="w-full max-w-xs mx-auto mb-16">
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-700 ease-in-out"
          style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          {t`Step ${currentStepIndex}/${totalSteps}`}
        </span>
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
          {currentStep === 'role' ? t`Goal` : t`Experience`}
        </span>
      </div>
    </div>
  )
}

export function LearningOnboarding() {
  const { saveOnboarding } = useLearningProgress()
  const [step, setStep] = useState<Step>('welcome')
  const [role, setRole] = useState<UserRole | null>(null)
  const [depth, setDepth] = useState<LearningDepth | null>(null)

  const roles = useMemo<readonly { readonly id: UserRole; readonly label: string; readonly icon: typeof User; readonly description: string }[]>(
    () => [
      {
        id: 'citizen',
        label: t`Understand my taxes`,
        icon: User,
        description: t`I want to see where local money goes`,
      },
      {
        id: 'journalist',
        label: t`Investigate stories`,
        icon: Search,
        description: t`I need to find contracts and anomalies`,
      },
      {
        id: 'public_servant',
        label: t`Manage data`,
        icon: Database,
        description: t`I work in public administration`,
      },
    ],
    []
  )

  const depths = useMemo<readonly { readonly id: LearningDepth; readonly label: string; readonly description?: string; readonly icon: typeof Sparkles }[]>(
    () => [
      {
        id: 'beginner',
        label: t`I'm new to this`,
        icon: Sparkles,
      },
      {
        id: 'intermediate',
        label: t`I know the basics`,
        icon: GraduationCap,
      },
      {
        id: 'advanced',
        label: t`I'm a pro`,
        icon: Zap,
      },
    ],
    []
  )

  const handleComplete = async () => {
    if (!role || !depth) return
    await saveOnboarding({ role, depth })
  }

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        {step !== 'welcome' && (
          <div className="w-full animate-in fade-in duration-1000">
             <StepIndicator currentStep={step} />
          </div>
        )}

        <div className="w-full flex-1 flex flex-col items-center justify-center">
          {step === 'welcome' && (
            <div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-xl mx-auto">
              <div className="text-8xl md:text-9xl mb-4 grayscale hover:grayscale-0 transition-all duration-700 cursor-default">🦉</div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-[1.1]">
                  {t`Learn public budgeting.`}
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed opacity-80">
                  {t`Personalized paths, interactive lessons, and verified certificates.`}
                </p>
              </div>
              
              <div className="pt-6">
                <Button 
                  size="lg" 
                  className="group px-10 py-7 text-lg font-bold rounded-full transition-all bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-98"
                  onClick={() => setStep('role')}
                >
                  <span className="flex items-center gap-3 tracking-tight">
                    {t`Get Started`}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>
          )}

          {step === 'role' && (
            <div
              key="role-step"
              className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="text-center mb-12 space-y-3">
                <h2 className="text-3xl font-black text-foreground tracking-tight">{t`What's your goal?`}</h2>
              </div>
              
              <RadioGroup
                value={role ?? ''}
                onValueChange={(v) => setRole(v as UserRole)}
                className="grid gap-3"
              >
                {roles.map((item) => {
                  const isSelected = role === item.id

                  return (
                    <Label
                      key={item.id}
                      className={cn(
                        'relative flex items-center gap-5 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 bg-card',
                        isSelected
                          ? 'border-primary bg-primary/[0.02]'
                          : 'border-muted bg-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <RadioGroupItem value={item.id} className="sr-only" />

                      <div className="flex-1 space-y-0.5">
                        <div className="font-bold text-base text-foreground tracking-tight">{item.label}</div>
                        <div className="text-xs text-muted-foreground font-medium opacity-70">{item.description}</div>
                      </div>

                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                        isSelected ? 'bg-primary border-primary' : 'border-muted'
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </Label>
                  )
                })}
              </RadioGroup>

              <div className="mt-10">
                <Button
                  onClick={() => setStep('depth')}
                  disabled={!role}
                  size="lg"
                  className="w-full py-7 text-base font-bold rounded-2xl transition-all tracking-tight"
                >
                  {t`Continue`}
                </Button>
              </div>
            </div>
          )}

          {step === 'depth' && (
            <div
              key="depth-step"
              className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="text-center mb-12 space-y-3">
                <h2 className="text-3xl font-black text-foreground tracking-tight">{t`Experience level?`}</h2>
              </div>

              <RadioGroup
                value={depth ?? ''}
                onValueChange={(v) => setDepth(v as LearningDepth)}
                className="grid gap-3"
              >
                {depths.map((item) => {
                  const isSelected = depth === item.id

                  return (
                    <Label
                      key={item.id}
                      className={cn(
                        'relative flex items-center gap-5 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 bg-card',
                        isSelected
                          ? 'border-primary bg-primary/[0.02]'
                          : 'border-muted bg-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <RadioGroupItem value={item.id} className="sr-only" />

                      <div className="flex-1">
                        <div className="font-bold text-base text-foreground tracking-tight">{item.label}</div>
                      </div>

                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                        isSelected ? 'bg-primary border-primary' : 'border-muted'
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </Label>
                  )
                })}
              </RadioGroup>

              <div className="mt-10 flex flex-col gap-3">
                <Button
                  onClick={handleComplete}
                  disabled={!depth}
                  size="lg"
                  className="w-full py-7 text-base font-bold rounded-2xl transition-all tracking-tight"
                >
                  {t`Start Learning`}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('role')} 
                  className="w-full text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {t`Go back`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
