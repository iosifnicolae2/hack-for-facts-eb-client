import { createFileRoute } from '@tanstack/react-router'
import { t } from '@lingui/macro'

export const Route = createFileRoute('/test-error')({
  component: RouteComponent,
})

function RouteComponent() {
  throw new Error(t`Test error`)
}
