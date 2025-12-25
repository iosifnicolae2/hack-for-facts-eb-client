import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '@lingui/core/macro'
import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useLessonCompletion } from '../../hooks/use-learning-interactions'
import { useLessonChallenges } from './lesson-challenges-context'

export type MarkCompleteProps = {
  readonly label?: string
  readonly contentId: string
}

export function MarkComplete({ label, contentId }: MarkCompleteProps) {
  const { status, markComplete } = useLessonCompletion({ contentId, contentVersion: 'v1' })
  const { hasChallenges, allChallengesCompleted } = useLessonChallenges()
  const [isMarking, setIsMarking] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const autoCompletionTriggeredRef = useRef(false)

  const isPersistedComplete = status === 'completed'
  const isAutoComplete = hasChallenges && allChallengesCompleted
  const isCompleted = isPersistedComplete || isAutoComplete

  const handleMarkComplete = useCallback(async () => {
    if (isMarking || isPersistedComplete) return

    setIsMarking(true)
    try {
      await markComplete()
      setJustCompleted(true)
    } finally {
      setIsMarking(false)
    }
  }, [isMarking, isPersistedComplete, markComplete])

  useEffect(() => {
    if (!isAutoComplete || isPersistedComplete || isMarking || autoCompletionTriggeredRef.current) return
    autoCompletionTriggeredRef.current = true
    void handleMarkComplete()
  }, [handleMarkComplete, isAutoComplete, isMarking, isPersistedComplete])

  // Show celebration state
  if (justCompleted || isCompleted) {
    return (
      <Card
        className={cn(
          'my-8 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-950/20 border-none shadow-sm overflow-hidden relative',
          justCompleted && 'animate-in fade-in slide-in-from-bottom-4 duration-700'
        )}
      >
        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex flex-1 items-center gap-6 md:gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                {justCompleted ? (
                  <PartyPopper className="h-8 w-8 animate-in zoom-in duration-500" />
                ) : (
                  <CheckCircle2 className="h-8 w-8" />
                )}
              </div>
              <div className="space-y-1 text-left">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/70 dark:text-emerald-400/70">{t`Progress Saved`}</div>
                <h3 className="text-2xl md:text-3xl mt-4 mb-2 font-black text-emerald-900 dark:text-emerald-100 tracking-tight leading-tight">
                  {justCompleted ? t`Lesson Completed!` : t`Step Successfully Finished`}
                </h3>
                <p className="text-base md:text-lg mt-2 font-bold text-emerald-800/60 dark:text-emerald-200/60 leading-relaxed max-w-2xl">
                  {justCompleted
                    ? t`Mastering the budget one step at a time. Your progress is recorded.`
                    : t`Continue to the next chapter to complete the module.`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </Card>
    )
  }

  return (
    <Card className="my-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border-none shadow-sm overflow-hidden relative">
      <CardContent className="p-8 md:p-12 relative z-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-1 items-center gap-6 md:gap-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{t`Mission End`}</div>
              <h3 className="text-2xl md:text-3xl mt-4 mb-2 font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">{t`Ready to level up?`}</h3>
              <p className="text-base md:text-lg mt-2 font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                {t`Seal your progress and move closer to becoming a budget expert.`}
              </p>


              <Button
                onClick={handleMarkComplete}
                disabled={isMarking}
                className="self-start rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-black h-14 px-10 text-base shadow-2xl shadow-zinc-200 dark:shadow-none transition-all hover:scale-[1.05] active:scale-[0.95] w-full lg:w-auto"
              >
                {isMarking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    {t`Recording...`}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-3" />
                    {label ?? t`Complete this lesson`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-400/5 dark:bg-zinc-400/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 dark:bg-emerald-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
    </Card>
  )
}
