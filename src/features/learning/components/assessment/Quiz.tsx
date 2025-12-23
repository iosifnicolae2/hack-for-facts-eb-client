import { useMemo, useState } from 'react'
import { t } from '@lingui/core/macro'
import { Check, RotateCcw, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useQuizInteraction } from '../../hooks/use-learning-interactions'

export type QuizOption = {
  readonly id: string
  readonly text: string
  readonly isCorrect: boolean
}

export type QuizProps = {
  readonly id: string
  readonly question: string
  readonly options: readonly QuizOption[]
  readonly explanation: string
  readonly contentId: string
}

export function Quiz({ id, question, options, explanation, contentId }: QuizProps) {
  const validOptions = useMemo(() => (Array.isArray(options) ? options : []), [options])

  const { selectedOptionId, isAnswered, isCorrect, answer, reset } = useQuizInteraction({
    contentId,
    quizId: id,
    options: validOptions,
    contentVersion: 'v1',
  })

  // Local state for "shaking" effect or temporary error states could go here
  const [isSaving, setIsSaving] = useState(false)

  const handleSelect = async (optionId: string) => {
    if (isAnswered || isSaving) return
    setIsSaving(true)
    try {
      await answer(optionId)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = () => void reset()

  if (validOptions.length === 0) {
    return (
      <Card className="my-8 border-destructive/20 bg-destructive/5 shadow-none">
        <CardContent className="p-6 text-center">
          <p className="text-sm font-medium text-destructive">{t`Quiz configuration error`}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="my-10 w-full max-w-2xl mx-auto shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h3 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-foreground mb-8">
            {question}
          </h3>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {validOptions.map((option, index) => {
              const isSelected = selectedOptionId === option.id
              const showAsCorrect = isAnswered && option.isCorrect
              const showAsIncorrect = isAnswered && isSelected && !option.isCorrect
              const isDimmed = isAnswered && !showAsCorrect && !showAsIncorrect

              return (
                <motion.button
                  key={`${id}-${option.id}`}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: isDimmed ? 0.5 : 1,
                    x: 0,
                    scale: isSelected ? 1.01 : 1
                  }}
                  whileHover={!isAnswered ? { scale: 1.01 } : {}}
                  whileTap={!isAnswered ? { scale: 0.99 } : {}}
                  onClick={() => void handleSelect(option.id)}
                  disabled={isAnswered || isSaving}
                  className={cn(
                    'relative group w-full text-left p-4 md:p-5 rounded-xl border transition-all duration-200 outline-none',
                    'flex items-center justify-between',
                    // Default clean state
                    !isAnswered && !isSelected && 'bg-card border-border hover:border-primary/50 hover:bg-muted/30',
                    // Selected state (pre-reveal or incorrect)
                    !isAnswered && isSelected && 'bg-primary/5 border-primary ring-1 ring-primary/20',
                    // Success State
                    showAsCorrect && 'bg-emerald-50 border-emerald-500/50 ring-1 ring-emerald-500/20 dark:bg-emerald-950/20',
                    // Error State
                    showAsIncorrect && 'bg-rose-50 border-rose-500/50 ring-1 ring-rose-500/20 dark:bg-rose-950/20',
                    // Dimmed state for unselected options
                    isDimmed && 'bg-muted/10 border-transparent grayscale-[0.5]',
                    isSaving && 'cursor-wait opacity-70'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300',
                        !isAnswered && !isSelected && 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                        isSelected && !isAnswered && 'bg-primary text-primary-foreground',
                        showAsCorrect && 'bg-emerald-500 text-white',
                        showAsIncorrect && 'bg-rose-500 text-white',
                        isDimmed && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {showAsCorrect ? <Check className="w-4 h-4" /> : showAsIncorrect ? <X className="w-4 h-4" /> : String.fromCharCode(65 + index)}
                    </div>
                    <span className={cn(
                      "text-base font-medium transition-colors",
                      showAsCorrect ? "text-emerald-900 dark:text-emerald-100" :
                        showAsIncorrect ? "text-rose-900 dark:text-rose-100" :
                          "text-foreground"
                    )}>
                      {option.text}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "mt-8 rounded-xl p-6 backdrop-blur-sm border",
                isCorrect
                  ? "bg-emerald-100/30 border-emerald-200/50 dark:bg-emerald-900/10 dark:border-emerald-800/30"
                  : "bg-amber-100/30 border-amber-200/50 dark:bg-amber-900/10 dark:border-amber-800/30"
              )}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-sm font-bold uppercase tracking-wider",
                      isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {isCorrect ? t`Correct` : t`Incorrect`}
                    </span>
                  </div>

                  <p className="text-foreground/90 leading-relaxed text-base">
                    {explanation}
                  </p>

                  {!isCorrect && (
                    <div className="mt-2 flex justify-start">
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="group border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
                      > 
                        <RotateCcw className="w-4 h-4 mr-2 group-hover:-rotate-180 transition-transform duration-500" />
                        {t`Try Again`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
