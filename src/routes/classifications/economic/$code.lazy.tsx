import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassificationExplorer } from '@/components/classification-explorer/ClassificationExplorer'

export const Route = createLazyFileRoute('/classifications/economic/$code')({
  component: EconomicClassificationPage,
})

function EconomicClassificationPage() {
  const { code } = Route.useParams()
  const normalizedCode = code ? code.replace(/(\.00)+$/, '') : undefined
  return <ClassificationExplorer type="economic" selectedCode={normalizedCode} />
}
