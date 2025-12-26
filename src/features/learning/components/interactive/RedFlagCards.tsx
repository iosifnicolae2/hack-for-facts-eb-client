/**
 * RedFlagCards Component
 *
 * A simple list showing warning signs to watch for in budget rectifications.
 * Uses left border color coding for severity indication.
 *
 * @example
 * ```mdx
 * <RedFlagCards locale="en" />
 * ```
 */

import { t } from '@lingui/core/macro'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  AlertTriangle,
  Ban,
  Vote,
  Target,
  TrendingUp,
  CheckCircle,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LearningLocale } from '../../types'
import { RED_FLAGS_BY_LOCALE, type RedFlagItem } from './rectification-data'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

type RedFlagCardsProps = {
  readonly flags?: readonly RedFlagItem[]
  readonly locale?: LearningLocale
}

// ═══════════════════════════════════════════════════════════════════════════
// Icon Mapping
// ═══════════════════════════════════════════════════════════════════════════

const ICON_MAP: Record<RedFlagItem['icon'], LucideIcon> = {
  alert: AlertTriangle,
  bypass: Ban,
  election: Vote,
  target: Target,
  magnitude: TrendingUp,
  check: CheckCircle,
}

// ═══════════════════════════════════════════════════════════════════════════
// Single Item Component
// ═══════════════════════════════════════════════════════════════════════════

type FlagItemProps = {
  readonly flag: RedFlagItem
  readonly index: number
  readonly inView: boolean
}

function FlagItem({ flag, index, inView }: FlagItemProps) {
  const Icon = ICON_MAP[flag.icon]

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl p-4 border transition-all duration-200',
        'hover:shadow-md',
        flag.severity === 'green' 
          ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30' 
          : flag.severity === 'yellow'
            ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30'
            : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex items-start gap-4">
        {/* Icon Circle */}
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm',
          flag.severity === 'green' 
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : flag.severity === 'yellow'
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
        )}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-tight mb-1">
            {flag.title}
          </h4>

          {/* Description */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {flag.description}
          </p>

          {/* Example */}
          {flag.example && (
            <div className={cn(
              'mt-3 p-2.5 rounded-lg text-xs flex gap-2 items-start',
              flag.severity === 'green' 
                ? 'bg-emerald-100/50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' 
                : flag.severity === 'yellow'
                  ? 'bg-amber-100/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                  : 'bg-rose-100/50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
            )}>
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
              <span>
                <span className="font-semibold opacity-90">{t`Example:`}</span> {flag.example}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function RedFlagCards({ flags: flagsProp, locale = 'en' }: RedFlagCardsProps) {
  const flags = flagsProp ?? RED_FLAGS_BY_LOCALE[locale]
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  // Split into warning signs and normal cases
  const warningFlags = flags.filter((f) => f.severity === 'red' || f.severity === 'yellow')
  const normalFlags = flags.filter((f) => f.severity === 'green')

  return (
    <div ref={ref} className="my-8 space-y-8">
      {/* Warning Signs Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t`Warning Signs`}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {warningFlags.map((flag, index) => (
            <FlagItem key={flag.id} flag={flag} index={index} inView={inView} />
          ))}
        </div>
      </div>

      {/* Normal Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t`When Rectifications Are Normal`}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {normalFlags.map((flag, index) => (
            <FlagItem key={flag.id} flag={flag} index={warningFlags.length + index} inView={inView} />
          ))}
        </div>
      </div>
    </div>
  )
}

export type { RedFlagCardsProps }
