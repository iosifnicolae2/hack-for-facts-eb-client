import { useState } from 'react'
import { t } from '@lingui/core/macro'
import { CheckCircle2, Loader2, PartyPopper, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useLessonCompletion } from '../../hooks/use-learning-interactions'

export type MarkCompleteProps = {
  readonly label?: string
  readonly contentId: string
}

export function MarkComplete({ label, contentId }: MarkCompleteProps) {
  const { isCompleted, markComplete } = useLessonCompletion({ contentId, contentVersion: 'v1' })
  const [isMarking, setIsMarking] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const handleMarkComplete = async () => {
    if (isMarking || isCompleted) return

    setIsMarking(true)
    try {
      await markComplete()
      setJustCompleted(true)
    } finally {
      setIsMarking(false)
    }
  }

  // Show celebration state
  if (justCompleted || isCompleted) {
    return (
      <Card
        className={cn(
          'my-8 border-green-500/50 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent overflow-hidden',
          justCompleted && 'animate-in fade-in slide-in-from-bottom-2 duration-500'
        )}
      >
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
              {justCompleted ? (
                <PartyPopper className="h-6 w-6 animate-in zoom-in duration-300" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-700 dark:text-green-300">
                {justCompleted ? t`Lesson completed!` : t`You've completed this lesson`}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                {justCompleted
                  ? t`Great job! Your progress has been saved.`
                  : t`Continue to the next lesson to keep learning.`}
              </p>
            </div>
            {justCompleted && (
              <div className="hidden sm:flex items-center gap-1 text-green-500">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <Sparkles className="h-4 w-4 animate-pulse delay-75" />
                <Sparkles className="h-3 w-3 animate-pulse delay-150" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="my-8 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{t`Ready to move on?`}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t`Mark this lesson as complete to track your progress.`}
            </p>
          </div>
          <Button
            onClick={handleMarkComplete}
            disabled={isMarking}
            size="lg"
            className="gap-2 shadow-md w-full sm:w-auto"
          >
            {isMarking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t`Saving...`}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {label ?? t`Mark as complete`}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
