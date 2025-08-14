import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/cookies')({
  staticData: {
    title: 'Cookie Settings',
  },
})


