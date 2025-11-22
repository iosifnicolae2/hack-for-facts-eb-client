import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { usePersistedState } from '@/lib/hooks/usePersistedState'

// --- Quiz Component ---

type QuizProps = {
  readonly id: string
  readonly question: string
  readonly options: readonly { id: string; text: string; isCorrect: boolean }[]
  readonly explanation: string
}

export function Quiz({ id, question, options, explanation }: QuizProps) {
  const [selected, setSelected] = usePersistedState<string | null>(`quiz-${id}`, null)

  const isAnswered = selected !== null
  const isCorrect = selected
    ? options.find((o) => o.id === selected)?.isCorrect
    : false

  const handleSelect = (optionId: string) => {
    if (isAnswered) return
    setSelected(optionId)
  }

  const handleReset = () => {
    setSelected(null)
  }

  return (
    <Card className="p-6 my-6 border-border bg-muted/50">
      <h3 className="font-semibold text-lg mb-4">{question}</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={isAnswered}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between bg-background text-foreground",
              !isAnswered && "border-border hover:bg-muted cursor-pointer",
              isAnswered && option.isCorrect && "border-green-500 bg-green-100 dark:bg-green-900/30",
              isAnswered && selected === option.id && !option.isCorrect && "border-red-500 bg-red-100 dark:bg-red-900/30",
              isAnswered && !option.isCorrect && selected !== option.id && "opacity-50"
            )}
          >
            <span>{option.text}</span>
            {isAnswered && option.isCorrect && <Check className="h-5 w-5 text-green-600" />}
            {isAnswered && selected === option.id && !option.isCorrect && <X className="h-5 w-5 text-red-600" />}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="mt-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-lg text-sm",
              isCorrect ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            )}
          >
            <p className="font-semibold mb-1">
              {isCorrect ? "Correct!" : "Not quite right."}
            </p>
            <p>{explanation}</p>
          </motion.div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </div>
      )}
    </Card>
  )
}

// --- Flashcard Component ---

interface FlashcardProps {
  term: string
  definition: string
}

export function Flashcard({ term, definition }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <button
      type="button"
      className="w-full h-48 my-6 cursor-pointer text-left"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {/* Front */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          <Card className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-muted/50 border-2 hover:border-primary/50 transition-colors">
            <span className="text-xl font-bold text-center">{term}</span>
            <span className="text-xs text-muted-foreground mt-4 absolute bottom-4">Click to flip</span>
          </Card>
        </motion.div>

        {/* Back */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ rotateY: isFlipped ? 0 : -180 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          <Card className="w-full h-full flex items-center justify-center p-6 bg-primary text-primary-foreground">
            <span className="text-center font-medium leading-relaxed">{definition}</span>
          </Card>
        </motion.div>
      </div>
    </button>
  )
}

// --- Concept Card ---

interface ConceptCardProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
}

export function ConceptCard({ title, children, icon }: ConceptCardProps) {
  return (
    <Card className="overflow-hidden my-6">
      <div className="bg-muted/30 p-4 border-b flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </Card>
  )
}
