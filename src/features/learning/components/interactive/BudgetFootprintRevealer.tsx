import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@lingui/core/macro'
import { Check, ChevronDown, ChevronUp, Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LearningLocale } from '../../types'

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type HiddenService = {
  readonly id: string
  readonly icon: string
  readonly name: string
  readonly dailyCostRon: number
}

type DailyActivity = {
  readonly id: string
  readonly time: string
  readonly icon: string
  readonly label: string
  readonly hiddenServices: readonly HiddenService[]
  readonly budgetCategory: string
  readonly funFact: string
}

type BudgetFootprintRevealerProps = {
  readonly activities?: readonly DailyActivity[]
  readonly componentId?: string
  readonly locale?: LearningLocale
}

// ═══════════════════════════════════════════════════════════════════
// LOCALIZED DEFAULT DATA
// ═══════════════════════════════════════════════════════════════════

// Data sources: Romanian Ministry of Finance 2024, INS, IGPR, IGSU, ANSVSA, CNAIR
// Population baseline: 19 million (INS January 2025)
// All figures represent per-capita daily public budget allocation

const ACTIVITIES_EN: readonly DailyActivity[] = [
  {
    id: 'woke-up',
    time: '06:00',
    icon: '☀️',
    label: 'Woke up safely',
    budgetCategory: 'Security',
    hiddenServices: [
      { id: 'police', icon: '👮', name: 'Police patrol', dailyCostRon: 1.3 },
      { id: 'lights', icon: '💡', name: 'Street lighting', dailyCostRon: 0.4 },
      { id: 'emergency', icon: '🚨', name: 'Emergency services (IGSU)', dailyCostRon: 0.7 },
    ],
    funFact: 'While you slept, ~15,000 police officers were on duty across Romania.',
  },
  {
    id: 'shower',
    time: '07:00',
    icon: '🚿',
    label: 'Took a shower',
    budgetCategory: 'Environment',
    hiddenServices: [
      { id: 'water', icon: '💧', name: 'Water infrastructure (Apele Române)', dailyCostRon: 0.6 },
      { id: 'treatment', icon: '🏭', name: 'Water & sewage investments', dailyCostRon: 0.6 },
      { id: 'sewage', icon: '🔧', name: 'Environmental protection', dailyCostRon: 0.4 },
    ],
    funFact: 'You use ~120L of treated water daily — a bathtub full!',
  },
  {
    id: 'commute',
    time: '08:00',
    icon: '🚗',
    label: 'Commuted',
    budgetCategory: 'Infrastructure',
    hiddenServices: [
      { id: 'roads', icon: '🛣️', name: 'Road maintenance (CNAIR)', dailyCostRon: 0.4 },
      { id: 'traffic', icon: '🚦', name: 'Traffic & road safety', dailyCostRon: 0.3 },
      { id: 'transport', icon: '🚌', name: 'Public transport subsidies', dailyCostRon: 0.7 },
    ],
    funFact: 'Romania has 86,847 km of public roads — all funded from public budgets.',
  },
  {
    id: 'work',
    time: '09:00',
    icon: '🏢',
    label: 'At work',
    budgetCategory: 'Public Safety',
    hiddenServices: [
      { id: 'fire', icon: '🧯', name: 'Fire safety (ISU)', dailyCostRon: 0.7 },
      { id: 'telecom', icon: '📡', name: 'Telecom regulation (ANCOM)', dailyCostRon: 0.06 },
      { id: 'labor', icon: '👷', name: 'Labor inspection', dailyCostRon: 0.1 },
    ],
    funFact: 'Commercial buildings above size thresholds require ISU fire safety authorization.',
  },
  {
    id: 'lunch',
    time: '12:00',
    icon: '🍽️',
    label: 'Had lunch',
    budgetCategory: 'Healthcare',
    hiddenServices: [
      { id: 'food-safety', icon: '🔬', name: 'Food safety (ANSVSA)', dailyCostRon: 0.12 },
      { id: 'sanitation', icon: '🧹', name: 'Public health programs', dailyCostRon: 0.12 },
      { id: 'health', icon: '🏥', name: 'Healthcare system (your share)', dailyCostRon: 11.7 },
    ],
    funFact: 'ANSVSA conducted 11,628 food safety inspections in March 2024 alone.',
  },
  {
    id: 'park',
    time: '17:00',
    icon: '🌳',
    label: 'Park walk',
    budgetCategory: 'Local Services',
    hiddenServices: [
      { id: 'parks', icon: '🌲', name: 'Park maintenance', dailyCostRon: 0.4 },
      { id: 'waste', icon: '🗑️', name: 'Waste collection', dailyCostRon: 0.7 },
      { id: 'air', icon: '🌬️', name: 'Air quality monitoring (ANPM)', dailyCostRon: 0.03 },
    ],
    funFact: 'Urban green spaces provide significant mental and physical health benefits.',
  },
]

