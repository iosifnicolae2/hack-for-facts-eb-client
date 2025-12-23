import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { t } from '@lingui/core/macro'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type FlashCardSize = 'sm' | 'md' | 'lg'

type FlashCardProps = {
  readonly id: string
  readonly icon: string
  readonly title: string
  readonly frontText: string
  readonly backText: string
}

type FlashCardDeckProps = {
  readonly children: ReactNode
  readonly componentId?: string
  readonly title?: string
  readonly completionMessage?: string
  readonly layout?: 'grid' | 'column'
  readonly showProgress?: boolean
  readonly size?: FlashCardSize
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT FOR DECK STATE
// ═══════════════════════════════════════════════════════════════════

type DeckContextValue = {
  readonly flippedIds: Set<string>
  readonly toggleCard: (id: string) => void
  readonly size: FlashCardSize
}

const DeckContext = createContext<DeckContextValue | null>(null)

function useDeckContext() {
  const context = useContext(DeckContext)
  if (!context) {
    throw new Error('FlashCard must be used within a FlashCardDeck')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════
// STATE PERSISTENCE HOOK
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEY_PREFIX = 'flash-card-deck'

function useDeckState(componentId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}:${componentId}`

  const loadState = useCallback((): readonly string[] | null => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null
      const parsed = JSON.parse(stored) as { flippedIds: readonly string[] }
      return parsed.flippedIds
    } catch {
      return null
    }
  }, [storageKey])

  const saveState = useCallback(
    (flippedIds: Set<string>) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ flippedIds: Array.from(flippedIds) }))
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
// FLASH CARD COMPONENT (3D Flip)
// ═══════════════════════════════════════════════════════════════════

export function FlashCard({ id, icon, title, frontText, backText }: FlashCardProps) {
  const { flippedIds, toggleCard, size } = useDeckContext()
  const isFlipped = flippedIds.has(id)

  const handleClick = useCallback(() => {
    toggleCard(id)
  }, [id, toggleCard])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleCard(id)
      }
    },
    [id, toggleCard]
  )

  // Size configurations
  const heightClass = {
    sm: 'h-72',
    md: 'h-96',
    lg: 'h-[30rem]',
  }[size]

  const iconSizeClass = {
    sm: 'text-4xl',
    md: 'text-5xl',
    lg: 'text-6xl',
  }[size]

  const titleSizeClass = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size]

  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size]

  const backTextSizeClass = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size]

  return (
    <div
      className="group cursor-pointer w-full"
      style={{ perspective: '1200px' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-pressed={isFlipped}
      tabIndex={0}
    >
      <div
        className={cn(
          'relative w-full transition-transform duration-500 ease-out',
          heightClass
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ══════════════ FRONT SIDE ══════════════ */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
            {/* Modern glassmorphism decorative elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

            <CardContent className="h-full flex flex-col items-center justify-top px-2 py-16 text-center relative z-10">
              {/* Icon with modern glow */}
              <div className="relative mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 blur-xl bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full" />
                <span className={cn('relative drop-shadow-sm', iconSizeClass)}>{icon}</span>
              </div>

              {/* Title */}
              <h3 className={cn('font-bold text-slate-800 dark:text-slate-100 mb-4', titleSizeClass)}>
                {title}
              </h3>

              {/* Front text */}
              <p className={cn('text-slate-600 dark:text-slate-300 leading-relaxed max-w-[95%]', textSizeClass)}>
                {frontText}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ══════════════ BACK SIDE ══════════════ */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 overflow-hidden ring-1 ring-white/10">
            <CardContent className="h-full flex flex-col items-center justify-center  px-2 py-16 text-center relative z-10">
              {/* Back text - Centered and larger for readability */}
              <div className="max-w-[95%]">
                <p className={cn('text-white leading-relaxed font-medium', backTextSizeClass)}>
                  {backText}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PROGRESS INDICATOR COMPONENT
// ═══════════════════════════════════════════════════════════════════

type ProgressIndicatorProps = {
  readonly current: number
  readonly total: number
}

function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const isComplete = current === total
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isComplete
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Text */}
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-500 dark:text-slate-400">
          {current}/{total} {t`explored`}
        </span>
        {isComplete && (
          <span className="text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-right-2">
            ✓ {t`Complete!`}
          </span>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FLASH CARD DECK COMPONENT (Container)
// ═══════════════════════════════════════════════════════════════════

export function FlashCardDeck({
  children,
  componentId = 'default',
  title,
  completionMessage,
  layout = 'grid',
  showProgress = true,
  size = 'md',
}: FlashCardDeckProps) {
  const { loadState, saveState, clearState } = useDeckState(componentId)

  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => {
    const saved = loadState()
    return saved ? new Set(saved) : new Set()
  })

  // Count total cards from children
  const totalCards = useMemo(() => {
    let count = 0
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === FlashCard) {
        count++
      }
    })
    return count
  }, [children])

  const flippedCount = flippedIds.size
  const isComplete = flippedCount === totalCards && totalCards > 0

  useEffect(() => {
    saveState(flippedIds)
  }, [flippedIds, saveState])

  const toggleCard = useCallback((cardId: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setFlippedIds(new Set())
    clearState()
  }, [clearState])

  const contextValue = useMemo(
    () => ({ flippedIds, toggleCard, size }),
    [flippedIds, toggleCard, size]
  )

  const layoutClasses = {
    column: 'flex flex-col gap-6',
    grid: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <DeckContext.Provider value={contextValue}>
      <div className="my-8 space-y-6">
        {/* Header */}
        {(title) && (
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h3>
            )}
            {flippedCount > 0 && (
              <Button
                variant="ghost"
                aria-label={t`Start over`}
                size="sm"
                onClick={handleReset}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* Cards */}
        <div className={layoutClasses[layout]}>{children}</div>

        {/* Progress indicator */}
        {showProgress && <ProgressIndicator current={flippedCount} total={totalCards} />}

        {/* Completion message */}
        {showProgress && isComplete && completionMessage && (
          <Card className="border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                🎉 {completionMessage}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DeckContext.Provider>
  )
}

// Export types for MDX usage
export type { FlashCardProps, FlashCardDeckProps, FlashCardSize }
