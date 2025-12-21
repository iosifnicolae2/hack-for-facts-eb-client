import { createFileRoute } from '@tanstack/react-router'
import { LearningLayout } from '@/features/learning/components/layout/LearningLayout'

export const Route = createFileRoute('/$lang/learning')({
  component: LearningLayout,
})
