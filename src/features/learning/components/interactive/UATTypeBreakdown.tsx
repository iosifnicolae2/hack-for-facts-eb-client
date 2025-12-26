import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type Variants, useInView } from 'framer-motion'
import {
  Map,
  Building2,
  Home,
  Trees,
  ExternalLink,
  ChevronDown,
  X,
  MousePointerClick,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  UAT_COLORS,
  type UATCategory,
  type UATTypeBreakdownData,
  type UATTypeBreakdownText,
} from './uat-type-breakdown-data'

// ═══════════════════════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════════════════════

interface UATTypeBreakdownProps {
  readonly data: UATTypeBreakdownData
  readonly text: UATTypeBreakdownText
  readonly locale: 'en' | 'ro'
  readonly mapBaseUrl?: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  Map,
  Building2,
  Home,
  Trees,
}

// ═══════════════════════════════════════════════════════════════════════════
// Animation Variants
// ═══════════════════════════════════════════════════════════════════════════

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

const expandVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// AnimatedNumber Sub-component
// ═══════════════════════════════════════════════════════════════════════════

interface AnimatedNumberProps {
  readonly value: number
  readonly duration?: number
  readonly className?: string
}

function AnimatedNumber({ value, duration = 600, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(easeOut * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  return (
    <span ref={ref} className={className}>
      {displayValue.toLocaleString('ro-RO')}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// UATCard Sub-component
// ═══════════════════════════════════════════════════════════════════════════

interface UATCardProps {
  readonly category: UATCategory
  readonly locale: 'en' | 'ro'
  readonly isSelected: boolean
  readonly isDeemphasized: boolean
  readonly onClick: () => void
  readonly variant: 'wide' | 'compact'
}

function UATCard({
  category,
  locale,
  isSelected,
  isDeemphasized,
  onClick,
  variant,
}: UATCardProps) {
  const Icon = ICON_MAP[category.icon] || Map
  const colors = UAT_COLORS[category.color]
  const name = locale === 'ro' ? category.nameRo : category.name
  const description = locale === 'ro' ? category.descriptionRo : category.description

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'relative rounded-2xl border-2 transition-all cursor-pointer select-none overflow-hidden',
        colors.border,
        isSelected
          ? cn(colors.bg, 'ring-4 ring-offset-2 dark:ring-offset-zinc-950', colors.ring)
          : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/80',
        isDeemphasized && 'opacity-40 grayscale-[0.5] scale-[0.98]',
        variant === 'wide' ? 'p-6' : 'p-5'
      )}
      role="listitem"
      tabIndex={0}
      aria-expanded={isSelected}
      aria-label={`${name}: ${category.count} units`}
    >
      {variant === 'wide' ? (
        // Wide layout for Counties (Level 1)
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'w-14 h-14 flex items-center justify-center rounded-2xl shrink-0',
              colors.bgLight,
              colors.text
            )}
          >
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-1">
              <h4 className="text-2xl font-black tracking-tight">{name}</h4>
              <span className={cn('text-3xl font-black', colors.text)}>
                <AnimatedNumber value={category.count} />
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {description}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'w-6 h-6 transition-transform duration-300 text-zinc-400 shrink-0',
              isSelected && 'rotate-180'
            )}
          />
        </div>
      ) : (
        // Compact layout for Level 2 cards
        <div className="flex flex-col items-center text-center h-full">
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center rounded-xl mb-4',
              colors.bgLight,
              colors.text
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            {name}
          </h4>
          <div className={cn('text-4xl font-black mb-3', colors.text)}>
            <AnimatedNumber value={category.count} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-2 flex-1">
            {description}
          </p>
          {category.populationMin && (
            <Badge
              variant="secondary"
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold border-none',
                colors.accent,
                colors.text
              )}
            >
              {category.populationMin}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              'w-5 h-5 mt-3 transition-transform duration-300 text-zinc-300 dark:text-zinc-600',
              isSelected && 'rotate-180'
            )}
          />
        </div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DetailPanel Sub-component
// ═══════════════════════════════════════════════════════════════════════════

interface DetailPanelProps {
  readonly category: UATCategory
  readonly locale: 'en' | 'ro'
  readonly text: UATTypeBreakdownText
  readonly mapBaseUrl?: string
  readonly onClose: () => void
}