const ACTIVITIES_RO: readonly DailyActivity[] = [
  {
    id: 'woke-up',
    time: '06:00',
    icon: '☀️',
    label: 'M-am trezit în siguranță',
    budgetCategory: 'Securitate',
    hiddenServices: [
      { id: 'police', icon: '👮', name: 'Patrulă de poliție', dailyCostRon: 1.3 },
      { id: 'lights', icon: '💡', name: 'Iluminat stradal', dailyCostRon: 0.4 },
      { id: 'emergency', icon: '🚨', name: 'Servicii de urgență (IGSU)', dailyCostRon: 0.7 },
    ],
    funFact: 'În timp ce dormeai, ~15.000 de polițiști erau de serviciu în toată România.',
  },
  {
    id: 'shower',
    time: '07:00',
    icon: '🚿',
    label: 'Am făcut duș',
    budgetCategory: 'Mediu',
    hiddenServices: [
      { id: 'water', icon: '💧', name: 'Infrastructură apă (Apele Române)', dailyCostRon: 0.6 },
      { id: 'treatment', icon: '🏭', name: 'Investiții apă și canalizare', dailyCostRon: 0.6 },
      { id: 'sewage', icon: '🔧', name: 'Protecția mediului', dailyCostRon: 0.4 },
    ],
    funFact: 'Folosești ~120L de apă tratată zilnic — o cadă plină!',
  },
  {
    id: 'commute',
    time: '08:00',
    icon: '🚗',
    label: 'Am făcut naveta',
    budgetCategory: 'Infrastructură',
    hiddenServices: [
      { id: 'roads', icon: '🛣️', name: 'Întreținere drumuri (CNAIR)', dailyCostRon: 0.4 },
      { id: 'traffic', icon: '🚦', name: 'Trafic și siguranță rutieră', dailyCostRon: 0.3 },
      { id: 'transport', icon: '🚌', name: 'Subvenții transport public', dailyCostRon: 0.7 },
    ],
    funFact: 'România are 86.847 km de drumuri publice — toate finanțate din bugetele publice.',
  },
  {
    id: 'work',
    time: '09:00',
    icon: '🏢',
    label: 'La serviciu',
    budgetCategory: 'Siguranță Publică',
    hiddenServices: [
      { id: 'fire', icon: '🧯', name: 'Siguranță la incendiu (ISU)', dailyCostRon: 0.7 },
      { id: 'telecom', icon: '📡', name: 'Reglementare telecom (ANCOM)', dailyCostRon: 0.06 },
      { id: 'labor', icon: '👷', name: 'Inspecția muncii', dailyCostRon: 0.1 },
    ],
    funFact: 'Clădirile comerciale peste anumite praguri necesită autorizație ISU pentru incendii.',
  },
  {
    id: 'lunch',
    time: '12:00',
    icon: '🍽️',
    label: 'Am luat prânzul',
    budgetCategory: 'Sănătate',
    hiddenServices: [
      { id: 'food-safety', icon: '🔬', name: 'Siguranță alimentară (ANSVSA)', dailyCostRon: 0.12 },
      { id: 'sanitation', icon: '🧹', name: 'Programe de sănătate publică', dailyCostRon: 0.12 },
      { id: 'health', icon: '🏥', name: 'Sistemul de sănătate (cota ta)', dailyCostRon: 11.7 },
    ],
    funFact: 'ANSVSA a efectuat 11.628 de inspecții alimentare doar în martie 2024.',
  },
  {
    id: 'park',
    time: '17:00',
    icon: '🌳',
    label: 'Plimbare în parc',
    budgetCategory: 'Servicii Locale',
    hiddenServices: [
      { id: 'parks', icon: '🌲', name: 'Întreținerea parcurilor', dailyCostRon: 0.4 },
      { id: 'waste', icon: '🗑️', name: 'Colectarea deșeurilor', dailyCostRon: 0.7 },
      { id: 'air', icon: '🌬️', name: 'Monitorizare calitate aer (ANPM)', dailyCostRon: 0.03 },
    ],
    funFact: 'Spațiile verzi urbane oferă beneficii semnificative pentru sănătatea fizică și mentală.',
  },
]

