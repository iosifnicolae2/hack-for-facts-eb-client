import { useMemo, useState } from 'react'
import { t } from '@lingui/core/macro'
import { Check, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useLearningProgress } from '../../hooks/use-learning-progress'
import { scoreSingleChoice } from '../../utils/scoring'

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
  readonly pathId: string
  readonly moduleId: string
}

export function Quiz({ id, question, options, explanation, pathId, moduleId }: QuizProps) {
  const { saveModuleProgress } = useLearningProgress()

  // Guard against missing or invalid options - must be defined early
  const validOptions = useMemo(() => (Array.isArray(options) ? options : []), [options])

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const score = useMemo(() => scoreSingleChoice(validOptions, selectedOptionId), [validOptions, selectedOptionId])
  const isAnswered = selectedOptionId !== null
  const isCorrect = score >= 70

  const handleSelect = async (optionId: string) => {
    if (isAnswered || isSaving) return

    setSelectedOptionId(optionId)

    const nextScore = scoreSingleChoice(validOptions, optionId)
    const status = nextScore >= 70 ? 'passed' : 'in_progress'

    setIsSaving(true)
    try {
      await saveModuleProgress({
        pathId,
        moduleId,
        status,
        score: nextScore,
        contentVersion: 'poc',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = () => {
    setSelectedOptionId(null)
  }

  if (validOptions.length === 0) {
    return (
      <Card className="p-6 my-6 border-border bg-destructive/10">
        <p className="text-destructive">{t`Quiz error: No options provided`}</p>
        <pre className="text-xs mt-2">{JSON.stringify({ id, options }, null, 2)}</pre>
      </Card>
    )
  }

  return (
    <Card className="p-6 my-6 border-border bg-muted/50">
      <h3 className="font-semibold text-lg mb-4">{question}</h3>

      <div className="space-y-3">
        {validOptions.map((option) => {
          const isSelected = selectedOptionId === option.id

          return (
            <button
              key={`${id}-${option.id}`}
              type="button"
              onClick={() => void handleSelect(option.id)}
              disabled={isAnswered || isSaving}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between bg-background text-foreground',
                !isAnswered && 'border-border hover:bg-muted cursor-pointer',
                isAnswered && option.isCorrect && 'border-green-500 bg-green-100 dark:bg-green-900/30',
                isAnswered && isSelected && !option.isCorrect && 'border-red-500 bg-red-100 dark:bg-red-900/30',
                isAnswered && !option.isCorrect && !isSelected && 'opacity-50'
              )}
            >
              <span>{option.text}</span>
              {isAnswered && option.isCorrect ? <Check className="h-5 w-5 text-green-600" /> : null}
              {isAnswered && isSelected && !option.isCorrect ? <X className="h-5 w-5 text-red-600" /> : null}
            </button>
          )
        })}
      </div>

      {isAnswered ? (
        <div className="mt-6 space-y-4">
          <div
            className={cn(
              'p-4 rounded-lg text-sm',
              isCorrect
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            )}
          >
            <p className="font-semibold mb-1">{isCorrect ? t`Correct!` : t`Not quite right.`}</p>
            <p>{explanation}</p>
          </div>

          <Button variant="outline" type="button" onClick={handleRetry} disabled={isSaving}>
            <RotateCcw className="h-4 w-4 mr-2" /> {t`Try again`}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
