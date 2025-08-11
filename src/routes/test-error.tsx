import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-error')({
  component: RouteComponent,
})

function RouteComponent() {
  throw new Error('Test error')
}