const ACTIVITIES_BY_LOCALE: Record<LearningLocale, readonly DailyActivity[]> = {
  en: ACTIVITIES_EN,
  ro: ACTIVITIES_RO,
}

// ═══════════════════════════════════════════════════════════════════
// STATE PERSISTENCE HOOK
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEY_PREFIX = 'budget-footprint-revealer'

function useRevealerState(componentId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}:${componentId}`

  const loadState = useCallback((): readonly string[] | null => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null
      const parsed = JSON.parse(stored) as { revealedIds: readonly string[] }
      return parsed.revealedIds
    } catch {
      return null
    }
  }, [storageKey])

  const saveState = useCallback(
    (revealedIds: Set<string>) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ revealedIds: Array.from(revealedIds) }))
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey]
  )

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Ignore storage errors
    }
  }, [storageKey])

  return { loadState, saveState, clearState }
}

// ═══════════════════════════════════════════════════════════════════
// ACTIVITY CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

type ActivityCardProps = {
  readonly activity: DailyActivity
  readonly isRevealed: boolean
  readonly isExpanded: boolean
  readonly onReveal: () => void
  readonly onToggle: () => void
}

function ActivityCard({ activity, isRevealed, isExpanded, onReveal, onToggle }: ActivityCardProps) {
  const totalCost = useMemo(
    () => activity.hiddenServices.reduce((sum, s) => sum + s.dailyCostRon, 0),
    [activity.hiddenServices]
  )

  const handleClick = () => {
    if (!isRevealed) {
      onReveal()
    } else {
      onToggle()
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer overflow-hidden transition-all duration-300',
        !isRevealed && 'hover:border-primary/50 hover:shadow-md',
        isRevealed && 'border-green-500/50 bg-green-500/5'
      )}
      onClick={handleClick}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-colors',
              !isRevealed && 'bg-muted',
              isRevealed && 'bg-green-500/20'
            )}
          >
            {activity.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{activity.time}</span>
              {isRevealed && <Check className="h-3.5 w-3.5 text-green-500" />}
            </div>
            <p className="truncate font-medium">{activity.label}</p>
          </div>
          {!isRevealed ? (
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              {t`Tap`}
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-green-600">+{totalCost.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">RON</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        {/* Expanded content */}
        {isRevealed && isExpanded && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 space-y-3 border-t border-border/50 pt-4 duration-300">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t`Hidden infrastructure you used`}
              </p>
              {activity.hiddenServices.map((service, index) => (
                <div
                  key={service.id}
                  className="flex animate-in items-center justify-between fade-in slide-in-from-left duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{service.icon}</span>
                    <span className="text-sm">{service.name}</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    +{service.dailyCostRon.toFixed(1)} RON
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t`Budget category`}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                {activity.budgetCategory}
              </span>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-300">{activity.funFact}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ANIMATED COUNTER COMPONENT
// ═══════════════════════════════════════════════════════════════════

type AnimatedCounterProps = {
  readonly value: number
  readonly duration?: number
}

function AnimatedCounter({ value, duration = 500 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <>{displayValue.toFixed(1)}</>
}

// ═══════════════════════════════════════════════════════════════════
// TOTAL DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════

// Total per-capita budget 2025: 39,680 RON/year = ~108 RON/day (source: Ministry of Finance)
const TOTAL_DAILY_BUDGET_RON = 108

const DISCLAIMER_TEXT = {
  en: `This is a selection of visible daily services. Romania's total public budget is ~${TOTAL_DAILY_BUDGET_RON} RON/day per person (39,680 RON/capita/year).`,
  ro: `Aceasta este o selecție de servicii zilnice vizibile. Bugetul public total al României este de ~${TOTAL_DAILY_BUDGET_RON} RON/zi per persoană (39.680 RON/capita/an).`,
} as const

