import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassificationExplorer } from '@/components/classification-explorer/ClassificationExplorer'

export const Route = createLazyFileRoute('/classifications/functional/$code')({
  component: FunctionalClassificationPage,
})

function FunctionalClassificationPage() {
  const { code } = Route.useParams()

  return <ClassificationExplorer type="functional" selectedCode={code} />
}
