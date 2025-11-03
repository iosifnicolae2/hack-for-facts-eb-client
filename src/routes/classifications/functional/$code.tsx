import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/classifications/functional/$code')({
  staticData: {
    title: 'Functional Classification',
  },
})
