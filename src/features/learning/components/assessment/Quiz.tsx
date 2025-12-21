import { useMemo, useState } from 'react'
import { t } from '@lingui/core/macro'
import { Check, HelpCircle, Lightbulb, RotateCcw, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  // Guard against missing or invalid options - must be defined early
  const validOptions = useMemo(() => (Array.isArray(options) ? options : []), [options])

  const { selectedOptionId, isAnswered, isCorrect, answer, reset } = useQuizInteraction({
    contentId,
    quizId: id,
    options: validOptions,
    contentVersion: 'v1',
  })

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
      <Card className="my-6 border-destructive/50 bg-destructive/5">
        <CardContent className="p-6">
          <p className="text-sm text-destructive">{t`Quiz error: No options provided`}</p>
          <pre className="text-xs mt-2 p-2 bg-muted rounded">{JSON.stringify({ id, options }, null, 2)}</pre>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'my-8 overflow-hidden transition-all duration-500',
        !isAnswered && 'border-primary/30 bg-gradient-to-b from-primary/5 to-transparent',
        isAnswered && isCorrect && 'border-green-500/50 bg-gradient-to-b from-green-500/10 to-green-500/5',
        isAnswered && !isCorrect && 'border-red-500/50 bg-gradient-to-b from-red-500/10 to-red-500/5'
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
              !isAnswered && 'bg-primary/10 text-primary',
              isAnswered && isCorrect && 'bg-green-500 text-white',
              isAnswered && !isCorrect && 'bg-red-500 text-white'
            )}
          >
            {!isAnswered ? (
              <HelpCircle className="h-5 w-5" />
            ) : isCorrect ? (
              <Check className="h-5 w-5 animate-in zoom-in duration-300" />
            ) : (
              <X className="h-5 w-5 animate-in zoom-in duration-300" />
            )}
          </div>
          <div className="flex-1 pt-1">
            <CardTitle className="text-lg font-semibold leading-snug">{question}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {validOptions.map((option, index) => {
            const isSelected = selectedOptionId === option.id
            const showAsCorrect = isAnswered && option.isCorrect
            const showAsIncorrect = isAnswered && isSelected && !option.isCorrect

            return (
              <button
                key={`${id}-${option.id}`}
                type="button"
                onClick={() => void handleSelect(option.id)}
                disabled={isAnswered || isSaving}
                className={cn(
                  'w-full text-left rounded-xl border-2 p-4 transition-all duration-200 flex items-center gap-3',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
                  !isAnswered && 'border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer',
                  showAsCorrect && 'border-green-500 bg-green-500/10 animate-in fade-in duration-300',
                  showAsIncorrect && 'border-red-500 bg-red-500/10 animate-in fade-in duration-300',
                  isAnswered && !showAsCorrect && !showAsIncorrect && 'border-muted bg-muted/30 opacity-60'
                )}
              >
                {/* Option letter/indicator */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200',
                    !isAnswered && 'bg-muted text-muted-foreground',
                    showAsCorrect && 'bg-green-500 text-white',
                    showAsIncorrect && 'bg-red-500 text-white',
                    isAnswered && !showAsCorrect && !showAsIncorrect && 'bg-muted/50 text-muted-foreground'
                  )}
                >
                  {showAsCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : showAsIncorrect ? (
                    <X className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + index) // A, B, C, D...
                  )}
                </div>

                <span className="flex-1">{option.text}</span>

                {/* Correct indicator for other options */}
                {isAnswered && option.isCorrect && !isSelected && (
                  <span className="text-xs text-green-600 font-medium">{t`Correct answer`}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Feedback section */}
        {isAnswered && (
          <div
            className={cn(
              'rounded-xl p-4 animate-in slide-in-from-bottom-2 fade-in duration-500',
              isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  isCorrect ? 'bg-green-500/20' : 'bg-amber-500/20'
                )}
              >
                {isCorrect ? (
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p
                  className={cn(
                    'font-semibold',
                    isCorrect ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
                  )}
                >
                  {isCorrect ? t`Excellent work!` : t`Not quite right`}
                </p>
                <p
                  className={cn(
                    'text-sm',
                    isCorrect ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {explanation}
                </p>
              </div>
            </div>

            {!isCorrect && (
              <div className="mt-4 pt-3 border-t border-amber-500/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t`Try again`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