function DetailPanel({
  category,
  locale,
  text,
  mapBaseUrl,
  onClose,
}: DetailPanelProps) {
  const colors = UAT_COLORS[category.color]
  const name = locale === 'ro' ? category.nameRo : category.name

  return (
    <motion.div
      variants={expandVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="overflow-hidden"
    >
      <div
        className={cn(
          'relative rounded-2xl border-2 p-6 mt-4',
          colors.border,
          colors.bg
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-3 right-3 h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label={text.closeLabel}
        >
          <X className="w-4 h-4" />
        </Button>

        <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
          {text.examplesLabel}: {name}
        </h5>

        <div className="flex flex-wrap gap-2 mb-5">
          {category.examples.map((example, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white/60 dark:bg-zinc-800/60 border-none"
            >
              <span>{example.name}</span>
              {example.population && (
                <span className="ml-2 text-xs opacity-60">
                  {example.population}
                </span>
              )}
            </Badge>
          ))}
        </div>

        {mapBaseUrl && category.mapFilterParam && (
          <Button
            asChild
            className={cn(
              'rounded-full font-bold',
              colors.bar,
              '!text-white hover:opacity-90'
            )}
          >
            <a href={`${mapBaseUrl}?${category.mapFilterParam}`}>
              {text.viewMapLabel}
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function UATTypeBreakdown({
  data,
  text,
  locale,
  mapBaseUrl,
}: UATTypeBreakdownProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClose = useCallback(() => {
    setSelectedId(null)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto py-8 px-4"
      role="list"
      aria-label={text.title}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
          {text.title}
        </h2>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto">
          {text.subtitle}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="space-y-8"
      >
        {/* Level 1: Counties */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {text.level1Label}
            </span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <UATCard
            category={data.level1}
            locale={locale}
            isSelected={selectedId === data.level1.id}
            isDeemphasized={selectedId !== null && selectedId !== data.level1.id}
            onClick={() => handleSelect(data.level1.id)}
            variant="wide"
          />

          <AnimatePresence>
            {selectedId === data.level1.id && (
              <DetailPanel
                category={data.level1}
                locale={locale}
                text={text}
                mapBaseUrl={mapBaseUrl}
                onClose={handleClose}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Level 2: Municipalities, Towns, Communes */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {text.level2Label}
            </span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.level2.map((category) => (
              <div key={category.id} className="flex flex-col">
                <UATCard
                  category={category}
                  locale={locale}
                  isSelected={selectedId === category.id}
                  isDeemphasized={
                    selectedId !== null && selectedId !== category.id
                  }
                  onClick={() => handleSelect(category.id)}
                  variant="compact"
                />

                {/* Mobile: Detail panel directly under card */}
                <div className="md:hidden">
                  <AnimatePresence>
                    {selectedId === category.id && (
                      <DetailPanel
                        category={category}
                        locale={locale}
                        text={text}
                        mapBaseUrl={mapBaseUrl}
                        onClose={handleClose}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Detail panel below all cards */}
          <div className="hidden md:block">
            <AnimatePresence>
              {selectedId &&
                data.level2.find((c) => c.id === selectedId) && (
                  <DetailPanel
                    category={data.level2.find((c) => c.id === selectedId)!}
                    locale={locale}
                    text={text}
                    mapBaseUrl={mapBaseUrl}
                    onClose={handleClose}
                  />
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* Total count summary */}
        <motion.div
          variants={cardVariants}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <div className="h-px w-16 bg-zinc-200 dark:bg-zinc-800" />
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {text.totalLabel}
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              <AnimatedNumber value={data.totalCount} /> UAT
            </div>
          </div>
          <div className="h-px w-16 bg-zinc-200 dark:bg-zinc-800" />
        </motion.div>

        {/* Legal note */}
        <motion.p
          variants={cardVariants}
          className="text-center text-xs text-zinc-400 dark:text-zinc-500 italic"
        >
          {text.legalNoteLabel}
        </motion.p>

        {/* Hint text */}
        <AnimatePresence>
          {!selectedId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-zinc-400 dark:text-zinc-500"
            >
              <MousePointerClick className="w-4 h-4" />
              <span className="font-medium">{text.clickToExpand}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
