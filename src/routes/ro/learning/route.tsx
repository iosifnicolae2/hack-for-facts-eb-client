import { createFileRoute } from '@tanstack/react-router'
import { LearningLayout } from '@/components/learning/LearningLayout'

export const Route = createFileRoute('/ro/learning')({
  component: LearningLayout,
})
