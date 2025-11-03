import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassificationExplorer } from '@/components/classification-explorer/ClassificationExplorer'

export const Route = createLazyFileRoute('/classifications/functional/')({
  component: FunctionalClassificationsPage,
})

function FunctionalClassificationsPage() {
  return <ClassificationExplorer type="functional" />
}
