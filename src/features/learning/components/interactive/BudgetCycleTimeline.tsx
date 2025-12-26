/**
 * BudgetCycleTimeline Component
 *
 * A Gantt-style visualization of the Romanian budget cycle showing when each
 * phase occurs throughout the year. Features a live countdown to the November 15
 * budget submission deadline and an expandable info panel for each phase.
 *
 * Features:
 * - 12-month grid with phase bars
 * - Current date indicator with pulse animation
 * - Live countdown to November 15
 * - Click phases to show detailed info panel
 * - Contextual header based on selected phase
 * - Keyboard accessible
 * - Dark mode support
 * - Mobile responsive (vertical layout)
 *
 * @example
 * ```mdx
 * <BudgetCycleTimeline
 *   phases={budgetPhases}
 *   phaseLabels={phaseLabels}
 *   text={timelineText}
 *   content={phaseContent}
 * />
 * ```
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Calendar, Star, ChevronRight, ChevronDown, X, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  BUDGET_PHASES,
  OPPORTUNITY_COLORS,
  getPhaseIcon,
  getDaysUntilBudgetSeason,
  getCurrentPhase,
  isBudgetSeason,
  type BudgetPhaseDefinition,
  type BudgetPhaseId,
} from './budget-cycle-data'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

type PhaseLabel = {
  readonly name: string
  readonly timing: string
}

type PhaseKeyDeadline = {
  readonly date: string
  readonly description: string
}

type PhaseContent = {
  readonly name: string
  readonly timing: string
  readonly description: string
  readonly keyActivities: readonly string[]
  readonly citizenOpportunities: readonly string[]
  readonly keyDeadlines: readonly PhaseKeyDeadline[]
}

type BudgetCycleTimelineText = {
  readonly title?: string
  readonly subtitle?: string
  readonly countdownLabel?: string
  readonly currentPhaseLabel?: string
  readonly budgetSeasonLabel?: string
  readonly deadlinePassedLabel?: string
  readonly activitiesLabel?: string
  readonly opportunitiesLabel?: string
  readonly deadlinesLabel?: string
  readonly viewingPhaseLabel?: string
  readonly clickToExploreLabel?: string
}

type BudgetCycleTimelineProps = {
  readonly phases?: readonly BudgetPhaseDefinition[]
  readonly phaseLabels: Readonly<Record<BudgetPhaseId, PhaseLabel>>
  readonly content?: Readonly<Record<BudgetPhaseId, PhaseContent>>
  readonly text?: BudgetCycleTimelineText
  readonly onPhaseClick?: (phaseId: BudgetPhaseId) => void
}

// ═══════════════════════════════════════════════════════════════════════════
// Month Labels
// ═══════════════════════════════════════════════════════════════════════════

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] as const

// ═══════════════════════════════════════════════════════════════════════════
// Countdown Component
// ═══════════════════════════════════════════════════════════════════════════

type CountdownProps = {
  readonly days: number
  readonly label?: string
  readonly deadlinePassedLabel?: string
}

function Countdown({ days, label, deadlinePassedLabel }: CountdownProps) {
  const springValue = useSpring(0, { stiffness: 100, damping: 30 })
  const displayValue = useTransform(springValue, (v) => Math.round(v))

  useEffect(() => {
    springValue.set(days)
  }, [days, springValue])

  const isUrgent = days <= 30 && days > 0
  const isPassed = days <= 0

  if (isPassed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800">
        <span className="text-sm font-bold">
          {deadlinePassedLabel ?? t`Budget submitted for ${new Date().getFullYear()}`}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative group overflow-hidden',
        'flex flex-col justify-center px-6 py-3 rounded-2xl transition-all min-w-[140px] text-center',
        isUrgent
          ? 'bg-amber-50 dark:bg-amber-950/30 ring-1 ring-amber-200 dark:ring-amber-800 shadow-lg shadow-amber-500/10'
          : 'bg-zinc-100 dark:bg-zinc-800/50 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-sm'
      )}
    >
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        isUrgent
          ? "bg-linear-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0"
          : "bg-linear-to-r from-zinc-500/0 via-zinc-500/5 to-zinc-500/0"
      )} />

      <div className="flex items-baseline justify-center gap-1.5 relative z-10">
        <motion.span
          className={cn(
            'text-4xl font-black tabular-nums tracking-tighter leading-none',
            isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100'
          )}
        >
          {displayValue}
        </motion.span>
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wider mb-1',
            isUrgent ? 'text-amber-600/80 dark:text-amber-400/80' : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          {label ? label.split(' ')[0] : t`days`}
        </span>
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest relative z-10",
        isUrgent ? "text-amber-600/60 dark:text-amber-400/60" : "text-zinc-400 dark:text-zinc-500"
      )}>
        {t`Until Nov 15`}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Current Date Indicator
// ═══════════════════════════════════════════════════════════════════════════

type CurrentDateIndicatorProps = {
  readonly date: Date
}

function CurrentDateIndicator({ date }: CurrentDateIndicatorProps) {
  // Calculate precise position based on day of month
  const monthIndex = date.getMonth() // 0-11
  const day = date.getDate()
  const daysInMonth = new Date(date.getFullYear(), monthIndex + 1, 0).getDate()
  
  // Calculate percentage: (completed months + current month progress) / 12
  const monthProgress = (day - 1) / daysInMonth
  
  // Standard grid assumes month starts at i/12.
  // So Jan 1 is at 0. Jan 15 is at 0.5/12.
  // The previous logic ((month - 1) / 12) * 100 + 100 / 24 centered it in the column.
  // Let's align it exactly to the time.
  // Month start: (monthIndex / 12) * 100
  // Month width: 100 / 12
  // Position = Start + (Progress * Width)
  const exactLeftPercent = ((monthIndex + monthProgress) / 12) * 100

  return (
    <div
      className="absolute top-0 bottom-0 z-20 pointer-events-none"
      style={{ left: `${exactLeftPercent}%` }}
    >
      {/* Scanline effect - thinner and more subtle */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-red-500/60 to-transparent dark:via-red-400/60" />
      
      {/* Glow - slightly wider but softer */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[8px] bg-red-500/10 blur-xs" />

      {/* Header Pill - moved up slightly to clear month labels and refined */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="px-2 py-0.5 rounded-md bg-red-500/90 dark:bg-red-500/90 text-[10px] font-black uppercase text-white shadow-lg shadow-red-500/20 tracking-widest backdrop-blur-sm border border-red-400/50">
          Now
        </div>
        <div className="w-px h-6 bg-linear-to-b from-red-500/50 to-transparent" />
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase Bar
// ═══════════════════════════════════════════════════════════════════════════

type PhaseBarProps = {
  readonly phase: BudgetPhaseDefinition
  readonly label: PhaseLabel
  readonly isSelected: boolean
  readonly isCurrent: boolean
  readonly onClick: () => void
  readonly animationDelay: number
}

function PhaseBar({ phase, label, isSelected, isCurrent, onClick, animationDelay }: PhaseBarProps) {
  const Icon = getPhaseIcon(phase.icon)
  const colors = OPPORTUNITY_COLORS[phase.opportunity]
  const isHighOpportunity = phase.opportunity === 'high'

  // Calculate bar position and width
  const startPercent = ((phase.startMonth - 1) / 12) * 100
  let widthPercent: number

  if (phase.endMonth >= phase.startMonth) {
    widthPercent = ((phase.endMonth - phase.startMonth + 1) / 12) * 100
  } else {
    // Year wrap
    widthPercent = ((12 - phase.startMonth + 1 + phase.endMonth) / 12) * 100
  }

  // Special case for full-year phases (Execution, Reporting)
  const isFullYear = phase.startMonth === 1 && phase.endMonth === 12

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    },
    [onClick]
  )

  return (
    <motion.div
      className="relative h-14 flex items-center group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: animationDelay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Phase label (left side) */}
      <div className="absolute right-full pr-4 flex flex-col items-end justify-center h-full">
        <span className={cn(
          "text-sm font-bold transition-colors duration-200",
          isSelected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
        )}>
          {label.name}
        </span>
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide hidden md:inline">
          {label.timing}
        </span>
      </div>

      {/* Bar container (full width for positioning) */}
      <div className="relative w-full h-full">
          {/* The actual bar */}
        <motion.button
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-10 rounded-xl cursor-pointer transition-all duration-300',
            'flex items-center justify-center gap-2 px-3 shadow-sm',
            colors.bgSolid,
            isSelected 
              ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 shadow-md scale-[1.02]' 
              : 'hover:scale-[1.01] hover:shadow-md opacity-90 hover:opacity-100',
            isSelected && (isHighOpportunity ? 'ring-amber-200 dark:ring-amber-800' : 'ring-blue-200 dark:ring-blue-800'),
            isHighOpportunity && !isSelected && 'shadow-amber-500/20',
            isCurrent && !isSelected && 'ring-2 ring-red-400/30',
            // Special styling for full-year execution bar to make it less monolithic
            isFullYear && 'bg-linear-to-r from-blue-500 via-blue-400 to-blue-500 bg-size-[200%_100%] animate-[shimmer_8s_infinite_linear]'
          )}
          style={{
            left: `${startPercent}%`,
            width: `${widthPercent}%`,
            minWidth: '3.5rem',
            zIndex: isSelected ? 10 : 1
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          aria-pressed={isSelected}
          aria-label={`${label.name}: ${label.timing}`}
          onClick={onClick}
          onKeyDown={handleKeyDown}
        >
          <div className={cn(
            "p-1 rounded-lg bg-white/20 backdrop-blur-sm",
            isSelected && "bg-white/30"
          )}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          
          {isHighOpportunity && <Star className="w-3.5 h-3.5 text-amber-200 fill-current animate-pulse" />}
          
          <span className={cn(
            "text-xs font-bold text-white tracking-tight",
            !isFullYear && "hidden lg:inline",
            isFullYear && "inline"
          )}>
            {label.name}
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Mobile Phase Card (for vertical layout)
// ═══════════════════════════════════════════════════════════════════════════

type MobilePhaseCardProps = {
  readonly phase: BudgetPhaseDefinition
  readonly label: PhaseLabel
  readonly isSelected: boolean
  readonly isCurrent: boolean
  readonly onClick: () => void
}

function MobilePhaseCard({ phase, label, isSelected, isCurrent, onClick }: MobilePhaseCardProps) {
  const Icon = getPhaseIcon(phase.icon)
  const colors = OPPORTUNITY_COLORS[phase.opportunity]
  const isHighOpportunity = phase.opportunity === 'high'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
        'border border-zinc-200 dark:border-zinc-800',
        isSelected && 'ring-2',
        isSelected && (isHighOpportunity ? 'ring-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20'),
        isCurrent && !isSelected && 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
      )}
    >
      <div
        className={cn(
          'shrink-0 p-2 rounded-lg',
          colors.bgSolid
        )}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{label.name}</span>
          {isHighOpportunity && <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />}
          {isCurrent && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 shrink-0">
              <Trans>Now</Trans>
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label.timing}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Phase Info Panel
// ═══════════════════════════════════════════════════════════════════════════

type PhaseInfoPanelProps = {
  readonly phase: BudgetPhaseDefinition
  readonly content: PhaseContent
  readonly label: PhaseLabel
  readonly onClose: () => void
  readonly text?: BudgetCycleTimelineText
}

function PhaseInfoPanel({ phase, content, label, onClose, text }: PhaseInfoPanelProps) {
  const Icon = getPhaseIcon(phase.icon)
  const colors = OPPORTUNITY_COLORS[phase.opportunity]
  const isHighOpportunity = phase.opportunity === 'high'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div
        className={cn(
          'p-6 md:p-8 rounded-3xl border mt-6 relative overflow-hidden',
          isHighOpportunity
            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
            : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
        )}
      >
        {/* Background blobs for depth */}
        <div className={cn(
          "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50",
          isHighOpportunity ? "bg-amber-500/10" : "bg-blue-500/5"
        )} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'shrink-0 p-3.5 rounded-2xl shadow-sm',
                colors.bgSolid,
                isHighOpportunity && 'ring-4 ring-amber-100 dark:ring-amber-900/30'
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {label.name}
                </h4>
                {isHighOpportunity && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800/50">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <Trans>High Impact</Trans>
                  </span>
                )}
              </div>
              <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium">{label.timing}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Description */}
        <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 mb-8 leading-relaxed max-w-3xl relative z-10">
          {content.description}
        </p>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-3 relative z-10">
          {/* Key Activities */}
          <div className="space-y-3">
            <h5 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {text?.activitiesLabel ?? t`Key Activities`}
            </h5>
            <ul className="space-y-2.5">
              {content.keyActivities.map((activity, i) => (
                <li
                  key={i}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-start gap-2.5 leading-snug"
                >
                  <span className="shrink-0 w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-2" />
                  {activity}
                </li>
              ))}
            </ul>
          </div>

          {/* Citizen Opportunities */}
          <div className="space-y-3">
            <h5 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <div className={cn("w-1.5 h-1.5 rounded-full", isHighOpportunity ? "bg-amber-500" : "bg-zinc-400")} />
              {text?.opportunitiesLabel ?? t`Your Opportunity`}
            </h5>
            <ul className="space-y-2.5">
              {content.citizenOpportunities.map((opportunity, i) => (
                <li
                  key={i}
                  className={cn(
                    'text-sm font-medium flex items-start gap-2.5 leading-snug',
                    isHighOpportunity
                      ? 'text-amber-800 dark:text-amber-200'
                      : 'text-zinc-600 dark:text-zinc-300'
                  )}
                >
                  <CheckCircle2 className={cn(
                    "shrink-0 w-4 h-4 mt-0.5",
                    isHighOpportunity ? "text-amber-500" : "text-zinc-400"
                  )} />
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Deadlines */}
          <div className="space-y-3">
            <h5 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {text?.deadlinesLabel ?? t`Key Deadlines`}
            </h5>
            <ul className="space-y-2.5">
              {content.keyDeadlines.map((deadline, i) => (
                <li key={i} className="text-sm flex items-start gap-2.5 leading-snug group">
                  <span
                    className={cn(
                      'shrink-0 px-2 py-0.5 rounded-md font-mono font-bold text-xs',
                      isHighOpportunity
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/60 transition-colors'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors'
                    )}
                  >
                    {deadline.date}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium pt-0.5">{deadline.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function BudgetCycleTimeline({
  phases = BUDGET_PHASES,
  phaseLabels,
  content,
  text,
  onPhaseClick,
}: BudgetCycleTimelineProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const currentPhaseId = useMemo(() => getCurrentPhase(currentDate), [currentDate])
  // Default to current phase if content is provided
  const [selectedPhase, setSelectedPhase] = useState<BudgetPhaseId | null>(
    content ? currentPhaseId : null
  )
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  // Update current date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const currentMonth = currentDate.getMonth() + 1
  const daysUntilBudgetSeason = useMemo(() => getDaysUntilBudgetSeason(currentDate), [currentDate])
  const inBudgetSeason = useMemo(() => isBudgetSeason(currentDate), [currentDate])

  // Get selected phase data
  const selectedPhaseData = useMemo(
    () => (selectedPhase ? phases.find((p) => p.id === selectedPhase) : null),
    [phases, selectedPhase]
  )
  const selectedPhaseContent = selectedPhase && content ? content[selectedPhase] : null

  const handlePhaseClick = useCallback(
    (phaseId: BudgetPhaseId) => {
      setSelectedPhase(phaseId)
      onPhaseClick?.(phaseId)
    },
    [onPhaseClick]
  )

  const handleClosePanel = useCallback(() => {
    setSelectedPhase(null)
  }, [])

  // Filter phases for the Gantt chart (exclude Audit which is next year)
  const ganttPhases = useMemo(
    () => phases.filter((p) => p.id !== 'audit' && p.id !== 'reporting'),
    [phases]
  )

  return (
    <Card
      ref={ref}
      className={cn(
        'my-8 p-6 md:p-8 rounded-[2.5rem] overflow-hidden relative border-0 shadow-xl',
        'bg-white dark:bg-zinc-950',
        inBudgetSeason && 'ring-4 ring-amber-300/30 dark:ring-amber-500/20'
      )}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-zinc-100/50 dark:bg-grid-zinc-900/50 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />


      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {text?.title ?? t`Budget Cycle Timeline`}
            </h3>
            {selectedPhase && content ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5" />
                {text?.viewingPhaseLabel ?? t`Viewing:`}{' '}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {phaseLabels[selectedPhase].name}
                </span>
              </p>
            ) : text?.subtitle ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{text.subtitle}</p>
            ) : content ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {text?.clickToExploreLabel ?? t`Click a phase to explore details`}
              </p>
            ) : null}
          </div>

          <Countdown
            days={daysUntilBudgetSeason}
            label={text?.countdownLabel}
            deadlinePassedLabel={text?.deadlinePassedLabel}
          />
        </div>

        {/* Current Phase Indicator */}
        {inBudgetSeason && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          >
            <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {text?.budgetSeasonLabel ?? t`It's budget season! November-December is the best time for citizen engagement.`}
            </span>
          </motion.div>
        )}

        {/* Desktop: Gantt Chart */}
        <div className="hidden md:block">
          {/* Month labels */}
          <div className="flex ml-40 mb-2 relative">
            {MONTH_LABELS.map((label, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 text-xs font-medium pl-2', // Align to start of column (grid line)
                  i + 1 === currentMonth
                    ? 'text-red-500 dark:text-red-400 font-bold'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="relative ml-40">
            {/* Grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {MONTH_LABELS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 border-l',
                    i + 1 === currentMonth
                      ? 'border-red-200 dark:border-red-800'
                      : 'border-zinc-100 dark:border-zinc-800'
                  )}
                />
              ))}
              <div className="border-l border-zinc-100 dark:border-zinc-800" />
            </div>

            {/* Current date indicator */}
            {inView && <CurrentDateIndicator date={currentDate} />}

            {/* Phase bars */}
            <div className="relative space-y-2 py-2">
              {ganttPhases.map((phase, index) => (
                <PhaseBar
                  key={phase.id}
                  phase={phase}
                  label={phaseLabels[phase.id]}
                  isSelected={selectedPhase === phase.id}
                  isCurrent={currentPhaseId === phase.id}
                  onClick={() => handlePhaseClick(phase.id)}
                  animationDelay={inView ? index * 0.1 : 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Cards */}
        <div className="md:hidden space-y-2">
          {phases.map((phase) => (
            <MobilePhaseCard
              key={phase.id}
              phase={phase}
              label={phaseLabels[phase.id]}
              isSelected={selectedPhase === phase.id}
              isCurrent={currentPhaseId === phase.id}
              onClick={() => handlePhaseClick(phase.id)}
            />
          ))}
        </div>

        {/* Phase Info Panel */}
        <AnimatePresence mode="wait">
          {selectedPhaseData && selectedPhaseContent && selectedPhase && (
            <PhaseInfoPanel
              key={selectedPhase}
              phase={selectedPhaseData}
              content={selectedPhaseContent}
              label={phaseLabels[selectedPhase]}
              onClose={handleClosePanel}
              text={text}
            />
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>{text?.currentPhaseLabel ?? t`Current date`}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span><Trans>High opportunity</Trans></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span><Trans>Medium opportunity</Trans></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-zinc-400" />
            <span><Trans>Low opportunity</Trans></span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export type { BudgetCycleTimelineProps, BudgetCycleTimelineText, PhaseLabel, PhaseContent, PhaseKeyDeadline }
