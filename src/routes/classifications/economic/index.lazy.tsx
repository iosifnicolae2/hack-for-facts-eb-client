import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassificationExplorer } from '@/components/classification-explorer/ClassificationExplorer'

export const Route = createLazyFileRoute('/classifications/economic/')({
  component: EconomicClassificationsPage,
})

function EconomicClassificationsPage() {
  return <ClassificationExplorer type="economic" />
}
