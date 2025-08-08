import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entity-analytics')({
  beforeLoad: () => {
    // No prefetch for now. Could prefetch defaults in future.
  },
})