type TotalDisplayProps = {
  readonly totalCost: number
  readonly onReset: () => void
  readonly locale: LearningLocale
}

function TotalDisplay({ totalCost, onReset, locale }: TotalDisplayProps) {

  return (
    <Card className="border-green-500/30 bg-gradient-to-b from-green-500/5 to-transparent">
      <CardContent className="relative p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onReset}
          title={t`Start over`}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            {t`Your daily budget footprint`}
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-extrabold tabular-nums text-green-600 sm:text-6xl dark:text-green-500">
              <AnimatedCounter value={totalCost} />
            </span>
            <span className="text-xl font-bold text-green-600/70 sm:text-2xl dark:text-green-500/70">
              RON / {t`day`}
            </span>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground/80 leading-relaxed">
          {DISCLAIMER_TEXT[locale]}
        </p>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function BudgetFootprintRevealer({
  activities: activitiesProp,
  componentId = 'default',
  locale = 'en',
}: BudgetFootprintRevealerProps) {
  // Use locale-specific default activities when no custom activities provided
  const activities = activitiesProp ?? ACTIVITIES_BY_LOCALE[locale]
  const { loadState, saveState, clearState } = useRevealerState(componentId)

  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => {
    const saved = loadState()
    return saved ? new Set(saved) : new Set()
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const revealedCount = revealedIds.size

  useEffect(() => {
    saveState(revealedIds)
  }, [revealedIds, saveState])

  const totalCost = useMemo(() => {
    let sum = 0
    for (const activity of activities) {
      if (revealedIds.has(activity.id)) {
        sum += activity.hiddenServices.reduce((s, svc) => s + svc.dailyCostRon, 0)
      }
    }
    return sum
  }, [activities, revealedIds])

  const handleReveal = useCallback((activityId: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev)
      next.add(activityId)
      return next
    })
    setExpandedId(activityId)
  }, [])

  const handleToggle = useCallback((activityId: string) => {
    setExpandedId((prev) => (prev === activityId ? null : activityId))
  }, [])

  const handleReset = useCallback(() => {
    setRevealedIds(new Set())
    setExpandedId(null)
    clearState()
  }, [clearState])

  return (
    <div className="my-8 space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isRevealed={revealedIds.has(activity.id)}
            isExpanded={expandedId === activity.id}
            onReveal={() => handleReveal(activity.id)}
            onToggle={() => handleToggle(activity.id)}
          />
        ))}
      </div>

      {revealedCount > 0 && <TotalDisplay totalCost={totalCost} onReset={handleReset} locale={locale} />}
    </div>
  )
}

// Export types and data for testing
export type { DailyActivity, HiddenService, BudgetFootprintRevealerProps }
export { ACTIVITIES_EN, ACTIVITIES_RO }
