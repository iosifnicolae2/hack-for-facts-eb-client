import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/classifications/economic/$code')({
  staticData: {
    title: 'Economic Classification',
  },
})
