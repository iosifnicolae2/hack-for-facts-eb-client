import { useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'
import { t } from '@lingui/core/macro'
import {
  Compass,
  ExternalLink,
  HelpCircle,
  Check,
  X,
  RotateCcw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ExpandableHint } from './ExpandableHint'

type ExplorerStep = {
  readonly number: number
  readonly instruction: string
  readonly link?: string
  readonly hint?: string
}

type ChallengeQuestion = {
  readonly question: string
  readonly hint: string
  readonly correctAnswer: string
}

type HandsOnExplorerProps = {
  readonly title: string
  readonly steps: readonly ExplorerStep[]
  readonly challenge?: ChallengeQuestion
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.15,
    },
  },
}

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

const challengeVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.6, duration: 0.5 },
  },
}

const feedbackVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

function StepItem({ step }: { step: ExplorerStep }) {
  return (
    <motion.div
      variants={stepVariants}
      className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800"
    >
      {/* Step number badge */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white font-black text-lg shadow-lg shadow-indigo-500/20">
        {step.number}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {step.instruction}
        </p>
        {step.hint && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{step.hint}</p>
        )}
        {step.link && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={() => window.open(step.link, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="w-4 h-4" />
            {t`Open`}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

function ChallengeSection({
  challenge,
  answer,
  setAnswer,
  isChecked,
  isCorrect,
  onCheck,
  onReset,
}: {
  challenge: ChallengeQuestion
  answer: string
  setAnswer: (value: string) => void
  isChecked: boolean
  isCorrect: boolean
  onCheck: () => void
  onReset: () => void
}) {
  return (
    <motion.div
      variants={challengeVariants}
      className="mt-8 p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 shrink-0">
          <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-1">
            {t`Challenge Question`}
          </div>
          <p className="font-bold text-zinc-900 dark:text-zinc-100">
            {challenge.question}
          </p>
        </div>
      </div>

      {/* Input and button */}
      {!isChecked ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t`Type your answer...`}
              className="flex-1 h-12 rounded-xl border-zinc-200 dark:border-zinc-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && answer.trim()) {
                  onCheck()
                }
              }}
            />
            <Button
              onClick={onCheck}
              disabled={!answer.trim()}
              className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              <Check className="w-5 h-5" />
            </Button>
          </div>

          <ExpandableHint trigger={challenge.hint}>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {challenge.hint}
            </p>
          </ExpandableHint>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="feedback"
            variants={feedbackVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'p-4 rounded-xl flex items-center justify-between',
              isCorrect
                ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
            )}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <>
                  <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {t`Correct!`}
                  </span>
                </>
              ) : (
                <>
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <span className="font-bold text-red-700 dark:text-red-300 block">
                      {t`Not quite!`}
                    </span>
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {t`The answer is:`} {challenge.correctAnswer}
                    </span>
                  </div>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              {t`Try again`}
            </Button>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}

export function HandsOnExplorer({
  title,
  steps,
  challenge,
}: Readonly<HandsOnExplorerProps>) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  // Simple state for challenge interaction
  const [answer, setAnswer] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleCheck = useCallback(() => {
    if (!challenge) return
    const normalized = answer.trim().toLowerCase()
    const correct = challenge.correctAnswer.toLowerCase()
    // Check for exact match or if the correct answer includes the user's answer
    setIsCorrect(normalized === correct || correct.includes(normalized))
    setIsChecked(true)
  }, [answer, challenge])

  const handleReset = useCallback(() => {
    setAnswer('')
    setIsChecked(false)
    setIsCorrect(false)
  }, [])

  return (
    <div ref={ref} className="w-full max-w-2xl mx-auto py-8">
      <Card className="rounded-[3rem] bg-white dark:bg-zinc-950 border-none shadow-lg overflow-hidden relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="p-6 md:p-10"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
              <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1">
                {t`Hands-On Activity`}
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                {title}
              </h3>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step) => (
              <StepItem key={step.number} step={step} />
            ))}
          </div>

          {/* Challenge Section */}
          {challenge && (
            <ChallengeSection
              challenge={challenge}
              answer={answer}
              setAnswer={setAnswer}
              isChecked={isChecked}
              isCorrect={isCorrect}
              onCheck={handleCheck}
              onReset={handleReset}
            />
          )}
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      </Card>
    </div>
  )
}
