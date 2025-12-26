import { createLazyFileRoute } from '@tanstack/react-router'
import { LearningLayout } from '@/features/learning/components/layout/LearningLayout'

export const Route = createLazyFileRoute('/$lang/learning')({
  component: LearningLayout,
})
