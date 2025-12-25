import { useMemo, useState, useEffect, useRef, type ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { t } from '@lingui/core/macro'
import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ExecutionCategory = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly executionRate: number
  readonly description: string
}

type ExecutionThresholds = {
  readonly excellent: number
  readonly good: number
  readonly concerning: number
}

type ExecutionRateChartProps = {
  readonly categories: readonly ExecutionCategory[]
  readonly thresholds?: ExecutionThresholds
  readonly title?: string
  readonly footer?: ReactNode
}

const DEFAULT_THRESHOLDS: ExecutionThresholds = {
  excellent: 95,
  good: 80,
  concerning: 60,
}

function getExecutionColor(rate: number, thresholds: ExecutionThresholds) {
  if (rate >= thresholds.excellent) {
    return {
      bar: 'bg-emerald-500',
      barGlow: 'shadow-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      emoji: '✓',
      showWarning: false,
    }
  }
  if (rate >= thresholds.good) {
    return {
      bar: 'bg-amber-500',
      barGlow: 'shadow-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800',
      emoji: '~',
      showWarning: false,
    }
  }
  if (rate >= thresholds.concerning) {
    return {
      bar: 'bg-orange-500',
      barGlow: 'shadow-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-orange-200 dark:border-orange-800',
      emoji: '!',
      showWarning: true,
    }
  }
  return {
    bar: 'bg-red-500',
    barGlow: 'shadow-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    emoji: '!!',
    showWarning: true,
  }
}

function AnimatedPercentage({ value, inView }: { value: number; inView: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!inView) {
      setDisplayValue(0)
      return
    }

    const duration = 800
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(eased * value))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, inView])

  return <span className="tabular-nums">{displayValue}</span>
}

function ExecutionBar({
  category,
  index,
  inView,
  thresholds,
}: {
  category: ExecutionCategory
  index: number
  inView: boolean
  thresholds: ExecutionThresholds
}) {
  const colors = getExecutionColor(category.executionRate, thresholds)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {t`Code`} {category.code}
          </span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {category.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {colors.showWarning && (
            <motion.div
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <AlertTriangle className={cn('w-4 h-4', colors.text)} />
            </motion.div>
          )}
          <span className={cn('text-xl font-black', colors.text)}>
            <AnimatedPercentage value={category.executionRate} inView={inView} />%
          </span>
        </div>
      </div>

      {/* Bar Container */}
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-lg shadow-lg',
            colors.bar,
            colors.barGlow
          )}
          initial={{ width: 0 }}
          animate={inView ? { width: `${category.executionRate}%` } : { width: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {category.description}
      </p>
    </motion.div>
  )
}

export function ExecutionRateChart({
  categories,
  thresholds = DEFAULT_THRESHOLDS,
  title,
  footer,
}: Readonly<ExecutionRateChartProps>) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  })

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => b.executionRate - a.executionRate),
    [categories]
  )

  return (
    <div ref={ref} className="w-full max-w-3xl mx-auto py-8">
      <Card className="p-6 md:p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-950 border-none shadow-sm relative overflow-hidden">
        {/* Header */}
        {title && (
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t`Excellent`} (≥{thresholds.excellent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t`Good`} (≥{thresholds.good}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t`Concerning`} (≥{thresholds.concerning}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t`Poor`} (&lt;{thresholds.concerning}%)
            </span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="space-y-6">
          {sortedCategories.map((category, index) => (
            <ExecutionBar
              key={category.id}
              category={category}
              index={index}
              inView={inView}
              thresholds={thresholds}
            />
          ))}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-10 pt-6 border-t border-zinc-100/50 dark:border-zinc-800/50 text-center">
            {footer}
          </div>
        )}

        {/* Decorative blur glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      </Card>
    </div>
  )
}
