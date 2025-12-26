/**
 * RectificationFlow Component
 *
 * A simple visualization showing how a budget changes through rectifications
 * during a fiscal year. Shows all stages at once with clear bar comparisons.
 *
 * @example
 * ```mdx
 * <RectificationFlow locale="en" />
 * ```
 */

import { t } from '@lingui/core/macro'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowDown, ArrowUp, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LearningLocale } from '../../types'
import { FLOW_STAGES_BY_LOCALE, type RectificationStage } from './rectification-data'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

type RectificationFlowProps = {
  readonly stages?: readonly RectificationStage[]
  readonly locale?: LearningLocale
}

// ═══════════════════════════════════════════════════════════════════════════
// Budget Row Component
// ═══════════════════════════════════════════════════════════════════════════

type BudgetRowProps = {
  readonly stage: RectificationStage
  readonly maxAmount: number
  readonly index: number
  readonly inView: boolean
  readonly isLast: boolean
}

function BudgetRow({ stage, maxAmount, index, inView, isLast }: BudgetRowProps) {
  const widthPercent = (stage.amount / maxAmount) * 100
  const hasChange = stage.change !== undefined

  return (
    <motion.div
      className="relative pl-8 pb-8 last:pb-0"
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
    >
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />
      )}

      {/* Dot */}
      <div className={cn(
        "absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center z-10",
        hasChange
          ? stage.changeType === 'increase' ? "bg-emerald-400" : "bg-rose-400"
          : "bg-blue-400"
      )}>
        <div className="w-2 h-2 bg-white rounded-full opacity-50" />
      </div>

      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {stage.month}
            </span>
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              {stage.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {hasChange && (
              <span
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
                  stage.changeType === 'increase'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                )}
              >
                {stage.changeType === 'increase' ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {stage.change! > 0 ? '+' : ''}
                {stage.change}B
              </span>
            )}
            <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
              {stage.amount}B
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-3 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              hasChange
                ? stage.changeType === 'increase'
                  ? 'bg-emerald-400'
                  : 'bg-rose-400'
                : 'bg-blue-400'
            )}
            initial={{ width: 0 }}
            animate={inView ? { width: `${widthPercent}%` } : { width: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function RectificationFlow({ stages: stagesProp, locale = 'en' }: RectificationFlowProps) {
  const stages = stagesProp ?? FLOW_STAGES_BY_LOCALE[locale]
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  const maxAmount = Math.max(...stages.map((s) => s.amount))
  const firstAmount = stages[0].amount
  const lastAmount = stages[stages.length - 1].amount
  const totalChange = lastAmount - firstAmount

  return (
    <div ref={ref} className="my-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t`How Budgets Change`}
        </h3>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
          {t`Flow`}
        </span>
      </div>

      {/* Flow Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="pt-2">
          {stages.map((stage, index) => (
            <BudgetRow
              key={stage.id}
              stage={stage}
              maxAmount={maxAmount}
              index={index}
              inView={inView}
              isLast={index === stages.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{t`Original:`} <span className="font-semibold text-zinc-700 dark:text-zinc-200">{firstAmount}B</span></span>
          <ArrowRight className="w-4 h-4 text-zinc-300" />
          <span>{t`Final:`} <span className="font-semibold text-zinc-700 dark:text-zinc-200">{lastAmount}B</span></span>
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

        <div className="text-sm font-medium">
          {totalChange < 0 ? (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md">
              <ArrowDown className="w-4 h-4" />
              {Math.abs(totalChange)}B {t`decrease`}
            </span>
          ) : totalChange > 0 ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
              <ArrowUp className="w-4 h-4" />
              +{totalChange}B {t`increase`}
            </span>
          ) : (
            <span className="text-zinc-400">{t`No change`}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export type { RectificationFlowProps }
