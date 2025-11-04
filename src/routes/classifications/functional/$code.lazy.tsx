import { createLazyFileRoute } from '@tanstack/react-router'
import { ClassificationExplorer } from '@/components/classification-explorer/ClassificationExplorer'

export const Route = createLazyFileRoute('/classifications/functional/$code')({
  component: FunctionalClassificationPage,
})

function FunctionalClassificationPage() {
  const { code } = Route.useParams()
  const normalizedCode = code ? code.replace(/(\.00)+$/, '') : undefined
  return <ClassificationExplorer type="functional" selectedCode={normalizedCode} />
}
