import { createFileRoute } from '@tanstack/react-router'
import { LessonPlayer } from '@/features/learning/components/player/LessonPlayer'

export const Route = createFileRoute('/$lang/learning/$pathId/$moduleId/$lessonId')({
  component: LessonRouteComponent,
})

function LessonRouteComponent() {
  const { lang, pathId, moduleId, lessonId } = Route.useParams()
  return <LessonPlayer locale={lang as 'ro' | 'en'} pathId={pathId} moduleId={moduleId} lessonId={lessonId} />
}
