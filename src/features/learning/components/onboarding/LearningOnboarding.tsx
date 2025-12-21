import { t } from '@lingui/core/macro'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Database,
  GraduationCap,
  Layers,
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

function StepIndicator({ currentStep, onStepClick }: { readonly currentStep: Step; readonly onStepClick: (step: Step) => void }) {
  if (currentStep === 'welcome') return null

  const steps: readonly { readonly id: Step; readonly label: string }[] = [
    { id: 'role', label: t`Goal` },
    { id: 'depth', label: t`Knowledge` },
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStep
        const isPast = currentStep === 'depth' && step.id === 'role'
        const isClickable = isPast

        return (
          <div key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
                isCurrent && 'bg-primary text-primary-foreground shadow-md',
                isPast && 'bg-primary/20 text-primary cursor-pointer hover:bg-primary/30',
                !isCurrent && !isPast && 'bg-muted text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                  isCurrent && 'bg-primary-foreground/20',
                  isPast && 'bg-primary/30'
                )}
              >
                {isPast ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {step.label}
            </button>
            {index < steps.length - 1 && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-colors duration-300',
                  isPast ? 'text-primary' : 'text-muted-foreground/40'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function LearningOnboarding() {
  const { saveOnboarding } = useLearningProgress()
  const [step, setStep] = useState<Step>('welcome')
  const [role, setRole] = useState<UserRole | null>(null)
  const [depth, setDepth] = useState<LearningDepth | null>(null)

  const roles = useMemo<readonly { readonly id: UserRole; readonly label: string; readonly icon: typeof User; readonly description: string; readonly color: string }[]>(
    () => [
      {
        id: 'citizen',
        label: t`Understand my taxes`,
        icon: User,
        description: t`I want to see where local money goes`,
        color: 'from-blue-500/20 to-blue-600/10',
      },
      {
        id: 'journalist',
        label: t`Investigate stories`,
        icon: Search,
        description: t`I need to find contracts and anomalies`,
        color: 'from-purple-500/20 to-purple-600/10',
      },
      {
        id: 'public_servant',
        label: t`Manage data`,
        icon: Database,
        description: t`I work in public administration`,
        color: 'from-rose-500/20 to-rose-600/10',
      },
    ],
    []
  )

  const depths = useMemo<readonly { readonly id: LearningDepth; readonly label: string; readonly description?: string; readonly icon: typeof Layers; readonly color: string }[]>(
    () => [
      {
        id: 'beginner',
        label: t`I'm new to this`,
        icon: Sparkles,
        color: 'from-green-500/20 to-green-600/10',
      },
      {
        id: 'intermediate',
        label: t`I know the basics`,
        icon: GraduationCap,
        color: 'from-blue-500/20 to-blue-600/10',
      },
      {
        id: 'advanced',
        label: t`I'm a pro`,
        icon: Zap,
        color: 'from-purple-500/20 to-purple-600/10',
      },
    ],
    []
  )

  const handleComplete = async () => {
    if (!role || !depth) return
    await saveOnboarding({ role, depth })
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      {step !== 'welcome' && (
        <div className="w-full max-w-3xl mb-6">
           <StepIndicator currentStep={step} onStepClick={setStep} />
        </div>
      )}

      <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center">
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 max-w-lg mx-auto">
            <div className="flex justify-center">
               <div className="text-9xl animate-bounce duration-1000">🦉</div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {t`The free, fun way to learn about`} <span className="text-primary">{t`public money`}</span>.
            </h1>
            
            <div className="pt-8">
              <Button 
                size="lg" 
                className="w-full md:w-auto px-12 py-6 text-lg font-bold rounded-xl shadow-xl hover:scale-105 transition-transform bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setStep('role')}
              >
                {t`GET STARTED`}
              </Button>
            </div>
          </div>
        )}

        {step === 'role' && (
          <div
            key="role-step"
            className="w-full animate-in fade-in slide-in-from-right-8 duration-500"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">{t`What's your main goal?`}</h2>
            </div>
            
            <RadioGroup
              value={role ?? ''}
              onValueChange={(v) => {
                setRole(v as UserRole)
              }}
              className="grid gap-4"
            >
              {roles.map((item) => {
                const Icon = item.icon
                const isSelected = role === item.id

                return (
                  <Label
                    key={item.id}
                    className={cn(
                      'relative flex items-center gap-4 rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 overflow-hidden group bg-card hover:bg-accent/50',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/30 hover:shadow-sm'
                    )}
                  >
                    <RadioGroupItem value={item.id} className="sr-only" />

                    <div
                      className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                      )}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    <div className="relative flex-1">
                      <div className="font-bold text-lg text-foreground">{item.label}</div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </div>
                  </Label>
                )
              })}
            </RadioGroup>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setStep('depth')}
                disabled={!role}
                size="lg"
                className="w-full md:w-auto px-8 py-6 text-lg font-bold rounded-xl shadow-md"
              >
                {t`Continue`}
              </Button>
            </div>
          </div>
        )}

        {step === 'depth' && (
          <div
            key="depth-step"
            className="w-full animate-in fade-in slide-in-from-right-8 duration-500"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">{t`How much do you know about public budgets?`}</h2>
            </div>

            <RadioGroup
              value={depth ?? ''}
              onValueChange={(v) => setDepth(v as LearningDepth)}
              className="grid gap-4"
            >
              {depths.map((item) => {
                const Icon = item.icon
                const isSelected = depth === item.id

                return (
                  <Label
                    key={item.id}
                    className={cn(
                      'relative flex items-center gap-4 rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 overflow-hidden group bg-card hover:bg-accent/50',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    )}
                  >
                    <RadioGroupItem value={item.id} className="sr-only" />

                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="relative flex-1">
                      <div className="font-bold text-lg text-foreground">{item.label}</div>
                      {item.description && (
                        <div className="text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  </Label>
                )
              })}
            </RadioGroup>

            <div className="mt-8 flex justify-between items-center gap-4">
              <Button variant="ghost" onClick={() => setStep('role')} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t`Back`}
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!depth}
                size="lg"
                className="flex-1 md:flex-none px-8 py-6 text-lg font-bold rounded-xl shadow-md bg-green-600 hover:bg-green-700 text-white"
              >
                {t`Start Learning`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
