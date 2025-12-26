/**
 * RectificationHistory Component
 *
 * A simple table showing Romania's budget rectification patterns from 2020-2024
 * with expandable details for each year.
 *
 * @example
 * ```mdx
 * <RectificationHistory locale="en" />
 * ```
 */

import { useState, useCallback } from 'react'
import { t } from '@lingui/core/macro'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown, Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LearningLocale } from '../../types'
import {
  HISTORY_DATA_BY_LOCALE,
  STATUS_COLORS,
  type YearRectification,
  type StatusLevel,
} from './rectification-data'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

type RectificationHistoryProps = {
  readonly data?: readonly YearRectification[]
  readonly locale?: LearningLocale
}

// ═══════════════════════════════════════════════════════════════════════════
// Deficit Bar Component
// ═══════════════════════════════════════════════════════════════════════════

function DeficitBar({ percent, status }: { percent: number; status: StatusLevel }) {
  const maxPercent = 10
  const widthPercent = Math.min((percent / maxPercent) * 100, 100)
  const colors = STATUS_COLORS[status]

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-end">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
          {t`Deficit`}
        </span>
        <span className={cn('text-xs font-bold tabular-nums', colors.text)}>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colors.dot)}
          initial={{ width: 0 }}
          animate={{ width: `${widthPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Status Badge Component
// ═══════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: StatusLevel }) {
  const colors = STATUS_COLORS[status]
  
  return (
    <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', colors.dot)} />
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Year Row Component
// ═══════════════════════════════════════════════════════════════════════════

type YearRowProps = {
  readonly data: YearRectification
  readonly isExpanded: boolean
  readonly onToggle: () => void
  readonly index: number
  readonly inView: boolean
}

function YearRow({ data, isExpanded, onToggle, index, inView }: YearRowProps) {
  return (
    <motion.div
      className={cn(
        'group rounded-xl overflow-hidden border transition-all duration-200',
        isExpanded 
          ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800' 
          : 'bg-white/50 dark:bg-zinc-900/30 border-transparent hover:bg-white hover:border-zinc-200 dark:hover:bg-zinc-900 dark:hover:border-zinc-800'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Main Row */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex flex-col sm:flex-row sm:items-center gap-4 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-3 min-w-[100px]">
            <StatusBadge status={data.status} />
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
              {data.year}
            </span>
          </div>
          
          {/* Mobile Expand Icon */}
          <div className="sm:hidden">
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            </motion.div>
          </div>
        </div>

        {/* Rectification Count */}
        <div className="flex items-center gap-2 sm:w-32">
          <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {data.rectificationCount === 0 ? t`No rectifications` : t`${data.rectificationCount} rectifications`}
          </span>
        </div>

        {/* Context */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate font-medium">
            {data.context}
          </p>
        </div>

        {/* Deficit */}
        <div className="w-full sm:w-32 mt-2 sm:mt-0">
          <DeficitBar percent={data.deficitPercent} status={data.status} />
        </div>

        {/* Desktop Expand Icon */}
        <div className="hidden sm:block pl-2">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                {/* Mobile context */}
                <p className="sm:hidden text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  {data.context}
                </p>

                {/* Details */}
                {data.details && data.details.length > 0 ? (
                  <div className="grid gap-3">
                    {data.details.map((detail, i) => (
                      <div
                        key={i}
                        className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-700 py-1"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            <Calendar className="w-3 h-3" />
                            {detail.date}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 dark:text-zinc-500">
                            <FileText className="w-3 h-3" />
                            {detail.reference}
                          </div>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {detail.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">{t`No detailed records available.`}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function RectificationHistory({ data: dataProp, locale = 'en' }: RectificationHistoryProps) {
  const data = dataProp ?? HISTORY_DATA_BY_LOCALE[locale]
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const handleToggle = useCallback((year: number) => {
    setExpandedYear((prev) => (prev === year ? null : year))
  }, [])

  return (
    <div ref={ref} className="my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t`Rectification History (2020-2024)`}
        </h3>
        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
          {t`Interactive`}
        </span>
      </div>

      {/* Year Rows */}
      <div className="space-y-2">
        {data.map((yearData, index) => (
          <YearRow
            key={yearData.year}
            data={yearData}
            isExpanded={expandedYear === yearData.year}
            onToggle={() => handleToggle(yearData.year)}
            index={index}
            inView={inView}
          />
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 text-center">
        {t`Note: Romania has been under EU Excessive Deficit Procedure since 2020`}
      </div>
    </div>
  )
}

export type { RectificationHistoryProps }
